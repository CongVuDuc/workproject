export async function update_inventory(cartItems) {
    for (const item of cartItems) {
        try {
            const bouquet_id = item.bouquet_id;
            const cart_quantity = -1 * item.cart_quantity;
            const url = `https://personal-4acjyryg.outsystemscloud.com/Inventory/rest/v1/inventory/${bouquet_id}/${cart_quantity}/`;
            
            // Make fetch request with 'no-cors' mode option
            const response = await fetch(url, {method: 'put' } );
            if (response.ok) {
                console.log(`Inventory updated for bouquet ID ${bouquet_id}`);
            } else {
                console.error(`Failed to update inventory for bouquet ID ${bouquet_id}`);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }
}