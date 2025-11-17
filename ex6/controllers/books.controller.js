const booksService = require('../services/books.service');

function getAllBooks(req, res, next) {
    try {
        const books = booksService.getAllBooks();
        res.status(200).json(books);
    } catch (error) {
        next(error);
    }
}

function getBookByIsbn(req, res, next) {
    try {
        const book = booksService.getBookByIsbn(req.params.isbn);
        res.status(200).json(book);
    } catch (error) {
        next(error);
    }
}

function createBook(req, res, next) {
    try {
        const book = booksService.createBook(req.body);
        res.status(201).json(book);
    } catch (error) {
        next(error);
    }
}

function updateBook(req, res, next) {
    try {
        const book = booksService.updateBook(req.params.isbn, req.body);
        res.status(200).json(book);
    } catch (error) {
        next(error);
    }
}

function deleteBook(req, res, next) {
    try {
        booksService.deleteBook(req.params.isbn);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getAllBooks,
    getBookByIsbn,
    createBook,
    updateBook,
    deleteBook
};
