const Appointment = require('../models/Appointment');
const User = require('../models/User');
const { appointmentBookingSchema, paymentSchema } = require('../utils/validation');
const { sendAppointmentConfirmation, sendAppointmentCancellation } = require('../utils/mailer');

const bookAppointment = async (req, res) => {
    try {
        const { error, value } = appointmentBookingSchema.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        const { doctorId, date, slotTime } = value;
        const patientId = req.user.uid;

        
        const existingAppt = await Appointment.findOne({
            doctorId,
            date,
            slotTime,
            status: { $in: ['pending_payment', 'confirmed'] }
        });

        if (existingAppt) {
            return res.status(400).json({ error: 'This slot is already booked.' });
        }

        
        const doctor = await User.findById(doctorId);
        if (!doctor || doctor.role !== 'doctor') {
            return res.status(404).json({ error: 'Doctor not found' });
        }

        
        const newAppt = await Appointment.create({
            patientId,
            doctorId,
            departmentId: doctor.departmentId,
            date,
            slotTime,
            status: 'pending_payment'
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

        const appt = await Appointment.findById(id).populate('patientId').populate('doctorId');

        if (!appt) {
            return res.status(404).json({ error: 'Appointment not found' });
        }

        if (appt.patientId._id.toString() !== req.user.uid) {
            return res.status(403).json({ error: 'Forbidden: You do not own this appointment' });
        }

        if (appt.status !== 'pending_payment') {
            return res.status(400).json({ error: 'Appointment is not pending payment' });
        }

        appt.status = 'confirmed';
        appt.paymentMethod = value.paymentMethod;
        appt.paidAt = new Date();
        
        if (value.reference) {
            appt.paymentReference = value.reference;
        }

        await appt.save();

        
        // Send email asynchronously so it doesn't block the API response
        sendAppointmentConfirmation(appt.patientId, appt.doctorId, appt.date, appt.slotTime)
            .catch(emailErr => console.error('Email failed to send, but appointment confirmed:', emailErr));

        res.status(200).json({ message: 'Payment successful, appointment confirmed', appointment: appt });
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
            if (role !== 'admin' && role !== 'system_admin') {
                return res.status(403).json({ error: 'Forbidden' });
            }
        }

        let query = Appointment.find(whereClause).sort({ date: 1, slotTime: 1 });

        if (role === 'doctor' || role === 'admin' || role === 'system_admin') {
            query = query.populate('patientId');
        }

        const appointments = await query.exec();

        
        const enriched = appointments.map(apptDoc => {
            const appt = apptDoc.toJSON();
            appt.id = apptDoc._id; 

            if (appt.patientId && typeof appt.patientId === 'object') {
                const pd = appt.patientId;
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
                delete formatted.patientId; 
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
        const appt = await Appointment.findById(id).populate('patientId', 'name email').populate('doctorId', 'name email');

        if (!appt) {
            return res.status(404).json({ error: 'Appointment not found' });
        }
        
        
        if (appt.patientId._id.toString() !== req.user.uid && appt.doctorId._id.toString() !== req.user.uid && req.user.role !== 'admin' && req.user.role !== 'system_admin') {
            return res.status(403).json({ error: 'Forbidden: You do not have permission to cancel this appointment' });
        }

        if (appt.status === 'cancelled' || appt.status === 'completed') {
            return res.status(400).json({ error: `Appointment is already ${appt.status}` });
        }

        
        if (appt.status === 'pending_payment') {
            await Appointment.findByIdAndDelete(id);
            res.status(200).json({ message: 'Appointment payment cancelled and slot freed.' });
        } else {
            appt.status = 'cancelled';
            await appt.save();
            
            // Send email asynchronously
            sendAppointmentCancellation(appt.patientId, appt.doctorId, appt.date, appt.slotTime)
                .catch(emailErr => console.error('Failed to send cancellation email:', emailErr));

            res.status(200).json({ message: 'Appointment cancelled successfully.' });
        }
    } catch (error) {
        console.error('Error cancelling appointment:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { bookAppointment, payForAppointment, getAppointments, cancelAppointment };
