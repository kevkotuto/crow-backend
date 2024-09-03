const User = require('../models/User');
const sendSMS = require('../utils/sms');
const generateToken = require('../utils/token');

let otpStore = {};  // Stockage temporaire des OTP et du nom complet

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user by sending an OTP
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *             required:
 *               - fullName
 *               - phoneNumber
 *     responses:
 *       201:
 *         description: OTP sent successfully
 *       400:
 *         description: User already exists
 *       500:
 *         description: Server error
 */
exports.register = (req, res) => {
    const { fullName, phoneNumber } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    User.findByPhoneNumber(phoneNumber, (err, user) => {
        if (err) {
            console.error('Database error during phone number lookup:', err);
            return res.status(500).send('Server error');
        }
        if (user.length) {
            console.warn('User already exists:', phoneNumber);
            return res.status(400).send('User already exists');
        }

        sendSMS(phoneNumber, `Your OTP code is ${otp}`)
            .then(() => {
                console.log('SMS sent, storing OTP and fullName in memory...');
                otpStore[phoneNumber] = { otp, fullName };  // Stocke l'OTP et le nom complet en mémoire
                res.status(201).json({ message: 'OTP sent successfully' });
            })
            .catch((err) => {
                console.error('Failed to send SMS:', err);
                res.status(500).send('Failed to send SMS');
            });
    });
};

/**
 * @swagger
 * /api/auth/verify-otp:
 *   post:
 *     summary: Verify OTP and create a user account
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phoneNumber:
 *                 type: string
 *               otp:
 *                 type: string
 *               pushToken:
 *                 type: string
 *             required:
 *               - phoneNumber
 *               - otp
 *     responses:
 *       200:
 *         description: User created and JWT token returned
 *       400:
 *         description: Invalid OTP
 *       500:
 *         description: Server error
 */


exports.verifyOtp = (req, res) => {
    const { phoneNumber, otp, pushToken } = req.body;

    if (otpStore[phoneNumber] && otpStore[phoneNumber].otp === otp) {
        const fullName = otpStore[phoneNumber].fullName;
        delete otpStore[phoneNumber];  // Supprime l'OTP après vérification
        console.log('OTP verified, creating user...');
        console.log('Full Name:', fullName);  // Affiche le nom complet

        // Créez l'utilisateur dans la base de données
        User.create(fullName, phoneNumber, pushToken, (err, result) => {
            if (err) {
                console.error('Database error during user creation:', err);
                return res.status(500).send('Server error');
            }

            const userId = result.insertId; // Récupérer l'ID de l'utilisateur nouvellement créé
            const token = generateToken({ id: userId, phone_number: phoneNumber });
            res.status(200).json({ token });
        });
    } else {
        console.log(otpStore[phoneNumber]?.otp, otp);  // Affiche l'OTP stocké et l'OTP fourni
        console.warn('Invalid OTP for phone number:', phoneNumber);
        res.status(400).send('Invalid OTP');
    }
};

/**
 * @swagger
 * /api/auth/send-otp-login:
 *   post:
 *     summary: Send OTP for login
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phoneNumber:
 *                 type: string
 *             required:
 *               - phoneNumber
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *       400:
 *         description: User not found
 *       500:
 *         description: Server error
 */
exports.sendOtpForLogin = (req, res) => {
    const { phoneNumber } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    User.findByPhoneNumber(phoneNumber, (err, user) => {
        if (err) {
            console.error('Database error during phone number lookup:', err);
            return res.status(500).send('Server error');
        }
        if (!user.length) {
            console.warn('User not found:', phoneNumber);
            return res.status(400).send('User not found');
        }

        sendSMS(phoneNumber, `Your login OTP code is ${otp}`)
            .then(() => {
                console.log('Login OTP sent, storing OTP in memory...');
                otpStore[phoneNumber] = { otp };  // Stocke l'OTP en mémoire
                res.status(200).json({ message: 'OTP sent successfully' });
            })
            .catch((err) => {
                console.error('Failed to send OTP SMS:', err);
                res.status(500).send('Failed to send OTP');
            });
    });
};

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Verify OTP and log in the user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phoneNumber:
 *                 type: string
 *               otp:
 *                 type: string
 *             required:
 *               - phoneNumber
 *               - otp
 *     responses:
 *       200:
 *         description: User logged in and JWT token returned
 *       400:
 *         description: Invalid OTP
 *       500:
 *         description: Server error
 */


exports.login = (req, res) => {
    const { phoneNumber, otp } = req.body;

    User.findByPhoneNumber(phoneNumber, (err, user) => {
        if (err) {
            console.error('Database error during phone number lookup:', err);
            return res.status(500).send('Server error');
        }
        if (!user.length) {
            console.warn('User not found:', phoneNumber);
            return res.status(400).send('User not found');
        }

        if (otpStore[phoneNumber] && otpStore[phoneNumber].otp === otp) {
            delete otpStore[phoneNumber];  // Supprime l'OTP après vérification
            
            const userId = user[0].id;  // Récupère l'ID de l'utilisateur
            const token = generateToken({ id: userId, phone_number: phoneNumber });
            
            res.status(200).json({ token });
        } else {
            console.warn('Invalid OTP for phone number:', phoneNumber);
            res.status(400).send('Invalid OTP');
        }
    });
};

/**
 * @swagger
 * /api/auth/user:
 *   get:
 *     summary: Get user information from JWT token
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User information returned
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
exports.getUser = (req, res) => {
    const userId = req.userId;  // Utilisez userId au lieu de phoneNumber

    User.findById(userId, (err, user) => {  // Assurez-vous que vous avez une méthode findById dans votre modèle User
        if (err) {
            console.error('Database error during user lookup:', err);
            return res.status(500).send('Server error');
        }
        if (!user.length) {
            console.warn('User not found:', userId);
            return res.status(404).send('User not found');
        }

        res.status(200).json(user[0]);  // Supposons que `user` soit un tableau et renvoie les informations de l'utilisateur
    });
};

/**
 * @swagger
 * /api/auth/user:
 *   put:
 *     summary: Update user information
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *               expoPushToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: No fields to update
 *       500:
 *         description: Server error
 */
exports.editUser = (req, res) => {
    const userId = req.userId;  // Utilisez userId au lieu de phoneNumber
    const { fullName, expoPushToken } = req.body;

    // Construire la requête de mise à jour en fonction des champs fournis
    let query = 'UPDATE users SET';
    const updates = [];
    const params = [];

    if (fullName) {
        updates.push('full_name = ?');
        params.push(fullName);
    }

    if (expoPushToken) {
        updates.push('expo_push_token = ?');
        params.push(expoPushToken);
    }

    if (updates.length === 0) {
        return res.status(400).json({ message: 'No fields to update' });
    }

    query += ` ${updates.join(', ')} WHERE id = ?`;  // Mettre à jour en fonction de l'userId
    params.push(userId);

    User.update(query, params, (err, result) => {
        if (err) {
            console.error('Database error during user update:', err);
            return res.status(500).send('Server error');
        }

        res.status(200).json({ message: 'User updated successfully' });
    });
};