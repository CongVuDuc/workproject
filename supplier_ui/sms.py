# Download the helper library from https://www.twilio.com/docs/python/install
# import os
# from twilio.rest import Client


# # Find your Account SID and Auth Token at twilio.com/console
# # and set the environment variables. See http://twil.io/secure
# account_sid = 'AC0969a67c65dfe21091c569dba2a9ac3c'
# auth_token = '3b3f4ebd7fb36488265abee546496e6e'
# client = Client(account_sid, auth_token)

# message = client.messages.create(
#                               from_='+19164367167',
#                               body='Our ESD Meeting tmr is at GSR 3-4 SCIS1 - Slay',
#                               to='+6598581428'
#                           )

# print(f"sid: {message.sid} Status: {message.status}")


# Import the required modules
from twilio.rest import Client
import os
import sys

# Twilio credentials
account_sid = 'AC0969a67c65dfe21091c569dba2a9ac3c'
auth_token = '3b3f4ebd7fb36488265abee546496e6e'
from_number = '+19164367167'
to_number = '+6594518710'

def send_sms(message):
    # Initialize Twilio client
    client = Client(account_sid, auth_token)

    try:
        # Send SMS message
        message = client.messages.create(
            from_=from_number,
            body=message,
            to=to_number
        )
        # Print message SID and status
        print(f"Message SID: {message.sid}, Status: {message.status}")
    except Exception as e:
        # Print error message if sending fails
        print(f"Error sending SMS: {str(e)}")

# Check if the script is called with the message content
if __name__ == '__main__':
    if len(sys.argv) != 2:
        print("Usage: python sms.py <message>")
        sys.exit(1)

    message = sys.argv[1]
    send_sms(message)
