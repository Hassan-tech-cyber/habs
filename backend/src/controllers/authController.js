const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { patientSchema, profileUpdateSchema } = require('../utils/validation');
const { sendPatientWelcomeEmail } = require('../utils/mailer');

const generateToken = (user) => {
    return jwt.sign(
        { uid: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '10m' }
    );
};

const registerPatient = async (req, res) => {
    try {
        const { error, value } = patientSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const existingUser = await User.findOne({ email: value.email });

        if (existingUser) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        const passwordHash = await bcrypt.hash(value.password, 10);
        
        const userData = {
            role: 'patient',
            name: value.name,
            email: value.email,
            phone: value.phone,
            dob: value.dob,
            gender: value.gender,
            emergencyContactName: value.emergencyContactName,
            emergencyContactPhone: value.emergencyContactPhone,
            emergencyContactRelation: value.emergencyContactRelation,
            allergies: value.allergies || '',
            chronicConditions: value.chronicConditions || '',
            currentMedications: value.currentMedications || '',
            passwordHash: passwordHash
        };

        const newUser = await User.create(userData);

        const createdUser = { ...newUser.toJSON(), uid: newUser._id };
        const token = generateToken(newUser);

        // Send welcome email (non-blocking)
        sendPatientWelcomeEmail(value.email, value.name);

        res.status(201).json({ token, user: createdUser });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const match = await bcrypt.compare(password, user.passwordHash);
        if (!match) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        if (user.role === 'doctor' && !user.isActive) {
             
        }

        const token = generateToken(user);
        
        const safeUser = { ...user.toJSON(), uid: user._id };

        res.status(200).json({ token, user: safeUser });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getProfile = async (req, res) => {
    
    const safeUser = { ...req.dbUser.toJSON(), uid: req.dbUser._id };
    res.status(200).json({ user: safeUser });
};

const updateProfile = async (req, res) => {
    try {
        const { error, value } = profileUpdateSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const updates = {};
        if (value.name) updates.name = value.name;
        if (value.phone) updates.phone = value.phone;
        
        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ error: 'No valid fields provided for update' });
        }

        const updatedUser = await User.findByIdAndUpdate(req.user.uid, updates, { new: true });

        res.status(200).json({ message: 'Profile updated successfully', updates });
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { registerPatient, login, getProfile, updateProfile };
