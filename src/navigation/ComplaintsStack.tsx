import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ComplaintsListScreen, ComplaintDetailScreen } from '../screens';
import { ComplaintsStackParamList } from './types';

const Stack = createNativeStackNavigator<ComplaintsStackParamList>();

export const ComplaintsStack: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="ComplaintsList" component={ComplaintsListScreen} />
      <Stack.Screen name="ComplaintDetail" component={ComplaintDetailScreen} />
    </Stack.Navigator>
  );
};

export default ComplaintsStack;
