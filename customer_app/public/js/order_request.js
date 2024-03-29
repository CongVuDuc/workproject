// Variables
const user = JSON.parse(localStorage.getItem('user'));
const user_id = user.user_id;

// URLS
const getAllRequestsURL = `https://personal-4acjyryg.outsystemscloud.com/Request/rest/v1/request/cust/${user_id}/`

// Check if a user is logged
if (localStorage.getItem('user')) {
    username = localStorage.getItem('user');
}
else {
    window.location.href = 'login.html';
}

// App
const app = Vue.createApp({
    created() {
        this.getAllOrders();
    },

    data() {
        return {
            rev_requests: [],
            pen_requests: [],
            acc_requests: [],
            rej_requests: [],
        }

    },

    methods: {
        getAllOrders() {
            fetch(getAllRequestsURL)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                for (ticket of data.Tickets) {
                    if (ticket.approval_status == "REV") {
                        this.rev_requests.push(ticket);
                    }
                    if (ticket.approval_status == "PEN") {
                        this.pen_requests.push(ticket);
                    }
                    if (ticket.approval_status == "ACC") {
                        this.acc_requests.push(ticket);
                    }
                    if (ticket.approval_status == "REJ") {
                        this.rej_requests.push(ticket);
                    }
                }
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
                this.errorMessage = 'An error occurred while processing your request';
            });
        },
        
        proceed_to_checkout(order_id, request_id, balance_amt) {
            const requestData = {
                order_id: order_id,
                request_id: request_id,
                balance_amt: balance_amt,
            }
            // Load requestData for payment processing
            localStorage.setItem('requestData', JSON.stringify(requestData));

            // Re-direct to request_checkout.html
            window.location.href = 'request_checkout.html';
        }
    },


})

app.mount('#app');