const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { validateRegistration, validateLogin } = require('../middleware/validation');
const { loginRateLimit, registerRateLimit } = require('../middleware/rateLimiting');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

// POST /api/users/register
router.post('/register', registerRateLimit, validateRegistration, userController.register);

// POST /api/users/login
router.post('/login', loginRateLimit, validateLogin, userController.login);

// GET /api/users/profile - Rota protegida para obter perfil do usuário
router.get('/profile', authenticateToken, userController.getProfile);

// GET /api/users/verify-token - Verifica se o token é válido
router.get('/verify-token', authenticateToken, (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Token is valid',
        user: req.user
    });
});

module.exports = router;