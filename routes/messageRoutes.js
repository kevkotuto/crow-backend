const express = require('express');
const { sendMessage, getMessagesBetweenUsers } = require('../controllers/messageController');
const { searchMessages, filterMessagesByDate } = require('../controllers/messageController');
const { addReaction, removeReaction } = require('../controllers/messageController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Route pour envoyer un message
router.post('/send', authMiddleware, sendMessage);

// Route pour récupérer les messages entre deux utilisateurs
router.get('/conversation/:userId1/:userId2', authMiddleware, getMessagesBetweenUsers);

router.get('/search', authMiddleware, (req, res) => {
    const { userId } = req.user; // Assurez-vous que l'utilisateur est authentifié
    const { term } = req.query;
    
    searchMessages(userId, term, (err, messages) => {
        if (err) return res.status(500).send('Server error');
        res.status(200).json(messages);
    });
});

// Route pour filtrer des messages par date
router.get('/filter', authMiddleware, (req, res) => {
    const { userId } = req.user;
    const { startDate, endDate } = req.query;
    
    filterMessagesByDate(userId, startDate, endDate, (err, messages) => {
        if (err) return res.status(500).send('Server error');
        res.status(200).json(messages);
    });
});
router.post('/react', authMiddleware, (req, res) => {
    const { messageId, reaction } = req.body;
    const { userId } = req.user;
    
    addReaction(messageId, userId, reaction, (err) => {
        if (err) return res.status(500).send('Server error');
        res.status(200).json({ success: true });
    });
});

// Route pour supprimer une réaction
router.post('/unreact', authMiddleware, (req, res) => {
    const { messageId, reaction } = req.body;
    const { userId } = req.user;
    
    removeReaction(messageId, userId, reaction, (err) => {
        if (err) return res.status(500).send('Server error');
        res.status(200).json({ success: true });
    });
});


module.exports = router;