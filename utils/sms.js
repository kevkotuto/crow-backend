const axios = require('axios');

const sendSMS = async (phoneNumber, message) => {
    try {
        const response = await axios.post('https://api.ng.termii.com/api/sms/send', {
            to: phoneNumber,
            from: 'General Ci',
            sms: message,
            type: 'plain',
            channel: 'generic',
            api_key: process.env.TERMII_API_KEY,
        });
        return response.data;
    } catch (error) {
        console.error('Error sending SMS:', error);
        throw error;
    }
};

module.exports = sendSMS;