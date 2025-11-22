const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['student', 'librarian'],
        default: 'student'
    },
    studentId: {
        type: String,
        required: function () { return this.role === 'student'; },
        trim: true
    },
    phone: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', function (next) {
    if (!this.isModified('password')) return next();

    const user = this;
    bcrypt.genSalt(12, function (err, salt) {
        if (err) return next(err);
        bcrypt.hash(user.password, salt, function (err, hash) {
            if (err) return next(err);
            user.password = hash;
            next();
        });
    });
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);