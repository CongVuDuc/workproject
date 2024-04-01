export function create_order(requestBodyOrder) {
    return new Promise((resolve, reject) => {
        fetch('https://personal-4acjyryg.outsystemscloud.com/Order/rest/v1/order/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBodyOrder)
        })
        .then(response => {
            if (response.ok) {
                console.log('Order created successfully');
                return response.json(); // Parse response body as JSON
            } else {
                console.error('Failed to create order:', response.statusText);
                reject(new Error('Failed to create order: ' + response.statusText));
            }
        })
        .then(data => {
            if (data) {
                let order_id = data.NewOrder.order_id;
                resolve(data); // Resolve the Promise with the order_id
            } else {
                reject(new Error('No data returned from server'));
            }
        })
        .catch(error => {
            console.error('Error creating order:', error);
            reject(error); // Reject the Promise with the error
        });
    });
}
