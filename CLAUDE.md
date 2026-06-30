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

## Business context

### This is a mobile app — and ONLY a mobile app

**Opal Mobile is a phone app, built to be used on the go.** This is the single most important thing to keep in mind when building anything here. It is **not** the primary product and must never be designed as one.

- The **primary product is a separate receptionist app** that lives on a device **at the front desk** of the salon (a stationary, large-screen, desk-bound experience). That app is the system of record and the full-featured workhorse for running the front desk.
- **Opal Mobile is the companion product to that desk app.** Its entire reason to exist is mobility: it is what owners, receptionists, and staff use **away from the front desk** — walking the floor, between chairs, on a break, between locations, or away from the salon entirely. Think "check and act from your phone in 10 seconds," not "sit down and do back-office work."
- Every design and UX decision must assume: **small screen, portrait phone, one hand, on the move, short bursts of attention.** If a flow only makes sense sitting at a desk with a big screen and time to spare, it belongs in the desk app, not here. Favor glanceable summaries, quick actions, and progressive disclosure over dense tables and multi-step admin.

So: when in doubt, the mobile app is the *secondary, on-the-go companion*. The desk receptionist app is the *primary, stationary* product.

### The product & how it's sold

Opal is a B2B SaaS sold to **nail salon owners**. The owner is the buyer; the daily users are the people on the salon floor. This mobile app is part of the Opal product suite (alongside the front-desk receptionist app) that an owner subscribes to for their salon(s).

### The three personas

The whole app branches by role — the home screen renders entirely different experiences per persona, and permissions gate what each can see and do (see `src/utils/permissions.ts` and `app/(tabs)/home.tsx`). There are exactly **three personas**:

1. **Owner** (`r01`) — the business owner/operator. Sees financials, reporting, payroll, and business settings. Crucially, the owner is the persona who manages **across multiple locations** (see below). On the go, the owner wants to glance at how their store(s) are performing and step in where needed.
2. **Receptionist** (`r03`) — front desk. Can book/manage on behalf of clients and staff, manage the schedule and staff, but cannot see owner-level financials. On mobile, this is the receptionist *away from* the desk app — covering the floor or stepping away while still able to act.
3. **Staff** (`r04`) — the nail technicians themselves. The most personal, on-the-go persona: their own appointments, their place in the turn rotation, starting/completing the service they're working on. This is the persona who lives almost entirely on their phone while moving between chairs.

(`r02` Manager exists in the type system as a future template but has no active users; `isOwner()` treats it like an owner.)

### Multi-location management

This mobile app **supports running multiple salon locations**, and that capability is built into its core — not bolted on. The mock data models one operator with three NYC locations: **West Village** (`store_wv`), **Upper East Side** (`store_ue`), and **Brooklyn** (`store_bk`). How it works (see `src/contexts/StoreContext.tsx`, `src/data/stores.ts`, `src/data/users.ts`):

- Every user account carries a `stores` array (which locations they may access) plus a `primaryStore`. **Owners are scoped to all of their locations; receptionists and staff are scoped to a single store.** So multi-location power is primarily an **owner** capability.
- The owner can select a **specific store** or **"All Stores"** (`selectedStoreId === 'all'`, exposed as `isAllStores`). "All Stores" is an aggregate, cross-location roll-up view that only owners get — ideal for an owner checking the whole business from their phone.
- Nearly every data accessor takes a `storeId` param (`'all'` or a specific store) so appointments, staff, turns, and reports filter/aggregate per location (see the `get...(…, storeId)` helpers in `src/data/`).
- Each store has its own identity: name, address, hours, timezone, tax rate, and an **accent color** used to visually signal which location you're in. **Switching stores triggers a full-screen animated "gate" transition** (`StoreGate` in `src/components/StorePicker.tsx`, driven by `gateStore`/`clearGate`) — a deliberate, tactile "you are now in this location" moment that reads well on a phone.

The takeaway: an owner can manage and move between their locations from their phone, on the go, while receptionists and staff stay grounded in their single store.

### Bilingual by default

Real-world nail-salon staff skew heavily Vietnamese, so **English/Vietnamese bilingual support is core**, not an afterthought — all user-facing strings go through `t()` (see I18nContext).

### The problem Opal solves

Most salon software is generic appointment-booking software bolted onto a nail salon. It misses the two things that actually make a nail salon hard to run day-to-day. Opal is built specifically around these two:

1. **Turn rotation fairness** — *the core differentiator.* In a nail salon, walk-ins and unassigned clients are distributed to technicians in a rotation ("turns"). Getting this fair and transparent is a constant source of friction and disputes among staff: who's next, who got skipped, who got a big-ticket service versus a quick fill. Opal makes the rotation explicit and fair via a **weighted turn-queue system** — each service contributes weight toward a tech's turn so a long, high-value service counts more than a quick one, rather than treating every client as one equal "turn." This is the Turns tab (`app/(tabs)/turns.tsx`, data in `src/data/turns.ts`). When evaluating changes to turns, fairness and transparency of the rotation are the product goals — preserve them.

2. **Multi-service / multi-tech appointments** — *the second differentiator.* A single client is frequently worked on by **two technicians at once** (e.g. a manicure and a pedicure in parallel), or receives several services in one visit each needing its own tech, timing, and price. Generic booking tools model one appointment = one service = one provider and can't represent this cleanly. Opal treats one appointment = one client that can contain multiple services, each with its own technician and time range (see "Multi-service appointment model" below). This drives correct scheduling, accurate per-tech utilization/commission, and correct checkout totals.

Everything else (booking, checkout, walk-in, reporting, payroll, live floor ops) exists to support running a shift around those two realities. When making product or UX decisions, optimize for fast, fair, low-friction floor operation for staff — not for administrative completeness.

## Login credentials (mock auth)

| Email | Password | Name | Role | Store |
|---|---|---|---|---|
| alex@opal.salon | owner123 | Alex Moreau | Main Owner (r01) | All stores |
| naomi@opal.salon | front123 | Naomi Walsh | Receptionist (r03) | West Village |
| sofia@opal.salon | staff123 | Sofia Reyes | Staff (r04) | West Village |
| mia@opal.salon | staff123 | Mia Tanaka | Staff (r04) | West Village |
| jade@opal.salon | staff123 | Jade Kim | Staff (r04) | West Village |
| elena@opal.salon | front123 | Elena Petrov | Receptionist (r03) | Upper East Side |
| nina@opal.salon | staff123 | Nina Choi | Staff (r04) | Upper East Side |
| keiko@opal.salon | front123 | Keiko Sato | Receptionist (r03) | Brooklyn |
| tamara@opal.salon | staff123 | Tamara Chen | Staff (r04) | Brooklyn |

## Architecture

### Routing (expo-router, file-based)

```
app/
  _layout.tsx          — Root: ThemeProvider > I18nProvider > AuthProvider > StoreProvider > StaffPoliciesProvider > ActiveServiceProvider > Stack
  index.tsx            — Auth gate: always redirects to /login (session restore skipped intentionally)
  login.tsx            — Email/password login
  notifications.tsx    — Modal screen
  (tabs)/
    _layout.tsx        — Bottom tab bar: Home, Appts, Turns, More
    home.tsx           — Role-dispatched dashboard (OwnerHome / ReceptionistHome / StaffHome)
    turns.tsx
    appointments/      — Stack: list, [id] detail, book, block-time, edit-active
    more/              — Stack: settings hub. Leaf screens (profile, appearance, language,
                         business-info, business-hours, staff-policies, my-schedule, my-services,
                         earnings, reports, payroll, notifications) + nested CRUD stacks
                         (clients, services, products, staff, roles), each with index + [id] detail
```

### Context providers (src/contexts/)

Six providers wrap the app in `app/_layout.tsx`, outermost to innermost:
- **ThemeContext** — light/dark mode, exposes `useTheme()` → `{ colors, mode, setMode }`. Persisted via AsyncStorage.
- **I18nContext** — English (`en`) / Vietnamese (`vi`), exposes `useTranslation()` → `{ t, language, setLanguage }`. All user-facing strings use `t('keyName')`. Supports interpolation via `t('key', { var: 'value' })`. Persisted via AsyncStorage key `opal-language`.
- **AuthContext** — email/password login against hardcoded `CREDENTIALS` map, exposes `useAuth()` → `{ user, isLoading, login, logout }`. Session persisted via AsyncStorage key `opal-session`.
- **StoreContext** — multi-store selector, exposes `useStore()` → `{ selectedStoreId, selectedStore, userStores, isAllStores, storeColor, gateStore, clearGate }`. `selectedStoreId` can be a store ID string or `'all'` (owners only). The `gateStore`/`clearGate` mechanism drives a full-screen animated transition (via `StoreGate` component in `src/components/StorePicker.tsx`) when switching stores.
- **StaffPoliciesContext** — owner-configured policies that gate what staff can do, exposes `useStaffPolicies()` → `{ staffCanBook, staffCanBookWithinHour, turnQueueVisibility, ... setters }`. `turnQueueVisibility` is `'full' | 'limited' | 'own-only'`. Edited on the `more/staff-policies` screen, persisted via AsyncStorage key `opal-staff-policies`.
- **ActiveServiceContext** — tracks the appointment a staff member is currently servicing. Exposes `useActiveService()` → `{ activeAppt, startedAt, startService, completeService, refreshActive, revision }`. Calls `updateAppointment()` to mutate the in-memory appointment store when starting/completing.

`StoreGate` is rendered as a sibling to `Stack` in the root layout, overlaying the entire app during store transitions with Reanimated animations.

### Role-based permissions (src/utils/permissions.ts)

Role IDs: `r01` (Owner), `r02` (Manager), `r03` (Receptionist), `r04` (Staff). Functions like `isOwner`, `canSeeFinancials`, `canManageTables` gate UI visibility. The home screen renders entirely different components per role.

Note: `r02` (Manager) is defined in the type system but has no active mock users — it exists as a template for future expansion. `isOwner()` returns true for both `r01` and `r02`.

### Data layer (src/data/)

All mock data — no API calls. TypeScript files exporting arrays/objects:
- `users.ts` — user accounts with `UserAccount` type
- `staff.ts` — staff arrays per store (`STAFF_WV`, `STAFF_UE`, `STAFF_BK`) plus combined `STAFF`. Each staff member has a `storeId` field. Helpers: `getStaffForStore(storeId)`, `getTechsForStore(storeId)`, `getCalendarStaffForStore(storeId)`.
- `clients.ts`, `services.ts` — entity lists (shared across stores)
- `appointments.ts` — appointment generator using seeded PRNG (mulberry32, date+store seeded for deterministic per-store output). All functions accept optional `storeId` param (`'all'` or specific store ID). Helpers: `getAppointments(dateKey, storeId)`, `getTodayAppointments(storeId)`, `getStaffAppointments(dateKey, staffId, storeId)`, `getAppointmentsForRange(startDate, endDate, storeId)`. Also has a **mutable in-memory store**: `addAppointment()` persists new bookings, `updateAppointment(id, partial)` applies overrides. Both are session-only (lost on reload).
- `turns.ts` — turn queue state generator. `generateTurnQueueState(storeId)` returns turn data for store-specific technicians.
- `reports.ts` — all report data is now generated dynamically from appointments. Key functions: `getKpiData(storeId)`, `getWeeklyRevenue(storeId)`, `getMonthlyRevenue(storeId)`, `getTopPerformers(storeId)`, `getServiceMix(startDate, endDate, storeId)`, `getTechLeaderboard(startDate, endDate, storeId)`, `getHourlyBreakdown(storeId)`, `getOpsData(storeId)`, `getPayrollData(startDate, endDate, storeId)`, `getStaffEarnings(staffId, startDate, endDate, storeId)`. Static backward-compatible exports still exist but default to `'all'`.
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
- **`SlideToStart` component** — a swipe-to-confirm gesture control (`src/components/SlideToStart.tsx`) using Reanimated + GestureHandler. Used on the staff home screen to start servicing an appointment.
- **`src/hooks/`** — `useNewApptHighlight.ts` (a module-level pub/sub — `emitNewAppt`/`subscribeNewAppt` — so the booking screen can tell the appointments list to scroll to and glow a just-created appointment) and `useScheduleLayout.ts` (persisted `'list' | 'calendar'` toggle for the staff schedule view, AsyncStorage key `opal-staff-schedule-layout`).
- **`src/utils/`** — `time.ts` (fmtTime, fmtKey, formatDate, getGreeting), `currency.ts` (fmt$), `permissions.ts` (role predicates).
