const express = require('express');
const router = express.Router();
const { bookAppointment, payForAppointment, getAppointments, cancelAppointment } = require('../controllers/appointmentController');
const { verifyToken, requireRole } = require('../middlewares/auth');

router.use(verifyToken);


router.get('/', requireRole(['patient', 'doctor', 'admin', 'system_admin']), getAppointments);


router.post('/', requireRole(['patient', 'admin', 'system_admin']), bookAppointment);
router.post('/:id/pay', requireRole(['patient', 'admin', 'system_admin']), payForAppointment);


router.put('/:id/cancel', requireRole(['patient', 'doctor', 'admin', 'system_admin']), cancelAppointment);

module.exports = router;
