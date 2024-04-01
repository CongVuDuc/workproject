import axios from 'axios';

export function create_order(requestBodyOrder) {
    return new Promise((resolve, reject) => {
        axios.post('https://personal-4acjyryg.outsystemscloud.com/Order/rest/v1/order/', requestBodyOrder, {
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (response.status === 200) {
                console.log('Order created successfully');
                const data = response.data;
                if (data && data.NewOrder && data.NewOrder.order_id) {
                    const order_id = data.NewOrder.order_id;
                    resolve(order_id); // Resolve the Promise with the order_id
                } else {
                    reject(new Error('No order ID returned from server'));
                }
            } else {
                console.error('Failed to create order:', response.statusText);
                reject(new Error('Failed to create order: ' + response.statusText));
            }
        })
        .catch(error => {
            console.error('Error creating order:', error);
            reject(error); // Reject the Promise with the error
        });
    });
}
