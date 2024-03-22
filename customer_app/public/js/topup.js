import { process_one_time_payment } from './payment.js'
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

            process_one_time_payment(payment_amount, credit_used)
        }
    }
});

app.mount('#app');