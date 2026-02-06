import { NavigatorScreenParams } from '@react-navigation/native';

// Stack navigators
export type AuthStackParamList = {
  Login: undefined;
};

export type HomeStackParamList = {
  HomeMain: undefined;
  ComplaintDetail: { id: string; initialData?: any };
  FollowupDetail: { id: string };
  QRScanner: undefined;
  Notifications: undefined;
  Settings: undefined;
};

export type ComplaintsStackParamList = {
  ComplaintsList: { filterStatus?: string } | undefined;
  ComplaintDetail: { id: string; initialData?: any };
  QRScanner: undefined;
};

export type FollowupsStackParamList = {
  FollowupsList: { filterStatus?: string } | undefined;
  FollowupDetail: { id: string };
};

export type AnalyticsStackParamList = {
  AnalyticsMain: undefined;
};

// Legacy stacks (kept for reference, can be removed later)
export type UrgentStackParamList = {
  UrgentHome: undefined;
  ComplaintDetail: { id: string };
  FollowupDetail: { id: string };
};

export type NotificationsStackParamList = {
  NotificationsList: undefined;
  ComplaintDetail: { id: string };
  FollowupDetail: { id: string };
};

export type SettingsStackParamList = {
  SettingsHome: undefined;
};

// Tab navigator - New order: Home, Complaints, QRScanner, Actions, Analytics
export type MainTabParamList = {
  Home: NavigatorScreenParams<HomeStackParamList>;
  Complaints: NavigatorScreenParams<ComplaintsStackParamList>;
  QRScanner: undefined;
  Followups: NavigatorScreenParams<FollowupsStackParamList>;
  Analytics: NavigatorScreenParams<AnalyticsStackParamList>;
};

// Root navigator
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList { }
  }
}
