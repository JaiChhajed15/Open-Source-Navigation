// Initialize the map with a default view
var map = L.map('map').setView([51.505, -0.09], 13); // Set a default view (latitude, longitude, zoom level)

// Add a default tile layer (OpenStreetMap)
var defaultLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map); // Add this layer to the map initially

// My NASA Bearer Token
var token = "eyJ0eXAiOiJKV1QiLCJvcmlnaW4iOiJFYXJ0aGRhdGEgTG9naW4iLCJzaWciOiJlZGxqd3RwdWJrZXlfb3BzIiwiYWxnIjoiUlMyNTYifQ.eyJ0eXBlIjoiVXNlciIsInVpZCI6ImphaWNoaGFqZWQiLCJleHAiOjE3Mjk2MDM3NzUsImlhdCI6MTcyNDQxOTc3NSwiaXNzIjoiaHR0cHM6Ly91cnMuZWFydGhkYXRhLm5hc2EuZ292In0.e4d_83ZarchMAFrfH9_TppG23CTTuRgdCXeMbUXzJXbKrXO4EsLSkJJvpT9bHJ6vMTQVJC2qaS4kj68HTe_QGxLRi8S5HML0HM7F5cRdyGoqAnSPHsOl6zNYap7tTBzoPriu0d2leqTqIFUE6ar2vP3-uLxRC8V6BNz-LuC5AfXTvIqCbUXeq_6tW9ON4b_x_j-LaFkZbUTGSUw42u_XBuLc62d-R0GIJLcYni4zjJp7mu7AuQ0d8XkYrXuzJfy8-Kaan5bwfsPlGF8lB_eUBfuljNJ4rO_XpifwjZ9XgGxHMhLGxeIdkP3cu4MVjvEP-UygC74m0KsEZTjDesOksw"; // <-- Paste your Bearer Token here

// Add a NASA Worldview satellite view layer... but is not working in the project
var worldviewLayer = L.tileLayer("https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_CityLights_2012/default/{Time}/{TileMatrixSet}/{z}/{y}/{x}.jpg?token=$'{token}'", {
    attribution: '&copy; <a href="https://worldview.earthdata.nasa.gov/">NASA Worldview</a>',
    tileSize: 256,
    zoomOffset: 1,
    bounds: [[-85.05, -180], [85.05, 180]],
    opacity: 0.75
});

// Create a baseMaps object for layer control
var baseMaps = {
    "Default View": defaultLayer,
    "Satellite View": worldviewLayer
};

// Add a layer control to the map
L.control.layers(baseMaps).addTo(map);

// Function to set the map's view based on geolocation
function onSuccess(position) {
    let { latitude, longitude } = position.coords;
    // Set the map's view to the user's current location
    map.setView([latitude, longitude], 15);

    // Add a marker at the user's location
    L.marker([latitude, longitude]).addTo(map)
        .bindPopup('You are here!')
        .openPopup();
}

// Function to handle geolocation errors
function onError() {
    alert('Could not get your location');
}

// Check if geolocation is available and get the current position
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(onSuccess, onError);
} else {
    alert('Geolocation is not supported by this browser.');
}

document.addEventListener('DOMContentLoaded', () => {
    // Retrieve the stored address from local storage
    const storedData = localStorage.getItem('userAddress');
    
    // Get the div element where the address will be displayed
    const addressDiv = document.getElementById('address');
    
    // Function to update the address div with the stored address
    function updateAddressDiv(addressData) {
        const { country, state, postcode, county, state_district } = addressData;
        addressDiv.innerText = `${country}, ${state}, ${postcode}, ${county}, ${state_district}`;
    }

    // Function to handle address retrieval and map update
    function fetchAddress() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(onSuccess, onError);
        } else {
            addressDiv.innerText = 'Geolocation is not supported by this browser.';
        }
    }

    // Success callback function for geolocation
    function onSuccess(position) {
        const { latitude, longitude } = position.coords;
        const apiKey = "8dcb405673bd4b798fa4d27bc1c8f1ea";

        fetch(`https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${apiKey}`)
        .then(response => response.json())
        .then(result => {
            const allDetails = result.results[0].components;
            const addressData = {
                country: allDetails.country,
                state: allDetails.state,
                postcode: allDetails.postcode,
                county: allDetails.county,
                state_district: allDetails.state_district
            };

            // Save the new address to local storage
            localStorage.setItem('userAddress', JSON.stringify(addressData));

            // Update the address div
            updateAddressDiv(addressData);

            // Initialize or update the map (if map.js is integrated into the same file)
            if (typeof map !== 'undefined') {
                map.setView([latitude, longitude], 15);
                L.marker([latitude, longitude]).addTo(map)
                    .bindPopup('You are here!')
                    .openPopup();
            }
        })
        .catch(() => {
            addressDiv.innerText = 'Failed to retrieve address.';
        });
    }

    // Error callback function for geolocation
    function onError(error) {
        if (error.code === 1) {
            addressDiv.innerText = 'You denied the request for geolocation.';
        } else if (error.code === 2) {
            addressDiv.innerText = 'Location information is unavailable.';
        } else {
            addressDiv.innerText = 'An unknown error occurred.';
        }
    }

    // If there is a stored address, update the div content
    if (storedData) {
        const addressData = JSON.parse(storedData);
        updateAddressDiv(addressData);
    } else {
        addressDiv.innerText = 'Search for Your Location.';
    }

    // Add a click event listener to addressDiv
    addressDiv.addEventListener('click', () => {
        // Clear the local storage
        localStorage.removeItem('userAddress');

        // Reset the addressDiv content
        addressDiv.innerText = 'Searching for your location...';

        // Trigger a new location scan
        fetchAddress();
    });
});
