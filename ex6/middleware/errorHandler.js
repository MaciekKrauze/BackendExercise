function errorHandler(err, req, res, next) {
    let statusCode = 500;
    const msg = err.message.toLowerCase();
    if (msg.includes('not found')) {
        statusCode = 404;
    } else if (msg.includes('already exists')) {
        statusCode = 409;
    } else if (msg.includes('validation') || msg.includes('invalid')) {
        statusCode = 400;
    }
    res.status(statusCode).json({
        error: err.message,
        timestamp: new Date().toISOString()
    });
}
module.exports = errorHandler;