
    mapboxgl.accessToken = mapToken;
    const map = new mapboxgl.Map({
        container: 'map', // container ID
        style: 'mapbox://styles/mapbox/streets-v12', // style URL
        center: listing.geometry.coordinates, // starting position [lng, lat]. Note that lat must be set between -90 and 90
        zoom: 15 // starting zoom
    });
const marker = new mapboxgl.Marker({color: 'red'})
    .setLngLat(listing.geometry.coordinates)
    .setPopup(new mapboxgl.Popup({Offset: 25}).setHTML(`<h6>${listing.title}</h6><p>Exact location will provided after booking</p>`)) // add popup
    .addTo(map);

