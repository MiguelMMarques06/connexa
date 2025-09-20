/**
 * Hook personalizado para gerenciar verificação e renovação automática de tokens
 */

import { useEffect, useCallback, useRef } from 'react';
import { 
    getSecureToken, 
    isTokenExpired, 
    shouldRefreshToken, 
    clearAllAuthData,
    setSecureToken 
} from '../utils/secureStorage';
import { refreshToken as apiRefreshToken } from '../services/api';

interface UseTokenManagerOptions {
    onTokenExpired?: () => void;
    onTokenRefreshed?: (newToken: string) => void;
    onError?: (error: string) => void;
    checkInterval?: number; // em milissegundos
}

/**
 * Hook para gerenciar tokens JWT com verificação e renovação automática
 */
export const useTokenManager = (options: UseTokenManagerOptions = {}) => {
    const {
        onTokenExpired,
        onTokenRefreshed,
        onError,
        checkInterval = parseInt(process.env.REACT_APP_TOKEN_CHECK_INTERVAL || '60000') // Padrão: 1 minuto
    } = options;

    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const isRefreshingRef = useRef(false);

    /**
     * Função para renovar o token
     */
    const refreshToken = useCallback(async (): Promise<boolean> => {
        if (isRefreshingRef.current) {
            return false; // Já está renovando
        }

        isRefreshingRef.current = true;

        try {
            const currentToken = getSecureToken();
            
            if (!currentToken) {
                onError?.('Token não encontrado');
                return false;
            }

            // Usar a função da API para renovar o token
            const response = await apiRefreshToken();
            
            if (response.token) {
                // Armazenar o novo token de forma segura
                setSecureToken(response.token);
                onTokenRefreshed?.(response.token);
                console.log('Token renovado com sucesso');
                return true;
            } else {
                throw new Error('Token de resposta inválido');
            }

        } catch (error: any) {
            console.error('Erro ao renovar token:', error);
            onError?.(error.message || 'Erro ao renovar token');
            return false;
        } finally {
            isRefreshingRef.current = false;
        }
    }, [onTokenRefreshed, onError]);

    /**
     * Função para verificar o status do token
     */
    const checkTokenStatus = useCallback(async () => {
        try {
            const token = getSecureToken();
            
            if (!token) {
                console.log('Nenhum token encontrado');
                return;
            }

            // Verificar se o token está expirado
            if (isTokenExpired(token)) {
                console.warn('Token expirado detectado');
                clearAllAuthData();
                onTokenExpired?.();
                return;
            }

            // Verificar se o token precisa ser renovado
            if (shouldRefreshToken(token)) {
                console.log('Token próximo da expiração, tentando renovar...');
                const success = await refreshToken();
                
                if (!success) {
                    console.warn('Falha ao renovar token, fazendo logout');
                    clearAllAuthData();
                    onTokenExpired?.();
                }
            }

        } catch (error: any) {
            console.error('Erro ao verificar status do token:', error);
            onError?.(error.message || 'Erro ao verificar token');
        }
    }, [refreshToken, onTokenExpired, onError]);

    /**
     * Inicia o monitoramento automático
     */
    const startTokenMonitoring = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        // Verificação inicial
        checkTokenStatus();

        // Configurar verificação periódica
        intervalRef.current = setInterval(checkTokenStatus, checkInterval);
        
        console.log(`Monitoramento de token iniciado (intervalo: ${checkInterval}ms)`);
    }, [checkTokenStatus, checkInterval]);

    /**
     * Para o monitoramento automático
     */
    const stopTokenMonitoring = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
            console.log('Monitoramento de token parado');
        }
    }, []);

    /**
     * Força uma verificação manual do token
     */
    const forceTokenCheck = useCallback(() => {
        checkTokenStatus();
    }, [checkTokenStatus]);

    /**
     * Força uma renovação manual do token
     */
    const forceTokenRefresh = useCallback(async (): Promise<boolean> => {
        return await refreshToken();
    }, [refreshToken]);

    // Cleanup quando o componente for desmontado
    useEffect(() => {
        return () => {
            stopTokenMonitoring();
        };
    }, [stopTokenMonitoring]);

    // Event listeners para detectar quando a aba fica ativa/inativa
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                // Aba ficou ativa, verificar token imediatamente
                forceTokenCheck();
            }
        };

        const handleFocus = () => {
            // Janela ficou em foco, verificar token
            forceTokenCheck();
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('focus', handleFocus);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('focus', handleFocus);
        };
    }, [forceTokenCheck]);

    return {
        startTokenMonitoring,
        stopTokenMonitoring,
        forceTokenCheck,
        forceTokenRefresh,
        isRefreshing: isRefreshingRef.current
    };
};