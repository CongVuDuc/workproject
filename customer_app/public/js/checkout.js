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
        this.loadCartItems();
        this.get_store_credit(); 
    },

    data() {
        return {
            cartItems: {},
            total_price: 0,
            shipping_info: {
                name: '',
                shipping_method: '',
                address: '',
                contact_number: ''
            },
            store_credit: 0,
            credit_used: 0,
            new_total_price: 0,
        };
    },
    methods: {
        // Load cart items from local storage
        loadCartItems() {
            const savedCartData = localStorage.getItem('cartData');
            if (savedCartData) {
                const parsedCartData = JSON.parse(savedCartData);
                this.cartItems = parsedCartData.cartItems;
                this.total_price = parsedCartData.total_price;
            }
        },

        checkout(cartItems, total_price, shipping_info="", credit_used) {
            
            // Load shipping_info and set payment type to process when payment succeeds
            localStorage.setItem('shipping_info', JSON.stringify(shipping_info))
            localStorage.setItem('payment_type', 'order');
            localStorage.setItem('credit_used', credit_used);

            fetch('http://localhost:3000/process-payment-checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    total_price: total_price,
                    shipping_info: shipping_info,
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
        },

        apply_store_credit() {
            let credit_used = document.getElementById('credit_used').value;
            if (credit_used > 0 && credit_used < this.store_credit && credit_used <= this.total_price) {
                this.credit_used = credit_used;
                localStorage.setItem('credit_used', JSON.stringify(this.credit_used));
                this.new_total_price = this.total_price - this.credit_used;
            }
            else if (credit_used > this.total_price && credit_used <= this.store_credit) {
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

    },
});

app.mount('#app');
