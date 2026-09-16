const User = require('../models/User');
const Appointment = require('../models/Appointment');
const { doctorUpdateSchema, workingHoursSchema } = require('../utils/validation');

const getDoctors = async (req, res) => {
    try {
        const { departmentId } = req.query;
        
        const whereClause = { role: 'doctor' };
        if (departmentId) {
            whereClause.departmentId = departmentId;
        }

        
        const isAdmin = req.user && (req.user.role === 'admin' || req.user.role === 'system_admin');
        if (!isAdmin) {
            whereClause.isActive = true;
        }

        const doctors = await User.find(whereClause).select('-passwordHash');
        
        
        const mappedDoctors = doctors.map(doc => ({ ...doc.toJSON(), uid: doc._id }));

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

        const doctor = await User.findById(uid);

        if (!doctor || doctor.role !== 'doctor') {
            return res.status(404).json({ error: 'Doctor not found' });
        }

        const updateData = { ...value };
        if (updateData.password) {
            const bcrypt = require('bcrypt');
            updateData.passwordHash = await bcrypt.hash(updateData.password, 10);
            delete updateData.password;
        }

        const updatedDoctor = await User.findByIdAndUpdate(uid, updateData, { new: true });

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

        await User.findByIdAndUpdate(req.user.uid, {
            workingHours: value.workingHours,
            slotDurationMinutes: value.slotDurationMinutes
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
        
        
        if (current > endTime) break;
    }
    return slots;
};

const getDoctorSlots = async (req, res) => {
    try {
        const { uid } = req.params;
        const { date } = req.query; 
        if (!date) return res.status(400).json({ error: 'date query parameter is required' });

        const doctor = await User.findById(uid);
        
        if (!doctor || doctor.role !== 'doctor') {
            return res.status(404).json({ error: 'Doctor not found' });
        }

        if (!doctor.isActive) {
            return res.status(200).json({ slots: [] }); 
        }

        
        const d = new Date(date);
        const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
        const dayName = days[d.getDay()];

        const dayConfig = doctor.workingHours && doctor.workingHours[dayName];
        if (!dayConfig || !dayConfig.active) {
            return res.status(200).json({ slots: [] }); 
        }

        
        const allSlots = generateSlots(dayConfig.start, dayConfig.end, doctor.slotDurationMinutes || 30);

        const appointments = await Appointment.find({
            doctorId: uid,
            date: date,
            status: {
                $in: ['pending_payment', 'confirmed']
            }
        }).select('slotTime');

        const bookedSlots = appointments.map(appt => appt.slotTime);

        
        const availableSlots = allSlots.filter(s => !bookedSlots.includes(s));

        res.status(200).json({ slots: availableSlots });
    } catch (error) {
        console.error('Error fetching slots:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { getDoctors, updateDoctorByAdmin, updateWorkingHours, getDoctorSlots };
