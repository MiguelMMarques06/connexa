const jwt = require('jsonwebtoken');
const securityConfig = require('../config/security');

/**
 * Utilitário para manipulação de JSON Web Tokens
 */
class JWTUtils {
    
    /**
     * Gera um token JWT para um usuário
     * @param {Object} user - Dados do usuário
     * @param {string} user.id - ID do usuário
     * @param {string} user.email - Email do usuário
     * @param {string} user.name - Nome do usuário
     * @returns {Promise<string>} - Token JWT gerado
     */
    static async generateToken(user) {
        try {
            if (!user || !user.id || !user.email) {
                throw new Error('Dados do usuário inválidos para geração do token');
            }

            const payload = {
                // Dados do usuário
                userId: user.id,
                email: user.email,
                name: user.name,
                
                // Timestamps
                iat: Math.floor(Date.now() / 1000), // issued at
                loginTime: new Date().toISOString(),
                
                // Identificadores únicos
                tokenId: `${user.id}_${Date.now()}`, // ID único do token
                
                // Metadados
                type: 'access_token',
                version: '1.0'
            };

            const options = {
                expiresIn: securityConfig.JWT_EXPIRES_IN,
                issuer: 'connexa-app',
                audience: 'connexa-users',
                algorithm: 'HS256'
            };

            const token = jwt.sign(payload, securityConfig.JWT_SECRET, options);
            
            return token;
            
        } catch (error) {
            console.error('Erro na geração do token JWT:', error);
            throw new Error('Falha na geração do token de autenticação');
        }
    }

    /**
     * Verifica e decodifica um token JWT
     * @param {string} token - Token a ser verificado
     * @returns {Promise<Object>} - Payload do token decodificado
     */
    static async verifyToken(token) {
        try {
            if (!token) {
                throw new Error('Token não fornecido');
            }

            // Remove 'Bearer ' se presente
            const cleanToken = token.replace(/^Bearer\s+/, '');

            const options = {
                issuer: 'connexa-app',
                audience: 'connexa-users',
                algorithms: ['HS256']
            };

            const decoded = jwt.verify(cleanToken, securityConfig.JWT_SECRET, options);
            
            // Verifica se o token não expirou
            const now = Math.floor(Date.now() / 1000);
            if (decoded.exp && decoded.exp < now) {
                throw new Error('Token expirado');
            }

            return decoded;
            
        } catch (error) {
            if (error.name === 'JsonWebTokenError') {
                throw new Error('Token inválido');
            } else if (error.name === 'TokenExpiredError') {
                throw new Error('Token expirado');
            } else if (error.name === 'NotBeforeError') {
                throw new Error('Token ainda não é válido');
            }
            
            console.error('Erro na verificação do token:', error);
            throw error;
        }
    }

    /**
     * Extrai informações básicas do token sem verificar a assinatura
     * @param {string} token - Token a ser decodificado
     * @returns {Object} - Payload do token (não verificado)
     */
    static decodeToken(token) {
        try {
            const cleanToken = token.replace(/^Bearer\s+/, '');
            return jwt.decode(cleanToken);
        } catch (error) {
            console.error('Erro ao decodificar token:', error);
            return null;
        }
    }

    /**
     * Verifica se um token está expirado
     * @param {string} token - Token a ser verificado
     * @returns {boolean} - True se expirado
     */
    static isTokenExpired(token) {
        try {
            const decoded = this.decodeToken(token);
            if (!decoded || !decoded.exp) {
                return true;
            }
            
            const now = Math.floor(Date.now() / 1000);
            return decoded.exp < now;
        } catch (error) {
            return true;
        }
    }

    /**
     * Gera um token de refresh (vida útil mais longa)
     * @param {Object} user - Dados do usuário
     * @returns {Promise<string>} - Refresh token
     */
    static async generateRefreshToken(user) {
        try {
            const payload = {
                userId: user.id,
                email: user.email,
                type: 'refresh_token',
                tokenId: `refresh_${user.id}_${Date.now()}`,
                iat: Math.floor(Date.now() / 1000)
            };

            const options = {
                expiresIn: '7d', // 7 dias para refresh token
                issuer: 'connexa-app',
                audience: 'connexa-users',
                algorithm: 'HS256'
            };

            return jwt.sign(payload, securityConfig.JWT_SECRET, options);
            
        } catch (error) {
            console.error('Erro na geração do refresh token:', error);
            throw new Error('Falha na geração do refresh token');
        }
    }

    /**
     * Formata a resposta de autenticação com tokens
     * @param {Object} user - Dados do usuário
     * @param {string} accessToken - Token de acesso
     * @param {string} refreshToken - Token de refresh (opcional)
     * @returns {Object} - Resposta formatada
     */
    static formatAuthResponse(user, accessToken, refreshToken = null) {
        const response = {
            success: true,
            message: 'Autenticação realizada com sucesso',
            timestamp: new Date().toISOString(),
            data: {
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email
                },
                tokens: {
                    accessToken,
                    type: 'Bearer',
                    expiresIn: securityConfig.JWT_EXPIRES_IN
                }
            }
        };

        if (refreshToken) {
            response.data.tokens.refreshToken = refreshToken;
        }

        return response;
    }
}

module.exports = JWTUtils;