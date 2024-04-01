export function update_store_credit(user_id, store_credit) {
    return new Promise((resolve, reject) => {
        fetch(`https://personal-4acjyryg.outsystemscloud.com/Customer/rest/v1/customer/${user_id}/${store_credit}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
        })
        .then(response => {
            if (response.ok) {
                console.log('Customer store credit updated successfully');
                return response.json(); // Parse response body as JSON
            } else {
                console.error('Failed to update customer store credit:', response.status);
                reject(new Error(`Failed to update customer store credit: ${response.status}`)); // Reject the Promise with an error
            }
        })
        .then(data => {
            resolve(data); // Resolve the Promise with the response data
        })
        .catch(error => {
            console.error('Error updating customer store credit:', error);
            reject(error); // Reject the Promise with the error
        });
    });
}
