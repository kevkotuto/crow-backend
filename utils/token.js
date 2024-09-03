// utils/token.js

const jwt = require('jsonwebtoken');

function generateToken(user) {
    const secretKey = process.env.JWT_SECRET || 'your-secret-key';
    const payload = {
        userId: user.id,          // Assurez-vous d'inclure l'ID de l'utilisateur
        phoneNumber: user.phone_number  // Inclure également le numéro de téléphone si nécessaire
    };
    const options = {
        expiresIn: '1y',  // Temps d'expiration du token (ajustez selon vos besoins)
    };

    return jwt.sign(payload, secretKey, options);
}

module.exports = generateToken;