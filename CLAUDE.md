# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Expo version

Expo SDK 56. Read the exact versioned docs at https://docs.expo.dev/versions/v56.0.0/ before writing any code. React 19, React Native 0.85, TypeScript 6.

## Commands

```bash
npm start              # Expo dev server (metro)
npm run web            # Web dev server (expo start --web)
npm run ios            # iOS simulator
npm run android        # Android emulator

npm test               # Run all Playwright e2e tests (web, starts expo on port 8081)
npm run test:headed    # E2e tests with visible browser
npm run test:ui        # E2e tests with Playwright UI
npx playwright test e2e/auth.spec.ts  # Run a single test file
```

No linter, formatter, or unit test runner is configured.

## What this is

**Opal** is a nail salon staff-facing management app — an Expo React Native app with web support. It is a UI prototype with no backend; all data is hardcoded mock data in `src/data/`. Target device is a mobile phone (portrait orientation).

## Login credentials (mock auth)

| Email | Password | Name | Role |
|---|---|---|---|
| alex@opal.salon | owner123 | Alex Moreau | Main Owner (r01) |
| naomi@opal.salon | front123 | Naomi Walsh | Receptionist (r03) |
| sofia@opal.salon | staff123 | Sofia Reyes | Staff (r04) |
| mia@opal.salon | staff123 | Mia Tanaka | Staff (r04) |
| jade@opal.salon | staff123 | Jade Kim | Staff (r04) |

## Architecture

### Routing (expo-router, file-based)

```
app/
  _layout.tsx          — Root: ThemeProvider > I18nProvider > AuthProvider > StoreProvider > Stack
  index.tsx            — Auth gate: always redirects to /login (session restore skipped intentionally)
  login.tsx            — Email/password login
  notifications.tsx    — Modal screen
  (tabs)/
    _layout.tsx        — Bottom tab bar: Home, Appts, Turns, More
    home.tsx           — Role-dispatched dashboard (OwnerHome / ReceptionistHome / StaffHome)
    turns.tsx
    appointments/      — Stack: list, [id] detail, book, block-time
    more/              — Stack: settings hub with nested CRUD views (clients, services, products, etc.)
```

### Context providers (src/contexts/)

Four providers wrap the app in `app/_layout.tsx`, outermost to innermost:
- **ThemeContext** — light/dark mode, exposes `useTheme()` → `{ colors, mode, setMode }`. Persisted via AsyncStorage.
- **I18nContext** — English (`en`) / Vietnamese (`vi`), exposes `useTranslation()` → `{ t, language, setLanguage }`. All user-facing strings use `t('keyName')`. Supports interpolation via `t('key', { var: 'value' })`. Persisted via AsyncStorage key `opal-language`.
- **AuthContext** — email/password login against hardcoded `CREDENTIALS` map, exposes `useAuth()` → `{ user, isLoading, login, logout }`. Session persisted via AsyncStorage key `opal-session`.
- **StoreContext** — multi-store selector, exposes `useStore()` → `{ selectedStoreId, selectedStore, userStores, isAllStores, storeColor, gateStore, clearGate }`. `selectedStoreId` can be a store ID string or `'all'` (owners only). The `gateStore`/`clearGate` mechanism drives a full-screen animated transition (via `StoreGate` component in `src/components/StorePicker.tsx`) when switching stores.

`StoreGate` is rendered as a sibling to `Stack` in the root layout, overlaying the entire app during store transitions with Reanimated animations.

### Role-based permissions (src/utils/permissions.ts)

Role IDs: `r01` (Owner), `r02` (Manager), `r03` (Receptionist), `r04` (Staff). Functions like `isOwner`, `canSeeFinancials`, `canManageTables` gate UI visibility. The home screen renders entirely different components per role.

Note: `r02` (Manager) is defined in the type system but has no active mock users — it exists as a template for future expansion. `isOwner()` returns true for both `r01` and `r02`.

### Data layer (src/data/)

All mock data — no API calls. TypeScript files exporting arrays/objects:
- `users.ts` — user accounts with `UserAccount` type
- `staff.ts`, `clients.ts`, `services.ts` — entity lists
- `appointments.ts` — appointment generator using seeded PRNG (mulberry32, date-seeded for deterministic output). Helpers: `getTodayAppointments()`, `getStaffAppointments()`
- `turns.ts` — turn queue state generator
- `reports.ts` — KPI, revenue, performer data
- `stores.ts` — multi-store data (3 stores: West Village, Upper East Side, Brooklyn)
- `notifications.ts` — notification feed

All model types are defined in `src/types/models.ts`.

### Theme system (src/theme/)

- `tokens.ts` — spacing, typography, radii, shadows, avatar sizes. Used via **direct import**, not via context.
- `light.ts` / `dark.ts` — color palettes. Access via `useTheme().colors`.
- Font: Jost (loaded via `@expo-google-fonts/jost`). Weights: 300 Light, 400 Regular, 500 Medium, 600 SemiBold.
- Brand colors: cream (`#F5F0E8`), obsidian (`#1A1A18`), gold (`#D6BC8A`), forest (`#2D6A4F`).
- Gold palette has multiple variants: `gold`, `goldLight`, `goldDeep`, `goldPale`, `goldSoft`.

### Key dependencies

- **react-native-reanimated** — used for animations (Card press springs, StoreGate transitions)
- **react-native-gesture-handler** — touch interactions
- **expo-linear-gradient** — gradient avatars for gold-status staff
- **@expo/vector-icons** (Feather) — icon set used throughout the app
- **react-native-svg** — chart components (BarChart, Sparkline, ProgressRing)

### E2E tests (e2e/)

Playwright tests run against the web export (`expo start --web` on port 8081). `npm test` auto-starts the dev server. Tests run in Chromium only, with 30s timeout, 2 retries in CI. Test files: `auth`, `home`, `appointments`, `turns`, `more`, `notifications`.

## Deployment

Deployed to Vercel as a static web export. `vercel.json` configures `npx expo export --platform web` with SPA fallback rewrites (all routes rewrite to `/index.html`).

## Multi-service appointment model

One appointment = one client, but can contain multiple services each with its own technician and time range. The `Appointment` type has optional `services: AppointmentService[]` and `staffIds: string[]` fields. When `services` is present, each entry has its own `techId`, `startMin`/`endMin`, and `price`. Time values are minutes-from-midnight.

## Key patterns

- **Staff `gold` flag** — marks elite performers. Triggers gradient avatar rendering via `expo-linear-gradient` instead of solid background.
- **Appointment type keys** — `'chosen-tech' | 'misc' | 'new-customer' | 'any-tech' | 'online' | 'walk-in'` drive different booking flows and UI treatments.
- **`src/hooks/`** — exists but is currently empty; add custom hooks here.
- **`src/utils/`** — `time.ts` (fmtTime, fmtKey, formatDate, getGreeting), `currency.ts` (fmt$), `permissions.ts` (role predicates).
