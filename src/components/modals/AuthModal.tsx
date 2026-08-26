import React, { useState, useEffect } from 'react';
import { UserProfile, UserRole, SpeciesType } from '../../types/animal';
import { X, LogIn, UserPlus, ShieldCheck, Lock, Mail, User as UserIcon, Eye, EyeOff, PawPrint, Sparkles, ArrowRight } from 'lucide-react';
import { saveStorageUser } from '../../db/storage';
import { signUp, logIn, sendPasswordResetEmail } from '../../lib/api/auth';
import { isSupabaseConfigured } from '../../lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
  user?: UserProfile | null;
  onLoginSuccess: (user: UserProfile) => void;
}

const COUNTRY_CODES = [
  { code: '+1',   flag: '🇺🇸', name: 'US/CA' },
  { code: '+44',  flag: '🇬🇧', name: 'UK' },
  { code: '+91',  flag: '🇮🇳', name: 'India' },
  { code: '+61',  flag: '🇦🇺', name: 'Australia' },
  { code: '+49',  flag: '🇩🇪', name: 'Germany' },
  { code: '+33',  flag: '🇫🇷', name: 'France' },
  { code: '+81',  flag: '🇯🇵', name: 'Japan' },
  { code: '+55',  flag: '🇧🇷', name: 'Brazil' },
  { code: '+971', flag: '🇦🇪', name: 'UAE' },
  { code: '+65',  flag: '🇸🇬', name: 'Singapore' },
  { code: '+82',  flag: '🇰🇷', name: 'Korea' },
  { code: '+86',  flag: '🇨🇳', name: 'China' },
  { code: '+52',  flag: '🇲🇽', name: 'Mexico' },
  { code: '+27',  flag: '🇿🇦', name: 'South Africa' },
  { code: '+234', flag: '🇳🇬', name: 'Nigeria' },
];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  onLoginSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>(initialMode);

  // Sync mode when parent opens modal with a specific mode
  useEffect(() => {
    if (isOpen) setMode(initialMode);
  }, [isOpen, initialMode]);

  // Form fields
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [hasPet, setHasPet] = useState<'yes' | 'no'>('yes');
  const [role, setRole] = useState<UserRole>('pet_owner');
  const [ownedSpecies, setOwnedSpecies] = useState<SpeciesType>('dog');

  // Forgot password
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  // UI state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [apiSuccess, setApiSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pwStrength = password.length === 0 ? null
    : password.length < 6 ? 'Weak'
    : /[A-Z]/.test(password) && /[0-9]/.test(password) ? 'Strong'
    : 'Medium';

  const switchMode = (m: 'login' | 'signup') => {
    setMode(m);
    setErrors({});
    setApiError(null);
    setApiSuccess(null);
  };

  if (!isOpen) return null;

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (mode === 'signup') {
      if (!name.trim()) e.name = 'Full name is required';
      if (!username.trim() || username.length < 4) e.username = 'Min 4 characters';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Enter a valid email';
      if (!phoneNumber || phoneNumber.length < 6) e.phone = 'Enter a valid phone number';
      if (password.length < 6) e.password = 'Min 6 characters';
    } else if (mode === 'login') {
      if (!username.trim()) e.username = 'Username or email required';
      if (!password) e.password = 'Password required';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    setApiError(null);
    setApiSuccess(null);

    try {
      if (mode === 'signup') {
        const { user: newUser, error } = await signUp({
          name, email,
          phone: `${countryCode} ${phoneNumber}`,
          city: '', address: '', username, password, role,
          species: hasPet === 'yes' ? ownedSpecies : undefined,
        });
        if (error) { setApiError(error); return; }
        if (newUser) {
          saveStorageUser(newUser);
          if (isSupabaseConfigured) {
            setApiSuccess('Account created! Check your email to confirm, then sign in.');
            switchMode('login');
            return;
          }
          onLoginSuccess(newUser);
          onClose();
        }
      } else {
        const identifier = email || username;
        const { user: loggedUser, error } = await logIn(identifier, password);
        if (error) { setApiError(error); return; }
        if (loggedUser) {
          saveStorageUser(loggedUser);
          onLoginSuccess(loggedUser);
          onClose();
        }
      }
    } catch {
      setApiError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    setIsSubmitting(true);
    const { error } = await sendPasswordResetEmail(forgotEmail);
    setIsSubmitting(false);
    if (error) { setApiError(error); return; }
    setForgotSent(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden relative">

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top brand strip */}
        <div className="bg-slate-900 px-8 pt-8 pb-6 text-center space-y-1">
          <div className="flex items-center justify-center space-x-2 mb-3">
            <div className="w-9 h-9 rounded-xl bg-brand-solidOrange flex items-center justify-center">
              <PawPrint className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-extrabold text-lg tracking-tight">PawSphere</span>
          </div>
          {mode === 'login' && (
            <>
              <p className="text-white font-extrabold text-xl">Welcome back</p>
              <p className="text-slate-400 text-xs">Sign in to access your pet dashboard</p>
            </>
          )}
          {mode === 'signup' && (
            <>
              <p className="text-white font-extrabold text-xl">Create your account</p>
              <p className="text-slate-400 text-xs">Join thousands of pet owners on PawSphere</p>
            </>
          )}
          {mode === 'forgot' && (
            <>
              <p className="text-white font-extrabold text-xl">Reset password</p>
              <p className="text-slate-400 text-xs">We'll send a recovery link to your email</p>
            </>
          )}
        </div>

        {/* Tab switcher */}
        {mode !== 'forgot' && (
          <div className="flex border-b border-slate-200 bg-slate-50">
            <button
              onClick={() => switchMode('login')}
              className={`flex-1 py-3 text-sm font-bold transition-all border-b-2 ${
                mode === 'login'
                  ? 'border-brand-solidBlue text-brand-solidBlue bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => switchMode('signup')}
              className={`flex-1 py-3 text-sm font-bold transition-all border-b-2 ${
                mode === 'signup'
                  ? 'border-brand-solidBlue text-brand-solidBlue bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              Create Account
            </button>
          </div>
        )}

        {/* Form area */}
        <div className="p-6 sm:p-8 max-h-[60vh] overflow-y-auto space-y-4">

          {/* API messages */}
          {apiError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700">
              {apiError}
            </div>
          )}
          {apiSuccess && (
            <div className="p-3 rounded-xl bg-green-50 border border-green-200 text-xs font-semibold text-green-700">
              {apiSuccess}
            </div>
          )}

          {/* ── LOGIN ── */}
          {mode === 'login' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Username or Email</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="you@email.com"
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 font-medium focus:outline-none focus:border-brand-solidBlue focus:ring-2 focus:ring-brand-solidBlue/20"
                  />
                </div>
                {errors.username && <p className="text-[11px] text-red-600">{errors.username}</p>}
              </div>

              <div className="space-y-1">
                <div className="flex justify-between">
                  <label className="text-xs font-bold text-slate-700 block">Password</label>
                  <button type="button" onClick={() => setMode('forgot')} className="text-xs text-brand-solidOrange hover:underline font-semibold">
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 font-medium focus:outline-none focus:border-brand-solidBlue focus:ring-2 focus:ring-brand-solidBlue/20"
                  />
                  <button type="button" onClick={() => setShowPassword(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-[11px] text-red-600">{errors.password}</p>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-brand-solidBlue text-white font-bold text-sm flex items-center justify-center space-x-2 hover:bg-brand-darkBlue transition-colors disabled:opacity-60"
              >
                <LogIn className="w-4 h-4" />
                <span>{isSubmitting ? 'Signing in...' : 'Sign In'}</span>
              </button>

              <p className="text-center text-xs text-slate-500">
                No account?{' '}
                <button type="button" onClick={() => switchMode('signup')} className="text-brand-solidBlue font-bold hover:underline">
                  Create one free
                </button>
              </p>
            </form>
          )}

          {/* ── SIGNUP ── */}
          {mode === 'signup' && (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Alex Rivera"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 font-medium focus:outline-none focus:border-brand-solidBlue focus:ring-2 focus:ring-brand-solidBlue/20"
                  />
                  {errors.name && <p className="text-[11px] text-red-600">{errors.name}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="alexrivera"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 font-medium focus:outline-none focus:border-brand-solidBlue focus:ring-2 focus:ring-brand-solidBlue/20"
                  />
                  {errors.username && <p className="text-[11px] text-red-600">{errors.username}</p>}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="alex@email.com"
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 font-medium focus:outline-none focus:border-brand-solidBlue focus:ring-2 focus:ring-brand-solidBlue/20"
                  />
                </div>
                {errors.email && <p className="text-[11px] text-red-600">{errors.email}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Phone Number</label>
                <div className="flex gap-2">
                  <select
                    value={countryCode}
                    onChange={e => setCountryCode(e.target.value)}
                    className="bg-slate-50 border border-slate-300 rounded-xl px-2 py-2.5 text-sm text-slate-800 font-medium focus:outline-none focus:border-brand-solidBlue"
                  >
                    {COUNTRY_CODES.map(c => (
                      <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={e => setPhoneNumber(e.target.value)}
                    placeholder="9876543210"
                    className="flex-1 px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 font-medium focus:outline-none focus:border-brand-solidBlue focus:ring-2 focus:ring-brand-solidBlue/20"
                  />
                </div>
                {errors.phone && <p className="text-[11px] text-red-600">{errors.phone}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 font-medium focus:outline-none focus:border-brand-solidBlue focus:ring-2 focus:ring-brand-solidBlue/20"
                  />
                  <button type="button" onClick={() => setShowPassword(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {pwStrength && (
                  <div className="flex items-center gap-2 pt-1">
                    <div className="flex gap-1 flex-1">
                      {['Weak', 'Medium', 'Strong'].map((s, i) => (
                        <div
                          key={s}
                          className={`h-1 flex-1 rounded-full transition-colors ${
                            pwStrength === 'Strong' ? 'bg-green-500'
                            : pwStrength === 'Medium' && i < 2 ? 'bg-amber-500'
                            : i === 0 ? 'bg-red-500'
                            : 'bg-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                    <span className={`text-[11px] font-bold ${
                      pwStrength === 'Strong' ? 'text-green-600'
                      : pwStrength === 'Medium' ? 'text-amber-600'
                      : 'text-red-600'
                    }`}>{pwStrength}</span>
                  </div>
                )}
                {errors.password && <p className="text-[11px] text-red-600">{errors.password}</p>}
              </div>

              {/* Pet ownership toggle */}
              <div className="space-y-2 pt-1 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-700 block">Do you own a pet?</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { val: 'yes', label: '🐾 Yes, I have one', r: 'pet_owner' as UserRole },
                    { val: 'no',  label: '🔍 Looking to adopt', r: 'looking_to_buy_or_adopt' as UserRole },
                  ].map(opt => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => { setHasPet(opt.val as 'yes' | 'no'); setRole(opt.r); }}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold border-2 transition-all ${
                        hasPet === opt.val
                          ? 'bg-brand-solidBlue text-white border-brand-solidBlue'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-brand-solidBlue/50'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {hasPet === 'yes' && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Your pet type</label>
                  <select
                    value={ownedSpecies}
                    onChange={e => setOwnedSpecies(e.target.value as SpeciesType)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 font-medium focus:outline-none focus:border-brand-solidBlue"
                  >
                    <option value="dog">🐶 Dog / Puppy</option>
                    <option value="cat">🐱 Cat / Kitten</option>
                    <option value="bird">🦜 Bird / Parrot</option>
                    <option value="fish">🐠 Fish</option>
                    <option value="reptile">🦎 Reptile</option>
                    <option value="rabbit">🐇 Rabbit</option>
                    <option value="hamster">🐹 Hamster</option>
                    <option value="other">🦄 Other</option>
                  </select>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-brand-solidGreen text-white font-bold text-sm flex items-center justify-center space-x-2 hover:bg-brand-darkGreen transition-colors disabled:opacity-60"
              >
                <UserPlus className="w-4 h-4" />
                <span>{isSubmitting ? 'Creating account...' : 'Create Account'}</span>
              </button>

              <p className="text-center text-xs text-slate-500">
                Already have an account?{' '}
                <button type="button" onClick={() => switchMode('login')} className="text-brand-solidBlue font-bold hover:underline">
                  Sign in
                </button>
              </p>
            </form>
          )}

          {/* ── FORGOT PASSWORD ── */}
          {mode === 'forgot' && (
            <div className="space-y-4">
              {!forgotSent ? (
                <form onSubmit={handleForgot} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">Your email address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={forgotEmail}
                        onChange={e => setForgotEmail(e.target.value)}
                        placeholder="alex@email.com"
                        className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 font-medium focus:outline-none focus:border-brand-solidBlue"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-xl bg-brand-solidOrange text-white font-bold text-sm hover:bg-brand-darkOrange transition-colors disabled:opacity-60"
                  >
                    {isSubmitting ? 'Sending...' : 'Send Reset Link'}
                  </button>
                </form>
              ) : (
                <div className="text-center space-y-3 py-4">
                  <div className="w-14 h-14 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto">
                    <ShieldCheck className="w-7 h-7" />
                  </div>
                  <p className="font-bold text-slate-800">Reset link sent!</p>
                  <p className="text-xs text-slate-500">Check your inbox at <strong>{forgotEmail}</strong></p>
                </div>
              )}
              <button
                type="button"
                onClick={() => { setMode('login'); setForgotSent(false); setApiError(null); }}
                className="w-full text-xs font-bold text-brand-solidBlue hover:underline text-center"
              >
                ← Back to Sign In
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
