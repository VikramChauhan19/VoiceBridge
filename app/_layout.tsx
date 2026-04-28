import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { AppProvider } from '@/src/providers/AppProvider';

export default function RootLayout() {
  return (
    <AppProvider>
      <Stack initialRouteName="firebase-health" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="firebase-health" />
        <Stack.Screen name="(tabs)" />
      </Stack>
      <StatusBar style="light" />
    </AppProvider>
  );
}
