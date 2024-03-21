

// Variables
let cartData = {};
let user = {};

let requestBodyOrder = {};
let requestBodyReceipt = {};

let orderItems = [];
let orderItem = {};

let cartItems = [];
let total_price = 0;
let shipping_info = {};
let user_id = '';


if (localStorage.getItem('cartData') && localStorage.getItem('user')) {
    cartData = JSON.parse(localStorage.getItem('cartData'));
    cartItems = cartData['cartItems'];
    total_price = cartData['total_price'];
    shipping_info = JSON.parse(localStorage.getItem('shipping_info'));
    
    user = JSON.parse(localStorage.getItem('user'));
    user_id = user.user_id;
    
    for (item of cartItems) {
        orderItem = {
            'bouquet_id': item.bouquet_id,
            'bouquet_name' : item.bouquet_name,
            'size': item.size,
            'quantity': item.cart_quantity,
            'price': item.price
        };
        orderItems.push(orderItem);
    }
    
    requestBodyOrder = {
        "cust_id" : user_id,
        "total_price" : 0.1,
        "shipping_method" : shipping_info.shipping_method,
        "address" : shipping_info.address,
        "contact_no" : shipping_info.contact_number,
        "OrderItem" : orderItems
    }; 

}

// Update Inventory
async function updateInventory() {
    // console.log(cartItems, shipping_info);
    for (const item of cartItems) {
        try {
            const bouquet_id = item.bouquet_id;
            const cart_quantity = -1 * item.cart_quantity;
            const url = `https://personal-4acjyryg.outsystemscloud.com/Inventory/rest/v1/inventory/${bouquet_id}/${cart_quantity}/`;
            
            // Make fetch request with 'no-cors' mode option
            const response = await fetch(url, {method: 'put' } );
            if (response.ok) {
                console.log(`Inventory updated for bouquet ID ${bouquet_id}`);
            } else {
                console.error(`Failed to update inventory for bouquet ID ${bouquet_id}`);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }
    localStorage.removeItem('cartData');
}

// Create New Order
async function createOrder() {
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
        order_id = data.NewOrder.order_id;
        console.log(order_id) ; // Return the fetched data
        return order_id
    })
    .catch(error => {
        console.error('Error creating order:', error);
    });    
}

//Create receipt
async function createReceipt(order_id) {
    console.log(order_id)
    if (order_id) {
        requestBodyReceipt = {
            "cust_id": user_id,
            "subtotal": total_price,
            "shipping_method": shipping_info.shipping_method,
            "credits_used": 0,
            "contact_no": shipping_info.contact_number,
            "order_id": order_id,
        }
        console.log(requestBodyReceipt)
        fetch('https://personal-4acjyryg.outsystemscloud.com/Payment/rest/v1/payment/', {
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

// Send sms
async function sendSms() {
    message = "Order placed successfully!"
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

// Functions call
if (localStorage.getItem('cartData') && localStorage.getItem('user')) {
    (async () => {
        await updateInventory();
        const order_id = JSON.parse(await createOrder());
        await createReceipt(order_id);
        sendSms();
    })();
}