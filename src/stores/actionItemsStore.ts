import { create } from 'zustand';
import {
  ActionItem,
  ActionItemStatus,
  UrgencyLevel,
  ActionItemType,
  ActionItemsFilter,
} from '../lib/types';
import { api } from '../lib/api';

interface ActionItemsState {
  actionItems: ActionItem[];
  selectedActionItem: ActionItem | null;
  originalStates: Map<string, ActionItem>;
  isLoading: boolean;
  isRefreshing: boolean;
  isLoadingMore: boolean;
  isLoadingDetail: boolean;
  error: string | null;
  hasMore: boolean;
  page: number;
  filters: {
    status?: ActionItemStatus;
    urgency?: UrgencyLevel;
    type?: ActionItemType;
  };

  // Actions
  fetchActionItems: (reset?: boolean) => Promise<void>;
  refreshActionItems: () => Promise<void>;
  loadMoreActionItems: () => Promise<void>;
  fetchActionItem: (id: string) => Promise<void>;
  setFilters: (filters: {
    status?: ActionItemStatus;
    urgency?: UrgencyLevel;
    type?: ActionItemType;
  }) => void;
  updateActionItemStatus: (id: string, status: ActionItemStatus) => Promise<ActionItem>;
  assignActionItemToMe: (id: string) => Promise<ActionItem>;
  updateActionItemOptimistic: (actionItem: ActionItem) => void;
  saveOriginalState: (id: string) => void;
  revertOptimisticUpdate: (id: string) => void;
  confirmOptimisticUpdate: (id: string) => void;
  clearSelectedActionItem: () => void;
}

export const useActionItemsStore = create<ActionItemsState>((set, get) => ({
  actionItems: [],
  selectedActionItem: null,
  originalStates: new Map(),
  isLoading: false,
  isRefreshing: false,
  isLoadingMore: false,
  isLoadingDetail: false,
  error: null,
  hasMore: true,
  page: 1,
  filters: {},

  fetchActionItems: async (reset = false) => {
    const { filters, page } = get();

    if (reset) {
      set({ isLoading: true, page: 1, actionItems: [], error: null });
    } else {
      set({ isLoading: true, error: null });
    }

    try {
      const currentPage = reset ? 1 : page;
      const response = await api.getActionItems({
        ...filters,
        page: currentPage,
        limit: 10,
      });

      set({
        actionItems: reset ? response.data : [...get().actionItems, ...response.data],
        hasMore: response.has_more,
        page: currentPage,
        isLoading: false,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch action items';
      set({ error: message, isLoading: false });
    }
  },

  refreshActionItems: async () => {
    const { filters } = get();
    set({ isRefreshing: true });

    try {
      const response = await api.getActionItems({
        ...filters,
        page: 1,
        limit: 10,
      });

      set({
        actionItems: response.data,
        hasMore: response.has_more,
        page: 1,
        isRefreshing: false,
      });
    } catch (error) {
      set({ isRefreshing: false });
    }
  },

  loadMoreActionItems: async () => {
    const { hasMore, isLoadingMore, filters, page, actionItems } = get();

    if (!hasMore || isLoadingMore) return;

    set({ isLoadingMore: true });

    try {
      const nextPage = page + 1;
      const response = await api.getActionItems({
        ...filters,
        page: nextPage,
        limit: 10,
      });

      set({
        actionItems: [...actionItems, ...response.data],
        hasMore: response.has_more,
        page: nextPage,
        isLoadingMore: false,
      });
    } catch (error) {
      set({ isLoadingMore: false });
    }
  },

  fetchActionItem: async (id: string) => {
    set({ isLoadingDetail: true, error: null });

    try {
      const actionItem = await api.getActionItem(id);
      set({ selectedActionItem: actionItem, isLoadingDetail: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch action item';
      set({ error: message, isLoadingDetail: false });
    }
  },

  setFilters: (filters) => {
    set({ filters });
    get().fetchActionItems(true);
  },

  updateActionItemStatus: async (id: string, status: ActionItemStatus) => {
    try {
      const actionItem = await api.updateActionItem(id, { status });
      get().updateActionItemOptimistic(actionItem);
      return actionItem;
    } catch (error) {
      throw error;
    }
  },

  assignActionItemToMe: async (id: string) => {
    try {
      const actionItem = await api.assignActionItemToMe(id);
      get().updateActionItemOptimistic(actionItem);
      return actionItem;
    } catch (error) {
      throw error;
    }
  },

  updateActionItemOptimistic: (actionItem: ActionItem) => {
    set((state) => ({
      actionItems: state.actionItems.map((a) =>
        a._id === actionItem._id ? actionItem : a
      ),
      selectedActionItem:
        state.selectedActionItem?._id === actionItem._id
          ? actionItem
          : state.selectedActionItem,
    }));
  },

  saveOriginalState: (id: string) => {
    const { actionItems, selectedActionItem, originalStates } = get();

    // Don't save if already saved
    if (originalStates.has(id)) return;

    // Find the action item
    const actionItem = actionItems.find((a) => a._id === id) ||
      (selectedActionItem?._id === id ? selectedActionItem : null);

    if (actionItem) {
      originalStates.set(id, { ...actionItem });
      set({ originalStates: new Map(originalStates) });
    }
  },

  revertOptimisticUpdate: (id: string) => {
    const { actionItems, selectedActionItem, originalStates } = get();
    const original = originalStates.get(id);

    if (original) {
      set({
        actionItems: actionItems.map((a) =>
          a._id === id ? original : a
        ),
        selectedActionItem: selectedActionItem?._id === id ? original : selectedActionItem,
      });

      // Clean up original state
      originalStates.delete(id);
      set({ originalStates: new Map(originalStates) });
    }
  },

  confirmOptimisticUpdate: (id: string) => {
    const { originalStates } = get();
    originalStates.delete(id);
    set({ originalStates: new Map(originalStates) });
  },

  clearSelectedActionItem: () => {
    set({ selectedActionItem: null });
  },
}));

export default useActionItemsStore;
