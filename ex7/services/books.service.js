const { findAll, findByIsbn, create, update, deleteByIsbn } = require('../repositories/books.repository');
const { createLink, addBookLinks, addBooksCollectionLinks } = require('../utils/hateoas');
const { validateIsbn, validateYear, validatePositiveNumber, validateRequiredString } = require('../utils/validators');

function getAllBooks() {
    const books = findAll();
    addBooksCollectionLinks(books);
    return books;
}

function getBookByIsbn(isbn) {
    const ifValidIsbn = validateIsbn(isbn);
    if (!ifValidIsbn.valid) {
        throw new Error('Invalid ISBN');
    }

    const book = findByIsbn(isbn);
    if (!book) {
        throw new Error('Book not found');
    }

    return addBookLinks(book);
}

function createBook(bookData) {
    const ifValidIsbn = validateIsbn(bookData.isbn);
    const ifValidYear = validateYear(bookData.year);
    const ifValidAvailableCopies = validatePositiveNumber(bookData.availableCopies);
    const ifValidAuthor = validateRequiredString(bookData.author);
    const ifValidGenre = validateRequiredString(bookData.genre);
    const ifValidTitle = validateRequiredString(bookData.title);

    if (!ifValidIsbn.valid || !ifValidYear.valid || !ifValidAvailableCopies.valid ||
        !ifValidAuthor.valid || !ifValidGenre.valid || !ifValidTitle.valid) {
        throw new Error('Invalid data');
    }

    const oldBook = findByIsbn(bookData.isbn);
    if (oldBook) {
        throw new Error('Book with this ISBN already exists');
    }

    const book = create(bookData);
    return addBookLinks(book);
}

function updateBook(isbn, bookData) {
    const ifValidIsbn = validateIsbn(isbn);
    const ifValidYear = validateYear(bookData.year);
    const ifValidAvailableCopies = validatePositiveNumber(bookData.availableCopies);
    const ifValidAuthor = validateRequiredString(bookData.author);
    const ifValidGenre = validateRequiredString(bookData.genre);
    const ifValidTitle = validateRequiredString(bookData.title);

    if (!ifValidIsbn.valid || !ifValidYear.valid || !ifValidAvailableCopies.valid ||
        !ifValidAuthor.valid || !ifValidGenre.valid || !ifValidTitle.valid) {
        throw new Error('Invalid data');
    }

    let book = findByIsbn(isbn);
    if (!book) {
        throw new Error('Book with this ISBN doesn\'t exist');
    }

    book = update(isbn, bookData);
    return addBookLinks(book);
}

function deleteBook(isbn) {
    const ifValidIsbn = validateIsbn(isbn);
    if (!ifValidIsbn.valid) {
        throw new Error('Invalid ISBN');
    }

    const book = findByIsbn(isbn);
    if (!book) {
        throw new Error('Book with this ISBN doesn\'t exist');
    }

    return deleteByIsbn(isbn);
}

module.exports = {
    getAllBooks,
    getBookByIsbn,
    createBook,
    updateBook,
    deleteBook
};
