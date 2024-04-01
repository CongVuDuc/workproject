export function update_inventory(cartItem) {
    return new Promise((resolve, reject) => {
        try {
            const bouquet_id = cartItem.bouquet_id;
            const cart_quantity = -1 * cartItem.cart_quantity;
            const url = `https://personal-4acjyryg.outsystemscloud.com/Inventory/rest/v1/inventory/${bouquet_id}/${cart_quantity}/`;

            // Make fetch request with 'no-cors' mode option
            fetch(url, { method: 'put' })
                .then(response => {
                    if (response.ok) {
                        console.log(`Inventory updated for bouquet ID ${bouquet_id}`);
                        resolve(); // Resolve the Promise if the inventory update is successful
                    } else {
                        console.error(`Failed to update inventory for bouquet ID ${bouquet_id}`);
                        reject(new Error(`Failed to update inventory for bouquet ID ${bouquet_id}`)); // Reject the Promise if the inventory update fails
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    reject(error); // Reject the Promise if any error occurs during the fetch request
                });
        } catch (error) {
            console.error('Error:', error);
            reject(error); // Reject the Promise if any error occurs
        }
    });
}
