export function update_receipt_number(order_id, receipt_no) {
    return new Promise((resolve, reject) => {
        const url = `https://personal-4acjyryg.outsystemscloud.com/Order/rest/v1/order/`;
        const requestBody = {
            receipt_no: receipt_no,
            order_id: order_id
        };

        fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        })
        .then(response => {
            if (response.ok) {
                console.log('Receipt number updated successfully');
                resolve(true); // Resolve the Promise with true if successful
            } else {
                console.error('Failed to update receipt number:', response.status);
                resolve(false); // Resolve the Promise with false if unsuccessful
            }
        })
        .catch(error => {
            console.error('Error updating receipt number:', error);
            reject(error); // Reject the Promise with the error
        });
    });
}
