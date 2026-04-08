// Geocode a city/state/zip to lat/lng using Nominatim (free, no API key)
export async function geocodeLocation(city, state, zip) {
  const query = [city, state, zip].filter(Boolean).join(", ");
  if (!query) return null;
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;
  const res = await fetch(url, { headers: { "Accept-Language": "en" } });
  const data = await res.json();
  if (data?.[0]) {
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  }
  return null;
}

// Haversine distance between two lat/lng points → miles
export function distanceMiles(lat1, lng1, lat2, lng2) {
  const R = 3958.8;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Jitter a lat/lng slightly for privacy (±0.02 deg ≈ ±1 mile)
export function jitterLatLng(lat, lng) {
  const jitter = () => (Math.random() - 0.5) * 0.04;
  return { lat: lat + jitter(), lng: lng + jitter() };
}

// Deterministic jitter based on an id string so pins stay stable across renders
export function stableJitter(lat, lng, seed) {
  const h = [...seed].reduce((acc, c) => acc * 31 + c.charCodeAt(0), 0);
  const j = ((h % 100) - 50) / 2500; // ±0.02
  return { lat: lat + j, lng: lng + j * 0.7 };
}

// US city → approximate coordinates (fallback atlas for demo)
const CITY_ATLAS = {
  "new york": { lat: 40.7128, lng: -74.006 },
  "los angeles": { lat: 34.0522, lng: -118.2437 },
  "chicago": { lat: 41.8781, lng: -87.6298 },
  "houston": { lat: 29.7604, lng: -95.3698 },
  "phoenix": { lat: 33.4484, lng: -112.074 },
  "philadelphia": { lat: 39.9526, lng: -75.1652 },
  "san antonio": { lat: 29.4241, lng: -98.4936 },
  "san diego": { lat: 32.7157, lng: -117.1611 },
  "dallas": { lat: 32.7767, lng: -96.797 },
  "san jose": { lat: 37.3382, lng: -121.8863 },
  "austin": { lat: 30.2672, lng: -97.7431 },
  "denver": { lat: 39.7392, lng: -104.9903 },
  "seattle": { lat: 47.6062, lng: -122.3321 },
  "boston": { lat: 42.3601, lng: -71.0589 },
  "miami": { lat: 25.7617, lng: -80.1918 },
  "atlanta": { lat: 33.749, lng: -84.388 },
  "minneapolis": { lat: 44.9778, lng: -93.265 },
  "portland": { lat: 45.5231, lng: -122.6765 },
  "las vegas": { lat: 36.1699, lng: -115.1398 },
  "nashville": { lat: 36.1627, lng: -86.7816 },
};

export function cityFallback(city) {
  if (!city) return null;
  return CITY_ATLAS[city.toLowerCase().trim()] || null;
}