import {
  Organization,
  OrgUser,
  Complaint,
  ActionItem,
  Notification,
} from './types';

// ============================================
// ORGANIZATION
// ============================================

export const mockOrganization: Organization = {
  _id: 'org_001',
  company_name: "McDonald's",
  logo_url: 'https://ui-avatars.com/api/?name=McDonalds&background=DA291C&color=FFC72C&size=128',
  color_scheme: {
    primary: '#DA291C',
    secondary: '#FFC72C',
    accent: '#FFC72C',
  },
  status: 'active',
};

// ============================================
// USERS
// ============================================

export const mockUsers: OrgUser[] = [
  {
    _id: 'user_001',
    email: 'admin@mcdonalds.com',
    name: 'Sarah Mitchell',
    hashed_password: 'hashed_demo123',
    org_id: 'org_001',
    status: 'active',
    is_admin: true,
    is_store_account: true,
    store_location_id: 'loc_001',
    role_name: 'Store Manager',
    avatar_url: 'https://ui-avatars.com/api/?name=Sarah+Mitchell&background=DA291C&color=FFC72C',
  },
  {
    _id: 'user_002',
    email: 'staff@mcdonalds.com',
    name: 'James Rodriguez',
    hashed_password: 'hashed_demo123',
    org_id: 'org_001',
    status: 'active',
    is_admin: false,
    is_store_account: true,
    store_location_id: 'loc_001',
    role_name: 'Customer Service Rep',
    avatar_url: 'https://ui-avatars.com/api/?name=James+Rodriguez&background=10B981&color=fff',
  },
];

// ============================================
// COMPLAINTS
// ============================================

export const mockComplaints: Complaint[] = [
  {
    _id: 'MCD-QR-2024',
    org_id: 'org_001',
    call_log_id: 'call_999',
    customer: {
      name: 'Test Customer',
      phone: '+1 (555) 999-0000',
      email: 'test@mcdonalds.com',
    },
    store: {
      name: "McDonald's Times Square",
      address: '1540 Broadway, New York, NY 10036',
      phone: '+1 (212) 221-2350',
    },
    complaint_type: 'Order Accuracy',
    complaint_description: 'Test complaint for QR verification. This complaint is used to verify the scan and manual entry flow.',
    complaint_severity: 'medium',
    status: 'pending',
    notes: [],
    qr_code: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=MCD-QR-2024',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    _id: 'complaint_001',
    org_id: 'org_001',
    call_log_id: 'call_101',
    customer: {
      name: 'Michael Thompson',
      phone: '+1 (555) 234-5678',
      email: 'michael.t@email.com',
    },
    store: {
      name: "McDonald's Downtown",
      address: '123 Main Street, Suite 100',
      phone: '+1 (555) 100-2000',
    },
    complaint_type: 'Product Quality',
    complaint_description: 'Customer received a damaged electronic item. The TV screen was cracked upon delivery. Customer is extremely upset and demanding immediate replacement or full refund. This is a high-value item ($1,299).',
    complaint_severity: 'critical',
    status: 'pending',
    notes: [
      {
        _id: 'note_001',
        user_id: 'user_002',
        user_name: 'James Rodriguez',
        content: 'Initial call received. Customer provided photos of damage.',
        created_at: '2024-01-15T09:30:00Z',
      },
    ],
    created_at: '2024-01-15T09:15:00Z',
    updated_at: '2024-01-15T09:30:00Z',
  },
  {
    _id: 'complaint_002',
    org_id: 'org_001',
    call_log_id: 'call_102',
    customer: {
      name: 'Emily Chen',
      phone: '+1 (555) 345-6789',
      email: 'emily.chen@email.com',
    },
    store: {
      name: "McDonald's Westside",
      address: '456 Oak Avenue',
      phone: '+1 (555) 200-3000',
    },
    complaint_type: 'Service Issue',
    complaint_description: 'Customer waited 45 minutes for assistance in electronics department. Staff was unhelpful when finally available. Customer left without making intended purchase.',
    complaint_severity: 'high',
    status: 'in_progress',
    notes: [
      {
        _id: 'note_002',
        user_id: 'user_001',
        user_name: 'Sarah Mitchell',
        content: 'Reached out to customer. Offered 20% discount on next purchase.',
        created_at: '2024-01-14T15:00:00Z',
      },
    ],
    created_at: '2024-01-14T14:00:00Z',
    updated_at: '2024-01-14T15:00:00Z',
  },
  {
    _id: 'complaint_003',
    org_id: 'org_001',
    call_log_id: 'call_103',
    customer: {
      name: 'Robert Davis',
      phone: '+1 (555) 456-7890',
    },
    store: {
      name: "McDonald's Downtown",
      address: '123 Main Street, Suite 100',
      phone: '+1 (555) 100-2000',
    },
    complaint_type: 'Billing Error',
    complaint_description: 'Customer was charged twice for the same transaction. Amount: $156.99. Requesting immediate refund of duplicate charge.',
    complaint_severity: 'high',
    status: 'pending',
    notes: [],
    created_at: '2024-01-15T11:30:00Z',
    updated_at: '2024-01-15T11:30:00Z',
  },
  {
    _id: 'complaint_004',
    org_id: 'org_001',
    call_log_id: 'call_104',
    customer: {
      name: 'Lisa Wang',
      phone: '+1 (555) 567-8901',
      email: 'lisa.w@email.com',
    },
    store: {
      name: "McDonald's Eastside",
      address: '789 Pine Road',
      phone: '+1 (555) 300-4000',
    },
    complaint_type: 'Return Policy',
    complaint_description: 'Customer wants to return an item past the 30-day window. Item is unused with receipt. Requesting exception.',
    complaint_severity: 'medium',
    status: 'resolved',
    notes: [
      {
        _id: 'note_003',
        user_id: 'user_001',
        user_name: 'Sarah Mitchell',
        content: 'Approved exception. Return processed successfully.',
        created_at: '2024-01-13T16:30:00Z',
      },
    ],
    created_at: '2024-01-13T10:00:00Z',
    updated_at: '2024-01-13T16:30:00Z',
  },
  {
    _id: 'complaint_005',
    org_id: 'org_001',
    call_log_id: 'call_105',
    customer: {
      name: 'David Brown',
      phone: '+1 (555) 678-9012',
    },
    store: {
      name: 'Metro Westside',
      address: '456 Oak Avenue',
      phone: '+1 (555) 200-3000',
    },
    complaint_type: 'Staff Behavior',
    complaint_description: 'Customer reports rude behavior from cashier. Felt disrespected and embarrassed in front of other customers.',
    complaint_severity: 'low',
    status: 'pending',
    notes: [],
    created_at: '2024-01-15T08:00:00Z',
    updated_at: '2024-01-15T08:00:00Z',
  },
];

// ============================================
// ACTION ITEMS
// ============================================

export const mockActionItems: ActionItem[] = [
  {
    _id: 'action_001',
    org_id: 'org_001',
    call_id: 'call_201',
    type: 'incident',
    title: 'Security Incident - Downtown Store',
    description: 'Suspicious activity reported near electronics section. Security footage shows individual attempting to remove security tags. Immediate review required.',
    urgency: 'critical',
    status: 'pending',
    assigned_to_user_id: null,
    assigned_role: 'Security',
    due_at: '2024-01-15T12:00:00Z',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  },
  {
    _id: 'action_002',
    org_id: 'org_001',
    call_id: 'call_202',
    type: 'follow_up',
    title: 'VIP Customer Follow-up',
    description: 'Premium member reported dissatisfaction with recent experience. Schedule personal call to address concerns and retain membership.',
    urgency: 'high',
    status: 'in_progress',
    assigned_to_user_id: 'user_001',
    assigned_role: 'Manager',
    due_at: '2024-01-15T17:00:00Z',
    created_at: '2024-01-14T16:00:00Z',
    updated_at: '2024-01-15T09:00:00Z',
  },
  {
    _id: 'action_003',
    org_id: 'org_001',
    call_id: 'call_203',
    type: 'order',
    title: 'Expedite Order #78542',
    description: 'Customer called requesting expedited shipping for order. Event is this weekend. Need to upgrade shipping and confirm delivery by Friday.',
    urgency: 'high',
    status: 'pending',
    assigned_to_user_id: null,
    assigned_role: 'Fulfillment',
    due_at: '2024-01-15T14:00:00Z',
    created_at: '2024-01-15T08:30:00Z',
    updated_at: '2024-01-15T08:30:00Z',
  },
  {
    _id: 'action_004',
    org_id: 'org_001',
    call_id: 'call_204',
    type: 'appointment',
    title: 'Schedule Installation',
    description: 'Customer purchased large appliance. Schedule home delivery and installation for washer/dryer combo. Customer prefers morning appointments.',
    urgency: 'medium',
    status: 'pending',
    assigned_to_user_id: 'user_002',
    assigned_role: 'Customer Service',
    due_at: '2024-01-16T12:00:00Z',
    created_at: '2024-01-14T11:00:00Z',
    updated_at: '2024-01-14T11:00:00Z',
  },
  {
    _id: 'action_005',
    org_id: 'org_001',
    call_id: 'call_205',
    type: 'task',
    title: 'Update Price Tags - Aisle 7',
    description: 'Weekly price changes need to be applied to all items in Aisle 7 (home goods). New prices effective Monday.',
    urgency: 'low',
    status: 'completed',
    assigned_to_user_id: 'user_002',
    assigned_role: 'Staff',
    due_at: '2024-01-14T18:00:00Z',
    created_at: '2024-01-13T09:00:00Z',
    updated_at: '2024-01-14T16:30:00Z',
  },
];

// ============================================
// NOTIFICATIONS
// ============================================

export const mockNotifications: Notification[] = [
  {
    _id: 'notif_001',
    org_id: 'org_001',
    user_id: 'user_001',
    type: 'urgent_complaint',
    title: 'Critical Complaint Received',
    body: 'New critical complaint from Michael Thompson regarding damaged TV delivery.',
    data: {
      entity_type: 'complaint',
      entity_id: 'complaint_001',
    },
    read: false,
    created_at: '2024-01-15T09:16:00Z',
  },
  {
    _id: 'notif_002',
    org_id: 'org_001',
    user_id: 'user_001',
    type: 'urgent_action',
    title: 'Security Incident Alert',
    body: 'Critical security incident reported at Downtown Store requires immediate attention.',
    data: {
      entity_type: 'action_item',
      entity_id: 'action_001',
    },
    read: false,
    created_at: '2024-01-15T10:01:00Z',
  },
  {
    _id: 'notif_003',
    org_id: 'org_001',
    user_id: 'user_001',
    type: 'assignment',
    title: 'New Assignment',
    body: 'You have been assigned to VIP Customer Follow-up task.',
    data: {
      entity_type: 'action_item',
      entity_id: 'action_002',
    },
    read: true,
    created_at: '2024-01-14T16:05:00Z',
  },
  {
    _id: 'notif_004',
    org_id: 'org_001',
    user_id: 'user_001',
    type: 'status_change',
    title: 'Complaint Resolved',
    body: 'Complaint from Lisa Wang has been marked as resolved.',
    data: {
      entity_type: 'complaint',
      entity_id: 'complaint_004',
    },
    read: true,
    created_at: '2024-01-13T16:31:00Z',
  },
  {
    _id: 'notif_005',
    org_id: 'org_001',
    user_id: 'user_001',
    type: 'reminder',
    title: 'Due Soon',
    body: 'Expedite Order #78542 is due in 2 hours.',
    data: {
      entity_type: 'action_item',
      entity_id: 'action_003',
    },
    read: false,
    created_at: '2024-01-15T12:00:00Z',
  },
  {
    _id: 'notif_006',
    org_id: 'org_001',
    user_id: 'user_001',
    type: 'urgent_complaint',
    title: 'High Severity Complaint',
    body: 'Customer Emily Chen reported service issue with high severity.',
    data: {
      entity_type: 'complaint',
      entity_id: 'complaint_002',
    },
    read: false,
    created_at: '2024-01-14T14:05:00Z',
  },
  {
    _id: 'notif_007',
    org_id: 'org_001',
    user_id: 'user_001',
    type: 'urgent_complaint',
    title: 'Billing Issue Reported',
    body: 'Robert Davis reported duplicate charge - high severity.',
    data: {
      entity_type: 'complaint',
      entity_id: 'complaint_003',
    },
    read: false,
    created_at: '2024-01-15T11:31:00Z',
  },
  {
    _id: 'notif_008',
    org_id: 'org_001',
    user_id: 'user_001',
    type: 'urgent_action',
    title: 'Order Needs Attention',
    body: 'Order #78542 requires expedited shipping - due today.',
    data: {
      entity_type: 'action_item',
      entity_id: 'action_003',
    },
    read: false,
    created_at: '2024-01-15T08:35:00Z',
  },
];

// Helper function to get current user by email/password
export const findUserByCredentials = (email: string, password: string): OrgUser | null => {
  // For demo, accept any password with the demo emails
  const user = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (user && password === 'demo123') {
    return user;
  }
  return null;
};
