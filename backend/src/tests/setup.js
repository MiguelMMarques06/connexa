// Mock das dependências para os testes
jest.mock('../services/userService', () => ({
    getUserByEmail: jest.fn(),
    getUserById: jest.fn(),
    createUser: jest.fn(),
    updateUser: jest.fn(),
    deleteUser: jest.fn(),
    updateLastLogin: jest.fn(),
    getAllUsers: jest.fn()
}));

jest.mock('../middleware/auth', () => ({
    authenticateToken: jest.fn(() => (req, res, next) => next()),
    requireRole: jest.fn(() => (req, res, next) => next()),
    revokeToken: jest.fn()
}));

// Configuração global do Jest para testes de autenticação
global.console = {
    ...console,
    error: jest.fn(), // Mock console.error para evitar poluição nos logs de teste
    log: jest.fn()
};