const express = require('express');
const router = express.Router();
const { registerPatient, login, getProfile, updateProfile } = require('../controllers/authController');
const { verifyToken } = require('../middlewares/auth');

router.post('/register', registerPatient);
router.post('/login', login);
router.get('/me', verifyToken, getProfile);
router.put('/profile', verifyToken, updateProfile);

module.exports = router;
