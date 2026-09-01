/**
 * Dynamic GPS Location & Reverse Geocoding Service
 * Provides automatic GPS detection, coordinate resolution, and OpenStreetMap reverse geocoding
 * for Pincode, City, State, District, Country, and Nearby Landmark/Place.
 */

export interface LocationDetectionResult {
  lat: number;
  lng: number;
  pincode: string;
  city: string;
  state: string;
  district: string;
  country: string;
  area: string;
  landmark: string;
  formattedAddress: string;
  date: string;
  time: string;
}

// In-memory cache for reverse geocoding to avoid repetitive HTTP calls
const geocodeCache = new Map<string, LocationDetectionResult>();

/**
 * Obtain current live GPS coordinates using the browser Geolocation API
 */
export function getCurrentGPSCoordinates(options?: PositionOptions): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      return reject(new Error("Geolocation is not supported by your browser or device."));
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        let msg = "Could not retrieve GPS location.";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            msg = "Location permission denied. Please enable GPS permissions in your browser settings.";
            break;
          case error.POSITION_UNAVAILABLE:
            msg = "GPS location is currently unavailable.";
            break;
          case error.TIMEOUT:
            msg = "GPS location request timed out.";
            break;
        }
        reject(new Error(msg));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
        ...options,
      }
    );
  });
}

/**
 * Reverse geocodes a latitude and longitude into administrative regions, pincode, area, and landmark.
 */
export async function reverseGeocode(lat: number, lng: number): Promise<LocationDetectionResult> {
  const roundedLat = parseFloat(lat.toFixed(5));
  const roundedLng = parseFloat(lng.toFixed(5));
  const cacheKey = `${roundedLat},${roundedLng}`;

  const now = new Date();
  const currentDate = now.toISOString().split("T")[0];
  const currentTime = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });

  if (geocodeCache.has(cacheKey)) {
    const cached = geocodeCache.get(cacheKey)!;
    return {
      ...cached,
      date: currentDate,
      time: currentTime,
    };
  }

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${roundedLat}&lon=${roundedLng}&zoom=18&addressdetails=1`,
      {
        headers: {
          "Accept-Language": "en",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Reverse geocode failed with status: ${response.status}`);
    }

    const data = await response.json();
    const address = data.address || {};

    const pincode = address.postcode || address.postal_code || "";
    const city =
      address.city ||
      address.town ||
      address.village ||
      address.municipality ||
      address.city_district ||
      address.county ||
      "";

    const state = address.state || address.province || "";
    const district = address.state_district || address.county || address.district || "";
    const country = address.country || "India";

    const area =
      address.suburb ||
      address.neighbourhood ||
      address.residential ||
      address.road ||
      address.quarter ||
      address.hamlet ||
      (city ? `${city} Locality` : "Local Area");

    // Extract genuine landmark from OSM amenity, shop, tourism, leisure, building, historic or road
    let detectedLandmark = "";
    if (address.amenity) {
      detectedLandmark = `Near ${address.amenity}`;
    } else if (address.shop) {
      detectedLandmark = `Near ${address.shop}`;
    } else if (address.tourism || address.historic) {
      detectedLandmark = `Near ${address.tourism || address.historic}`;
    } else if (address.building && address.building !== "yes") {
      detectedLandmark = `Near ${address.building}`;
    } else if (address.road && address.suburb) {
      detectedLandmark = `Near ${address.road}, ${address.suburb}`;
    } else if (address.road) {
      detectedLandmark = `On ${address.road}`;
    } else if (area) {
      detectedLandmark = `Near ${area} Main Road`;
    }

    const addressParts = [
      detectedLandmark ? detectedLandmark.replace(/^Near /, "") : "",
      area,
      city,
      pincode ? `PIN ${pincode}` : "",
      state,
    ].filter(Boolean);

    const formattedAddress = addressParts.length > 0 ? addressParts.join(", ") : data.display_name || `${roundedLat}, ${roundedLng}`;

    const result: LocationDetectionResult = {
      lat: roundedLat,
      lng: roundedLng,
      pincode,
      city,
      state,
      district,
      country,
      area,
      landmark: detectedLandmark,
      formattedAddress,
      date: currentDate,
      time: currentTime,
    };

    geocodeCache.set(cacheKey, result);
    return result;
  } catch (err) {
    console.warn("Reverse geocoding error, using fallback coordinate mapping:", err);

    return {
      lat: roundedLat,
      lng: roundedLng,
      pincode: "",
      city: "",
      state: "",
      district: "",
      country: "India",
      area: `Location (${roundedLat.toFixed(4)}, ${roundedLng.toFixed(4)})`,
      landmark: "",
      formattedAddress: `Lat: ${roundedLat.toFixed(4)}, Lng: ${roundedLng.toFixed(4)}`,
      date: currentDate,
      time: currentTime,
    };
  }
}

/**
 * Convenience method to detect current GPS location and reverse geocode in one step
 */
export async function detectCurrentLocation(): Promise<LocationDetectionResult> {
  const coords = await getCurrentGPSCoordinates();
  return await reverseGeocode(coords.lat, coords.lng);
}
