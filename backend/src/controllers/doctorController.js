const prisma = require('../config/prisma');
const { doctorUpdateSchema, workingHoursSchema } = require('../utils/validation');

const getDoctors = async (req, res) => {
    try {
        const { departmentId } = req.query;
        
        const whereClause = { role: 'doctor' };
        if (departmentId) {
            whereClause.departmentId = departmentId;
        }

        // Filter inactive doctors for patients/public
        const isAdmin = req.user && req.user.role === 'admin';
        if (!isAdmin) {
            whereClause.isActive = true;
        }

        const doctors = await prisma.user.findMany({
            where: whereClause,
            select: {
                id: true,
                role: true,
                email: true,
                name: true,
                phone: true,
                departmentId: true,
                specialty: true,
                consultationFee: true,
                isActive: true,
                workingHours: true,
                slotDurationMinutes: true,
                createdAt: true,
                updatedAt: true
            }
        });
        
        // Map id to uid to maintain frontend compatibility
        const mappedDoctors = doctors.map(doc => ({ ...doc, uid: doc.id }));

        res.status(200).json({ doctors: mappedDoctors });
    } catch (error) {
        console.error('Error fetching doctors:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const updateDoctorByAdmin = async (req, res) => {
    try {
        const { uid } = req.params;
        const { error, value } = doctorUpdateSchema.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        const doctor = await prisma.user.findUnique({ where: { id: uid } });

        if (!doctor || doctor.role !== 'doctor') {
            return res.status(404).json({ error: 'Doctor not found' });
        }

        const updatedDoctor = await prisma.user.update({
            where: { id: uid },
            data: value
        });

        res.status(200).json({ message: 'Doctor updated successfully', updates: value });
    } catch (error) {
        console.error('Error updating doctor:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const updateWorkingHours = async (req, res) => {
    try {
        const { error, value } = workingHoursSchema.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        await prisma.user.update({
            where: { id: req.user.uid },
            data: {
                workingHours: value.workingHours,
                slotDurationMinutes: value.slotDurationMinutes
            }
        });

        res.status(200).json({ message: 'Working hours updated successfully' });
    } catch (error) {
        console.error('Error updating working hours:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const generateSlots = (start, end, durationMinutes) => {
    const slots = [];
    let current = new Date(`1970-01-01T${start}:00Z`);
    const endTime = new Date(`1970-01-01T${end}:00Z`);
    
    while (current < endTime) {
        const h = String(current.getUTCHours()).padStart(2, '0');
        const m = String(current.getUTCMinutes()).padStart(2, '0');
        slots.push(`${h}:${m}`);
        current = new Date(current.getTime() + durationMinutes * 60000);
        
        // Ensure the slot doesn't exceed the end time
        if (current > endTime) break;
    }
    return slots;
};

const getDoctorSlots = async (req, res) => {
    try {
        const { uid } = req.params;
        const { date } = req.query; // YYYY-MM-DD
        if (!date) return res.status(400).json({ error: 'date query parameter is required' });

        const doctor = await prisma.user.findUnique({ where: { id: uid } });
        
        if (!doctor || doctor.role !== 'doctor') {
            return res.status(404).json({ error: 'Doctor not found' });
        }

        if (!doctor.isActive) {
            return res.status(200).json({ slots: [] }); // Deactivated doctors have no slots
        }

        // Get day of week: mon, tue, wed...
        const d = new Date(date);
        const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
        const dayName = days[d.getDay()];

        const dayConfig = doctor.workingHours && doctor.workingHours[dayName];
        if (!dayConfig || !dayConfig.active) {
            return res.status(200).json({ slots: [] }); // Doctor not working this day
        }

        // Generate all possible slots
        const allSlots = generateSlots(dayConfig.start, dayConfig.end, doctor.slotDurationMinutes || 30);

        // Fetch existing appointments for this doctor on this date
        const appointments = await prisma.appointment.findMany({
            where: {
                doctorId: uid,
                date: date,
                status: {
                    in: ['pending_payment', 'confirmed']
                }
            },
            select: { slotTime: true }
        });

        const bookedSlots = appointments.map(appt => appt.slotTime);

        // Filter out booked slots
        const availableSlots = allSlots.filter(s => !bookedSlots.includes(s));

        res.status(200).json({ slots: availableSlots });
    } catch (error) {
        console.error('Error fetching slots:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { getDoctors, updateDoctorByAdmin, updateWorkingHours, getDoctorSlots };
