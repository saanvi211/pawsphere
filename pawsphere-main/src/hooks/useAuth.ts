import { useState, useEffect, useCallback } from 'react';
import { UserProfile } from '../types/animal';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { getProfile, logOut as apiLogOut } from '../lib/api/auth';
import { getStorageUser, saveStorageUser, clearStorageUser } from '../db/storage';

interface UseAuthReturn {
  user: UserProfile | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  setUser: (u: UserProfile) => void;
  logout: () => Promise<void>;
}

/** 
 * Central auth hook.
 * - Restores session on mount (checking Supabase and local storage).
 * - Manages login/logout session state cleanly.
 */
export function useAuth(): UseAuthReturn {
  const [user, setUserState] = useState<UserProfile | null>(() => getStorageUser());
  const [isLoading, setIsLoading] = useState(true);

  const setUser = useCallback((u: UserProfile) => {
    setUserState(u);
    saveStorageUser(u);
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      const stored = getStorageUser();

      if (!isSupabaseConfigured || !supabase) {
        if (stored) {
          setUserState(stored);
        }
        setIsLoading(false);
        return;
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const profile = await getProfile(session.user.id);
          if (profile) {
            setUserState(profile);
            saveStorageUser(profile);
          } else if (stored) {
            setUserState(stored);
          }
        } else if (stored) {
          setUserState(stored);
        }
      } catch (err) {
        console.warn('[useAuth] Supabase session fetch warning:', err);
        if (stored) setUserState(stored);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    if (isSupabaseConfigured && supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event: string, session: any) => {
          if (event === 'SIGNED_IN' && session?.user) {
            const profile = await getProfile(session.user.id);
            if (profile) {
              setUserState(profile);
              saveStorageUser(profile);
            }
          } else if (event === 'SIGNED_OUT') {
            setUserState(null);
            clearStorageUser();
          }
        }
      );

      return () => subscription.unsubscribe();
    }
  }, []);

  const logout = useCallback(async () => {
    await apiLogOut();
    setUserState(null);
    clearStorageUser();
  }, []);

  return {
    user,
    isLoggedIn: !!user,
    isLoading,
    setUser,
    logout,
  };
}
