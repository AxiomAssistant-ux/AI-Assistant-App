import React, { useEffect } from 'react';
import { StatusBar, LogBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { RootNavigator } from './src/navigation';
import { ToastContainer } from './src/components';
import { useNotificationsStore, useUrgentStore } from './src/stores';

// Ignore specific warnings that are common in Expo
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);

export default function App() {
  const fetchNotifications = useNotificationsStore((state) => state.fetchNotifications);
  const fetchUrgent = useUrgentStore((state) => state.fetchUrgent);

  // Pre-fetch data when app loads (if authenticated)
  useEffect(() => {
    // Initial data will be fetched by screens when they mount
    // This is just for background data if needed
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <RootNavigator />
        <ToastContainer />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
