import { auth0ClientId, auth0Domain } from '@/lib/config'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useColorScheme } from 'react-native'
import { Auth0Provider } from 'react-native-auth0'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { TamaguiProvider, useTheme } from 'tamagui'
import { tamaguiConfig } from '../../tamagui.config'

function ThemedNavigation() {
  const scheme = useColorScheme()
  const theme = useTheme()
  const background = theme.background?.val ?? (scheme === 'dark' ? '#0B1220' : '#F8FAFC')
  const color = theme.color?.val ?? (scheme === 'dark' ? '#F4F7FB' : '#0B1220')

  return (
    <>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: background },
          headerTintColor: color,
          headerTitleStyle: { fontWeight: '600' },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: background },
        }}
      >
        <Stack.Screen name="index" options={{ title: 'Photos' }} />
        <Stack.Screen name="camera" options={{ title: 'Take photo', presentation: 'modal' }} />
      </Stack>
    </>
  )
}

export default function RootLayout() {
  const scheme = useColorScheme()

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <TamaguiProvider
        config={tamaguiConfig}
        defaultTheme={scheme === 'dark' ? 'dark' : 'light'}
      >
        <Auth0Provider domain={auth0Domain} clientId={auth0ClientId} useDPoP={false}>
          <ThemedNavigation />
        </Auth0Provider>
      </TamaguiProvider>
    </GestureHandlerRootView>
  )
}
