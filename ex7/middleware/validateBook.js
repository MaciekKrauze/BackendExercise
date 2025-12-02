function validateBook(req, res, next) {
    const requiredFields =
        ['isbn', 'title', 'author', 'year', 'genre', 'availableCopies'];
    for (const field of requiredFields) {
        if (!req.body.hasOwnProperty(field)) {
            return res.status(400).json({
                error: "Validation failed",
                details: `Missing required field: ${field}`
            });
        }
    }
    next();
}
module.exports = validateBook;