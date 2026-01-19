// Add to Cart Functionality (example)
function addToCart() {
    console.log("Button clicked!");
    // Send request to server or database for cart addition
    fetch('/add-to-cart', { method: 'POST' })
        .then(response => response.json())
        .then(data => console.log(data))
        .catch(error => console.error('Error:', error));
}

// Toggle Navigation Functionality (example)
function toggleNav() {
    document.getElementById("navbar").classList.toggle("mobile-nav");
}