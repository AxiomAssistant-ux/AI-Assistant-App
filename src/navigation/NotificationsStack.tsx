import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  NotificationsScreen,
  ComplaintDetailScreen,
  ActionItemDetailScreen,
} from '../screens';
import { NotificationsStackParamList } from './types';

const Stack = createNativeStackNavigator<NotificationsStackParamList>();

export const NotificationsStack: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="NotificationsList" component={NotificationsScreen} />
      <Stack.Screen name="ComplaintDetail" component={ComplaintDetailScreen} />
      <Stack.Screen name="ActionItemDetail" component={ActionItemDetailScreen} />
    </Stack.Navigator>
  );
};

export default NotificationsStack;
