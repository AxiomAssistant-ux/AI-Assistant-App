import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AnalyticsScreen } from '../screens/AnalyticsScreen';
import { AnalyticsStackParamList } from './types';

const Stack = createNativeStackNavigator<AnalyticsStackParamList>();

export const AnalyticsStack: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="AnalyticsMain" component={AnalyticsScreen} />
    </Stack.Navigator>
  );
};

export default AnalyticsStack;
