import { create } from 'zustand';
import { api } from '../lib/api';
import { DashboardResponse } from '../lib/types';

interface HomeState {
  stats: DashboardResponse | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;

  // Actions
  fetchDashboard: () => Promise<void>;
  refreshDashboard: () => Promise<void>;
}

export const useHomeStore = create<HomeState>((set, get) => ({
  stats: null,
  isLoading: false,
  isRefreshing: false,
  error: null,

  fetchDashboard: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await api.getDashboard();
      set({
        stats: response,
        isLoading: false,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch dashboard';
      set({ error: message, isLoading: false });
    }
  },

  refreshDashboard: async () => {
    set({ isRefreshing: true });

    try {
      const response = await api.getDashboard();
      set({
        stats: response,
        isRefreshing: false,
      });
    } catch (error) {
      set({ isRefreshing: false });
    }
  },
}));

export default useHomeStore;
