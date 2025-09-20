import React from 'react';
import {
    Container,
    Paper,
    Typography,
    Box,
    Button,
    Card,
    CardContent,
    Avatar,
    Chip
} from '@mui/material';
import {
    Dashboard as DashboardIcon,
    Person,
    School,
    Public,
    Group,
    TrendingUp
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'super_admin': return 'error';
            case 'admin': return 'warning';
            case 'moderator': return 'info';
            default: return 'primary';
        }
    };

    const getRoleLabel = (role: string) => {
        switch (role) {
            case 'super_admin': return 'Super Admin';
            case 'admin': return 'Administrador';
            case 'moderator': return 'Moderador';
            default: return 'Usuário';
        }
    };

    const stats = [
        {
            title: 'Conexões',
            value: '0',
            icon: <Group sx={{ fontSize: 40 }} />,
            color: '#1976d2'
        },
        {
            title: 'Países',
            value: '0',
            icon: <Public sx={{ fontSize: 40 }} />,
            color: '#2e7d32'
        },
        {
            title: 'Universidades',
            value: '0',
            icon: <School sx={{ fontSize: 40 }} />,
            color: '#ed6c02'
        },
        {
            title: 'Atividade',
            value: '0%',
            icon: <TrendingUp sx={{ fontSize: 40 }} />,
            color: '#9c27b0'
        }
    ];

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            {/* Header */}
            <Paper
                elevation={3}
                sx={{
                    p: 3,
                    mb: 4,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white'
                }}
            >
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box display="flex" alignItems="center" gap={2}>
                        <Avatar sx={{ width: 60, height: 60, bgcolor: 'rgba(255,255,255,0.2)' }}>
                            <Person sx={{ fontSize: 32 }} />
                        </Avatar>
                        <Box>
                            <Typography variant="h4" component="h1" fontWeight="bold">
                                Bem-vindo, {user?.firstName}!
                            </Typography>
                            <Typography variant="h6" sx={{ opacity: 0.9 }}>
                                {user?.email}
                            </Typography>
                            <Chip 
                                label={getRoleLabel(user?.role || 'user')}
                                color={getRoleColor(user?.role || 'user')}
                                size="small"
                                sx={{ mt: 1 }}
                            />
                        </Box>
                    </Box>
                    <Button
                        variant="outlined"
                        onClick={handleLogout}
                        sx={{
                            color: 'white',
                            borderColor: 'rgba(255,255,255,0.5)',
                            '&:hover': {
                                borderColor: 'white',
                                backgroundColor: 'rgba(255,255,255,0.1)'
                            }
                        }}
                    >
                        Sair
                    </Button>
                </Box>
            </Paper>

            {/* Dashboard Stats */}
            <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap={3} sx={{ mb: 4 }}>
                {stats.map((stat, index) => (
                    <Card 
                        key={index}
                        elevation={2}
                        sx={{
                            height: '100%',
                            transition: 'transform 0.2s',
                            '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: 4
                            }
                        }}
                    >
                        <CardContent sx={{ textAlign: 'center', p: 3 }}>
                            <Box 
                                sx={{ 
                                    color: stat.color,
                                    mb: 2 
                                }}
                            >
                                {stat.icon}
                            </Box>
                            <Typography variant="h4" component="div" fontWeight="bold">
                                {stat.value}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {stat.title}
                            </Typography>
                        </CardContent>
                    </Card>
                ))}
            </Box>

            {/* Main Content */}
            <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '2fr 1fr' }} gap={3}>
                <Paper elevation={2} sx={{ p: 3, height: 400 }}>
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                        <DashboardIcon color="primary" />
                        <Typography variant="h5" component="h2" fontWeight="bold">
                            Atividade Recente
                        </Typography>
                    </Box>
                    <Box 
                        display="flex" 
                        alignItems="center" 
                        justifyContent="center" 
                        height="300px"
                        sx={{ 
                            backgroundColor: 'grey.50',
                            borderRadius: 2,
                            border: '2px dashed',
                            borderColor: 'grey.300'
                        }}
                    >
                        <Typography variant="body1" color="text.secondary">
                            Nenhuma atividade ainda. Comece a se conectar!
                        </Typography>
                    </Box>
                </Paper>

                <Paper elevation={2} sx={{ p: 3, height: 400 }}>
                    <Typography variant="h5" component="h2" fontWeight="bold" mb={2}>
                        Conectar-se
                    </Typography>
                    <Box display="flex" flexDirection="column" gap={2}>
                        <Button
                            variant="contained"
                            fullWidth
                            startIcon={<Person />}
                            sx={{ py: 1.5 }}
                        >
                            Encontrar Estudantes
                        </Button>
                        <Button
                            variant="outlined"
                            fullWidth
                            startIcon={<School />}
                            sx={{ py: 1.5 }}
                        >
                            Explorar Universidades
                        </Button>
                        <Button
                            variant="outlined"
                            fullWidth
                            startIcon={<Public />}
                            sx={{ py: 1.5 }}
                        >
                            Ver Mapa Global
                        </Button>
                    </Box>

                    <Box mt={3} p={2} sx={{ backgroundColor: 'primary.50', borderRadius: 2 }}>
                        <Typography variant="h6" color="primary.main" fontWeight="bold">
                            💡 Dica do Dia
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                            Complete seu perfil para ter mais chances de se conectar com outros estudantes!
                        </Typography>
                    </Box>
                </Paper>
            </Box>

            {/* Quick Actions */}
            <Paper elevation={2} sx={{ p: 3, mt: 3 }}>
                <Typography variant="h5" component="h2" fontWeight="bold" mb={3}>
                    Ações Rápidas
                </Typography>
                <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={2}>
                    <Button
                        variant="outlined"
                        sx={{ py: 2, flexDirection: 'column', gap: 1 }}
                    >
                        <Person />
                        Editar Perfil
                    </Button>
                    <Button
                        variant="outlined"
                        sx={{ py: 2, flexDirection: 'column', gap: 1 }}
                    >
                        <School />
                        Adicionar Educação
                    </Button>
                    <Button
                        variant="outlined"
                        sx={{ py: 2, flexDirection: 'column', gap: 1 }}
                    >
                        <Group />
                        Buscar Grupos
                    </Button>
                    <Button
                        variant="outlined"
                        sx={{ py: 2, flexDirection: 'column', gap: 1 }}
                    >
                        <Public />
                        Explorar Países
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
};

export default Dashboard;