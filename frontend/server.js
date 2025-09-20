const express = require('express');
const path = require('path');
const history = require('connect-history-api-fallback');

const app = express();
const PORT = 3002;

console.log('Starting frontend server...');
console.log('Build directory:', path.join(__dirname, 'build'));

// Middleware para SPA - redireciona todas as rotas para index.html
app.use(history({
  disableDotRule: true,
  verbose: true
}));

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'build')));

// Log de requisições
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).send('Internal Server Error');
});

app.listen(PORT, '0.0.0.0', (err) => {
  if (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
  console.log(`Frontend server running at http://localhost:${PORT}`);
  console.log(`Available on all interfaces at port ${PORT}`);
});