import { create } from 'zustand';
import { Notification } from '../lib/types';
import { api } from '../lib/api';

interface NotificationsState {
  notifications: Notification[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;

  // Computed
  getUnreadCount: () => number;

  // Actions
  fetchNotifications: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  notifications: [],
  isLoading: false,
  isRefreshing: false,
  error: null,

  getUnreadCount: () => {
    return get().notifications.filter((n) => !n.read).length;
  },

  fetchNotifications: async () => {
    set({ isLoading: true, error: null });

    try {
      const notifications = await api.getNotifications();
      set({ notifications, isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch notifications';
      set({ error: message, isLoading: false });
    }
  },

  refreshNotifications: async () => {
    set({ isRefreshing: true });

    try {
      const notifications = await api.getNotifications();
      set({ notifications, isRefreshing: false });
    } catch (error) {
      set({ isRefreshing: false });
    }
  },

  markAsRead: async (id: string) => {
    try {
      await api.markNotificationRead(id);
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n._id === id ? { ...n, read: true } : n
        ),
      }));
    } catch (error) {
      // Silently fail
    }
  },

  markAllAsRead: async () => {
    try {
      await api.markAllNotificationsRead();
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, read: true })),
      }));
    } catch (error) {
      // Silently fail
    }
  },
}));

export default useNotificationsStore;
