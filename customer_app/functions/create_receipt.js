export function create_receipt(order_id, requestBodyReceipt) {
    return new Promise((resolve, reject) => {
        if (!order_id) {
            console.error('Order ID is missing. Cannot create receipt.');
            reject(new Error('Order ID is missing. Cannot create receipt.'));
            return;
        }

        fetch('https://personal-4acjyryg.outsystemscloud.com/Receipt/rest/v2/payment/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBodyReceipt)
        })
        .then(response => {
            if (response.ok) {
                console.log('Receipt created successfully');
                resolve(response.json()); // Resolve the Promise with the response data
            } else {
                console.error('Failed to create receipt:', response.statusText);
                reject(new Error('Failed to create receipt: ' + response.statusText));
            }
        })
        .catch(error => {
            console.error('Error creating receipt:', error);
            reject(error); // Reject the Promise with the error
        });
    });
}
