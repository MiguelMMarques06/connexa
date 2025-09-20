module.exports = {
    // bcrypt configuration
    SALT_ROUNDS: 12, // Industry standard or higher for better security
    
    // Password constraints
    PASSWORD_MIN_LENGTH: 8,
    PASSWORD_MAX_LENGTH: 72, // bcrypt's maximum length
    
    // JWT configuration
    JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    JWT_EXPIRES_IN: '24h'
};