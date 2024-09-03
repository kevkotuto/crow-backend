const axios = require('axios');

const sendPushNotification = async (expoPushToken, message) => {
    try {
        const response = await axios.post('https://exp.host/--/api/v2/push/send', {
            to: expoPushToken,
            sound: 'default',
            body: message,
            data: { message },
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error sending push notification:', error);
        throw error;
    }
};

module.exports = sendPushNotification;