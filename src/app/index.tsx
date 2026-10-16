import { PhotoCard } from '@/components/PhotoCard'
import { auth0Audience, auth0Scheme } from '@/lib/config'
import { listPhotos, type PhotoRow } from '@/lib/db'
import { Link, useFocusEffect } from 'expo-router'
import { useCallback, useState } from 'react'
import { FlatList } from 'react-native'
import { useAuth0 } from 'react-native-auth0'
import { Button, Spinner, Text, XStack, YStack } from 'tamagui'

export default function PhotosScreen() {
  const { authorize, clearSession, user, isLoading, error } = useAuth0()
  const [photos, setPhotos] = useState<PhotoRow[]>([])
  const [ready, setReady] = useState(false)
  const [listError, setListError] = useState<string | null>(null)

  useFocusEffect(
    useCallback(() => {
      let cancelled = false
      ;(async () => {
        try {
          const rows = await listPhotos()
          if (!cancelled) {
            setPhotos(rows)
            setListError(null)
          }
        } catch (err) {
          if (!cancelled) {
            setListError(err instanceof Error ? err.message : 'Could not load photos')
          }
        } finally {
          if (!cancelled) {
            setReady(true)
          }
        }
      })()
      return () => {
        cancelled = true
      }
    }, []),
  )

  const signIn = async () => {
    await authorize(
      {
        scope: 'openid profile email offline_access describe:photos',
        audience: auth0Audience,
      },
      { customScheme: auth0Scheme },
    )
  }

  const signOut = async () => {
    await clearSession({}, { customScheme: auth0Scheme })
  }

  if (isLoading || !ready) {
    return (
      <YStack flex={1} bg="background" items="center" justify="center" p="6">
        <Spinner size="large" color="blue-500" />
      </YStack>
    )
  }

  if (!user) {
    return (
      <YStack flex={1} bg="background" items="center" justify="center" p="6" gap="4">
        <Text color="color" fontSize="8" fontWeight="700" text="center">
          Expo Pipeline Lab
        </Text>
        <Text color="color-8" fontSize="3" text="center" lineHeight="20">
          Sign in, take a photo, send it to the hosted API, and save the result locally.
        </Text>
        <Button
          theme="brand"
          size="lg"
          alignSelf="stretch"
          transition="quick"
          scale="1 press:0.97"
          onPress={() => void signIn()}
        >
          Sign in with Auth0
        </Button>
        {error ? (
          <Text color="red-500" text="center">
            {error.message}
          </Text>
        ) : null}
      </YStack>
    )
  }

  return (
    <YStack flex={1} bg="background" p="4" gap="3">
      <XStack justify="space-between" items="center">
        <Text color="color" fontSize="4" fontWeight="600">
          Hi, {user.name ?? user.email ?? 'there'}
        </Text>
        <Button
          variant="quiet"
          size="sm"
          color="blue-500"
          fontWeight="600"
          transition="quick"
          opacity="1 press:0.7"
          onPress={() => void signOut()}
        >
          Sign out
        </Button>
      </XStack>

      {listError ? (
        <Text color="red-500" text="center">
          {listError}
        </Text>
      ) : null}

      <FlatList
        data={photos}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={
          photos.length === 0 ? { flexGrow: 1, justifyContent: 'center' } : { gap: 12, paddingBottom: 8 }
        }
        ListEmptyComponent={
          <Text color="color-8" fontSize="3" text="center">
            No photos yet. Take one to run the pipeline.
          </Text>
        }
        renderItem={({ item, index }) => <PhotoCard photo={item} index={index} />}
      />

      <Link href="/camera" asChild>
        <Button
          theme="brand"
          size="lg"
          transition="quick"
          scale="1 press:0.97"
        >
          Take photo
        </Button>
      </Link>
    </YStack>
  )
}
