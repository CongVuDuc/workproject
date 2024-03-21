const app = Vue.createApp({
    data() {
        return {
            username: '',
            password: '',
            errorMessage: '',
            successMessage: ''
        };
    },
    methods: {
        login() {
            fetch(`https://personal-4acjyryg.outsystemscloud.com/Customer/rest/v1/customer/${this.username}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                if (data['Customer'].password === this.password) {
                    this.errorMessage = '';
                    this.successMessage = 'Login successful! Redirecting...';
                    let username = data['Customer'].username;
                    let user_id = data['Customer'].cust_id;
                    let store_credit = data['Customer'].credit;
                    let user = {
                        'username': username,
                        'user_id': user_id,
                        'store_credit': store_credit
                    }
                    // Store user information in local storage
                    localStorage.setItem('user', JSON.stringify(user));
                    // Redirect the user to home.html
                    window.location.href = 'home.html';
                } else {
                    this.successMessage = '';
                    this.errorMessage = 'Invalid username or password';
                }
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
                this.errorMessage = 'An error occurred while processing your request';
            });
        }
    }
});

app.mount('#app');