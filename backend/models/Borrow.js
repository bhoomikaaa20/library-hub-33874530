const mongoose = require('mongoose');

const borrowSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    book: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'returned'],
        default: 'pending'
    },
    borrowDate: {
        type: Date,
        default: Date.now
    },
    dueDate: {
        type: Date
    },
    returnDate: {
        type: Date
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Borrow', borrowSchema);