import { SpeciesType } from './animal';

export type SupportedPetType = 'Dogs' | 'Cats' | 'Rabbits' | 'Birds' | 'Small Pets' | 'Exotic Pets';

export type PriceLevel = '₹' | '₹₹' | '₹₹₹';

export type GroomingSortOption = 'nearest' | 'rating' | 'reviews' | 'price_low' | 'open_now';

export interface GroomingServiceItem {
  id: string;
  name: string;
  category: 'bathing' | 'haircut' | 'hygiene' | 'spa' | 'specialty';
  price: number;
  duration: string;
  description: string;
  supportedPets: SupportedPetType[];
  popular?: boolean;
}

export interface GroomingPricingTier {
  id: string;
  name: string;
  subtitle: string;
  price: number;
  duration: string;
  popular?: boolean;
  features: string[];
}

export interface GroomerTeamMember {
  id: string;
  name: string;
  role: string;
  experienceYears: number;
  rating: number;
  specialty: string;
  avatar: string;
  bio: string;
}

export interface GroomingReview {
  id: string;
  author: string;
  petName: string;
  petSpecies: string;
  rating: number;
  date: string;
  comment: string;
  serviceUsed: string;
  verified: boolean;
}

export interface GroomingCenter {
  id: string;
  name: string;
  tagline: string;
  latitude: number;
  longitude: number;
  address: string;
  locality: string;
  city: string;
  pincode: string;
  distance?: number; // Calculated dynamically in km
  rating: number;
  reviewsCount: number;
  phone: string;
  alternatePhone?: string;
  email?: string;
  website: string;
  isOpenNow: boolean;
  openingHours: string;
  priceLevel: PriceLevel;
  startingPrice: number;
  coverImage: string;
  galleryImages: string[];
  supportedPetTypes: SupportedPetType[];
  breedSpecialties: string[];
  services: GroomingServiceItem[];
  pricingTiers: GroomingPricingTier[];
  groomers: GroomerTeamMember[];
  reviews: GroomingReview[];
  features: string[];
  mobileGroomingAvailable: boolean;
  emergencyGroomingAvailable: boolean;
  petFriendlyCert: boolean;
  gentleHandlingCert: boolean;
  description: string;
}

export interface GroomingAppointmentBooking {
  id: string;
  centerId: string;
  centerName: string;
  centerAddress: string;
  centerPhone: string;
  petId?: string;
  petName: string;
  petType: string;
  petBreed: string;
  serviceId: string;
  serviceName: string;
  groomerId?: string;
  groomerName?: string;
  date: string;
  timeSlot: string;
  specialInstructions?: string;
  estimatedPrice: number;
  status: 'confirmed' | 'completed' | 'cancelled';
  createdAt: string;
}
