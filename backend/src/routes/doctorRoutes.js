const express = require('express');
const router = express.Router();
const { getDoctors, updateWorkingHours, getDoctorSlots } = require('../controllers/doctorController');
const { verifyToken, requireRole } = require('../middlewares/auth');
const jwt = require('jsonwebtoken');

// Optional auth middleware just for resolving user role for filtering
const optionalAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
            req.user = jwt.verify(token, process.env.JWT_SECRET);
        } catch (e) {}
    }
    next();
};

// Public routes
router.get('/', optionalAuth, getDoctors);
router.get('/:uid/slots', getDoctorSlots);

// Protected routes for doctor
router.use(verifyToken);
router.use(requireRole(['doctor']));
router.put('/working-hours', updateWorkingHours);

module.exports = router;
