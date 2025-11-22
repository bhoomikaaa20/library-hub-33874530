const Borrow = require('../models/Borrow');
const Book = require('../models/Book');

// Get all borrows (for librarians to manage requests)
const getAllBorrows = async (req, res) => {
    try {
        const borrows = await Borrow.find()
            .populate('user', 'name email studentId')
            .populate('book', 'title author');
        res.json(borrows);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching borrows', error: error.message });
    }
};

// Get borrows for the authenticated user
const getBorrowsByUser = async (req, res) => {
    try {
        const borrows = await Borrow.find({ user: req.user.userId }).populate('book', 'title author');
        res.json(borrows);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching borrows', error: error.message });
    }
};

// Create a new borrow request
const createBorrowRequest = async (req, res) => {
    try {
        const { bookId } = req.body;

        // Validate book existence and availability
        const book = await Book.findById(bookId);
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }
        if (book.availableCopies <= 0) {
            return res.status(400).json({ message: 'Book not available for borrowing' });
        }

        // Check if user already has a pending or approved borrow for this book
        const existingBorrow = await Borrow.findOne({
            user: req.user.userId,
            book: bookId,
            status: { $in: ['pending', 'approved'] }
        });
        if (existingBorrow) {
            return res.status(400).json({ message: 'You already have a pending or approved borrow request for this book' });
        }

        const newBorrow = new Borrow({
            user: req.user.userId,
            book: bookId,
            status: 'pending',
            borrowDate: new Date()
        });

        const savedBorrow = await newBorrow.save();
        await savedBorrow.populate('book', 'title author');
        res.status(201).json(savedBorrow);
    } catch (error) {
        res.status(500).json({ message: 'Error creating borrow request', error: error.message });
    }
};

// Return a book for the authenticated user
const returnBook = async (req, res) => {
    try {
        const borrow = await Borrow.findById(req.params.id).populate('book user');

        if (!borrow) {
            return res.status(404).json({ message: 'Borrow request not found' });
        }

        // Verify the borrow belongs to the authenticated user
        if (borrow.user._id.toString() !== req.user.userId.toString()) {
            return res.status(403).json({ message: 'You can only return your own borrows' });
        }

        // Set status to 'pendingReturn'
        borrow.status = 'pendingReturn';

        // Save changes
        const updatedBorrow = await borrow.save();
        await updatedBorrow.populate('user', 'name email');
        await updatedBorrow.populate('book', 'title author');
        res.json(updatedBorrow);
    } catch (error) {
        res.status(500).json({ message: 'Error returning book', error: error.message });
    }
};

// Update borrow status (approve/reject by librarian, return by student)
const updateBorrowStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const borrow = await Borrow.findById(req.params.id).populate('book user');

        if (!borrow) {
            return res.status(404).json({ message: 'Borrow request not found' });
        }

        if (status === 'approved' || status === 'rejected') {
            if (req.user.role !== 'librarian') {
                return res.status(403).json({ message: 'Only librarians can approve or reject borrow requests' });
            }
            if (borrow.status !== 'pending') {
                return res.status(403).json({ message: 'Can only approve or reject pending requests' });
            }
        } else if (status === 'returned') {
            if (req.user.role !== 'librarian') {
                return res.status(403).json({ message: 'Only librarians can approve return requests' });
            }
            if (borrow.status !== 'approved' && borrow.status !== 'pendingReturn') {
                return res.status(403).json({ message: 'Can only return approved or pending return borrows' });
            }
        }

        borrow.status = status;

        if (status === 'approved') {
            // Set due date to 14 days from now and decrement available copies
            borrow.dueDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14 days
            borrow.book.availableCopies -= 1;
            await borrow.book.save();
        } else if (status === 'returned') {
            // Set return date and increment available copies
            borrow.returnDate = new Date();
            borrow.book.availableCopies += 1;
            await borrow.book.save();
        }

        const updatedBorrow = await borrow.save();
        await updatedBorrow.populate('user', 'name email');
        await updatedBorrow.populate('book', 'title author');
        res.json(updatedBorrow);
    } catch (error) {
        res.status(500).json({ message: 'Error updating borrow status', error: error.message });
    }
};

module.exports = {
    getAllBorrows,
    getBorrowsByUser,
    createBorrowRequest,
    updateBorrowStatus,
    returnBook
};