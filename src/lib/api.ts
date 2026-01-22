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

// Request interceptor - add auth token
axiosInstance.interceptors.request.use(
  async (requestConfig: InternalAxiosRequestConfig) => {
    const token = await storage.getToken();
    if (token && requestConfig.headers) {
      requestConfig.headers.Authorization = `Bearer ${token}`;
    }
    return requestConfig;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear storage
      await storage.removeToken();
    }
    return Promise.reject(error);
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
    const response = await axiosInstance.post<LoginResponse>('/auth/login', data);
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
};

export default api;
