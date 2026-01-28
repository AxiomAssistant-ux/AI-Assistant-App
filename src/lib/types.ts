// ============================================
// ENUMS
// ============================================

export type ActionItemType = 'appointment' | 'order' | 'incident' | 'follow_up' | 'task';
export type UrgencyLevel = 'low' | 'medium' | 'high' | 'critical';
export type ActionItemStatus = 'pending' | 'in_progress' | 'completed' | 'dismissed';
export type ComplaintStatus = 'pending' | 'in_progress' | 'resolved';
export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';
export type OrgStatus = 'active' | 'inactive' | 'suspended';
export type UserStatus = 'active' | 'inactive' | 'pending';

// ============================================
// DATA MODELS
// ============================================

export interface Organization {
  _id: string;
  company_name: string;
  logo_url: string;
  color_scheme: {
    primary: string;
    secondary: string;
    accent: string;
  };
  status: OrgStatus;
}

export interface OrgUser {
  _id: string;
  email: string;
  name: string;
  hashed_password: string;
  org_id: string;
  status: UserStatus;
  is_admin: boolean;
  is_store_account: boolean;
  store_location_id: string | null;
  role_name: string;
  avatar_url?: string;
}

export interface Customer {
  name: string;
  phone: string;
  email?: string;
}

export interface Store {
  name: string;
  address: string;
  phone?: string;
}

export interface ActionItem {
  _id: string;
  org_id: string;
  call_id: string;
  type: ActionItemType;
  title: string;
  description: string;
  urgency: UrgencyLevel;
  status: ActionItemStatus;
  assigned_to_user_id: string | null;
  assigned_role: string | null;
  due_at: string;
  created_at: string;
  updated_at: string;
}

export interface Complaint {
  _id: string;
  org_id: string;
  call_log_id: string;
  customer: Customer;
  store: Store;
  complaint_type: string;
  complaint_description: string;
  complaint_severity: SeverityLevel;
  status: ComplaintStatus;
  notes: ComplaintNote[];
  qr_code?: string | null;
  compensation?: string;
  resolution_notes?: string;
  resolved_at?: string;
  resolved_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ComplaintNote {
  _id: string;
  user_id: string;
  user_name: string;
  content: string;
  created_at: string;
}

export interface Notification {
  _id: string;
  org_id: string;
  user_id: string;
  type: 'urgent_complaint' | 'urgent_action' | 'assignment' | 'status_change' | 'reminder';
  title: string;
  body: string;
  data: {
    entity_type: 'complaint' | 'action_item';
    entity_id: string;
  };
  read: boolean;
  created_at: string;
}

// ============================================
// API TYPES
// ============================================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  ttl: number;
  user: OrgUser;
  organization: Organization;
}

export interface MeResponse {
  user: OrgUser;
  organization: Organization;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
}

export interface UrgentResponse {
  complaints: Complaint[];
  action_items: ActionItem[];
}

export interface ComplaintsFilter {
  status?: ComplaintStatus;
  severity?: SeverityLevel;
  page?: number;
  limit?: number;
}

export interface ActionItemsFilter {
  status?: ActionItemStatus;
  urgency?: UrgencyLevel;
  type?: ActionItemType;
  page?: number;
  limit?: number;
}

export interface UpdateComplaintRequest {
  status?: ComplaintStatus;
}

export interface ResolveComplaintRequest {
  compensation: string;
  resolution_notes?: string;
}

export interface UpdateActionItemRequest {
  status?: ActionItemStatus;
}

export interface AddNoteRequest {
  content: string;
}

export interface RegisterDeviceRequest {
  token: string;
  platform: 'ios' | 'android';
}

export interface ApiError {
  message: string;
  code: string;
  status: number;
}

// Dashboard & Analytics types
export interface DashboardResponse {
  storeName: string;
  storeNumber: string;
  todaysCalls: number;
  pendingComplaints: number;
  urgentActionItems: number;
  overdueActionItems: number;
  totalCallsThisWeek: number;
  complaintsResolvedToday: number;
  avgResolutionTime: string;
}

export interface AnalyticsResponse {
  callsOverTime: { date: string; count: number }[];
  complaintsByStatus: { status: string; count: number }[];
  totalCalls: number;
  peakHour: string;
  totalComplaints: number;
  urgentActionsCount: number;
  avgHandlingTime: string;
  resolutionRate: number;
  callsTrend?: number;
  complaintsTrend?: number;
  resolutionTrend?: number;
}

// ============================================
// UI TYPES
// ============================================

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

export interface UrgentItem {
  type: 'complaint' | 'action_item';
  item: Complaint | ActionItem;
}
