import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Sparkles, 
  Heart, 
  QrCode, 
  Stethoscope, 
  MapPin, 
  User, 
  LogOut, 
  PawPrint,
  Menu,
  X,
  Dog,
  Cat,
  Bird,
  Fish,
  ShoppingBag
} from 'lucide-react';
import { UserProfile, Animal } from '../../types/animal';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  user: UserProfile | null | undefined;
  isLoggedIn: boolean;
  onLogout: () => void;
  animals: Animal[];
  activePetId: string;
  setActivePetId: (id: string) => void;
  openAuthModal: (mode: 'login' | 'signup') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  user,
  isLoggedIn,
  onLogout,
  animals,
  activePetId,
  setActivePetId,
  openAuthModal
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const activePet = animals.find(a => a.id === activePetId) || animals[0];

  const navItems = isLoggedIn ? [
    { id: 'buy-pets', label: 'Adopt / Matchmaking', icon: ShoppingBag },
    { id: 'dashboard', label: 'My Dashboard', icon: Heart },
    { id: 'digital-twin', label: '3D Digital Twin', icon: PawPrint },
    { id: 'passport', label: 'Digital Passport', icon: QrCode },
    { id: 'ai-triage', label: 'AI Health Helper', icon: Stethoscope }
  ] : [];

  const getSpeciesIcon = (species: string) => {
    switch (species) {
      case 'cat': return <Cat className="w-4 h-4 text-brand-solidOrange" />;
      case 'bird': return <Bird className="w-4 h-4 text-brand-solidBlue" />;
      case 'fish': return <Fish className="w-4 h-4 text-brand-solidBlue" />;
      case 'reptile': return <Sparkles className="w-4 h-4 text-brand-solidGreen" />;
      default: return <Dog className="w-4 h-4 text-brand-solidOrange" />;
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b-2 border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentTab(isLoggedIn ? 'dashboard' : 'landing')}>
            <div className="w-10 h-10 rounded-xl bg-brand-solidBlue text-white flex items-center justify-center shadow-md">
              <PawPrint className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-slate-900">
                PAWSPHERE
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-lightOrange text-brand-solidOrange border border-brand-solidOrange">
                3D Pet Care Hub
              </span>
            </div>
          </div>

          {/* Desktop Nav Items */}
          {isLoggedIn && (
            <nav className="hidden lg:flex items-center space-x-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentTab(item.id)}
                    className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all border-2 ${
                      active
                        ? 'bg-brand-solidBlue text-white border-brand-solidBlue shadow-sm'
                        : 'text-slate-700 border-transparent hover:text-brand-solidBlue hover:bg-brand-lightBlue hover:border-brand-solidBlue'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          )}

          {/* User Controls */}
          <div className="flex items-center space-x-2 sm:space-x-3">

            {isLoggedIn && ['dashboard', 'digital-twin', 'passport'].includes(currentTab) && activePet && (
              <div className="relative">
                <select
                  value={activePetId}
                  onChange={(e) => setActivePetId(e.target.value)}
                  className="appearance-none bg-white border-2 border-brand-solidBlue text-slate-800 text-xs font-extrabold pl-8 pr-6 py-2 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-solidBlue cursor-pointer"
                >
                  {animals.map((pet) => (
                    <option key={pet.id} value={pet.id}>
                      {pet.name} ({pet.breed})
                    </option>
                  ))}
                </select>
                <div className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                  {getSpeciesIcon(activePet?.species || 'dog')}
                </div>
              </div>
            )}

            {isLoggedIn && (
              <button
                onClick={() => setCurrentTab('emergency')}
                className="flex items-center space-x-1 px-3 py-2 rounded-xl text-xs font-extrabold bg-red-600 hover:bg-red-700 text-white shadow-md transition-transform hover:scale-105 border-2 border-red-700"
              >
                <ShieldAlert className="w-4 h-4 animate-bounce" />
                <span className="hidden sm:inline">24/7 ER Vet</span>
              </button>
            )}

            {isLoggedIn ? (
              <div className="flex items-center space-x-2">
                <div className="hidden sm:flex items-center space-x-2 bg-slate-50 px-2.5 py-1.5 rounded-xl border-2 border-slate-200 shadow-sm">
                  <img src={user?.avatarUrl} alt={user?.name} className="w-5 h-5 rounded-full object-cover border" />
                  <span className="text-xs font-extrabold text-slate-800">{user?.name?.split(' ')[0]}</span>
                </div>
                <button
                  onClick={onLogout}
                  className="p-2 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 border-2 border-slate-200"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={() => openAuthModal('login')}
                  className="px-3.5 py-2 rounded-xl text-xs font-extrabold text-slate-800 hover:bg-brand-lightBlue border-2 border-slate-200 transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => openAuthModal('signup')}
                  className="px-4 py-2 rounded-xl text-xs font-extrabold bg-brand-solidOrange text-white shadow-md border-2 border-brand-solidOrange hover:bg-opacity-90 transition-all"
                >
                  Register
                </button>
              </div>
            )}

            {/* Mobile Menu */}
            {isLoggedIn && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 border-2 border-slate-200"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            )}

          </div>

        </div>
      </div>

      {/* Mobile Dropdown */}
      {mobileMenuOpen && isLoggedIn && (
        <div className="lg:hidden border-t-2 border-slate-200 bg-white px-4 pt-3 pb-4 space-y-1 shadow-lg">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-extrabold transition-colors border-2 ${
                  active 
                    ? 'bg-brand-solidBlue text-white border-brand-solidBlue' 
                    : 'text-slate-800 border-transparent hover:bg-slate-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
