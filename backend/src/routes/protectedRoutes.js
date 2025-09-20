const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const {
    requireUser,
    requireAdmin,
    canEditProfile,
    canDeleteAccount,
    userSpecificRateLimit
} = require('../middleware/authorization');

/**
 * Rotas públicas (sem autenticação)
 */

// Registro de usuário
router.post('/register', userController.register);

// Login de usuário
router.post('/login', userController.login);

/**
 * Rotas protegidas (com autenticação)
 */

// Obter perfil do usuário autenticado
router.get('/profile', 
    userSpecificRateLimit(50, 15 * 60 * 1000), // 50 requests por 15 minutos
    requireUser,
    userController.getProfile
);

// Atualizar perfil do usuário
router.put('/profile/:userId',
    userSpecificRateLimit(20, 15 * 60 * 1000), // 20 updates por 15 minutos
    canEditProfile('userId'),
    userController.updateProfile
);

// Deletar conta de usuário
router.delete('/account/:userId',
    userSpecificRateLimit(5, 60 * 60 * 1000), // 5 tentativas por hora
    canDeleteAccount('userId'),
    userController.deleteAccount
);

// Logout (revoga o token)
router.post('/logout',
    requireUser,
    userController.logout
);

// Refresh token
router.post('/refresh',
    requireUser,
    userController.refreshToken
);

/**
 * Rotas administrativas
 */

// Listar todos os usuários (apenas admin)
router.get('/admin/users',
    requireAdmin,
    userController.getAllUsers
);

// Obter usuário específico por ID (apenas admin)
router.get('/admin/users/:userId',
    requireAdmin,
    userController.getUserById
);

// Atualizar role de usuário (apenas admin)
router.patch('/admin/users/:userId/role',
    requireAdmin,
    userController.updateUserRole
);

// Banir/desbanir usuário (apenas admin)
router.patch('/admin/users/:userId/ban',
    requireAdmin,
    userController.banUser
);

module.exports = router;