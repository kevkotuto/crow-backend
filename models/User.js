const db = require('../config/db');

const Message = {
    create: (from, to, content, type = 'text', callback) => {
        const query = 'INSERT INTO messages (sender_id, receiver_id, content, type, reactions, created_at) VALUES (?, ?, ?, ?, ?, NOW())';
        db.query(query, [from, to, content, type, JSON.stringify([])], callback);
    },

    getMessagesBetweenUsers: (userId1, userId2, callback) => {
        const query = `
            SELECT * FROM messages 
            WHERE (sender_id = ? AND receiver_id = ?) 
            OR (sender_id = ? AND receiver_id = ?)
            ORDER BY created_at ASC
        `;
        db.query(query, [userId1, userId2, userId2, userId1], callback);
    },

    getMessagesForUser: (userId, callback) => {
        const query = `
            SELECT * FROM messages 
            WHERE sender_id = ? OR receiver_id = ?
            ORDER BY created_at ASC
        `;
        db.query(query, [userId, userId], callback);
    },

    searchMessages: (userId, searchTerm, callback) => {
        const query = `
            SELECT * FROM messages 
            WHERE (sender_id = ? OR receiver_id = ?)
            AND content LIKE ?
            ORDER BY created_at DESC
        `;
        db.query(query, [userId, userId, `%${searchTerm}%`], callback);
    },

    filterMessagesByDate: (userId, startDate, endDate, callback) => {
        const query = `
            SELECT * FROM messages 
            WHERE (sender_id = ? OR receiver_id = ?)
            AND created_at BETWEEN ? AND ?
            ORDER BY created_at DESC
        `;
        db.query(query, [userId, userId, startDate, endDate], callback);
    },

    addReaction: (messageId, userId, reaction, callback) => {
        const query = `
            UPDATE messages
            SET reactions = JSON_ARRAY_APPEND(reactions, '$', JSON_OBJECT('userId', ?, 'reaction', ?))
            WHERE id = ?
        `;
        db.query(query, [userId, reaction, messageId], callback);
    },

    removeReaction: (messageId, userId, reaction, callback) => {
        const query = `
            UPDATE messages
            SET reactions = JSON_REMOVE(reactions, 
                JSON_UNQUOTE(JSON_SEARCH(reactions, 'one', JSON_OBJECT('userId', ?, 'reaction', ?))))
            WHERE id = ?
        `;
        db.query(query, [userId, reaction, messageId], callback);
    }
    // Ajoutez d'autres méthodes CRUD si nécessaire
};

module.exports = Message;