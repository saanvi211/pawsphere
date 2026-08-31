import { Animal, SpeciesType } from '../types/animal';

const FALLBACK_IMAGES: Record<SpeciesType, string> = {
  dog: '/images/pet-fallbacks/dog.svg',
  cat: '/images/pet-fallbacks/cat.svg',
  bird: '/images/pet-fallbacks/bird.svg',
  fish: '/images/pet-fallbacks/fish.svg',
  reptile: '/images/pet-fallbacks/reptile.svg',
  rabbit: '/images/pet-fallbacks/rabbit.svg',
  hamster: '/images/pet-fallbacks/hamster.svg',
  other: '/images/pet-fallbacks/other.svg',
};

export function getPetImageUrl(pet: Pick<Animal, 'photoUrl' | 'species'> | null | undefined): string {
  const source = pet?.photoUrl?.trim();
  return source || getPetFallbackImageUrl(pet?.species);
}

export function getPetFallbackImageUrl(species: SpeciesType | undefined): string {
  return FALLBACK_IMAGES[species || 'other'];
}
