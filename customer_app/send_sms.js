import axios from 'axios';

export function send_sms(message) {
    return new Promise((resolve, reject) => {

        let sms_url = "";

        if (process.env.payment_URL) {
            sms_url = process.env.messaging_URL;
        }
        else {
            sms_url = 'http://localhost:5005/send_sms'
        }

        axios.post(sms_url, {
            message: message
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            console.log('SMS sent successfully!');
            resolve(response.data); // Resolve the Promise with the response data
        })
        .catch(error => {
            console.error('Error sending SMS:', error.message);
            reject(error); // Reject the Promise with the error
        });
    });
}
