import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActionItemsListScreen, ActionItemDetailScreen } from '../screens';
import { ActionItemsStackParamList } from './types';

const Stack = createNativeStackNavigator<ActionItemsStackParamList>();

export const ActionItemsStack: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="ActionItemsList" component={ActionItemsListScreen} />
      <Stack.Screen name="ActionItemDetail" component={ActionItemDetailScreen} />
    </Stack.Navigator>
  );
};

export default ActionItemsStack;
