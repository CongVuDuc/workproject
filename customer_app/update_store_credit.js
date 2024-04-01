import axios from 'axios';

export function update_store_credit(user_id, store_credit) {
    return new Promise((resolve, reject) => {
        axios.put(`https://personal-4acjyryg.outsystemscloud.com/Customer/rest/v1/customer/${user_id}/${store_credit}`, null, {
            headers: {
                'Content-Type': 'application/json'
            },
        })
        .then(response => {
            if (response.status === 200) {
                console.log('Customer store credit updated successfully');
                resolve(response.data); // Resolve the Promise with the response data
            } else {
                console.error('Failed to update customer store credit:', response.status);
                reject(new Error(`Failed to update customer store credit: ${response.status}`)); // Reject the Promise with an error
            }
        })
        .catch(error => {
            console.error('Error updating customer store credit:', error);
            reject(error); // Reject the Promise with the error
        });
    });
}
