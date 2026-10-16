import { createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose';

function env(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value) {
    throw new Error(`Missing server env: ${name}`);
  }
  return value;
}

const domain = env('AUTH0_DOMAIN', process.env.EXPO_PUBLIC_AUTH0_DOMAIN);
const audience = env('AUTH0_AUDIENCE', process.env.EXPO_PUBLIC_AUTH0_AUDIENCE);
const issuer = process.env.AUTH0_ISSUER ?? `https://${domain}/`;

const JWKS = createRemoteJWKSet(new URL(`https://${domain}/.well-known/jwks.json`));

export async function requireAccessToken(request: Request): Promise<JWTPayload> {
  const header = request.headers.get('authorization') ?? '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    throw new AuthError('Missing Bearer access token', 401);
  }

  try {
    const { payload } = await jwtVerify(token, JWKS, {
      issuer,
      audience,
    });
    return payload;
  } catch {
    throw new AuthError('Invalid or expired access token', 401);
  }
}

export class AuthError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'AuthError';
    this.status = status;
  }
}
