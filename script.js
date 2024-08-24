const button = document.querySelector(".but");

button.addEventListener("click", ()=>{ 
    // tried console.log(navigator.geolocation) and got to know all the key value pairs in the object
    // Geolocation.getCurrentPosition method id used to get the current position of the device
    // It takes 3 parameters success, error =, options. If everything is right then succcess
    // callback function will call else error callback function will call. We don't need third parameter for this project 
    if(navigator.geolocation){ // checkif browser supports geolocation
        button.innerText = "Allow to detect Location";
        navigator.geolocation.getCurrentPosition(onSuccess, onError);
    }
    else{
        button.innerText = "Your Browser does not support Geolocation"
    }
});

function onSuccess(position) {
    button.innerText = "Detecting your Location...";
    let { latitude, longitude } = position.coords;
    console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);
    var apiKey = "8dcb405673bd4b798fa4d27bc1c8f1ea";
    
    fetch(`https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${apiKey}`)
        .then(response => response.json())
        .then(result => {
            let allDetails = result.results[0].components;
            let { country, state, postcode, county, suburb, state_district } = allDetails;
            button.innerText = `${country}, ${state}, ${postcode}, ${county}, ${state_district}`;
            
            // Save location to local storage
            const addressData = { country, state, postcode, county, state_district };
            localStorage.setItem('userAddress', JSON.stringify(addressData));
            console.log('Address Stored:', addressData); // Debug logging
        })
        .catch(() => {
            button.innerText = "Something went wrong";
        });
}

function onError(error) {
    if (error.code == 1) {
        button.innerText = "You denied the request";
    } else if (error.code == 2) {
        button.innerText = "Location Not Available";
    } else {
        button.innerText = "Something went wrong";
    }
    button.setAttribute("disabled", "true"); // Disable the button if request is rejected or any error occurred.
    alert("refresh the page and give location access")
}