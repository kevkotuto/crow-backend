const db = require('../config/db');

const User = {
    fullName: (userId, callback) => {
        const query = 'SELECT full_name FROM users WHERE id = ?';
        db.query(query, [userId], callback);
    },
    setOnlineStatus: (userId, isOnline, callback) => {
        const query = 'UPDATE users SET is_online = ? WHERE id = ?';
        db.query(query, [isOnline, userId], callback);
    },
    create: (fullName, phoneNumber, expoPushToken, callback) => {
        const query = 'INSERT INTO users (full_name, phone_number, expo_push_token) VALUES (?, ?, ?)';
        db.query(query, [fullName, phoneNumber, expoPushToken], callback);
    },
    findByPhoneNumber: (phoneNumber, callback) => {
        const query = 'SELECT * FROM users WHERE phone_number = ?';
        db.query(query, [phoneNumber], callback);
    },
    updateOtp: (phoneNumber, otp, callback) => {
        const query = 'UPDATE users SET otp = ? WHERE phone_number = ?';
        db.query(query, [otp, phoneNumber], callback);
    },
    verifyOtp: (phoneNumber, otp, callback) => {
        const query = 'SELECT * FROM users WHERE phone_number = ? AND otp = ?';
        db.query(query, [phoneNumber, otp], callback);
    },
    updatePushToken: (phoneNumber, expoPushToken, callback) => {
        const query = 'UPDATE users SET expo_push_token = ? WHERE phone_number = ?';
        db.query(query, [expoPushToken, phoneNumber], callback);
    },
    update: (query, params, callback) => {
        db.query(query, params, callback);
    },
    findById: (userId, callback) => {
        const query = 'SELECT * FROM users WHERE id = ?';
        db.query(query, [userId], callback);
    }
    // Autres méthodes CRUD si nécessaire
};

module.exports = User;