import express from 'express';
import dotenv from 'dotenv';
import * as amqp_connection from './amqp_connection.js';
import { update_store_credit } from './update_store_credit.js';
import { create_order } from './create_order.js';
import { create_receipt } from './create_receipt.js';
import { update_inventory } from './update_inventory.js';
import { send_sms } from './send_sms.js';
import { process_one_time_payment, process_payment_checkout } from './payment.js';
import { update_receipt_number } from './update_receipt_number.js';

// Load variables
dotenv.config();

const exchangename = process.env.exchangename || 'order_topic';
const exchangetype = process.env.exchangetype || 'topic';
let connection;
let channel;

// Start Server
const app = express();

app.use(express.static('public'));
app.use(express.json());

// Setup RabbitMQ
async function setupRabbitMQ() {
    try {
        connection = await amqp_connection.createConnection();
        channel = await connection.createChannel(); // Create a channel using createChannel() method
        console.log('RabbitMQ connection and channel setup completed successfully.');

        // Check if the exchange is created, exit the program if not
        const isExchangeCreated = await amqp_connection.checkExchange(channel, exchangename, exchangetype);
        if (!isExchangeCreated) {
            console.error("\nCreate the 'Exchange' before running this microservice. \nExiting the program.");
            process.exit(1);
        }
    } catch (error) {
        console.error('Error setting up RabbitMQ:', error);
        process.exit(1);
    }
}

setupRabbitMQ()
    .then(() => {
        console.log('RabbitMQ setup completed successfully.');
        startServer();
    })
    .catch(error => {
        console.error('Error setting up RabbitMQ:', error);
        process.exit(1);
    });

// Start Server
function startServer() {
    // Home Route
    app.get('/', (req, res) => {
        res.sendFile("home.html", { root: "public" });
    });

    // Success Route
    app.get('/success', (req, res) => {
        res.sendFile("success.html", { root: "public" });
    });

    // Cancel Route
    app.get('/cancel', (req, res) => {
        res.sendFile("checkout.html", { root: "public" });
    });

    // Topup Route
    app.get('/top-up', (req, res) => {
        res.sendFile("topup.html", { root: "public" });
    });

    // Process order
    app.post('/process-order', async (req, res) => {
        const cartItems = req.body.cartItems;
        const total_price = req.body.total_price;
        const user_id = req.body.user_id;
        const credit_used = req.body.credit_used;
        const deduct_credit = req.body.deduct_credit;
        const requestBodyOrder = req.body.requestBodyOrder;
        const shipping_info = req.body.shipping_info;

        try {
            const result_order = await create_order(requestBodyOrder);
            console.log("Order created successfully:", result_order);
            let order_id = result_order.NewOrder.order_id;

            // Publish message to RabbitMQ
            const order_log_message = JSON.stringify({
                user_id,
                order_id,
                total_price,
                shipping_info,
                credit_used,
                deduct_credit
            });
            channel.publish(exchangename, 'order.infor', Buffer.from(order_log_message));
            console.log("Order message published to RabbitMQ.");

            const requestBodyReceipt = {
                "cust_id": user_id,
                "subtotal": total_price,
                "shipping_method": shipping_info.shipping_method,
                "credits_used": 0,
                "contact_no": shipping_info.contact_number,
                "order_id": order_id,
            }

            // Update Inventory
            for (const cartItem of cartItems) {
                update_inventory(cartItem)
                    .then(() => {
                        console.log("Inventory updated successfully for bouquet ID:", cartItem.bouquet_id);
                        const inventory_log_message = JSON.stringify("Inventory updated successfully for bouquet ID: " + cartItem.bouquet_id)
                        channel.publish(exchangename, 'inventory.infor', Buffer.from(inventory_log_message));
                        console.log("Inventory message published to RabbitMQ.");
                    })
                    .catch(error => {
                        console.error("Error updating inventory for bouquet ID:", cartItem.bouquet_id, error);
                        const inventory_log_message = JSON.stringify("Error updating inventory for bouquet ID: " + cartItem.bouquet_id + error)
                        channel.publish(exchangename, 'inventory.error', Buffer.from(inventory_log_message));
                        console.log("Inventory message published to RabbitMQ.");
                    });
            }

            // Update credit_used
            if (credit_used > 0) {
                update_store_credit(user_id, deduct_credit)
                    .then(data => {
                        console.log("Customer store credit updated successfully: " + data);
                        const update_credit_log_message = JSON.stringify("Customer store credit updated successfully:" + data.Result.StatusLine)
                        channel.publish(exchangename, 'updateCredit.infor', Buffer.from(update_credit_log_message));
                        console.log("Update-credit message published to RabbitMQ.");
                    })
                    .catch(error => {
                        console.error("Error updating customer store credit:", error);
                        const update_credit_log_message = JSON.stringify("Error updating customer store credit: " + error)
                        channel.publish(exchangename, 'updateCredit.error', Buffer.from(update_credit_log_message));
                        console.log("Update-credit message published to RabbitMQ.");
                    });
            }

            // Invoke send_sms
            const message = "CUSTOMER : Order placed successfully!"
            send_sms(message)
                .then(data => {
                    console.log("SMS sent successfully:", data);
                })
                .catch(error => {
                    console.error("Failed to send SMS:", error);
                });

            const message_sup = "SUPPLIER : New order received!"
            send_sms(message_sup)
                .then(data => {
                    console.log("SMS sent successfully:", data);
                })
                .catch(error => {
                    console.error("Failed to send SMS:", error);
                });

            // Create Receipt
            try {
                const result_receipt = await create_receipt(user_id, requestBodyReceipt);

                console.log("Receipt created successfully:", result_receipt);

                const receipt_no = JSON.stringify(result_receipt.Receipt.receipt_no);

                const create_receipt_log_message = JSON.stringify("Receipt created successfully:" + receipt_no)
                channel.publish(exchangename, 'createReceipt.infor', Buffer.from(create_receipt_log_message));

                console.log("Create-receipt message published to RabbitMQ.");

                await update_receipt_number(order_id, receipt_no);

            } catch (error) {
                console.error("Failed to create receipt:", error);

                const create_receipt_log_message = JSON.stringify("Failed to create receipt:" + error)
                channel.publish(exchangename, 'createReceipt.error', Buffer.from(create_receipt_log_message));

                console.log("Create-receipt message published to RabbitMQ.");
            }

            res.status(200).send("Order processed successfully.");
        } catch (error) {
            console.error("Failed to create order:", error);
            res.status(500).send("Failed to process order.");

            // Publish message to RabbitMQ indicating the error
            const errorMessage = {
                error: error.message // Include relevant error details in the message body
            };
            channel.publish(exchangename, 'order.error', Buffer.from(JSON.stringify(errorMessage)));
            console.log("Error message published to RabbitMQ.");
        }
    });

    // Process Top-up

    app.post('/process-topup', async (req, res) => {
        const topup_amount = req.body.topup_amount;
        const user_id = req.body.user_id;

        try {
            // Update Store Credit
            const data = await update_store_credit(user_id, topup_amount);
            console.log("Customer store credit updated successfully:", data);

            // Publish message to RabbitMQ
            const topup_log_message = JSON.stringify({
                user_id,
                topup_amount,
                success: true
            });
            channel.publish(exchangename, 'topup.infor', Buffer.from(topup_log_message));
            console.log("Top-up message published to RabbitMQ.");

            // Send sms
            const message = "CUSTOMER : Top-up successfully!";
            await send_sms(message);
            console.log("SMS sent successfully.");

            res.status(200).send("Top-up processed successfully.");
        } catch (error) {
            console.error("Error processing top-up:", error);
            res.status(500).send("Failed to process top-up.");

            // Publish message to RabbitMQ indicating the error
            const errorMessage = {
                error: error.message // Include relevant error details in the message body
            };
            channel.publish(exchangename, 'topup.error', Buffer.from(JSON.stringify(errorMessage)));
            console.log("Error message published to RabbitMQ.");
        }
    });


    // Process payment checkout
    app.post('/process-payment-checkout', async (req, res) => {
        const total_price = req.body.total_price;
        const shipping_info = req.body.shipping_info;
        const credit_used = req.body.credit_used;

        try {
            // Process payment checkout
            const url = await process_payment_checkout(total_price, shipping_info, credit_used);

            // Return URL to client side
            res.json({ url });

            // Publish message to RabbitMQ
            const checkout_log_message = JSON.stringify({
                total_price,
                shipping_info,
                credit_used,
                success: true
            });
            channel.publish(exchangename, 'checkout.infor', Buffer.from(checkout_log_message));
            console.log("Payment checkout message published to RabbitMQ.");
        } catch (error) {
            console.error("Error processing payment checkout:", error);
            res.status(500).send("Failed to process payment checkout.");

            // Publish message to RabbitMQ indicating the error
            const errorMessage = {
                error: error.message // Include relevant error details in the message body
            };
            channel.publish(exchangename, 'checkout.error', Buffer.from(JSON.stringify(errorMessage)));
            console.log("Error message published to RabbitMQ.");
        }
    });

    // Process one-time payment
    app.post('/process-one-time-payment', async (req, res) => {
        const balance_amt = req.body.balance_amt;
        const credit_used = req.body.credit_used;

        try {
            // Process one-time payment
            const url = await process_one_time_payment(balance_amt, credit_used);

            // Return URL to client side
            res.json({ url });

            // Publish message to RabbitMQ
            const payment_log_message = JSON.stringify({
                balance_amt,
                credit_used,
                success: true
            });
            channel.publish(exchangename, 'payment.infor', Buffer.from(payment_log_message));
            console.log("One-time payment message published to RabbitMQ.");
        } catch (error) {
            console.error("Error processing one-time payment:", error);
            res.status(500).send("Failed to process one-time payment.");

            // Publish message to RabbitMQ indicating the error
            const errorMessage = {
                error: error.message // Include relevant error details in the message body
            };
            channel.publish(exchangename, 'payment.error', Buffer.from(JSON.stringify(errorMessage)));
            console.log("Error message published to RabbitMQ.");
        }
    });

    app.listen(3000, '0.0.0.0', () => {
        console.log('Listening on port 3000');
    });
}
