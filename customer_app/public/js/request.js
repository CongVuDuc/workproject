// URLS
const getAllAvailableProductsURL = "https://personal-4acjyryg.outsystemscloud.com/Inventory/rest/v1/inventory/"

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

// App
const app = Vue.createApp({
    created() {
        this.render_products();
        this.loadCartItems();
    },

    data() {
        return {
            items: [],
            old_order_items: [],
            cartItems: [],
            new_items_added: [],
            old_total_price: 0,
            store_credit: 0,
            final_amount: 0,
            order_id: 0,
            shipping_info: {
                name: '',
                shipping_method: '',
                address: '',
                contact_number: ''
            },

            old_shipping_info: {
                name: '',
                shipping_method: '',
                address: '',
                contact_number: ''
            },
            new_shipping_info: {
                name: '',
                shipping_method: '',
                address: '',
                contact_number: ''
            },
        }
    },

    methods: {
        logout() {
            localStorage.clear();
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
            let item = this.get_product_by_id(bouquet_id);
            let isPresent = false;
            let is_in_old_order = false;
            console.log(bouquet_id);
            console.log(item);
        
            // Check if the item is in the old order
            for (let oldItem of this.old_order_items) {
                if (oldItem.bouquet_id == bouquet_id) {
                    is_in_old_order = true;
                    break;
                }
            }
        
            // Check if the item is already in the cart
            if (this.cartItems.some(cartItem => cartItem.bouquet_id === bouquet_id)) {
                isPresent = true;
            }
        
            // Update the quantity if the item is already in the cart
            if (isPresent) {
                for (let cartItem of this.cartItems) {
                    if (cartItem.bouquet_id == bouquet_id) {
                        cartItem.cart_quantity++;
                        break;
                    }
                }
            } else {
                // Add the item to the cart
                item['cart_quantity'] = 1;
                this.cartItems.push(item);
    
                if (!is_in_old_order) {
                    this.new_items_added.push(item);
                }
            }
        
            // Calculate the final amount and save the cart data
            this.calculate_final_amount();
            this.save_request_data(); // Save cart items to local storage
        },

        // Remove item from card
        remove_cart_item(bouquet_id) {
            let is_in_old_order = false;
        
            // Check if the item is in the old order
            for (let item of this.old_order_items) {
                if (item.bouquet_id === bouquet_id) {
                    is_in_old_order = true;
                    break;
                }
            }
        
            // If the item is in the old order, set its cart_quantity to 0
            if (is_in_old_order) {
                for (let item of this.cartItems) {
                    if (item.bouquet_id === bouquet_id) {
                        item.cart_quantity = 0;
                        break; // No need to continue looping
                    }
                }
            } else {
                // If the item is not in the old order, remove it from the cart
                this.cartItems = this.cartItems.filter(item => item.bouquet_id !== bouquet_id);
                this.new_items_added = this.new_items_added.filter(item => item.bouquet_id !== bouquet_id);
            }
        
            // Calculate the final amount and save the cart data
            this.calculate_final_amount();
            this.save_request_data(); // Save cart items to local storage
            console.log(this.cartItems);
        },
        

        calculate_final_amount() {
            let new_total_price = 0;
            for (item of this.cartItems) {
                let price = item.price;
                let cart_quantity = item.cart_quantity;
                new_total_price += (price * cart_quantity);
            }

            this.final_amount = new_total_price - this.old_total_price;

            if (this.shipping_info.shipping_method == "D" && this.new_total_price < 50) {
                this.final_amount += 5;
            }
        },

        // Save cart items to local storage
        save_request_data() {
            const requestData = {
                cartItems: this.cartItems,
                final_amount: this.final_amount
            };
            localStorage.setItem('requestData', JSON.stringify(requestData));
        },

        loadCartItems() {
            const request_order_id = JSON.parse(localStorage.getItem('request_order_id'));

            if (request_order_id) {
                fetch(`https://personal-4acjyryg.outsystemscloud.com/Order/rest/v1/order/${request_order_id}/`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    console.log(data)
                    const orderItems = data.Order.OrderItem
                    for (item of orderItems) {
                        item['cart_quantity'] = item.quantity;
                        console.log(data)
                        this.cartItems.push(item);
                        this.old_order_items.push(item);
                    }

                    this.old_total_price = data.Order.total_price
                    this.order_id = data.Order.order_id

                    this.old_shipping_info.shipping_method = data.Order.shipping_method
                    this.old_shipping_info.address = data.Order.address

                    this.shipping_info.shipping_method = data.Order.shipping_method
                    this.shipping_info.address = data.Order.address 
    
                    // this.calculate_final_amount();
                })
                .catch(error => {
                    console.error('Error fetching order:', error);
                });
            }
            else {
                console.log('Request order id is missing')
            }
        },

        //checkout
        submit_request() {
            if (this.final_amount == 0 && this.new_items_added.length == 0 && this.shipping_info.shipping_method == this.old_shipping_info.shipping_method) {
                alert("Please modify your order before submitting it!");
            }
            else {
                // Create requestItems based on old_order_items
                let requestItems = this.old_order_items.map(oldItem => ({
                    order_id: this.order_id,
                    old_id: oldItem.bouquet_id,
                    old_size: oldItem.size,
                    old_quantity: oldItem.quantity,
                    old_price: oldItem.price,
                    new_id: oldItem.bouquet_id,
                    new_size: oldItem.size,
                    new_quantity: 0,
                    new_price: oldItem.price,
                    bouquet_name: oldItem.bouquet_name
                }));

                // Update requestItems based on cartItems
                this.cartItems.forEach(item => {
                    let matchedRequestItem = requestItems.find(requestItem => requestItem.old_id === item.bouquet_id);
                    if (matchedRequestItem) {
                        matchedRequestItem.new_quantity = item.cart_quantity;
                    } else {
                        requestItems.push({
                            order_id: this.order_id,
                            old_id: 0,
                            old_size: 0,
                            old_quantity: 0,
                            old_price: 0,
                            new_id: item.bouquet_id,
                            new_size: item.size,
                            new_quantity: item.cart_quantity,
                            new_price: item.price,
                            bouquet_name: item.bouquet_name
                        });
                    }
                });

                // Filter items that never change
                if (this.shipping_info.shipping_method == "S") {
                    this.shipping_info.address == "";
                }

                if (this.shipping_info.shipping_method !== this.old_shipping_info.shipping_method) {
                    this.new_shipping_info.shipping_method = this.shipping_info.shipping_method;
                    this.new_shipping_info.address = this.shipping_info.address;
                }

                requestItems = requestItems.filter(item => item.old_quantity !== item.new_quantity);

                console.log(requestItems);

                axios.post('http://localhost:5200/post_request', {
                    order_id: this.order_id, 
                    cust_id: user.user_id, 
                    new_shipping_method: this.new_shipping_info.shipping_method, 
                    address: this.new_shipping_info.address, 
                    RequestItem: requestItems 
                }, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                .then((res) => {
                    console.log(res.data); // Handle response data
                    alert("Request submitted successfully!")
                    window.location.href = 'home.html';
                })
                .catch((err) => {
                    console.log(err); // Handle error
                });
            }
        },

        // Update item quantity based on input field
        update_item_quantity(bouquet_id, value) {
            for (item of this.cartItems) {
                if (item.bouquet_id == bouquet_id) {
                    item.cart_quantity = value;
                }
            }
            this.calculate_final_amount();
            this.save_request_data(); 
        },

        logout() {
            localStorage.clear();
            window.location.href = 'login.html';
        },
    }
});

app.mount('#app');
