import { create } from 'zustand';
import { OrgUser, Organization } from '../lib/types';
import { api } from '../lib/api';
import { storage } from '../lib/storage';
import { setCurrentUserId } from '../lib/mockServer';

interface AuthState {
  user: OrgUser | null;
  organization: Organization | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  organization: null,
  token: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });

    try {
      const response = await api.login({ email, password });

      await storage.setToken(response.token);
      setCurrentUserId(response.user._id);

      set({
        user: response.user,
        organization: response.organization,
        token: response.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      set({
        isLoading: false,
        error: message,
        isAuthenticated: false,
      });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true });

    try {
      await storage.removeToken();
      set({
        user: null,
        organization: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  checkAuth: async () => {
    set({ isLoading: true });

    try {
      const token = await storage.getToken();

      if (!token) {
        set({
          isAuthenticated: false,
          isLoading: false,
        });
        return false;
      }

      const response = await api.getMe();
      setCurrentUserId(response.user._id);

      set({
        user: response.user,
        organization: response.organization,
        token,
        isAuthenticated: true,
        isLoading: false,
      });

      return true;
    } catch (error) {
      await storage.removeToken();
      set({
        user: null,
        organization: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
      return false;
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));

export default useAuthStore;
