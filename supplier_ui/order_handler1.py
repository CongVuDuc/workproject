from flask import Flask, request, jsonify
import requests

app = Flask(__name__)

# API endpoint for the order database
ORDER_API_ENDPOINT = "https://personal-4acjyryg.outsystemscloud.com/Order/rest/v1/order/"

# Route for updating order status
@app.route('/order/<int:order_id>/status', methods=['PUT'])
def update_order_status(order_id):
    req_data = request.json
    new_status = req_data.get('order_status')

    # Construct the URL for updating the order status
    update_url = f"{ORDER_API_ENDPOINT}{order_id}"

    # Prepare data for updating order status
    payload = {"order_status": new_status}

    # Send PUT request to update the order status
    try:
        response = requests.put(update_url, json=payload)
        if response.status_code == 200:
            return jsonify({'message': f'Order {order_id} status updated to {new_status}'}), 200
        else:
            return jsonify({'error': f'Failed to update order status for order {order_id}'}), response.status_code
    except requests.exceptions.RequestException as e:
        return jsonify({'error': f'Request failed: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(debug=True)
