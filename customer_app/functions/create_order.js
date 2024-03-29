export async function create_order(requestBodyOrder) {
    return fetch('https://personal-4acjyryg.outsystemscloud.com/Order/rest/v1/order/', {
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
        }
    })
    .then(data => {
        if (data) {
            let order_id = data.NewOrder.order_id;
            return order_id
        }

    })
    .catch(error => {
        console.error('Error creating order:', error);
    });    
}