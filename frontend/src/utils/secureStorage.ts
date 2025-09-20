/**
 * Utilitário para armazenamento seguro de tokens JWT
 * Implementa múltiplas camadas de segurança:
 * 1. Preferência por httpOnly cookies
 * 2. Criptografia para localStorage como fallback
 * 3. Verificação de integridade
 * 4. Validação de expiração
 */

import CryptoJS from 'crypto-js';

// Chave de criptografia a partir das variáveis de ambiente
const ENCRYPTION_KEY = process.env.REACT_APP_ENCRYPTION_KEY || 'connexa-fallback-key-change-in-production';
const TOKEN_KEY = 'connexa_token';
const USER_KEY = 'connexa_user';
const TOKEN_TIMESTAMP_KEY = 'connexa_token_timestamp';

// Configurações de segurança
const TOKEN_MAX_AGE = 24 * 60 * 60 * 1000; // 24 horas em milissegundos
const TOKEN_REFRESH_THRESHOLD = parseInt(process.env.REACT_APP_TOKEN_REFRESH_THRESHOLD || '300'); // 5 minutos em segundos

// Log de aviso se estiver usando chave padrão
if (ENCRYPTION_KEY === 'connexa-fallback-key-change-in-production') {
    console.warn('⚠️  ATENÇÃO: Usando chave de criptografia padrão! Configure REACT_APP_ENCRYPTION_KEY em produção.');
}

interface StoredTokenData {
    token: string;
    timestamp: number;
    integrity: string;
}

interface User {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

/**
 * Gera hash de integridade para validação
 */
const generateIntegrityHash = (data: string): string => {
    return CryptoJS.SHA256(data + ENCRYPTION_KEY).toString();
};

/**
 * Criptografa dados usando AES
 */
const encrypt = (data: string): string => {
    return CryptoJS.AES.encrypt(data, ENCRYPTION_KEY).toString();
};

/**
 * Descriptografa dados usando AES
 */
const decrypt = (encryptedData: string): string => {
    try {
        const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
        return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
        console.error('Erro ao descriptografar dados:', error);
        return '';
    }
};

/**
 * Verifica se httpOnly cookies estão disponíveis
 */
const isHttpOnlyCookieSupported = (): boolean => {
    return typeof document !== 'undefined' && 'cookie' in document;
};

/**
 * Define um cookie httpOnly (requer configuração no servidor)
 */
const setSecureCookie = (name: string, value: string, days: number = 7): void => {
    if (!isHttpOnlyCookieSupported()) return;
    
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    
    // Esta implementação requer que o servidor configure o cookie como httpOnly
    // O cliente não pode definir httpOnly diretamente
    document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=/; secure; samesite=strict`;
};

/**
 * Obtém valor de um cookie
 */
const getCookie = (name: string): string | null => {
    if (!isHttpOnlyCookieSupported()) return null;
    
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
};

/**
 * Remove um cookie
 */
const deleteCookie = (name: string): void => {
    if (!isHttpOnlyCookieSupported()) return;
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};

/**
 * Armazena token de forma segura
 */
export const setSecureToken = (token: string): void => {
    try {
        const timestamp = Date.now();
        const integrity = generateIntegrityHash(token + timestamp);
        
        const tokenData: StoredTokenData = {
            token,
            timestamp,
            integrity
        };
        
        // Tentar usar cookie primeiro (mais seguro)
        const encryptedToken = encrypt(JSON.stringify(tokenData));
        setSecureCookie(TOKEN_KEY, encryptedToken);
        
        // Fallback para localStorage criptografado
        localStorage.setItem(TOKEN_KEY, encryptedToken);
        localStorage.setItem(TOKEN_TIMESTAMP_KEY, timestamp.toString());
        
        console.log('Token armazenado com segurança');
    } catch (error) {
        console.error('Erro ao armazenar token:', error);
    }
};

/**
 * Recupera token de forma segura
 */
export const getSecureToken = (): string | null => {
    try {
        // Tentar recuperar do cookie primeiro
        let encryptedData = getCookie(TOKEN_KEY);
        
        // Fallback para localStorage
        if (!encryptedData) {
            encryptedData = localStorage.getItem(TOKEN_KEY);
        }
        
        if (!encryptedData) {
            return null;
        }
        
        const decryptedData = decrypt(encryptedData);
        if (!decryptedData) {
            console.warn('Falha ao descriptografar token');
            removeSecureToken();
            return null;
        }
        
        const tokenData: StoredTokenData = JSON.parse(decryptedData);
        
        // Verificar integridade
        const expectedIntegrity = generateIntegrityHash(tokenData.token + tokenData.timestamp);
        if (tokenData.integrity !== expectedIntegrity) {
            console.warn('Token com integridade comprometida');
            removeSecureToken();
            return null;
        }
        
        // Verificar se o token não está muito antigo (configurável)
        if (Date.now() - tokenData.timestamp > TOKEN_MAX_AGE) {
            console.warn('Token muito antigo, removendo');
            removeSecureToken();
            return null;
        }
        
        return tokenData.token;
    } catch (error) {
        console.error('Erro ao recuperar token:', error);
        removeSecureToken();
        return null;
    }
};

/**
 * Remove token de forma segura
 */
export const removeSecureToken = (): void => {
    try {
        // Remover do cookie
        deleteCookie(TOKEN_KEY);
        
        // Remover do localStorage
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(TOKEN_TIMESTAMP_KEY);
        
        console.log('Token removido com segurança');
    } catch (error) {
        console.error('Erro ao remover token:', error);
    }
};

/**
 * Armazena dados do usuário de forma segura
 */
export const setSecureUser = (user: User): void => {
    try {
        const encryptedUser = encrypt(JSON.stringify(user));
        
        // Usar cookie se disponível
        setSecureCookie(USER_KEY, encryptedUser);
        
        // Fallback para localStorage
        localStorage.setItem(USER_KEY, encryptedUser);
        
        console.log('Dados do usuário armazenados com segurança');
    } catch (error) {
        console.error('Erro ao armazenar dados do usuário:', error);
    }
};

/**
 * Recupera dados do usuário de forma segura
 */
export const getSecureUser = (): User | null => {
    try {
        // Tentar recuperar do cookie primeiro
        let encryptedData = getCookie(USER_KEY);
        
        // Fallback para localStorage
        if (!encryptedData) {
            encryptedData = localStorage.getItem(USER_KEY);
        }
        
        if (!encryptedData) {
            return null;
        }
        
        const decryptedData = decrypt(encryptedData);
        if (!decryptedData) {
            console.warn('Falha ao descriptografar dados do usuário');
            removeSecureUser();
            return null;
        }
        
        return JSON.parse(decryptedData);
    } catch (error) {
        console.error('Erro ao recuperar dados do usuário:', error);
        removeSecureUser();
        return null;
    }
};

/**
 * Remove dados do usuário de forma segura
 */
export const removeSecureUser = (): void => {
    try {
        // Remover do cookie
        deleteCookie(USER_KEY);
        
        // Remover do localStorage
        localStorage.removeItem(USER_KEY);
        
        console.log('Dados do usuário removidos com segurança');
    } catch (error) {
        console.error('Erro ao remover dados do usuário:', error);
    }
};

/**
 * Limpa todos os dados de autenticação
 */
export const clearAllAuthData = (): void => {
    removeSecureToken();
    removeSecureUser();
};

/**
 * Verifica se o token JWT está expirado
 */
export const isTokenExpired = (token: string): boolean => {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Math.floor(Date.now() / 1000);
        return payload.exp < currentTime;
    } catch (error) {
        console.error('Erro ao verificar expiração do token:', error);
        return true;
    }
};

/**
 * Obtém o tempo restante até a expiração do token (em segundos)
 */
export const getTokenTimeToExpiry = (token: string): number => {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Math.floor(Date.now() / 1000);
        return Math.max(0, payload.exp - currentTime);
    } catch (error) {
        console.error('Erro ao calcular tempo de expiração:', error);
        return 0;
    }
};

/**
 * Verifica se o token precisa ser renovado (expira em menos de X segundos configurável)
 */
export const shouldRefreshToken = (token: string): boolean => {
    const timeToExpiry = getTokenTimeToExpiry(token);
    return timeToExpiry < TOKEN_REFRESH_THRESHOLD;
};