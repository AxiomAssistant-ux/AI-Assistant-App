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
  _id: string; // Used by frontend
  id?: string;  // Returned by backend
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
  _id: string; // Used by frontend
  id?: string;  // Returned by backend
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

export interface ReplacementItem {
  item_name: string;
  size: string;
  reason: string;
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
  resolution_notes?: string;
  replacement_item?: ReplacementItem;
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
  store_location_id?: string | null;
  compensation?: string;
  resolution_notes?: string;
  resolved_at?: string;
  resolved_by?: string;
  created_at: string;
  updated_at: string;
  // Embedded summary for lists
  action_items_count?: number;
  urgent_count?: number;
}

export interface ComplaintWithActions {
  complaint: Complaint;
  action_items: ActionItem[];
  action_items_count: number;
  urgent_count: number;
  call_summary?: CallSummary;
}

export interface CallSummary {
  recording_link?: string;
  call_timing?: {
    start_time: string;
    end_time: string;
    duration: number;
  };
  summaries?: {
    short_summary: string;
    detailed_summary: string;
  };
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
  access_token?: string; // Returned by backend
  ttl?: number;
  expires_in?: number; // Returned by backend
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
  complaints: ComplaintWithActions[];
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
  complaint_id: string;
  resolution_notes: string;
  voucher_given: string;
}

export interface UpdateActionItemRequest {
  status?: ActionItemStatus;
  notes?: string;
}

export interface AddNoteRequest {
  content: string;
}

export interface RegisterDeviceRequest {
  token: string;
  platform: 'ios' | 'android';
}

export interface ScanCallRequest {
  call_id: string;
}

export interface ApiError {
  message: string;
  code: string;
  status: number;
}

// Dashboard & Analytics types
export interface DashboardResponse {
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
    by_hour: Record<string, number>;
    peak_hour: number | null;
  };
  complaints: {
    total: number;
    by_status: {
      pending: number;
      in_progress: number;
      resolved: number;
    };
    by_severity: Record<string, number>;
  };
  // Note: These exclude follow-ups
  action_items: {
    total: number;
    by_status: {
      pending: number;
      in_progress: number;
      completed: number;
    };
    urgent: number;
    overdue: number;
  };
  pending_counts: {
    complaints: number;
    action_items: number;
    urgent_actions: number;
    overdue_actions: number;
  };
  pending_followups: number;
  sla_percentage: number;
  avg_response_time?: string;
  customer_satisfaction?: string;
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
  type: 'complaint';
  item: ComplaintWithActions;
}
