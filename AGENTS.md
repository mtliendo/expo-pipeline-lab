# Agent baseline — Expo Pipeline Lab

This repo is Focus’s reference Expo app: **SDK 58, iOS-only, pnpm, Expo Router, Tamagui v3.0.18, Reanimated 4**. Skills live in `.agents/skills/` (committed so cloud agents can load them). Project tokens/themes are in `tamagui-prompt.md`. pnpm uses `node-linker=hoisted` in `.npmrc` so Metro and the Tamagui compiler can resolve `@tamagui/*`.

Read this file before applying any skill. When skills disagree, these rules win.

## Precedence

1. **This file** (`AGENTS.md`) and `docs/LEARNINGS.md`.
2. **Tamagui** (`.agents/skills/tamagui`, `tamagui-v6-config`) for UI, styling, theming, and component-level motion (`transition`, `press:`, `enter:` / `exit:`).
3. **Reanimated 4 + Gesture Handler** (`expo-animation`, Software Mansion animation/gesture refs) for native motion that a finger drives, list enter/layout, and shared values.
4. **Expo Router / Expo platform skills** (`expo-overview`, `expo-router`, `eas-*`) for routing, modules, EAS, and SDK versions.
5. **TanStack Query** (`expo-data-fetching`) for **server** state. Do not treat SQLite rows as Query cache.
6. **expo-sqlite** is the **local source of truth** for photos and other on-device records.
7. **Zustand** for small **client** UI state (toggles, ephemeral form flags). Do not put server data or SQLite rows in Zustand.
8. **Callstack / Vercel RN / remaining Expo skills** for performance and RN pitfalls, after the rules above.

## UI / styling / theming

- Use **Tamagui v3** (`tamagui`, `@tamagui/config/v6`). Tokens and theme names are **bare** (no `$` sigil). Prefer v6 shorthands (`p`, `bg`, `rounded`, `items`, `justify`).
- Light/dark follow the system via `TamaguiProvider` `defaultTheme` and `userInterfaceStyle: "automatic"`.
- **Do not** introduce NativeWind, Unistyles, Restyle, StyleSheet design tokens, or a second `src/theme/` tree.
- Ignore Vercel `ui-styling` (“StyleSheet.create or Nativewind”) and Expo `@expo/ui` defaults. `expo-ui` was **dropped** because it tells agents to use SwiftUI wrappers instead of Tamagui.
- `expo-design-system` / `expo-native-ui` may inform HIG and polish; implement with Tamagui, not a parallel token file.
- Keep using `expo-image` for photos (Vercel `ui-expo-image` still applies).

## Motion

- **react-native-reanimated ~4** (with `react-native-worklets`) and **react-native-gesture-handler**. Babel plugin is supplied by `babel-preset-expo`; wrap the tree in `GestureHandlerRootView`.
- Wire Tamagui’s animation driver to Reanimated (`@tamagui/config/animations-reanimated`). Use Tamagui `transition` for press/enter on Tamagui components; use Reanimated layout/entering APIs for list items.
- Do not add Moti, Reanimated v3, or RN core `Animated` for new work.
- Honor reduced motion (`useReducedMotion`).
- These are **native modules**. Changing them (or first adding them) needs a **new EAS/dev client build**, not an OTA/`eas update`.

## Data

- **Server / API:** TanStack Query when you add cached remote state. This lab’s `POST /api/describe` is a one-shot mutation; do not wrap SQLite in Query.
- **Local:** `expo-sqlite` (`src/lib/db.ts`) is authoritative on device.
- **Client UI:** Zustand for small stores when `useState` is no longer enough.
- Auth session stays in `react-native-auth0`.

## Lists

- Small/local lists (this photo feed) may use `FlatList`.
- Large/unknown-length lists: FlashList (Callstack / Vercel). Do not use `@expo/ui` `List` for feeds — it is grouped native rows, not a virtualized list.

## Platform

- **iOS-only.** Ignore Android-only Callstack refs (R8, 16 KB page size, Play alignment) unless someone explicitly adds Android.
- Do not add Android permissions, Gradle, or Play Console work.

## Skills on disk

Installed under `.agents/skills/`:

| Source | Skill folder | Notes |
| --- | --- | --- |
| expo/skills | all Expo/EAS skills except `expo-ui` | Harmless extras (App Clip, brownfield, skill-eval) kept |
| vercel-labs/agent-skills | `vercel-react-native-skills` | Styling/list rules overridden above |
| callstackincubator/agent-skills | `react-native-best-practices` | Performance |
| software-mansion-labs/skills | `software-mansion-react-native-best-practices` | Renamed so it does not clobber Callstack |
| tamagui/tamagui (main, v3) | `tamagui`, `tamagui-theme-generator`, `tamagui-upgrade-v3`, `tamagui-v6-config` | Match Tamagui 3.x |

Dropped: **`expo-ui`** (conflicts with Tamagui as the UI kit).

## Native vs JS

Any new native module, config plugin, permission, or entitlement requires a new iOS build. Tamagui JS/theme changes can ship as JS once Reanimated / Gesture Handler are already in the binary. See `docs/LEARNINGS.md`.
