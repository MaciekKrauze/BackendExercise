const { validateEmail, validateMinimalStringLength } = require('../utils/validators');
const { findById, findByUsername, createUser, updateUser, ifUsernameUsed} = require('../repositories/users.repository')

function register(userData){
    if (!validateEmail(userData.email)) throw new Error('email is not valid');
    if (!validateMinimalStringLength(userData.email)) throw new Error('email is too short');
    if (!validateMinimalStringLength(userData.username)) throw new Error('username is too short');
    if (!validateMinimalStringLength(userData.password)) throw new Error('password is too short');
    if (!ifUsernameUsed()) throw new Error('username is used');
    userData.role = "user";
    userData.preference = {
        theme: "dark",
        language: "pl"
    }
    return createUser(userData);
}

function login (username, password){
    const user = findByUsername(username);
    if (user.password !== password)throw new Error('Invalid username or password');
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
}

function getCurrentUser(userId) {
    const user = findById(userId);
    if (!user) throw new Error('User not found');
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
}

function updatePreferences (userId, preferences) {
    const validThemes = ['light', 'dark'];
    const validLanguages = ['en', 'pl'];
    if (preferences.theme && !validThemes.includes(preferences.theme)) {
        throw new Error(`Theme must be one of: ${validThemes.join(', ')}`);
    }
    if (preferences.language && !validLanguages.includes(preferences.language)) {
        throw new Error(`Language must be one of: ${validLanguages.join(', ')}`);
    }
    const user = updateUser(userId, { preferences });
    if (!user) throw new Error('User not found');
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
}

module.exports = {
    register,
    login,
    getCurrentUser,
    updatePreferences
};