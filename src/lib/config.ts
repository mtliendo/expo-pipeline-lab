import Constants from 'expo-constants';

type Extra = {
  auth0Domain?: string;
  auth0ClientId?: string;
  auth0Audience?: string;
  auth0Scheme?: string;
};

const extra = (Constants.expoConfig?.extra ?? {}) as Extra;

function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing required config: ${name}`);
  }
  return value;
}

export const auth0Domain = required(
  'EXPO_PUBLIC_AUTH0_DOMAIN',
  process.env.EXPO_PUBLIC_AUTH0_DOMAIN ?? extra.auth0Domain,
);

export const auth0ClientId = required(
  'EXPO_PUBLIC_AUTH0_CLIENT_ID',
  process.env.EXPO_PUBLIC_AUTH0_CLIENT_ID ?? extra.auth0ClientId,
);

export const auth0Audience = required(
  'EXPO_PUBLIC_AUTH0_AUDIENCE',
  process.env.EXPO_PUBLIC_AUTH0_AUDIENCE ?? extra.auth0Audience,
);

export const auth0Scheme = required(
  'EXPO_PUBLIC_AUTH0_SCHEME',
  process.env.EXPO_PUBLIC_AUTH0_SCHEME ?? extra.auth0Scheme ?? 'expopipelinelab',
);

export const apiOrigin = process.env.EXPO_PUBLIC_API_ORIGIN?.replace(/\/$/, '') ?? '';

export function describeEndpoint(): string {
  return apiOrigin ? `${apiOrigin}/api/describe` : '/api/describe';
}
