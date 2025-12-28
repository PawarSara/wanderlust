// public/js/showMap.js
document.addEventListener("DOMContentLoaded", () => {
    try {
      // debug info (you can remove these console logs later)
      console.log("showMap.js loaded");
      console.log("listingData:", window.listingData);
      console.log("lat, lng:", window.lat, window.lng);
  
      const mapEl = document.getElementById("map");
      if (!mapEl) {
        console.error("Map container #map not found.");
        return;
      }
  
      // If Leaflet is not loaded, fail gracefully with an error
      if (typeof L === "undefined") {
        console.error("Leaflet (L) is not defined. Check that Leaflet JS is loaded.");
        return;
      }
  
      // Use lat/lng from EJS; if they are falsy, fallback to India center
      const usedLat = (typeof lat === "number" && !Number.isNaN(lat)) ? lat : 20.5937;
      const usedLng = (typeof lng === "number" && !Number.isNaN(lng)) ? lng : 78.9629;
  
      // Remove previous map instance if page re-renders (dev hot reload cases)
      if (mapEl._leaflet_id) {
        // if a previous map exists, reset its DOM (Leaflet 1.x)
        mapEl._leaflet_id = null;
        mapEl.innerHTML = "";
      }
  
      // create map
      const map = L.map("map", { scrollWheelZoom: false }).setView([usedLat, usedLng], 13);
  
      // tiles
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);
  
      // add marker if listing has valid coordinates
      if (listingData && listingData.geometry && Array.isArray(listingData.geometry.coordinates) && listingData.geometry.coordinates.length >= 2) {
        const marker = L.marker([usedLat, usedLng]).addTo(map);
        const popupText = (listingData.title ? `<strong>${listingData.title}</strong><br/>` : "") + (listingData.location ? listingData.location : "");
        marker.bindPopup(popupText);
        // open the popup so it's obvious that marker exists
        marker.openPopup();
      } else {
        // no valid coords on listingData, but map will still show (centered on fallback coords)
        console.warn("Listing has no geometry.coordinates. Map centered on default coords.");
      }
  
      // Fix display issue (in case map container was hidden/resized before init)
      setTimeout(() => {
        try {
          map.invalidateSize();
        } catch (e) {
          // ignore
        }
      }, 200);
  
    } catch (err) {
      console.error("Error in showMap.js:", err);
    }
  });
  