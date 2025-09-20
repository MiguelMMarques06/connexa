/**
 * Página de Acesso Negado - 403 Unauthorized
 */

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Box,
    Typography,
    Button,
    Paper,
    Container,
    Alert,
    Chip,
    Divider
} from '@mui/material';
import {
    Home,
    ArrowBack,
    Security,
    ContactSupport,
    VpnKey
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const UnauthorizedPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, isAuthenticated } = useAuth();

    const handleGoHome = () => {
        navigate('/dashboard');
    };

    const handleGoBack = () => {
        navigate(-1);
    };

    const handleContactSupport = () => {
        // Implementar lógica de contato com suporte
        const subject = encodeURIComponent('Solicitação de Acesso - Connexa');
        const body = encodeURIComponent(
            `Olá,\n\nEstou tentando acessar a página: ${location.pathname}\n` +
            `Meu usuário: ${user?.email || 'N/A'}\n` +
            `Papel atual: ${user?.role || 'N/A'}\n\n` +
            `Por favor, verifique minhas permissões.\n\nObrigado!`
        );
        
        window.location.href = `mailto:suporte@connexa.com?subject=${subject}&body=${body}`;
    };

    return (
        <Container maxWidth="md">
            <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                minHeight="100vh"
                textAlign="center"
                py={4}
            >
                <Paper
                    elevation={8}
                    sx={{
                        p: 6,
                        borderRadius: 4,
                        maxWidth: 700,
                        width: '100%',
                        background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)'
                    }}
                >
                    {/* Ícone e Código de Erro */}
                    <Box mb={4}>
                        <Security
                            sx={{
                                fontSize: 120,
                                color: 'error.main',
                                opacity: 0.8,
                                mb: 2
                            }}
                        />
                        <Typography
                            variant="h1"
                            sx={{
                                fontSize: '6rem',
                                fontWeight: 'bold',
                                color: 'error.main',
                                opacity: 0.3,
                                lineHeight: 1,
                                mb: 2
                            }}
                        >
                            403
                        </Typography>
                    </Box>

                    {/* Título e Descrição */}
                    <Typography variant="h4" gutterBottom color="error" fontWeight="medium">
                        Acesso Negado
                    </Typography>
                    
                    <Typography variant="body1" color="textSecondary" paragraph>
                        Você não possui permissão para acessar esta página ou recurso.
                    </Typography>

                    {/* Informações do Usuário */}
                    {isAuthenticated && user ? (
                        <Alert severity="info" sx={{ my: 3, textAlign: 'left' }}>
                            <Typography variant="subtitle2" gutterBottom>
                                <strong>Informações da Sua Conta:</strong>
                            </Typography>
                            
                            <Box mt={2} display="flex" flexDirection="column" gap={1}>
                                <Box display="flex" alignItems="center" gap={1}>
                                    <Typography variant="body2">
                                        <strong>Usuário:</strong> {user.firstName} {user.lastName}
                                    </Typography>
                                </Box>
                                
                                <Box display="flex" alignItems="center" gap={1}>
                                    <Typography variant="body2">
                                        <strong>Email:</strong> {user.email}
                                    </Typography>
                                </Box>
                                
                                <Box display="flex" alignItems="center" gap={1}>
                                    <Typography variant="body2">
                                        <strong>Papel Atual:</strong>
                                    </Typography>
                                    <Chip
                                        label={user.role}
                                        size="small"
                                        icon={<VpnKey />}
                                        color={user.role === 'admin' ? 'success' : 'default'}
                                    />
                                </Box>
                                
                                <Box display="flex" alignItems="center" gap={1}>
                                    <Typography variant="body2">
                                        <strong>Status:</strong>
                                    </Typography>
                                    <Chip
                                        label={user.isActive ? 'Ativo' : 'Inativo'}
                                        size="small"
                                        color={user.isActive ? 'success' : 'error'}
                                    />
                                </Box>
                            </Box>
                        </Alert>
                    ) : (
                        <Alert severity="warning" sx={{ my: 3 }}>
                            <Typography variant="body2">
                                Você não está autenticado. Faça login para acessar esta página.
                            </Typography>
                        </Alert>
                    )}

                    {/* Informações da Tentativa de Acesso */}
                    <Box my={3}>
                        <Typography variant="body2" color="textSecondary">
                            <strong>Página solicitada:</strong> {location.pathname}
                        </Typography>
                        {location.search && (
                            <Typography variant="body2" color="textSecondary">
                                <strong>Parâmetros:</strong> {location.search}
                            </Typography>
                        )}
                    </Box>

                    <Divider sx={{ my: 3 }} />

                    {/* Possíveis Soluções */}
                    <Box textAlign="left" my={3}>
                        <Typography variant="subtitle1" gutterBottom color="primary">
                            <strong>Possíveis soluções:</strong>
                        </Typography>
                        <ul style={{ margin: 0, paddingLeft: '20px' }}>
                            <li>
                                <Typography variant="body2" color="textSecondary">
                                    Verifique se você está logado com a conta correta
                                </Typography>
                            </li>
                            <li>
                                <Typography variant="body2" color="textSecondary">
                                    Solicite permissão ao administrador do sistema
                                </Typography>
                            </li>
                            <li>
                                <Typography variant="body2" color="textSecondary">
                                    Entre em contato com o suporte técnico
                                </Typography>
                            </li>
                            <li>
                                <Typography variant="body2" color="textSecondary">
                                    Aguarde até que suas permissões sejam atualizadas
                                </Typography>
                            </li>
                        </ul>
                    </Box>

                    {/* Botões de Ação */}
                    <Box
                        display="flex"
                        gap={2}
                        justifyContent="center"
                        flexWrap="wrap"
                        mt={4}
                    >
                        <Button
                            variant="contained"
                            size="large"
                            startIcon={<Home />}
                            onClick={handleGoHome}
                            sx={{ minWidth: 160 }}
                        >
                            Dashboard
                        </Button>

                        <Button
                            variant="outlined"
                            size="large"
                            startIcon={<ArrowBack />}
                            onClick={handleGoBack}
                            sx={{ minWidth: 160 }}
                        >
                            Voltar
                        </Button>

                        <Button
                            variant="outlined"
                            size="large"
                            startIcon={<ContactSupport />}
                            onClick={handleContactSupport}
                            sx={{ minWidth: 160 }}
                            color="info"
                        >
                            Contatar Suporte
                        </Button>
                    </Box>

                    {/* Informações Técnicas */}
                    <Box mt={4} pt={3} borderTop="1px solid rgba(0,0,0,0.1)">
                        <Typography variant="caption" color="textSecondary">
                            Erro HTTP 403 - Forbidden Access
                        </Typography>
                        <br />
                        <Typography variant="caption" color="textSecondary">
                            Timestamp: {new Date().toLocaleString('pt-BR')}
                        </Typography>
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
};

export default UnauthorizedPage;