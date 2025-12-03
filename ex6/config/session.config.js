const sessionConfig = {
    secret: 'twoj-super-tajny-klucz-sesji-2024',
    resave: false,
    saveUninitialized: false,
    name: 'books.session',
    cookie: {
        maxAge: 30 * 60 * 1000,
        httpOnly: true,
        secure: false
    }
};

const cookieSecret = 'inny-tajny-klucz-dla-ciasteczek-2024';

module.exports = {
    sessionConfig,
    cookieSecret
};