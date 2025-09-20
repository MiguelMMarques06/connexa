const bcrypt = require('bcrypt');
const securityConfig = require('../config/security');

/**
 * Utilitários para autenticação segura
 */
class AuthUtils {
    
    /**
     * Compara uma senha em texto plano com uma senha criptografada
     * @param {string} plainPassword - Senha em texto plano
     * @param {string} hashedPassword - Senha criptografada
     * @returns {Promise<boolean>} - Retorna true se as senhas coincidirem
     */
    static async comparePasswords(plainPassword, hashedPassword) {
        try {
            if (!plainPassword || !hashedPassword) {
                return false;
            }
            
            // Verifica se o hash está no formato correto do bcrypt
            if (!hashedPassword.startsWith('$2b$') && !hashedPassword.startsWith('$2a$')) {
                console.error('Hash de senha inválido detectado');
                return false;
            }

            const isValid = await bcrypt.compare(plainPassword, hashedPassword);
            return isValid;
            
        } catch (error) {
            console.error('Erro na comparação de senhas:', error);
            return false;
        }
    }

    /**
     * Cria um hash de senha seguro
     * @param {string} plainPassword - Senha em texto plano
     * @returns {Promise<string>} - Hash da senha
     */
    static async hashPassword(plainPassword) {
        try {
            if (!plainPassword) {
                throw new Error('Senha não pode estar vazia');
            }

            if (plainPassword.length > securityConfig.PASSWORD_MAX_LENGTH) {
                throw new Error('Senha excede o comprimento máximo permitido');
            }

            const saltRounds = securityConfig.SALT_ROUNDS;
            const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
            
            return hashedPassword;
            
        } catch (error) {
            console.error('Erro ao criar hash da senha:', error);
            throw error;
        }
    }

    /**
     * Executa uma comparação "dummy" para prevenir ataques de timing
     * Usado quando o usuário não existe, mas queremos manter o mesmo tempo de resposta
     */
    static async dummyPasswordCompare() {
        try {
            // Hash dummy gerado uma vez para usar em comparações falsas
            const dummyHash = '$2b$12$dummyhashtopreventtimingattacksXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';
            await bcrypt.compare('dummy_password', dummyHash);
        } catch (error) {
            // Silenciosamente ignora erros na comparação dummy
        }
    }

    /**
     * Valida a força da senha
     * @param {string} password - Senha a ser validada
     * @returns {Object} - Objeto com resultado da validação
     */
    static validatePasswordStrength(password) {
        const errors = [];
        
        if (!password) {
            errors.push('Senha é obrigatória');
            return { isValid: false, errors };
        }

        if (password.length < securityConfig.PASSWORD_MIN_LENGTH) {
            errors.push(`Senha deve ter pelo menos ${securityConfig.PASSWORD_MIN_LENGTH} caracteres`);
        }

        if (password.length > securityConfig.PASSWORD_MAX_LENGTH) {
            errors.push(`Senha não pode ter mais de ${securityConfig.PASSWORD_MAX_LENGTH} caracteres`);
        }

        if (!/[A-Z]/.test(password)) {
            errors.push('Senha deve conter pelo menos uma letra maiúscula');
        }

        if (!/[a-z]/.test(password)) {
            errors.push('Senha deve conter pelo menos uma letra minúscula');
        }

        if (!/\d/.test(password)) {
            errors.push('Senha deve conter pelo menos um número');
        }

        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            errors.push('Senha deve conter pelo menos um caractere especial');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }
}

module.exports = AuthUtils;