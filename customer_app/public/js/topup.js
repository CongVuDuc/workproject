// Variables
let user;
let username;
// Check if a user is logged
if (localStorage.getItem('user')) {
    user = JSON.parse(localStorage.getItem('user'));
    username = user.username
}
else {
    window.location.href = 'login.html';
}

const app = Vue.createApp({
    data() {
        return {
            amount: 50,
            amount_to_credit: {
                50: 51,
                100: 102,
                200: 205,
                300: 310,
                400: 420
            }
        };
    },
    methods: {
        proceed_to_payment() {
            let topup_amount = this.amount_to_credit[this.amount];
            localStorage.setItem('payment_type', 'topup');
            localStorage.setItem('topup_amount', JSON.stringify(topup_amount));

            let payment_amount = this.amount
            let credit_used = 0;

            fetch('/process-one-time-payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    balance_amt: payment_amount,
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
                    // Redirect to Stripe checkout url
                    window.location.href = data.url;
                })
                .catch(error => {
                    console.error('Error Processing Payment:', error);
                });
        }
    }
});

app.mount('#app');