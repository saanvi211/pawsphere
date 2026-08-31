/**
 * Google Maps JavaScript API and Places API Service
 * PawSphere Universal Veterinary & Pet Care Platform
 */

import { GroomingCentre, calculateDistance } from '../geolocation';

let googleMapsPromise: Promise<typeof google.maps> | null = null;

/**
 * Checks if a real Google Maps API key is configured
 */
export const getGoogleMapsApiKey = (): string | null => {
  const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  if (!key || key.trim() === '' || key.includes('your-google-maps-api-key-here')) {
    return null;
  }
  return key.trim();
};

export const isGoogleMapsConfigured = (): boolean => {
  return getGoogleMapsApiKey() !== null;
};

/**
 * Dynamically loads the Google Maps JavaScript API with Places library
 */
export const loadGoogleMaps = (): Promise<typeof google.maps> => {
  if (googleMapsPromise) return googleMapsPromise;

  const apiKey = getGoogleMapsApiKey();
  if (!apiKey) {
    return Promise.reject(new Error('Google Maps API key is not configured in VITE_GOOGLE_MAPS_API_KEY'));
  }

  // If already loaded in window
  if (typeof window !== 'undefined' && window.google && window.google.maps && window.google.maps.places) {
    googleMapsPromise = Promise.resolve(window.google.maps);
    return googleMapsPromise;
  }

  googleMapsPromise = new Promise((resolve, reject) => {
    // Check if script tag is already in DOM
    const existingScript = document.getElementById('pawsphere-google-maps-script');
    if (existingScript) {
      existingScript.addEventListener('load', () => {
        if (window.google?.maps) resolve(window.google.maps);
        else reject(new Error('Google Maps loaded but google.maps is undefined'));
      });
      existingScript.addEventListener('error', () => reject(new Error('Failed to load Google Maps script')));
      return;
    }

    const script = document.createElement('script');
    script.id = 'pawsphere-google-maps-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry&loading=async&callback=__pawsphereGoogleMapsLoaded`;
    script.async = true;
    script.defer = true;

    (window as any).__pawsphereGoogleMapsLoaded = () => {
      if (window.google?.maps) {
        resolve(window.google.maps);
      } else {
        reject(new Error('Google Maps API initialization callback failed'));
      }
    };

    script.onerror = () => {
      reject(new Error('Failed to load Google Maps JavaScript API. Please check your API key and network connection.'));
    };

    document.head.appendChild(script);
  });

  return googleMapsPromise;
};

export interface SearchNearbyOptions {
  latitude: number;
  longitude: number;
  radiusMeters?: number; // default 10000m (10km)
  category?: 'all' | 'groomer' | 'dog' | 'cat' | 'spa';
}

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  all: ['pet groomer', 'pet grooming', 'dog grooming', 'cat grooming', 'pet spa'],
  groomer: ['pet groomer', 'pet grooming salon'],
  dog: ['dog groomer', 'dog grooming'],
  cat: ['cat groomer', 'cat grooming'],
  spa: ['pet spa', 'dog spa', 'luxury pet salon'],
};

/**
 * Searches real pet groomers, salons, and spas around the user's coordinates using Google Places API
 */
export const searchNearbyGroomingPlaces = async (
  options: SearchNearbyOptions
): Promise<GroomingCentre[]> => {
  const { latitude, longitude, radiusMeters = 10000, category = 'all' } = options;

  const maps = await loadGoogleMaps();
  const dummyElement = document.createElement('div');
  const placesService = new maps.places.PlacesService(dummyElement);

  const keywords = CATEGORY_KEYWORDS[category] || CATEGORY_KEYWORDS.all;
  const userLatLng = new maps.LatLng(latitude, longitude);

  // Run searches for each keyword in parallel
  const searchPromises = keywords.map((keyword) => {
    return new Promise<google.maps.places.PlaceResult[]>((resolve) => {
      const request: google.maps.places.PlaceSearchRequest = {
        location: userLatLng,
        radius: radiusMeters,
        keyword,
        type: 'pet_store', // or related types
      };

      placesService.nearbySearch(request, (results, status) => {
        if (status === maps.places.PlacesServiceStatus.OK && results) {
          resolve(results);
        } else {
          // If no results for this specific keyword, return empty array
          resolve([]);
        }
      });
    });
  });

  const searchResultsArrays = await Promise.all(searchPromises);
  const allResults = searchResultsArrays.flat();

  // Deduplicate by place_id
  const uniquePlacesMap = new Map<string, google.maps.places.PlaceResult>();
  for (const place of allResults) {
    if (place.place_id && !uniquePlacesMap.has(place.place_id)) {
      uniquePlacesMap.set(place.place_id, place);
    }
  }

  const uniquePlaces = Array.from(uniquePlacesMap.values());

  if (uniquePlaces.length === 0) {
    return [];
  }

  // Fetch Place Details for the top 15 places to get phone, website, opening hours, etc.
  const topPlaces = uniquePlaces.slice(0, 15);

  const detailPromises = topPlaces.map((place) => {
    if (!place.place_id) return Promise.resolve(place);

    return new Promise<google.maps.places.PlaceResult>((resolve) => {
      placesService.getDetails(
        {
          placeId: place.place_id!,
          fields: [
            'place_id',
            'name',
            'formatted_address',
            'vicinity',
            'formatted_phone_number',
            'international_phone_number',
            'website',
            'rating',
            'user_ratings_total',
            'geometry',
            'photos',
            'opening_hours',
            'reviews',
            'types',
            'price_level',
          ],
        },
        (detailResult, detailStatus) => {
          if (detailStatus === maps.places.PlacesServiceStatus.OK && detailResult) {
            resolve(detailResult);
          } else {
            resolve(place);
          }
        }
      );
    });
  });

  const detailedPlaces = await Promise.all(detailPromises);

  // Convert Places results to GroomingCentre domain model
  const defaultImages = [
    'https://images.unsplash.com/photo-1576091160550-112173f7f869?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1601758228578-4d96d06ece5a?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1516714435840-9f4ee3f1b25f?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1552053831-71594a27c62d?w=600&h=400&fit=crop',
  ];

  return detailedPlaces.map((p, idx) => {
    const lat = p.geometry?.location ? p.geometry.location.lat() : latitude;
    const lng = p.geometry?.location ? p.geometry.location.lng() : longitude;
    const distance = calculateDistance(latitude, longitude, lat, lng);

    let photoUrl = defaultImages[idx % defaultImages.length];
    if (p.photos && p.photos.length > 0) {
      try {
        photoUrl = p.photos[0].getUrl({ maxWidth: 600, maxHeight: 400 });
      } catch (err) {
        // use fallback image
      }
    }

    // Determine pet types based on name & types
    const nameLower = (p.name || '').toLowerCase();
    const petTypes: string[] = ['All Breeds'];
    if (nameLower.includes('dog')) petTypes.push('Dogs');
    if (nameLower.includes('cat')) petTypes.push('Cats');
    if (nameLower.includes('spa')) petTypes.push('Premium Spa');

    // Default services inferred or available
    const services = [
      'Bath & Blow Dry',
      'Full Grooming & Styling',
      'Nail Trim & Filing',
      'Ear & Eye Hygiene',
    ];
    if (nameLower.includes('spa')) services.push('Hydrotherapy & Aromatherapy');
    if (nameLower.includes('cat')) services.push('Feline Low-Stress Grooming');

    let openingHoursStr: string | undefined;
    if (p.opening_hours?.weekday_text && p.opening_hours.weekday_text.length > 0) {
      openingHoursStr = p.opening_hours.weekday_text[0]; // e.g. "Monday: 9:00 AM – 7:00 PM"
    } else if (p.opening_hours?.open_now !== undefined) {
      openingHoursStr = p.opening_hours.open_now ? 'Open Now (Standard Hours)' : 'Closed Now';
    }

    const priceLevels = ['₹350-₹800', '₹600-₹1500', '₹1000-₹2500', '₹1800-₹4000'];
    const priceStr = p.price_level !== undefined ? priceLevels[p.price_level] || '₹600-₹1800' : '₹500-₹1800';

    return {
      id: p.place_id || `google-place-${idx}-${Date.now()}`,
      placeId: p.place_id,
      name: p.name || 'Pet Grooming Centre',
      address: p.formatted_address || p.vicinity || 'Local Area',
      vicinity: p.vicinity,
      phone: p.formatted_phone_number || p.international_phone_number,
      website: p.website,
      rating: p.rating || 4.5,
      reviews: p.user_ratings_total || 12,
      image: photoUrl,
      lat,
      lng,
      openingHours: openingHoursStr || 'Mon-Sat 9:00 AM - 7:00 PM',
      services,
      petTypes,
      price: priceStr,
      distance,
      isOpen: p.opening_hours?.open_now,
      acceptsBooking: true,
      isRealGooglePlace: true,
      isDemo: false,
    };
  });
};
