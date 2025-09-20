const userService = require('../services/userService');
const { hashPassword, comparePassword } = require('../utils/authUtils');
const { generateToken, verifyToken, formatAuthResponse } = require('../utils/jwtUtils');
const { validateEmail, validatePassword } = require('../utils/validation');
const { revokeToken } = require('../middleware/auth');

class UserController {
    async register(req, res) {
        try {
            const { email, password, firstName, lastName } = req.body;

            // Validação de entrada
            if (!email || !password || !firstName || !lastName) {
                return res.status(400).json({
                    error: 'Missing required fields',
                    details: ['Email, password, first name, and last name are required']
                });
            }

            // Validação de email
            if (!validateEmail(email)) {
                return res.status(400).json({
                    error: 'Invalid email format',
                    details: ['Please provide a valid email address']
                });
            }

            // Validação de senha
            const passwordValidation = validatePassword(password);
            if (!passwordValidation.isValid) {
                return res.status(400).json({
                    error: 'Invalid password',
                    details: passwordValidation.errors
                });
            }

            // Verificar se o usuário já existe
            const existingUser = await userService.findByEmail(email);
            if (existingUser) {
                return res.status(409).json({
                    error: 'User already exists',
                    details: ['A user with this email address already exists']
                });
            }

            // Hash da senha
            const hashedPassword = await hashPassword(password);

            // Criar usuário - ajustar para a assinatura do método
            const fullName = `${firstName} ${lastName}`;
            const userId = await userService.createUser(fullName, email.toLowerCase(), hashedPassword);

            // Criar objeto de usuário para resposta
            const userData = {
                id: userId,
                email: email.toLowerCase(),
                firstName,
                lastName,
                role: 'user',
                isActive: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            const user = userData;

            // Gerar token
            const token = generateToken(user);

            // Resposta formatada
            const response = formatAuthResponse(user, token);

            res.status(201).json({
                message: 'User registered successfully',
                ...response
            });

        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({
                error: 'Internal server error',
                details: ['An error occurred during registration']
            });
        }
    }

    async login(req, res) {
        try {
            const { email, password } = req.body;

            // Validação de entrada
            if (!email || !password) {
                return res.status(400).json({
                    error: 'Missing credentials',
                    details: ['Email and password are required']
                });
            }

            // Buscar usuário
            const user = await userService.getUserByEmail(email.toLowerCase());
            if (!user) {
                return res.status(401).json({
                    error: 'Invalid credentials',
                    details: ['Invalid email or password']
                });
            }

            // Verificar se o usuário está ativo
            if (!user.isActive) {
                return res.status(401).json({
                    error: 'Account disabled',
                    details: ['Your account has been disabled. Please contact support.']
                });
            }

            // Verificar senha
            const isValidPassword = await comparePassword(password, user.password);
            if (!isValidPassword) {
                return res.status(401).json({
                    error: 'Invalid credentials',
                    details: ['Invalid email or password']
                });
            }

            // Atualizar último login
            await userService.updateLastLogin(user.id);

            // Gerar token
            const token = generateToken(user);

            // Resposta formatada
            const response = formatAuthResponse(user, token);

            res.json({
                message: 'Login successful',
                ...response
            });

        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({
                error: 'Internal server error',
                details: ['An error occurred during login']
            });
        }
    }

    async getProfile(req, res) {
        try {
            const userId = req.user.id;
            const user = await userService.getUserById(userId);

            if (!user) {
                return res.status(404).json({
                    error: 'User not found',
                    details: ['User profile not found']
                });
            }

            // Remover senha da resposta
            const { password, ...userProfile } = user;

            res.json({
                user: userProfile
            });

        } catch (error) {
            console.error('Get profile error:', error);
            res.status(500).json({
                error: 'Internal server error',
                details: ['An error occurred while fetching profile']
            });
        }
    }

    async updateProfile(req, res) {
        try {
            const userId = req.params.userId || req.user.id;
            const { firstName, lastName, email } = req.body;

            // Verificar se o usuário existe
            const existingUser = await userService.getUserById(userId);
            if (!existingUser) {
                return res.status(404).json({
                    error: 'User not found',
                    details: ['User not found']
                });
            }

            // Validar email se fornecido
            if (email && !validateEmail(email)) {
                return res.status(400).json({
                    error: 'Invalid email format',
                    details: ['Please provide a valid email address']
                });
            }

            // Verificar se o novo email já está em uso (se diferente do atual)
            if (email && email.toLowerCase() !== existingUser.email.toLowerCase()) {
                const emailExists = await userService.getUserByEmail(email);
                if (emailExists) {
                    return res.status(409).json({
                        error: 'Email already in use',
                        details: ['This email address is already registered']
                    });
                }
            }

            // Atualizar dados
            const updateData = {
                updatedAt: new Date().toISOString()
            };

            if (firstName) updateData.firstName = firstName;
            if (lastName) updateData.lastName = lastName;
            if (email) updateData.email = email.toLowerCase();

            const updatedUser = await userService.updateUser(userId, updateData);

            // Remover senha da resposta
            const { password, ...userProfile } = updatedUser;

            res.json({
                message: 'Profile updated successfully',
                user: userProfile
            });

        } catch (error) {
            console.error('Update profile error:', error);
            res.status(500).json({
                error: 'Internal server error',
                details: ['An error occurred while updating profile']
            });
        }
    }

    async deleteAccount(req, res) {
        try {
            const userId = req.params.userId;
            
            // Verificar se o usuário existe
            const user = await userService.getUserById(userId);
            if (!user) {
                return res.status(404).json({
                    error: 'User not found',
                    details: ['User not found']
                });
            }

            // Deletar usuário
            await userService.deleteUser(userId);

            res.json({
                message: 'Account deleted successfully'
            });

        } catch (error) {
            console.error('Delete account error:', error);
            res.status(500).json({
                error: 'Internal server error',
                details: ['An error occurred while deleting account']
            });
        }
    }

    async logout(req, res) {
        try {
            const authHeader = req.headers['authorization'];
            const token = authHeader && authHeader.split(' ')[1];

            if (token) {
                // Revogar o token
                revokeToken(token);
            }

            res.json({
                message: 'Logged out successfully'
            });

        } catch (error) {
            console.error('Logout error:', error);
            res.status(500).json({
                error: 'Internal server error',
                details: ['An error occurred during logout']
            });
        }
    }

    async refreshToken(req, res) {
        try {
            const userId = req.user.id;
            
            // Buscar usuário atualizado
            const user = await userService.getUserById(userId);
            if (!user || !user.isActive) {
                return res.status(401).json({
                    error: 'User not found or inactive',
                    details: ['User account is not valid']
                });
            }

            // Gerar novo token
            const newToken = generateToken(user);
            const response = formatAuthResponse(user, newToken);

            res.json({
                message: 'Token refreshed successfully',
                ...response
            });

        } catch (error) {
            console.error('Refresh token error:', error);
            res.status(500).json({
                error: 'Internal server error',
                details: ['An error occurred while refreshing token']
            });
        }
    }

    // Métodos administrativos
    async getAllUsers(req, res) {
        try {
            const { page = 1, limit = 10, search, role, isActive } = req.query;
            
            const filters = {};
            if (search) filters.search = search;
            if (role) filters.role = role;
            if (isActive !== undefined) filters.isActive = isActive === 'true';

            const result = await userService.getAllUsers(parseInt(page), parseInt(limit), filters);

            res.json({
                users: result.users.map(user => {
                    const { password, ...userWithoutPassword } = user;
                    return userWithoutPassword;
                }),
                pagination: result.pagination
            });

        } catch (error) {
            console.error('Get all users error:', error);
            res.status(500).json({
                error: 'Internal server error',
                details: ['An error occurred while fetching users']
            });
        }
    }

    async getUserById(req, res) {
        try {
            const userId = req.params.userId;
            const user = await userService.getUserById(userId);

            if (!user) {
                return res.status(404).json({
                    error: 'User not found',
                    details: ['User not found']
                });
            }

            // Remover senha da resposta
            const { password, ...userProfile } = user;

            res.json({
                user: userProfile
            });

        } catch (error) {
            console.error('Get user by ID error:', error);
            res.status(500).json({
                error: 'Internal server error',
                details: ['An error occurred while fetching user']
            });
        }
    }

    async updateUserRole(req, res) {
        try {
            const userId = req.params.userId;
            const { role } = req.body;

            const validRoles = ['user', 'moderator', 'admin', 'super_admin'];
            if (!validRoles.includes(role)) {
                return res.status(400).json({
                    error: 'Invalid role',
                    details: [`Role must be one of: ${validRoles.join(', ')}`]
                });
            }

            // Verificar se o usuário existe
            const user = await userService.getUserById(userId);
            if (!user) {
                return res.status(404).json({
                    error: 'User not found',
                    details: ['User not found']
                });
            }

            // Atualizar role
            const updatedUser = await userService.updateUser(userId, {
                role,
                updatedAt: new Date().toISOString()
            });

            // Remover senha da resposta
            const { password, ...userProfile } = updatedUser;

            res.json({
                message: 'User role updated successfully',
                user: userProfile
            });

        } catch (error) {
            console.error('Update user role error:', error);
            res.status(500).json({
                error: 'Internal server error',
                details: ['An error occurred while updating user role']
            });
        }
    }

    async banUser(req, res) {
        try {
            const userId = req.params.userId;
            const { banned, reason } = req.body;

            // Verificar se o usuário existe
            const user = await userService.getUserById(userId);
            if (!user) {
                return res.status(404).json({
                    error: 'User not found',
                    details: ['User not found']
                });
            }

            // Atualizar status de ban
            const updateData = {
                isActive: !banned,
                updatedAt: new Date().toISOString()
            };

            if (reason) {
                updateData.banReason = reason;
            }

            const updatedUser = await userService.updateUser(userId, updateData);

            // Remover senha da resposta
            const { password, ...userProfile } = updatedUser;

            res.json({
                message: banned ? 'User banned successfully' : 'User unbanned successfully',
                user: userProfile
            });

        } catch (error) {
            console.error('Ban user error:', error);
            res.status(500).json({
                error: 'Internal server error',
                details: ['An error occurred while updating user status']
            });
        }
    }
}

module.exports = new UserController();