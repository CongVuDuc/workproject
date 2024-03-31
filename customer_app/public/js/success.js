// Back to Homepage
document.getElementById('back').addEventListener('click', () => {
    window.location.href = 'home.html'
})

// Variables
let cartData = {};
let user = {};

// Data to pass in to process_order
let requestBodyOrder = {};
let requestBodyReceipt = {};
let requestBodyRequest = {}

let orderItems = [];
let orderItem = {};

let cartItems = [];
let total_price = 0;
let shipping_info = {};
let user_id = '';

let credit_used = 0;
let deduct_credit = 0;

let payment_type = '';

//Data to pass in process_topup
let topup_amount = 0;

if (localStorage.getItem('user') && localStorage.getItem('payment_type')) {
    
    // Order Data
    payment_type = localStorage.getItem('payment_type');

    // User ID
    user = JSON.parse(localStorage.getItem('user'));
    user_id = user.user_id;

    // RequestData
    if (localStorage.getItem('requestData')) {
        const requestData = JSON.parse(localStorage.getItem('requestData'));
        requestBodyRequest = requestData;
    }
    


    if (localStorage.getItem('cartData')) {
        cartData = JSON.parse(localStorage.getItem('cartData'));
        cartItems = cartData['cartItems'];
        total_price = cartData['total_price'];

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
    }
    
    if (localStorage.getItem('shipping_info')) {
        shipping_info = JSON.parse(localStorage.getItem('shipping_info'));
        requestBodyOrder = {
            "cust_id" : user_id,
            "total_price" : 0.1,
            "shipping_method" : shipping_info.shipping_method,
            "address" : shipping_info.address,
            "contact_no" : shipping_info.contact_number,
            "OrderItem" : orderItems
        }; 
    }

    if (localStorage.getItem('credit_used')) {
        credit_used = JSON.parse(localStorage.getItem('credit_used'))
        deduct_credit = parseInt(credit_used)*-1
    }

    console.log(credit_used, deduct_credit)
    
    // Request Data

    // Topup Data
    topup_amount = JSON.parse(localStorage.getItem('topup_amount'));

    // Use payment_type to define which is being processed
    if (payment_type == 'order') {
        process_order(cartItems, total_price, shipping_info, user_id, credit_used, deduct_credit, requestBodyOrder)
    }

    if (payment_type == 'request') {
        process_request(requestBodyRequest)
    }

    console.log(payment_type)
    if (payment_type == 'topup') {
        process_topup(user_id, topup_amount)
    }

}

// Process order
async function process_order(cartItems, total_price, shipping_info, user_id, credit_used, deduct_credit, requestBodyOrder) {
    console.log(requestBodyOrder)
    console.log(user_id)
    fetch('/process-order', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        cartItems: cartItems,
        total_price: total_price,
        shipping_info: shipping_info,
        user_id: user_id,
        credit_used: credit_used,
        deduct_credit: deduct_credit,
        requestBodyOrder: requestBodyOrder,
        requestBodyReceipt: requestBodyReceipt
    })
    })
    .then(response => {
        if (response.ok) {
            console.log('Order created successfully');
            return response.json(); // Parse response body as JSON
        } else {
            console.error('Failed to create order:', response.statusText);
        }
    })
    .catch(error => {
        console.error('Error creating order:', error);
    });

    // Rmb to remove these data after the function is triggered so that it won't trigger again on page reload
    localStorage.removeItem('cartData');
    localStorage.removeItem('payment_type');
    localStorage.removeItem('shipping_info');
    localStorage.removeItem('credit_used');
    
}

// Process Request
async function process_request(requestBodyRequest) {
<<<<<<< Updated upstream
    let order_id = requestBodyRequest.order_id
    let request_id = requestBodyRequest.request_id
    let order_status = requestBodyRequest.order_status

=======
>>>>>>> Stashed changes
    fetch('http://localhost:5200/request_handler', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            order_id: order_id,
            request_id: request_id,
            order_status: order_status
        })
        })
        .then(response => {
            if (response.ok) {
                console.log('Request processed successfully');
                return response.json(); // Parse response body as JSON
            } else {
                console.error('Failed to process request:', response.statusText);
            }
        })
        .catch(error => {
            console.error('Error Processing Request:', error);
        });
        
    // Rmb to remove these data after the function is triggered so that it won't trigger again on page reload
    localStorage.removeItem('payment_type');
    localStorage.removeItem('requestData');
    localStorage.removeItem('credit_used');
}

// Process topup
async function process_topup(user_id, topup_amount) {
    fetch('/process-topup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            topup_amount: topup_amount,
            user_id: user_id
        })
        })
        .then(response => {
            if (response.ok) {
                console.log('Top-up successfully');
                return response.json(); // Parse response body as JSON
            } else {
                console.error('Failed to Top-up:', response.statusText);
            }
        })
        .catch(error => {
            console.error('Error Topping-up:', error);
        });
        
    // Rmb to remove these data after the function is triggered so that it won't trigger again on page reload
    localStorage.removeItem('payment_type');
    localStorage.removeItem('topup_amount');
}



