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


app.listen(3000, () => {
    console.log('listening on port 3000;');
});
