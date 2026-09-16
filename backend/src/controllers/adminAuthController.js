const bcrypt = require('bcrypt');
const User = require('../models/User');
const { doctorSchema, adminSchema } = require('../utils/validation');
const { sendWelcomeEmail } = require('../utils/mailer');

const createUserAccount = async (req, res, role, schema) => {
    try {
        const { error, value } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const existingUser = await User.findOne({ email: value.email });

        if (existingUser) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        
        const passwordHash = await bcrypt.hash(value.password, 10);
        
        const userData = {
            role,
            name: value.name,
            email: value.email,
            phone: value.phone,
            passwordHash
        };

        
        if (role === 'doctor') {
            userData.departmentId = value.departmentId;
            userData.specialization = value.specialty; 
            userData.isActive = true;
            userData.workingHours = {}; 
        }

        const newUser = await User.create(userData);

        
        sendWelcomeEmail(value.email, value.name, role, value.password);

        const createdUser = { ...newUser.toJSON(), uid: newUser._id };

        res.status(201).json({ message: `${role} created successfully`, user: createdUser });
    } catch (error) {
        console.error(`Error creating ${role}:`, error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const createDoctor = async (req, res) => createUserAccount(req, res, 'doctor', doctorSchema);
const createAdmin = async (req, res) => createUserAccount(req, res, 'admin', adminSchema);

module.exports = { createDoctor, createAdmin };
