mapboxgl.accessToken = mapToken; //mapToken = the token for MapBox which is accessed using ejs and a script at the top of i show.ejs 
const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/light-v11', // style URL
    center: campground.geometry.coordinates, // starting position [lng, lat]
    zoom: 10, // starting zoom
});

// Add zoom and rotation controls to the map.
map.addControl(new mapboxgl.NavigationControl(), 'top-right');

// Create a default Marker and add it to the map.
const marker1 = new mapboxgl.Marker()
    .setLngLat(campground.geometry.coordinates)
    // adding a popup to the marker, when clicked
    .setPopup(
        new mapboxgl.Popup({offset: 25})
        // add html to the popup
        .setHTML(
            `<h3>${campground.title}</h3><p>${campground.location}</p>`
        )
    )
    //add the marker and popup to the map
    .addTo(map);