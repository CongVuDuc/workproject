// Check if a user is logged
let user;
let username;
if (localStorage.getItem('user')) {
    user = JSON.parse(localStorage.getItem('user'));
    username = user.username;
}
else {
    window.location.href = 'login.html';
}

// App
const app = Vue.createApp({
    created() {
        this.loadRequestData();
        this.get_store_credit(); 
    },

    data() {
        return {
            balance_amt: 0,
            store_credit: 0,
            credit_used: 0,
            order_id: 0,
            request_id: 0,
            new_total_price: 0,
        };
    },
    methods: {
        // Load cart items from local storage
        loadRequestData() {
            const requestData = JSON.parse(localStorage.getItem('requestData'));
            let order_id = requestData.order_id;
            let request_id = requestData.request_id;
            let balance_amt = requestData.balance_amt;
            this.balance_amt = balance_amt;
            this.order_id = order_id;
            this.request_id = request_id;
        },

        checkout(balance_amt, credit_used) {
            
            // Set payment type to process when payment succeeds
            localStorage.setItem('payment_type', 'request');
            const requestData = {
                order_id: this.order_id,
                request_id: this.request_id,
                order_status: "ACC",
                credit_used: credit_used
            }

            localStorage.setItem('requestData', JSON.stringify(requestData));
            localStorage.setItem('credit_used', credit_used);
            
            fetch('http://localhost:5200/request_payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    balance_amt: balance_amt,
                    credit_used: credit_used
                })
                })
                .then((res) => {
                    if (res.ok) {
                        return res.json();
                    } else {
                        throw new Error('Failed to process payment');
                    }
                })
                .then((data) => {
                    console.log(data)
                    // Redirect to Stripe checkout url
                    window.location.href = data.url;
                })
                .catch(error => {
                    console.error('Error Processing Payment:', error);
                });
        },

        apply_store_credit() {
            let credit_used = document.getElementById('credit_used').value;
            if (credit_used > 0 && credit_used < this.store_credit && credit_used <= this.balance_amt) {
                this.credit_used = credit_used;
                localStorage.setItem('credit_used', JSON.stringify(this.credit_used));
                this.new_total_price = this.balance_amt - this.credit_used;
            }
            else if (credit_used > this.balance_amt && credit_used < this.store_credit) {
                alert('Credit used cannot exceed total price.')
            }
            else {
                alert('Credit used cannot exceed available store credit.')
            }
        },

        get_store_credit() {
            console.log(user)
            console.log(username)
            fetch(`https://personal-4acjyryg.outsystemscloud.com/Customer/rest/v1/customer/${username}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    this.store_credit = data['Customer'].credit;
                })
                .catch(error => {
                    console.error('Error fetching store credit:', error);
                });
        },

        logout() {
            localStorage.clear();
            window.location.href = 'login.html';
        },

    },
});

app.mount('#app');
