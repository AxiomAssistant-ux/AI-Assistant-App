import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { UrgentStack } from './UrgentStack';
import { ComplaintsStack } from './ComplaintsStack';
import { ActionItemsStack } from './ActionItemsStack';
import { NotificationsStack } from './NotificationsStack';
import { SettingsStack } from './SettingsStack';
import { useUrgentStore, useNotificationsStore } from '../stores';
import { MainTabParamList } from './types';
import { colors, fontSizes, fontWeights, spacing } from '../theme';

const Tab = createBottomTabNavigator<MainTabParamList>();

interface TabBadgeProps {
  count: number;
}

const TabBadge: React.FC<TabBadgeProps> = ({ count }) => {
  if (count === 0) return null;

  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>{count > 99 ? '99+' : count}</Text>
    </View>
  );
};

export const MainTabNavigator: React.FC = () => {
  const getUrgentCount = useUrgentStore((state) => state.getUrgentCount);
  const getUnreadCount = useNotificationsStore((state) => state.getUnreadCount);

  const urgentCount = getUrgentCount();
  const unreadNotifications = getUnreadCount();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary[600],
        tabBarInactiveTintColor: colors.gray[400],
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarItemStyle: styles.tabBarItem,
      }}
    >
      <Tab.Screen
        name="Urgent"
        component={UrgentStack}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <View>
              <Ionicons
                name={focused ? 'alert-circle' : 'alert-circle-outline'}
                size={size}
                color={urgentCount > 0 ? colors.error[500] : color}
              />
              <TabBadge count={urgentCount} />
            </View>
          ),
          tabBarLabel: 'Urgent',
        }}
      />
      <Tab.Screen
        name="Complaints"
        component={ComplaintsStack}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'chatbubbles' : 'chatbubbles-outline'}
              size={size}
              color={color}
            />
          ),
          tabBarLabel: 'Complaints',
        }}
      />
      <Tab.Screen
        name="Tasks"
        component={ActionItemsStack}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'checkbox' : 'checkbox-outline'}
              size={size}
              color={color}
            />
          ),
          tabBarLabel: 'Tasks',
        }}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationsStack}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <View>
              <Ionicons
                name={focused ? 'notifications' : 'notifications-outline'}
                size={size}
                color={color}
              />
              <TabBadge count={unreadNotifications} />
            </View>
          ),
          tabBarLabel: 'Notifications',
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsStack}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'settings' : 'settings-outline'}
              size={size}
              color={color}
            />
          ),
          tabBarLabel: 'Settings',
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
    height: 60,
  },
  tabBarLabel: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.medium,
    marginTop: 2,
  },
  tabBarItem: {
    paddingVertical: spacing.xs,
  },
  badge: {
    position: 'absolute',
    right: -8,
    top: -4,
    backgroundColor: colors.error[500],
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: fontWeights.bold,
  },
});

export default MainTabNavigator;
