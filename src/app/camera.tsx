import { insertPhoto } from '@/lib/db';
import { describePhoto } from '@/lib/describe-photo';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useAuth0 } from 'react-native-auth0';

export default function CameraScreen() {
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const { getCredentials } = useAuth0();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!permission) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#4F8CFF" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.centered}>
        <Text style={styles.copy}>Camera access is required to capture a photo.</Text>
        <Pressable style={styles.button} onPress={() => void requestPermission()}>
          <Text style={styles.buttonLabel}>Allow camera</Text>
        </Pressable>
      </View>
    );
  }

  const capture = async () => {
    if (busy) {
      return;
    }

    setBusy(true);
    setError(null);

    try {
      const photo = await cameraRef.current?.takePictureAsync({
        quality: 0.4,
        base64: true,
      });

      if (!photo?.uri || !photo.base64) {
        throw new Error('Camera did not return a local photo.');
      }

      const credentials = await getCredentials();
      if (!credentials?.accessToken) {
        throw new Error('Sign in again to get an access token.');
      }

      const analysis = await describePhoto(photo.base64, credentials.accessToken);
      await insertPhoto({
        uri: photo.uri,
        description: analysis.description,
        tags: analysis.tags,
      });
      router.back();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not describe this photo');
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.screen}>
      <CameraView ref={cameraRef} style={styles.camera} facing="back" />
      {busy ? (
        <View style={styles.overlay}>
          <ActivityIndicator color="#FFFFFF" />
          <Text style={styles.overlayText}>Describing photo…</Text>
        </View>
      ) : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Pressable style={[styles.button, busy && styles.buttonDisabled]} onPress={() => void capture()}>
        <Text style={styles.buttonLabel}>{busy ? 'Working…' : 'Capture and describe'}</Text>
      </Pressable>
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
  camera: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(11, 18, 32, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  overlayText: {
    color: '#F4F7FB',
    fontSize: 16,
    fontWeight: '600',
  },
  copy: {
    color: '#8A94A6',
    fontSize: 15,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#4F8CFF',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
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
});
