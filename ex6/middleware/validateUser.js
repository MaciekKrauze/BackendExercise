function validateRegister(req, res, next) {
    const { username, password, email } = req.body;
    const errors = [];

    if (!username) {
        errors.push('Username is required');
    }

    if (!password) {
        errors.push('Password is required');
    }

    if (!email) {
        errors.push('Email is required');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation errors',
            errors
        });
    }

    next();
}

function validateLogin(req, res, next) {
    const { username, password } = req.body;
    const errors = [];

    if (!username) {
        errors.push('Username is required');
    }

    if (!password) {
        errors.push('Password is required');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation errors',
            errors
        });
    }

    next();
}

function validatePreferences(req, res, next) {
    const { theme, language } = req.body;
    const errors = [];

    if (!theme && !language) {
        errors.push('At least one parameter required: theme or language');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation errors',
            errors
        });
    }

    next();
}

module.exports = {
    validateRegister,
    validateLogin,
    validatePreferences
};