const express = require('express');
const { body } = require('express-validator');
const {
    getAllBorrows,
    getBorrowsByUser,
    createBorrowRequest,
    updateBorrowStatus
} = require('../controllers/borrowController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const borrowValidation = [
    body('bookId').exists().withMessage('Book ID is required')
];

const statusValidation = [
    body('status').isIn(['pending', 'approved', 'rejected', 'returned']).withMessage('Invalid status')
];

// Routes
router.get('/', authenticateToken, getAllBorrows);
router.get('/user', authenticateToken, getBorrowsByUser);
router.post('/request', authenticateToken, borrowValidation, createBorrowRequest);
router.put('/:id/status', authenticateToken, statusValidation, updateBorrowStatus);

module.exports = router;