const express = require('express');
const router = express.Router();
const { bookAppointment, payForAppointment, getAppointments, cancelAppointment } = require('../controllers/appointmentController');
const { verifyToken, requireRole } = require('../middlewares/auth');

router.use(verifyToken);

// Common for retrieving appointments (handled internally by role)
router.get('/', requireRole(['patient', 'doctor', 'admin']), getAppointments);

// Patient only routes
router.post('/', requireRole(['patient']), bookAppointment);
router.post('/:id/pay', requireRole(['patient']), payForAppointment);

// Cancel an appointment (accessible by patient, doctor, and admin based on logic inside controller)
router.put('/:id/cancel', requireRole(['patient', 'doctor', 'admin']), cancelAppointment);

module.exports = router;
