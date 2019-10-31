var Map = require("ti.map"),
    gps = require("gps"),
    updateCount = 10; // used to drop a pin every X times. Set to 10 so it drops one immediately.

var stopText = "Stop";
var startText = "Start";

// set UI defaults for iOS
if (OS_IOS) {
    $.allowsBackgroundLocationUpdates.value = Ti.Geolocation.allowsBackgroundLocationUpdates;
    $.showBackgroundLocationIndicator.value = Ti.Geolocation.showBackgroundLocationIndicator;
    $.trackSignificantLocationChange.value = Ti.Geolocation.trackSignificantLocationChange;
}

// handles the settings changes and  
// updates Ti.GeoLocation settings
function updateSettings(e) {
    Ti.Geolocation[e.source.id] = e.value;
}

// start or stop GPS tracking
function startOrStop(e) {
    if (e.source.title == stopText) {
        e.source.title = startText;
        stop();
    } else {
        e.source.title = stopText;
        start();
    }
}

// creates an annotation for a given lon and lat
function createAnnotation(location) {
    mapview.addAnnotation(Map.createAnnotation({
        title: location.title,
        clusterIdentifier: "location", // Required for clusters
        collisionMode: Map.ANNOTATION_VIEW_COLLISION_MODE_RECTANGLE,
        showAsMarker: true,
        markerTitleVisibility: Map.FEATURE_VISIBILITY_VISIBLE,
        latitude: location.latitude,
        longitude: location.longitude
    }));
}

// start things off
function start() {
    // main location handler
    gps.startGeoLocationTracking(function (e) {
              
        // save the location to a collection
        Alloy.Collections.locationChanges.add({
            longitude: e.longitude,
            latitude: e.latitude
        });

        // set the mapview view around the current location
        mapview.location = {
            latitude: e.latitude,
            longitude: e.longitude,
            latitudeDelta: 0.07,
            longitudeDelta: 0.07
        }; 

        // update the address label
        e.getAddress(function (address) {
            $.address.text = address.street;
        });

        // if we're not using SLC then only log a pin every 20 location changes
        if (OS_IOS && !Ti.Geolocation.trackSignificantLocationChange && updateCount == 10) {
            console.warn("Creating every 10 changes...")
            createAnnotation({
                longitude: e.longitude,
                latitude: e.latitude
            });
            updateCount = 0
        }

        // if we're using SLC then we can log a pin normally
        if (Ti.Geolocation.trackSignificantLocationChange || OS_ANDROID) {
            createAnnotation({
                longitude: e.longitude,
                latitude: e.latitude
            });
        }

        // increase the location counter
        updateCount++;        
    });
}

// stop tracking
function stop() {
    gps.stopGeoLocationTracking()
}

// setup our mapview
var mapview = Map.createView({
    rotateEnabled: true,
    mapType: Map.MUTED_STANDARD_TYPE,    
    userLocation: true
});

// handle cluster mode if the user zooms out
mapview.addEventListener("clusterstart", function (e) {
    var clusterAnnotation = Map.createAnnotation({
        showAsMarker: true,
        markerText: e.memberAnnotations.length.toString(),
        markerColor: 'orange',
    });

    mapview.setClusterAnnotation({
        annotation: clusterAnnotation,
        memberAnnotations: e.memberAnnotations
    });
});

// add the map to the view
$.mapWrapper.add(mapview);

start();