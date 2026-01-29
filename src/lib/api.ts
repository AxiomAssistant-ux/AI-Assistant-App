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

// Helper to map backend 'id' to frontend '_id' if necessary
const mapId = <T extends { _id: string; id?: string }>(item: T): T => {
  if (item.id && !item._id) {
    item._id = item.id;
  }
  return item;
};

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
    const response = await axiosInstance.post<any>('/auth/org/signin', data);
    const rawData = response.data;

    // Map backend fields to frontend format
    const mappedResponse: LoginResponse = {
      token: rawData.access_token || rawData.token,
      ttl: rawData.expires_in || rawData.ttl,
      user: {
        ...rawData.user,
        _id: rawData.user.id || rawData.user._id,
      },
      organization: {
        ...rawData.organization,
        _id: rawData.organization.id || rawData.organization._id,
      },
    };

    // Validate store account
    if (!mappedResponse.user.is_store_account) {
      throw new Error('This account is not authorized for mobile access');
    }

    if (!mappedResponse.user.store_location_id) {
      throw new Error('No store location assigned to this account');
    }

    return mappedResponse;
  },

  async getMe(): Promise<MeResponse> {
    if (config.USE_MOCK) {
      return mockServer.mockGetMe();
    }
    const response = await axiosInstance.get<any>('/mobile/profile');
    const rawData = response.data;

    return {
      user: mapId({
        ...rawData.user,
        _id: rawData.user.id || rawData.user._id,
      }),
      organization: mapId({
        ...rawData.organization,
        _id: rawData.organization.id || rawData.organization._id,
      }),
    };
  },

  // ==========================================
  // URGENT
  // ==========================================
  async getUrgent(): Promise<UrgentResponse> {
    if (config.USE_MOCK) {
      return mockServer.mockGetUrgent();
    }
    const response = await axiosInstance.get<UrgentResponse>('/mobile/urgent');
    const data = response.data;

    return {
      complaints: data.complaints.map(mapId),
      action_items: data.action_items.map(mapId),
    };
  },

  // ==========================================
  // COMPLAINTS
  // ==========================================
  async getComplaints(filters?: ComplaintsFilter): Promise<PaginatedResponse<Complaint>> {
    if (config.USE_MOCK) {
      return mockServer.mockGetComplaints(filters);
    }
    const response = await axiosInstance.get<PaginatedResponse<Complaint>>('/mobile/complaints', {
      params: filters,
    });
    const data = response.data;
    return {
      ...data,
      data: data.data.map(mapId),
    };
  },

  async getComplaint(id: string): Promise<Complaint> {
    if (config.USE_MOCK) {
      return mockServer.mockGetComplaint(id);
    }
    const response = await axiosInstance.get<Complaint>(`/mobile/complaints/${id}`);
    return mapId(response.data);
  },

  async scanComplaint(complaintId: string): Promise<Complaint> {
    if (config.USE_MOCK) {
      return mockServer.mockGetComplaint(complaintId);
    }
    const response = await axiosInstance.post<Complaint>('/mobile/complaints/scan', {
      complaint_id: complaintId,
    });
    return mapId(response.data);
  },

  async updateComplaint(id: string, data: UpdateComplaintRequest): Promise<Complaint> {
    if (config.USE_MOCK) {
      return mockServer.mockUpdateComplaint(id, data);
    }
    const response = await axiosInstance.patch<Complaint>(`/mobile/complaints/${id}`, data);
    return mapId(response.data);
  },

  async assignComplaintToMe(id: string): Promise<Complaint> {
    if (config.USE_MOCK) {
      return mockServer.mockAssignComplaintToMe(id);
    }
    const response = await axiosInstance.post<Complaint>(`/mobile/complaints/${id}/mark-in-progress`);
    return mapId(response.data);
  },

  async addComplaintNote(id: string, data: AddNoteRequest): Promise<Complaint> {
    if (config.USE_MOCK) {
      return mockServer.mockAddComplaintNote(id, data);
    }
    const response = await axiosInstance.post<Complaint>(`/mobile/complaints/${id}/notes`, data);
    return response.data;
  },

  async resolveComplaint(id: string, data: ResolveComplaintRequest): Promise<Complaint> {
    if (config.USE_MOCK) {
      return mockServer.mockResolveComplaint(id, data);
    }
    const response = await axiosInstance.post<Complaint>(`/mobile/complaints/${id}/resolve`, data);
    return mapId(response.data);
  },

  // ==========================================
  // ACTION ITEMS
  // ==========================================
  async getActionItems(filters?: ActionItemsFilter): Promise<PaginatedResponse<ActionItem>> {
    if (config.USE_MOCK) {
      return mockServer.mockGetActionItems(filters);
    }
    const response = await axiosInstance.get<PaginatedResponse<ActionItem>>('/mobile/action-items', {
      params: filters,
    });
    const data = response.data;
    return {
      ...data,
      data: data.data.map(mapId),
    };
  },

  async getActionItem(id: string): Promise<ActionItem> {
    if (config.USE_MOCK) {
      return mockServer.mockGetActionItem(id);
    }
    const response = await axiosInstance.get<ActionItem>(`/mobile/action-items/${id}`);
    return mapId(response.data);
  },

  async updateActionItem(id: string, data: UpdateActionItemRequest): Promise<ActionItem> {
    if (config.USE_MOCK) {
      return mockServer.mockUpdateActionItem(id, data);
    }
    const response = await axiosInstance.patch<ActionItem>(`/mobile/action-items/${id}/status`, data);
    return mapId(response.data);
  },

  async assignActionItemToMe(id: string): Promise<ActionItem> {
    if (config.USE_MOCK) {
      return mockServer.mockAssignActionItemToMe(id);
    }
    const response = await axiosInstance.post<ActionItem>(`/mobile/action-items/${id}/assign-to-me`);
    return mapId(response.data);
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
    const response = await axiosInstance.post<{ success: boolean }>('/mobile/devices/register', data);
    return response.data;
  },

  async unregisterDevice(): Promise<{ success: boolean }> {
    if (config.USE_MOCK) {
      return { success: true };
    }
    const response = await axiosInstance.post<{ success: boolean }>('/mobile/devices/unregister');
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

  async getAnalyticsCallsTimeline(days: number = 7): Promise<any> {
    if (config.USE_MOCK) {
      return { calls: [] }; // Mock if needed
    }
    const response = await axiosInstance.get<any>(
      '/mobile/analytics/calls-timeline',
      { params: { days } }
    );
    return response.data;
  },
};

export default api;
