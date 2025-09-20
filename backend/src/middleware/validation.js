const validateRegistration = (req, res, next) => {
    const { email, password, firstName, lastName } = req.body;
    const errors = [];

    // Email validation
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!email) {
        errors.push('Email is required');
    } else if (!emailRegex.test(email)) {
        errors.push('Invalid email format');
    }

    // Password validation
    if (!password) {
        errors.push('Password is required');
    } else {
        // Check password length (minimum 8 characters)
        if (password.length < 8) {
            errors.push('Password must be at least 8 characters long');
        }

        // Check for at least one uppercase letter
        if (!/[A-Z]/.test(password)) {
            errors.push('Password must contain at least one uppercase letter');
        }

        // Check for at least one lowercase letter
        if (!/[a-z]/.test(password)) {
            errors.push('Password must contain at least one lowercase letter');
        }

        // Check for at least one number
        if (!/\d/.test(password)) {
            errors.push('Password must contain at least one number');
        }

        // Check for at least one special character
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            errors.push('Password must contain at least one special character');
        }
    }

    // First name validation
    if (!firstName) {
        errors.push('First name is required');
    } else if (typeof firstName !== 'string' || firstName.trim().length < 2) {
        errors.push('First name must be at least 2 characters long');
    } else if (firstName.trim().length > 50) {
        errors.push('First name must be less than 50 characters');
    }

    // Last name validation
    if (!lastName) {
        errors.push('Last name is required');
    } else if (typeof lastName !== 'string' || lastName.trim().length < 2) {
        errors.push('Last name must be at least 2 characters long');
    } else if (lastName.trim().length > 50) {
        errors.push('Last name must be less than 50 characters');
    }

    // If there are validation errors, return them
    if (errors.length > 0) {
        return res.status(400).json({
            error: 'Validation failed',
            details: errors
        });
    }

    // If validation passes, continue to the next middleware/controller
    next();
};

const validateLogin = (req, res, next) => {
    const { email, password } = req.body;
    const errors = [];

    // Email validation
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!email) {
        errors.push('Email is required');
    } else if (!emailRegex.test(email)) {
        errors.push('Invalid email format');
    }

    // Password validation (just check if provided for login)
    if (!password) {
        errors.push('Password is required');
    }

    // If there are validation errors, return them
    if (errors.length > 0) {
        return res.status(400).json({
            error: 'Validation failed',
            details: errors
        });
    }

    // If validation passes, continue to the next middleware/controller
    next();
};

module.exports = {
    validateRegistration,
    validateLogin
};