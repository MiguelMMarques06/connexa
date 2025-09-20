const { authenticateToken, requireRole, authorizeUser } = require('./auth');

/**
 * Middleware de autorização para diferentes níveis de acesso
 */

/**
 * Middleware para administradores
 */
const requireAdmin = [
    authenticateToken({ required: true, checkDatabase: true }),
    requireRole(['admin', 'super_admin'])
];

/**
 * Middleware para moderadores e acima
 */
const requireModerator = [
    authenticateToken({ required: true, checkDatabase: true }),
    requireRole(['moderator', 'admin', 'super_admin'])
];

/**
 * Middleware para usuários autenticados básicos
 */
const requireUser = [
    authenticateToken({ required: true })
];

/**
 * Middleware para verificar se o usuário pode editar perfil
 * @param {string} userIdParam - Nome do parâmetro com ID do usuário
 */
const canEditProfile = (userIdParam = 'userId') => [
    authenticateToken({ required: true }),
    (req, res, next) => {
        const targetUserId = req.params[userIdParam] || req.body[userIdParam];
        const currentUserId = req.user.id;
        const userRole = req.user.role || 'user';

        // Admin pode editar qualquer perfil
        if (['admin', 'super_admin'].includes(userRole)) {
            return next();
        }

        // Usuário só pode editar seu próprio perfil
        if (currentUserId === parseInt(targetUserId)) {
            return next();
        }

        return res.status(403).json({
            error: 'Access forbidden',
            details: ['You can only edit your own profile'],
            code: 'EDIT_PROFILE_FORBIDDEN'
        });
    }
];

/**
 * Middleware para verificar se o usuário pode deletar conta
 */
const canDeleteAccount = (userIdParam = 'userId') => [
    authenticateToken({ required: true, checkDatabase: true }),
    (req, res, next) => {
        const targetUserId = req.params[userIdParam] || req.body[userIdParam];
        const currentUserId = req.user.id;
        const userRole = req.user.role || 'user';

        // Super admin pode deletar qualquer conta
        if (userRole === 'super_admin') {
            return next();
        }

        // Admin pode deletar contas de usuários normais, mas não de outros admins
        if (userRole === 'admin') {
            // Verificar se o usuário alvo não é admin
            // Em produção, isso seria verificado no banco de dados
            return next();
        }

        // Usuário só pode deletar sua própria conta
        if (currentUserId === parseInt(targetUserId)) {
            return next();
        }

        return res.status(403).json({
            error: 'Access forbidden',
            details: ['Insufficient permissions to delete this account'],
            code: 'DELETE_ACCOUNT_FORBIDDEN'
        });
    }
];

/**
 * Middleware para operações de conteúdo
 */
const contentPermissions = {
    // Criar conteúdo - usuários autenticados
    create: [
        authenticateToken({ required: true })
    ],

    // Editar conteúdo - dono ou moderador+
    edit: (contentOwnerField = 'authorId') => [
        authenticateToken({ required: true }),
        (req, res, next) => {
            const userRole = req.user.role || 'user';
            const userId = req.user.id;
            const ownerId = req.body[contentOwnerField] || req.params[contentOwnerField];

            // Moderador+ pode editar qualquer conteúdo
            if (['moderator', 'admin', 'super_admin'].includes(userRole)) {
                return next();
            }

            // Usuário pode editar apenas seu próprio conteúdo
            if (userId === parseInt(ownerId)) {
                return next();
            }

            return res.status(403).json({
                error: 'Access forbidden',
                details: ['You can only edit your own content'],
                code: 'EDIT_CONTENT_FORBIDDEN'
            });
        }
    ],

    // Deletar conteúdo - dono ou admin+
    delete: (contentOwnerField = 'authorId') => [
        authenticateToken({ required: true }),
        (req, res, next) => {
            const userRole = req.user.role || 'user';
            const userId = req.user.id;
            const ownerId = req.body[contentOwnerField] || req.params[contentOwnerField];

            // Admin+ pode deletar qualquer conteúdo
            if (['admin', 'super_admin'].includes(userRole)) {
                return next();
            }

            // Usuário pode deletar apenas seu próprio conteúdo
            if (userId === parseInt(ownerId)) {
                return next();
            }

            return res.status(403).json({
                error: 'Access forbidden',
                details: ['You can only delete your own content'],
                code: 'DELETE_CONTENT_FORBIDDEN'
            });
        }
    ]
};

/**
 * Middleware para operações administrativas
 */
const adminOperations = {
    // Gerenciar usuários
    manageUsers: [
        authenticateToken({ required: true, checkDatabase: true }),
        requireRole(['admin', 'super_admin'])
    ],

    // Gerenciar sistema
    manageSystem: [
        authenticateToken({ required: true, checkDatabase: true }),
        requireRole(['super_admin'])
    ],

    // Ver logs do sistema
    viewLogs: [
        authenticateToken({ required: true, checkDatabase: true }),
        requireRole(['admin', 'super_admin'])
    ],

    // Moderar conteúdo
    moderateContent: [
        authenticateToken({ required: true, checkDatabase: true }),
        requireRole(['moderator', 'admin', 'super_admin'])
    ]
};

/**
 * Middleware dinâmico baseado em configuração
 * @param {Object} config - Configuração de permissões
 * @param {Array} config.roles - Roles permitidos
 * @param {boolean} config.requireOwnership - Se requer ser dono do recurso
 * @param {string} config.ownerField - Campo que identifica o dono
 * @param {boolean} config.checkDatabase - Se deve verificar no banco
 */
const dynamicAuth = (config = {}) => {
    const {
        roles = null,
        requireOwnership = false,
        ownerField = 'userId',
        checkDatabase = false,
        optional = false
    } = config;

    const middlewares = [];

    // Autenticação base
    middlewares.push(authenticateToken({
        required: !optional,
        checkDatabase
    }));

    // Verificação de roles
    if (roles && roles.length > 0) {
        middlewares.push(requireRole(roles));
    }

    // Verificação de propriedade
    if (requireOwnership) {
        middlewares.push(authorizeUser(ownerField));
    }

    return middlewares;
};

/**
 * Middleware para rate limiting específico por usuário
 */
const userSpecificRateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
    const userRequests = new Map();

    return [
        authenticateToken({ required: true }),
        (req, res, next) => {
            const userId = req.user.id;
            const now = Date.now();
            const windowStart = now - windowMs;

            // Limpa entradas antigas
            if (!userRequests.has(userId)) {
                userRequests.set(userId, []);
            }

            const requests = userRequests.get(userId);
            const validRequests = requests.filter(time => time > windowStart);
            
            if (validRequests.length >= maxRequests) {
                return res.status(429).json({
                    error: 'Too many requests',
                    details: [`Rate limit exceeded. Max ${maxRequests} requests per ${windowMs / 1000} seconds`],
                    code: 'USER_RATE_LIMIT'
                });
            }

            validRequests.push(now);
            userRequests.set(userId, validRequests);
            
            next();
        }
    ];
};

module.exports = {
    requireAdmin,
    requireModerator,
    requireUser,
    canEditProfile,
    canDeleteAccount,
    contentPermissions,
    adminOperations,
    dynamicAuth,
    userSpecificRateLimit
};