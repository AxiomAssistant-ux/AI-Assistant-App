import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { FollowupsListScreen, FollowupDetailScreen } from '../screens';
import { FollowupsStackParamList } from './types';

const Stack = createNativeStackNavigator<FollowupsStackParamList>();

export const FollowupsStack: React.FC = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen name="FollowupsList" component={FollowupsListScreen} />
            <Stack.Screen name="FollowupDetail" component={FollowupDetailScreen} />
        </Stack.Navigator>
    );
};

export default FollowupsStack;
