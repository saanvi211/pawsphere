import { SpeciesType } from '../types/animal';
import { PetShoppingCategory } from '../types/petShopping';

export interface ExternalRetailer {
  name: string;
  category: PetShoppingCategory;
  species: SpeciesType[];
  url: string;
}

export const EXTERNAL_RETAILERS: ExternalRetailer[] = [
  { name: 'Amazon', category: 'Food', species: ['dog', 'cat', 'rabbit', 'bird', 'fish', 'reptile', 'hamster', 'other'], url: 'https://www.amazon.in/s?k=pet+food' },
  { name: 'Supertails', category: 'Food', species: ['dog', 'cat'], url: 'https://supertails.com/collections/food' },
  { name: 'Amazon', category: 'Toys', species: ['dog', 'cat', 'rabbit', 'bird', 'hamster', 'other'], url: 'https://www.amazon.in/s?k=pet+toys' },
  { name: 'Supertails', category: 'Grooming', species: ['dog', 'cat'], url: 'https://supertails.com/collections/grooming' },
  { name: 'Amazon', category: 'Aquarium Supplies', species: ['fish'], url: 'https://www.amazon.in/s?k=aquarium+supplies' },
  { name: 'Amazon', category: 'Bird Supplies', species: ['bird'], url: 'https://www.amazon.in/s?k=bird+supplies' },
  { name: 'Amazon', category: 'Reptile Supplies', species: ['reptile'], url: 'https://www.amazon.in/s?k=reptile+supplies' },
  { name: 'Amazon', category: 'Habitat Supplies', species: ['rabbit', 'hamster', 'other'], url: 'https://www.amazon.in/s?k=small+pet+habitat+supplies' }
];
