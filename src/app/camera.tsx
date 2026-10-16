import { insertPhoto } from '@/lib/db'
import { describePhoto } from '@/lib/describe-photo'
import { CameraView, useCameraPermissions } from 'expo-camera'
import { router } from 'expo-router'
import { useRef, useState } from 'react'
import { useAuth0 } from 'react-native-auth0'
import { Button, Spinner, Text, View, YStack } from 'tamagui'

export default function CameraScreen() {
  const cameraRef = useRef<CameraView>(null)
  const [permission, requestPermission] = useCameraPermissions()
  const { getCredentials } = useAuth0()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!permission) {
    return (
      <YStack flex={1} bg="background" items="center" justify="center" p="6">
        <Spinner size="large" color="blue-500" />
      </YStack>
    )
  }

  if (!permission.granted) {
    return (
      <YStack flex={1} bg="background" items="center" justify="center" p="6" gap="4">
        <Text color="color-8" fontSize="3" text="center">
          Camera access is required to capture a photo.
        </Text>
        <Button
          theme="brand"
          size="lg"
          alignSelf="stretch"
          transition="quick"
          scale="1 press:0.97"
          onPress={() => void requestPermission()}
        >
          Allow camera
        </Button>
      </YStack>
    )
  }

  const capture = async () => {
    if (busy) {
      return
    }

    setBusy(true)
    setError(null)

    try {
      const photo = await cameraRef.current?.takePictureAsync({
        quality: 0.4,
        base64: true,
      })

      if (!photo?.uri || !photo.base64) {
        throw new Error('Camera did not return a local photo.')
      }

      const credentials = await getCredentials()
      if (!credentials?.accessToken) {
        throw new Error('Sign in again to get an access token.')
      }

      const analysis = await describePhoto(photo.base64, credentials.accessToken)
      await insertPhoto({
        uri: photo.uri,
        description: analysis.description,
        tags: analysis.tags,
      })
      router.back()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not describe this photo')
    } finally {
      setBusy(false)
    }
  }

  return (
    <YStack flex={1} bg="background" p="4" gap="3">
      <View flex={1} rounded="4" overflow="hidden">
        <CameraView ref={cameraRef} style={{ flex: 1 }} facing="back" />
        {busy ? (
          <YStack
            position="absolute"
            t={0}
            r={0}
            b={0}
            l={0}
            bg="rgba(11, 18, 32, 0.55)"
            items="center"
            justify="center"
            gap="3"
          >
            <Spinner size="large" color="white" />
            <Text color="white" fontSize="4" fontWeight="600">
              Describing photo…
            </Text>
          </YStack>
        ) : null}
      </View>
      {error ? (
        <Text color="red-500" text="center">
          {error}
        </Text>
      ) : null}
      <Button
        theme="brand"
        size="lg"
        disabled={busy}
        opacity={busy ? 0.6 : 1}
        transition="quick"
        scale="1 press:0.97"
        onPress={() => void capture()}
      >
        {busy ? 'Working…' : 'Capture and describe'}
      </Button>
    </YStack>
  )
}
