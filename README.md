# Project Title: Lilee.co 


Description
- Lilee.co is a start-up company that specialises in the sale of bouquets and custom flower arrangements for its clients. It features a Place Order complex microservice for order purchases, a Request Handler complex microservice to keep track of order changes as well as an Order Handler complex microservice to update order status. Additionally, it dynamically updates based on availability of bouquets. Lilee.co also directly liaises with delivery services to ship out orders to customers.



## Getting Started
Installing the files for the Lilee.co web application
1. Download from Github: github.com/CongVuDuc/workproject
2. Place the files in the /www folder (WAMP) or /htdocs folder (MAMP)
3. Open the first page


Dependencies:
- Node.js
- WAMP/MAMP
- Docker
- 

## How to install each dependency
Node.js:
Use this website and follow the steps according to which OS you are running on: https://kinsta.com/blog/how-to-install-node-js/

WAMP:
https://www.geeksforgeeks.org/how-to-install-and-set-up-a-wamp-server/

MAMP:
https://mamp.info

Terminal 1:
Starts Customer UI
cd customer_app
npm install cors dotenv ejs express express.js nodemon stripe
runs on port 3000


Terminal 2
Starts Payment Microservice (used by Customer UI)
cd microservices/payment
pip install pika 
pip install stripe 
pip install flask 
pip install flask_cors
python payment.py 

python messaging.py
python order_handler.py
python request_handler.py


Any modifications needed to be made to files/folders
Executing program
1. To use customer UI: enable through Terminal
localhost:3000
2. To use supplier UI: run on localhost


How to run the program
1. Open through 


Step-by-step bullets


code blocks for commands


Help

Any advise for common problems or issues.


command to run if program contains helper info
Authors
Contributors names and contact info
