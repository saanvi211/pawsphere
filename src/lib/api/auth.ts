import { supabase, isSupabaseConfigured } from '../supabase';
import { UserProfile, UserRole } from '../../types/animal';

export interface SignupPayload {
  name: string;
  email: string;
  phone: string;
  city: string;
  address: string;
  username: string;
  password: string;
  role: UserRole;
  species?: string;
}

export interface AuthResult {
  user: UserProfile | null;
  error: string | null;
}

/** Sign up a new user with email + password */
export async function signUp(payload: SignupPayload): Promise<AuthResult> {
  if (!isSupabaseConfigured) {
    // Offline fallback — simulate successful signup
    const mockUser: UserProfile = {
      id: 'local-' + Date.now(),
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      city: payload.city,
      address: payload.address,
      role: payload.role,
      avatarUrl: '',
      memberSince: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      favoritePetIds: [],
    };
    return { user: mockUser, error: null };
  }

  // 1. Create Supabase auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: payload.email,
    password: payload.password,
    options: {
      data: {
        name: payload.name,
        username: payload.username,
        phone: payload.phone,
        role: payload.role,
      },
    },
  });

  if (authError) return { user: null, error: authError.message };
  if (!authData.user) return { user: null, error: 'Signup failed — no user returned.' };

  // 2. Insert into public profiles table
  const { error: profileError } = await supabase.from('profiles').insert({
    id: authData.user.id,
    name: payload.name,
    email: payload.email,
    phone: payload.phone,
    city: payload.city,
    address: payload.address,
    username: payload.username,
    role: payload.role,
    member_since: new Date().toISOString(),
  });

  if (profileError) return { user: null, error: profileError.message };

  const profile: UserProfile = {
    id: authData.user.id,
    name: payload.name,
    email: payload.email,
    phone: payload.phone,
    city: payload.city,
    address: payload.address,
    role: payload.role,
    avatarUrl: '',
    memberSince: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    favoritePetIds: [],
  };

  return { user: profile, error: null };
}

/** Log in with email + password */
export async function logIn(
  emailOrUsername: string,
  password: string
): Promise<AuthResult> {
  if (!isSupabaseConfigured) {
    // Offline fallback
    const mockUser: UserProfile = {
      id: 'local-001',
      name: 'Demo User',
      email: emailOrUsername,
      phone: '+1 (555) 000-0000',
      city: 'Demo City',
      address: '1 Demo Street',
      role: 'pet_owner',
      avatarUrl: '',
      memberSince: 'January 2026',
      favoritePetIds: [],
    };
    return { user: mockUser, error: null };
  }

  // Try email login first
  let email = emailOrUsername;

  // If username (no @), look up email via profiles table
  if (!emailOrUsername.includes('@')) {
    const { data, error } = await supabase
      .from('profiles')
      .select('email')
      .eq('username', emailOrUsername)
      .single();
    if (error || !data) {
      return { user: null, error: 'Username not found.' };
    }
    email = data.email;
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { user: null, error: error.message };

  const profile = await getProfile(data.user.id);
  return { user: profile, error: null };
}

/** Get current session's profile from DB */
export async function getProfile(userId: string): Promise<UserProfile | null> {
  if (!isSupabaseConfigured) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    name: data.name,
    email: data.email,
    phone: data.phone || '',
    city: data.city || '',
    address: data.address || '',
    role: data.role as UserRole,
    avatarUrl: data.avatar_url || '',
    memberSince: new Date(data.member_since).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    }),
    favoritePetIds: data.favorite_pet_ids || [],
  };
}

/** Update user profile */
export async function updateProfile(
  userId: string,
  updates: Partial<UserProfile>
): Promise<{ error: string | null }> {
  if (!isSupabaseConfigured) return { error: null };

  const { error } = await supabase
    .from('profiles')
    .update({
      name: updates.name,
      phone: updates.phone,
      city: updates.city,
      address: updates.address,
      avatar_url: updates.avatarUrl,
      favorite_pet_ids: updates.favoritePetIds,
    })
    .eq('id', userId);

  return { error: error?.message || null };
}

/** Sign out */
export async function logOut(): Promise<void> {
  if (!isSupabaseConfigured) return;
  await supabase.auth.signOut();
}

/** Send password reset email */
export async function sendPasswordResetEmail(email: string): Promise<{ error: string | null }> {
  if (!isSupabaseConfigured) return { error: null };

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });

  return { error: error?.message || null };
}

/** Restore session on page load */
export async function restoreSession(): Promise<AuthResult> {
  if (!isSupabaseConfigured) return { user: null, error: null };

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { user: null, error: null };

  const profile = await getProfile(session.user.id);
  return { user: profile, error: null };
}
