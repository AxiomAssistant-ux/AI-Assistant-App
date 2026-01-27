import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ComplaintsListScreen, ComplaintDetailScreen } from '../screens';
import { QRScannerScreen } from '../screens/QRScannerScreen';
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
      <Stack.Screen name="QRScanner" component={QRScannerScreen} />
    </Stack.Navigator>
  );
};

export default ComplaintsStack;
