const map = L.map("map").setView([0, 0], 2);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

const customIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const landmarks = [
  {
    name: "Taj Mahal",
    lat: 27.1751,
    lng: 78.0421,
    desc: "A stunning mausoleum in Agra, India.",
    img: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Taj_Mahal_in_India_-_Kristian_Bertel.jpg/800px-Taj_Mahal_in_India_-_Kristian_Bertel.jpg",
  },
  {
    name: "Eiffel Tower",
    lat: 48.8584,
    lng: 2.2945,
    desc: "Iconic landmark in Paris, France.",
    img: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Tour_Eiffel_Wikimedia_Commons.jpg/800px-Tour_Eiffel_Wikimedia_Commons.jpg",
  },
  {
    name: "Great Wall of China",
    lat: 40.4319,
    lng: 116.5704,
    desc: "Historic wall spanning northern China.",
    img: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/The_Great_Wall_of_China_at_Jinshanling.jpg/800px-The_Great_Wall_of_China_at_Jinshanling.jpg",
  },
  {
    name: "Machu Picchu",
    lat: -13.1631,
    lng: -72.545,
    desc: "Ancient Incan city in Peru.",
    img: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Machu_Picchu%2C_Peru.jpg/800px-Machu_Picchu%2C_Peru.jpg",
  },
  {
    name: "Colosseum",
    lat: 41.8902,
    lng: 12.4922,
    desc: "Ancient amphitheater in Rome, Italy.",
    img: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Colosseo_2020.jpg/800px-Colosseo_2020.jpg",
  },
  {
    name: "Petra",
    lat: 30.3285,
    lng: 35.4444,
    desc: "Archaeological city in Jordan.",
    img: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Treasury_petra_crop.jpeg/800px-Treasury_petra_crop.jpeg",
  },
  {
    name: "Christ the Redeemer",
    lat: -22.9519,
    lng: -43.2105,
    desc: "Iconic statue in Rio de Janeiro, Brazil.",
    img: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Aerial_view_of_the_Christ_the_Redeemer_statue.jpg/800px-Aerial_view_of_the_Christ_the_Redeemer_statue.jpg",
  },
  {
    name: "Pyramids of Giza",
    lat: 29.9792,
    lng: 31.1342,
    desc: "Ancient pyramids in Egypt.",
    img: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Kheops-Pyramid.jpg/800px-Kheops-Pyramid.jpg",
  },
];
let currentMarkers = [];
let addMarkerMode = false;
let tempMarker = null;

function createMarker(lat, lng, name, desc, img) {
  const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map)
    .bindPopup(`
          <b>${name}</b><br>
          ${desc}<br>
          ${
            img
              ? `<img src="${img}" alt="${name}" style="max-width:100%; height:auto;">`
              : ""
          }
        `);

  marker.openPopup();

  return marker;
}

function showLandmarks() {
  currentMarkers.forEach((marker) => map.removeLayer(marker));
  currentMarkers = [];

  landmarks.forEach((landmark) => {
    const marker = createMarker(
      landmark.lat,
      landmark.lng,
      landmark.name,
      landmark.desc,
      landmark.img
    );
    currentMarkers.push(marker);
  });

  if (currentMarkers.length > 0) {
    const group = new L.featureGroup(currentMarkers);
    map.fitBounds(group.getBounds());
  }
}

document.getElementById("searchBtn").addEventListener("click", async () => {
  const city = document.getElementById("cityInput").value;
  const category = document.getElementById("categorySelect").value;
  if (!city) return alert("Please enter a city name");

  currentMarkers.forEach((marker) => map.removeLayer(marker));
  currentMarkers = [];

  try {
    const geocodeUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      city
    )}`;
    const geocodeResponse = await fetch(geocodeUrl);
    const geocodeData = await geocodeResponse.json();
    if (geocodeData.length === 0) return alert("City not found");

    const { lat, lon } = geocodeData[0];
    map.setView([lat, lon], 12);

    const overpassUrl = `https://overpass-api.de/api/interpreter?data=[out:json];node[amenity=${category}](around:5000,${lat},${lon});out;`;
    const poiResponse = await fetch(overpassUrl);
    const poiData = await poiResponse.json();

    poiData.elements.forEach((poi) => {
      const marker = createMarker(
        poi.lat,
        poi.lon,
        poi.tags.name || category,
        category.charAt(0).toUpperCase() + category.slice(1),
        `https://via.placeholder.com/100?text=${category}`
      );
      currentMarkers.push(marker);
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    alert("Error fetching data. Please try again.");
  }
});

document.getElementById("addMarkerBtn").addEventListener("click", function () {
  addMarkerMode = !addMarkerMode;
  this.classList.toggle("active");

  if (addMarkerMode) {
    map.on("click", handleMapClick);
    alert("Click on the map to add a new marker");
  } else {
    map.off("click", handleMapClick);
    if (tempMarker) {
      map.removeLayer(tempMarker);
      tempMarker = null;
    }
    document.getElementById("markerForm").style.display = "none";
  }
});

function handleMapClick(e) {
  if (!addMarkerMode) return;

  if (tempMarker) {
    map.removeLayer(tempMarker);
  }

  tempMarker = L.marker(e.latlng, {
    icon: customIcon,
    draggable: true,
  }).addTo(map);

  document.getElementById("markerForm").style.display = "block";
  document.getElementById("markerName").value = "";
  document.getElementById("markerDesc").value = "";
  document.getElementById("markerImage").value = "";

  tempMarker.on("dragend", function () {
    document.getElementById("markerForm").style.display = "block";
  });
}

document
  .getElementById("newMarkerForm")
  .addEventListener("submit", function (e) {
    e.preventDefault();

    const name = document.getElementById("markerName").value;
    const desc = document.getElementById("markerDesc").value;
    const img = document.getElementById("markerImage").value;
    const latlng = tempMarker.getLatLng();

    const marker = createMarker(latlng.lat, latlng.lng, name, desc, img);
    currentMarkers.push(marker);

    map.removeLayer(tempMarker);
    tempMarker = null;
    document.getElementById("markerForm").style.display = "none";
    addMarkerMode = false;
    document.getElementById("addMarkerBtn").classList.remove("active");
    map.off("click", handleMapClick);
  });

document
  .getElementById("cancelMarkerBtn")
  .addEventListener("click", function () {
    if (tempMarker) {
      map.removeLayer(tempMarker);
      tempMarker = null;
    }
    document.getElementById("markerForm").style.display = "none";
    addMarkerMode = false;
    document.getElementById("addMarkerBtn").classList.remove("active");
    map.off("click", handleMapClick);
  });

document
  .getElementById("showLandmarksBtn")
  .addEventListener("click", showLandmarks);

showLandmarks();
