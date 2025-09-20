/**
 * Utilitários de validação para dados de entrada
 */

/**
 * Valida formato de email
 * @param {string} email - Email para validar
 * @returns {boolean} - True se válido
 */
const validateEmail = (email) => {
    if (!email || typeof email !== 'string') {
        return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim().toLowerCase());
};

/**
 * Valida força da senha
 * @param {string} password - Senha para validar
 * @returns {Object} - Objeto com isValid e erros
 */
const validatePassword = (password) => {
    const errors = [];
    
    if (!password || typeof password !== 'string') {
        return { isValid: false, errors: ['Senha é obrigatória'] };
    }
    
    // Mínimo 8 caracteres
    if (password.length < 8) {
        errors.push('Senha deve ter pelo menos 8 caracteres');
    }
    
    // Pelo menos uma letra maiúscula
    if (!/[A-Z]/.test(password)) {
        errors.push('Senha deve conter pelo menos uma letra maiúscula');
    }
    
    // Pelo menos uma letra minúscula
    if (!/[a-z]/.test(password)) {
        errors.push('Senha deve conter pelo menos uma letra minúscula');
    }
    
    // Pelo menos um número
    if (!/[0-9]/.test(password)) {
        errors.push('Senha deve conter pelo menos um número');
    }
    
    // Pelo menos um caractere especial
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errors.push('Senha deve conter pelo menos um caractere especial');
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
};

/**
 * Valida nome (primeiro nome ou sobrenome)
 * @param {string} name - Nome para validar
 * @returns {boolean} - True se válido
 */
const validateName = (name) => {
    if (!name || typeof name !== 'string') {
        return false;
    }
    
    const trimmedName = name.trim();
    
    // Mínimo 2 caracteres, máximo 50
    if (trimmedName.length < 2 || trimmedName.length > 50) {
        return false;
    }
    
    // Apenas letras, espaços e caracteres acentuados
    const nameRegex = /^[a-zA-ZÀ-ÿ\s]+$/;
    return nameRegex.test(trimmedName);
};

/**
 * Sanitiza string removendo caracteres perigosos
 * @param {string} input - String para sanitizar
 * @returns {string} - String sanitizada
 */
const sanitizeString = (input) => {
    if (!input || typeof input !== 'string') {
        return '';
    }
    
    return input
        .trim()
        .replace(/[<>\"'&]/g, '') // Remove caracteres HTML perigosos
        .substring(0, 1000); // Limita tamanho
};

/**
 * Valida dados completos de registro
 * @param {Object} userData - Dados do usuário
 * @returns {Object} - Resultado da validação
 */
const validateRegistrationData = (userData) => {
    const errors = [];
    const { email, password, firstName, lastName } = userData;
    
    // Validar email
    if (!validateEmail(email)) {
        errors.push('Email inválido');
    }
    
    // Validar senha
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
        errors.push(...passwordValidation.errors);
    }
    
    // Validar primeiro nome
    if (!validateName(firstName)) {
        errors.push('Primeiro nome deve ter entre 2 e 50 caracteres e conter apenas letras');
    }
    
    // Validar sobrenome
    if (!validateName(lastName)) {
        errors.push('Sobrenome deve ter entre 2 e 50 caracteres e conter apenas letras');
    }
    
    return {
        isValid: errors.length === 0,
        errors,
        sanitizedData: {
            email: email ? email.trim().toLowerCase() : '',
            password,
            firstName: sanitizeString(firstName),
            lastName: sanitizeString(lastName)
        }
    };
};

/**
 * Valida dados de login
 * @param {Object} loginData - Dados de login
 * @returns {Object} - Resultado da validação
 */
const validateLoginData = (loginData) => {
    const errors = [];
    const { email, password } = loginData;
    
    // Validar email
    if (!validateEmail(email)) {
        errors.push('Email inválido');
    }
    
    // Validar senha (apenas presença para login)
    if (!password || typeof password !== 'string' || password.trim().length === 0) {
        errors.push('Senha é obrigatória');
    }
    
    return {
        isValid: errors.length === 0,
        errors,
        sanitizedData: {
            email: email ? email.trim().toLowerCase() : '',
            password: password ? password.trim() : ''
        }
    };
};

module.exports = {
    validateEmail,
    validatePassword,
    validateName,
    sanitizeString,
    validateRegistrationData,
    validateLoginData
};