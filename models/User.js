const db = require('../config/db');

const User = {
    fullName : (userId, callback) => {
        const query = 'SELECT full_name FROM users WHERE id = ?';
        db.query(query, [userId], callback);
    },
    setOnlineStatus: (userId, isOnline, callback) => {
        const query = 'UPDATE users SET is_online = ? WHERE id = ?';
        db.query(query, [isOnline, userId], callback);
    },
    create: (phoneNumber, expoPushToken, callback) => {
        const query = 'INSERT INTO users (phone_number, expo_push_token) VALUES (?, ?)';
        db.query(query, [phoneNumber, expoPushToken], callback);
    },
    updateStatus: (messageId, status, callback) => {
        const query = 'UPDATE messages SET status = ? WHERE id = ?';
        db.query(query, [status, messageId], callback);
    },
    findByPhoneNumber: (phoneNumber, callback) => {
        const query = 'SELECT * FROM users WHERE phone_number = ?';
        db.query(query, [phoneNumber], callback);
    },
    updatePushToken: (phoneNumber, expoPushToken, callback) => {
        const query = 'UPDATE users SET expo_push_token = ? WHERE phone_number = ?';
        db.query(query, [expoPushToken, phoneNumber], callback);
    },
    // Autres méthodes CRUD si nécessaire
};

module.exports = User;