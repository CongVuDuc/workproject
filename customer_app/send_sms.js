export function send_sms(message) {
    return new Promise((resolve, reject) => {
        fetch('http://localhost:5005/send_sms', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to send SMS');
            }
            console.log('SMS sent successfully!');
            return response.json();
        })
        .then(data => {
            resolve(data); // Resolve the Promise with the response data
        })
        .catch(error => {
            console.error('Error sending SMS:', error.message);
            reject(error); // Reject the Promise with the error
        });
    });
}
