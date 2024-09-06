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
        res.status(200).json({ fileUrl, filename: req.file.filename });
    });
};

exports.sendMessage = (req, res) => {
    const { from, to, content, type } = req.body;  // Le type de contenu est maintenant passé dans la requête
    let encryptedMessage;

    if (type === 'text') {
        encryptedMessage = encrypt(content);
    } else if (type === 'image' || type === 'audio' || type === 'file') {
        encryptedMessage = encrypt(content);  // Ici, `content` est le nom du fichier, pas le texte
    } else {
        return res.status(400).send('Invalid message type');
    }

    // Trouver l'utilisateur expéditeur
    User.findByPhoneNumber(from, (err, sender) => {
        if (err) {
            console.error('Database error when looking up sender:', err);
            return res.status(500).send('Server error');
        }
        if (!sender.length) return res.status(404).send('Sender not found');

        // Trouver l'utilisateur destinataire
        User.findByPhoneNumber(to, (err, recipient) => {
            if (err) {
                console.error('Database error when looking up recipient:', err);
                return res.status(500).send('Server error');
            }
            if (!recipient.length) return res.status(404).send('Recipient not found');

            // Créer le message avec les IDs des utilisateurs
            const senderId = sender[0].id;
            const receiverId = recipient[0].id;

            Message.create(senderId, receiverId, encryptedMessage, type, (err, result) => {  // Passer `type` comme paramètre
                if (err) {
                    console.error('Database error when creating message:', err);
                    return res.status(500).send('Error creating message');
                }

                // Si le destinataire a un token de notification, envoyer une notification push
                if (recipient[0].expo_push_token) {
                    sendPushNotification(recipient[0].expo_push_token, encryptedMessage)
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
    });
};

exports.getMessagesBetweenUsers = (req, res) => {
    const { userId1, userId2 } = req.params;
    const requestingUserId = req.userId;

    // Vérifiez que l'utilisateur fait bien partie de la conversation
    if (requestingUserId !== parseInt(userId1) && requestingUserId !== parseInt(userId2)) {
        return res.status(403).json({ message: "You don't have permission to access these messages" });
    }

    Message.getMessagesBetweenUsers(userId1, userId2, (err, messages) => {
        if (err) {
            console.error('Database error when retrieving messages:', err);
            return res.status(500).send('Server error');
        }

        const processedMessages = messages.map(msg => {
            if (msg.type === 'text') {
                msg.content = decrypt(msg.content);
            } else if (msg.type === 'image' || msg.type === 'audio' || msg.type === 'file') {
                msg.content = path.join('/uploads', decrypt(msg.content));
            }
            return msg;
        });

        res.status(200).json(processedMessages);
    });
};