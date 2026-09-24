const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Department = require('../models/Department');

const getAnalytics = async (req, res) => {
    try {
        const totalDoctors = await User.countDocuments({ role: 'doctor' });
        const totalPatients = await User.countDocuments({ role: 'patient' });
        const totalAppointments = await Appointment.countDocuments();
        
        const appointmentsByStatus = await Appointment.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        const appointmentsByDepartment = await Appointment.aggregate([
            {
                $lookup: {
                    from: 'departments',
                    localField: 'departmentId',
                    foreignField: '_id',
                    as: 'department'
                }
            },
            { $unwind: '$department' },
            { $group: { _id: '$department.name', count: { $sum: 1 } } }
        ]);

        const recentAppointments = await Appointment.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .populate('patientId', 'name')
            .populate('doctorId', 'name')
            .populate('departmentId', 'name');

        res.status(200).json({
            metrics: {
                totalDoctors,
                totalPatients,
                totalAppointments
            },
            appointmentsByStatus,
            appointmentsByDepartment,
            recentAppointments
        });
    } catch (error) {
        console.error('Analytics error:', error);
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
};

module.exports = { getAnalytics };
