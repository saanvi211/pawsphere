import React, { useState, useEffect } from 'react';
import { UserProfile, UserRole, SpeciesType } from '../../types/animal';
import {
  X,
  LogIn,
  UserPlus,
  ShieldCheck,
  Lock,
  Mail,
  User as UserIcon,
  Eye,
  EyeOff,
  PawPrint,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { saveStorageUser } from '../../db/storage';
import { signUp, logIn, sendPasswordResetEmail } from '../../lib/api/auth';

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
];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  onLoginSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>(initialMode);

  // Sync mode when modal opens
  useEffect(() => {
    if (isOpen) setMode(initialMode);
  }, [isOpen, initialMode]);

  // Form state
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(true);

  // Pet details for signup
  const [hasPet, setHasPet] = useState<'yes' | 'no'>('yes');
  const [role, setRole] = useState<UserRole>('pet_owner');
  const [petName, setPetName] = useState('');
  const [ownedSpecies, setOwnedSpecies] = useState<SpeciesType>('dog');
  const [petBreed, setPetBreed] = useState('');
  const [petAge, setPetAge] = useState<number>(3);

  // Forgot password
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  // UI state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [apiSuccess, setApiSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pwStrength =
    password.length === 0 ? null
    : password.length < 8 ? 'Weak'
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
      if (!name.trim()) {
        e.name = 'Please enter your full name.';
      }
      if (!username.trim()) {
        e.username = 'Please enter a username.';
      } else if (username.trim().length < 4) {
        e.username = 'Username must be at least 4 characters.';
      }
      if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        e.email = 'Please enter a valid email address.';
      }
      if (!password) {
        e.password = 'Please enter a password.';
      } else if (password.length < 8) {
        e.password = 'Password must contain at least 8 characters.';
      }
      if (confirmPassword !== password) {
        e.confirmPassword = 'Passwords do not match.';
      }
      if (!termsAccepted) {
        e.terms = 'You must accept the Terms of Service to create an account.';
      }
    } else if (mode === 'login') {
      if (!username.trim()) {
        e.username = 'Please enter your username or email address.';
      }
      if (!password) {
        e.password = 'Please enter your password.';
      }
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!validate()) return;

    setIsSubmitting(true);
    setApiError(null);
    setApiSuccess(null);

    try {
      if (mode === 'signup') {
        const { user: newUser, error } = await signUp({
          name: name.trim(),
          email: email.trim(),
          phone: phoneNumber ? `${countryCode} ${phoneNumber.trim()}` : '',
          city: '',
          address: '',
          username: username.trim(),
          password,
          role,
          species: hasPet === 'yes' ? ownedSpecies : undefined,
          petName: hasPet === 'yes' ? (petName.trim() || undefined) : undefined,
          petBreed: hasPet === 'yes' ? (petBreed.trim() || undefined) : undefined,
          petAgeYears: hasPet === 'yes' ? petAge : undefined,
        });

        if (error) {
          setApiError(error);
          return;
        }

        if (newUser) {
          setApiSuccess('✓ Account created successfully! Loading your PawSphere dashboard...');
          saveStorageUser(newUser);

          setTimeout(() => {
            onLoginSuccess(newUser);
            onClose();
          }, 600);
          return;
        }
      } else {
        const identifier = username.trim() || email.trim();
        const { user: loggedUser, error } = await logIn(identifier, password);
        if (error) {
          setApiError(error);
          return;
        }
        if (loggedUser) {
          setApiSuccess('✓ Signed in successfully! Redirecting...');
          saveStorageUser(loggedUser);
          setTimeout(() => {
            onLoginSuccess(loggedUser);
            onClose();
          }, 400);
        }
      }
    } catch (err: any) {
      console.error('[AuthModal] Exception during submit:', err);
      setApiError('Something went wrong during authentication. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    setIsSubmitting(true);
    const { error } = await sendPasswordResetEmail(forgotEmail.trim());
    setIsSubmitting(false);
    if (error) {
      setApiError(error);
      return;
    }
    setForgotSent(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden relative">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top Header */}
        <div className="bg-slate-900 px-8 pt-8 pb-6 text-center space-y-1">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <div className="w-9 h-9 rounded-xl bg-brand-solidOrange flex items-center justify-center shadow-md">
              <PawPrint className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-extrabold text-xl tracking-tight">PawSphere</span>
          </div>
          {mode === 'login' && (
            <>
              <p className="text-white font-extrabold text-xl">Welcome back</p>
              <p className="text-slate-400 text-xs">Sign in to your PawSphere account</p>
            </>
          )}
          {mode === 'signup' && (
            <>
              <p className="text-white font-extrabold text-xl">Create your account</p>
              <p className="text-slate-400 text-xs">Join PawSphere to manage pet care, digital twins & health</p>
            </>
          )}
          {mode === 'forgot' && (
            <>
              <p className="text-white font-extrabold text-xl">Reset password</p>
              <p className="text-slate-400 text-xs">We'll send a recovery link to your email</p>
            </>
          )}
        </div>

        {/* Mode Switcher */}
        {mode !== 'forgot' && (
          <div className="flex border-b border-slate-200 bg-slate-50">
            <button
              type="button"
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
              type="button"
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

        {/* Form Body */}
        <div className="p-6 sm:p-8 max-h-[65vh] overflow-y-auto space-y-4">

          {/* Error Banner */}
          {apiError && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-800 flex items-start space-x-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1 space-y-1">
                <p>{apiError}</p>
                {apiError.includes('already registered') && (
                  <button
                    type="button"
                    onClick={() => switchMode('login')}
                    className="text-xs font-bold text-brand-solidBlue hover:underline block"
                  >
                    👉 Click here to Sign In instead
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Success Banner */}
          {apiSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center space-x-2 animate-fadeIn">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{apiSuccess}</span>
            </div>
          )}

          {/* ── LOGIN FORM ── */}
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
                    placeholder="Enter email or username"
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 font-medium focus:outline-none focus:border-brand-solidBlue focus:ring-2 focus:ring-brand-solidBlue/20"
                  />
                </div>
                {errors.username && <p className="text-[11px] font-bold text-red-600">{errors.username}</p>}
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
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
                {errors.password && <p className="text-[11px] font-bold text-red-600">{errors.password}</p>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-brand-solidBlue text-white font-bold text-sm flex items-center justify-center space-x-2 hover:bg-brand-darkBlue transition-all shadow-md disabled:opacity-60"
              >
                <LogIn className="w-4 h-4" />
                <span>{isSubmitting ? 'Signing in...' : 'Sign In'}</span>
              </button>

              <p className="text-center text-xs text-slate-500 font-medium pt-2">
                Don't have an account?{' '}
                <button type="button" onClick={() => switchMode('signup')} className="text-brand-solidBlue font-bold hover:underline">
                  Create one free
                </button>
              </p>
            </form>
          )}

          {/* ── SIGNUP FORM ── */}
          {mode === 'signup' && (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Full Name *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Alex Rivera"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 font-medium focus:outline-none focus:border-brand-solidBlue focus:ring-2 focus:ring-brand-solidBlue/20"
                  />
                  {errors.name && <p className="text-[11px] font-bold text-red-600">{errors.name}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Username *</label>
                  <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="alexrivera"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 font-medium focus:outline-none focus:border-brand-solidBlue focus:ring-2 focus:ring-brand-solidBlue/20"
                  />
                  {errors.username && <p className="text-[11px] font-bold text-red-600">{errors.username}</p>}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Email Address *</label>
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
                {errors.email && <p className="text-[11px] font-bold text-red-600">{errors.email}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Phone Number (Optional)</label>
                <div className="flex gap-2">
                  <select
                    value={countryCode}
                    onChange={e => setCountryCode(e.target.value)}
                    className="bg-slate-50 border border-slate-300 rounded-xl px-2 py-2.5 text-xs text-slate-800 font-bold focus:outline-none focus:border-brand-solidBlue"
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
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Password *</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Min 8 chars"
                      className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 font-medium focus:outline-none focus:border-brand-solidBlue focus:ring-2 focus:ring-brand-solidBlue/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(p => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {pwStrength && (
                    <span className={`text-[10px] font-bold block pt-0.5 ${
                      pwStrength === 'Strong' ? 'text-emerald-600' : pwStrength === 'Medium' ? 'text-amber-600' : 'text-red-600'
                    }`}>Strength: {pwStrength}</span>
                  )}
                  {errors.password && <p className="text-[11px] font-bold text-red-600">{errors.password}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Confirm Password *</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 font-medium focus:outline-none focus:border-brand-solidBlue focus:ring-2 focus:ring-brand-solidBlue/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(p => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      title={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-[11px] font-bold text-red-600">{errors.confirmPassword}</p>}
                </div>
              </div>

              {/* Pet Ownership Section */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-700 block">Do you currently own a pet?</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { val: 'yes', label: '🐾 Yes, I have a pet', r: 'pet_owner' as UserRole },
                    { val: 'no',  label: '🔍 Looking to adopt', r: 'looking_to_buy_or_adopt' as UserRole },
                  ].map(opt => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => { setHasPet(opt.val as 'yes' | 'no'); setRole(opt.r); }}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border-2 transition-all ${
                        hasPet === opt.val
                          ? 'bg-brand-solidBlue text-white border-brand-solidBlue'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-brand-solidBlue/40'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {hasPet === 'yes' && (
                <div className="p-3 bg-blue-50/60 rounded-2xl border border-blue-200 space-y-2.5 animate-fadeIn">
                  <span className="text-[11px] font-black text-blue-900 uppercase tracking-wider block">Initialize Your Pet Profile:</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700 block">Pet Name</label>
                      <input
                        type="text"
                        value={petName}
                        onChange={e => setPetName(e.target.value)}
                        placeholder="e.g. Bruno"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700 block">Species</label>
                      <select
                        value={ownedSpecies}
                        onChange={e => setOwnedSpecies(e.target.value as SpeciesType)}
                        className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800"
                      >
                        <option value="dog">🐶 Dog</option>
                        <option value="cat">🐱 Cat</option>
                        <option value="bird">🦜 Bird</option>
                        <option value="rabbit">🐇 Rabbit</option>
                        <option value="other">🦄 Other</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700 block">Breed</label>
                      <input
                        type="text"
                        value={petBreed}
                        onChange={e => setPetBreed(e.target.value)}
                        placeholder="e.g. Labrador Retriever"

                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700 block">Age (Years)</label>
                      <input
                        type="number"
                        min={0}
                        max={30}
                        value={petAge}
                        onChange={e => setPetAge(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Terms checkbox */}
              <div className="space-y-1 pt-1">
                <label className="flex items-start space-x-2 text-xs font-semibold text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={e => setTermsAccepted(e.target.checked)}
                    className="mt-0.5 rounded text-brand-solidBlue focus:ring-brand-solidBlue"
                  />
                  <span>I agree to the Terms of Service & Privacy Policy</span>
                </label>
                {errors.terms && <p className="text-[11px] font-bold text-red-600">{errors.terms}</p>}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl bg-brand-solidGreen text-white font-extrabold text-sm flex items-center justify-center space-x-2 hover:bg-brand-darkGreen transition-all shadow-md disabled:opacity-60"
              >
                <UserPlus className="w-4 h-4" />
                <span>{isSubmitting ? 'Creating PawSphere Account...' : '🐾 Create PawSphere Account'}</span>
              </button>

              <p className="text-center text-xs text-slate-500 font-medium">
                Already have an account?{' '}
                <button type="button" onClick={() => switchMode('login')} className="text-brand-solidBlue font-bold hover:underline">
                  Sign in
                </button>
              </p>
            </form>
          )}

          {/* ── FORGOT PASSWORD FORM ── */}
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
                    {isSubmitting ? 'Sending Link...' : 'Send Password Reset Link'}
                  </button>
                </form>
              ) : (
                <div className="text-center space-y-3 py-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <ShieldCheck className="w-7 h-7" />
                  </div>
                  <p className="font-bold text-slate-800">Reset link sent!</p>
                  <p className="text-xs text-slate-500">Check your inbox at <strong>{forgotEmail}</strong></p>
                </div>
              )}
              <button
                type="button"
                onClick={() => { setMode('login'); setForgotSent(false); setApiError(null); }}
                className="w-full text-xs font-bold text-brand-solidBlue hover:underline text-center block"
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
