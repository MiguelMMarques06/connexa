import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
    setSecureToken, 
    getSecureToken, 
    setSecureUser, 
    getSecureUser, 
    clearAllAuthData,
    isTokenExpired 
} from '../utils/secureStorage';
import { useTokenManager } from '../hooks/useTokenManager';

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

interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    login: (user: User, token: string) => void;
    logout: () => void;
    updateUser: (user: User) => void;
    isLoading: boolean;
}

interface AuthProviderProps {
    children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    }
    return context;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Configurar gerenciamento automático de tokens
    const tokenManager = useTokenManager({
        onTokenExpired: () => {
            console.warn('Token expirado, fazendo logout automático');
            logout();
        },
        onTokenRefreshed: (newToken: string) => {
            console.log('Token renovado automaticamente');
            setToken(newToken);
            setSecureToken(newToken);
        },
        onError: (error: string) => {
            console.error('Erro no gerenciamento de token:', error);
        }
    });

    useEffect(() => {
        // Verificar se há dados salvos no armazenamento seguro na inicialização
        const initializeAuth = async () => {
            try {
                const savedToken = getSecureToken();
                const savedUser = getSecureUser();

                if (savedToken && savedUser) {
                    // Verificar se o token não está expirado
                    if (!isTokenExpired(savedToken)) {
                        setToken(savedToken);
                        setUser(savedUser);
                        
                        // Iniciar monitoramento automático
                        tokenManager.startTokenMonitoring();
                        
                        console.log('Sessão restaurada com segurança');
                    } else {
                        console.warn('Token expirado encontrado durante inicialização');
                        clearAllAuthData();
                    }
                }
            } catch (error) {
                console.error('Erro ao carregar dados salvos:', error);
                clearAllAuthData();
            } finally {
                setIsLoading(false);
            }
        };

        initializeAuth();

        // Cleanup quando o componente for desmontado
        return () => {
            tokenManager.stopTokenMonitoring();
        };
    }, [tokenManager]);

    const login = (userData: User, userToken: string) => {
        try {
            setUser(userData);
            setToken(userToken);
            
            // Salvar no armazenamento seguro
            setSecureToken(userToken);
            setSecureUser(userData);
            
            // Iniciar monitoramento automático
            tokenManager.startTokenMonitoring();
            
            console.log('Login realizado com armazenamento seguro');
        } catch (error) {
            console.error('Erro durante login:', error);
            throw new Error('Falha ao salvar dados de autenticação');
        }
    };

    const logout = () => {
        try {
            setUser(null);
            setToken(null);
            
            // Parar monitoramento
            tokenManager.stopTokenMonitoring();
            
            // Remover do armazenamento seguro
            clearAllAuthData();
            
            console.log('Logout realizado com limpeza segura');
        } catch (error) {
            console.error('Erro durante logout:', error);
        }
    };

    const updateUser = (userData: User) => {
        try {
            setUser(userData);
            setSecureUser(userData);
            console.log('Dados do usuário atualizados com segurança');
        } catch (error) {
            console.error('Erro ao atualizar dados do usuário:', error);
        }
    };

    const isAuthenticated = !!user && !!token;

    const value: AuthContextType = {
        user,
        token,
        isAuthenticated,
        login,
        logout,
        updateUser,
        isLoading,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};