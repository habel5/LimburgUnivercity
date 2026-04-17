import { create } from 'zustand';
import { projectId, publicAnonKey } from '../config/env';

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

export const useAuth = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  accessToken: null,
  login: async (email: string, password: string) => {
    try {
      console.log('=== LOGIN ATTEMPT (FRONTEND) ===');
      console.log('Email:', email);
      console.log('Password length:', password.length);
      console.log('First char:', password[0]);
      console.log('Last char:', password[password.length - 1]);
      
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
      console.log('Server response:', data);
      console.log('Response status:', response.status);

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

        set({
          user: nextUser,
          isAuthenticated: true,
          accessToken: data.access_token,
        });
        
        // Store in localStorage for persistence
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
    set({ 
      user: null, 
      isAuthenticated: false,
      accessToken: null,
    });
    localStorage.removeItem('auth-storage');
  },
  hasRole: (role) => useAuth.getState().user?.role === role,
  hasAnyRole: (roles) => {
    const currentRole = useAuth.getState().user?.role;
    return !!currentRole && roles.includes(currentRole);
  },
}));

// Load from localStorage on initialization
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
