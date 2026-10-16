import { auth0ClientId, auth0Domain } from '@/lib/config';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Auth0Provider } from 'react-native-auth0';

export default function RootLayout() {
  return (
    <Auth0Provider domain={auth0Domain} clientId={auth0ClientId} useDPoP={false}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#0B1220' },
          headerTintColor: '#F4F7FB',
          headerTitleStyle: { fontWeight: '600' },
          contentStyle: { backgroundColor: '#0B1220' },
        }}
      >
        <Stack.Screen name="index" options={{ title: 'Photos' }} />
        <Stack.Screen name="camera" options={{ title: 'Take photo', presentation: 'modal' }} />
      </Stack>
    </Auth0Provider>
  );
}
