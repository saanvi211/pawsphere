import { useState, useEffect, useCallback } from 'react';
import { UserProfile } from '../types/animal';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { getProfile, logOut as apiLogOut } from '../lib/api/auth';
import { getStorageUser, saveStorageUser } from '../db/storage';

interface UseAuthReturn {
  user: UserProfile | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  setUser: (u: UserProfile) => void;
  logout: () => Promise<void>;
}

/** 
 * Central auth hook.
 * - With Supabase configured: listens to Supabase auth state changes.
 * - Without Supabase: uses localStorage session (offline mode).
 */
export function useAuth(): UseAuthReturn {
  const [user, setUserState] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const setUser = useCallback((u: UserProfile) => {
    setUserState(u);
    saveStorageUser(u);
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      // Offline mode — restore from localStorage
      const stored = getStorageUser();
      // Only treat as logged-in if it's not the default mock user id
      if (stored && stored.id !== 'usr-101') {
        setUserState(stored);
      }
      setIsLoading(false);
      return;
    }

    // Supabase mode — restore session on mount
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const profile = await getProfile(session.user.id);
        if (profile) {
          setUserState(profile);
          saveStorageUser(profile);
        }
      }
      setIsLoading(false);
    });

    // Listen for auth changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const profile = await getProfile(session.user.id);
          if (profile) {
            setUserState(profile);
            saveStorageUser(profile);
          }
        } else if (event === 'SIGNED_OUT') {
          setUserState(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const logout = useCallback(async () => {
    await apiLogOut();
    setUserState(null);
    // Clear stored user back to guest
    localStorage.removeItem('pawsphere_user_v2');
  }, []);

  return {
    user,
    isLoggedIn: !!user,
    isLoading,
    setUser,
    logout,
  };
}
