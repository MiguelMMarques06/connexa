/**
 * RouteGuard - Componente para verificações de segurança mais granulares
 * Usado em conjunto com ProtectedRoute para verificações específicas
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
    Box, 
    Typography, 
    Button, 
    Paper,
    Alert,
    Chip
} from '@mui/material';
import { 
    Security, 
    AccessTime, 
    Block,
    VpnKey,
    AdminPanelSettings
} from '@mui/icons-material';

export type PermissionLevel = 'user' | 'moderator' | 'admin' | 'super_admin';

export interface RoutePermission {
    level: PermissionLevel;
    resource?: string;
    action?: string;
    customCheck?: (user: any) => boolean;
}

interface RouteGuardProps {
    children: React.ReactNode;
    permissions: RoutePermission[];
    requireAll?: boolean; // true = AND, false = OR
    onUnauthorized?: () => void;
    fallbackPath?: string;
    showUnauthorizedMessage?: boolean;
}

const ROLE_HIERARCHY: Record<PermissionLevel, number> = {
    user: 1,
    moderator: 2,
    admin: 3,
    super_admin: 4
};

const RouteGuard: React.FC<RouteGuardProps> = ({
    children,
    permissions,
    requireAll = false,
    onUnauthorized,
    fallbackPath = '/dashboard',
    showUnauthorizedMessage = true
}) => {
    const { user, isAuthenticated } = useAuth();
    const location = useLocation();

    // Se não está autenticado, não deve estar aqui
    if (!isAuthenticated || !user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    /**
     * Verifica se o usuário tem o nível de permissão necessário
     */
    const hasPermissionLevel = (requiredLevel: PermissionLevel): boolean => {
        const userLevel = ROLE_HIERARCHY[user.role as PermissionLevel] || 0;
        const requiredLevelValue = ROLE_HIERARCHY[requiredLevel] || 0;
        return userLevel >= requiredLevelValue;
    };

    /**
     * Verifica uma permissão específica
     */
    const checkPermission = (permission: RoutePermission): boolean => {
        // Verificação customizada tem prioridade
        if (permission.customCheck) {
            return permission.customCheck(user);
        }

        // Verificação de nível
        return hasPermissionLevel(permission.level);
    };

    /**
     * Verifica todas as permissões
     */
    const checkAllPermissions = (): boolean => {
        if (requireAll) {
            // Todas as permissões devem ser atendidas (AND)
            return permissions.every(permission => checkPermission(permission));
        } else {
            // Pelo menos uma permissão deve ser atendida (OR)
            return permissions.some(permission => checkPermission(permission));
        }
    };

    const hasAccess = checkAllPermissions();

    if (!hasAccess) {
        // Chamar callback personalizado se definido
        if (onUnauthorized) {
            onUnauthorized();
        }

        if (!showUnauthorizedMessage) {
            return <Navigate to={fallbackPath} replace />;
        }

        // Mostrar mensagem de acesso negado
        return (
            <Box 
                display="flex" 
                justifyContent="center" 
                alignItems="center" 
                minHeight="100vh"
                p={3}
                bgcolor="grey.50"
            >
                <Paper 
                    elevation={6} 
                    sx={{ 
                        p: 5, 
                        maxWidth: 600, 
                        textAlign: 'center',
                        borderRadius: 3
                    }}
                >
                    <Security 
                        color="error" 
                        sx={{ fontSize: 80, mb: 3, opacity: 0.7 }} 
                    />
                    
                    <Typography variant="h4" gutterBottom color="error">
                        Acesso Restrito
                    </Typography>
                    
                    <Typography variant="body1" color="textSecondary" paragraph>
                        Você não possui as permissões necessárias para acessar esta área do sistema.
                    </Typography>

                    <Box my={3}>
                        <Alert severity="info" sx={{ textAlign: 'left' }}>
                            <Typography variant="subtitle2" gutterBottom>
                                <strong>Informações da Verificação:</strong>
                            </Typography>
                            
                            <Box mt={2}>
                                <Typography variant="body2">
                                    <strong>Usuário:</strong> {user.firstName} {user.lastName}
                                </Typography>
                                <Typography variant="body2">
                                    <strong>Papel Atual:</strong> 
                                    <Chip 
                                        label={user.role} 
                                        size="small" 
                                        sx={{ ml: 1 }}
                                        icon={<VpnKey />}
                                    />
                                </Typography>
                            </Box>

                            <Box mt={2}>
                                <Typography variant="body2" gutterBottom>
                                    <strong>Permissões Necessárias:</strong>
                                </Typography>
                                {permissions.map((permission, index) => (
                                    <Box key={index} display="flex" alignItems="center" gap={1} mt={1}>
                                        <AdminPanelSettings fontSize="small" />
                                        <Typography variant="body2">
                                            Nível: {permission.level}
                                            {permission.resource && ` | Recurso: ${permission.resource}`}
                                            {permission.action && ` | Ação: ${permission.action}`}
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>

                            <Box mt={2}>
                                <Typography variant="body2">
                                    <strong>Tipo de Verificação:</strong> {requireAll ? 'Todas as permissões necessárias (AND)' : 'Pelo menos uma permissão necessária (OR)'}
                                </Typography>
                            </Box>
                        </Alert>
                    </Box>

                    <Box display="flex" gap={2} justifyContent="center" flexWrap="wrap">
                        <Button 
                            variant="contained" 
                            onClick={() => window.location.href = fallbackPath}
                            startIcon={<Block />}
                        >
                            Voltar
                        </Button>
                        
                        <Button 
                            variant="outlined" 
                            onClick={() => window.location.href = '/profile'}
                            startIcon={<AccessTime />}
                        >
                            Ver Meu Perfil
                        </Button>
                    </Box>

                    <Box mt={3}>
                        <Typography variant="caption" color="textSecondary">
                            Se você acredita que deveria ter acesso a esta área, 
                            entre em contato com o administrador do sistema.
                        </Typography>
                    </Box>
                </Paper>
            </Box>
        );
    }

    // Se passou na verificação, renderizar o conteúdo
    return <>{children}</>;
};

// Componentes de conveniência para papéis específicos
export const AdminGuard: React.FC<Omit<RouteGuardProps, 'permissions'>> = (props) => (
    <RouteGuard 
        {...props} 
        permissions={[{ level: 'admin' }]} 
    />
);

export const ModeratorGuard: React.FC<Omit<RouteGuardProps, 'permissions'>> = (props) => (
    <RouteGuard 
        {...props} 
        permissions={[{ level: 'moderator' }]} 
    />
);

export const SuperAdminGuard: React.FC<Omit<RouteGuardProps, 'permissions'>> = (props) => (
    <RouteGuard 
        {...props} 
        permissions={[{ level: 'super_admin' }]} 
    />
);

// Hook para verificar permissões em componentes
export const usePermissions = () => {
    const { user } = useAuth();

    const hasPermission = (requiredLevel: PermissionLevel): boolean => {
        if (!user) return false;
        const userLevel = ROLE_HIERARCHY[user.role as PermissionLevel] || 0;
        const requiredLevelValue = ROLE_HIERARCHY[requiredLevel] || 0;
        return userLevel >= requiredLevelValue;
    };

    const checkCustomPermission = (checkFunction: (user: any) => boolean): boolean => {
        if (!user) return false;
        return checkFunction(user);
    };

    return {
        hasPermission,
        checkCustomPermission,
        userRole: user?.role,
        userLevel: user ? ROLE_HIERARCHY[user.role as PermissionLevel] || 0 : 0
    };
};

export default RouteGuard;