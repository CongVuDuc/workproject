const payBtn = document.querySelector('#checkout');
let cartData = JSON.parse(localStorage.getItem('cartData'));
let cartItems = cartData.cartItems;
let total_price = cartData.total_price;
console.log(total_price)


payBtn.addEventListener('click', () => {
    let shipping_method;
    if (total_price > 50) {
        shipping_method = "F"
    }
    else {
        shipping_method = document.querySelector('.shipping_method').value;
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
})