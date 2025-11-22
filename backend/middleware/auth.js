const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Assuming "Bearer <token>"
    if (!token) return res.status(401).json({ message: 'Access token required' });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid or expired token' });
        req.user = user; // Attach user info to request
        next();
    });
};

// Middleware to check if user is a librarian
const requireLibrarian = (req, res, next) => {
    if (req.user.role !== 'librarian') {
        return res.status(403).json({ message: 'Access denied. Librarian role required.' });
    }
    next();
};

module.exports = { authenticateToken, requireLibrarian };