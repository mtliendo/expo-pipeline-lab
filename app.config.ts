import type { ConfigContext, ExpoConfig } from 'expo/config';

// Public Auth0 tenant domain. Not a client secret.
const auth0Domain =
  process.env.EXPO_PUBLIC_AUTH0_DOMAIN ?? 'demo-showcase.us.auth0.com'; // pragma: allowlist secret

export default ({ config }: ConfigContext): ExpoConfig => {
  const plugins = (config.plugins ?? []).filter((plugin) => {
    const name = Array.isArray(plugin) ? plugin[0] : plugin;
    return name !== 'react-native-auth0';
  });

  return {
    ...config,
    name: config.name ?? 'Expo Pipeline Lab',
    slug: config.slug ?? 'expo-pipeline-lab',
    plugins: [
      ...plugins,
      [
        'react-native-auth0',
        {
          domain: auth0Domain,
          customScheme: 'expopipelinelab',
        },
      ],
      './plugins/withAuth0Expo58AppDelegate',
    ],
    extra: {
      ...config.extra,
      auth0Domain,
    },
  };
};
