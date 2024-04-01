# Lilee.co 


Description
- Lilee.co is a start-up company that specialises in the sale of bouquets and custom flower arrangements for its clients. It features a Place Order complex microservice for order purchases, a Request Handler complex microservice to keep track of order changes as well as an Order Handler complex microservice to update order status. Additionally, it dynamically updates based on availability of bouquets. Lilee.co also directly liaises with delivery services to ship out orders to customers.



## Getting Started
Installing the files for the Lilee.co web application
1. Download from Github: github.com/CongVuDuc/workproject
2. Place the files in the /www folder (WAMP) or /htdocs folder (MAMP)
3. Set up the following dependencies as required

Dependencies:
- Node.js
- WAMP/MAMP
- Docker
- Twilio

## How to install each dependency
Node.js:
https://kinsta.com/blog/how-to-install-node-js/

WAMP:
https://www.geeksforgeeks.org/how-to-install-and-set-up-a-wamp-server/

MAMP:
https://mamp.info

Twilio:
https://www.twilio.com/login
If you do not have an account: please create a new account \
This is the following information that you need to save: \
Account ID, Auth Token, Twilio Number, Personal Number

## Set up required:
### Terminal 1:
Starts Customer UI (runes on port 3000)
- cd customer_app
- npm install cors dotenv ejs express express.js nodemon stripe


### Terminal 2
Starts Payment Microservice (used by Customer UI) \
- cd microservices/payment
- pip install pika 
- pip install stripe 
- pip install flask 
- pip install flask_cors
- python payment.py 

### Terminal 3
- python messaging.py

### Terminal 4
- python order_handler.py

### Terminal 5
- python request_handler.py



## How to use the user interfaces:
1. To use customer UI: enable through Terminal 1 and 2
2. Customer UI can be found on localhost:3000/login.html \
Login information: \
Username: iloveesd \
Password: iloveesd 

2. To use supplier UI: run on localhost/workproject/supplier_app/lilee_co.html \
No login is required \

