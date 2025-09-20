import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { CircularProgress, Box, Typography, Paper, Button } from '@mui/material';
import { Lock, Warning, Home } from '@mui/icons-material';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requireAuth?: boolean;
    allowedRoles?: string[];
    redirectTo?: string;
    fallbackComponent?: React.ReactElement;
    requireActiveUser?: boolean;
    customPermissionCheck?: (user: any) => boolean;
}

const ProtectedRoute = ({ 
    children, 
    requireAuth = true, 
    allowedRoles = [],
    redirectTo = '/login',
    fallbackComponent,
    requireActiveUser = true,
    customPermissionCheck
}: ProtectedRouteProps): React.ReactElement | null => {
    const { user, isAuthenticated, isLoading } = useAuth();
    const location = useLocation();

    // Componente de carregamento melhorado
    if (isLoading) {
        return (
            <Box 
                display="flex" 
                flexDirection="column"
                justifyContent="center" 
                alignItems="center" 
                minHeight="100vh"
                gap={2}
            >
                <CircularProgress size={60} />
                <Typography variant="body1" color="textSecondary">
                    Verificando autenticação...
                </Typography>
            </Box>
        );
    }

    // Usuário não autenticado tentando acessar rota protegida
    if (requireAuth && !isAuthenticated) {
        return <Navigate to={redirectTo} state={{ from: location }} replace />;
    }

    // Usuário autenticado tentando acessar páginas públicas (login/register)
    if (!requireAuth && isAuthenticated) {
        // Se veio de uma URL específica, redirecionar para lá
        const from = location.state?.from?.pathname || '/dashboard';
        return <Navigate to={from} replace />;
    }

    // Se chegou aqui e não requer auth, ou não está autenticado, mostrar conteúdo
    if (!requireAuth || !isAuthenticated) {
        return <>{children}</>;
    }

    // A partir daqui, sabemos que o usuário está autenticado e a rota requer auth

    // Verificar se o usuário está ativo
    if (requireActiveUser && user && !user.isActive) {
        return fallbackComponent || (
            <Box 
                display="flex" 
                justifyContent="center" 
                alignItems="center" 
                minHeight="100vh"
                p={3}
            >
                <Paper elevation={3} sx={{ p: 4, maxWidth: 500, textAlign: 'center' }}>
                    <Warning color="warning" sx={{ fontSize: 60, mb: 2 }} />
                    <Typography variant="h5" gutterBottom>
                        Conta Inativa
                    </Typography>
                    <Typography variant="body1" color="textSecondary" paragraph>
                        Sua conta está inativa. Entre em contato com o administrador para reativá-la.
                    </Typography>
                    <Button 
                        variant="outlined" 
                        startIcon={<Home />}
                        onClick={() => window.location.href = '/dashboard'}
                    >
                        Voltar ao Dashboard
                    </Button>
                </Paper>
            </Box>
        );
    }

    // Verificar papéis/permissões se especificados
    if (allowedRoles.length > 0 && user) {
        const hasRequiredRole = allowedRoles.includes(user.role);
        
        if (!hasRequiredRole) {
            return fallbackComponent || (
                <Box 
                    display="flex" 
                    justifyContent="center" 
                    alignItems="center" 
                    minHeight="100vh"
                    p={3}
                >
                    <Paper elevation={3} sx={{ p: 4, maxWidth: 500, textAlign: 'center' }}>
                        <Lock color="error" sx={{ fontSize: 60, mb: 2 }} />
                        <Typography variant="h5" gutterBottom>
                            Acesso Negado
                        </Typography>
                        <Typography variant="body1" color="textSecondary" paragraph>
                            Você não tem permissão para acessar esta página.
                        </Typography>
                        <Typography variant="body2" color="textSecondary" paragraph>
                            Papel necessário: {allowedRoles.join(', ')}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" paragraph>
                            Seu papel atual: {user.role}
                        </Typography>
                        <Button 
                            variant="outlined" 
                            startIcon={<Home />}
                            onClick={() => window.location.href = '/dashboard'}
                        >
                            Voltar ao Dashboard
                        </Button>
                    </Paper>
                </Box>
            );
        }
    }

    // Verificação customizada de permissão
    if (customPermissionCheck && user) {
        const hasPermission = customPermissionCheck(user);
        
        if (!hasPermission) {
            return fallbackComponent || (
                <Box 
                    display="flex" 
                    justifyContent="center" 
                    alignItems="center" 
                    minHeight="100vh"
                    p={3}
                >
                    <Paper elevation={3} sx={{ p: 4, maxWidth: 500, textAlign: 'center' }}>
                        <Lock color="error" sx={{ fontSize: 60, mb: 2 }} />
                        <Typography variant="h5" gutterBottom>
                            Permissão Insuficiente
                        </Typography>
                        <Typography variant="body1" color="textSecondary" paragraph>
                            Você não atende aos critérios necessários para acessar esta página.
                        </Typography>
                        <Button 
                            variant="outlined" 
                            startIcon={<Home />}
                            onClick={() => window.location.href = '/dashboard'}
                        >
                            Voltar ao Dashboard
                        </Button>
                    </Paper>
                </Box>
            );
        }
    }

    // Se passou por todas as verificações, renderizar o conteúdo
    return <>{children}</>;
};

export default ProtectedRoute;