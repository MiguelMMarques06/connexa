const bcrypt = require('bcrypt');
const UserService = require('../services/userService');
const securityConfig = require('../config/security');

const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name) {
            return res.status(400).json({ 
                error: 'Validation failed',
                details: ['Name is required']
            });
        }

        // Validate password length before hashing (bcrypt has a max length of 72 bytes)
        if (password.length > securityConfig.PASSWORD_MAX_LENGTH) {
            return res.status(400).json({
                error: 'Validation failed',
                details: ['Password exceeds maximum allowed length']
            });
        }

        // Check if user already exists (case-insensitive)
        try {
            const existingUser = await UserService.findByEmail(email);
            if (existingUser) {
                return res.status(409).json({ 
                    error: 'Email already registered',
                    details: ['This email address is already in use. Please use a different email or try logging in.']
                });
            }
        } catch (error) {
            console.error('Error checking email existence:', error);
            return res.status(500).json({ error: 'Error checking email availability' });
        }

        // Hash password with enhanced security
        let password_hash;
        try {
            password_hash = await bcrypt.hash(password, securityConfig.SALT_ROUNDS);
        } catch (hashError) {
            console.error('Password hashing error:', hashError);
            return res.status(500).json({ error: 'Error processing password' });
        }

        // Create new user
        try {
            const userId = await UserService.createUser(name, email, password_hash);
            
            res.status(201).json({
                message: 'User registered successfully',
                userId
            });
        } catch (error) {
            console.error('Error creating user:', error);
            if (error.message === 'Email already exists') {
                return res.status(409).json({ 
                    error: 'Email already registered',
                    details: ['This email address is already in use. Please use a different email or try logging in.']
                });
            }
            return res.status(500).json({ error: 'Error creating user account' });
        }
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    register
};