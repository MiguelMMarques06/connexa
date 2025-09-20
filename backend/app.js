const request = require('supertest');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const userRoutes = require('../routes/protectedRoutes');

// Criar uma aplicação Express simples para testes
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Rotas
app.use('/api/users', userRoutes);

// Middleware de tratamento de erro global
app.use((error, req, res, next) => {
    console.error('Global error handler:', error);
    res.status(500).json({
        error: 'Internal server error',
        details: ['An unexpected error occurred']
    });
});

module.exports = app;