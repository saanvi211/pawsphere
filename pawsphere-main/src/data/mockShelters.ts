import { Shelter } from '../types/animal';

export const MOCK_SHELTERS: Shelter[] = [
  {
    id: 'shelter-cupa-01',
    name: 'CUPA Animal Adoption Center',
    type: 'Verified Adoption Shelter',
    address: 'Kalyan Nagar, Outer Ring Road',
    city: 'Bengaluru',
    phone: '+91 80 2294 7300',
    email: 'adoptions@cupaindia.org',
    openingHours: 'Mon - Sat: 9:00 AM - 6:00 PM',
    lat: 13.028,
    lng: 77.64,
    availablePetsCount: 24
  },
  {
    id: 'shelter-streeties-02',
    name: 'Community Streeties Rescue & Care',
    type: 'Verified Adoption Shelter',
    address: 'Indiranagar 100ft Road',
    city: 'Bengaluru',
    phone: '+91 98450 12345',
    email: 'help@streetiesrescue.org',
    openingHours: 'Mon - Sun: 8:00 AM - 8:00 PM',
    lat: 12.978,
    lng: 77.64,
    availablePetsCount: 18
  },
  {
    id: 'shelter-ethical-03',
    name: 'Ethical Paws & Exotic Pet Haven',
    type: 'Licensed Ethical Breeder',
    address: 'Koramangala 4th Block',
    city: 'Bengaluru',
    phone: '+91 99000 88776',
    email: 'info@ethicalpaws.com',
    openingHours: 'Mon - Sat: 10:00 AM - 7:00 PM',
    lat: 12.934,
    lng: 77.625,
    availablePetsCount: 9
  }
];
