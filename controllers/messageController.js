const Message = require('../models/Message');
const User = require('../models/User');
const sendPushNotification = require('../utils/pushNotification');
const { encrypt, decrypt } = require('../utils/crypto');
const upload = require('../utils/upload');
const path = require('path');

exports.uploadMedia = (req, res) => {
    upload.single('file')(req, res, (err) => {
        if (err) return res.status(500).send('File upload error');

        const fileUrl = path.join('/uploads', req.file.filename); // Chemin du fichier sur le serveur
        res.status(200).json({ fileUrl });
    });
};

exports.sendMessage = (req, res) => {
    const { from, to, content } = req.body;
    const encryptedMessage = encrypt(content);

    // Vérifier si le destinataire existe
    User.findByPhoneNumber(to, (err, user) => {
        if (err) return res.status(500).send('Server error');
        if (!user.length) return res.status(404).send('Recipient not found');

        // Créer le message
        Message.create(from, to, encryptedMessage, (err, result) => {
            if (err) return res.status(500).send('Error creating message');

            // Si le destinataire a un token de notification, envoyer une notification push
            if (user[0].expo_push_token) {
                sendPushNotification(user[0].expo_push_token, encryptedMessage)
                    .then(() => {
                        res.status(200).json({ success: true, messageId: result.insertId });
                    })
                    .catch((err) => {
                        console.error('Push notification error:', err);
                        res.status(200).json({ success: true, messageId: result.insertId, notificationError: 'Failed to send push notification' });
                    });
            } else {
                res.status(200).json({ success: true, messageId: result.insertId });
            }
        });
    });
};

exports.getMessagesBetweenUsers = (req, res) => {
    const { userId1, userId2 } = req.params;

    Message.getMessagesBetweenUsers(userId1, userId2, (err, messages) => {
        if (err) return res.status(500).send('Server error');
        const decryptedMessages = messages.map(msg => ({
            ...msg,
            content: decrypt(msg.content)
        }));
        res.status(200).json(decryptedMessages);
    });
};