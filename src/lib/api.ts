import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { config } from './config';
import { storage } from './storage';
import {
  LoginRequest,
  LoginResponse,
  MeResponse,
  UrgentResponse,
  PaginatedResponse,
  Complaint,
  ActionItem,
  Notification,
  ComplaintsFilter,
  ActionItemsFilter,
  UpdateComplaintRequest,
  UpdateActionItemRequest,
  AddNoteRequest,
  RegisterDeviceRequest,
  DashboardResponse,
  AnalyticsResponse,
  ResolveComplaintRequest,
} from './types';
import * as mockServer from './mockServer';

// ============================================
// AXIOS INSTANCE
// ============================================

const axiosInstance: AxiosInstance = axios.create({
  baseURL: config.API_BASE_URL,
  timeout: config.REQUEST_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token and logging
axiosInstance.interceptors.request.use(
  async (requestConfig: InternalAxiosRequestConfig) => {
    const token = await storage.getToken();
    if (token && requestConfig.headers) {
      requestConfig.headers.Authorization = `Bearer ${token}`;
    }

    // Development logging
    if (__DEV__) {
      console.log('📤 API Request:', {
        method: requestConfig.method?.toUpperCase(),
        url: requestConfig.url,
        params: requestConfig.params,
        data: requestConfig.data,
      });
    }

    return requestConfig;
  },
  (error: AxiosError) => {
    if (__DEV__) {
      console.error('❌ Request Error:', error);
    }
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors and logging
axiosInstance.interceptors.response.use(
  (response) => {
    // Development logging
    if (__DEV__) {
      console.log('📥 API Response:', {
        url: response.config.url,
        status: response.status,
        data: response.data,
      });
    }
    return response;
  },
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear storage
      await storage.removeToken();
    }

    // Development logging
    if (__DEV__) {
      console.error('❌ Response Error:', {
        url: error.config?.url,
        status: error.response?.status,
        data: error.response?.data,
      });
    }

    // Extract error message - support both 'message' and 'detail' fields
    const errorData = error.response?.data as any;
    const message =
      errorData?.message ||
      errorData?.detail ||
      error.message ||
      'An error occurred';

    return Promise.reject(new Error(message));
  }
);

// ============================================
// API FUNCTIONS
// ============================================

export const api = {
  // ==========================================
  // AUTH
  // ==========================================
  async login(data: LoginRequest): Promise<LoginResponse> {
    if (config.USE_MOCK) {
      return mockServer.mockLogin(data);
    }
    const response = await axiosInstance.post<LoginResponse>('/auth/org/login', data);

    // Validate store account
    if (!response.data.user.is_store_account) {
      throw new Error('This account is not authorized for mobile access');
    }

    if (!response.data.user.store_location_id) {
      throw new Error('No store location assigned to this account');
    }

    return response.data;
  },

  async getMe(): Promise<MeResponse> {
    if (config.USE_MOCK) {
      return mockServer.mockGetMe();
    }
    const response = await axiosInstance.get<MeResponse>('/me');
    return response.data;
  },

  // ==========================================
  // URGENT
  // ==========================================
  async getUrgent(): Promise<UrgentResponse> {
    if (config.USE_MOCK) {
      return mockServer.mockGetUrgent();
    }
    const response = await axiosInstance.get<UrgentResponse>('/urgent');
    return response.data;
  },

  // ==========================================
  // COMPLAINTS
  // ==========================================
  async getComplaints(filters?: ComplaintsFilter): Promise<PaginatedResponse<Complaint>> {
    if (config.USE_MOCK) {
      return mockServer.mockGetComplaints(filters);
    }
    const response = await axiosInstance.get<PaginatedResponse<Complaint>>('/complaints', {
      params: filters,
    });
    return response.data;
  },

  async getComplaint(id: string): Promise<Complaint> {
    if (config.USE_MOCK) {
      return mockServer.mockGetComplaint(id);
    }
    const response = await axiosInstance.get<Complaint>(`/complaints/${id}`);
    return response.data;
  },

  async updateComplaint(id: string, data: UpdateComplaintRequest): Promise<Complaint> {
    if (config.USE_MOCK) {
      return mockServer.mockUpdateComplaint(id, data);
    }
    const response = await axiosInstance.patch<Complaint>(`/complaints/${id}`, data);
    return response.data;
  },

  async assignComplaintToMe(id: string): Promise<Complaint> {
    if (config.USE_MOCK) {
      return mockServer.mockAssignComplaintToMe(id);
    }
    const response = await axiosInstance.post<Complaint>(`/complaints/${id}/assign-to-me`);
    return response.data;
  },

  async addComplaintNote(id: string, data: AddNoteRequest): Promise<Complaint> {
    if (config.USE_MOCK) {
      return mockServer.mockAddComplaintNote(id, data);
    }
    const response = await axiosInstance.post<Complaint>(`/complaints/${id}/notes`, data);
    return response.data;
  },

  async resolveComplaint(id: string, data: ResolveComplaintRequest): Promise<Complaint> {
    if (config.USE_MOCK) {
      return mockServer.mockResolveComplaint(id, data);
    }
    const response = await axiosInstance.post<Complaint>(`/complaints/${id}/resolve`, data);
    return response.data;
  },

  // ==========================================
  // ACTION ITEMS
  // ==========================================
  async getActionItems(filters?: ActionItemsFilter): Promise<PaginatedResponse<ActionItem>> {
    if (config.USE_MOCK) {
      return mockServer.mockGetActionItems(filters);
    }
    const response = await axiosInstance.get<PaginatedResponse<ActionItem>>('/action-items', {
      params: filters,
    });
    return response.data;
  },

  async getActionItem(id: string): Promise<ActionItem> {
    if (config.USE_MOCK) {
      return mockServer.mockGetActionItem(id);
    }
    const response = await axiosInstance.get<ActionItem>(`/action-items/${id}`);
    return response.data;
  },

  async updateActionItem(id: string, data: UpdateActionItemRequest): Promise<ActionItem> {
    if (config.USE_MOCK) {
      return mockServer.mockUpdateActionItem(id, data);
    }
    const response = await axiosInstance.patch<ActionItem>(`/action-items/${id}`, data);
    return response.data;
  },

  async assignActionItemToMe(id: string): Promise<ActionItem> {
    if (config.USE_MOCK) {
      return mockServer.mockAssignActionItemToMe(id);
    }
    const response = await axiosInstance.post<ActionItem>(`/action-items/${id}/assign-to-me`);
    return response.data;
  },

  // ==========================================
  // NOTIFICATIONS
  // ==========================================
  async getNotifications(): Promise<Notification[]> {
    if (config.USE_MOCK) {
      return mockServer.mockGetNotifications();
    }
    const response = await axiosInstance.get<Notification[]>('/notifications');
    return response.data;
  },

  async markNotificationRead(id: string): Promise<Notification> {
    if (config.USE_MOCK) {
      return mockServer.mockMarkNotificationRead(id);
    }
    const response = await axiosInstance.patch<Notification>(`/notifications/${id}/read`);
    return response.data;
  },

  async markAllNotificationsRead(): Promise<void> {
    if (config.USE_MOCK) {
      return mockServer.mockMarkAllNotificationsRead();
    }
    await axiosInstance.post('/notifications/read-all');
  },

  // ==========================================
  // DEVICE REGISTRATION
  // ==========================================
  async registerDevice(data: RegisterDeviceRequest): Promise<{ success: boolean }> {
    if (config.USE_MOCK) {
      return mockServer.mockRegisterDevice();
    }
    const response = await axiosInstance.post<{ success: boolean }>('/devices/register', data);
    return response.data;
  },

  // ==========================================
  // DASHBOARD
  // ==========================================
  async getDashboard(): Promise<DashboardResponse> {
    if (config.USE_MOCK) {
      return mockServer.mockGetDashboard();
    }

    // Backend response structure
    interface BackendDashboardResponse {
      store_info: {
        store_name: string;
        store_number: string;
        store_location: string;
      };
      today_calls: number;
      date_range: {
        start_date: string;
        end_date: string;
        days: number;
      };
      calls: {
        total: number;
        by_date: Record<string, number>;
        by_hour: Record<number, number>;
        peak_hour: number | null;
      };
      pending_counts: {
        complaints: number;
        urgent_actions: number;
        overdue_actions: number;
      };
      resolution_stats: {
        resolved_today: number;
        avg_resolution_time_hours: number;
      };
    }

    const response = await axiosInstance.get<BackendDashboardResponse>(
      '/mobile/analytics/dashboard',
      { params: { days: 7 } }
    );

    // Map backend response to frontend format
    const data = response.data;
    return {
      storeName: data.store_info.store_name,
      storeNumber: data.store_info.store_number,
      todaysCalls: data.today_calls,
      pendingComplaints: data.pending_counts.complaints,
      urgentActionItems: data.pending_counts.urgent_actions,
      overdueActionItems: data.pending_counts.overdue_actions,
      totalCallsThisWeek: data.calls.total,
      complaintsResolvedToday: data.resolution_stats.resolved_today,
      avgResolutionTime: `${Math.round(data.resolution_stats.avg_resolution_time_hours)}h`,
    };
  },

  // ==========================================
  // ANALYTICS
  // ==========================================
  async getAnalytics(days: number = 30): Promise<AnalyticsResponse> {
    if (config.USE_MOCK) {
      return mockServer.mockGetAnalytics();
    }
    const response = await axiosInstance.get<AnalyticsResponse>(
      '/mobile/analytics/full',
      { params: { days } }
    );
    return response.data;
  },
};

export default api;
