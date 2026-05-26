// The Options Object
const options = {
  enableHighAccuracy: true,
  timeout: 5000,
  maximumAge: 0
};

// The Success Function
function showPosition(position) {
  console.log("Lat: " + position.coords.latitude);
  console.log("Long: " + position.coords.longitude);
}

// The Error Function
function showError(error) {
  if(error.code == error.PERMISSION_DENIED) {
      console.log("User denied the request for Geolocation.");
  }
}

// The Execution
navigator.geolocation.getCurrentPosition(showPosition, showError, options);

