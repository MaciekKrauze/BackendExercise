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

function updatePreferences ()