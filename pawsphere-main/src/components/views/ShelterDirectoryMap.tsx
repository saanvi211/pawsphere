import React, { useState, useEffect, useRef } from 'react';
import { Shelter } from '../../types/animal';
import { getShelters } from '../../lib/api/shelters';
import { MapPin, Phone, Clock, ShieldCheck, Navigation, Search, Loader2, LocateFixed } from 'lucide-react';

// ─── Haversine distance (km) ────────────────────────────────────────────────
function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export const ShelterDirectoryMap: React.FC = () => {
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState<string | null>(null);
  const [selectedShelter, setSelectedShelter] = useState<Shelter | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<unknown>(null);

  // Fetch shelters on mount
  useEffect(() => {
    getShelters().then(data => {
      setShelters(data);
      setLoading(false);
    });
  }, []);

  // Init Leaflet map after shelters load
  useEffect(() => {
    if (loading || !mapRef.current || leafletMapRef.current) return;

    import('leaflet').then(L => {
      // Fix default icon paths
      delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const map = L.map(mapRef.current!).setView([12.9716, 77.5946], 12);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(map);

      shelters.forEach(s => {
        const marker = L.marker([s.lat, s.lng])
          .addTo(map)
          .bindPopup(
            `<div style="font-size:12px;font-weight:700">${s.name}</div>
             <div style="font-size:11px;color:#666">${s.address}, ${s.city}</div>
             <div style="font-size:11px;color:#d97706;margin-top:2px">${s.phone}</div>`
          );
        marker.on('click', () => setSelectedShelter(s));
      });

      leafletMapRef.current = map;
    });

    return () => {
      if (leafletMapRef.current) {
        (leafletMapRef.current as { remove: () => void }).remove();
        leafletMapRef.current = null;
      }
    };
  }, [loading, shelters]);

  // Pan map to user location when it's set
  useEffect(() => {
    if (!userLocation || !leafletMapRef.current) return;
    import('leaflet').then(L => {
      const map = leafletMapRef.current as ReturnType<typeof L.map>;
      map.setView([userLocation.lat, userLocation.lng], 13);

      // Blue dot for user
      L.circleMarker([userLocation.lat, userLocation.lng], {
        radius: 10,
        fillColor: '#3b82f6',
        color: '#1d4ed8',
        weight: 2,
        fillOpacity: 0.85,
      })
        .addTo(map)
        .bindPopup('<strong>You are here</strong>');
    });
  }, [userLocation]);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocError('Geolocation is not supported by your browser.');
      return;
    }
    setLocating(true);
    setLocError(null);
    navigator.geolocation.getCurrentPosition(
      pos => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      () => {
        setLocError('Could not get your location. Please allow location access.');
        setLocating(false);
      },
      { timeout: 10000 }
    );
  };

  const filteredShelters = shelters
    .filter(s => {
      if (selectedType !== 'all' && s.type !== selectedType) return false;
      if (
        searchQuery &&
        !s.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !s.city.toLowerCase().includes(searchQuery.toLowerCase())
      )
        return false;
      return true;
    })
    .sort((a, b) => {
      // Sort by distance if user location is known
      if (!userLocation) return 0;
      const distA = haversineKm(userLocation.lat, userLocation.lng, a.lat, a.lng);
      const distB = haversineKm(userLocation.lat, userLocation.lng, b.lat, b.lng);
      return distA - distB;
    });

  return (
    <div className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

      {/* Header */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-extrabold uppercase tracking-wider inline-flex items-center space-x-1">
            <MapPin className="w-3.5 h-3.5 text-amber-600" />
            <span>Shelter & Breeder Locator</span>
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Verified Shelters & <span className="text-amber-600">Ethical Breeders</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl">
            Find adoption centers and breeders near you. Enable location for distance-based sorting.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          {/* Search */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search by city or name..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-2xl py-2.5 pl-9 pr-4 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          </div>

          {/* Location Button */}
          <button
            onClick={requestLocation}
            disabled={locating}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold shadow-md transition-all whitespace-nowrap disabled:opacity-60"
          >
            {locating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <LocateFixed className="w-4 h-4" />
            )}
            <span>{userLocation ? 'Refresh Location' : 'Use My Location'}</span>
          </button>
        </div>
      </div>

      {/* Location error */}
      {locError && (
        <div className="text-xs text-red-600 font-semibold bg-red-50 border border-red-200 rounded-xl px-4 py-2">
          {locError}
        </div>
      )}

      {/* Location status */}
      {userLocation && (
        <div className="text-xs text-blue-700 font-semibold bg-blue-50 border border-blue-200 rounded-xl px-4 py-2 flex items-center space-x-2">
          <LocateFixed className="w-4 h-4" />
          <span>Showing shelters sorted by distance from your location.</span>
        </div>
      )}

      {/* Leaflet Map */}
      <div
        ref={mapRef}
        className="w-full h-72 rounded-3xl overflow-hidden border border-slate-200 shadow-lg z-0"
        style={{ minHeight: 280 }}
      />

      {/* Type Filter */}
      <div className="flex items-center space-x-2 flex-wrap gap-2">
        {['all', 'Verified Adoption Shelter', 'Licensed Ethical Breeder'].map(t => (
          <button
            key={t}
            onClick={() => setSelectedType(t)}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all border ${
              selectedType === t
                ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                : 'bg-white text-slate-700 border-slate-200 hover:border-amber-300'
            }`}
          >
            {t === 'all' ? 'All Types' : t}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        </div>
      )}

      {/* Shelter Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredShelters.map(shelter => {
          const distKm = userLocation
            ? haversineKm(userLocation.lat, userLocation.lng, shelter.lat, shelter.lng)
            : null;

          return (
            <div
              key={shelter.id}
              onClick={() => setSelectedShelter(shelter)}
              className={`glass-card glass-card-hover rounded-3xl p-6 border shadow-lg space-y-4 flex flex-col justify-between cursor-pointer transition-all ${
                selectedShelter?.id === shelter.id
                  ? 'border-amber-400 ring-2 ring-amber-400/30'
                  : 'border-white'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200 uppercase">
                      {shelter.type}
                    </span>
                    <h3 className="font-extrabold text-lg text-slate-900 mt-1.5">{shelter.name}</h3>
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                    {distKm !== null && (
                      <span className="text-[10px] font-extrabold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-lg whitespace-nowrap">
                        {distKm < 1 ? `${Math.round(distKm * 1000)}m` : `${distKm.toFixed(1)} km`}
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                  <div className="flex items-start space-x-2">
                    <MapPin className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>{shelter.address}, {shelter.city}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-amber-600 shrink-0" />
                    <a
                      href={`tel:${shelter.phone}`}
                      onClick={e => e.stopPropagation()}
                      className="font-bold text-slate-900 hover:text-amber-600"
                    >
                      {shelter.phone}
                    </a>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>{shelter.openingHours}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-extrabold text-emerald-700">
                  {shelter.availablePetsCount} Pets Ready
                </span>
                <a
                  href={`https://maps.google.com/?q=${shelter.lat},${shelter.lng}`}
                  target="_blank"
                  rel="noreferrer"
                  onClick={e => e.stopPropagation()}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs shadow-md shadow-amber-500/30 flex items-center space-x-1"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Directions</span>
                </a>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
