import { create } from 'zustand';
import api from '../lib/api';

export type UserRole = 'Admin' | 'Owner' | 'Agent' | 'Buyer';

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  isVerified: boolean;
  profileImage?: string;
  phone?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  hydrated: boolean; // true after localStorage has been read
  setAuth: (user: User, token: string, refreshToken: string) => void;
  updateUser: (user: Partial<User>) => void;
  setIsVerified: (isVerified: boolean) => void;
  logout: () => Promise<void>;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  hydrated: false,

  setAuth: (user, token, refreshToken) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('urbaniq_token', token);
      localStorage.setItem('urbaniq_refresh_token', refreshToken);
      localStorage.setItem('urbaniq_user', JSON.stringify(user));
    }
    set({ user, token, refreshToken, isAuthenticated: true });
  },

  updateUser: (updates) => {
    set((state) => {
      if (state.user) {
        const updatedUser = { ...state.user, ...updates };
        if (typeof window !== 'undefined') {
          localStorage.setItem('urbaniq_user', JSON.stringify(updatedUser));
        }
        return { user: updatedUser };
      }
      return {};
    });
  },

  setIsVerified: (isVerified) => {
    set((state) => {
      if (state.user) {
        const updatedUser = { ...state.user, isVerified };
        if (typeof window !== 'undefined') {
          localStorage.setItem('urbaniq_user', JSON.stringify(updatedUser));
        }
        return { user: updatedUser };
      }
      return {};
    });
  },

  logout: async () => {
    const rt = typeof window !== 'undefined' ? localStorage.getItem('urbaniq_refresh_token') : null;
    try {
      if (rt) {
        await api.post('/auth/logout', { refreshToken: rt });
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('urbaniq_token');
        localStorage.removeItem('urbaniq_refresh_token');
        localStorage.removeItem('urbaniq_user');
      }
      set({ user: null, token: null, refreshToken: null, isAuthenticated: false });
    }
  },

  initialize: () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('urbaniq_token');
      const refreshToken = localStorage.getItem('urbaniq_refresh_token');
      const userStr = localStorage.getItem('urbaniq_user');
      if (token && userStr) {
        try {
          const user = JSON.parse(userStr);
          set({ user, token, refreshToken, isAuthenticated: true, hydrated: true });
          return;
        } catch (e) {
          localStorage.removeItem('urbaniq_token');
          localStorage.removeItem('urbaniq_refresh_token');
          localStorage.removeItem('urbaniq_user');
        }
      }
    }
    // Always mark hydrated even if no session found
    set({ hydrated: true });
  }
}));

export default useAuthStore;
