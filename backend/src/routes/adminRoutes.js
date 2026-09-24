const express = require('express');
const router = express.Router();
const { createDoctor, createAdmin } = require('../controllers/adminAuthController');
const { updateDoctorByAdmin } = require('../controllers/doctorController');
const { verifyToken, requireRole } = require('../middlewares/auth');

const { getAnalytics } = require('../controllers/adminController');

router.use(verifyToken);
router.use(requireRole(['admin', 'system_admin']));

router.get('/analytics', getAnalytics);
router.post('/users/doctor', createDoctor);
router.post('/users/admin', createAdmin);
router.put('/users/doctor/:uid', updateDoctorByAdmin);

module.exports = router;
