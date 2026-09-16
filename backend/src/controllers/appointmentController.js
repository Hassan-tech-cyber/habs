const prisma = require('../config/prisma');
const { appointmentBookingSchema, paymentSchema } = require('../utils/validation');
const { sendAppointmentConfirmation } = require('../utils/mailer');

const bookAppointment = async (req, res) => {
    try {
        const { error, value } = appointmentBookingSchema.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        const { doctorId, date, slotTime } = value;
        const patientId = req.user.uid;

        // Check if the slot is already booked (prevent double booking)
        const existingAppt = await prisma.appointment.findFirst({
            where: {
                doctorId,
                date,
                slotTime,
                status: {
                    in: ['pending_payment', 'confirmed']
                }
            }
        });

        if (existingAppt) {
            return res.status(400).json({ error: 'This slot is already booked.' });
        }

        // Create appointment
        const newAppt = await prisma.appointment.create({
            data: {
                patientId,
                doctorId,
                date,
                slotTime,
                status: 'pending_payment'
            }
        });
        
        res.status(201).json({ message: 'Appointment booked (pending payment)', appointment: newAppt });
    } catch (error) {
        console.error('Error booking appointment:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const payForAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const { error, value } = paymentSchema.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        const appt = await prisma.appointment.findUnique({ where: { id } });

        if (!appt) {
            return res.status(404).json({ error: 'Appointment not found' });
        }

        if (appt.patientId !== req.user.uid) {
            return res.status(403).json({ error: 'Forbidden: You do not own this appointment' });
        }

        if (appt.status !== 'pending_payment') {
            return res.status(400).json({ error: 'Appointment is not pending payment' });
        }

        const updates = {
            status: 'confirmed',
            paymentMethod: value.paymentMethod,
            paidAt: new Date()
        };
        
        if (value.reference) {
            updates.paymentReference = value.reference;
        }

        const updatedAppt = await prisma.appointment.update({
            where: { id },
            data: updates,
            include: {
                patient: true,
                doctor: true
            }
        });

        // Fetch patient and doctor emails from the included relations
        try {
            await sendAppointmentConfirmation(updatedAppt.patient, updatedAppt.doctor, updatedAppt);
        } catch (emailErr) {
            console.error('Email failed to send, but appointment confirmed:', emailErr);
        }
        
        // Remove sensitive info before returning
        const safeAppt = { ...updatedAppt };
        delete safeAppt.patient.passwordHash;
        delete safeAppt.doctor.passwordHash;

        res.status(200).json({ message: 'Payment successful, appointment confirmed', appointment: safeAppt });
    } catch (error) {
        console.error('Error processing payment:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getAppointments = async (req, res) => {
    try {
        const role = req.user.role;
        const uid = req.user.uid;

        const whereClause = {};

        if (role === 'patient') {
            whereClause.patientId = uid;
        } else if (role === 'doctor') {
            whereClause.doctorId = uid;
        } else {
            if (role !== 'admin') {
                return res.status(403).json({ error: 'Forbidden' });
            }
        }

        // Use Prisma's include to automatically fetch patient details if doctor or admin
        const includeConfig = (role === 'doctor' || role === 'admin') ? { patient: true } : {};

        const appointments = await prisma.appointment.findMany({
            where: whereClause,
            include: includeConfig,
            orderBy: [
                { date: 'asc' },
                { slotTime: 'asc' }
            ]
        });

        // Format for frontend if patient data is included
        const enriched = appointments.map(appt => {
            if (appt.patient) {
                const pd = appt.patient;
                const formatted = {
                    ...appt,
                    patientName: pd.name || 'Unknown',
                    patientPhone: pd.phone || 'Unknown',
                    emergencyContactName: pd.emergencyContactName || 'N/A',
                    emergencyContactPhone: pd.emergencyContactPhone || 'N/A',
                    emergencyContactRelation: pd.emergencyContactRelation || 'N/A',
                    allergies: pd.allergies || 'None',
                    chronicConditions: pd.chronicConditions || 'None',
                    currentMedications: pd.currentMedications || 'None'
                };
                delete formatted.patient; // Keep flat structure for existing frontend
                return formatted;
            }
            return appt;
        });

        res.status(200).json({ appointments: enriched });
    } catch (error) {
        console.error('Error fetching appointments:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const cancelAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const appt = await prisma.appointment.findUnique({ where: { id } });

        if (!appt) {
            return res.status(404).json({ error: 'Appointment not found' });
        }
        
        // Ensure only the patient, doctor, or an admin can cancel it
        if (appt.patientId !== req.user.uid && appt.doctorId !== req.user.uid && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Forbidden: You do not have permission to cancel this appointment' });
        }

        if (appt.status === 'cancelled' || appt.status === 'completed') {
            return res.status(400).json({ error: `Appointment is already ${appt.status}` });
        }

        // Just delete if it's pending payment, otherwise mark as cancelled to keep history
        if (appt.status === 'pending_payment') {
            await prisma.appointment.delete({ where: { id } });
            res.status(200).json({ message: 'Appointment payment cancelled and slot freed.' });
        } else {
            await prisma.appointment.update({ 
                where: { id },
                data: { status: 'cancelled' } 
            });
            res.status(200).json({ message: 'Appointment cancelled successfully.' });
        }
    } catch (error) {
        console.error('Error cancelling appointment:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { bookAppointment, payForAppointment, getAppointments, cancelAppointment };
