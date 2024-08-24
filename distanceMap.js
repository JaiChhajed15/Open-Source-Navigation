// Initialize the map
const map = L.map('map').setView([51.505, -0.09], 13); // Default view

// Add OpenStreetMap tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Function to get geocode for an address using OpenStreetMap Nominatim API
async function getGeocode(address) {
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`);
        const data = await response.json();
        if (data && data.length > 0) {
            return {
                lat: parseFloat(data[0].lat),
                lon: parseFloat(data[0].lon)
            };
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error fetching geocode data:', error);
        return null;
    }
}

// Function to calculate distance between two coordinates
function calculateDistance(coord1, coord2) {
    const R = 6371; // Radius of the Earth in km
    const dLat = (coord2.lat - coord1.lat) * Math.PI / 180;
    const dLon = (coord2.lon - coord1.lon) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(coord1.lat * Math.PI / 180) * Math.cos(coord2.lat * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
}

// Function to get directions using OpenRouteService
// Function to get directions using OpenRouteService
async function getDirections(location1, location2) {
    const apiKey = '5b3ce3597851110001cf6248d2a91e904f90495985725697481b600f'; // Replace with your OpenRouteService API key
    try {
        const response = await fetch(`https://api.openrouteservice.org/v2/directions/driving-car?api_key=${apiKey}&start=${location1.lon},${location1.lat}&end=${location2.lon},${location2.lat}`);
        const data = await response.json();
        console.log('Directions API full response:', data); // Log the API response for debugging

        // Check if the features array exists and has at least one element
        if (data.features && data.features.length > 0) {
            const route = data.features[0].geometry.coordinates;
            console.log('Route coordinates:', route);
            return route;
        } else {
            console.error('No routes found in the API response:', data);
            return [];
        }
    } catch (error) {
        console.error('Error fetching directions data:', error);
        return [];
    }
}


// Event listener for form submission
document.getElementById('addressForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const address1 = document.getElementById('address1').value;
    const address2 = document.getElementById('address2').value;
    
    try {
        const location1 = await getGeocode(address1);
        const location2 = await getGeocode(address2);
        
        console.log('Location 1:', location1);
        console.log('Location 2:', location2);

        if (location1 && location2) {
            // Remove existing markers and routes if any
            map.eachLayer(layer => {
                if (layer instanceof L.Marker || layer instanceof L.Polyline) {
                    map.removeLayer(layer);
                }
            });

            // Add markers for the addresses
            L.marker([location1.lat, location1.lon]).addTo(map)
                .bindPopup('Address 1')
                .openPopup();
            L.marker([location2.lat, location2.lon]).addTo(map)
                .bindPopup('Address 2')
                .openPopup();
            
            // Update the map view to fit both markers
            const bounds = L.latLngBounds(
                L.latLng(location1.lat, location1.lon),
                L.latLng(location2.lat, location2.lon)
            );
            map.fitBounds(bounds);

            // Calculate and display distance
            const distance = calculateDistance(location1, location2);
            document.getElementById('distanceResult').innerText = `Distance: ${distance.toFixed(2)} km`;
            document.getElementById('distanceResult').style.display = "flex";

            // Get and display the route
            const routeCoordinates = await getDirections(location1, location2);
            if (routeCoordinates && routeCoordinates.length > 0) {
                const routeLatLngs = routeCoordinates.map(coord => [coord[1], coord[0]]);
                L.polyline(routeLatLngs, {color: 'blue'}).addTo(map);
            } else {
                console.error('No route coordinates available.');
                alert('Could not retrieve route data.');
            }

        } else {
            alert('Could not get the locations for the addresses.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while fetching data.');
    }
});

