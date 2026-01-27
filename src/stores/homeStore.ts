import { create } from 'zustand';
import { api } from '../lib/api';

export interface DashboardStats {
  storeName: string;
  storeNumber: string;
  todaysCalls: number;
  pendingComplaints: number;
  urgentActionItems: number;
  overdueActionItems: number;
  // Analytics snapshot
  totalCallsThisWeek: number;
  complaintsResolvedToday: number;
  avgResolutionTime: string;
}

interface HomeState {
  stats: DashboardStats | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;

  // Actions
  fetchDashboard: () => Promise<void>;
  refreshDashboard: () => Promise<void>;
}

const defaultStats: DashboardStats = {
  storeName: '',
  storeNumber: '',
  todaysCalls: 0,
  pendingComplaints: 0,
  urgentActionItems: 0,
  overdueActionItems: 0,
  totalCallsThisWeek: 0,
  complaintsResolvedToday: 0,
  avgResolutionTime: '0h',
};

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
