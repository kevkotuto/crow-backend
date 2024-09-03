require('dotenv').config();
const express = require('express');
const http = require('http');
const configureSocket = require('./config/socket');
const authRoutes = require('./routes/authRoutes');
const messageRoutes = require('./routes/messageRoutes');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./config/swaggerOptions');

const app = express();
const server = http.createServer(app);

// Middleware
app.use(express.json());

// Routes
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);

// Socket.io
configureSocket(server);

// Lancer le serveur
const PORT = process.env.PORT || 4001;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Swagger API docs available at http://localhost:${PORT}/api-docs`);
});