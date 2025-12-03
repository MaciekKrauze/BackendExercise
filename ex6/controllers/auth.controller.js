const authService = require('../services/auth.service');
const { setRegularCookie, setSignedCookie, clearCookie } = require('../utils/cookieUtils');

function register(req, res, next) {
    try {
        const user = authService.register(req.body);
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: user
        });
    } catch (error) {
        next(error);
    }
}

function login(req, res, next) {
    try {
        const { username, password } = req.body;
        const user = authService.login(username, password);
        req.session.userId = user.id;
        req.session.role = user.role;
        setSignedCookie(res, 'userId', user.id.toString());
        setRegularCookie(res, 'theme', user.preferences.theme);
        setRegularCookie(res, 'language', user.preferences.language);
        res.json({
            success: true,
            message: 'Logged in successfully',
            data: user
        });
    } catch (error) {
        next(error);
    }
}

function logout(req, res, next) {
    try {
        // Zniszcz sesję
        req.session.destroy((err) => {
            if (err) {
                return next(err);
            }

            // Usuń wszystkie ciasteczka
            clearCookie(res, 'userId', true); // podpisane
            clearCookie(res, 'theme');
            clearCookie(res, 'language');
            clearCookie(res, 'books.session'); // sesyjne

            res.json({
                success: true,
                message: 'Logged out successfully'
            });
        });
    } catch (error) {
        next(error);
    }
}

function getCurrentUser(req, res, next) {
    try {
        const userId = req.session.userId;
        const user = authService.getCurrentUser(userId);

        const cookieTheme = req.cookies.theme;
        const cookieLanguage = req.cookies.language;
        const userData = {
            ...user,
            preferences: {
                theme: cookieTheme || user.preferences.theme,
                language: cookieLanguage || user.preferences.language
            }
        };

        res.json({
            success: true,
            data: userData
        });
    } catch (error) {
        next(error);
    }
}

function updatePreferences(req, res, next) {
    try {
        const userId = req.session.userId;
        const { theme, language } = req.body;

        const user = authService.updatePreferences(userId, { theme, language });

        // Aktualizuj ciasteczka
        if (theme) {
            setRegularCookie(res, 'theme', theme);
        }
        if (language) {
            setRegularCookie(res, 'language', language);
        }

        res.json({
            success: true,
            message: 'Preferences updated',
            data: user
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    register,
    login,
    logout,
    getCurrentUser,
    updatePreferences
};