export function update_inventory(cartItems) {
    return new Promise((resolve, reject) => {
        const promises = cartItems.map(async (item) => {
            try {
                const bouquet_id = item.bouquet_id;
                const cart_quantity = -1 * item.cart_quantity;
                const url = `https://personal-4acjyryg.outsystemscloud.com/Inventory/rest/v1/inventory/${bouquet_id}/${cart_quantity}/`;

                // Make fetch request with 'no-cors' mode option
                const response = await fetch(url, { method: 'put' });
                if (response.ok) {
                    console.log(`Inventory updated for bouquet ID ${bouquet_id}`);
                } else {
                    console.error(`Failed to update inventory for bouquet ID ${bouquet_id}`);
                }
            } catch (error) {
                console.error('Error:', error);
                reject(error); // Reject the Promise if any error occurs
            }
        });

        // Wait for all promises to settle
        Promise.all(promises)
            .then(() => {
                resolve(); // Resolve the Promise once all fetch calls are completed
            })
            .catch((error) => {
                console.error('Error updating inventory:', error);
                reject(error); // Reject the Promise if there's an error during Promise.all
            });
    });
}
