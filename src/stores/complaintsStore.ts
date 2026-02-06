import { create } from 'zustand';
import { Complaint, ComplaintStatus, SeverityLevel, ComplaintsFilter, ResolveComplaintRequest, ComplaintWithActions } from '../lib/types';
import { api } from '../lib/api';

interface ComplaintsState {
  complaints: ComplaintWithActions[];
  selectedComplaint: ComplaintWithActions | null;
  originalStates: Map<string, ComplaintWithActions>;
  isLoading: boolean;
  isRefreshing: boolean;
  isLoadingMore: boolean;
  isLoadingDetail: boolean;
  error: string | null;
  hasMore: boolean;
  page: number;
  filters: {
    status?: ComplaintStatus;
    severity?: SeverityLevel;
  };

  // Actions
  fetchComplaints: (reset?: boolean) => Promise<void>;
  refreshComplaints: () => Promise<void>;
  loadMoreComplaints: () => Promise<void>;
  fetchComplaint: (id: string) => Promise<void>;
  scanCall: (callId: string) => Promise<void>;
  setSelectedComplaint: (data: ComplaintWithActions) => void;
  setFilters: (filters: { status?: ComplaintStatus; severity?: SeverityLevel }) => void;
  updateComplaintStatus: (id: string, status: ComplaintStatus) => Promise<any>;
  addNote: (id: string, content: string) => Promise<any>;
  resolveComplaint: (id: string, data: ResolveComplaintRequest) => Promise<any>;
  updateComplaintOptimistic: (data: ComplaintWithActions) => void;
  saveOriginalState: (id: string) => void;
  revertOptimisticUpdate: (id: string) => void;
  confirmOptimisticUpdate: (id: string) => void;
  clearSelectedComplaint: () => void;
}

export const useComplaintsStore = create<ComplaintsState>((set, get) => ({
  complaints: [],
  selectedComplaint: null,
  originalStates: new Map(),
  isLoading: false,
  isRefreshing: false,
  isLoadingMore: false,
  isLoadingDetail: false,
  error: null,
  hasMore: true,
  page: 1,
  filters: {},

  fetchComplaints: async (reset = false) => {
    const { filters, page } = get();

    if (reset) {
      set({ isLoading: true, page: 1, complaints: [], error: null });
    } else {
      set({ isLoading: true, error: null });
    }

    try {
      const currentPage = reset ? 1 : page;
      const response = await api.getComplaints({
        ...filters,
        page: currentPage,
        limit: 10,
      });

      set({
        complaints: reset ? response.data : [...get().complaints, ...response.data],
        hasMore: response.has_more,
        page: currentPage,
        isLoading: false,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch complaints';
      set({ error: message, isLoading: false });
    }
  },

  refreshComplaints: async () => {
    const { filters } = get();
    set({ isRefreshing: true });

    try {
      const response = await api.getComplaints({
        ...filters,
        page: 1,
        limit: 10,
      });

      set({
        complaints: response.data,
        hasMore: response.has_more,
        page: 1,
        isRefreshing: false,
      });
    } catch (error) {
      set({ isRefreshing: false });
    }
  },

  loadMoreComplaints: async () => {
    const { hasMore, isLoadingMore, filters, page, complaints } = get();

    if (!hasMore || isLoadingMore) return;

    set({ isLoadingMore: true });

    try {
      const nextPage = page + 1;
      const response = await api.getComplaints({
        ...filters,
        page: nextPage,
        limit: 10,
      });

      set({
        complaints: [...complaints, ...response.data],
        hasMore: response.has_more,
        page: nextPage,
        isLoadingMore: false,
      });
    } catch (error) {
      set({ isLoadingMore: false });
    }
  },

  fetchComplaint: async (id: string) => {
    set({ isLoadingDetail: true, error: null });

    try {
      const data = await api.getComplaint(id);
      // Backend returns ComplaintWithActions for single complaint as well if updated
      // But let's handle both if possible. Usually detail returns the combined object now.
      set({ selectedComplaint: data as any, isLoadingDetail: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch complaint';
      set({ error: message, isLoadingDetail: false });
    }
  },

  scanCall: async (callId: string) => {
    set({ isLoadingDetail: true, error: null });

    try {
      const data = await api.scanCall(callId);
      set({ selectedComplaint: data, isLoadingDetail: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to scan call';
      set({ error: message, isLoadingDetail: false });
    }
  },

  setSelectedComplaint: (data: ComplaintWithActions) => {
    set({ selectedComplaint: data });
  },

  setFilters: (filters) => {
    set({ filters });
    get().fetchComplaints(true);
  },

  updateComplaintStatus: async (id: string, status: ComplaintStatus) => {
    try {
      const complaint = await api.updateComplaint(id, { status });
      // We need to fetch combined data or update optimistic carefully
      // For now, let's just refresh the details or list
      get().fetchComplaints(true);
      return complaint;
    } catch (error) {
      throw error;
    }
  },

  addNote: async (id: string, content: string) => {
    try {
      const complaint = await api.addComplaintNote(id, { content });
      get().fetchComplaints(true);
      return complaint;
    } catch (error) {
      throw error;
    }
  },

  resolveComplaint: async (id: string, data: ResolveComplaintRequest) => {
    try {
      const complaint = await api.resolveComplaint(id, data);
      get().fetchComplaints(true);
      return complaint;
    } catch (error) {
      throw error;
    }
  },

  updateComplaintOptimistic: (data: ComplaintWithActions) => {
    set((state) => ({
      complaints: state.complaints.map((c) =>
        c.complaint._id === data.complaint._id ? data : c
      ),
      selectedComplaint:
        state.selectedComplaint?.complaint._id === data.complaint._id
          ? data
          : state.selectedComplaint,
    }));
  },

  saveOriginalState: (id: string) => {
    const { complaints, selectedComplaint, originalStates } = get();

    // Don't save if already saved
    if (originalStates.has(id)) return;

    // Find the complaint
    const data = complaints.find((c) => c.complaint._id === id) ||
      (selectedComplaint?.complaint._id === id ? selectedComplaint : null);

    if (data) {
      originalStates.set(id, { ...data });
      set({ originalStates: new Map(originalStates) });
    }
  },

  revertOptimisticUpdate: (id: string) => {
    const { complaints, selectedComplaint, originalStates } = get();
    const original = originalStates.get(id);

    if (original) {
      set({
        complaints: complaints.map((c) =>
          c.complaint._id === id ? original : c
        ),
        selectedComplaint: selectedComplaint?.complaint._id === id ? original : selectedComplaint,
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

  clearSelectedComplaint: () => {
    set({ selectedComplaint: null });
  },
}));

export default useComplaintsStore;
