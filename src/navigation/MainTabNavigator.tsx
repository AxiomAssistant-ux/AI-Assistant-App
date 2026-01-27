import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { HomeStack } from './HomeStack';
import { ComplaintsStack } from './ComplaintsStack';
import { ActionItemsStack } from './ActionItemsStack';
import { AnalyticsStack } from './AnalyticsStack';
import { useHomeStore, useComplaintsStore, useActionItemsStore } from '../stores';
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
  const stats = useHomeStore((state) => state.stats);

  // Calculate pending complaints count
  const pendingComplaints = stats?.pendingComplaints ?? 0;
  const urgentActions = stats?.urgentActionItems ?? 0;

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
        name="Home"
        component={HomeStack}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'home' : 'home-outline'}
              size={size}
              color={color}
            />
          ),
          tabBarLabel: 'Home',
        }}
      />
      <Tab.Screen
        name="Complaints"
        component={ComplaintsStack}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <View>
              <Ionicons
                name={focused ? 'chatbubbles' : 'chatbubbles-outline'}
                size={size}
                color={pendingComplaints > 0 ? colors.warning[500] : color}
              />
              <TabBadge count={pendingComplaints} />
            </View>
          ),
          tabBarLabel: 'Complaints',
        }}
      />
      <Tab.Screen
        name="Actions"
        component={ActionItemsStack}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <View>
              <Ionicons
                name={focused ? 'flash' : 'flash-outline'}
                size={size}
                color={urgentActions > 0 ? colors.error[500] : color}
              />
              <TabBadge count={urgentActions} />
            </View>
          ),
          tabBarLabel: 'Actions',
        }}
      />
      <Tab.Screen
        name="Analytics"
        component={AnalyticsStack}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'analytics' : 'analytics-outline'}
              size={size}
              color={color}
            />
          ),
          tabBarLabel: 'Analytics',
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
    height: 65,
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
