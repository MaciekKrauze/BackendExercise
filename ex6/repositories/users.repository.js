let users = [
    {
        id : 1,
        username: "John",
        email: "john@example.com",
        password: "password",
        role: "admin",
        preferences : {
            theme: "dark",
            language: "en"
        }
    },
    {
        id : 2,
        username: "Philip",
        email: "philip@example.com",
        password: "1234",
        role: "user",
        preferences: {
            theme: "light",
            language: "pl"
        }
    }
]

function findById (id) {
    return users.find(user => user.id === id) || null;
}

function findByUsername (name) {
    return users.find(user => user.username === name) || null
}

function createUser (user) {
    user.id = users.length > 0
        ? Math.max(...users.map(u => u.id)) + 1
        : 1;
    users.push(user);
    return user;
}

function updateUser (id, userData) {
    let user = findById(id);
    if (user) {
        if (userData.username !== undefined) user.username = userData.username;
        if (userData.email !== undefined) user.email = userData.email;
        if (userData.password !== undefined) user.password = userData.password;
        if (userData.role !== undefined) user.role = userData.role;
        if (userData.preferences !== undefined) {
            user.preferences = { ...user.preferences, ...userData.preferences };
        }
        return user;
    }
    return null;
}

function ifUsernameUsed (username) {
    return !!findByUsername(username);
}

module.exports = {
    findById,
    findByUsername,
    createUser,
    updateUser,
    ifUsernameUsed
}