import { create } from 'zustand';
import { projectId, publicAnonKey } from '../config/env';

// Drie gebruikersrollen — elke rol bepaalt welke acties een gebruiker mag uitvoeren
export type UserRole = 'admin' | 'gemeente' | 'onderwijs';

interface User {
  id?: string;
  email: string;
  role?: UserRole;
  name?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  accessToken: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
}

// Globale auth-state via Zustand — de inlogstatus is beschikbaar in elk component zonder prop drilling
export const useAuth = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  accessToken: null,
  login: async (email: string, password: string) => {
    try {
      // POST-verzoek naar de login-endpoint van de Supabase Edge Function
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-09c2210b/login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': publicAnonKey,
          },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error('Login failed:', data);
        // Throw error with proper structure so LoginModal can catch it
        throw {
          message: data.error || 'Login failed',
          needsSetup: data.needsSetup || false
        };
      }

      if (data.access_token) {
        const nextUser = {
          id: data.user.id,
          email: data.user.email,
          role: data.user.role as UserRole,
          name: data.user.name,
        };

        // Sla de gebruiker en het access token op in de Zustand store
        set({
          user: nextUser,
          isAuthenticated: true,
          accessToken: data.access_token,
        });

        // Persisteer de sessie in localStorage zodat de gebruiker ingelogd blijft na een page refresh
        localStorage.setItem('auth-storage', JSON.stringify({
          user: nextUser,
          isAuthenticated: true,
          accessToken: data.access_token,
        }));

        return true;
      }

      return false;
    } catch (error) {
      console.error('Login error:', error);
      // Re-throw the error so LoginModal can catch it
      throw error;
    }
  },
  logout: () => {
    // Reset de auth-state en verwijder de sessie uit localStorage
    set({
      user: null,
      isAuthenticated: false,
      accessToken: null,
    });
    localStorage.removeItem('auth-storage');
  },
  // Hulpfuncties voor rolcontrole — worden gebruikt in componenten om toegang te bepalen
  hasRole: (role) => useAuth.getState().user?.role === role,
  hasAnyRole: (roles) => {
    const currentRole = useAuth.getState().user?.role;
    return !!currentRole && roles.includes(currentRole);
  },
}));

// Herstel de sessie uit localStorage bij het opstarten van de applicatie,
// zodat de gebruiker ingelogd blijft na het herladen van de pagina
const storedAuth = localStorage.getItem('auth-storage');
if (storedAuth) {
  try {
    const parsed = JSON.parse(storedAuth);
    useAuth.setState(parsed);
  } catch (error) {
    console.error('Failed to parse stored auth:', error);
    localStorage.removeItem('auth-storage');
  }
}
