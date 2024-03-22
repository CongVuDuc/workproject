export async function send_sms(message) {
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
    })
    .catch(error => {
        console.error('Error sending SMS:', error.message);
    });
}