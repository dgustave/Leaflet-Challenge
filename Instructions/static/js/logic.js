// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2014-01-01&endtime=" +
  "2014-01-02&maxlongitude=-69.52148437&minlongitude=-123.83789062&maxlatitude=48.74894534&minlatitude=25.16517337";

// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);
});

function createFeatures(earthquakeData) {

  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place and time of the earthquake
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place +
      "</h3><hr><p>" + new Date(feature.properties.time) +"</p>" + "<br>" + "Magnitude:" + feature.properties.mag );
  }

    function changeColor(magnitude){
        if(magnitude > 5){
            return "#3b5998"
        }
      if(magnitude > 4){
          return "#fe4a49"
        }
      else if(magnitude > 3){
          return "#2ab7ca"
      }
      else if(magnitude > 2){
        return "#fed766"
      }
      else if(magnitude > 1){
        return "#f9f4f4"
      }
      else{
          return "#ffffff"
      }
    }

  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,
    pointToLayer: function (feature, latlng) {
        var geojsonMarkerOptions = {
            radius: feature.properties.mag * 6,
            fillColor: changeColor(feature.properties.mag),
            color: "#000",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
        };
            return L.circleMarker(latlng, geojsonMarkerOptions);
    }
  });

  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes);
}

function createMap(earthquakes) {

  // Define streetmap and darkmap layers
  var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/streets-v11",
    accessToken: API_KEY
  });

  var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "dark-v10",
    accessToken: API_KEY
  });

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Street Map": streetmap,
    "Dark Map": darkmap
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes
  };


  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [streetmap, earthquakes]
  });

     // Set up the legend
     var legend = L.control({ position: "bottomright" });
     legend.onAdd = function() {
       var div = L.DomUtil.create("div", "info legend");
       var colors = ["#ffffff", "#f9f4f4", "#fed766", "#2ab7ca", "#fe4a49", "#3b5998"];
       var labels = [];
   
    //    Add min & max
       var legendInfo = "<h1>Earthquake Magnitudes</h1>";
       div.innerHTML = legendInfo;
    // use styles css and append colors for each bullet for the magnitudes:
       colors.forEach(function(color, index) {
           mag = ["<div class=\"min\" style = 'position:absolute; left:80px;'>" + "0 - 1" + "</div>", "<div class=\"mid\" style = 'position:absolute; left:80px;'>" + "1 - 2" + "</div>", 
           "<div class=\"mid\" style = 'position:absolute; left:80px;'>" + "2 - 3" + "</div>", "<div class=\"mid\" style = 'position:absolute; left:80px;'>" + "3 - 4" + "</div>", 
           "<div class=\"max\" style = 'position:absolute; left:80px;'>" + "4 - 5" + "</div>", "<div class=\"max\" style = 'position:absolute; left:80px;'>" + "5  + " + "</div>"  ] 
         labels.push("<li style=\"background-color: " + color + "\">" + "<div class=\"labels\">" + mag[index] +   "</div>" + "</li>" + "<br>");
       });
   
       div.innerHTML += "<ul>" + labels.join("") + "</ul>" ;
       return div;
     };
     // Adding legend to the map
     legend.addTo(myMap);
  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);
}