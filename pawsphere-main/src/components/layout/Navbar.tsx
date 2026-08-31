import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Sparkles, 
  Heart, 
  QrCode, 
  Stethoscope, 
  User, 
  LogOut, 
  PawPrint,
  Dog,
  Cat,
  Bird,
  Fish,
  ShoppingBag,
  Utensils,
  Store,
  Users,
  Scissors,
  Home,
  Layers,
  Info,
  Moon,
  Sun,
  Menu,
  X,
  Globe
} from 'lucide-react';
import { UserProfile, Animal } from '../../types/animal';
import { useTheme } from '../../context/ThemeContext';

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
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeLandingNav, setActiveLandingNav] = useState('home');
  const activePet = animals.find(a => a.id === activePetId) || animals[0];

  const loggedInNavItems = [
    { id: 'dashboard', label: 'My Dashboard', icon: Heart },
    { id: 'digital-twin', label: '3D Digital Twin', icon: PawPrint },
    { id: 'grooming', label: 'Grooming Salon', icon: Scissors },
    { id: 'passport', label: 'Digital Passport', icon: QrCode },
    { id: 'ai-triage', label: 'AI Health Helper', icon: Stethoscope },
    { id: 'nutrition', label: 'Nutrition Center', icon: Utensils },
    { id: 'pet-shopping', label: 'Pet Shopping', icon: Store },
    { id: 'community', label: 'Community', icon: Users },
    { id: 'buy-pets', label: 'Adopt / Matchmaking', icon: ShoppingBag }
  ];

  const publicNavItems = [
    { id: 'home', label: 'Home', icon: Home, href: '#home' },
    { id: 'services', label: 'Services', icon: Layers, href: '#services' },
    { id: 'pet-hub', label: 'Pet Hub', icon: Globe, href: '#pet-hub' },
    { id: 'community', label: 'Community', icon: Users, href: '#community' },
    { id: 'about', label: 'About Us', icon: Info, href: '#about' }
  ];

  const getSpeciesIcon = (species: string) => {
    switch (species) {
      case 'cat': return <Cat className="w-4 h-4 text-amber-400" />;
      case 'bird': return <Bird className="w-4 h-4 text-cyan-400" />;
      case 'fish': return <Fish className="w-4 h-4 text-blue-400" />;
      case 'reptile': return <Sparkles className="w-4 h-4 text-emerald-400" />;
      default: return <Dog className="w-4 h-4 text-cyan-400" />;
    }
  };

  const handlePublicNavClick = (navId: string, href: string) => {
    setActiveLandingNav(navId);
    setMobileMenuOpen(false);
    if (currentTab !== 'landing') {
      setCurrentTab('landing');
    }
    const elem = document.querySelector(href);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#050814]/85 border-b border-purple-500/15 backdrop-blur-xl text-white shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* LEFT: LOGO WITH GLOWING CIRCULAR PAW ICON & SUBTITLE */}
          <div 
            className="flex shrink-0 items-center space-x-3 cursor-pointer group" 
            onClick={() => {
              if (isLoggedIn) {
                setCurrentTab('dashboard');
              } else {
                setCurrentTab('landing');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
          >
            {/* Glowing circular paw icon */}
            <div className="relative w-11 h-11 rounded-full p-[2px] bg-gradient-to-tr from-purple-600 via-indigo-500 to-cyan-400 shadow-[0_0_20px_rgba(168,85,247,0.45)] group-hover:shadow-[0_0_28px_rgba(6,182,212,0.6)] transition-all duration-300 group-hover:scale-105">
              <div className="w-full h-full rounded-full bg-[#070b1a] flex items-center justify-center">
                <PawPrint className="w-5 h-5 text-cyan-400 group-hover:text-white transition-colors" />
              </div>
            </div>
            
            {/* Logo Text & Subtitle */}
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-wider text-white bg-gradient-to-r from-white via-slate-100 to-cyan-200 bg-clip-text text-transparent group-hover:text-cyan-300 transition-colors">
                PAWSPHERE
              </span>
              <span className="text-[10px] text-slate-400 font-mono tracking-widest uppercase">
                Care. Connect. Cherish.
              </span>
            </div>
          </div>

          {/* CENTER NAVIGATION (PUBLIC OR LOGGED-IN) */}
          {!isLoggedIn ? (
            <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
              {publicNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeLandingNav === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handlePublicNavClick(item.id, item.href)}
                    className={`relative flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                      isActive 
                        ? 'text-white' 
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-purple-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>

                    {/* Active Purple Neon Underline */}
                    {isActive && (
                      <span className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-400 shadow-[0_0_10px_#a855f7]" />
                    )}
                  </button>
                );
              })}
            </nav>
          ) : (
            /* Logged In Scrollable Navigation Bar */
            <div className="nav-scroll-container min-w-0 flex-1 ml-4 hidden md:block">
              <div className="nav-scroll-items flex items-center space-x-1.5 w-max min-w-max pr-3">
                <nav className="flex items-center space-x-1.5">
                  {loggedInNavItems.map((item) => {
                    const Icon = item.icon;
                    const active = currentTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          if (item.id === 'pet-shopping') window.history.pushState({}, '', '/pet-shopping');
                          setCurrentTab(item.id);
                        }}
                        className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                          active
                            ? 'bg-purple-900/60 text-white border-purple-400/60 shadow-[0_0_15px_rgba(168,85,247,0.35)]'
                            : 'text-slate-300 border-transparent hover:text-white hover:bg-slate-800/60 hover:border-slate-700'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>
          )}

          {/* RIGHT CONTROLS */}
          <div className="flex items-center space-x-3">
            
            {/* Dark / Light Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              className="p-2.5 rounded-xl bg-[#0d142c]/80 hover:bg-[#152044] border border-purple-500/20 hover:border-cyan-400/50 text-purple-300 hover:text-cyan-200 transition-all shadow-[0_0_10px_rgba(0,0,0,0.4)] cursor-pointer relative overflow-hidden group"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-300 fill-amber-300/30 transition-transform duration-300 rotate-0 group-hover:rotate-45" />
              ) : (
                <Moon className="w-4 h-4 text-purple-600 fill-purple-600/30 transition-transform duration-300 -rotate-12 group-hover:rotate-0" />
              )}
            </button>

            {!isLoggedIn ? (
              <div className="hidden sm:flex items-center space-x-2.5">
                {/* Login Button */}
                <button
                  onClick={() => openAuthModal('login')}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-200 hover:text-white bg-[#0c1226]/80 hover:bg-[#141d3b] border border-purple-500/30 hover:border-purple-400/60 transition-all cursor-pointer shadow-sm"
                >
                  Login
                </button>

                {/* Register Button */}
                <button
                  onClick={() => openAuthModal('signup')}
                  className="px-4.5 py-2 rounded-xl text-xs font-extrabold text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_25px_rgba(6,182,212,0.5)] border border-purple-300/40 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  Register
                </button>
              </div>
            ) : (
              /* User Controls when Logged in */
              <div className="flex items-center space-x-2 sm:space-x-3">
                {/* Dynamic Active Pet Dropdown */}
                {activePet && animals.length > 0 && (
                  <div className="relative hidden sm:block">
                    <select
                      value={activePetId}
                      onChange={(e) => setActivePetId(e.target.value)}
                      className="appearance-none bg-[#0d172e] border border-purple-500/30 text-cyan-200 text-xs font-bold pl-8 pr-7 py-2 rounded-xl shadow-sm focus:outline-none focus:border-cyan-400 cursor-pointer"
                    >
                      {animals.map((pet) => (
                        <option key={pet.id} value={pet.id} className="bg-[#091122] text-white">
                          {pet.name} ({pet.breed})
                        </option>
                      ))}
                    </select>
                    <div className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                      {getSpeciesIcon(activePet?.species || 'dog')}
                    </div>
                  </div>
                )}

                {/* 24/7 ER Vet */}
                <button
                  onClick={() => setCurrentTab('emergency')}
                  className="flex items-center space-x-1 px-3 py-2 rounded-xl text-xs font-extrabold bg-red-600/85 hover:bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)] transition-all hover:scale-105 border border-red-400"
                >
                  <ShieldAlert className="w-3.5 h-3.5 animate-pulse text-red-200" />
                  <span className="hidden sm:inline">24/7 ER Vet</span>
                </button>

                {/* Profile Badge & Logout */}
                <div className="flex items-center space-x-1.5">
                  <div className="hidden sm:flex items-center bg-[#0d172e] px-2.5 py-1.5 rounded-xl border border-purple-500/30">
                    <span className="text-xs font-bold text-slate-200">{user?.name || 'User'}</span>
                  </div>
                  <button
                    onClick={onLogout}
                    className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-950/40 border border-slate-800"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>

        </div>
      </div>

      {/* MOBILE DRAWER */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#070b1a]/95 border-b border-purple-500/20 backdrop-blur-2xl px-4 pt-3 pb-6 space-y-3 animate-fadeIn">
          {!isLoggedIn ? (
            <div className="space-y-1">
              {publicNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeLandingNav === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handlePublicNavClick(item.id, item.href)}
                    className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-bold ${
                      isActive ? 'bg-purple-950/60 text-purple-300 border border-purple-500/30' : 'text-slate-300 hover:bg-slate-900'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-cyan-400" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
              
              <div className="pt-4 flex flex-col gap-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuthModal('login');
                  }}
                  className="w-full py-2.5 rounded-xl text-xs font-bold text-slate-200 bg-slate-900 border border-slate-700"
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuthModal('signup');
                  }}
                  className="w-full py-2.5 rounded-xl text-xs font-extrabold text-white bg-gradient-to-r from-purple-600 to-cyan-500 shadow-md"
                >
                  Register
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              {loggedInNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCurrentTab(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-300 hover:bg-slate-900"
                  >
                    <Icon className="w-4 h-4 text-cyan-400" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </header>
  );
};
