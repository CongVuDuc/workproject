# Import the required modules
from twilio.rest import Client
import os
import sys

# Twilio credentials
account_sid = 'AC0969a67c65dfe21091c569dba2a9ac3c'
auth_token = '97742fd73858efa7fb093a6eccf2344e'
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
