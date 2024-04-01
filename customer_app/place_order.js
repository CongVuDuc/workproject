import express from 'express';
import dotenv from 'dotenv';

import {update_store_credit} from './update_store_credit.js';
import {create_order} from './create_order.js';
import {create_receipt} from './create_receipt.js';
import {update_inventory} from './update_inventory.js';
import {send_sms} from './send_sms.js';
import {process_one_time_payment, process_payment_checkout} from './payment.js';
import {update_receipt_number} from './update_receipt_number.js';

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

    // Create Order
    try {
        const result_order = await create_order(requestBodyOrder);
        console.log("Order created successfully:", result_order);
        let order_id = result_order.NewOrder.order_id
        
        const requestBodyReceipt = {
            "cust_id": user_id,
            "subtotal": total_price,
            "shipping_method": shipping_info.shipping_method,
            "credits_used": 0,
            "contact_no": shipping_info.contact_number,
            "order_id": order_id,
        }

        // Create Receipt
        try {
            const result_receipt = await create_receipt(user_id, requestBodyReceipt);
            console.log("Receipt created successfully:", result_receipt);
            const receipt_no = JSON.stringify(result_receipt.Receipt.receipt_no)
            await update_receipt_number(order_id, receipt_no)
        } catch (error) {
            console.error("Failed to create receipt:", error);
        }

    } catch (error) {
        console.error("Failed to create order:", error);
    }

    // Update Inventory
    for (const cartItem of cartItems) {
        update_inventory(cartItem)
        .then(() => {
            console.log("Inventory updated successfully for bouquet ID:", cartItem.bouquet_id);
        })
        .catch(error => {
            console.error("Error updating inventory for bouquet ID:", cartItem.bouquet_id, error);
        });
    }


    // Update credit_used
    if (credit_used > 0) {
        update_store_credit(user_id, deduct_credit)
        .then(data => {
            console.log("Customer store credit updated successfully:", data);
        })
        .catch(error => {
            console.error("Error updating customer store credit:", error);
        });
    }

    // Invoke send_sms
    const message = "Order placed successfully!"

    send_sms(message)
    .then(data => {
        console.log("SMS sent successfully:", data);
    })
    .catch(error => {
        console.error("Failed to send SMS:", error);
    });
})

// Process Top-up
app.post('/process-topup', async (req, res) => {

    const topup_amount = req.body.topup_amount;
    const user_id = req.body.user_id;

    // Update Store Credit
    await update_store_credit(user_id, topup_amount)
    .then(data => {
        console.log("Customer store credit updated successfully:", data);
    })
    .catch(error => {
        console.error("Error updating customer store credit:", error);
    });

    // Send sms
    const message = "Top-up successfully!"
    await send_sms(message)
    .then(data => {
        console.log("Customer store credit updated successfully:", data);
    })
    .catch(error => {
        console.error("Error updating customer store credit:", error);
    });
})

// Process payment chekout
app.post('/process-payment-checkout', async (req, res) => {
    const total_price = req.body.total_price
    const shipping_info = req.body.shipping_info
    const credit_used = req.body.credit_used

    process_payment_checkout(total_price, shipping_info, credit_used)
    .then((url) => {
        // Return url to client side
        res.json({ url });
    })
    .catch((err) => {
        console.error(err);
    });
})
// Process one-time payment
app.post('/process-one-time-payment', async (req, res) => {
    const balance_amt = req.body.balance_amt
    const credit_used = req.body.credit_used

    process_one_time_payment(balance_amt, credit_used)
    .then((url) => {
        // Return url to client side
        res.json({ url });
    })
    .catch((err) => {
        console.error(err);
    });
})

app.listen(3000, '0.0.0.0', () => {
    console.log('listening on port 3000;');
});
