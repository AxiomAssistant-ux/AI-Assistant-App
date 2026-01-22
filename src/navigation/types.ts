import { NavigatorScreenParams } from '@react-navigation/native';

// Stack navigators
export type AuthStackParamList = {
  Login: undefined;
};

export type ComplaintsStackParamList = {
  ComplaintsList: undefined;
  ComplaintDetail: { id: string };
};

export type ActionItemsStackParamList = {
  ActionItemsList: undefined;
  ActionItemDetail: { id: string };
};

export type UrgentStackParamList = {
  UrgentHome: undefined;
  ComplaintDetail: { id: string };
  ActionItemDetail: { id: string };
};

export type NotificationsStackParamList = {
  NotificationsList: undefined;
  ComplaintDetail: { id: string };
  ActionItemDetail: { id: string };
};

export type SettingsStackParamList = {
  SettingsHome: undefined;
};

// Tab navigator
export type MainTabParamList = {
  Urgent: NavigatorScreenParams<UrgentStackParamList>;
  Complaints: NavigatorScreenParams<ComplaintsStackParamList>;
  Tasks: NavigatorScreenParams<ActionItemsStackParamList>;
  Notifications: NavigatorScreenParams<NotificationsStackParamList>;
  Settings: NavigatorScreenParams<SettingsStackParamList>;
};

// Root navigator
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
