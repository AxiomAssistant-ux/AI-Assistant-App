import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  UrgentScreen,
  ComplaintDetailScreen,
  FollowupDetailScreen,
} from '../screens';
import { UrgentStackParamList } from './types';

const Stack = createNativeStackNavigator<UrgentStackParamList>();

export const UrgentStack: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="UrgentHome" component={UrgentScreen} />
      <Stack.Screen name="ComplaintDetail" component={ComplaintDetailScreen} />
      <Stack.Screen name="FollowupDetail" component={FollowupDetailScreen} />
    </Stack.Navigator>
  );
};

export default UrgentStack;
