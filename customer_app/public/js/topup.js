import { process_one_time_payment } from './payment.js'
const app = Vue.createApp({
    data() {
        return {
            amount: 50,
        };
    },
    methods: {
        proceed_to_payment() {
            localStorage.setItem('payment_type', 'topup');
            localStorage.setItem('topup_amount', JSON.stringify(this.amount));
            console.log(this.amount)
            let payment_amount = this.amount
            let credit_used = 0;
            process_one_time_payment(payment_amount, credit_used)
        }
    }
});

app.mount('#app');