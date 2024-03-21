export function process_payment(payment_type, cartItems, total_price=0, shipping_info="") {
    if (payment_type == "normal") {
        // Handle normal payment
        let shipping_method = shipping_info.shipping_method;
        if (shipping_method !== "S" && total_price > 50) {
            shipping_method = "F"
        }
        console.log(shipping_method);
        console.log('payment running')
        fetch('/stripe-checkout', {
            method: 'post',
            headers: new Headers({'Content-Type': 'application/Json'}),
            body: JSON.stringify({
                items: cartItems,
                total_price: total_price,
                shipping_method: shipping_method
            })
        })
        .then((res) => res.json())
        .then((url) => {
            location.href = url;
        })
        .catch((err) => console.log(err));
    }
    else {
        // Handle positive discrepancy
        console.log('hello')
    }

    
}