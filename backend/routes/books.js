const express = require('express');
const { body } = require('express-validator');
const {
    getAllBooks,
    getBookById,
    createBook,
    updateBook,
    deleteBook
} = require('../controllers/bookController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const bookValidation = [
    body('title').trim().isLength({ min: 1 }).withMessage('Title is required'),
    body('author').trim().isLength({ min: 1 }).withMessage('Author is required'),
    body('isbn').trim().isLength({ min: 1 }).withMessage('ISBN is required'),
    body('genre').optional().trim(),
    body('publishedYear').optional().isNumeric().withMessage('Published year must be a number'),
    body('availableCopies').optional().isNumeric().withMessage('Available copies must be a number'),
    body('totalCopies').optional().isNumeric().withMessage('Total copies must be a number')
];

// Routes
router.get('/', authenticateToken, getAllBooks);
router.get('/:id', authenticateToken, getBookById);
router.post('/', authenticateToken, bookValidation, createBook);
router.put('/:id', authenticateToken, bookValidation, updateBook);
router.delete('/:id', authenticateToken, deleteBook);

module.exports = router;