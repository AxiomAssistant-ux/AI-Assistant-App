import { create } from 'zustand';
import { Complaint, ActionItem, UrgentItem, ComplaintWithActions } from '../lib/types';
import { api } from '../lib/api';

interface UrgentState {
  complaints: ComplaintWithActions[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;

  // Computed
  getUrgentItems: () => UrgentItem[];
  getUrgentCount: () => number;

  // Actions
  fetchUrgent: () => Promise<void>;
  refreshUrgent: () => Promise<void>;
  updateComplaintOptimistic: (data: ComplaintWithActions) => void;
}

export const useUrgentStore = create<UrgentState>((set, get) => ({
  complaints: [],
  isLoading: false,
  isRefreshing: false,
  error: null,

  getUrgentItems: () => {
    const { complaints } = get();
    const items: UrgentItem[] = complaints.map((c) => ({ type: 'complaint' as const, item: c }));

    // Sort by created_at descending (most recent first)
    items.sort((a, b) => {
      const dateA = new Date(a.item.complaint.created_at).getTime();
      const dateB = new Date(b.item.complaint.created_at).getTime();
      return dateB - dateA;
    });

    return items;
  },

  getUrgentCount: () => {
    const { complaints } = get();
    return complaints.length;
  },

  fetchUrgent: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await api.getUrgent();
      set({
        complaints: response.complaints,
        isLoading: false,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch urgent items';
      set({ error: message, isLoading: false });
    }
  },

  refreshUrgent: async () => {
    set({ isRefreshing: true });

    try {
      const response = await api.getUrgent();
      set({
        complaints: response.complaints,
        isRefreshing: false,
      });
    } catch (error) {
      set({ isRefreshing: false });
    }
  },

  updateComplaintOptimistic: (data: ComplaintWithActions) => {
    set((state) => {
      // Check if still urgent
      const { complaint, action_items, urgent_count } = data;
      const isUrgent =
        (complaint.complaint_severity === 'high' ||
          complaint.complaint_severity === 'critical' ||
          (urgent_count || 0) > 0) &&
        (complaint.status === 'pending' || complaint.status === 'in_progress');

      if (isUrgent) {
        // Update existing or add
        const exists = state.complaints.find((c) => c.complaint._id === complaint._id);
        if (exists) {
          return {
            complaints: state.complaints.map((c) =>
              c.complaint._id === complaint._id ? data : c
            ),
          };
        }
        return { complaints: [...state.complaints, data] };
      } else {
        // Remove from urgent
        return {
          complaints: state.complaints.filter((c) => c.complaint._id !== complaint._id),
        };
      }
    });
  },
}));

export default useUrgentStore;
