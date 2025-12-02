const express = require('express');
const router = express.Router();

const booksController = require('../controllers/books.controller');
const validateBook = require('../middleware/validateBook');

router.get('/', booksController.getAllBooks);

router.get('/:isbn', booksController.getBookByIsbn);

router.post('', validateBook, booksController.createBook);

router.put('/:isbn', validateBook, booksController.updateBook);

router.delete('/:isbn', booksController.deleteBook);

module.exports = router;