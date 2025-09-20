/**
 * Página de Carregamento
 */

import React from 'react';
import {
    Box,
    Typography,
    CircularProgress,
    LinearProgress,
    Paper,
    Container
} from '@mui/material';
import { Wifi, WifiOff } from '@mui/icons-material';

interface LoadingPageProps {
    message?: string;
    showProgress?: boolean;
    progress?: number;
    variant?: 'minimal' | 'detailed' | 'fullscreen';
    error?: boolean;
}

const LoadingPage: React.FC<LoadingPageProps> = ({
    message = 'Carregando...',
    showProgress = false,
    progress = 0,
    variant = 'fullscreen',
    error = false
}) => {
    const renderMinimal = () => (
        <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            gap={2}
            p={3}
        >
            <CircularProgress size={24} />
            <Typography variant="body2" color="textSecondary">
                {message}
            </Typography>
        </Box>
    );

    const renderDetailed = () => (
        <Paper elevation={3} sx={{ p: 4, borderRadius: 3, maxWidth: 400, width: '100%' }}>
            <Box textAlign="center">
                {error ? (
                    <WifiOff sx={{ fontSize: 60, color: 'error.main', mb: 2 }} />
                ) : (
                    <CircularProgress size={60} sx={{ mb: 2 }} />
                )}
                
                <Typography variant="h6" gutterBottom color={error ? 'error' : 'primary'}>
                    {error ? 'Erro de Conexão' : 'Carregando'}
                </Typography>
                
                <Typography variant="body2" color="textSecondary" paragraph>
                    {error 
                        ? 'Verificando conexão com o servidor...'
                        : message
                    }
                </Typography>

                {showProgress && !error && (
                    <Box mt={3}>
                        <LinearProgress 
                            variant={progress > 0 ? 'determinate' : 'indeterminate'} 
                            value={progress}
                            sx={{ borderRadius: 1, height: 6 }}
                        />
                        {progress > 0 && (
                            <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                                {Math.round(progress)}% concluído
                            </Typography>
                        )}
                    </Box>
                )}

                {error && (
                    <Box mt={3}>
                        <Typography variant="caption" color="textSecondary">
                            Tentando reconectar automaticamente...
                        </Typography>
                    </Box>
                )}
            </Box>
        </Paper>
    );

    const renderFullscreen = () => (
        <Container maxWidth="sm">
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
                    elevation={6}
                    sx={{
                        p: 6,
                        borderRadius: 4,
                        width: '100%',
                        maxWidth: 500,
                        background: error 
                            ? 'linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)'
                            : 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)'
                    }}
                >
                    {/* Animação de Loading */}
                    <Box mb={4}>
                        {error ? (
                            <WifiOff
                                sx={{
                                    fontSize: 100,
                                    color: 'error.main',
                                    opacity: 0.8,
                                    animation: 'pulse 2s infinite'
                                }}
                            />
                        ) : (
                            <Box position="relative" display="inline-flex">
                                <CircularProgress
                                    size={100}
                                    thickness={3}
                                    sx={{ color: 'primary.main' }}
                                />
                                <CircularProgress
                                    size={80}
                                    thickness={2}
                                    sx={{
                                        color: 'primary.light',
                                        position: 'absolute',
                                        top: 10,
                                        left: 10,
                                        animation: 'spin 3s linear infinite reverse'
                                    }}
                                />
                                <Box
                                    sx={{
                                        top: 0,
                                        left: 0,
                                        bottom: 0,
                                        right: 0,
                                        position: 'absolute',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <Wifi sx={{ fontSize: 40, color: 'primary.main' }} />
                                </Box>
                            </Box>
                        )}
                    </Box>

                    {/* Título */}
                    <Typography 
                        variant="h4" 
                        gutterBottom 
                        color={error ? 'error' : 'primary'}
                        fontWeight="medium"
                    >
                        {error ? 'Problema de Conexão' : 'Connexa'}
                    </Typography>

                    {/* Mensagem */}
                    <Typography variant="h6" color="textSecondary" paragraph>
                        {error 
                            ? 'Não foi possível conectar ao servidor'
                            : message
                        }
                    </Typography>

                    {/* Submensagem */}
                    <Typography variant="body2" color="textSecondary" paragraph>
                        {error 
                            ? 'Verifique sua conexão com a internet e tente novamente'
                            : 'Por favor, aguarde enquanto carregamos o sistema'
                        }
                    </Typography>

                    {/* Barra de Progresso */}
                    {showProgress && !error && (
                        <Box mt={4}>
                            <LinearProgress 
                                variant={progress > 0 ? 'determinate' : 'indeterminate'} 
                                value={progress}
                                sx={{ 
                                    borderRadius: 2, 
                                    height: 8,
                                    backgroundColor: 'rgba(0,0,0,0.1)'
                                }}
                            />
                            {progress > 0 && (
                                <Typography 
                                    variant="body2" 
                                    color="textSecondary" 
                                    sx={{ mt: 2 }}
                                >
                                    Carregando... {Math.round(progress)}%
                                </Typography>
                            )}
                        </Box>
                    )}

                    {/* Indicador de reconexão para erro */}
                    {error && (
                        <Box mt={4}>
                            <LinearProgress 
                                color="error"
                                sx={{ 
                                    borderRadius: 2, 
                                    height: 4,
                                    opacity: 0.6
                                }}
                            />
                            <Typography 
                                variant="caption" 
                                color="textSecondary" 
                                sx={{ mt: 1, display: 'block' }}
                            >
                                Tentativa de reconexão em andamento...
                            </Typography>
                        </Box>
                    )}

                    {/* Footer com informações técnicas */}
                    <Box mt={4} pt={3} borderTop="1px solid rgba(0,0,0,0.1)">
                        <Typography variant="caption" color="textSecondary">
                            Sistema de Autenticação Seguro
                        </Typography>
                        <br />
                        <Typography variant="caption" color="textSecondary">
                            Versão 1.0.0 - {new Date().getFullYear()}
                        </Typography>
                    </Box>
                </Paper>
            </Box>
        </Container>
    );

    // CSS customizado para animações
    const styles = (
        <style>
            {`
                @keyframes pulse {
                    0% { opacity: 1; }
                    50% { opacity: 0.5; }
                    100% { opacity: 1; }
                }
                
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}
        </style>
    );

    return (
        <>
            {styles}
            {variant === 'minimal' && renderMinimal()}
            {variant === 'detailed' && (
                <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    minHeight="50vh"
                    p={3}
                >
                    {renderDetailed()}
                </Box>
            )}
            {variant === 'fullscreen' && renderFullscreen()}
        </>
    );
};

export default LoadingPage;