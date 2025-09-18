import React, { useState } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import {
    Container,
    TextField,
    Button,
    Typography,
    Box,
    Alert,
    Paper
} from '@mui/material';
import { register } from '../services/api';

const validationSchema = Yup.object({
    name: Yup.string()
        .required('Name is required')
        .min(2, 'Name must be at least 2 characters')
        .max(50, 'Name must be at most 50 characters'),
    email: Yup.string()
        .email('Invalid email address')
        .required('Email is required'),
    password: Yup.string()
        .required('Password is required')
        .min(8, 'Password must be at least 8 characters')
        .matches(
            /[A-Z]/,
            'Password must contain at least one uppercase letter'
        )
        .matches(
            /[a-z]/,
            'Password must contain at least one lowercase letter'
        )
        .matches(
            /[0-9]/,
            'Password must contain at least one number'
        )
        .matches(
            /[!@#$%^&*(),.?":{}|<>]/,
            'Password must contain at least one special character'
        ),
    confirmPassword: Yup.string()
        .required('Please confirm your password')
        .oneOf([Yup.ref('password')], 'Passwords must match')
});

const Registration = () => {
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (values: any, { setSubmitting, resetForm }: any) => {
        try {
            const { confirmPassword, ...userData } = values;
            await register(userData);
            setSuccess(true);
            setError('');
            resetForm();
        } catch (err: any) {
            setError(err.message);
            setSuccess(false);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Container maxWidth="sm">
            <Box sx={{ mt: 8, mb: 4 }}>
                <Paper elevation={3} sx={{ p: 4 }}>
                    <Typography variant="h4" component="h1" gutterBottom align="center">
                        Register
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    {success && (
                        <Alert severity="success" sx={{ mb: 2 }}>
                            Registration successful! You can now log in.
                        </Alert>
                    )}

                    <Formik
                        initialValues={{
                            name: '',
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
                                    id="name"
                                    name="name"
                                    label="Name"
                                    value={values.name}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={touched.name && Boolean(errors.name)}
                                    helperText={touched.name && errors.name}
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
                                    label="Password"
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
                                    label="Confirm Password"
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
                                    {isSubmitting ? 'Registering...' : 'Register'}
                                </Button>
                            </Form>
                        )}
                    </Formik>
                </Paper>
            </Box>
        </Container>
    );
};

export default Registration;