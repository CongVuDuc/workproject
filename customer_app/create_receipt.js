import axios from 'axios';

export function create_receipt(order_id, requestBodyReceipt) {
    return new Promise((resolve, reject) => {
        if (!order_id) {
            console.error('Order ID is missing. Cannot create receipt.');
            reject(new Error('Order ID is missing. Cannot create receipt.'));
            return;
        }

        axios.post('https://personal-4acjyryg.outsystemscloud.com/Receipt/rest/v2/payment/', requestBodyReceipt, {
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if ((response.status >= 200 && response.status < 300)) {
                console.log('Receipt created successfully');
                resolve(response.data); // Resolve the Promise with the response data
            } else {
                console.error('Failed to create receipt:', response.statusText);
                reject(new Error('Failed to create receipt: ' + response.statusText));
            }
        })
        .catch(error => {
            console.error('Error creating receipt:', error);
            reject(error.Error); // Reject the Promise with the error
        });
    });
}
