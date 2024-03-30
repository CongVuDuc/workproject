export function update_store_credit(user_id, store_credit) {
    fetch(`https://personal-4acjyryg.outsystemscloud.com/Customer/rest/v1/customer/${user_id}/${store_credit}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        })
        .then(response => {
            if (response.ok) {
                console.log('Customer store credit updated successfully');
            } else {
                console.error('Failed to update customer store credit:', response);
            }
        })
        .catch(error => {
            console.error('Error updating customer store credit:', error);
        });
}
