const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    author: {
        type: String,
        required: true,
        trim: true
    },
    isbn: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    genre: {
        type: String,
        trim: true
    },
    publishedYear: {
        type: Number,
        min: 1000,
        max: new Date().getFullYear()
    },
    availableCopies: {
        type: Number,
        default: 1,
        min: 0
    },
    totalCopies: {
        type: Number,
        default: 1,
        min: 1
    },
    borrowedCopies: {
        type: Number,
        default: 0,
        min: 0
    },
    image_url: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Book', bookSchema);