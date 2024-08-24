// Function to get geocode (latitude and longitude) from an address using Nominatim API
async function getGeocode(address) {
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`);
        const data = await response.json();
        if (data && data.length > 0) {
            const { lat, lon } = data[0];
            return { lat: parseFloat(lat), lon: parseFloat(lon) };
        }
        return null;
    } catch (error) {
        console.error('Error fetching geocode:', error);
        return null;
    }
}

// Function to calculate distance between two points in kilometers
function calculateDistance(location1, location2) {
    const R = 6371; // Radius of the Earth in kilometers
    const lat1 = location1.lat * (Math.PI / 180);
    const lon1 = location1.lon * (Math.PI / 180);
    const lat2 = location2.lat * (Math.PI / 180);
    const lon2 = location2.lon * (Math.PI / 180);
    
    const dLat = lat2 - lat1;
    const dLon = lon2 - lon1;
    
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
    return R * c;
}

// Event listener for form submission
const dist = document.getElementById("distanceResult");
document.getElementById('addressForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const address1 = document.getElementById('address1').value;
    const address2 = document.getElementById('address2').value;
    
    const location1 = await getGeocode(address1);
    const location2 = await getGeocode(address2);
    
    if (location1 && location2) {
        const distance = calculateDistance(location1, location2);
        dist.innerText = `Distance: ${distance.toFixed(2)} km`;
        dist.style.display = 'flex'; // Show the distance result element
        
    } else {
        dist.innerText = 'Could not get the locations for the addresses.';
        dist.style.display = 'flex'; // Show the distance result element
    }
});
