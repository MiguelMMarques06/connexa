/**
 * Página de Administração - Exemplo de uso do sistema de proteção de rotas
 */

import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    CardActions,
    Button,
    Container,
    Breadcrumbs,
    Link,
    Chip,
    Alert
} from '@mui/material';
import {
    People,
    Settings,
    Assessment,
    Security,
    Home
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../components/RouteGuard';

const AdminDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { hasPermission, userRole } = usePermissions();

    const adminFeatures = [
        {
            title: 'Gerenciar Usuários',
            description: 'Visualizar, editar e gerenciar contas de usuários',
            icon: <People fontSize="large" />,
            path: '/admin/users',
            requiredLevel: 'admin' as const,
            color: 'primary'
        },
        {
            title: 'Configurações do Sistema',
            description: 'Configurar parâmetros globais do sistema',
            icon: <Settings fontSize="large" />,
            path: '/admin/system',
            requiredLevel: 'super_admin' as const,
            color: 'secondary'
        },
        {
            title: 'Relatórios',
            description: 'Visualizar relatórios e análises',
            icon: <Assessment fontSize="large" />,
            path: '/admin/reports',
            requiredLevel: 'admin' as const,
            color: 'success'
        },
        {
            title: 'Logs de Segurança',
            description: 'Monitorar atividades e logs de segurança',
            icon: <Security fontSize="large" />,
            path: '/admin/logs',
            requiredLevel: 'super_admin' as const,
            color: 'warning'
        }
    ];

    return (
        <Container maxWidth="lg">
            <Box py={4}>
                {/* Breadcrumb */}
                <Breadcrumbs sx={{ mb: 3 }}>
                    <Link
                        component="button"
                        onClick={() => navigate('/dashboard')}
                        sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                    >
                        <Home fontSize="inherit" />
                        Dashboard
                    </Link>
                    <Typography color="text.primary">Administração</Typography>
                </Breadcrumbs>

                {/* Header */}
                <Box mb={4}>
                    <Typography variant="h3" gutterBottom color="primary" fontWeight="bold">
                        Painel de Administração
                    </Typography>
                    <Typography variant="body1" color="text.secondary" paragraph>
                        Gerencie configurações e recursos do sistema
                    </Typography>
                    
                    {/* Informações do usuário */}
                    <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
                        <Chip
                            label={`${user?.firstName} ${user?.lastName}`}
                            color="primary"
                            variant="outlined"
                        />
                        <Chip
                            label={userRole}
                            color="secondary"
                            icon={<Security />}
                        />
                    </Box>
                </Box>

                {/* Aviso de permissões */}
                <Alert severity="info" sx={{ mb: 4 }}>
                    <Typography variant="body2">
                        <strong>Nota:</strong> Algumas funcionalidades podem não estar disponíveis 
                        dependendo do seu nível de acesso. Cartões desabilitados indicam permissões insuficientes.
                    </Typography>
                </Alert>

                {/* Grid de funcionalidades */}
                <Grid container spacing={3}>
                    {adminFeatures.map((feature, index) => {
                        const hasAccess = hasPermission(feature.requiredLevel);
                        
                        return (
                            <Grid size={{ xs: 12, sm: 6, md: 6, lg: 3 }} key={index}>
                                <Card
                                    sx={{
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        opacity: hasAccess ? 1 : 0.6,
                                        transition: 'all 0.3s ease',
                                        '&:hover': hasAccess ? {
                                            transform: 'translateY(-4px)',
                                            boxShadow: 4
                                        } : {}
                                    }}
                                >
                                    <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                                        <Box
                                            sx={{
                                                color: hasAccess ? `${feature.color}.main` : 'text.disabled',
                                                mb: 2
                                            }}
                                        >
                                            {feature.icon}
                                        </Box>
                                        
                                        <Typography 
                                            variant="h6" 
                                            gutterBottom 
                                            color={hasAccess ? 'text.primary' : 'text.disabled'}
                                        >
                                            {feature.title}
                                        </Typography>
                                        
                                        <Typography 
                                            variant="body2" 
                                            color="text.secondary"
                                            paragraph
                                        >
                                            {feature.description}
                                        </Typography>

                                        <Chip
                                            label={`Requer: ${feature.requiredLevel}`}
                                            size="small"
                                            color={hasAccess ? 'success' : 'default'}
                                            variant={hasAccess ? 'filled' : 'outlined'}
                                        />
                                    </CardContent>
                                    
                                    <CardActions sx={{ justifyContent: 'center', p: 2 }}>
                                        <Button
                                            variant={hasAccess ? 'contained' : 'outlined'}
                                            color={feature.color as any}
                                            disabled={!hasAccess}
                                            onClick={() => hasAccess && navigate(feature.path)}
                                            size="small"
                                        >
                                            {hasAccess ? 'Acessar' : 'Sem Permissão'}
                                        </Button>
                                    </CardActions>
                                </Card>
                            </Grid>
                        );
                    })}
                </Grid>

                {/* Informações de debug */}
                <Box mt={6} p={3} bgcolor="grey.50" borderRadius={2}>
                    <Typography variant="h6" gutterBottom>
                        Informações de Debug (Desenvolvimento)
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        <strong>Usuário atual:</strong> {user?.email}<br />
                        <strong>Papel:</strong> {userRole}<br />
                        <strong>Ativo:</strong> {user?.isActive ? 'Sim' : 'Não'}<br />
                        <strong>Permissões:</strong><br />
                        - Admin: {hasPermission('admin') ? '✅' : '❌'}<br />
                        - Super Admin: {hasPermission('super_admin') ? '✅' : '❌'}<br />
                        - Moderador: {hasPermission('moderator') ? '✅' : '❌'}
                    </Typography>
                </Box>
            </Box>
        </Container>
    );
};

const AdminUsers: React.FC = () => (
    <Container maxWidth="lg">
        <Box py={4}>
            <Typography variant="h4" gutterBottom>
                Gerenciar Usuários
            </Typography>
            <Alert severity="info">
                Esta é uma página de exemplo. Aqui você implementaria a gestão completa de usuários.
            </Alert>
        </Box>
    </Container>
);

const AdminSystem: React.FC = () => (
    <Container maxWidth="lg">
        <Box py={4}>
            <Typography variant="h4" gutterBottom>
                Configurações do Sistema
            </Typography>
            <Alert severity="warning">
                Área restrita para Super Administradores. Configurações críticas do sistema.
            </Alert>
        </Box>
    </Container>
);

const AdminReports: React.FC = () => (
    <Container maxWidth="lg">
        <Box py={4}>
            <Typography variant="h4" gutterBottom>
                Relatórios
            </Typography>
            <Alert severity="info">
                Relatórios e análises do sistema.
            </Alert>
        </Box>
    </Container>
);

const AdminLogs: React.FC = () => (
    <Container maxWidth="lg">
        <Box py={4}>
            <Typography variant="h4" gutterBottom>
                Logs de Segurança
            </Typography>
            <Alert severity="error">
                Logs críticos de segurança - Apenas Super Administradores.
            </Alert>
        </Box>
    </Container>
);

// Componente principal que rende as rotas
const AdminPage: React.FC = () => {
    return (
        <Routes>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="system" element={<AdminSystem />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="logs" element={<AdminLogs />} />
        </Routes>
    );
};

export default AdminPage;