const express = require('express');
const app = express();
const PORT = 3001;

// Middleware básico
app.use(express.json());

// CORS manual
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
        return;
    }
    next();
});

// Log de todas as requisições
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Rota raiz
app.get('/', (req, res) => {
    console.log('Root endpoint accessed');
    res.json({ 
        message: 'Connexa Backend API',
        version: '1.0.0',
        status: 'running',
        endpoints: {
            health: '/api/health',
            register: '/api/users/register'
        },
        timestamp: new Date().toISOString()
    });
});

// Rota de teste
app.get('/api/health', (req, res) => {
    console.log('Health check requested');
    res.json({ status: 'OK', message: 'Server is working' });
});

// Rota de registro simples
app.post('/api/users/register', (req, res) => {
    console.log('Registration endpoint called');
    console.log('Request body:', req.body);
    
    res.json({
        success: true,
        message: 'Registration successful',
        user: {
            id: 1,
            email: req.body.email || 'test@test.com',
            firstName: req.body.firstName || 'Test',
            lastName: req.body.lastName || 'User'
        }
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Simple server running on http://localhost:${PORT}`);
    console.log('Ready to accept connections');
});