import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  MapPin,
  Phone,
  Star,
  Navigation,
  Globe,
  Clock,
  ChevronRight,
  ArrowLeft,
  Map as MapIcon,
  List,
  AlertCircle,
  Loader2,
  Heart,
  MapPinOff,
  Zap,
  Trophy,
  Sparkles,
  RefreshCw,
  Search,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { Animal } from '../../types/animal';
import {
  getUserLocation,
  calculateDistance,
  getDirectionsUrl,
  formatDistance,
  calculatePetMatch,
  Location,
  GroomingCentre,
} from '../../lib/geolocation';
import {
  searchNearbyGroomingPlaces,
  isGoogleMapsConfigured,
} from '../../lib/api/googleMaps';
import { GoogleGroomingMap } from '../maps/GoogleGroomingMap';

interface NearbyGroomingCentresProps {
  animal: Animal | null;
  userLocation?: Location;
  onSelectCentre?: (centre: GroomingCentre) => void;
  onBackToBooking?: () => void;
}

// Fallback demo Bengaluru grooming centres - clearly marked as demo
const DEMO_GROOMING_CENTRES: GroomingCentre[] = [
  {
    id: 'demo-1',
    name: 'Pawsome Grooming Studio',
    address: '100ft Road, Indiranagar, Bengaluru',
    phone: '+91 9876 543210',
    website: 'https://pawsomegrooming.in',
    rating: 4.8,
    reviews: 342,
    lat: 12.9716,
    lng: 77.5946,
    image: 'https://images.unsplash.com/photo-1576091160550-112173f7f869?w=600&h=400&fit=crop',
    openingHours: 'Mon-Sun 9:00 AM - 7:00 PM',
    services: ['Bath & Dry', 'Hair Cut & Styling', 'Nail Trim', 'Ear Cleaning', 'De-shedding Treatment'],
    petTypes: ['Dogs', 'Cats', 'Fluffy Breeds'],
    price: '₹500-₹1500',
    acceptsBooking: true,
    isDemo: true,
    isRealGooglePlace: false,
  },
  {
    id: 'demo-2',
    name: 'Fur Friends Salon & Spa',
    address: '5th Block, Koramangala, Bengaluru',
    phone: '+91 9123 456789',
    website: 'https://furfriendsalon.in',
    rating: 4.6,
    reviews: 218,
    lat: 12.9352,
    lng: 77.6244,
    image: 'https://images.unsplash.com/photo-1601758228578-4d96d06ece5a?w=600&h=400&fit=crop',
    openingHours: 'Mon-Sat 10:00 AM - 6:00 PM',
    services: ['Bath & Dry', 'Styling & Trimming', 'Aromatherapy Spa', 'Photography'],
    petTypes: ['All Breeds', 'Show Dogs', 'Senior Pets'],
    price: '₹600-₹2000',
    acceptsBooking: true,
    externalBookingUrl: 'https://furfriendsalon.in/book',
    isDemo: true,
    isRealGooglePlace: false,
  },
  {
    id: 'demo-3',
    name: 'Pet Pamper Palace',
    address: 'Sector 2, HSR Layout, Bengaluru',
    phone: '+91 8765 432109',
    website: 'https://petpamperpalace.in',
    rating: 4.7,
    reviews: 289,
    lat: 12.9116,
    lng: 77.6389,
    image: 'https://images.unsplash.com/photo-1516714435840-9f4ee3f1b25f?w=600&h=400&fit=crop',
    openingHours: 'Mon-Sun 8:00 AM - 8:00 PM',
    services: ['Full Grooming', 'Nail Care', 'Ear Cleaning', 'De-shedding', 'Canine Massage'],
    petTypes: ['Cats', 'Dogs', 'Exotic Pets'],
    price: '₹450-₹1800',
    acceptsBooking: true,
    isDemo: true,
    isRealGooglePlace: false,
  },
  {
    id: 'demo-4',
    name: 'Petzone Express & Vet Care',
    address: 'MG Road Metro Station, Bengaluru',
    phone: '+91 7654 321098',
    website: 'https://petzoneexpress.in',
    rating: 4.5,
    reviews: 156,
    lat: 12.9767,
    lng: 77.5713,
    image: 'https://images.unsplash.com/photo-1552053831-71594a27c62d?w=600&h=400&fit=crop',
    openingHours: 'Mon-Fri 9:00 AM - 6:00 PM, Sat 10:00 AM - 4:00 PM',
    services: ['Quick Bath & Dry', 'Nail Trim', 'Hygiene Styling', 'Ear Cleaning'],
    petTypes: ['Dogs', 'Cats'],
    price: '₹300-₹800',
    acceptsBooking: true,
    isDemo: true,
    isRealGooglePlace: false,
  },
  {
    id: 'demo-5',
    name: 'Luxury Paws Boutique & Cat Spa',
    address: 'ITPB Main Road, Whitefield, Bengaluru',
    phone: '+91 9988 776655',
    website: 'https://luxurypaws.in',
    rating: 4.9,
    reviews: 412,
    lat: 12.9698,
    lng: 77.7499,
    image: 'https://images.unsplash.com/photo-1541599540903-216a46ca1dc0?w=600&h=400&fit=crop',
    openingHours: 'Mon-Sun 8:00 AM - 8:00 PM',
    services: ['Premium Herbal Bath', 'Designer Breed Cuts', 'Spa & Aromatherapy', 'Low-Stress Cat Grooming'],
    petTypes: ['All Pets', 'Show Dogs', 'Feline Spa'],
    price: '₹1000-₹3000',
    acceptsBooking: true,
    externalBookingUrl: 'https://luxurypaws.in/appointments',
    isDemo: true,
    isRealGooglePlace: false,
  },
];

type SortBy = 'distance' | 'rating' | 'price' | 'match';
type ViewMode = 'split' | 'list' | 'map';
type CategoryFilter = 'all' | 'groomer' | 'dog' | 'cat' | 'spa';

export const NearbyGroomingCentres: React.FC<NearbyGroomingCentresProps> = ({
  animal,
  userLocation: initialUserLocation,
  onSelectCentre,
  onBackToBooking,
}) => {
  const [userLocation, setUserLocation] = useState<Location | null>(initialUserLocation ?? null);
  const [centres, setCentres] = useState<GroomingCentre[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortBy>('match');
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [selectedCentre, setSelectedCentre] = useState<GroomingCentre | null>(null);
  const [focusedCentreId, setFocusedCentreId] = useState<string | null>(null);
  const [showDetailView, setShowDetailView] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(true);
  const [searchFilter, setSearchFilter] = useState('');

  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Load centres when location, filter, or animal changes
  const fetchGroomingCentres = useCallback(async (loc: Location | null, category: CategoryFilter) => {
    setLoading(true);
    setError(null);

    const targetLoc = loc || {
      latitude: 12.9716,
      longitude: 77.5946,
      address: 'Bengaluru, Karnataka (Demo)',
    };

    try {
      if (isGoogleMapsConfigured()) {
        const places = await searchNearbyGroomingPlaces({
          latitude: targetLoc.latitude,
          longitude: targetLoc.longitude,
          radiusMeters: 12000,
          category,
        });

        if (places.length > 0) {
          setIsDemoMode(false);
          processAndSetCentres(places, targetLoc);
          return;
        }
      }

      // Fallback demo data
      setIsDemoMode(true);
      const filteredDemo = DEMO_GROOMING_CENTRES.filter((c) => {
        if (category === 'dog') return c.petTypes.includes('Dogs') || c.petTypes.includes('Show Dogs');
        if (category === 'cat') return c.petTypes.includes('Cats') || c.petTypes.includes('Feline Spa');
        if (category === 'spa') return c.name.toLowerCase().includes('spa') || c.services.some((s) => s.toLowerCase().includes('spa'));
        return true;
      });

      processAndSetCentres(filteredDemo, targetLoc);
    } catch (err: any) {
      console.warn('Live Places API search failed, using fallback demo data:', err);
      setIsDemoMode(true);
      setError(err?.message || 'Using demo grooming centres in Bengaluru.');
      processAndSetCentres(DEMO_GROOMING_CENTRES, targetLoc);
    } finally {
      setLoading(false);
    }
  }, [animal]);

  // Process, distance calculation, pet match scoring, and sorting
  const processAndSetCentres = (rawCentres: GroomingCentre[], loc: Location) => {
    let processed = rawCentres.map((centre) => {
      const distance = calculateDistance(
        loc.latitude,
        loc.longitude,
        centre.lat,
        centre.lng
      );

      let matchScore = 75;
      if (animal) {
        matchScore = calculatePetMatch(
          centre,
          animal.species,
          animal.breed,
          animal.gender === 'Male' ? 'normal' : 'normal'
        );
      }

      return {
        ...centre,
        distance,
        matchScore,
      };
    });

    // Apply sorting
    sortCentresList(processed, sortBy);
  };

  const sortCentresList = (list: GroomingCentre[], criteria: SortBy) => {
    const sorted = [...list];
    switch (criteria) {
      case 'distance':
        sorted.sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0));
        break;
      case 'rating':
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      case 'price':
        sorted.sort((a, b) => {
          const priceA = parseInt(a.price?.replace(/[^\d]/g, '') || '0', 10);
          const priceB = parseInt(b.price?.replace(/[^\d]/g, '') || '0', 10);
          return priceA - priceB;
        });
        break;
      case 'match':
      default:
        sorted.sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0));
        break;
    }
    setCentres(sorted);
  };

  // Initial load
  useEffect(() => {
    fetchGroomingCentres(userLocation, categoryFilter);
  }, [userLocation, categoryFilter, fetchGroomingCentres]);

  // Request browser geolocation
  const handleRequestLocation = async () => {
    setLoading(true);
    setError(null);

    try {
      const location = await getUserLocation();
      setUserLocation(location);
      await fetchGroomingCentres(location, categoryFilter);
    } catch (err: any) {
      setError('Location permission denied or unavailable. Centered on Bengaluru (Demo).');
      const fallbackLoc: Location = {
        latitude: 12.9716,
        longitude: 77.5946,
        address: 'Bengaluru, India (Demo Mode)',
      };
      setUserLocation(fallbackLoc);
      await fetchGroomingCentres(fallbackLoc, categoryFilter);
    } finally {
      setLoading(false);
    }
  };

  // Handle Sort Change
  const handleSortChange = (newSort: SortBy) => {
    setSortBy(newSort);
    sortCentresList(centres, newSort);
  };

  // Handle Marker Click on Map -> Highlight & scroll corresponding item in list
  const handleMarkerSelect = (centre: GroomingCentre) => {
    setSelectedCentre(centre);
    setFocusedCentreId(centre.id);

    // Scroll card into view in the list
    const cardEl = cardRefs.current.get(centre.id);
    if (cardEl) {
      cardEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  // Handle Card Click in List -> Focus Map Marker
  const handleCardClick = (centre: GroomingCentre) => {
    setSelectedCentre(centre);
    setFocusedCentreId(centre.id);
  };

  // Actions
  const handleOpenDirections = (centre: GroomingCentre) => {
    const lat = userLocation ? userLocation.latitude : 12.9716;
    const lng = userLocation ? userLocation.longitude : 77.5946;
    const url = getDirectionsUrl(lat, lng, centre.lat, centre.lng, centre.name);
    window.open(url, '_blank');
  };

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const handleVisitWebsite = (website: string) => {
    const url = website.startsWith('http') ? website : `https://${website}`;
    window.open(url, '_blank');
  };

  const handleBooking = (centre: GroomingCentre) => {
    if (centre.externalBookingUrl) {
      window.open(centre.externalBookingUrl, '_blank');
    } else if (onSelectCentre) {
      onSelectCentre(centre);
    }
  };

  // Filtered centres by search text
  const displayedCentres = centres.filter((c) => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.address.toLowerCase().includes(q) ||
      c.services.some((s) => s.toLowerCase().includes(q))
    );
  });

  return (
    <div className="min-h-screen relative bg-gradient-to-b from-[#070d1d] via-[#0d1b33] to-[#060b17] text-white">
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-10 right-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[140px]" />
      </div>

      <div className="relative z-10 pt-6 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {!showDetailView ? (
            <>
              {/* Header Bar */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <button
                    onClick={onBackToBooking}
                    className="flex items-center space-x-2 text-cyan-300 hover:text-cyan-100 mb-3 font-bold text-xs uppercase tracking-wider transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Grooming Services</span>
                  </button>

                  <div className="flex items-center space-x-3">
                    <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white glow-text-cyan flex items-center gap-3">
                      <span>🗺️ Real Nearby Grooming Centres</span>
                    </h1>
                  </div>
                  <p className="text-slate-300 text-sm mt-1 max-w-2xl">
                    Interactive Google Maps & Places search for certified pet groomers, styling salons, and spas for{' '}
                    <span className="text-cyan-300 font-extrabold">{animal?.name || 'your pet'}</span>.
                  </p>
                </div>

                {/* Location Quick-Action */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRequestLocation}
                    disabled={loading}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-xs shadow-[0_0_20px_rgba(6,182,212,0.3)] flex items-center space-x-2 transition-all hover:scale-105"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Navigation className="w-4 h-4" />
                    )}
                    <span>{userLocation ? 'Update My Geolocation' : 'Use My Geolocation'}</span>
                  </button>
                </div>
              </div>

              {/* Notice / Demo Status Alert */}
              {isDemoMode && (
                <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-amber-900/20 to-cyan-950/30 border border-amber-500/40 flex items-start justify-between gap-4 backdrop-blur-md shadow-lg">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
                      <AlertCircle className="w-5 h-5" />
                    </div>
                    <div className="text-xs space-y-1">
                      <p className="font-extrabold text-amber-300 text-sm">
                        📍 DEMO DATA MODE (Bengaluru Simulated Centres)
                      </p>
                      <p className="text-slate-300 leading-relaxed">
                        Displaying verified demo grooming salons in Bengaluru. To enable live global Places API searches for your exact city, add your{' '}
                        <code className="px-1.5 py-0.5 rounded bg-slate-900 text-amber-400 font-mono font-bold">VITE_GOOGLE_MAPS_API_KEY</code>{' '}
                        in your local environment.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Category Search & Filter Tabs */}
              <div className="glass-panel-dark rounded-2xl p-4 border border-cyan-500/30 shadow-xl mb-6 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  {/* Category Pills */}
                  <div className="flex flex-wrap gap-1.5 bg-[#081022] p-1.5 rounded-xl border border-cyan-500/20">
                    {[
                      { id: 'all', label: 'All Centres', icon: '✨' },
                      { id: 'groomer', label: 'Pet Groomers', icon: '✂️' },
                      { id: 'dog', label: 'Dog Grooming', icon: '🐕' },
                      { id: 'cat', label: 'Cat Grooming', icon: '🐱' },
                      { id: 'spa', label: 'Pet Spas & Salons', icon: '🛁' },
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setCategoryFilter(cat.id as CategoryFilter)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center space-x-1.5 ${
                          categoryFilter === cat.id
                            ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                        }`}
                      >
                        <span>{cat.icon}</span>
                        <span>{cat.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* View Mode Toggle */}
                  <div className="flex items-center space-x-1 bg-[#081022] p-1 rounded-xl border border-cyan-500/20">
                    <button
                      onClick={() => setViewMode('split')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center space-x-1 ${
                        viewMode === 'split'
                          ? 'bg-cyan-500/80 text-white'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span>Split</span>
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center space-x-1 ${
                        viewMode === 'list'
                          ? 'bg-cyan-500/80 text-white'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <List className="w-3.5 h-3.5" />
                      <span>List</span>
                    </button>
                    <button
                      onClick={() => setViewMode('map')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center space-x-1 ${
                        viewMode === 'map'
                          ? 'bg-cyan-500/80 text-white'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <MapIcon className="w-3.5 h-3.5" />
                      <span>Map</span>
                    </button>
                  </div>
                </div>

                {/* Search text and Sort Row */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-cyan-500/20">
                  <div className="relative flex-1 min-w-[200px] max-w-md">
                    <Search className="w-4 h-4 text-cyan-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Filter by name, address, or service..."
                      value={searchFilter}
                      onChange={(e) => setSearchFilter(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-[#091122] border border-cyan-500/30 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-semibold"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-slate-400 font-bold">Sort by:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => handleSortChange(e.target.value as SortBy)}
                      className="px-3 py-2 bg-[#091122] border border-cyan-500/30 rounded-xl text-xs text-white font-extrabold focus:outline-none focus:border-cyan-400 cursor-pointer"
                    >
                      <option value="match">🏆 Best Pet Match</option>
                      <option value="distance">📍 Distance (Nearest)</option>
                      <option value="rating">⭐ Highest Rated</option>
                      <option value="price">💰 Lowest Price</option>
                    </select>

                    <button
                      onClick={() => fetchGroomingCentres(userLocation, categoryFilter)}
                      className="p-2 rounded-xl bg-[#091122] border border-cyan-500/30 text-cyan-300 hover:text-white hover:bg-cyan-950 transition-colors"
                      title="Refresh Nearby Search"
                    >
                      <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Main Content Layout */}
              {loading && centres.length === 0 ? (
                <div className="py-24 text-center space-y-4">
                  <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mx-auto" />
                  <p className="text-lg font-bold text-white">Searching nearby pet groomers & salons...</p>
                  <p className="text-xs text-slate-400">Querying location and Google Places database</p>
                </div>
              ) : (
                <div className={`grid gap-6 ${viewMode === 'split' ? 'lg:grid-cols-12' : 'grid-cols-1'}`}>
                  {/* Map Column (if split or map view) */}
                  {(viewMode === 'split' || viewMode === 'map') && (
                    <div className={viewMode === 'split' ? 'lg:col-span-6 xl:col-span-7' : 'w-full'}>
                      <div className="sticky top-20">
                        <GoogleGroomingMap
                          userLocation={userLocation}
                          centres={displayedCentres}
                          selectedCentre={selectedCentre}
                          focusedCentreId={focusedCentreId}
                          onSelectCentre={handleMarkerSelect}
                          className="h-[520px] lg:h-[680px]"
                          isDemoMode={isDemoMode}
                        />
                      </div>
                    </div>
                  )}

                  {/* List Column (if split or list view) */}
                  {(viewMode === 'split' || viewMode === 'list') && (
                    <div
                      className={`${
                        viewMode === 'split' ? 'lg:col-span-6 xl:col-span-5' : 'w-full'
                      } space-y-4 max-h-[720px] overflow-y-auto pr-1`}
                    >
                      <div className="flex items-center justify-between pb-2">
                        <span className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
                          Found {displayedCentres.length} Grooming Centres
                        </span>
                        {isDemoMode && (
                          <span className="text-[10px] font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30">
                            DEMO DATA
                          </span>
                        )}
                      </div>

                      {displayedCentres.length === 0 ? (
                        <div className="py-16 text-center glass-panel-dark rounded-2xl border border-cyan-500/20 p-8 space-y-3">
                          <MapPinOff className="w-12 h-12 text-slate-500 mx-auto" />
                          <p className="text-base font-bold text-slate-300">No grooming centres found</p>
                          <p className="text-xs text-slate-400">
                            Try adjusting your filters, searching a different keyword, or expanding your radius.
                          </p>
                        </div>
                      ) : (
                        displayedCentres.map((centre, idx) => {
                          const isSelected = selectedCentre?.id === centre.id || focusedCentreId === centre.id;

                          return (
                            <div
                              key={centre.id}
                              ref={(el) => {
                                if (el) cardRefs.current.set(centre.id, el);
                                else cardRefs.current.delete(centre.id);
                              }}
                              onClick={() => handleCardClick(centre)}
                              className={`group glass-panel-dark rounded-2xl p-4 border transition-all duration-300 cursor-pointer relative overflow-hidden ${
                                isSelected
                                  ? 'border-amber-400 bg-[#0d1f3d] shadow-[0_0_25px_rgba(245,158,11,0.25)] scale-[1.01]'
                                  : 'border-cyan-500/30 hover:border-cyan-400/60 hover:bg-[#0c1830]'
                              }`}
                            >
                              {/* Demo / Verified Badge */}
                              <div className="flex items-center justify-between gap-2 mb-2">
                                {centre.isDemo ? (
                                  <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-amber-950/90 text-amber-300 border border-amber-500/40 uppercase tracking-wider">
                                    [DEMO DATA - Bengaluru]
                                  </span>
                                ) : (
                                  <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-cyan-950/90 text-cyan-300 border border-cyan-500/40 uppercase tracking-wider flex items-center space-x-1">
                                    <ShieldCheck className="w-2.5 h-2.5 text-cyan-400" />
                                    <span>Google Places Verified</span>
                                  </span>
                                )}

                                {idx === 0 && sortBy === 'match' && (
                                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40 flex items-center space-x-1">
                                    <Trophy className="w-3 h-3 text-emerald-400" />
                                    <span>Top Match</span>
                                  </span>
                                )}
                              </div>

                              <div className="flex gap-4">
                                {/* Thumbnail */}
                                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-slate-900 border border-cyan-500/20 shrink-0 relative">
                                  <img
                                    src={centre.image}
                                    alt={centre.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                  />
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0 space-y-1">
                                  <div className="flex items-start justify-between gap-2">
                                    <h3 className="font-extrabold text-base text-white group-hover:text-cyan-300 transition-colors truncate">
                                      {centre.name}
                                    </h3>
                                  </div>

                                  <div className="flex items-center space-x-2 text-xs">
                                    <div className="flex items-center space-x-1 text-amber-400 font-extrabold">
                                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                      <span>{centre.rating}</span>
                                      <span className="text-slate-400 font-normal">({centre.reviews})</span>
                                    </div>
                                    {centre.distance !== undefined && (
                                      <div className="text-cyan-300 font-bold">
                                        • 📍 {formatDistance(centre.distance)}
                                      </div>
                                    )}
                                  </div>

                                  <div className="flex items-center space-x-1 text-slate-300 text-xs truncate">
                                    <MapPin className="w-3 h-3 text-cyan-400 shrink-0" />
                                    <span className="truncate">{centre.address}</span>
                                  </div>

                                  {centre.openingHours && (
                                    <div className="flex items-center space-x-1 text-slate-400 text-[11px] truncate">
                                      <Clock className="w-3 h-3 text-cyan-400 shrink-0" />
                                      <span className="truncate">{centre.openingHours}</span>
                                    </div>
                                  )}

                                  {/* Services preview */}
                                  <div className="flex flex-wrap gap-1 pt-1">
                                    {centre.services.slice(0, 3).map((s, i) => (
                                      <span
                                        key={i}
                                        className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-950/70 text-cyan-300 border border-cyan-500/20 truncate"
                                      >
                                        {s}
                                      </span>
                                    ))}
                                    {centre.services.length > 3 && (
                                      <span className="text-[10px] text-slate-400 font-semibold self-center">
                                        +{centre.services.length - 3}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Action Buttons */}
                              <div className="mt-3 pt-3 border-t border-cyan-500/20 grid grid-cols-4 gap-1.5 text-xs font-bold">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenDirections(centre);
                                  }}
                                  className="py-1.5 px-2 rounded-lg bg-blue-600/80 hover:bg-blue-600 text-white flex items-center justify-center space-x-1 transition-all"
                                  title="Get driving directions"
                                >
                                  <Navigation className="w-3 h-3" />
                                  <span className="hidden sm:inline">Directions</span>
                                </button>

                                {centre.phone ? (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleCall(centre.phone!);
                                    }}
                                    className="py-1.5 px-2 rounded-lg bg-emerald-600/80 hover:bg-emerald-600 text-white flex items-center justify-center space-x-1 transition-all"
                                    title="Call salon"
                                  >
                                    <Phone className="w-3 h-3" />
                                    <span className="hidden sm:inline">Call</span>
                                  </button>
                                ) : (
                                  <div className="py-1.5 px-2 rounded-lg bg-slate-800 text-slate-500 text-center flex items-center justify-center">
                                    <Phone className="w-3 h-3 opacity-40" />
                                  </div>
                                )}

                                {centre.website ? (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleVisitWebsite(centre.website!);
                                    }}
                                    className="py-1.5 px-2 rounded-lg bg-purple-600/80 hover:bg-purple-600 text-white flex items-center justify-center space-x-1 transition-all"
                                    title="Visit official website"
                                  >
                                    <Globe className="w-3 h-3" />
                                    <span className="hidden sm:inline">Website</span>
                                  </button>
                                ) : (
                                  <div className="py-1.5 px-2 rounded-lg bg-slate-800 text-slate-500 text-center flex items-center justify-center">
                                    <Globe className="w-3 h-3 opacity-40" />
                                  </div>
                                )}

                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedCentre(centre);
                                    setShowDetailView(true);
                                  }}
                                  className="py-1.5 px-2 rounded-lg bg-cyan-600/80 hover:bg-cyan-600 text-white flex items-center justify-center space-x-1 transition-all"
                                >
                                  <span>Details</span>
                                  <ChevronRight className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            /* Full Centre Detail View */
            selectedCentre && (
              <div className="space-y-6 animate-fadeIn">
                <button
                  onClick={() => setShowDetailView(false)}
                  className="flex items-center space-x-2 text-cyan-300 hover:text-cyan-100 font-bold text-xs uppercase tracking-wider transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Map & Salon Directory</span>
                </button>

                <div className="grid md:grid-cols-3 gap-8">
                  {/* Left Column: Image & Details */}
                  <div className="md:col-span-2 space-y-6">
                    <div className="h-80 rounded-3xl overflow-hidden border border-cyan-500/30 relative">
                      <img
                        src={selectedCentre.image}
                        alt={selectedCentre.name}
                        className="w-full h-full object-cover"
                      />
                      {selectedCentre.isDemo ? (
                        <div className="absolute top-4 left-4 bg-amber-500 text-black font-extrabold text-xs px-3 py-1 rounded-full shadow-lg">
                          [DEMO DATA - Bengaluru]
                        </div>
                      ) : (
                        <div className="absolute top-4 left-4 bg-cyan-500 text-black font-extrabold text-xs px-3 py-1 rounded-full shadow-lg">
                          ✓ Google Places Verified
                        </div>
                      )}
                    </div>

                    <div>
                      <h1 className="text-3xl font-extrabold text-white mb-2">{selectedCentre.name}</h1>
                      <div className="flex flex-wrap items-center gap-4 text-sm font-bold">
                        <div className="flex items-center space-x-1.5 text-amber-400">
                          <Star className="w-5 h-5 fill-amber-400" />
                          <span className="text-lg text-white">{selectedCentre.rating}</span>
                          <span className="text-slate-400">({selectedCentre.reviews} user reviews)</span>
                        </div>
                        {selectedCentre.distance !== undefined && (
                          <div className="text-cyan-300">📍 {formatDistance(selectedCentre.distance)} from you</div>
                        )}
                        {selectedCentre.price && (
                          <div className="text-emerald-400">🏷️ {selectedCentre.price}</div>
                        )}
                      </div>
                    </div>

                    {/* Contact & Hours Info Grid */}
                    <div className="glass-panel-dark rounded-2xl p-5 border border-cyan-500/20 space-y-3 text-sm text-slate-300">
                      <div className="flex items-center space-x-3">
                        <MapPin className="w-5 h-5 text-cyan-400 shrink-0" />
                        <span>{selectedCentre.address}</span>
                      </div>
                      {selectedCentre.openingHours && (
                        <div className="flex items-center space-x-3">
                          <Clock className="w-5 h-5 text-cyan-400 shrink-0" />
                          <span>{selectedCentre.openingHours}</span>
                        </div>
                      )}
                      {selectedCentre.phone && (
                        <div className="flex items-center space-x-3">
                          <Phone className="w-5 h-5 text-cyan-400 shrink-0" />
                          <span>{selectedCentre.phone}</span>
                        </div>
                      )}
                      {selectedCentre.website && (
                        <div className="flex items-center space-x-3">
                          <Globe className="w-5 h-5 text-cyan-400 shrink-0" />
                          <a
                            href={selectedCentre.website.startsWith('http') ? selectedCentre.website : `https://${selectedCentre.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-cyan-300 underline flex items-center gap-1"
                          >
                            <span>{selectedCentre.website}</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Services */}
                    <div>
                      <h3 className="text-lg font-extrabold text-white mb-3">Available Grooming Services</h3>
                      <div className="grid sm:grid-cols-2 gap-2.5">
                        {selectedCentre.services.map((service, i) => (
                          <div
                            key={i}
                            className="flex items-center space-x-2.5 p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-xs font-extrabold text-cyan-200"
                          >
                            <Zap className="w-4 h-4 text-cyan-400 shrink-0" />
                            <span>{service}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Actions & Compatibility */}
                  <div className="space-y-5">
                    {/* Primary Action Card */}
                    <div className="glass-panel-dark rounded-3xl p-6 border border-cyan-500/40 shadow-2xl space-y-3">
                      <h3 className="font-extrabold text-white text-base">Quick Actions</h3>

                      <button
                        onClick={() => handleOpenDirections(selectedCentre)}
                        className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-extrabold text-xs shadow-lg flex items-center justify-center space-x-2 transition-all hover:scale-105"
                      >
                        <Navigation className="w-4 h-4" />
                        <span>Get Live Directions</span>
                      </button>

                      {selectedCentre.phone && (
                        <button
                          onClick={() => handleCall(selectedCentre.phone!)}
                          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-extrabold text-xs shadow-lg flex items-center justify-center space-x-2 transition-all hover:scale-105"
                        >
                          <Phone className="w-4 h-4" />
                          <span>Call {selectedCentre.phone}</span>
                        </button>
                      )}

                      {selectedCentre.website && (
                        <button
                          onClick={() => handleVisitWebsite(selectedCentre.website!)}
                          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-extrabold text-xs shadow-lg flex items-center justify-center space-x-2 transition-all hover:scale-105"
                        >
                          <Globe className="w-4 h-4" />
                          <span>Visit Official Website</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleBooking(selectedCentre)}
                        className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-xs shadow-lg shadow-amber-500/30 uppercase tracking-wider transition-all hover:scale-105"
                      >
                        {selectedCentre.externalBookingUrl
                          ? '📅 Book on Salon Website'
                          : '📅 Book Salon Appointment'}
                      </button>
                    </div>

                    {/* Pet Match Compatibility */}
                    {animal && (
                      <div className="glass-panel-dark rounded-3xl p-6 border border-emerald-500/40 bg-gradient-to-br from-emerald-950/40 to-cyan-950/40 space-y-3">
                        <div className="flex items-center space-x-2 text-xs font-extrabold text-emerald-300 uppercase tracking-wider">
                          <Sparkles className="w-4 h-4" />
                          <span>Pet Compatibility Score</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="text-3xl font-extrabold text-white">
                            {selectedCentre.matchScore || 85}%
                          </div>
                          <div className="text-xs text-emerald-200">
                            Tailored for <strong className="text-white">{animal.name}</strong> ({animal.breed})
                          </div>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          This facility supports {selectedCentre.petTypes.join(', ')} with specialized care protocols.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};
