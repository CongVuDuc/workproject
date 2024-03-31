export async function create_receipt(order_id, requestBodyReceipt) {
    if (order_id) {
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
            } else {
                console.error('Failed to create receipt:', response.statusText);
            }
        })
        .catch(error => {
            console.error('Error creating receipt:', error);
        });
    }
    else {
        console.error('Order ID is missing. Cannot create receipt.');
        return;
    }
}