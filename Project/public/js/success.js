// Variables
let cartData = {};
let user = {};

let requestBody = {};

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
    let user_id = user.user_id;
    
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
    
    requestBody =
    {
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
    console.log(cartItems, shipping_info);
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
    fetch('https://personal-4acjyryg.outsystemscloud.com/Order/rest/v1/order/', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
    })
    .then(response => {
        if (response.ok) {
            console.log('Order created successfully');
        } else {
            console.error('Failed to create order:', response.statusText);
        }
    })
    .catch(error => {
        console.error('Error creating order:', error);
    });
}

// Functions call
if (localStorage.getItem('cartData') && localStorage.getItem('user')) {
    createOrder();
    updateInventory();
}