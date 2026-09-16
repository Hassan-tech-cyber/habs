const prisma = require('../config/prisma');
const { departmentSchema } = require('../utils/validation');

const getDepartments = async (req, res) => {
    try {
        const departments = await prisma.department.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json({ departments });
    } catch (error) {
        console.error('Error fetching departments:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const createDepartment = async (req, res) => {
    try {
        const { error, value } = departmentSchema.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        const newDept = await prisma.department.create({
            data: {
                name: value.name,
                description: value.description || ''
            }
        });
        
        res.status(201).json({ message: 'Department created', department: newDept });
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

        const dept = await prisma.department.findUnique({ where: { id } });
        if (!dept) return res.status(404).json({ error: 'Department not found' });

        const updatedDept = await prisma.department.update({
            where: { id },
            data: {
                name: value.name,
                description: value.description || ''
            }
        });

        res.status(200).json({ message: 'Department updated', department: updatedDept });
    } catch (error) {
        console.error('Error updating department:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const deleteDepartment = async (req, res) => {
    try {
        const { id } = req.params;

        const dept = await prisma.department.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { doctors: true }
                }
            }
        });

        if (!dept) return res.status(404).json({ error: 'Department not found' });

        if (dept._count.doctors > 0) {
            return res.status(400).json({ error: 'Cannot delete department with assigned doctors.' });
        }

        await prisma.department.delete({ where: { id } });
        res.status(200).json({ message: 'Department deleted' });
    } catch (error) {
        console.error('Error deleting department:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { getDepartments, createDepartment, updateDepartment, deleteDepartment };
