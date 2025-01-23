mapboxgl.accessToken =
  'pk.eyJ1IjoicmF5YXBhdGk0OSIsImEiOiJjbGVvMWp6OGIwajFpM3luNTBqZHhweXZzIn0.1r2DoIQ1Gf2K3e5WBgDNjA';

const mapContainer = document.getElementById('map-container');
const orthoCenter = [47.063, -18.581];
const orthoZoom = 5.4;

let map;
let previousLayerId = null;

// Initialize Mapbox map
function initializeMap() {
  map = new mapboxgl.Map({
    container: mapContainer,
    style: 'mapbox://styles/mapbox/outdoors-v12',
    center: orthoCenter,
    zoom: orthoZoom,
    attributionControl: false,
  });

  createHoverPane();

  map.on('load', () => {
    axios
      .get('/bundle/assets/provinces.geojson') // Update with actual GeoJSON path
      .then((response) => {
        addProvinces(response.data);
      })
      .catch((error) => {
        console.error('Error loading GeoJSON:', error.response || error.message);
      });

    // Get the coordinates display div
    const coordinatesDisplay = document.getElementById('coordinates-display');

    // Add event listener for mouse move
    map.on('mousemove', (event) => {
      const { lng, lat } = event.lngLat;
      coordinatesDisplay.textContent = `Longitude: ${lng.toFixed(5)}, Latitude: ${lat.toFixed(5)}`;
    });
  });
}

function addProvinces(geoJSON) {
    geoJSON.features.forEach((province, index) => {
      const {
        Country,
        Province_Name,
        PROV_CODE,
        "Area (SqKm)": area,
        "Population (2018 Census)": population,
        Density,
        Capital,
      } = province.properties;
  
      // Ensure unique layer and source IDs
      const uniqueId = `${Province_Name}-${index}`;
      console.log(Province_Name)
      const layerId = `province-${uniqueId}`;
  
      // Add a source for the province
      map.addSource(layerId, {
        type: 'geojson',
        data: province,
      });
  
      // Add a layer to fill the polygon
      map.addLayer({
        id: layerId,
        type: 'fill',
        source: layerId,
        paint: {
          'fill-color': '#4682B4',
          'fill-opacity': 0.7,
        },
      });
  
      // Add a layer to display the province boundary
      map.addLayer({
        id: `${layerId}-line`,
        type: 'line',
        source: layerId,
        paint: {
          'line-color': '#000000',
          'line-width': 2,
        },
      });
  
      // Add a layer to label the province name
      map.addLayer({
        id: `${layerId}-label`,
        type: 'symbol',
        source: layerId,
        layout: {
          'text-field': Province_Name,
          'text-size': 14,
          'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
          'text-anchor': 'center',
        },
        paint: {
          'text-color': '#000000',
          'text-halo-color': '#FFFFFF',
          'text-halo-width': 1.5,
        },
      });
      
  
      // Add a click event to display province details in the hover pane
      map.on('click', layerId, () => {
        const hoverPane = document.getElementById('hover-pane');
        hoverPane.style.display = 'block';
        hoverPane.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <h3 style="margin: 0;">Province Details</h3>
            <button id="close-hover-pane">X</button>
          </div>
          <hr style="margin: 8px 0;">
          <p><strong>Country:</strong> ${Country}</p>
          <p><strong>Province Name:</strong> ${Province_Name}</p>
          <p><strong>Area (SqKm):</strong> ${area}</p>
          <p><strong>Population (2018 Census):</strong> ${population}</p>
          <p><strong>Density:</strong> ${Density}</p>
          <p><strong>Capital:</strong> ${Capital}</p>
          <button id="more-info-button" style="display: none;">Click for field details</button>
        `;
  
        //Display button or not
        const ProvinceData = {
          "province": {
            "Province_Name": "Alaotra Mangoro"
          }
        };

        if (Province_Name === "Alaotra Mangoro") {
          // Display the button if the user is logged in
          document.getElementById('more-info-button').style.display = 'block';
          console.log (1)
        } else {
          // Optionally, you can hide the button if the user is not logged in
          document.getElementById('more-info-button').style.display = 'none';
          console.log(2)
        }
        
        
        // Close hover pane button
        document.getElementById('close-hover-pane').addEventListener('click', () => {
          hoverPane.style.display = 'none';
          if (previousLayerId) {
            map.setPaintProperty(previousLayerId, 'fill-opacity', 0.7);
          }
        });
  
        // Redirect to farms.html on More Info button click
        document.getElementById('more-info-button').addEventListener('click', () => {
          window.location.href = '/farms.html';
        });
  
        // Reset opacity for the previous layer
        if (previousLayerId) {
          map.setPaintProperty(previousLayerId, 'fill-opacity', 0.7);
        }
  
        // Highlight the selected layer
        map.setPaintProperty(layerId, 'fill-opacity', 1);
        previousLayerId = layerId;
      });
    });
  }
  

function createHoverPane() {
  const hoverPane = document.createElement('div');
  hoverPane.id = 'hover-pane';
  document.body.appendChild(hoverPane);
}

// Initialize the map
initializeMap();
