const COOKIE_OPTIONS = {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    httpOnly: true
};

function setRegularCookie(res, name, value) {
    res.cookie(name, value, COOKIE_OPTIONS);
}

function setSignedCookie(res, name, value) {
    res.cookie(name, value, {
        ...COOKIE_OPTIONS,
        signed: true
    });
}

function getRegularCookie(req, name) {
    return req.cookies[name];
}

function getSignedCookie(req, name) {
    return req.signedCookies[name];
}

function clearCookie(res, name, signed = false) {
    res.clearCookie(name, {
        httpOnly: true,
        signed
    });
}

module.exports = {
    setRegularCookie,
    setSignedCookie,
    getRegularCookie,
    getSignedCookie,
    clearCookie
};