// Variables

// Check if a user is logged
if (localStorage.getItem('user')) {
    const user = JSON.parse(localStorage.getItem('user'));
}
else {
    window.location.href = 'login.html';
}

// App
const app = Vue.createApp({
    created() {
        this.loadCartItems(); 
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
            store_credit: 0
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

        
    },
});

app.mount('#app');
