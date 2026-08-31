import { PetShoppingPlace } from '../../types/petShopping';
import { SpeciesType } from '../../types/animal';

interface OverpassElement {
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

const tagsToPlace = (element: OverpassElement, species: SpeciesType | 'all'): PetShoppingPlace | null => {
  const tags = element.tags || {};
  const point = element.center || (element.lat !== undefined && element.lon !== undefined ? { lat: element.lat, lon: element.lon } : null);
  if (!point || !tags.name) return null;
  const shopType = tags.shop || tags.amenity || 'pet-related place';
  const supportedPets: SpeciesType[] = species === 'all' ? ['dog', 'cat', 'rabbit', 'bird', 'fish', 'reptile', 'hamster', 'other'] : [species];
  return {
    id: `osm-${element.id}`,
    name: tags.name,
    address: [tags['addr:street'], tags['addr:suburb'], tags['addr:city']].filter(Boolean).join(', ') || 'Address unavailable',
    lat: point.lat,
    lng: point.lon,
    phone: tags.phone,
    website: tags.website,
    type: shopType,
    services: tags.service ? tags.service.split(';') : [shopType],
    supportedPets,
    openingHours: tags.opening_hours
  };
};

export async function searchPetShoppingPlaces(query: string, species: SpeciesType | 'all' = 'all'): Promise<PetShoppingPlace[]> {
  const safeQuery = query.trim();
  if (!safeQuery) return [];
  const nominatim = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(safeQuery)}`, { headers: { Accept: 'application/json' } });
  if (!nominatim.ok) throw new Error('Location search failed');
  const locations = await nominatim.json() as Array<{ lat: string; lon: string }>;
  if (!locations[0]) return [];
  const lat = Number(locations[0].lat);
  const lon = Number(locations[0].lon);
  const radius = 8000;
  const overpassQuery = `[out:json][timeout:15];(nwr[shop~"pet|animal_feed"](around:${radius},${lat},${lon});nwr[amenity~"veterinary|animal_shelter"](around:${radius},${lat},${lon}););out center tags;`;
  const placesResponse = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`);
  if (!placesResponse.ok) throw new Error('Nearby places search failed');
  const result = await placesResponse.json() as { elements: OverpassElement[] };
  return result.elements.map(element => tagsToPlace(element, species)).filter((place): place is PetShoppingPlace => place !== null);
}

export function getDirectionsUrl(place: PetShoppingPlace): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`;
}
