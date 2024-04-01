import axios from 'axios';

export function process_payment_checkout(total_price, shipping_info, credit_used) {
    return new Promise((resolve, reject) => {
        let shipping_method = shipping_info.shipping_method;
        if (shipping_method !== "S" && total_price > 50) {
            shipping_method = "F"
        }

        let total_amount = total_price - credit_used;

        console.log('payment running')

        let payment_url = "";

        if (process.env.payment_URL) {
            payment_url = process.env.payment_URL.split(',')[1];
        }
        else {
            payment_url = 'http://localhost:3005/stripe-checkout'
        }

        axios.post(payment_url, {
            total_amount: total_amount,
            shipping_method: shipping_method,
        }, {
            headers: {'Content-Type': 'application/json'}
        })
        .then((response) => {
            resolve(response.data.url); // Resolve with the URL
        })
        .catch((error) => {
            reject(error); // Reject with the error
        });
    });
}

export function process_one_time_payment(payment_amount, credit_used = 0) {
    return new Promise((resolve, reject) => {
        let total_amount = payment_amount - credit_used;

        let payment_url = "";

        if (process.env.payment_URL) {
            payment_url = process.env.payment_URL.split(',')[0];
        }
        else {
            payment_url = 'http://127.0.0.1:3005/one-time-payment'
        }

        axios.post(payment_url, {
            total_amount: total_amount,
        }, {
            headers: {'Content-Type': 'application/json'}
        })
        .then((response) => {
            resolve(response.data.url); // Resolve with the URL
        })
        .catch((error) => {
            reject(error); // Reject with the error
        });
    });
}
