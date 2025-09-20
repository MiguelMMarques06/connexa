/**
 * Hook useRedirect - Gerencia redirecionamentos inteligentes após login/logout
 * Mantém histórico de navegação e implementa lógica de redirecionamento seguro
 */

import { useCallback, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface RedirectOptions {
    fallbackPath?: string;
    preserveQuery?: boolean;
    allowedPaths?: string[];
    blockedPaths?: string[];
    maxRedirectAttempts?: number;
}

interface RedirectState {
    from?: string;
    returnTo?: string;
    timestamp?: number;
    attempts?: number;
}

const DEFAULT_OPTIONS: Required<RedirectOptions> = {
    fallbackPath: '/dashboard',
    preserveQuery: true,
    allowedPaths: ['/dashboard', '/profile', '/settings'],
    blockedPaths: ['/login', '/register', '/logout'],
    maxRedirectAttempts: 3
};

export const useRedirect = (options: RedirectOptions = {}) => {
    const config = { ...DEFAULT_OPTIONS, ...options };
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated, user } = useAuth();
    const redirectAttempts = useRef(0);

    /**
     * Verifica se um caminho é seguro para redirecionamento
     */
    const isSafePath = useCallback((path: string): boolean => {
        // Remover query string e hash para verificação
        const cleanPath = path.split('?')[0].split('#')[0];
        
        // Verificar se está na lista de bloqueados
        if (config.blockedPaths.some(blocked => cleanPath.startsWith(blocked))) {
            return false;
        }

        // Se há lista de permitidos, verificar se está incluído
        if (config.allowedPaths.length > 0) {
            return config.allowedPaths.some(allowed => 
                cleanPath === allowed || cleanPath.startsWith(allowed + '/')
            );
        }

        // Se não há lista específica, permitir caminhos que não são obviamente inseguros
        const unsafePaths = ['/admin', '/api', '/auth'];
        return !unsafePaths.some(unsafe => cleanPath.startsWith(unsafe));
    }, [config.allowedPaths, config.blockedPaths]);

    /**
     * Salva a localização atual para redirecionamento posterior
     */
    const saveCurrentLocation = useCallback(() => {
        const currentPath = location.pathname + (config.preserveQuery ? location.search : '');
        
        if (isSafePath(currentPath)) {
            sessionStorage.setItem('connexa_redirect_after_login', JSON.stringify({
                from: currentPath,
                timestamp: Date.now(),
                attempts: 0
            } as RedirectState));
        }
    }, [location.pathname, location.search, config.preserveQuery, isSafePath]);

    /**
     * Obtém a localização salva para redirecionamento
     */
    const getSavedLocation = useCallback((): RedirectState | null => {
        try {
            const saved = sessionStorage.getItem('connexa_redirect_after_login');
            if (!saved) return null;

            const redirectState: RedirectState = JSON.parse(saved);
            
            // Verificar se não é muito antigo (máximo 30 minutos)
            const maxAge = 30 * 60 * 1000; // 30 minutos
            if (redirectState.timestamp && Date.now() - redirectState.timestamp > maxAge) {
                sessionStorage.removeItem('connexa_redirect_after_login');
                return null;
            }

            return redirectState;
        } catch {
            sessionStorage.removeItem('connexa_redirect_after_login');
            return null;
        }
    }, []);

    /**
     * Limpa dados de redirecionamento salvos
     */
    const clearSavedLocation = useCallback(() => {
        sessionStorage.removeItem('connexa_redirect_after_login');
        redirectAttempts.current = 0;
    }, []);

    /**
     * Redireciona após login bem-sucedido
     */
    const redirectAfterLogin = useCallback(() => {
        const savedLocation = getSavedLocation();
        
        if (savedLocation?.from && isSafePath(savedLocation.from)) {
            // Verificar tentativas de redirecionamento
            const attempts = (savedLocation.attempts || 0) + 1;
            
            if (attempts <= config.maxRedirectAttempts) {
                // Atualizar tentativas
                sessionStorage.setItem('connexa_redirect_after_login', JSON.stringify({
                    ...savedLocation,
                    attempts
                }));

                navigate(savedLocation.from, { replace: true });
                return;
            }
        }

        // Se não há localização salva ou excedeu tentativas, usar fallback
        clearSavedLocation();
        navigate(config.fallbackPath, { replace: true });
    }, [getSavedLocation, isSafePath, config.maxRedirectAttempts, config.fallbackPath, navigate, clearSavedLocation]);

    /**
     * Redireciona após logout
     */
    const redirectAfterLogout = useCallback(() => {
        clearSavedLocation();
        navigate('/login', { replace: true });
    }, [navigate, clearSavedLocation]);

    /**
     * Redireciona para uma página específica com verificações de segurança
     */
    const redirectTo = useCallback((path: string, options?: { replace?: boolean; preserveCurrent?: boolean }) => {
        const { replace = false, preserveCurrent = false } = options || {};

        // Salvar localização atual se solicitado
        if (preserveCurrent && isAuthenticated) {
            saveCurrentLocation();
        }

        // Verificar se o caminho é seguro
        if (isSafePath(path)) {
            navigate(path, { replace });
        } else {
            console.warn(`Tentativa de redirecionamento para caminho inseguro: ${path}`);
            navigate(config.fallbackPath, { replace });
        }
    }, [isAuthenticated, saveCurrentLocation, isSafePath, navigate, config.fallbackPath]);

    /**
     * Redireciona baseado no papel do usuário
     */
    const redirectByRole = useCallback(() => {
        if (!isAuthenticated || !user) {
            redirectAfterLogout();
            return;
        }

        const roleBasedPaths = {
            admin: '/admin/dashboard',
            moderator: '/moderator/dashboard',
            user: '/dashboard'
        };

        const targetPath = roleBasedPaths[user.role as keyof typeof roleBasedPaths] || config.fallbackPath;
        
        if (isSafePath(targetPath)) {
            navigate(targetPath, { replace: true });
        } else {
            navigate(config.fallbackPath, { replace: true });
        }
    }, [isAuthenticated, user, redirectAfterLogout, isSafePath, navigate, config.fallbackPath]);

    /**
     * Verifica se deve redirecionar automaticamente na mudança de autenticação
     */
    useEffect(() => {
        const currentPath = location.pathname;

        // Se não está autenticado e está em página protegida
        if (!isAuthenticated && !config.blockedPaths.some(path => currentPath.startsWith(path))) {
            saveCurrentLocation();
            navigate('/login', { replace: true });
        }

        // Se está autenticado e está em página de login/registro
        if (isAuthenticated && config.blockedPaths.some(path => currentPath.startsWith(path))) {
            redirectAfterLogin();
        }
    }, [isAuthenticated, location.pathname, saveCurrentLocation, navigate, config.blockedPaths, redirectAfterLogin]);

    return {
        // Funções principais
        redirectAfterLogin,
        redirectAfterLogout,
        redirectTo,
        redirectByRole,
        
        // Gerenciamento de estado
        saveCurrentLocation,
        getSavedLocation,
        clearSavedLocation,
        
        // Utilitários
        isSafePath,
        
        // Estado atual
        currentPath: location.pathname,
        hasRedirectPending: getSavedLocation() !== null,
        redirectAttempts: redirectAttempts.current
    };
};

/**
 * Hook simplificado para uso em componentes de autenticação
 */
export const useAuthRedirect = () => {
    const { redirectAfterLogin, redirectAfterLogout, saveCurrentLocation } = useRedirect();
    
    return {
        handleLoginSuccess: redirectAfterLogin,
        handleLogout: redirectAfterLogout,
        saveLocation: saveCurrentLocation
    };
};