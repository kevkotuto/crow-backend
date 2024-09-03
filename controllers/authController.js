const User = require('../models/User');
const sendSMS = require('../utils/sms');
const generateToken = require('../utils/token');

exports.register = (req, res) => {
    const { phoneNumber } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    User.findByPhoneNumber(phoneNumber, (err, user) => {
        if (err) return res.status(500).send('Server error');
        if (user.length) return res.status(400).send('User already exists');

        sendSMS(phoneNumber, `Your OTP code is ${otp}`)
            .then(() => {
                User.create(phoneNumber, (err, result) => {
                    if (err) return res.status(500).send('Server error');
                    const token = generateToken({ phoneNumber });
                    res.status(201).json({ token, otp });
                });
            })
            .catch((err) => res.status(500).send('Failed to send SMS'));
    });
};

// Vérification OTP et autres méthodes