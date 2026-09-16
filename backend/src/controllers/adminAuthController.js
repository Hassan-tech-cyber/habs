const bcrypt = require('bcrypt');
const prisma = require('../config/prisma');
const { doctorSchema, adminSchema } = require('../utils/validation');
const { sendWelcomeEmail } = require('../utils/mailer');

const createUserAccount = async (req, res, role, schema) => {
    try {
        const { error, value } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const existingUser = await prisma.user.findUnique({
            where: { email: value.email }
        });

        if (existingUser) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        // Hashing the temporary password
        const passwordHash = await bcrypt.hash(value.password, 10);
        
        const userData = {
            role,
            name: value.name,
            email: value.email,
            phone: value.phone,
            passwordHash
        };

        // Add doctor-specific fields if applicable
        if (role === 'doctor') {
            userData.departmentId = value.departmentId;
            userData.specialty = value.specialty;
            userData.consultationFee = value.consultationFee;
            userData.isActive = true;
            userData.workingHours = {}; // Default empty, doctor sets this later
            userData.slotDurationMinutes = 30; // Default
        }

        const newUser = await prisma.user.create({
            data: userData
        });

        // Send email (non-blocking)
        sendWelcomeEmail(value.email, value.name, role, value.password);

        const createdUser = { ...newUser, uid: newUser.id };
        delete createdUser.passwordHash;

        res.status(201).json({ message: `${role} created successfully`, user: createdUser });
    } catch (error) {
        console.error(`Error creating ${role}:`, error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const createDoctor = async (req, res) => createUserAccount(req, res, 'doctor', doctorSchema);
const createAdmin = async (req, res) => createUserAccount(req, res, 'admin', adminSchema);

module.exports = { createDoctor, createAdmin };
