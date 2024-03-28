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
    print('\n-----Invoking request microservice-----')
    order_id = order["order_id"]
    request_id = order["request_id"]
    print(order_id, request_id)
    request_URL = f"https://personal-4acjyryg.outsystemscloud.com/Request/rest/v1/request/{order_id}/{request_id}/"
    request_result = invoke_http(request_URL,method="GET")
    print('request_result:', request_result)


    # Check the order result; if a failure, send it to the error microservice.
    code = request_result["Status_Code"]
    print("checking: ", code)
    message = json.dumps(request_result)

    if code not in range(200, 300):
        # Inform the error microservice
        #print('\n\n-----Invoking error microservice as order fails-----')
        print('\n\n-----Publishing the (order error) message with routing_key=order.error-----')

        # invoke_http(error_URL, method="POST", json=order_result)
        channel.basic_publish(exchange=exchangename, routing_key="order.error", 
            body=message, properties=pika.BasicProperties(delivery_mode = 2)) 
        # make message persistent within the matching queues until it is received by some receiver 
        # (the matching queues have to exist and be durable and bound to the exchange)

        # - reply from the invocation is not used;
        # continue even if this invocation fails        
        print(f"\nOrder status ({code}) published to the RabbitMQ Exchange:", request_result)

        # 7. Return error
        return {
            "Status_code": 500,
            "data": {"order_result": request_result},
            "message": "Order creation failure sent for error handling."
        }

    # Notice that we are publishing to "Activity Log" only when there is no error in order creation.
    # In http version, we first invoked "Activity Log" and then checked for error.
    # Since the "Activity Log" binds to the queue using '#' => any routing_key would be matched 
    # and a message sent to “Error” queue can be received by “Activity Log” too.

    else:
        # 4. Record new order
        # record the activity log anyway
        #print('\n\n-----Invoking activity_log microservice-----')
        print('\n\n-----Publishing the (order info) message with routing_key=order.info-----')        

        # invoke_http(activity_log_URL, method="POST", json=order_result)            
        channel.basic_publish(exchange=exchangename, routing_key="order.info", 
            body=message)

        print("\nOrder published to RabbitMQ Exchange.\n")
    # - reply from the invocation is not used;
    # continue even if this invocation fails

    print('\n-----Invoking Order microservice-----\n')

    order_URL = "https://personal-4acjyryg.outsystemscloud.com/Order/rest/v1/order/"

    ticket = request_result['Ticket']
    request_items = ticket['RequestItem']
    order_id = ticket['order_id']
    
    combined_data = {
        "order_id": order_id,
        "OrderItem": request_items
    }

    combined_json = json.dumps(combined_data)

    print('combined data: ', combined_data)
    print('combined json: ', combined_json)

    order_result = invoke_http(order_URL, method='PUT', json=combined_json)

    print('order result: ', order_result)
    


    print('\n-----END Order microservice-----\n')

    # 7. Return created order
    return {
        "Status_code": 201,
        "data": {
            "request_result": request_result,
        }
    }
    

# Execute this program if it is run as a main script (not by 'import')
if __name__ == "__main__":
    print("This is flask " + os.path.basename(__file__) +
          " for accepting a request")
    app.run(host="0.0.0.0", port=5200, debug=True)
    # Notes for the parameters:
    # - debug=True will reload the program automatically if a change is detected;
    #   -- it in fact starts two instances of the same flask program,
    #       and uses one of the instances to monitor the program changes;
    # - host="0.0.0.0" allows the flask program to accept requests sent from any IP/host (in addition to localhost),
    #   -- i.e., it gives permissions to hosts with any IP to access the flask program,
    #   -- as long as the hosts can already reach the machine running the flask program along the network;
    #   -- it doesn't mean to use http://0.0.0.0 to access the flask program.