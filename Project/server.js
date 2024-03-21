import express from 'express';
import dotenv from 'dotenv';
import stripe from 'stripe';
import e from 'express';

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
    res.sendFile("cancel.html", {root: "public"})
})

// Stripe
let stripeGateway = stripe(process.env.stripe_api);
console.log(stripeGateway);
let DOMAIN = process.env.DOMAIN;


// Create new order in Order
app.post('/order'), async (req, res) => {
    
}

// Create new order in Order
app.post('/update-inventory'), async (req, res) => {
    
}

// Trigger stripe API
app.post('/stripe-checkout', async (req, res) => {
    const shipping_method = req.body.shipping_method;
    console.log(shipping_method)

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
    
    const lineItems = req.body.items.map((item) => {
        return {
            price_data: {
                currency: 'sgd',
                product_data: {
                    name: item.bouquet_name,
                },
                unit_amount: item.price*100,
            },
            quantity: item.cart_quantity,

        }
    });
    console.log(lineItems)


    
    // Create checkout session
    const session = await stripeGateway.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        // success_url: 'https://www.google.com/',
        // cancel_url: 'https://www.google.com/',
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

app.listen(3000, () => {
    console.log('listening on port 3000;');
});
