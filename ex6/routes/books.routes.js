const express = require('express');
const router = express.Router();
const booksController = require('../controllers/books.controller');
const validateBook = require('../middleware/validateBook');
const { requireAdmin } = require('../middleware/auth');

router.get('/', booksController.getAllBooks);

router.get('/:isbn', booksController.getBookByIsbn);
router.post('/', requireAdmin, validateBook, booksController.createBook);
router.put('/:isbn', requireAdmin, validateBook, booksController.updateBook);
router.delete('/:isbn', requireAdmin, booksController.deleteBook);

module.exports = router;