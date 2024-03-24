import express from 'express';
import dotenv from 'dotenv';
import stripe from 'stripe';


import { update_store_credit } from './functions/update_store_credit.js';
import { create_order } from './functions/create_order.js';
import { create_receipt } from './functions/create_receipt.js';
import { update_inventory } from './functions/update_inventory.js';
import { send_sms } from './functions/send_sms.js'

// Load variables
dotenv.config();

// Start Server
const app = express();

app.use(express.static('public'));
app.use(express.json());

// Home Route
app.get('/', (req, res) => {
    res.sendFile("home.html", {root: "public"});
})

//Success Route
app.get('/success', (req, res) => {
    res.sendFile("success.html", {root: "public"})
})

//Cancel Route
app.get('/cancel', (req, res) => {
    res.sendFile("checkout.html", {root: "public"})
})

// Topup Route
app.get('/top-up', (req, res) => {
    res.sendFile("topup.html", {root: "public"})
})

// Process order
app.post('/process-order', async (req, res) => {

    const cartItems = req.body.cartItems;
    const total_price = req.body.total_price;
    const user_id = req.body.user_id;
    const credit_used = req.body.credit_used;
    const deduct_credit = req.body.deduct_credit;
    const requestBodyOrder = req.body.requestBodyOrder;
    const shipping_info = req.body.shipping_info;

    update_inventory(cartItems);

    const order_id = await create_order(requestBodyOrder);

    if (credit_used > 0) {
        update_store_credit(user_id, deduct_credit);
    }

    const requestBodyReceipt = {
        "cust_id": user_id,
        "subtotal": total_price,
        "shipping_method": shipping_info.shipping_method,
        "credits_used": 0,
        "contact_no": shipping_info.contact_number,
        "order_id": order_id,
    }
    
    create_receipt(user_id, requestBodyReceipt)

    const message = "Order placed successfully!"
    send_sms(message)
})

// Process Top-up
app.post('/process-topup', async (req, res) => {

    const topup_amount = req.body.topup_amount;
    const user_id = req.body.user_id;

    update_store_credit(user_id, topup_amount);

    const message = "Top-up successfully!"
    send_sms(message)
})
// Process Request



// Stripe
let stripeGateway = stripe(process.env.stripe_api);

let DOMAIN = process.env.DOMAIN;


// Order Check-out
app.post('/stripe-checkout', async (req, res) => {
    const shipping_method = req.body.shipping_method
    const total_amount = req.body.total_amount

    let shippingRateId;
    if (shipping_method == "S") {
        shippingRateId = "shr_1Ow8yyP0edbtrzUR9Kfw48z2";
    }
    if (shipping_method == "D") {
        shippingRateId = "shr_1Ow92qP0edbtrzURa3Du9bRL";
    }
    if (shipping_method == "F") {
        shippingRateId = "shr_1Ow9NRP0edbtrzUR2rqTgw97"
    }

    const lineItems = [{
        price_data: {
            currency: 'sgd',
            product_data: {
                name: "Lilee.coo Order",
            },
            unit_amount: total_amount*100,
        },
        quantity: 1,
    }]

    // Create checkout session
    const session = await stripeGateway.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        success_url: `${DOMAIN}/success`,
        cancel_url: `${DOMAIN}/cancel`,
        line_items: lineItems,
        shipping_options: [
            {
                shipping_rate: shippingRateId,
            }
        ],

    })
    res.json(session.url);
});

//One-time payment
app.post('/one-time-payment', async (req, res) => {
    const total_amount = req.body.total_amount
    const lineItems = [{
            price_data: {
                currency: 'sgd',
                product_data: {
                    name: "Lilee.coo Credit Top-up",
                },
                unit_amount: total_amount*100,
            },
            quantity: 1,
    }]

    // Create checkout session
    const session = await stripeGateway.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        success_url: `${DOMAIN}/success`,
        cancel_url: `${DOMAIN}/top-up`,
        line_items: lineItems,
    })
    res.json(session.url);
});


app.listen(3000, () => {
    console.log('listening on port 3000;');
});
