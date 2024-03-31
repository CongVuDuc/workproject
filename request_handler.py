from flask import Flask, request, jsonify
from flask_cors import CORS

import os, sys

import requests
from invokes import invoke_http

import pika
import json
import amqp_connection

app = Flask(__name__)
CORS(app)

inventory_URL = "https://personal-4acjyryg.outsystemscloud.com/Inventory/rest/v1/inventory/"
customer_URL = "https://personal-4acjyryg.outsystemscloud.com/Customer/rest/v1/customer/"
order_URL = "https://personal-4acjyryg.outsystemscloud.com/Order/rest/v1/order/"
request_URL = "https://personal-4acjyryg.outsystemscloud.com/Request/rest/v1/request/"



# exchangename = environ.get('exchangename') #order_topic
# exchangetype = environ.get('exchangetype') #topic 

exchangename = "order_topic" # exchange name
exchangetype="topic" # use a 'topic' exchange to enable interaction

#create a connection and a channel to the broker to publish messages to activity_log, error queues
connection = amqp_connection.create_connection() 
channel = connection.channel()

#if the exchange is not yet created, exit the program
if not amqp_connection.check_exchange(channel, exchangename, exchangetype):
    print("\nCreate the 'Exchange' before running this microservice. \nExiting the program.")
    sys.exit(0)  # Exit with a success status

@app.route("/request_handler", methods=['POST'])
def request_order():
    # Simple check of input format and data of the request are JSON
    if request.is_json:
        try:
            order = request.get_json()
            print("\nReceived an change request in JSON:", order)

            # do the actual work
            # 1. Send order info {cart items}
            result = processRequest(order)
            print(result)
            return jsonify(result), result["Status_code"]

        except Exception as e:
            # Unexpected error in code
            exc_type, exc_obj, exc_tb = sys.exc_info()
            fname = os.path.split(exc_tb.tb_frame.f_code.co_filename)[1]
            ex_str = str(e) + " at " + str(exc_type) + ": " + fname + ": line " + str(exc_tb.tb_lineno)
            print(ex_str)

            return jsonify({
                "code": 500,
                "message": "place_order.py internal error: " + ex_str
            }), 500


    # if reached here, not a JSON request.
    return jsonify({
        "code": 400,
        "message": "Invalid JSON input: " + str(request.get_data())
    }), 400

def processRequest(order):
    # 2. Send the request info
    # Invoke the request microservice
    order_id = order["order_id"]
    request_id = order["request_id"]
    order_status = order['order_status']
    print(order_id, request_id)

    
    print('\n-----Invoking request microservice to get ticket-----')

    request_URL = f"https://personal-4acjyryg.outsystemscloud.com/Request/rest/v1/request/{order_id}/{request_id}/"

    request_result = invoke_http(request_URL,method="GET")
    print('request_result:', request_result)

    ticket = request_result['Ticket']

    # Check the request result; if a failure, send it to the error microservice.
    code = request_result["Status_Code"]
    print("checking: ", code)
    message = json.dumps(request_result)

    if code not in range(200, 300):

        print('\n\n-----Publishing the (order error) message with routing_key=order.error-----')

        channel.basic_publish(exchange=exchangename, routing_key="request.error", 
            body=message, properties=pika.BasicProperties(delivery_mode = 2)) 

        print(f"\nOrder status ({code}) published to the RabbitMQ Exchange:", request_result)

        # 7. Return error
        return {
            "Status_code": 500,
            "data": {"request_result": request_result},
            "message": "Order creation failure sent for error handling."
        }

    else:
        print('\n\n-----Publishing the (order info) message with routing_key=order.info-----')        

        channel.basic_publish(exchange=exchangename, routing_key="request.info", 
            body=message)

        print("\nRequest published to RabbitMQ Exchange.\n")


    if (order_status == "PEN") and (ticket['balance_amt'] > 0):

        print('\n-----Invoking request microservice to update-----')

        request_URL = f"https://personal-4acjyryg.outsystemscloud.com/Request/rest/v1/request/{order_id}/{request_id}/PEN/"
        status_result = invoke_http(request_URL,method="PUT")
        print("status_result: ", status_result)


        print('\n-----START SMS microservice-----\n')

        sms_URL = "http://localhost:5005/send_sms"
        dummy_json = {"message": "MAKE PAYMENT LAH"}
        sms_response = invoke_http(sms_URL,method="POST", json=dummy_json)
        print('SMS response: ', sms_response)

        print('\n-----END SMS microservice-----\n')

        print('\n-----START PAYMENT microservice-----\n')

        reciept_details = {
                "cust_id": ticket['cust_id'],
                "subtotal": ticket['balance_amt'],
                "contact_no": ticket['contact_no'],
                "order_id": order_id,
                "request_id": request_id
            }

        if 'new_shipping_method' in ticket:
            reciept_details['shipping_method'] = ticket['new_shipping_method']
            reciept_details['address'] = ticket['address']

        paymnt_URL = "https://personal-4acjyryg.outsystemscloud.com/Payment/rest/v2/payment/"
        payment_result = invoke_http(paymnt_URL, method='POST', json=reciept_details)

        print("payment result: ", payment_result)

        print('\n-----END PAYMENT microservice-----\n')

        return {
        "Status_code": 201,
        "data": {
            "sms result" : sms_response,
            "payment result" : payment_result
        }
        }

    if order_status == 'REJ':

        print('\n-----Invoking request microservice to update-----')

        request_URL = f"https://personal-4acjyryg.outsystemscloud.com/Request/rest/v1/request/{order_id}/{request_id}/REJ/"
        status_result = invoke_http(request_URL,method="PUT")
        print("status_result: ", status_result)

        print('\n-----START SMS microservice-----\n')

        sms_URL = "http://localhost:5005/send_sms"
        dummy_json = {"message": "YOU HAVE BEEN REJECTED"}
        sms_response = invoke_http(sms_URL,method="POST", json=dummy_json)
        print('SMS response: ', sms_response)

        return {
        "Status_code": 201,
        "data": {
            "sms_response" : sms_response
        }
    } 

        print('\n-----END SMS microservice-----\n')
        
    print('\n-----Invoking request microservice to update-----')

    request_URL = f"https://personal-4acjyryg.outsystemscloud.com/Request/rest/v1/request/{order_id}/{request_id}/ACC/"
    status_result = invoke_http(request_URL,method="PUT")
    print("status_result: ", status_result)

    print('\n-----Invoking Order microservice-----\n')

    order_URL = "https://personal-4acjyryg.outsystemscloud.com/Order/rest/v1/order/"

    if ticket['RequestItem']:
        request_items = ticket['RequestItem']
    else:
        request_items = []
    # order_status = ticket['order_status']
    order_id = ticket['order_id']

    order_item = []

    for item in request_items:
        item_data = {
            "order_id": order_id,
            "quantity": item['new_quantity'],
            "bouquet_id": item['new_id'],
            "price": item['new_price'],
            "size": item['new_size']
        }
        order_item.append(item_data)
    
    combined_data = {
        "order_id": order_id,
        "OrderItem": order_item,
    }

    print('combined data: ', combined_data)

    order_result = invoke_http(order_URL, method='PUT', json=combined_data)

    print('order result: ', order_result)

    print('\n-----END Order microservice-----\n')

    code = order_result["Status_Code"]
    print("checking: ", code)
    message = json.dumps(order_result)

    if code not in range(200, 300):
        print('\n\n-----Publishing the (order error) message with routing_key=order.error-----')

        channel.basic_publish(exchange=exchangename, routing_key="order.error", 
            body=message, properties=pika.BasicProperties(delivery_mode = 2)) 
       
        print(f"\nOrder status ({code}) published to the RabbitMQ Exchange:", request_result)

        return {
            "Status_code": 500,
            "data": {"order_result": request_result},
            "message": "Order creation failure sent for error handling."
        }

    else:
    
        print('\n\n-----Publishing the (order info) message with routing_key=order.info-----')        

        channel.basic_publish(exchange=exchangename, routing_key="order.info", 
            body=message)

        print("\nOrder published to RabbitMQ Exchange.\n")

    
    print('\n-----Invoking Inventory Microservice-----\n')

    if "RequestItem" in ticket:
    

        for item in request_items:
            if 'old_quantity' in item:
                old_quantity = item['old_quantity']

            else:
                old_quantity = 0

            new_id = item['new_id']

            new_quantity = item['new_quantity']
            add_quantity = old_quantity - new_quantity

            inventory_URL = f"https://personal-4acjyryg.outsystemscloud.com/Inventory/rest/v1/inventory/{new_id}/{add_quantity}"

            inventory_result = invoke_http(inventory_URL, method='PUT')

            print(inventory_result)
    

    print('\n-----END Inventory microservice-----\n')


    print('\n-----START Customer microservice-----\n')

    cust_id = ticket['cust_id']
    quantity_credited = int(ticket['balance_amt'])
    if quantity_credited < 0:
        quantity_credited = quantity_credited*-1


    if ('new_shipping_method' in ticket) and (ticket['new_shipping_method'] == 'D'):
        customer_URL = "https://personal-4acjyryg.outsystemscloud.com/Customer/rest/v1/customer/"

        print(cust_id)

        data = {
            "cust_id" : cust_id,
            "address" : ticket['address']
        }
        shipping_result = invoke_http(customer_URL,method='PUT', json=data) 

        print("shipping_result: ", shipping_result)

    customer_URL = f"https://personal-4acjyryg.outsystemscloud.com/Customer/rest/v1/customer/{cust_id}/{quantity_credited}/"

    customer_result = invoke_http(customer_URL, method='PUT')

    print("\nCustomer Result: ", customer_result)

    print('\n-----END Customer microservice-----\n')

    print('\n-----START SMS microservice-----\n')

    sms_URL = "http://localhost:5005/send_sms"

    dummy_json = {"message": "order confirmed!"}

    sms_response = invoke_http(sms_URL,method="POST", json=dummy_json)

    print('\n-----END SMS microservice-----\n')

    # 7. Return created order
    return {
        "Status_code": 201,
        "data": {
            "request_result": request_result,
            "order_result" : order_result,
            "customer_result" : customer_result,
            "sms_response" : sms_response
        }
    }

@app.route("/post_request", methods=['POST'])
def postRequest():
# Simple check if input format and data of the request are JSON
    if request.is_json:
        try:
            request_data = request.get_json()
            print("\nReceived a change request in JSON:", request_data)

            # Check if 'order_id' exists in the received JSON data
            if 'order_id' in request_data:
                print("Order ID:", request_data['order_id'])
            else:
                print("Order ID is missing from the request.")

            # do the actual work
            # 1. Send order info {cart items}
            result = processPostRequest(request_data)
            print(result)
            return jsonify(result), result["Status_code"]

        except Exception as e:
            # Unexpected error in code
            exc_type, exc_obj, exc_tb = sys.exc_info()
            fname = os.path.split(exc_tb.tb_frame.f_code.co_filename)[1]
            ex_str = str(e) + " at " + str(exc_type) + ": " + fname + ": line " + str(exc_tb.tb_lineno)
            print(ex_str)

            return jsonify({
                "code": 500,
                "message": "place_order.py internal error: " + ex_str
            }), 500

    # If not a JSON request.
    return jsonify({
        "code": 400,
        "message": "Invalid JSON input: " + str(request.get_data())
    }), 400

def processPostRequest(data):

    body = {
    "order_id": data['order_id'],
    "cust_id": data['cust_id'],
    "RequestItem": data['RequestItem'],
    "address": data['address'],
    "new_shipping_method": data['new_shipping_method'],
}
    
    requestURL = "https://personal-4acjyryg.outsystemscloud.com/Request/rest/v1/request/"
    post_result = invoke_http(request_URL, method='POST', json=body)

    print('post_result: ', post_result)

    return{
        "Status_code": 201,
        "data": {
           "post_result": post_result
        }
    }

# Execute this program if it is run as a main script (not by 'import')
if __name__ == "__main__":
    print("This is flask " + os.path.basename(__file__) +
          " for accepting a request")
    app.run(host="0.0.0.0", port=5200, debug=True)