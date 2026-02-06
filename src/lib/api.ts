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
  ComplaintWithActions,
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
      complaints: (data.complaints || []).map(item => ({
        ...item,
        complaint: mapId(item.complaint),
        action_items: (item.action_items || []).map(mapId)
      })),
    };
  },

  // ==========================================
  // COMPLAINTS
  // ==========================================
  async getComplaints(filters?: ComplaintsFilter): Promise<PaginatedResponse<any>> {
    if (config.USE_MOCK) {
      return mockServer.mockGetComplaints(filters);
    }
    // Convert page to skip for backend API
    const params: Record<string, any> = { ...filters };
    if (params.page !== undefined) {
      params.skip = ((params.page - 1) * (params.limit || 10));
      delete params.page;
    }
    const response = await axiosInstance.get<PaginatedResponse<any>>('/mobile/complaints', {
      params,
    });
    const data = response.data;
    return {
      ...data,
      data: (data.data || []).map((item: any) => ({
        ...item,
        complaint: mapId(item.complaint),
        action_items: (item.action_items || []).map(mapId),
        action_items_count: item.action_items_count ?? 0,
        urgent_count: item.urgent_count ?? 0,
      })),
    };
  },

  async getComplaint(id: string): Promise<ComplaintWithActions> {
    if (config.USE_MOCK) {
      return mockServer.mockGetComplaint(id) as any;
    }
    const response = await axiosInstance.get<any>(`/mobile/complaints/${id}`);
    const data = response.data;

    // Support both wrapped and unwrapped (for robustness)
    const result = data.complaint ? data : { complaint: data };

    return {
      complaint: mapId(result.complaint),
      action_items: (result.action_items || []).map(mapId),
      call_summary: result.call_summary,
      action_items_count: result.action_items_count ?? (result.action_items?.length || 0),
      urgent_count: result.urgent_count ?? 0
    };
  },

  async scanCall(callId: string): Promise<ComplaintWithActions> {
    if (config.USE_MOCK) {
      return mockServer.mockGetComplaint(callId) as any;
    }
    const response = await axiosInstance.post<any>('/mobile/complaints/scan', {
      call_id: callId,
    });
    const data = response.data;
    return {
      complaint: mapId(data.complaint),
      action_items: (data.action_items || []).map(mapId),
      call_summary: data.call_summary,
      action_items_count: data.action_items_count ?? (data.action_items?.length || 0),
      urgent_count: data.urgent_count ?? 0
    };
  },

  async updateComplaint(id: string, data: UpdateComplaintRequest): Promise<Complaint> {
    if (config.USE_MOCK) {
      return mockServer.mockUpdateComplaint(id, data);
    }
    const response = await axiosInstance.patch<Complaint>(`/mobile/complaints/${id}`, data);
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
    // Convert page to skip for backend API
    const params: Record<string, any> = { ...filters };
    if (params.page !== undefined) {
      params.skip = ((params.page - 1) * (params.limit || 10));
      delete params.page;
    }
    const response = await axiosInstance.get<PaginatedResponse<ActionItem>>('/mobile/action-items', {
      params,
    });
    const data = response.data;
    return {
      ...data,
      data: (data.data || []).map(mapId),
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

  // ==========================================
  // FOLLOW-UPS
  // ==========================================
  async getFollowups(filters?: any): Promise<PaginatedResponse<ActionItem>> {
    // Convert page to skip for backend API
    const params: Record<string, any> = { ...filters };
    if (params.page !== undefined) {
      params.skip = ((params.page - 1) * (params.limit || 10));
      delete params.page;
    }
    const response = await axiosInstance.get<PaginatedResponse<ActionItem>>('/mobile/followups', {
      params,
    });
    const data = response.data;
    return {
      ...data,
      data: (data.data || []).map(mapId),
    };
  },

  async resolveFollowup(id: string, notes?: string): Promise<{ message: string; status: string }> {
    const response = await axiosInstance.post<any>(`/mobile/followups/${id}/resolve`, {
      notes,
    });
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
    return (response.data || []).map(mapId);
  },

  async markNotificationRead(id: string): Promise<Notification> {
    if (config.USE_MOCK) {
      return mockServer.mockMarkNotificationRead(id);
    }
    const response = await axiosInstance.patch<Notification>(`/notifications/${id}/read`);
    return mapId(response.data);
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

    const response = await axiosInstance.get<DashboardResponse>(
      '/mobile/analytics/dashboard',
      { params: { days: 7 } }
    );

    return response.data;
  },

  // ==========================================
  // ANALYTICS
  // ==========================================
  async getAnalytics(range: string = 'month'): Promise<AnalyticsResponse> {
    if (config.USE_MOCK) {
      return mockServer.mockGetAnalytics();
    }
    const response = await axiosInstance.get<AnalyticsResponse>('/mobile/analytics/full', {
      params: { range_type: range }
    });
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
