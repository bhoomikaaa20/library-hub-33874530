const mongoose = require('mongoose');
const Book = require('../models/Book');
const Borrow = require('../models/Borrow');

// Get all books
const getAllBooks = async (req, res) => {
    try {
        const books = await Book.find();
        res.json(books);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching books', error: error.message });
    }
};

// Get book by ID
const getBookById = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }
        res.json(book);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching book', error: error.message });
    }
};

// Create a new book
const createBook = async (req, res) => {
    try {
        const { title, author, isbn, description, genre, publishedYear, availableCopies, totalCopies, image_url } = req.body;

        // Basic validation
        if (!title || !author || !isbn) {
            return res.status(400).json({ message: 'Title, author, and ISBN are required' });
        }

        const newBook = new Book({
            title,
            author,
            isbn,
            description,
            genre,
            publishedYear,
            availableCopies,
            totalCopies,
            image_url
        });

        const savedBook = await newBook.save();
        res.status(201).json(savedBook);
    } catch (error) {
        if (error.code === 11000) {
            res.status(400).json({ message: 'ISBN already exists' });
        } else {
            res.status(500).json({ message: 'Error creating book', error: error.message });
        }
    }
};

// Update a book
const updateBook = async (req, res) => {
    try {
        const { title, author, isbn, description, genre, publishedYear, availableCopies, totalCopies, image_url } = req.body;

        const updatedBook = await Book.findByIdAndUpdate(
            req.params.id,
            {
                title,
                author,
                isbn,
                description,
                genre,
                publishedYear,
                availableCopies: totalCopies || availableCopies,
                totalCopies,
                image_url
            },
            { new: true, runValidators: true }
        );

        if (!updatedBook) {
            return res.status(404).json({ message: 'Book not found' });
        }

        res.json(updatedBook);
    } catch (error) {
        if (error.code === 11000) {
            res.status(400).json({ message: 'ISBN already exists' });
        } else {
            res.status(500).json({ message: 'Error updating book', error: error.message });
        }
    }
};

// Delete a book
const deleteBook = async (req, res) => {
    try {
        // Validate the book ID
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: 'Invalid book ID' });
        }

        // Check for active borrows
        const activeBorrows = await Borrow.find({ book: req.params.id, status: 'approved' });
        if (activeBorrows.length > 0) {
            return res.status(409).json({ message: 'Book cannot be deleted as it is currently borrowed' });
        }

        const deletedBook = await Book.findByIdAndDelete(req.params.id);
        if (!deletedBook) {
            return res.status(404).json({ message: 'Book not found' });
        }
        res.json({ message: 'Book deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting book', error: error.message });
    }
};

module.exports = {
    getAllBooks,
    getBookById,
    createBook,
    updateBook,
    deleteBook
};