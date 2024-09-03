const express = require('express');
const { sendMessage, getMessagesBetweenUsers } = require('../controllers/messageController');
const { searchMessages, filterMessagesByDate } = require('../controllers/messageController');
const authMiddleware = require('../middlewares/authMiddleware');
const { addReaction, removeReaction } = require('../models/Message');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Message:
 *       type: object
 *       properties:
 *         from:
 *           type: string
 *           description: L'ID de l'expéditeur du message
 *         to:
 *           type: string
 *           description: L'ID du destinataire du message
 *         content:
 *           type: string
 *           description: Le contenu du message
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Date et heure de création du message
 *       required:
 *         - from
 *         - to
 *         - content
 *       example:
 *         from: "123"
 *         to: "456"
 *         content: "Hello!"
 *
 *     Reaction:
 *       type: object
 *       properties:
 *         messageId:
 *           type: string
 *           description: L'ID du message auquel la réaction est associée
 *         reaction:
 *           type: string
 *           description: Le type de réaction 
 *       required:
 *         - messageId
 *         - reaction
 *       example:
 *         messageId: "789"
 *         reaction: 👍
 */

/**
 * @swagger
 * /api/messages/send:
 *   post:
 *     summary: Envoyer un message
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Message'
 *     responses:
 *       200:
 *         description: Message envoyé avec succès
 *       500:
 *         description: Erreur serveur
 */
router.post('/send', authMiddleware, sendMessage);

/**
 * @swagger
 * /api/messages/conversation/{userId1}/{userId2}:
 *   get:
 *     summary: Récupérer les messages entre deux utilisateurs
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId1
 *         schema:
 *           type: string
 *         required: true
 *         description: L'ID du premier utilisateur
 *       - in: path
 *         name: userId2
 *         schema:
 *           type: string
 *         required: true
 *         description: L'ID du second utilisateur
 *     responses:
 *       200:
 *         description: Liste des messages récupérée avec succès
 *       500:
 *         description: Erreur serveur
 */
router.get('/conversation/:userId1/:userId2', authMiddleware, getMessagesBetweenUsers);

/**
 * @swagger
 * /api/messages/search:
 *   get:
 *     summary: Rechercher des messages
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: term
 *         schema:
 *           type: string
 *         required: true
 *         description: Le terme de recherche
 *     responses:
 *       200:
 *         description: Messages trouvés avec succès
 *       500:
 *         description: Erreur serveur
 */
router.get('/search', authMiddleware, (req, res) => {
    const { userId } = req.user;
    const { term } = req.query;
    
    searchMessages(userId, term, (err, messages) => {
        if (err) return res.status(500).send('Server error');
        res.status(200).json(messages);
    });
});

/**
 * @swagger
 * /api/messages/filter:
 *   get:
 *     summary: Filtrer des messages par date
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: Date de début pour le filtrage
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: Date de fin pour le filtrage
 *     responses:
 *       200:
 *         description: Messages filtrés avec succès
 *       500:
 *         description: Erreur serveur
 */
router.get('/filter', authMiddleware, (req, res) => {
    const userId = req.userId;  // Utilisation correcte de req.userId
    const { startDate, endDate } = req.query;
    
    Message.filterMessagesByDate(userId, startDate, endDate, (err, messages) => {
        if (err) {
            console.error('Error filtering messages by date:', err);
            return res.status(500).send('Server error');
        }
        res.status(200).json(messages);
    });
});

/**
 * @swagger
 * /api/messages/react:
 *   post:
 *     summary: Ajouter une réaction à un message
 *     tags: [Messages, Reactions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Reaction'
 *     responses:
 *       200:
 *         description: Réaction ajoutée avec succès
 *       500:
 *         description: Erreur serveur
 */
router.post('/react', authMiddleware, (req, res) => {
    const { messageId, reaction } = req.body;
    const userId = req.userId;  // Utilisez req.userId directement

    addReaction(messageId, userId, reaction, (err) => {
        if (err) return res.status(500).send('Server error');
        res.status(200).json({ success: true });
    });
});

/**
 * @swagger
 * /api/messages/unreact:
 *   post:
 *     summary: Supprimer une réaction d'un message
 *     tags: [Messages, Reactions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Reaction'
 *     responses:
 *       200:
 *         description: Réaction supprimée avec succès
 *       500:
 *         description: Erreur serveur
 */

router.post('/unreact', authMiddleware, (req, res) => {
    const { messageId, reaction } = req.body;
    const userId = req.userId;  // Utilisation correcte de req.userId

    removeReaction(messageId, userId, reaction, (err) => {
        if (err) {
            console.error('Error removing reaction:', err);
            return res.status(500).send('Server error');
        }
        res.status(200).json({ success: true });
    });
});

module.exports = router;