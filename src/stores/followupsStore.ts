import { create } from 'zustand';
import { ActionItem, ActionItemStatus } from '../lib/types';
import { api } from '../lib/api';

interface FollowupsState {
    followups: ActionItem[];
    selectedFollowup: ActionItem | null;
    isLoading: boolean;
    isRefreshing: boolean;
    isLoadingMore: boolean;
    isLoadingDetail: boolean;
    error: string | null;
    hasMore: boolean;
    page: number;
    statusFilter: ActionItemStatus | undefined;

    // Actions
    fetchFollowups: (reset?: boolean) => Promise<void>;
    refreshFollowups: () => Promise<void>;
    loadMoreFollowups: () => Promise<void>;
    fetchFollowup: (id: string) => Promise<void>;
    setStatusFilter: (status: ActionItemStatus | undefined) => void;
    resolveFollowup: (id: string, notes?: string) => Promise<void>;
    clearSelectedFollowup: () => void;
}

export const useFollowupsStore = create<FollowupsState>((set, get) => ({
    followups: [],
    selectedFollowup: null,
    isLoading: false,
    isRefreshing: false,
    isLoadingMore: false,
    isLoadingDetail: false,
    error: null,
    hasMore: true,
    page: 0,
    statusFilter: undefined,

    fetchFollowups: async (reset = false) => {
        const { statusFilter, page } = get();

        if (reset) {
            set({ isLoading: true, page: 0, followups: [], error: null });
        } else {
            set({ isLoading: true, error: null });
        }

        try {
            const currentPage = reset ? 0 : page;
            const response = await api.getFollowups({
                status_filter: statusFilter,
                skip: currentPage * 10,
                limit: 10,
            });

            set({
                followups: reset ? response.data : [...get().followups, ...response.data],
                hasMore: response.has_more,
                page: currentPage + 1,
                isLoading: false,
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to fetch follow-ups';
            set({ error: message, isLoading: false });
        }
    },

    refreshFollowups: async () => {
        const { statusFilter } = get();
        set({ isRefreshing: true });

        try {
            const response = await api.getFollowups({
                status_filter: statusFilter,
                skip: 0,
                limit: 10,
            });

            set({
                followups: response.data,
                hasMore: response.has_more,
                page: 1,
                isRefreshing: false,
            });
        } catch (error) {
            set({ isRefreshing: false });
        }
    },

    loadMoreFollowups: async () => {
        const { hasMore, isLoadingMore, statusFilter, page, followups } = get();

        if (!hasMore || isLoadingMore) return;

        set({ isLoadingMore: true });

        try {
            const response = await api.getFollowups({
                status_filter: statusFilter,
                skip: page * 10,
                limit: 10,
            });

            set({
                followups: [...followups, ...response.data],
                hasMore: response.has_more,
                page: page + 1,
                isLoadingMore: false,
            });
        } catch (error) {
            set({ isLoadingMore: false });
        }
    },

    fetchFollowup: async (id: string) => {
        // Since we don't have a specific GET /followups/{id}, 
        // we use the general getActionItem but verify it's a follow_up
        set({ isLoadingDetail: true, error: null });

        try {
            const actionItem = await api.getActionItem(id);
            if (actionItem.type !== 'follow_up') {
                throw new Error('This item is not a follow-up');
            }
            set({ selectedFollowup: actionItem, isLoadingDetail: false });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to fetch follow-up';
            set({ error: message, isLoadingDetail: false });
        }
    },

    setStatusFilter: (status) => {
        set({ statusFilter: status });
        get().fetchFollowups(true);
    },

    resolveFollowup: async (id: string, notes?: string) => {
        try {
            await api.resolveFollowup(id, notes);

            // Update local state
            set((state) => ({
                followups: state.followups.map((f) =>
                    f._id === id ? { ...f, status: 'completed' as ActionItemStatus } : f
                ),
                selectedFollowup:
                    state.selectedFollowup?._id === id
                        ? { ...state.selectedFollowup, status: 'completed' as ActionItemStatus }
                        : state.selectedFollowup,
            }));
        } catch (error) {
            throw error;
        }
    },

    clearSelectedFollowup: () => {
        set({ selectedFollowup: null });
    },
}));

export default useFollowupsStore;
