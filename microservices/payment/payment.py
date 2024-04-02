from flask import Flask, request, jsonify
import os
import stripe
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Load variables
stripe.api_key = "sk_test_51Ot1e6P0edbtrzURjMHuMeT7O59FMpzCfrObVxw0q5sTNPCbnIHW33huqWHDK6FVPLSL2vNf7dzMWiCtji0XrrsZ00FIyn4HAh"

# Stripe Checkout Route
@app.route('/stripe-checkout', methods=['POST'])
def stripe_checkout():
    data = request.json
    shipping_method = data.get('shipping_method')
    total_amount = data.get('total_amount')

    shipping_rate_mapping = {
        "S": "shr_1Ow8yyP0edbtrzUR9Kfw48z2",
        "D": "shr_1Ow92qP0edbtrzURa3Du9bRL",
        "F": "shr_1Ow9NRP0edbtrzUR2rqTgw97"
    }

    shippingRateId = shipping_rate_mapping.get(shipping_method, None)

    if not shippingRateId:
        return jsonify({"error": "Invalid shipping method"}), 400

    line_items = [{
        "price_data": {
            "currency": "sgd",
            "product_data": {
                "name": "Lilee.co Order",
            },
            "unit_amount": int(total_amount) * 100,
        },
        "quantity": 1,
    }]

    try:
        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            mode='payment',
            success_url="http://localhost:3000/success",
            cancel_url="http://localhost:3000/cancel",
            line_items=line_items,
            shipping_options=[{"shipping_rate": shippingRateId}],
        )
        return jsonify({"url": session.url})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# One-time Payment Route
@app.route('/one-time-payment', methods=['POST'])
def one_time_payment():
    data = request.json
    total_amount = data.get('total_amount')

    line_items = [{
        "price_data": {
            "currency": "sgd",
            "product_data": {
                "name": "Lilee.co Payment",
            },
            "unit_amount": int(total_amount) * 100,
        },
        "quantity": 1,
    }]

    try:
        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            mode='payment',
            success_url="http://localhost:3000/success",
            cancel_url="http://localhost:3000/",
            line_items=line_items,
        )
        return jsonify({"url": session.url})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=3005)

