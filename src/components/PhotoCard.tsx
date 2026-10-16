import type { PhotoRow } from '@/lib/db'
import { parseTags } from '@/lib/db'
import { Image } from 'expo-image'
import Animated, { FadeInDown, LinearTransition, useReducedMotion } from 'react-native-reanimated'
import { Text, YStack } from 'tamagui'

export function PhotoCard({ photo, index }: { photo: PhotoRow; index: number }) {
  const tags = parseTags(photo.tags)
  const reducedMotion = useReducedMotion()
  const delay = Math.min(index, 8) * 40

  return (
    <Animated.View
      entering={reducedMotion ? undefined : FadeInDown.delay(delay).springify()}
      layout={reducedMotion ? undefined : LinearTransition.springify()}
    >
      <YStack theme="level2" bg="background" rounded="4" overflow="hidden">
        <Image
          source={{ uri: photo.uri }}
          style={{ width: '100%', height: 220, backgroundColor: '#1C2A40' }}
          contentFit="cover"
        />
        <YStack p="3" gap="1.5">
          <Text color="color" fontSize="4" fontWeight="600">
            {photo.description}
          </Text>
          {tags.length > 0 ? (
            <Text color="blue-500" fontSize="2">
              {tags.map((tag) => `#${tag}`).join('  ')}
            </Text>
          ) : null}
          <Text color="color-8" fontSize="1">
            {new Date(photo.created_at).toLocaleString()}
          </Text>
        </YStack>
      </YStack>
    </Animated.View>
  )
}
