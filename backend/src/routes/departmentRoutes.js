const express = require('express');
const router = express.Router();
const { getDepartments, createDepartment, updateDepartment, deleteDepartment } = require('../controllers/departmentController');
const { verifyToken, requireRole } = require('../middlewares/auth');

// Public route
router.get('/', getDepartments);

// Admin only routes
router.use(verifyToken);
router.use(requireRole(['admin']));

router.post('/', createDepartment);
router.put('/:id', updateDepartment);
router.delete('/:id', deleteDepartment);

module.exports = router;
