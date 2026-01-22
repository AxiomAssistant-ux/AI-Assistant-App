import { create } from 'zustand';
import { Complaint, ComplaintStatus, SeverityLevel, ComplaintsFilter } from '../lib/types';
import { api } from '../lib/api';

interface ComplaintsState {
  complaints: Complaint[];
  selectedComplaint: Complaint | null;
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
  setFilters: (filters: { status?: ComplaintStatus; severity?: SeverityLevel }) => void;
  updateComplaintStatus: (id: string, status: ComplaintStatus) => Promise<Complaint>;
  assignComplaintToMe: (id: string) => Promise<Complaint>;
  addNote: (id: string, content: string) => Promise<Complaint>;
  updateComplaintOptimistic: (complaint: Complaint) => void;
  clearSelectedComplaint: () => void;
}

export const useComplaintsStore = create<ComplaintsState>((set, get) => ({
  complaints: [],
  selectedComplaint: null,
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
      const complaint = await api.getComplaint(id);
      set({ selectedComplaint: complaint, isLoadingDetail: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch complaint';
      set({ error: message, isLoadingDetail: false });
    }
  },

  setFilters: (filters) => {
    set({ filters });
    get().fetchComplaints(true);
  },

  updateComplaintStatus: async (id: string, status: ComplaintStatus) => {
    try {
      const complaint = await api.updateComplaint(id, { status });
      get().updateComplaintOptimistic(complaint);
      return complaint;
    } catch (error) {
      throw error;
    }
  },

  assignComplaintToMe: async (id: string) => {
    try {
      const complaint = await api.assignComplaintToMe(id);
      get().updateComplaintOptimistic(complaint);
      return complaint;
    } catch (error) {
      throw error;
    }
  },

  addNote: async (id: string, content: string) => {
    try {
      const complaint = await api.addComplaintNote(id, { content });
      get().updateComplaintOptimistic(complaint);
      return complaint;
    } catch (error) {
      throw error;
    }
  },

  updateComplaintOptimistic: (complaint: Complaint) => {
    set((state) => ({
      complaints: state.complaints.map((c) =>
        c._id === complaint._id ? complaint : c
      ),
      selectedComplaint:
        state.selectedComplaint?._id === complaint._id
          ? complaint
          : state.selectedComplaint,
    }));
  },

  clearSelectedComplaint: () => {
    set({ selectedComplaint: null });
  },
}));

export default useComplaintsStore;
