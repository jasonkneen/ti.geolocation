// eslint-disable-next-line no-global-assign

// initialise defaults
Ti.Geolocation.showBackgroundLocationIndicator = false;
Ti.Geolocation.allowsBackgroundLocationUpdates = true;
Ti.Geolocation.pauseLocationUpdateAutomatically = false;
Ti.Geolocation.trackSignificantLocationChange = false;
Ti.Geolocation.distanceFilter = 10; // android
Ti.Geolocation.accuracy = OS_IOS ? Ti.Geolocation.ACCURACY_BEST_FOR_NAVIGATION : Ti.Geolocation.ACCURACY_HIGH;

// check for location permissions
function getLocationPermissions(callback) {
    Ti.Geolocation.requestLocationPermissions(Ti.Geolocation.AUTHORIZATION_ALWAYS, function (result) {
        if (result.success) {
            console.log("gps -- location permissions granted");
            if (callback) callback();
        } else {
            Ti.Geolocation.requestLocationPermissions(Ti.Geolocation.AUTHORIZATION_WHEN_IN_USE, function (result) {
                if (result.success) {
                    alert("We will only be able to track you when the app is running. You can change this in your device location settings.");
                    if (callback) callback();
                } else {
                    alert("Please enable location services for this app in your device settings.");
                }
            });
        }
    });
}

function locationUpdateHandler(pos, callback) {
    if (pos.coords) {
        console.log("gps -- location change occured: " + pos.coords.longitude + ", " + pos.coords.latitude);
        callback({
            longitude: pos.coords.longitude,
            latitude: pos.coords.latitude,
            getAddress: function (callback) {
                Ti.Geolocation.reverseGeocoder(pos.coords.latitude, pos.coords.longitude, function (lookup) {
                    if (lookup.success) {
                        callback(lookup.places[0]);
                    } else {
                        callback({
                            success: false,
                            error: "No location available"
                        });
                    }
                });
            }
        });
    } else {
        console.log("gps -- No location coordinates available!");
    }
}

exports.getCurrentGeoLocation = function (callback) {
    getLocationPermissions(function () {
        Ti.Geolocation.getCurrentPosition(function (pos) {
            locationUpdateHandler(pos, callback);
        });
    });
};

exports.startGeoLocationTracking = function (callback) {
    // start updates and remove any listeners already here

    // need a local function to make it easy to remove the handler later
    function localHandler(pos) {
        locationUpdateHandler(pos, callback);
    }

    getLocationPermissions(function () {
        console.log("gps -- adding locaton handler");
        Ti.Geolocation.addEventListener("location", localHandler);

        Ti.Geolocation.addEventListener("locationupdatepaused", paused = function () {
            console.warn("gps -- location updates resumed.");
        });

        Ti.Geolocation.addEventListener("locationupdateresumed", resumed = function () {
            console.warn("gps -- location updates resumed.");
        });

        // add a stop tracking option
        exports.stopGeoLocationTracking = function () {
            console.log("gps -- stopping location tracking");
            Ti.Geolocation.removeEventListener("location", localHandler);
            Ti.Geolocation.removeEventListener("locationupdatepaused", paused);
            Ti.Geolocation.removeEventListener("locationupdateresumed", resumed);
        };

        Ti.Geolocation.getCurrentPosition(function (pos) {
            localHandler(pos);
        });
    });

};