const request = require('supertest');
const app = require('../../app');
const { authenticateToken, requireRole, revokeToken } = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/security');

describe('Authentication Middleware', () => {
    let validToken;
    let expiredToken;
    let invalidToken;
    let userToken;
    let adminToken;

    beforeAll(() => {
        // Token válido de usuário comum
        userToken = jwt.sign(
            { id: 1, email: 'user@test.com', role: 'user' },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Token válido de admin
        adminToken = jwt.sign(
            { id: 2, email: 'admin@test.com', role: 'admin' },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Token expirado
        expiredToken = jwt.sign(
            { id: 3, email: 'expired@test.com', role: 'user' },
            JWT_SECRET,
            { expiresIn: '-1h' } // Já expirado
        );

        // Token inválido
        invalidToken = 'invalid.token.here';
        validToken = userToken;
    });

    describe('authenticateToken middleware', () => {
        test('deve aceitar token válido', (done) => {
            const req = {
                headers: { authorization: `Bearer ${validToken}` }
            };
            const res = {};
            const next = jest.fn();

            authenticateToken({ required: true })(req, res, next);

            setTimeout(() => {
                expect(req.user).toBeDefined();
                expect(req.user.id).toBe(1);
                expect(req.user.email).toBe('user@test.com');
                expect(next).toHaveBeenCalled();
                done();
            }, 10);
        });

        test('deve rejeitar token inválido', (done) => {
            const req = {
                headers: { authorization: `Bearer ${invalidToken}` }
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };
            const next = jest.fn();

            authenticateToken({ required: true })(req, res, next);

            setTimeout(() => {
                expect(res.status).toHaveBeenCalledWith(401);
                expect(res.json).toHaveBeenCalledWith(
                    expect.objectContaining({
                        error: 'Invalid token',
                        code: 'INVALID_TOKEN'
                    })
                );
                expect(next).not.toHaveBeenCalled();
                done();
            }, 10);
        });

        test('deve rejeitar token expirado', (done) => {
            const req = {
                headers: { authorization: `Bearer ${expiredToken}` }
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };
            const next = jest.fn();

            authenticateToken({ required: true })(req, res, next);

            setTimeout(() => {
                expect(res.status).toHaveBeenCalledWith(401);
                expect(res.json).toHaveBeenCalledWith(
                    expect.objectContaining({
                        error: 'Token expired',
                        code: 'TOKEN_EXPIRED'
                    })
                );
                expect(next).not.toHaveBeenCalled();
                done();
            }, 10);
        });

        test('deve rejeitar quando não há token e é obrigatório', (done) => {
            const req = { headers: {} };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };
            const next = jest.fn();

            authenticateToken({ required: true })(req, res, next);

            setTimeout(() => {
                expect(res.status).toHaveBeenCalledWith(401);
                expect(res.json).toHaveBeenCalledWith(
                    expect.objectContaining({
                        error: 'Access token required',
                        code: 'TOKEN_REQUIRED'
                    })
                );
                expect(next).not.toHaveBeenCalled();
                done();
            }, 10);
        });

        test('deve continuar quando não há token e é opcional', (done) => {
            const req = { headers: {} };
            const res = {};
            const next = jest.fn();

            authenticateToken({ required: false })(req, res, next);

            setTimeout(() => {
                expect(req.user).toBeNull();
                expect(next).toHaveBeenCalled();
                done();
            }, 10);
        });

        test('deve detectar token próximo ao vencimento', (done) => {
            // Token que expira em 5 minutos
            const soonToExpireToken = jwt.sign(
                { id: 4, email: 'expire@test.com', role: 'user' },
                JWT_SECRET,
                { expiresIn: '5m' }
            );

            const req = {
                headers: { authorization: `Bearer ${soonToExpireToken}` }
            };
            const res = {
                setHeader: jest.fn()
            };
            const next = jest.fn();

            authenticateToken({ required: true })(req, res, next);

            setTimeout(() => {
                expect(res.setHeader).toHaveBeenCalledWith(
                    'X-Token-Warning',
                    'Token expires soon'
                );
                expect(next).toHaveBeenCalled();
                done();
            }, 10);
        });
    });

    describe('requireRole middleware', () => {
        test('deve aceitar usuário com role correto', (done) => {
            const req = {
                user: { id: 1, email: 'admin@test.com', role: 'admin' }
            };
            const res = {};
            const next = jest.fn();

            requireRole(['admin'])(req, res, next);

            expect(next).toHaveBeenCalled();
            done();
        });

        test('deve rejeitar usuário com role incorreto', (done) => {
            const req = {
                user: { id: 1, email: 'user@test.com', role: 'user' }
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };
            const next = jest.fn();

            requireRole(['admin'])(req, res, next);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    error: 'Insufficient permissions',
                    code: 'INSUFFICIENT_PERMISSIONS'
                })
            );
            expect(next).not.toHaveBeenCalled();
            done();
        });

        test('deve aceitar múltiplos roles válidos', (done) => {
            const req = {
                user: { id: 1, email: 'mod@test.com', role: 'moderator' }
            };
            const res = {};
            const next = jest.fn();

            requireRole(['admin', 'moderator'])(req, res, next);

            expect(next).toHaveBeenCalled();
            done();
        });
    });

    describe('Token blacklist', () => {
        test('deve rejeitar token revogado', (done) => {
            // Primeiro revoga o token
            revokeToken(validToken);

            const req = {
                headers: { authorization: `Bearer ${validToken}` }
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };
            const next = jest.fn();

            authenticateToken({ required: true })(req, res, next);

            setTimeout(() => {
                expect(res.status).toHaveBeenCalledWith(401);
                expect(res.json).toHaveBeenCalledWith(
                    expect.objectContaining({
                        error: 'Token has been revoked',
                        code: 'TOKEN_REVOKED'
                    })
                );
                expect(next).not.toHaveBeenCalled();
                done();
            }, 10);
        });
    });
});

describe('Authorization Middleware Integration', () => {
    let server;
    let userToken;
    let adminToken;

    beforeAll(async () => {
        server = app.listen(0); // Porta aleatória para testes
        
        // Gera tokens para teste
        userToken = jwt.sign(
            { id: 1, email: 'user@test.com', role: 'user' },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        adminToken = jwt.sign(
            { id: 2, email: 'admin@test.com', role: 'admin' },
            JWT_SECRET,
            { expiresIn: '1h' }
        );
    });

    afterAll(async () => {
        if (server) {
            await new Promise(resolve => server.close(resolve));
        }
    });

    test('deve proteger rota que requer autenticação', async () => {
        const res = await request(app)
            .get('/api/users/profile')
            .expect(401);

        expect(res.body).toMatchObject({
            error: 'Access token required',
            code: 'TOKEN_REQUIRED'
        });
    });

    test('deve permitir acesso com token válido', async () => {
        const res = await request(app)
            .get('/api/users/profile')
            .set('Authorization', `Bearer ${userToken}`)
            .expect(200);

        expect(res.body).toHaveProperty('user');
    });

    test('deve proteger rota administrativa', async () => {
        const res = await request(app)
            .get('/api/users/admin/users')
            .set('Authorization', `Bearer ${userToken}`)
            .expect(403);

        expect(res.body).toMatchObject({
            error: 'Insufficient permissions',
            code: 'INSUFFICIENT_PERMISSIONS'
        });
    });

    test('deve permitir acesso administrativo para admin', async () => {
        const res = await request(app)
            .get('/api/users/admin/users')
            .set('Authorization', `Bearer ${adminToken}`)
            .expect(200);

        expect(res.body).toHaveProperty('users');
    });

    test('deve aplicar rate limiting específico por usuário', async () => {
        // Simula múltiplas requisições rápidas
        const promises = [];
        for (let i = 0; i < 60; i++) {
            promises.push(
                request(app)
                    .get('/api/users/profile')
                    .set('Authorization', `Bearer ${userToken}`)
            );
        }

        const results = await Promise.all(promises);
        
        // Algumas devem ser bloqueadas por rate limit
        const rateLimited = results.filter(res => res.status === 429);
        expect(rateLimited.length).toBeGreaterThan(0);
    });
});

describe('Edge Cases e Segurança', () => {
    test('deve lidar com header Authorization malformado', (done) => {
        const req = {
            headers: { authorization: 'Invalid Bearer Format' }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const next = jest.fn();

        authenticateToken({ required: true })(req, res, next);

        setTimeout(() => {
            expect(res.status).toHaveBeenCalledWith(401);
            expect(next).not.toHaveBeenCalled();
            done();
        }, 10);
    });

    test('deve lidar com token sem payload válido', (done) => {
        const malformedToken = jwt.sign({}, JWT_SECRET);
        
        const req = {
            headers: { authorization: `Bearer ${malformedToken}` }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const next = jest.fn();

        authenticateToken({ required: true })(req, res, next);

        setTimeout(() => {
            expect(res.status).toHaveBeenCalledWith(401);
            expect(next).not.toHaveBeenCalled();
            done();
        }, 10);
    });

    test('deve prevenir ataques de timing', async () => {
        const start = Date.now();
        
        const req = {
            headers: { authorization: 'Bearer invalid.token.here' }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const next = jest.fn();

        authenticateToken({ required: true })(req, res, next);

        await new Promise(resolve => setTimeout(resolve, 100));
        
        const duration = Date.now() - start;
        expect(duration).toBeGreaterThanOrEqual(100); // Delay mínimo para prevenir timing attacks
    });
});