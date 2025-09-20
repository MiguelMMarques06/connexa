/**
 * Página 404 - Não Encontrado
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Button,
    Paper,
    Container,
    Chip
} from '@mui/material';
import {
    Home,
    ArrowBack,
    ErrorOutline
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const NotFoundPage: React.FC = () => {
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();

    const handleGoHome = () => {
        if (isAuthenticated) {
            navigate('/dashboard');
        } else {
            navigate('/login');
        }
    };

    const handleGoBack = () => {
        navigate(-1);
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
                        maxWidth: 600,
                        width: '100%',
                        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
                    }}
                >
                    {/* Ícone e Código de Erro */}
                    <Box mb={4}>
                        <ErrorOutline
                            sx={{
                                fontSize: 120,
                                color: 'primary.main',
                                opacity: 0.8,
                                mb: 2
                            }}
                        />
                        <Typography
                            variant="h1"
                            sx={{
                                fontSize: '8rem',
                                fontWeight: 'bold',
                                color: 'primary.main',
                                opacity: 0.3,
                                lineHeight: 1,
                                mb: 2
                            }}
                        >
                            404
                        </Typography>
                    </Box>

                    {/* Título e Descrição */}
                    <Typography variant="h4" gutterBottom color="primary" fontWeight="medium">
                        Página Não Encontrada
                    </Typography>
                    
                    <Typography variant="body1" color="textSecondary" paragraph>
                        Oops! A página que você está procurando não existe ou foi movida.
                    </Typography>

                    <Typography variant="body2" color="textSecondary" paragraph>
                        Verifique se o endereço está correto ou use os botões abaixo para navegar.
                    </Typography>

                    {/* Informações do Usuário */}
                    {isAuthenticated && user && (
                        <Box my={3}>
                            <Chip
                                label={`Logado como: ${user.firstName} ${user.lastName}`}
                                color="primary"
                                variant="outlined"
                                size="small"
                            />
                        </Box>
                    )}

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
                            {isAuthenticated ? 'Dashboard' : 'Ir para Login'}
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
                    </Box>

                    {/* Links Úteis */}
                    <Box mt={4}>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                            Páginas populares:
                        </Typography>
                        
                        <Box display="flex" gap={2} justifyContent="center" flexWrap="wrap">
                            {isAuthenticated ? (
                                <>
                                    <Button
                                        size="small"
                                        onClick={() => navigate('/dashboard')}
                                    >
                                        Dashboard
                                    </Button>
                                    <Button
                                        size="small"
                                        onClick={() => navigate('/profile')}
                                    >
                                        Perfil
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button
                                        size="small"
                                        onClick={() => navigate('/login')}
                                    >
                                        Login
                                    </Button>
                                    <Button
                                        size="small"
                                        onClick={() => navigate('/register')}
                                    >
                                        Cadastro
                                    </Button>
                                </>
                            )}
                        </Box>
                    </Box>

                    {/* Informações Técnicas */}
                    <Box mt={4} pt={3} borderTop="1px solid rgba(0,0,0,0.1)">
                        <Typography variant="caption" color="textSecondary">
                            Erro HTTP 404 - Recurso não encontrado
                        </Typography>
                        <br />
                        <Typography variant="caption" color="textSecondary">
                            URL atual: {window.location.pathname}
                        </Typography>
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
};

export default NotFoundPage;