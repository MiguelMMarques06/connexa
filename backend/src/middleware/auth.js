const JWTUtils = require('../utils/jwtUtils');
const UserService = require('../services/userService');

// Cache simples para tokens blacklistados (em produção usar Redis)
const blacklistedTokens = new Set();

/**
 * Middleware principal para autenticação via JWT
 * @param {Object} options - Opções de configuração
 * @param {boolean} options.required - Se a autenticação é obrigatória (default: true)
 * @param {boolean} options.checkDatabase - Se deve verificar o usuário no banco (default: false)
 * @param {Array} options.allowedRoles - Roles permitidos (default: todos)
 */
const authenticateToken = (options = {}) => {
    const {
        required = true,
        checkDatabase = false,
        allowedRoles = null,
        refreshOnExpiry = false
    } = options;

    return async (req, res, next) => {
        try {
            // Extrai o token do header Authorization
            const authHeader = req.headers['authorization'];
            const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

            if (!token) {
                if (!required) {
                    return next(); // Continua sem autenticação se não for obrigatória
                }
                return res.status(401).json({
                    error: 'Access denied',
                    details: ['No authentication token provided'],
                    code: 'NO_TOKEN'
                });
            }

            // Verifica se o token está na blacklist
            if (blacklistedTokens.has(token)) {
                return res.status(401).json({
                    error: 'Token revoked',
                    details: ['This token has been revoked'],
                    code: 'TOKEN_REVOKED'
                });
            }

            // Verifica e decodifica o token
            let decoded;
            try {
                decoded = await JWTUtils.verifyToken(token);
            } catch (error) {
                if (!required) {
                    return next(); // Continua sem autenticação se não for obrigatória
                }
                
                return res.status(401).json({
                    error: 'Authentication failed',
                    details: [error.message],
                    code: getErrorCode(error.message)
                });
            }

            // Verifica se o usuário ainda existe no banco (opcional)
            if (checkDatabase) {
                try {
                    const user = await UserService.findByEmailWithPassword(decoded.email);
                    if (!user) {
                        return res.status(401).json({
                            error: 'User not found',
                            details: ['User associated with this token no longer exists'],
                            code: 'USER_NOT_FOUND'
                        });
                    }
                } catch (dbError) {
                    console.error('Database error during token verification:', dbError);
                    return res.status(500).json({
                        error: 'Authentication service error',
                        details: ['Unable to verify user status']
                    });
                }
            }

            // Verifica roles se especificado
            if (allowedRoles && decoded.role && !allowedRoles.includes(decoded.role)) {
                return res.status(403).json({
                    error: 'Insufficient permissions',
                    details: [`Access denied. Required roles: ${allowedRoles.join(', ')}`],
                    code: 'INSUFFICIENT_PERMISSIONS'
                });
            }

            // Adiciona as informações do usuário à requisição
            req.user = {
                id: decoded.userId,
                email: decoded.email,
                name: decoded.name,
                role: decoded.role || 'user',
                tokenId: decoded.tokenId,
                loginTime: decoded.loginTime,
                iat: decoded.iat,
                exp: decoded.exp
            };

            // Adiciona o token original para possível revogação
            req.token = token;

            // Log de acesso (opcional)
            console.log(`Authenticated access: ${decoded.email} to ${req.method} ${req.path}`);

            next();
            
        } catch (error) {
            console.error('Authentication middleware error:', error);
            return res.status(500).json({
                error: 'Authentication service error',
                details: ['Internal authentication error'],
                code: 'AUTH_SERVICE_ERROR'
            });
        }
    };
};

/**
 * Middleware para autenticação opcional (não falha se não houver token)
 */
const optionalAuth = authenticateToken({ required: false });

/**
 * Middleware para autenticação obrigatória com verificação no banco
 */
const strictAuth = authenticateToken({ required: true, checkDatabase: true });

/**
 * Middleware para verificar se o usuário é dono do recurso
 * @param {string} paramName - Nome do parâmetro que contém o ID do usuário
 */
const authorizeUser = (paramName = 'userId') => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                error: 'Authentication required',
                details: ['Please login to access this resource'],
                code: 'AUTH_REQUIRED'
            });
        }

        const resourceUserId = req.params[paramName] || req.body[paramName];
        
        if (!resourceUserId) {
            return res.status(400).json({
                error: 'Bad request',
                details: [`Missing ${paramName} parameter`],
                code: 'MISSING_PARAM'
            });
        }

        if (req.user.id !== parseInt(resourceUserId)) {
            return res.status(403).json({
                error: 'Access forbidden',
                details: ['You can only access your own resources'],
                code: 'ACCESS_FORBIDDEN'
            });
        }

        next();
    };
};

/**
 * Middleware para verificar roles específicos
 * @param {Array} roles - Array de roles permitidos
 */
const requireRole = (roles) => {
    if (!Array.isArray(roles)) {
        roles = [roles];
    }

    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                error: 'Authentication required',
                details: ['Please login to access this resource'],
                code: 'AUTH_REQUIRED'
            });
        }

        const userRole = req.user.role || 'user';
        
        if (!roles.includes(userRole)) {
            return res.status(403).json({
                error: 'Insufficient permissions',
                details: [`Access denied. Required roles: ${roles.join(', ')}. Your role: ${userRole}`],
                code: 'INSUFFICIENT_PERMISSIONS'
            });
        }

        next();
    };
};

/**
 * Middleware para revogar token (adicionar à blacklist)
 */
const revokeToken = (req, res, next) => {
    if (req.token) {
        blacklistedTokens.add(req.token);
        console.log(`Token revoked for user: ${req.user?.email}`);
    }
    next();
};

/**
 * Middleware para extrair informações do token sem verificar assinatura
 */
const extractTokenInfo = (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (token) {
            const decoded = JWTUtils.decodeToken(token);
            req.tokenInfo = decoded;
        }

        next();
        
    } catch (error) {
        next(); // Continua mesmo se houver erro
    }
};

/**
 * Middleware para verificar se o token está próximo do vencimento
 * @param {number} thresholdMinutes - Minutos antes do vencimento para avisar
 */
const checkTokenExpiry = (thresholdMinutes = 30) => {
    return (req, res, next) => {
        if (req.user && req.user.exp) {
            const now = Math.floor(Date.now() / 1000);
            const timeUntilExpiry = req.user.exp - now;
            const thresholdSeconds = thresholdMinutes * 60;

            if (timeUntilExpiry <= thresholdSeconds) {
                res.set('X-Token-Warning', 'Token expires soon');
                res.set('X-Token-Expires-In', timeUntilExpiry.toString());
            }
        }
        next();
    };
};

/**
 * Utilitário para obter código de erro baseado na mensagem
 */
function getErrorCode(errorMessage) {
    if (errorMessage.includes('expirado')) return 'TOKEN_EXPIRED';
    if (errorMessage.includes('inválido')) return 'TOKEN_INVALID';
    if (errorMessage.includes('não fornecido')) return 'NO_TOKEN';
    return 'AUTH_ERROR';
}

/**
 * Utilitário para limpar tokens expirados da blacklist
 */
function cleanupBlacklist() {
    // Em produção, isso seria feito via Redis TTL
    // Por simplicidade, mantemos a blacklist em memória
    console.log(`Blacklist size: ${blacklistedTokens.size}`);
}

// Executa limpeza da blacklist a cada hora
setInterval(cleanupBlacklist, 60 * 60 * 1000);

module.exports = {
    authenticateToken,
    optionalAuth,
    strictAuth,
    authorizeUser,
    requireRole,
    revokeToken,
    extractTokenInfo,
    checkTokenExpiry,
    blacklistedTokens // Exporta para testes
};