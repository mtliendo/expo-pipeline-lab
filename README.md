# Expo Pipeline Lab

Minimal iOS Expo app that proves Focus's mobile pipeline end to end:

1. Sign in with Auth0 (`react-native-auth0`).
2. Take a photo with `expo-camera`.
3. Call an Expo Router API route (`src/app/api/describe+api.ts` → `POST /api/describe`) hosted on EAS Hosting.
4. The route verifies the Auth0 access token with `jose` JWKS, then uses the AI SDK `generateObject` + Zod through Vercel AI Gateway.
5. Save `{id, uri, description, tags JSON, created_at}` to an `expo-sqlite` `photos` table.
6. Show saved photos on the list screen.

This repo is a lab, not a product. Features stay small on purpose.

## Architecture

```
iOS app (expo-dev-client)
  Auth0 Universal Login  →  access token (audience https://expo-pipeline-lab.api)
  expo-camera            →  local photo URI + base64
  POST /api/describe     →  Authorization: Bearer <access token>
       │
       ▼
EAS Hosting (Expo Router API route, web.output = server)
  jose JWKS verify against issuer https://demo-showcase.us.auth0.com/ and API audience  <!-- pragma: allowlist secret -->
  AI SDK generateObject(schema) via AI_GATEWAY_API_KEY
       │
       ▼
expo-sqlite `photos`
  id INTEGER PRIMARY KEY
  uri TEXT                -- local photo URI
  description TEXT        -- one-line description
  tags TEXT               -- JSON array of 3-5 tags
  created_at TEXT
```

Public Auth0 values (not secrets) live in `app.json` `expo.extra` and `.env.example`.

| Resource | Value |
| --- | --- |
| Tenant | `demo-showcase` (`demo-showcase.us.auth0.com`) |  <!-- pragma: allowlist secret -->
| Native app | Expo Pipeline Lab |
| Client ID | `mw7slVl0xn16xgjCLPEN9D3eYk9FqVA5` |
| Custom scheme | `expopipelinelab` |
| Bundle ID | `com.focusotter.expopipelinelab` |
| Callback / logout URL | `expopipelinelab://demo-showcase.us.auth0.com/ios/com.focusotter.expopipelinelab/callback` |  <!-- pragma: allowlist secret -->
| API | Expo Pipeline Lab API |
| Audience | `https://expo-pipeline-lab.api` |
| API scope | `describe:photos` |

DPoP is disabled (`useDPoP={false}`) because the API verifies a Bearer JWT, not a DPoP proof.

## Prerequisites

- Node 22+ and [pnpm](https://pnpm.io/)
- An iPhone or iOS Simulator (this app is iOS only)
- [EAS CLI](https://docs.expo.dev/eas/cli/) (`pnpm exec eas-cli` or a global install)
- Apple Developer Program membership (for device/TestFlight builds)
- A Vercel AI Gateway key for the hosted API

## Setup

```bash
pnpm install
cp .env.example .env
```

Fill `AI_GATEWAY_API_KEY` in `.env`. Do not prefix it with `EXPO_PUBLIC_`.

`EXPO_PUBLIC_*` Auth0 values are already filled. After the first `eas deploy`, set `EXPO_PUBLIC_API_ORIGIN` to the Hosting origin (no trailing slash) so a production iOS build can reach `/api/describe`. In local `pnpm start`, a relative `/api/describe` fetch uses the Metro origin automatically.

## How to run locally

`react-native-auth0` and `expo-camera` need a [development build](https://docs.expo.dev/develop/development-builds/introduction/). Expo Go will not work.

On a Mac with Xcode:

```bash
pnpm exec expo run:ios
```

Or install a cloud development build, then start Metro:

```bash
pnpm exec eas-cli build -p ios --profile development
pnpm start
```

To exercise the API route without a device:

```bash
pnpm exec expo serve
# POST http://localhost:8081/api/describe still requires a valid Auth0 Bearer token
```

Sign-in uses Auth0 Universal Login. Create a user in the `demo-showcase` tenant if signup is closed on the Username-Password-Authentication connection.

## EAS Hosting — deploy the API routes

The API route is part of the Expo Router web/server export.

```bash
pnpm exec expo export -p web
pnpm exec eas-cli deploy
```

Use `pnpm exec eas-cli deploy --prod` for the production Hosting URL.

The first deploy asks you to `eas login`, `eas init` (writes `extra.eas.projectId`), and pick a preview subdomain. Those steps are Focus-only; this repo does not contain a project ID.

Set these **server** env vars on the EAS project (Hosting / `eas env:create`) before calling the route in production:

- `AI_GATEWAY_API_KEY` (secret)
- `AUTH0_DOMAIN` = `demo-showcase.us.auth0.com`  <!-- pragma: allowlist secret -->
- `AUTH0_AUDIENCE` = `https://expo-pipeline-lab.api`
- `AUTH0_ISSUER` = `https://demo-showcase.us.auth0.com/` (optional; the route derives it from the domain)  <!-- pragma: allowlist secret -->
- `AI_GATEWAY_MODEL` = `google/gemini-2.5-flash` (optional)

Then set `EXPO_PUBLIC_API_ORIGIN` for native builds to the Hosting origin, for example `https://<subdomain>.expo.app`.

`eas.json` does not turn on `EXPO_UNSTABLE_DEPLOY_SERVER`. If you want EAS Build to deploy a versioned server and inject `origin` automatically, add that env var in the Expo dashboard.

## EAS Build — iOS

```bash
pnpm exec eas-cli build -p ios --profile development
pnpm exec eas-cli build -p ios --profile preview
pnpm exec eas-cli build -p ios --profile production
```

Profiles in `eas.json`:

- `development` — `expo-dev-client`, internal distribution
- `preview` — internal distribution
- `production` — store / TestFlight, remote auto-increment

`app.json` sets `ios.bundleIdentifier` to `com.focusotter.expopipelinelab` and the camera usage description. Config plugins: `expo-router`, `expo-dev-client`, `expo-splash-screen`, `expo-camera`, `expo-sqlite`, `react-native-auth0`.

## EAS Submit — TestFlight

```bash
pnpm exec eas-cli submit -p ios --profile production --latest
```

`eas.json` includes `submit.production`. The first submit needs an App Store Connect app record and Apple credentials.

## Focus-only checklist

These cannot be finished from this agent session:

1. **Apple Developer Program** membership for the team that will own `com.focusotter.expopipelinelab`.
2. **App Store Connect app record** with that bundle ID (needed for `eas submit` / TestFlight).
3. **`eas login`** as the Expo account that should own the project.
4. **`eas init`** in this repo so `app.json` gets `extra.eas.projectId` (and the EAS owner). Do not invent a project ID.
5. **EAS env vars** for Hosting and builds:
   - Secret: `AI_GATEWAY_API_KEY`
   - Public/server: `AUTH0_DOMAIN`, `AUTH0_AUDIENCE`, `AUTH0_ISSUER` (optional), `AI_GATEWAY_MODEL` (optional)
   - Public client: `EXPO_PUBLIC_API_ORIGIN` after the first Hosting deploy
6. **First `eas deploy`** — choose the preview subdomain and confirm the Hosting URL.
7. **Apple / EAS credentials** — distribution cert, provisioning profile, and App Store Connect API key (or let EAS prompt).
8. **Auth0 test user** — the tenant already has the Native app, API, client grant, and Username-Password-Authentication enabled for this client. Create a user (or turn on signup) if you need a login to demo.
9. **Optional Auth0 follow-ups** this session did not change: social connections, branding, MFA, or extra Allowed Callback URLs if you add Android later.

Auth0 work that is already done is listed in the Architecture table above.

## Scripts

| Command | Purpose |
| --- | --- |
| `pnpm start` | Metro with the dev client |
| `pnpm ios` | Start Metro targeting iOS |
| `pnpm web` | Web / API-route dev server |
| `pnpm export:web` | Export the Hosting bundle |
| `pnpm typecheck` | `tsc --noEmit` |

No test suite. This lab is for the live pipeline.
