// Variables
const user = JSON.parse(localStorage.getItem('user'));
const user_id = user.user_id;

// URLS
const getAllOrdersURL = `https://personal-4acjyryg.outsystemscloud.com/Order/rest/v1/order/customer/${user_id}/`

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
            orders: [],
            conf_orders: [],
            prep_orders: [],
            scol_orders: [],
            dlvy_orders: [],
            cmpl_orders: []

        }

    },

    methods: {
        getAllOrders() {
            fetch(getAllOrdersURL)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                for (order of data.Order) {
                    if (order.order_status == "CONF") {
                        this.conf_orders.push(order)
                    }
                    if (order.order_status == "PREP") {
                        this.prep_orders.push(order)
                    }
                    if (order.order_status == "SCOL") {
                        this.scol_orders.push(order)
                    }
                    if (order.order_status == "DLVY") {
                        this.dlvy_orders.push(order)
                    }
                    if (order.order_status == "CMPL") {
                        this.cmpl_orders.push(order)
                    }
                }
                console.log(this.conf_orders)
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
                this.errorMessage = 'An error occurred while processing your request';
            });
            console.log(this.orders)
        },
        
        request_change(order_id) {
            localStorage.setItem("request_order_id", order_id);
            window.location.href = 'request.html';
        }
    },


})

app.mount('#app');