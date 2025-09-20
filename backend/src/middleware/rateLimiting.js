const rateLimit = require('express-rate-limit');

// Rate limiting para tentativas de login
const loginRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // Máximo 5 tentativas por IP por janela de tempo
    message: {
        error: 'Too many login attempts',
        details: ['Please try again after 15 minutes']
    },
    standardHeaders: true, // Retorna rate limit info nos headers `RateLimit-*`
    legacyHeaders: false, // Desabilita os headers `X-RateLimit-*`
    skipSuccessfulRequests: true, // Não conta requisições bem-sucedidas
    skipFailedRequests: false, // Conta requisições que falharam
});

// Rate limiting geral para registro
const registerRateLimit = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 3, // Máximo 3 registros por IP por hora
    message: {
        error: 'Too many registration attempts',
        details: ['Please try again after 1 hour']
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Rate limiting geral para API
const generalRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // Máximo 100 requisições por IP por janela de tempo
    message: {
        error: 'Too many requests',
        details: ['Please try again later']
    },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = {
    loginRateLimit,
    registerRateLimit,
    generalRateLimit
};