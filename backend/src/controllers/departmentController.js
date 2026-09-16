const Department = require('../models/Department');
const User = require('../models/User');
const { departmentSchema } = require('../utils/validation');

const getDepartments = async (req, res) => {
    try {
        const departments = await Department.find().sort({ createdAt: -1 });
        
        const formatted = departments.map(d => ({ ...d.toJSON(), id: d._id }));
        res.status(200).json({ departments: formatted });
    } catch (error) {
        console.error('Error fetching departments:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const createDepartment = async (req, res) => {
    try {
        const { error, value } = departmentSchema.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        const newDept = await Department.create({
            name: value.name,
            description: value.description || ''
        });
        
        res.status(201).json({ message: 'Department created', department: { ...newDept.toJSON(), id: newDept._id } });
    } catch (error) {
        console.error('Error creating department:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const updateDepartment = async (req, res) => {
    try {
        const { id } = req.params;
        const { error, value } = departmentSchema.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        const dept = await Department.findById(id);
        if (!dept) return res.status(404).json({ error: 'Department not found' });

        const updatedDept = await Department.findByIdAndUpdate(id, {
            name: value.name,
            description: value.description || ''
        }, { new: true });

        res.status(200).json({ message: 'Department updated', department: { ...updatedDept.toJSON(), id: updatedDept._id } });
    } catch (error) {
        console.error('Error updating department:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const deleteDepartment = async (req, res) => {
    try {
        const { id } = req.params;

        const dept = await Department.findById(id);
        if (!dept) return res.status(404).json({ error: 'Department not found' });

        const doctorCount = await User.countDocuments({ departmentId: id, role: 'doctor' });

        if (doctorCount > 0) {
            return res.status(400).json({ error: 'Cannot delete department with assigned doctors.' });
        }

        await Department.findByIdAndDelete(id);
        res.status(200).json({ message: 'Department deleted' });
    } catch (error) {
        console.error('Error deleting department:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { getDepartments, createDepartment, updateDepartment, deleteDepartment };
