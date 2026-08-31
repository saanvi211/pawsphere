/**
 * Geolocation utilities for finding user location and nearby places
 */

export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
  accuracy?: number;
}

export interface GroomingCentre {
  id: string;
  name: string;
  address: string;
  phone?: string;
  website?: string;
  rating: number;
  reviews: number;
  image: string;
  lat: number;
  lng: number;
  openingHours?: string;
  services: string[];
  petTypes: string[];
  price?: string;
  distance?: number;
  matchScore?: number;
  isOpen?: boolean;
  acceptsBooking?: boolean;
  externalBookingUrl?: string;
  isDemo?: boolean;
  isRealGooglePlace?: boolean;
  placeId?: string;
  vicinity?: string;
}


/**
 * Request user's current geolocation
 * Returns latitude, longitude, and address if available
 */
export const getUserLocation = (): Promise<Location> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  });
};

/**
 * Calculate distance between two points using Haversine formula
 * Returns distance in kilometers
 */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance * 10) / 10; // Round to 1 decimal place
};

/**
 * Get Google Maps URL for directions
 */
export const getDirectionsUrl = (
  userLat: number,
  userLng: number,
  centreLat: number,
  centreLng: number,
  centreName: string
): string => {
  return `https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLng}&destination=${centreLat},${centreLng}&destination_name=${encodeURIComponent(centreName)}&travelmode=driving`;
};

/**
 * Get OpenStreetMap URL for directions (alternative)
 */
export const getOSMDirectionsUrl = (
  userLat: number,
  userLng: number,
  centreLat: number,
  centreLng: number
): string => {
  return `https://www.openstreetmap.org/directions?engine=osrm_car&route=${userLat},${userLng};${centreLat},${centreLng}`;
};

/**
 * Format distance for display
 */
export const formatDistance = (distance: number): string => {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`;
  }
  return `${distance}km`;
};

/**
 * Check if centre is currently open based on opening hours
 */
export const isCurrentlyOpen = (openingHours: string): boolean => {
  // Simple check - in real app, parse actual hours
  const now = new Date();
  const hours = now.getHours();
  // Assume most centres open 8-20
  return hours >= 8 && hours <= 20;
};

/**
 * Calculate pet compatibility score for a centre
 */
export const calculatePetMatch = (
  centre: GroomingCentre,
  petSpecies: string,
  petBreed: string,
  petCoatType?: string
): number => {
  let score = 50; // Base score

  // Species match
  if (centre.petTypes.includes(petSpecies === 'dog' ? 'Dogs' : petSpecies === 'cat' ? 'Cats' : 'Other Pets')) {
    score += 20;
  }

  // Service match for specific species
  if (petSpecies === 'dog') {
    if (centre.services.includes('Bath & Dry')) score += 5;
    if (centre.services.includes('Hair Cut & Styling')) score += 5;
    if (petCoatType === 'long' && centre.services.includes('De-shedding Treatment')) score += 10;
    if (petBreed.includes('Golden') || petBreed.includes('Retriever')) {
      if (centre.services.includes('De-shedding Treatment')) score += 5;
    }
  } else if (petSpecies === 'cat') {
    if (centre.services.includes('Bath & Dry')) score += 5;
    if (petCoatType === 'long' && centre.services.includes('De-matting')) score += 10;
    if (centre.services.includes('Gentle Handling')) score += 5;
  }

  // Rating bonus
  if (centre.rating >= 4.5) score += 5;
  if (centre.rating >= 4.8) score += 5;

  return Math.min(score, 100);
};
