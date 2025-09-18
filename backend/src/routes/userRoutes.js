const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { validateRegistration } = require('../middleware/validation');

// POST /api/users/register
router.post('/register', validateRegistration, userController.register);

module.exports = router;