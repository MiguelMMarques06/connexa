module.exports = {
    // bcrypt configuration
    SALT_ROUNDS: 12, // Industry standard or higher for better security
    
    // Other security configurations can be added here
    PASSWORD_MIN_LENGTH: 8,
    PASSWORD_MAX_LENGTH: 72 // bcrypt's maximum length
};