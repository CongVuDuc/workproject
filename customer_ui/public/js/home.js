// URLS
const getAllAvailableProductsURL = "https://personal-4acjyryg.outsystemscloud.com/Inventory/rest/v1/inventory/"

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
        this.render_products();
        this.loadCartItems(); // Load cart items from local storage
        this.get_store_credit();
    },

    data() {
        return {
            items: [],
            cartItems: [],
            total_price: 0,
            store_credit: 0,
        }
    },

    methods: {
        logout() {
            localStorage.removeItem('user');
            localStorage.removeItem('cartData')
            window.location.href = 'login.html';
        },

        // Call API to return all available products
        get_all_products() {
            return fetch(getAllAvailableProductsURL)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                return data; // Return the fetched data
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
            });
        },

        get_product_by_id(bouquet_id) {
            for (item of this.items) {
                if(bouquet_id == item.bouquet_id) {
                    return item;
                }
            }
        },

        // Populate items to display products
        render_products() {
            this.get_all_products().then(data => {
                this.items = data.Items;
            });
        },

        // Add item to cart
        add_to_cart(bouquet_id) {
            let item = this.get_product_by_id(bouquet_id)
            let isPresent = false;
            if (this.cartItems.length > 0) {
                for (const dict of this.cartItems) {
                    if (JSON.stringify(dict) === JSON.stringify(item)) {
                        isPresent = true;
                        break; // No need to continue checking once found
                    }
                }
            }

            if (isPresent) {
                for (cartItem of this.cartItems) {
                    if (cartItem.bouquet_id == bouquet_id) {
                        cartItem.cart_quantity++;
                    }
                }
            }
            else {
                item['cart_quantity'] = 1;
                this.cartItems.push(item)
            }

            this.calculate_total_price();
            this.saveCartItems(); // Save cart items to local storage
            console.log(this.cartItems)

          
        },

        // Remove item from card
        remove_cart_item(bouquet_id) {
            this.cartItems = this.cartItems.filter(item => item.bouquet_id !== bouquet_id);
            this.calculate_total_price();
            this.saveCartItems(); // Save cart items to local storage
        },

        calculate_total_price() {
            this.total_price = 0;
            for (item of this.cartItems) {
                let price = item.price;
                let cart_quantity = item.cart_quantity;
                this.total_price += (item.price * item.cart_quantity);
            }
        },

        // Save cart items to local storage
        saveCartItems() {
            const cartData = {
                cartItems: this.cartItems,
                total_price: this.total_price
            };
            localStorage.setItem('cartData', JSON.stringify(cartData));
        },

        // Load cart items from local storage
        loadCartItems() {
            const savedCartData = localStorage.getItem('cartData');
            if (savedCartData) {
                const parsedCartData = JSON.parse(savedCartData);
                this.cartItems = parsedCartData.cartItems;
                this.total_price = parsedCartData.total_price;
            }
        },

        // Get store credit from Customer
        get_store_credit() {
            const user = JSON.parse(localStorage.getItem('user'));
            this.store_credit = user.store_credit;
        },

        //checkout
        checkout() {
            window.location.href = 'checkout.html';
        },

        // Update item quantity based on input field
        update_item_quantity(bouquet_id, value) {
            for (item of this.cartItems) {
                if (item.bouquet_id == bouquet_id) {
                    item.cart_quantity = value;
                }
            }
            this.calculate_total_price();
            this.saveCartItems(); 
        }
    }
});

app.mount('#app');
