import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import {
    Container,
    TextField,
    Button,
    Typography,
    Box,
    Alert,
    Paper,
    Link,
    Divider
} from '@mui/material';
import { registerUser } from '../services/api';

const validationSchema = Yup.object({
    firstName: Yup.string()
        .required('Nome é obrigatório')
        .min(2, 'Nome deve ter pelo menos 2 caracteres')
        .max(50, 'Nome deve ter no máximo 50 caracteres'),
    lastName: Yup.string()
        .required('Sobrenome é obrigatório')
        .min(2, 'Sobrenome deve ter pelo menos 2 caracteres')
        .max(50, 'Sobrenome deve ter no máximo 50 caracteres'),
    email: Yup.string()
        .email('Email inválido')
        .required('Email é obrigatório'),
    password: Yup.string()
        .required('Senha é obrigatória')
        .min(8, 'Senha deve ter pelo menos 8 caracteres')
        .matches(
            /[A-Z]/,
            'Senha deve conter pelo menos uma letra maiúscula'
        )
        .matches(
            /[a-z]/,
            'Senha deve conter pelo menos uma letra minúscula'
        )
        .matches(
            /[0-9]/,
            'Senha deve conter pelo menos um número'
        )
        .matches(
            /[!@#$%^&*(),.?":{}|<>]/,
            'Senha deve conter pelo menos um caractere especial (!@#$%^&*(),.?":{}|<>)'
        ),
    confirmPassword: Yup.string()
        .required('Confirmação de senha é obrigatória')
        .oneOf([Yup.ref('password')], 'Senhas devem ser iguais')
});

const Registration = () => {
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleNavigateToLogin = () => {
        navigate('/login');
    };

    const handleSubmit = async (values: any, { setSubmitting, resetForm }: any) => {
        try {
            setError('');
            const { confirmPassword, ...userData } = values;
            await registerUser(userData);
            setSuccess(true);
            setError('');
            resetForm();
        } catch (err: any) {
            console.error('Registration error:', err);
            setSuccess(false);
            
            // Extrair mensagem de erro mais detalhada
            let errorMessage = 'Erro ao realizar cadastro';
            
            if (err.response?.data?.details && Array.isArray(err.response.data.details)) {
                errorMessage = err.response.data.details.join(', ');
            } else if (err.response?.data?.error) {
                errorMessage = err.response.data.error;
            } else if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (err.message) {
                errorMessage = err.message;
            }
            
            setError(errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Container maxWidth="sm">
            <Box sx={{ mt: 8, mb: 4 }}>
                <Paper elevation={3} sx={{ p: 4 }}>
                    <Typography variant="h4" component="h1" gutterBottom align="center">
                        Cadastro
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    {success && (
                        <Alert severity="success" sx={{ mb: 2 }}>
                            Cadastro realizado com sucesso!
                        </Alert>
                    )}

                    <Formik
                        initialValues={{
                            firstName: '',
                            lastName: '',
                            email: '',
                            password: '',
                            confirmPassword: ''
                        }}
                        validationSchema={validationSchema}
                        onSubmit={handleSubmit}
                    >
                        {({
                            values,
                            errors,
                            touched,
                            handleChange,
                            handleBlur,
                            isSubmitting
                        }) => (
                            <Form>
                                <TextField
                                    fullWidth
                                    id="firstName"
                                    name="firstName"
                                    label="Nome"
                                    value={values.firstName}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={touched.firstName && Boolean(errors.firstName)}
                                    helperText={touched.firstName && errors.firstName}
                                    margin="normal"
                                />

                                <TextField
                                    fullWidth
                                    id="lastName"
                                    name="lastName"
                                    label="Sobrenome"
                                    value={values.lastName}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={touched.lastName && Boolean(errors.lastName)}
                                    helperText={touched.lastName && errors.lastName}
                                    margin="normal"
                                />

                                <TextField
                                    fullWidth
                                    id="email"
                                    name="email"
                                    label="Email"
                                    type="email"
                                    value={values.email}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={touched.email && Boolean(errors.email)}
                                    helperText={touched.email && errors.email}
                                    margin="normal"
                                />

                                <TextField
                                    fullWidth
                                    id="password"
                                    name="password"
                                    label="Senha"
                                    type="password"
                                    value={values.password}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={touched.password && Boolean(errors.password)}
                                    helperText={touched.password && errors.password}
                                    margin="normal"
                                />

                                <TextField
                                    fullWidth
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    label="Confirmar Senha"
                                    type="password"
                                    value={values.confirmPassword}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={touched.confirmPassword && Boolean(errors.confirmPassword)}
                                    helperText={touched.confirmPassword && errors.confirmPassword}
                                    margin="normal"
                                />

                                <Button
                                    type="submit"
                                    fullWidth
                                    variant="contained"
                                    color="primary"
                                    disabled={isSubmitting}
                                    sx={{ mt: 3, mb: 2 }}
                                >
                                    {isSubmitting ? 'Cadastrando...' : 'Cadastrar'}
                                </Button>
                            </Form>
                        )}
                    </Formik>

                    {/* Divisor */}
                    <Divider sx={{ my: 3 }}>
                        <Typography variant="body2" color="textSecondary">
                            ou
                        </Typography>
                    </Divider>

                    {/* Link para Login */}
                    <Box textAlign="center">
                        <Typography variant="body2" color="textSecondary">
                            Já possui uma conta?{' '}
                            <Link 
                                component="button"
                                variant="body2"
                                onClick={handleNavigateToLogin}
                                sx={{ 
                                    textDecoration: 'none',
                                    fontWeight: 'medium',
                                    color: 'primary.main',
                                    cursor: 'pointer',
                                    '&:hover': {
                                        textDecoration: 'underline'
                                    }
                                }}
                            >
                                Faça login aqui
                            </Link>
                        </Typography>
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
};

export default Registration;