export function process_payment_checkout(total_price, shipping_info, credit_used) {
    let shipping_method = shipping_info.shipping_method;
    if (shipping_method !== "S" && total_price > 50) {
        shipping_method = "F"
    }

    let total_amount = total_price - credit_used;

    console.log('payment running')

    fetch('http://127.0.0.1:3005/stripe-checkout', {
        method: 'post',
        headers: new Headers({'Content-Type': 'application/Json'}),
        body: JSON.stringify({
            total_amount: total_amount,
            shipping_method: shipping_method,
        })
    })
    .then((res) => res.json())
    .then((data) => {
        // location.href = url;
        location.href = data.url
    })
    .catch((err) => console.log(err));
}

export function process_one_time_payment(payment_amount, credit_used=0) {
    
    let total_amount = payment_amount - credit_used;

    fetch('http://127.0.0.1:3005/one-time-payment', {
        method: 'post',
        headers: new Headers({'Content-Type': 'application/Json'}),
        body: JSON.stringify({
            total_amount: total_amount,
        })
    })
    .then((res) => res.json())
    .then((data) => {
        // location.href = url;
        location.href = data.url
    })
    .catch((err) => console.log(err));
}
