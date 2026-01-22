# Store Response

A React Native Expo mobile app for managing store complaints and action items with a modern premium UI.

## Features

- **Urgent Dashboard**: Combined view of urgent complaints and action items
- **Complaints Management**: View, filter, and manage customer complaints
- **Action Items (Tasks)**: Track and complete action items
- **Notifications Center**: Real-time notification feed
- **Profile & Settings**: Organization branding preview and account management

## Tech Stack

- **Expo** + React Native + TypeScript
- **React Navigation** (Bottom Tabs + Native Stack)
- **Zustand** (State Management)
- **Axios** (API Client with interceptors)
- **Expo SecureStore** (Token storage)

## Quick Start

```bash
# Navigate to project directory
cd StoreResponse

# Install dependencies
npm install

# Start the development server
npx expo start
```

## Demo Credentials

| Role  | Email                    | Password |
|-------|--------------------------|----------|
| Admin | admin@metroretail.com    | demo123  |
| Staff | staff@metroretail.com    | demo123  |

## Project Structure

```
StoreResponse/
├── App.tsx                 # Entry point
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── StatusChip.tsx
│   │   ├── UrgencyChip.tsx
│   │   ├── Toast.tsx
│   │   ├── SkeletonLoader.tsx
│   │   ├── EmptyState.tsx
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── FilterChip.tsx
│   │   ├── UrgentBanner.tsx
│   │   ├── ActionButton.tsx
│   │   ├── Avatar.tsx
│   │   └── Header.tsx
│   │
│   ├── screens/            # App screens
│   │   ├── SplashScreen.tsx
│   │   ├── LoginScreen.tsx
│   │   ├── UrgentScreen.tsx
│   │   ├── ComplaintsListScreen.tsx
│   │   ├── ComplaintDetailScreen.tsx
│   │   ├── ActionItemsListScreen.tsx
│   │   ├── ActionItemDetailScreen.tsx
│   │   ├── NotificationsScreen.tsx
│   │   └── SettingsScreen.tsx
│   │
│   ├── navigation/         # Navigation setup
│   │   ├── RootNavigator.tsx
│   │   ├── AuthNavigator.tsx
│   │   ├── MainTabNavigator.tsx
│   │   └── [Stack Navigators]
│   │
│   ├── stores/             # Zustand stores
│   │   ├── authStore.ts
│   │   ├── toastStore.ts
│   │   ├── urgentStore.ts
│   │   ├── complaintsStore.ts
│   │   ├── actionItemsStore.ts
│   │   └── notificationsStore.ts
│   │
│   ├── lib/                # Core utilities
│   │   ├── api.ts          # Axios client & endpoints
│   │   ├── types.ts        # TypeScript types
│   │   ├── mockServer.ts   # Mock API implementation
│   │   ├── mockData.ts     # Realistic test data
│   │   ├── config.ts       # App configuration
│   │   └── storage.ts      # SecureStore helpers
│   │
│   └── theme/              # Design system
│       ├── colors.ts
│       ├── spacing.ts
│       ├── typography.ts
│       └── shadows.ts
│
└── assets/                 # App images
```

## API Endpoints (Ready for Backend)

The app is configured to use mock data by default. Set `USE_MOCK=false` in `src/lib/config.ts` to connect to a real API.

### Authentication
- `POST /auth/login` - User login
- `GET /me` - Get current user

### Urgent
- `GET /urgent` - Get urgent items

### Complaints
- `GET /complaints` - List complaints (filterable)
- `GET /complaints/:id` - Get complaint detail
- `PATCH /complaints/:id` - Update complaint
- `POST /complaints/:id/assign-to-me` - Assign complaint
- `POST /complaints/:id/notes` - Add note

### Action Items
- `GET /action-items` - List action items (filterable)
- `GET /action-items/:id` - Get action item detail
- `PATCH /action-items/:id` - Update action item
- `POST /action-items/:id/assign-to-me` - Assign action item

### Devices
- `POST /devices/register` - Register push notification token

## Data Models

### ActionItem
```typescript
{
  _id: string;
  org_id: string;
  call_id: string;
  type: 'appointment' | 'order' | 'incident' | 'follow_up' | 'task';
  title: string;
  description: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in_progress' | 'completed' | 'dismissed';
  assigned_to_user_id: string | null;
  assigned_role: string | null;
  due_at: string;
  created_at: string;
  updated_at: string;
}
```

### Complaint
```typescript
{
  _id: string;
  org_id: string;
  call_log_id: string;
  customer: { name: string; phone: string; email?: string };
  store: { name: string; address: string; phone?: string };
  complaint_type: string;
  complaint_description: string;
  complaint_severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in_progress' | 'resolved';
  notes: ComplaintNote[];
  created_at: string;
  updated_at: string;
}
```

## Urgent Rules

- **Urgent Complaint**: `severity` is `high` or `critical` AND `status` is `pending` or `in_progress`
- **Urgent ActionItem**: `urgency` is `high` or `critical` AND `status` is `pending` or `in_progress`

## UI Features

- Modern premium light UI (Linear/Notion inspired)
- Skeleton loaders for all loading states
- Empty states with actions
- Pull-to-refresh on all lists
- Optimistic UI updates
- Toast notifications for feedback
- 1-tap actions (Call, Assign, Status change)
- Urgency badges and banners
- Filter chips for list views

## Mock Server Features

- Simulated latency (300-800ms)
- 5% random error rate for testing
- Pagination support
- Filtering support
- State persistence during session

## License

MIT
