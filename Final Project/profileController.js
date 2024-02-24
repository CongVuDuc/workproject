// Get the query parameters from the URL
const queryParams = new URLSearchParams(window.location.search);

// Get the value of the "fruit" parameter
const fruitValue = queryParams.get("fruit");

// Use the value as needed
console.log("The selected fruit is: " + fruitValue);