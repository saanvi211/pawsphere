import { SpeciesType } from './animal';

export type PetShoppingCategory = 'Food' | 'Treats' | 'Toys' | 'Grooming' | 'Accessories' | 'Health Supplies' | 'Aquarium Supplies' | 'Bird Supplies' | 'Reptile Supplies' | 'Habitat Supplies';

export interface PetShoppingPlace {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  phone?: string;
  website?: string;
  rating?: number;
  type: string;
  services: string[];
  supportedPets: SpeciesType[];
  openingHours?: string;
  distanceKm?: number;
}
