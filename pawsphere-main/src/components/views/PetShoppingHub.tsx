import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ExternalLink, Heart, LocateFixed, Loader2, Map, MapPin, Navigation, Phone, Search, Store, X } from 'lucide-react';
import { Animal, SpeciesType } from '../../types/animal';
import { PetShoppingCategory, PetShoppingPlace } from '../../types/petShopping';
import { EXTERNAL_RETAILERS } from '../../data/externalRetailers';
import { getDirectionsUrl, searchPetShoppingPlaces } from '../../lib/api/petShopping';

interface PetShoppingHubProps { userId: string; animal: Animal | null; allAnimals?: Animal[]; onSelectAnimal?: (id: string) => void; }
const pets: { label: string; species: SpeciesType }[] = [
  { label: 'Dogs', species: 'dog' }, { label: 'Cats', species: 'cat' }, { label: 'Rabbits', species: 'rabbit' }, { label: 'Birds', species: 'bird' }, { label: 'Hamsters', species: 'hamster' }, { label: 'Fish', species: 'fish' }, { label: 'Reptiles', species: 'reptile' }, { label: 'Turtles', species: 'reptile' }, { label: 'Small Pets', species: 'other' }, { label: 'Other Pets', species: 'other' }
];
const categories: PetShoppingCategory[] = ['Food', 'Treats', 'Toys', 'Grooming', 'Accessories', 'Health Supplies', 'Aquarium Supplies', 'Bird Supplies', 'Reptile Supplies', 'Habitat Supplies'];

export const PetShoppingHub: React.FC<PetShoppingHubProps> = ({ userId, animal, allAnimals = [], onSelectAnimal }) => {
  const [query, setQuery] = useState('');
  const [places, setPlaces] = useState<PetShoppingPlace[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<PetShoppingPlace | null>(null);
  const [species, setSpecies] = useState<SpeciesType | 'all'>(animal?.species || 'all');
  const [category, setCategory] = useState<PetShoppingCategory | 'all'>('all');
  const [view, setView] = useState<'list' | 'map'>('list');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [locationError, setLocationError] = useState('');
  const [favorites, setFavorites] = useState<string[]>(() => JSON.parse(localStorage.getItem(`pawsphere_favorite_places_${userId}`) || '[]'));
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setSpecies(animal?.species || 'all'); }, [animal?.species]);
  useEffect(() => { localStorage.setItem(`pawsphere_favorite_places_${userId}`, JSON.stringify(favorites)); }, [favorites, userId]);
  const relevantCategories = category === 'all' ? categories : [category];
  const retailers = EXTERNAL_RETAILERS.filter(retailer => (species === 'all' || retailer.species.includes(species)) && relevantCategories.includes(retailer.category));
  const filteredPlaces = useMemo(() => places.filter(place => species === 'all' || place.supportedPets.includes(species)), [places, species]);

  const searchPlaces = async (location = query) => {
    if (!location.trim()) return;
    setLoading(true); setError(''); setLocationError('');
    try { setPlaces(await searchPetShoppingPlaces(location, species)); } catch { setError('Nearby pet businesses could not be loaded. Try another area or check your connection.'); } finally { setLoading(false); }
  };
  const useLocation = () => {
    if (!navigator.geolocation) { setLocationError('Location is not supported by this browser.'); return; }
    setLoading(true); setLocationError('');
    navigator.geolocation.getCurrentPosition(position => { const nextQuery = `${position.coords.latitude},${position.coords.longitude}`; setQuery(nextQuery); searchPlaces(nextQuery); }, () => { setLoading(false); setLocationError('Location permission was denied or unavailable. Enter a city or area to search manually.'); }, { timeout: 10000 });
  };
  const toggleFavorite = (id: string) => setFavorites(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id]);
  const selectSpecies = (next: SpeciesType | 'all') => { setSpecies(next); setPlaces([]); setSelectedPlace(null); };

  useEffect(() => {
    if (view !== 'map' || !mapRef.current || filteredPlaces.length === 0) return;
    let map: import('leaflet').Map | undefined;
    import('leaflet').then(L => {
      if (!mapRef.current) return;
      const center = filteredPlaces[0];
      map = L.map(mapRef.current).setView([center.lat, center.lng], 12);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap contributors' }).addTo(map);
      filteredPlaces.forEach(place => L.marker([place.lat, place.lng]).addTo(map!).bindPopup(`<strong>${place.name}</strong><br>${place.address}`).on('click', () => setSelectedPlace(place)));
    });
    return () => {
      map?.remove();
    };
  }, [filteredPlaces, view]);

  return <div className="min-h-screen bg-[#f4f7f7] text-slate-800"><main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
    <header className="rounded-3xl bg-[#063b3d] text-white p-6 sm:p-9"><div className="max-w-3xl"><div className="flex items-center gap-2 text-emerald-300 text-[10px] uppercase tracking-[0.2em] font-extrabold"><Store className="w-4 h-4" /> Pawsphere discovery</div><h1 className="text-3xl sm:text-5xl font-extrabold mt-3">Pet Shopping Hub</h1><p className="text-sm text-emerald-50/80 mt-3">Find nearby pet stores and trusted places to shop for your pet. Pawsphere does not sell products or process checkout.</p></div><div className="flex flex-col sm:flex-row gap-2 mt-6"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" /><input value={query} onChange={event => setQuery(event.target.value)} onKeyDown={event => event.key === 'Enter' && searchPlaces()} placeholder="Search stores, products or services" className="w-full rounded-xl bg-white text-slate-800 py-3 pl-10 pr-3 text-sm outline-none" /></div><button onClick={() => searchPlaces()} className="rounded-xl bg-[#f28c38] px-5 py-3 text-xs font-extrabold">Search</button><button onClick={useLocation} disabled={loading} className="rounded-xl border border-emerald-200/40 px-4 py-3 text-xs font-extrabold flex items-center justify-center gap-2">{loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LocateFixed className="w-4 h-4" />} Use my location</button></div></header>
    {locationError && <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-xs text-amber-800">{locationError}</div>}
    {error && <div className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-xs text-rose-800">{error}</div>}
    <section className="space-y-3"><div className="flex justify-between items-center"><div><p className="text-[10px] uppercase tracking-[0.2em] text-emerald-700 font-extrabold">Personalized discovery</p><h2 className="text-xl font-extrabold text-[#063b3d] mt-1">Shop by pet</h2></div>{allAnimals.length > 0 && <select value={animal?.id || ''} onChange={event => onSelectAnimal?.(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold"><option value="">All pets</option>{allAnimals.map(pet => <option key={pet.id} value={pet.id}>{pet.name} · {pet.species}</option>)}</select>}</div><div className="flex gap-2 overflow-x-auto pb-2">{pets.map(pet => <button key={`${pet.label}-${pet.species}`} onClick={() => selectSpecies(pet.species)} className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-extrabold ${species === pet.species ? 'bg-[#f28c38] text-white' : 'bg-white border border-slate-200 text-slate-600'}`}>{pet.label}</button>)}</div>{animal && <p className="text-[11px] text-slate-500">Shopping recommendations for <strong>{animal.name}</strong> · {animal.breed} · {animal.ageYears} years · {animal.weightKg} kg</p>}</section>
    <section><div className="flex gap-2 overflow-x-auto pb-2">{['all', ...categories].map(item => <button key={item} onClick={() => setCategory(item as PetShoppingCategory | 'all')} className={`whitespace-nowrap rounded-full px-3 py-2 text-[11px] font-bold ${category === item ? 'bg-[#063b3d] text-white' : 'bg-white border border-slate-200 text-slate-600'}`}>{item === 'all' ? 'All services' : item}</button>)}</div></section>
    <section className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-5"><div className="space-y-4"><div className="flex items-end justify-between"><div><p className="text-[10px] uppercase tracking-[0.2em] text-emerald-700 font-extrabold">Live directory results</p><h2 className="text-xl font-extrabold text-[#063b3d] mt-1">Nearby pet stores</h2></div><div className="flex rounded-xl bg-white border border-slate-200 p-1"><button onClick={() => setView('list')} className={`px-3 py-2 text-[10px] font-extrabold rounded-lg ${view === 'list' ? 'bg-[#063b3d] text-white' : ''}`}>List</button><button onClick={() => setView('map')} className={`px-3 py-2 text-[10px] font-extrabold rounded-lg flex items-center gap-1 ${view === 'map' ? 'bg-[#063b3d] text-white' : ''}`}><Map className="w-3 h-3" /> Map</button></div></div>{filteredPlaces.length === 0 ? <div className="rounded-2xl bg-white border border-slate-200 p-8 text-center"><MapPin className="w-8 h-8 mx-auto text-slate-300" /><p className="text-sm font-extrabold text-slate-600 mt-3">No nearby pet stores found.</p><p className="text-[11px] text-slate-400 mt-1">Search a city or area, or use your location to discover real OpenStreetMap businesses.</p></div> : filteredPlaces.map(place => <PlaceCard key={place.id} place={place} favorite={favorites.includes(place.id)} onFavorite={toggleFavorite} onDetails={setSelectedPlace} />)}</div><div className="min-h-[360px]">{view === 'map' && filteredPlaces.length > 0 ? <div ref={mapRef} className="h-full min-h-[360px] rounded-3xl overflow-hidden border border-slate-200 shadow-sm" /> : <div className="rounded-3xl bg-[#dce9e4] p-7 h-full flex flex-col justify-center"><MapPin className="w-10 h-10 text-emerald-700" /><h3 className="text-2xl font-extrabold text-[#063b3d] mt-4">Discover nearby care</h3><p className="text-sm text-slate-600 mt-2">Search a location to compare verified map results, store details, opening hours, and available services.</p></div>}</div></section>
    <section className="rounded-3xl bg-white p-5 sm:p-7 border border-slate-200"><p className="text-[10px] uppercase tracking-[0.2em] text-orange-600 font-extrabold">External destinations</p><h2 className="text-xl font-extrabold text-[#063b3d] mt-1">Shop online</h2><p className="text-xs text-slate-500 mt-1">Prefer online shopping? Explore trusted pet retailers. Checkout, payment, delivery, and returns happen externally.</p><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-5">{retailers.map(retailer => <a key={`${retailer.name}-${retailer.category}`} href={retailer.url} target="_blank" rel="noreferrer" className="rounded-2xl border border-slate-200 p-4 hover:border-orange-400 transition"><p className="text-[10px] uppercase tracking-wider text-slate-400 font-extrabold">{retailer.category}</p><h3 className="font-extrabold text-[#063b3d] mt-2">{retailer.name}</h3><span className="text-[10px] text-orange-600 font-bold mt-3 inline-flex items-center gap-1">Shop externally <ExternalLink className="w-3 h-3" /></span></a>)}</div>{retailers.length === 0 && <p className="text-xs text-slate-500 mt-4">Select a pet or service category to see relevant retailer links.</p>}</section>
    {selectedPlace && <PlaceDetails place={selectedPlace} favorite={favorites.includes(selectedPlace.id)} onFavorite={toggleFavorite} onClose={() => setSelectedPlace(null)} />}
  </main></div>;
};

const PlaceCard: React.FC<{ place: PetShoppingPlace; favorite: boolean; onFavorite: (id: string) => void; onDetails: (place: PetShoppingPlace) => void }> = ({ place, favorite, onFavorite, onDetails }) => <article className="rounded-2xl bg-white border border-slate-200 p-4"><div className="flex justify-between gap-3"><div><h3 className="text-sm font-extrabold text-[#063b3d]">{place.name}</h3><p className="text-[10px] text-slate-500 mt-1">{place.type} · {place.address}</p></div><button onClick={() => onFavorite(place.id)} className={favorite ? 'text-pink-500' : 'text-slate-400'} title="Save favorite"><Heart className="w-4 h-4" fill={favorite ? 'currentColor' : 'none'} /></button></div><div className="flex flex-wrap gap-2 mt-3">{place.services.map(service => <span key={service} className="rounded-full bg-emerald-50 px-2 py-1 text-[9px] text-emerald-700">{service}</span>)}</div><div className="flex flex-wrap gap-2 mt-4"><button onClick={() => onDetails(place)} className="rounded-lg bg-[#063b3d] px-3 py-2 text-[10px] font-extrabold text-white">View details</button><a href={getDirectionsUrl(place)} target="_blank" rel="noreferrer" className="rounded-lg border border-slate-200 px-3 py-2 text-[10px] font-extrabold text-slate-600 flex items-center gap-1"><Navigation className="w-3 h-3" /> Directions</a>{place.phone && <a href={`tel:${place.phone}`} className="rounded-lg border border-slate-200 px-3 py-2 text-[10px] font-extrabold text-slate-600 flex items-center gap-1"><Phone className="w-3 h-3" /> Call</a>}</div></article>;

const PlaceDetails: React.FC<{ place: PetShoppingPlace; favorite: boolean; onFavorite: (id: string) => void; onClose: () => void }> = ({ place, favorite, onFavorite, onClose }) => <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-end sm:items-center justify-center p-4"><div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl"><div className="flex justify-between"><div><p className="text-[10px] uppercase tracking-wider text-emerald-700 font-extrabold">Pet shopping place</p><h2 className="text-2xl font-extrabold text-[#063b3d] mt-1">{place.name}</h2></div><button onClick={onClose} title="Close details"><X className="w-5 h-5" /></button></div><p className="text-sm text-slate-500 mt-4">{place.address}</p>{place.openingHours && <p className="text-xs text-slate-600 mt-3">Hours: {place.openingHours}</p>}<div className="flex flex-wrap gap-2 mt-4">{place.services.map(service => <span key={service} className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] text-emerald-700">{service}</span>)}</div><div className="flex flex-wrap gap-2 mt-6"><button onClick={() => onFavorite(place.id)} className="rounded-xl border border-slate-200 px-4 py-3 text-xs font-extrabold flex items-center gap-2"> <Heart className="w-4 h-4 text-pink-500" fill={favorite ? 'currentColor' : 'none'} /> {favorite ? 'Saved' : 'Save'}</button><a href={getDirectionsUrl(place)} target="_blank" rel="noreferrer" className="rounded-xl bg-[#063b3d] text-white px-4 py-3 text-xs font-extrabold flex items-center gap-2"><Navigation className="w-4 h-4" /> Get directions</a>{place.website && <a href={place.website} target="_blank" rel="noreferrer" className="rounded-xl bg-[#f28c38] text-white px-4 py-3 text-xs font-extrabold flex items-center gap-2"><ExternalLink className="w-4 h-4" /> Visit website</a>}</div></div></div>;
