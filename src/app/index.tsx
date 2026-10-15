import { auth0Audience, auth0Scheme } from '@/lib/config';
import { listPhotos, parseTags, type PhotoRow } from '@/lib/db';
import { Image } from 'expo-image';
import { Link, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useAuth0 } from 'react-native-auth0';

export default function PhotosScreen() {
  const { authorize, clearSession, user, isLoading, error } = useAuth0();
  const [photos, setPhotos] = useState<PhotoRow[]>([]);
  const [ready, setReady] = useState(false);
  const [listError, setListError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        try {
          const rows = await listPhotos();
          if (!cancelled) {
            setPhotos(rows);
            setListError(null);
          }
        } catch (err) {
          if (!cancelled) {
            setListError(err instanceof Error ? err.message : 'Could not load photos');
          }
        } finally {
          if (!cancelled) {
            setReady(true);
          }
        }
      })();
      return () => {
        cancelled = true;
      };
    }, []),
  );

  const signIn = async () => {
    await authorize(
      {
        scope: 'openid profile email offline_access describe:photos',
        audience: auth0Audience,
      },
      { customScheme: auth0Scheme },
    );
  };

  const signOut = async () => {
    await clearSession({}, { customScheme: auth0Scheme });
  };

  if (isLoading || !ready) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#4F8CFF" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.centered}>
        <Text style={styles.title}>Expo Pipeline Lab</Text>
        <Text style={styles.copy}>
          Sign in, take a photo, send it to the hosted API, and save the result locally.
        </Text>
        <Pressable style={styles.button} onPress={() => void signIn()}>
          <Text style={styles.buttonLabel}>Sign in with Auth0</Text>
        </Pressable>
        {error ? <Text style={styles.error}>{error.message}</Text> : null}
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.headerRow}>
        <Text style={styles.welcome}>Hi, {user.name ?? user.email ?? 'there'}</Text>
        <Pressable onPress={() => void signOut()}>
          <Text style={styles.link}>Sign out</Text>
        </Pressable>
      </View>

      {listError ? <Text style={styles.error}>{listError}</Text> : null}

      <FlatList
        data={photos}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={photos.length === 0 ? styles.emptyList : styles.list}
        ListEmptyComponent={
          <Text style={styles.copy}>No photos yet. Take one to run the pipeline.</Text>
        }
        renderItem={({ item }) => <PhotoCard photo={item} />}
      />

      <Link href="/camera" asChild>
        <Pressable style={styles.button}>
          <Text style={styles.buttonLabel}>Take photo</Text>
        </Pressable>
      </Link>
    </View>
  );
}

function PhotoCard({ photo }: { photo: PhotoRow }) {
  const tags = parseTags(photo.tags);

  return (
    <View style={styles.card}>
      <Image source={{ uri: photo.uri }} style={styles.thumb} contentFit="cover" />
      <View style={styles.cardBody}>
        <Text style={styles.description}>{photo.description}</Text>
        <Text style={styles.tags}>{tags.map((tag) => `#${tag}`).join('  ')}</Text>
        <Text style={styles.meta}>{new Date(photo.created_at).toLocaleString()}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#0B1220',
    padding: 16,
    gap: 12,
  },
  centered: {
    flex: 1,
    backgroundColor: '#0B1220',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    color: '#F4F7FB',
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
  },
  welcome: {
    color: '#F4F7FB',
    fontSize: 16,
    fontWeight: '600',
  },
  copy: {
    color: '#8A94A6',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  link: {
    color: '#4F8CFF',
    fontSize: 15,
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#4F8CFF',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 18,
    alignItems: 'center',
  },
  buttonLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  error: {
    color: '#FF8A8A',
    textAlign: 'center',
  },
  list: {
    gap: 12,
    paddingBottom: 8,
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#152033',
    borderRadius: 14,
    overflow: 'hidden',
  },
  thumb: {
    width: '100%',
    height: 220,
    backgroundColor: '#1C2A40',
  },
  cardBody: {
    padding: 12,
    gap: 6,
  },
  description: {
    color: '#F4F7FB',
    fontSize: 16,
    fontWeight: '600',
  },
  tags: {
    color: '#8CB4FF',
    fontSize: 13,
  },
  meta: {
    color: '#8A94A6',
    fontSize: 12,
  },
});
