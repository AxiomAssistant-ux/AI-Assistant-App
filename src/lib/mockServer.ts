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
  ComplaintNote,
  DashboardResponse,
  AnalyticsResponse,
  ResolveComplaintRequest,
} from './types';
import {
  mockOrganization,
  mockUsers,
  mockComplaints,
  mockActionItems,
  mockNotifications,
  findUserByCredentials,
} from './mockData';

// ============================================
// MOCK SERVER CONFIGURATION
// ============================================

const MIN_LATENCY = 300;
const MAX_LATENCY = 800;
const ERROR_RATE = 0.05; // 5% chance of error

// Mutable copies of data for state changes
let complaints = [...mockComplaints];
let actionItems = [...mockActionItems];
let notifications = [...mockNotifications];
let currentUserId: string | null = null;

// ============================================
// UTILITIES
// ============================================

const simulateLatency = (): Promise<void> => {
  const latency = Math.random() * (MAX_LATENCY - MIN_LATENCY) + MIN_LATENCY;
  return new Promise(resolve => setTimeout(resolve, latency));
};

const shouldError = (): boolean => {
  return Math.random() < ERROR_RATE;
};

const generateId = (): string => {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// ============================================
// AUTH ENDPOINTS
// ============================================

export const mockLogin = async (data: LoginRequest): Promise<LoginResponse> => {
  await simulateLatency();

  if (shouldError()) {
    throw new Error('Network error. Please try again.');
  }

  const user = findUserByCredentials(data.email, data.password);

  if (!user) {
    throw new Error('Invalid email or password');
  }

  currentUserId = user._id;

  return {
    token: `mock_token_${user._id}_${Date.now()}`,
    user,
    organization: mockOrganization,
  };
};

export const mockGetMe = async (): Promise<MeResponse> => {
  await simulateLatency();

  if (shouldError()) {
    throw new Error('Network error. Please try again.');
  }

  const user = mockUsers.find(u => u._id === currentUserId) || mockUsers[0];
  currentUserId = user._id;

  return {
    user,
    organization: mockOrganization,
  };
};

// ============================================
// URGENT ENDPOINTS
// ============================================

export const mockGetUrgent = async (): Promise<UrgentResponse> => {
  await simulateLatency();

  if (shouldError()) {
    throw new Error('Failed to fetch urgent items');
  }

  const urgentComplaints = complaints.filter(
    c => (c.complaint_severity === 'high' || c.complaint_severity === 'critical') &&
         (c.status === 'pending' || c.status === 'in_progress')
  );

  const urgentActions = actionItems.filter(
    a => (a.urgency === 'high' || a.urgency === 'critical') &&
         (a.status === 'pending' || a.status === 'in_progress')
  );

  return {
    complaints: urgentComplaints,
    action_items: urgentActions,
  };
};

// ============================================
// COMPLAINTS ENDPOINTS
// ============================================

export const mockGetComplaints = async (
  filters: ComplaintsFilter = {}
): Promise<PaginatedResponse<Complaint>> => {
  await simulateLatency();

  if (shouldError()) {
    throw new Error('Failed to fetch complaints');
  }

  let filtered = [...complaints];

  if (filters.status) {
    filtered = filtered.filter(c => c.status === filters.status);
  }

  if (filters.severity) {
    filtered = filtered.filter(c => c.complaint_severity === filters.severity);
  }

  // Sort by created_at descending
  filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const page = filters.page || 1;
  const limit = filters.limit || 10;
  const start = (page - 1) * limit;
  const end = start + limit;
  const paginatedData = filtered.slice(start, end);

  return {
    data: paginatedData,
    total: filtered.length,
    page,
    limit,
    has_more: end < filtered.length,
  };
};

export const mockGetComplaint = async (id: string): Promise<Complaint> => {
  await simulateLatency();

  if (shouldError()) {
    throw new Error('Failed to fetch complaint');
  }

  const complaint = complaints.find(c => c._id === id);

  if (!complaint) {
    throw new Error('Complaint not found');
  }

  return complaint;
};

export const mockUpdateComplaint = async (
  id: string,
  data: UpdateComplaintRequest
): Promise<Complaint> => {
  await simulateLatency();

  if (shouldError()) {
    throw new Error('Failed to update complaint');
  }

  const index = complaints.findIndex(c => c._id === id);

  if (index === -1) {
    throw new Error('Complaint not found');
  }

  complaints[index] = {
    ...complaints[index],
    ...data,
    updated_at: new Date().toISOString(),
  };

  return complaints[index];
};

export const mockAssignComplaintToMe = async (id: string): Promise<Complaint> => {
  await simulateLatency();

  if (shouldError()) {
    throw new Error('Failed to assign complaint');
  }

  const index = complaints.findIndex(c => c._id === id);

  if (index === -1) {
    throw new Error('Complaint not found');
  }

  const user = mockUsers.find(u => u._id === currentUserId) || mockUsers[0];

  // Add assignment note
  const newNote: ComplaintNote = {
    _id: generateId(),
    user_id: user._id,
    user_name: user.name,
    content: `Assigned to ${user.name}`,
    created_at: new Date().toISOString(),
  };

  complaints[index] = {
    ...complaints[index],
    notes: [...complaints[index].notes, newNote],
    updated_at: new Date().toISOString(),
  };

  return complaints[index];
};

export const mockAddComplaintNote = async (
  id: string,
  data: AddNoteRequest
): Promise<Complaint> => {
  await simulateLatency();

  if (shouldError()) {
    throw new Error('Failed to add note');
  }

  const index = complaints.findIndex(c => c._id === id);

  if (index === -1) {
    throw new Error('Complaint not found');
  }

  const user = mockUsers.find(u => u._id === currentUserId) || mockUsers[0];

  const newNote: ComplaintNote = {
    _id: generateId(),
    user_id: user._id,
    user_name: user.name,
    content: data.content,
    created_at: new Date().toISOString(),
  };

  complaints[index] = {
    ...complaints[index],
    notes: [...complaints[index].notes, newNote],
    updated_at: new Date().toISOString(),
  };

  return complaints[index];
};

export const mockResolveComplaint = async (
  id: string,
  data: ResolveComplaintRequest
): Promise<Complaint> => {
  await simulateLatency();

  if (shouldError()) {
    throw new Error('Failed to resolve complaint');
  }

  const index = complaints.findIndex(c => c._id === id);

  if (index === -1) {
    throw new Error('Complaint not found');
  }

  if (complaints[index].status === 'resolved') {
    throw new Error('Complaint is already resolved');
  }

  const user = mockUsers.find(u => u._id === currentUserId) || mockUsers[0];
  const now = new Date().toISOString();

  // Add resolution note
  const resolutionNote: ComplaintNote = {
    _id: generateId(),
    user_id: user._id,
    user_name: user.name,
    content: `Complaint resolved. Compensation: ${data.compensation}${data.resolution_notes ? `. Notes: ${data.resolution_notes}` : ''}`,
    created_at: now,
  };

  complaints[index] = {
    ...complaints[index],
    status: 'resolved',
    compensation: data.compensation,
    resolution_notes: data.resolution_notes,
    resolved_at: now,
    resolved_by: user.name,
    notes: [...complaints[index].notes, resolutionNote],
    updated_at: now,
  };

  return complaints[index];
};

// ============================================
// ACTION ITEMS ENDPOINTS
// ============================================

export const mockGetActionItems = async (
  filters: ActionItemsFilter = {}
): Promise<PaginatedResponse<ActionItem>> => {
  await simulateLatency();

  if (shouldError()) {
    throw new Error('Failed to fetch action items');
  }

  let filtered = [...actionItems];

  if (filters.status) {
    filtered = filtered.filter(a => a.status === filters.status);
  }

  if (filters.urgency) {
    filtered = filtered.filter(a => a.urgency === filters.urgency);
  }

  if (filters.type) {
    filtered = filtered.filter(a => a.type === filters.type);
  }

  // Sort by due_at ascending
  filtered.sort((a, b) => new Date(a.due_at).getTime() - new Date(b.due_at).getTime());

  const page = filters.page || 1;
  const limit = filters.limit || 10;
  const start = (page - 1) * limit;
  const end = start + limit;
  const paginatedData = filtered.slice(start, end);

  return {
    data: paginatedData,
    total: filtered.length,
    page,
    limit,
    has_more: end < filtered.length,
  };
};

export const mockGetActionItem = async (id: string): Promise<ActionItem> => {
  await simulateLatency();

  if (shouldError()) {
    throw new Error('Failed to fetch action item');
  }

  const item = actionItems.find(a => a._id === id);

  if (!item) {
    throw new Error('Action item not found');
  }

  return item;
};

export const mockUpdateActionItem = async (
  id: string,
  data: UpdateActionItemRequest
): Promise<ActionItem> => {
  await simulateLatency();

  if (shouldError()) {
    throw new Error('Failed to update action item');
  }

  const index = actionItems.findIndex(a => a._id === id);

  if (index === -1) {
    throw new Error('Action item not found');
  }

  actionItems[index] = {
    ...actionItems[index],
    ...data,
    updated_at: new Date().toISOString(),
  };

  return actionItems[index];
};

export const mockAssignActionItemToMe = async (id: string): Promise<ActionItem> => {
  await simulateLatency();

  if (shouldError()) {
    throw new Error('Failed to assign action item');
  }

  const index = actionItems.findIndex(a => a._id === id);

  if (index === -1) {
    throw new Error('Action item not found');
  }

  const user = mockUsers.find(u => u._id === currentUserId) || mockUsers[0];

  actionItems[index] = {
    ...actionItems[index],
    assigned_to_user_id: user._id,
    updated_at: new Date().toISOString(),
  };

  return actionItems[index];
};

// ============================================
// NOTIFICATIONS ENDPOINTS
// ============================================

export const mockGetNotifications = async (): Promise<Notification[]> => {
  await simulateLatency();

  if (shouldError()) {
    throw new Error('Failed to fetch notifications');
  }

  return notifications.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
};

export const mockMarkNotificationRead = async (id: string): Promise<Notification> => {
  await simulateLatency();

  const index = notifications.findIndex(n => n._id === id);

  if (index === -1) {
    throw new Error('Notification not found');
  }

  notifications[index] = {
    ...notifications[index],
    read: true,
  };

  return notifications[index];
};

export const mockMarkAllNotificationsRead = async (): Promise<void> => {
  await simulateLatency();

  notifications = notifications.map(n => ({ ...n, read: true }));
};

// ============================================
// DEVICE REGISTRATION
// ============================================

export const mockRegisterDevice = async (): Promise<{ success: boolean }> => {
  await simulateLatency();

  return { success: true };
};

// ============================================
// DASHBOARD
// ============================================

export const mockGetDashboard = async (): Promise<DashboardResponse> => {
  await simulateLatency();

  if (shouldError()) {
    throw new Error('Failed to fetch dashboard');
  }

  const now = new Date();
  const today = now.toISOString().split('T')[0];

  // Count pending complaints
  const pendingComplaints = complaints.filter(c => c.status === 'pending').length;

  // Count urgent action items (high/critical and pending/in_progress)
  const urgentActionItems = actionItems.filter(
    a => (a.urgency === 'high' || a.urgency === 'critical') &&
         (a.status === 'pending' || a.status === 'in_progress')
  ).length;

  // Count overdue action items
  const overdueActionItems = actionItems.filter(
    a => new Date(a.due_at) < now &&
         (a.status === 'pending' || a.status === 'in_progress')
  ).length;

  // Count resolved today
  const complaintsResolvedToday = complaints.filter(
    c => c.status === 'resolved' && c.updated_at.startsWith(today)
  ).length;

  return {
    storeName: 'Metro Retail Downtown',
    storeNumber: '1042',
    todaysCalls: Math.floor(Math.random() * 50) + 20,
    pendingComplaints,
    urgentActionItems,
    overdueActionItems,
    totalCallsThisWeek: Math.floor(Math.random() * 200) + 100,
    complaintsResolvedToday,
    avgResolutionTime: '2.4h',
  };
};

// ============================================
// ANALYTICS
// ============================================

export const mockGetAnalytics = async (): Promise<AnalyticsResponse> => {
  await simulateLatency();

  if (shouldError()) {
    throw new Error('Failed to fetch analytics');
  }

  // Generate calls over time for last 7 days
  const callsOverTime = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    callsOverTime.push({
      date: date.toISOString().split('T')[0],
      count: Math.floor(Math.random() * 40) + 10,
    });
  }

  // Count complaints by status
  const pendingCount = complaints.filter(c => c.status === 'pending').length;
  const inProgressCount = complaints.filter(c => c.status === 'in_progress').length;
  const resolvedCount = complaints.filter(c => c.status === 'resolved').length;

  const complaintsByStatus = [
    { status: 'pending', count: pendingCount },
    { status: 'in_progress', count: inProgressCount },
    { status: 'resolved', count: resolvedCount },
  ];

  // Count urgent action items
  const urgentActionsCount = actionItems.filter(
    a => (a.urgency === 'high' || a.urgency === 'critical') &&
         (a.status === 'pending' || a.status === 'in_progress')
  ).length;

  // Generate random trend data (between -15% and +25%)
  const callsTrend = Math.floor(Math.random() * 40) - 15;
  const complaintsTrend = Math.floor(Math.random() * 30) - 20;
  const resolutionTrend = Math.floor(Math.random() * 20) - 5;

  return {
    callsOverTime,
    complaintsByStatus,
    totalCalls: callsOverTime.reduce((sum, d) => sum + d.count, 0),
    peakHour: '2:00 PM',
    totalComplaints: complaints.length,
    urgentActionsCount,
    avgHandlingTime: '4.2 min',
    resolutionRate: Math.floor((resolvedCount / complaints.length) * 100) || 72,
    callsTrend,
    complaintsTrend,
    resolutionTrend,
  };
};

// ============================================
// RESET FUNCTION (for testing)
// ============================================

export const resetMockData = (): void => {
  complaints = [...mockComplaints];
  actionItems = [...mockActionItems];
  notifications = [...mockNotifications];
  currentUserId = null;
};

export const setCurrentUserId = (userId: string): void => {
  currentUserId = userId;
};
