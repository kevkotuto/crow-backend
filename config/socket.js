const socketIo = require('socket.io');
const users = {}; // Dictionnaire pour stocker les utilisateurs en ligne

const configureSocket = (server) => {
    const io = socketIo(server, {
        cors: {
            origin: '*',
        },
    });

    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);

        // Quand un utilisateur se connecte avec son ID
        socket.on('userOnline', (userId) => {
            users[userId] = socket.id; // Associe l'ID utilisateur à l'ID du socket
            io.emit('onlineUsers', Object.keys(users)); // Envoie la liste des utilisateurs en ligne à tous les clients
        });

        // Quand un utilisateur commence à écrire
        socket.on('typing', (data) => {
            io.to(users[data.to]).emit('typing', { from: data.from, isTyping: true });
        });

        // Quand un utilisateur arrête d'écrire
        socket.on('stopTyping', (data) => {
            io.to(users[data.to]).emit('typing', { from: data.from, isTyping: false });
        });

        // Gestion de l'envoi de fichiers (via un événement personnalisé si nécessaire)
        socket.on('sendFile', (data) => {
            // Supposons que data contienne les informations de fichier (URL, etc.)
            io.to(users[data.to]).emit('receiveFile', { from: data.from, fileUrl: data.fileUrl });
        });

        // Quand un utilisateur se déconnecte
        socket.on('disconnect', () => {
            const userId = Object.keys(users).find(key => users[key] === socket.id);
            if (userId) {
                delete users[userId]; // Supprime l'utilisateur de la liste des utilisateurs en ligne
                io.emit('onlineUsers', Object.keys(users)); // Met à jour la liste des utilisateurs en ligne
            }
            console.log('User disconnected:', socket.id);
        });
    });
};

module.exports = configureSocket;