import { create } from 'zustand';
import { Complaint, ActionItem, UrgentItem } from '../lib/types';
import { api } from '../lib/api';

interface UrgentState {
  complaints: Complaint[];
  actionItems: ActionItem[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;

  // Computed
  getUrgentItems: () => UrgentItem[];
  getUrgentCount: () => number;

  // Actions
  fetchUrgent: () => Promise<void>;
  refreshUrgent: () => Promise<void>;
  updateComplaintOptimistic: (complaint: Complaint) => void;
  updateActionItemOptimistic: (actionItem: ActionItem) => void;
}

export const useUrgentStore = create<UrgentState>((set, get) => ({
  complaints: [],
  actionItems: [],
  isLoading: false,
  isRefreshing: false,
  error: null,

  getUrgentItems: () => {
    const { complaints, actionItems } = get();
    const items: UrgentItem[] = [
      ...complaints.map((c) => ({ type: 'complaint' as const, item: c })),
      ...actionItems.map((a) => ({ type: 'action_item' as const, item: a })),
    ];

    // Sort by created_at descending (most recent first)
    items.sort((a, b) => {
      const dateA = new Date(a.item.created_at).getTime();
      const dateB = new Date(b.item.created_at).getTime();
      return dateB - dateA;
    });

    return items;
  },

  getUrgentCount: () => {
    const { complaints, actionItems } = get();
    return complaints.length + actionItems.length;
  },

  fetchUrgent: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await api.getUrgent();
      set({
        complaints: response.complaints,
        actionItems: response.action_items,
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
        actionItems: response.action_items,
        isRefreshing: false,
      });
    } catch (error) {
      set({ isRefreshing: false });
    }
  },

  updateComplaintOptimistic: (complaint: Complaint) => {
    set((state) => {
      // Check if still urgent
      const isUrgent =
        (complaint.complaint_severity === 'high' || complaint.complaint_severity === 'critical') &&
        (complaint.status === 'pending' || complaint.status === 'in_progress');

      if (isUrgent) {
        // Update existing or add
        const exists = state.complaints.find((c) => c._id === complaint._id);
        if (exists) {
          return {
            complaints: state.complaints.map((c) =>
              c._id === complaint._id ? complaint : c
            ),
          };
        }
        return { complaints: [...state.complaints, complaint] };
      } else {
        // Remove from urgent
        return {
          complaints: state.complaints.filter((c) => c._id !== complaint._id),
        };
      }
    });
  },

  updateActionItemOptimistic: (actionItem: ActionItem) => {
    set((state) => {
      // Check if still urgent
      const isUrgent =
        (actionItem.urgency === 'high' || actionItem.urgency === 'critical') &&
        (actionItem.status === 'pending' || actionItem.status === 'in_progress');

      if (isUrgent) {
        // Update existing or add
        const exists = state.actionItems.find((a) => a._id === actionItem._id);
        if (exists) {
          return {
            actionItems: state.actionItems.map((a) =>
              a._id === actionItem._id ? actionItem : a
            ),
          };
        }
        return { actionItems: [...state.actionItems, actionItem] };
      } else {
        // Remove from urgent
        return {
          actionItems: state.actionItems.filter((a) => a._id !== actionItem._id),
        };
      }
    });
  },
}));

export default useUrgentStore;
