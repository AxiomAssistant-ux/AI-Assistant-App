import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  NotificationsScreen,
  ComplaintDetailScreen,
  FollowupDetailScreen,
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
      <Stack.Screen name="FollowupDetail" component={FollowupDetailScreen} />
    </Stack.Navigator>
  );
};

export default NotificationsStack;
