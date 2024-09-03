const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Failed to authenticate token' });
        }
        console.log('Decoded token:', decoded);
        console.log('Decoded token:', decoded.userId);
        // Attacher l'ID de l'utilisateur à la requête
        req.userId = decoded.userId; // Assurez-vous que le token contient 'userId'
        next();
    });
};

module.exports = authMiddleware;