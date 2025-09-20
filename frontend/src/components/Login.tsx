import React, { useState } from 'react';
import {
    Container,
    Paper,
    TextField,
    Button,
    Typography,
    Box,
    Alert,
    InputAdornment,
    IconButton,
    Link,
    Divider,
    CircularProgress
} from '@mui/material';
import {
    Visibility,
    VisibilityOff,
    Email,
    Lock,
    LoginOutlined
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useAuthRedirect } from '../hooks/useRedirect';
import { loginUser } from '../services/api';

const validationSchema = yup.object({
    email: yup
        .string()
        .email('Digite um email válido')
        .required('Email é obrigatório'),
    password: yup
        .string()
        .min(6, 'Senha deve ter pelo menos 6 caracteres')
        .required('Senha é obrigatória'),
});

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const { handleLoginSuccess } = useAuthRedirect();
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const formik = useFormik({
        initialValues: {
            email: '',
            password: '',
        },
        validationSchema: validationSchema,
        onSubmit: async (values) => {
            setLoading(true);
            setError('');
            
            try {
                const response = await loginUser(values);
                
                if (response.success && response.user && response.token) {
                    // Armazenar dados do usuário no contexto
                    login(response.user, response.token);
                    
                    // Redirecionar usando o hook de redirecionamento inteligente
                    handleLoginSuccess();
                } else {
                    setError(response.error || 'Erro ao fazer login');
                }
            } catch (err: any) {
                console.error('Login error:', err);
                setError(
                    err.response?.data?.details?.[0] || 
                    err.response?.data?.error || 
                    'Erro interno do servidor. Tente novamente.'
                );
            } finally {
                setLoading(false);
            }
        },
    });

    const handleClickShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
    };

    return (
        <Container component="main" maxWidth="sm">
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    minHeight: '80vh',
                }}
            >
                <Paper
                    elevation={6}
                    sx={{
                        padding: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        width: '100%',
                        borderRadius: 3,
                    }}
                >
                    {/* Logo/Header */}
                    <Box sx={{ mb: 3, textAlign: 'center' }}>
                        <LoginOutlined 
                            sx={{ 
                                fontSize: 48, 
                                color: 'primary.main',
                                mb: 1 
                            }} 
                        />
                        <Typography component="h1" variant="h4" fontWeight="bold">
                            Connexa
                        </Typography>
                        <Typography variant="h6" color="text.secondary">
                            Conectando estudantes pelo mundo
                        </Typography>
                    </Box>

                    <Divider sx={{ width: '100%', mb: 3 }} />

                    {/* Form */}
                    <Box component="form" onSubmit={formik.handleSubmit} sx={{ width: '100%' }}>
                        <Typography variant="h5" component="h2" gutterBottom align="center">
                            Entrar na sua conta
                        </Typography>

                        {error && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {error}
                            </Alert>
                        )}

                        <TextField
                            fullWidth
                            id="email"
                            name="email"
                            label="Email"
                            type="email"
                            value={formik.values.email}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.email && Boolean(formik.errors.email)}
                            helperText={formik.touched.email && formik.errors.email}
                            margin="normal"
                            autoComplete="email"
                            autoFocus
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Email color="action" />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    '&:hover fieldset': {
                                        borderColor: 'primary.main',
                                    },
                                },
                            }}
                        />

                        <TextField
                            fullWidth
                            id="password"
                            name="password"
                            label="Senha"
                            type={showPassword ? 'text' : 'password'}
                            value={formik.values.password}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.password && Boolean(formik.errors.password)}
                            helperText={formik.touched.password && formik.errors.password}
                            margin="normal"
                            autoComplete="current-password"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Lock color="action" />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="toggle password visibility"
                                            onClick={handleClickShowPassword}
                                            onMouseDown={handleMouseDownPassword}
                                            edge="end"
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    '&:hover fieldset': {
                                        borderColor: 'primary.main',
                                    },
                                },
                            }}
                        />

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            disabled={loading}
                            sx={{ 
                                mt: 3, 
                                mb: 2,
                                height: 48,
                                borderRadius: 2,
                                fontSize: '1.1rem',
                                fontWeight: 'bold',
                                textTransform: 'none',
                                '&:hover': {
                                    transform: 'translateY(-1px)',
                                    boxShadow: 4,
                                },
                                transition: 'all 0.2s ease-in-out',
                            }}
                        >
                            {loading ? (
                                <CircularProgress size={24} color="inherit" />
                            ) : (
                                'Entrar'
                            )}
                        </Button>

                        {/* Links */}
                        <Box sx={{ textAlign: 'center', mt: 2 }}>
                            <Link
                                component="button"
                                variant="body2"
                                onClick={() => navigate('/forgot-password')}
                                sx={{
                                    textDecoration: 'none',
                                    '&:hover': {
                                        textDecoration: 'underline',
                                    },
                                }}
                            >
                                Esqueceu sua senha?
                            </Link>
                        </Box>

                        <Divider sx={{ my: 3 }}>
                            <Typography variant="body2" color="text.secondary">
                                ou
                            </Typography>
                        </Divider>

                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="body2" color="text.secondary">
                                Não tem uma conta?{' '}
                                <Link
                                    component="button"
                                    variant="body2"
                                    onClick={() => navigate('/register')}
                                    sx={{
                                        fontWeight: 'bold',
                                        textDecoration: 'none',
                                        '&:hover': {
                                            textDecoration: 'underline',
                                        },
                                    }}
                                >
                                    Cadastre-se aqui
                                </Link>
                            </Typography>
                        </Box>
                    </Box>
                </Paper>

                {/* Footer */}
                <Box sx={{ mt: 4, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                        © 2025 Connexa. Todos os direitos reservados.
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Conectando estudantes ao redor do mundo
                    </Typography>
                </Box>
            </Box>
        </Container>
    );
};

export default Login;