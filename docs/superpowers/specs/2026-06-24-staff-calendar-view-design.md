# Staff Home: Calendar Schedule View

**Date**: 2026-06-24
**Status**: Approved

## Overview

Add an alternative calendar-style view for the "My Schedule - Today" section on the staff home page. Instead of a stacked card list, appointments render as time-positioned blocks in a single-column timeline spanning 8 AM - 8 PM. Empty gaps between appointments become visually obvious, helping technicians see where they can take walk-ins or breaks.

The current list view is preserved. A toggle in Settings > Appearance lets staff switch between `list` (default) and `calendar`.

## What changes

Only the "MY SCHEDULE - TODAY" section inside `StaffHome` (in `app/(tabs)/home.tsx`). Everything above it (header, clock card, stats row) and below it (Book Appointment button) stays the same. In calendar mode, the separate "Ongoing Service" section is hidden because the active appointment renders inline on the calendar at its time position.

## Calendar view specification

### Time rail

- Vertical axis spans full business hours: **8:00 AM - 8:00 PM** (480 - 1200 minutes-from-midnight).
- The view is a `ScrollView`. On mount, it **auto-scrolls to the current time** (or demo time via `getDemoNow()`), offset ~80px above so the user sees some context before "now."
- **Hour markers**: bold text labels on the left (e.g., "9 AM", "10 AM") with a horizontal line extending across the full width. Use `colors.textMuted` for text, `colors.border` for the line.
- **Half-hour markers**: lighter text labels (e.g., "9:30") with a thinner, fainter horizontal line. Use `colors.textFaint` for text, `colors.border` at reduced opacity for the line.
- A **"now" indicator** line: a horizontal line at the current time position, colored `colors.sage`, with a small dot on the left edge. Updates each minute.

### Pixels-per-minute scale

- Use a constant `MIN_PX` (pixels per minute). A value of **1.5** gives 90px per hour, making the 12-hour span ~1080px tall - comfortably scrollable on mobile.
- Appointment card vertical position: `(appt.startMin - DAY_START_MIN) * MIN_PX`
- Appointment card height: `(appt.endMin - appt.startMin) * MIN_PX`

### Appointment cards

Cards render inside the calendar column to the right of the time labels. They are **absolutely positioned** within a container whose height is `(DAY_END_MIN - DAY_START_MIN) * MIN_PX`.

**Normal appointments** (not started):
- Same content as current list cards: time range, client name, service name, status badge.
- Background: `colors.warmWhite` (same Card style used elsewhere).
- If this is the **next upcoming appointment** and no service is active, show the `SlideToStart` component at the bottom of the card, same as the list view.
- **Minimum height**: 70px, so short services (15-20 min) remain readable. If the calculated height is less than 70px, use 70px instead.

**Active/started appointment** (the appointment currently being serviced):
- Rendered inline in the calendar at its time position (NOT in the separate "Ongoing Service" section above — that section is hidden when using calendar view, since the active appointment is visible in-place).
- Green-highlighted card matching the current `OngoingCard` style: sage border glow, pulsing shadow, "In Progress" live indicator with dot, elapsed timer badge.
- Edit Service and Complete Service buttons at the bottom of the card.
- Minimum height: 120px to fit all controls comfortably.

**Past appointments** (endMin < nowMin, status = 'ended' or 'finished'):
- Shown but with reduced opacity (0.5) to visually de-emphasize.

### What to show

Unlike the current list view which filters to only upcoming appointments, the calendar view shows **all of the staff member's appointments for the day** (past, current, and future). Past appointments appear faded. This gives a complete picture of the day.

## Settings toggle

### Storage

- AsyncStorage key: `opal-staff-schedule-layout`
- Values: `'list'` (default) | `'calendar'`
- Follows the same pattern as ThemeContext / I18nContext: load on mount, persist on change.

### Appearance screen changes

Add a second section to `app/(tabs)/more/appearance.tsx` below the existing THEME section:

```
SCHEDULE VIEW
  [list icon]  List View       Appointments in a simple list        [check if active]
  [calendar icon] Calendar     Appointments on a time grid          [check if active]
```

Same visual style as the THEME toggle: icon circle, label, description, check-circle indicator.

### Plumbing

Create a small context or hook (`useScheduleLayout`) that:
1. Reads `opal-staff-schedule-layout` from AsyncStorage on mount.
2. Exposes `{ scheduleLayout, setScheduleLayout }`.
3. `StaffHome` reads `scheduleLayout` to decide which component to render.

Alternatively, since this is a single value, a simple hook with `useState` + `useEffect` (matching the ThemeContext pattern) is sufficient. No need for a full context provider unless other screens need it.

## Component structure

### New component: `ScheduleCalendar`

Defined inline in `app/(tabs)/home.tsx` alongside `ScheduleList` (follows the existing pattern where all StaffHome sub-components live in the same file).

**Props** (same interface as `ScheduleList` plus active service data):
```typescript
{
  appointments: Appointment[];       // ALL appointments for the day (unfiltered)
  t: (k: string) => string;
  nextApptId?: string;               // ID of next upcoming appointment
  onSlideStart?: (appt: Appointment) => void;
  activeAppt?: Appointment | null;   // Currently active appointment
  startedAt?: number | null;         // When the active service started
  onEditActive?: () => void;         // Edit active service
  onCompleteActive?: () => void;     // Complete active service
}
```

### StaffHome changes

- Import/use the schedule layout preference.
- When `scheduleLayout === 'calendar'`:
  - Hide the separate "Ongoing Service" section (it's shown inline in the calendar).
  - Pass all appointments (not filtered to upcoming-only) to `ScheduleCalendar`.
  - Pass active service props through.
- When `scheduleLayout === 'list'` (default):
  - Existing behavior unchanged.

## Visual layout sketch

```
|  8 AM ──────────────────────────── |
|                                    |
|  8:30  · · · · · · · · · · · · ·  |
|                                    |
|  9 AM ──────────────────────────── |
|       ┌──────────────────────────┐ |
|       │ 9:15 AM - 10:00 AM  [C] │ |
|  9:30 │ Jane Doe             · · │ |
|       │ Gel Manicure             │ |
|       │        [Slide to start]  │ |
|       └──────────────────────────┘ |
| 10 AM ──────────────────────────── |
|                                    |
| 10:30  · · · · · · · · · · · · ·  |
|                                    |  <-- visible gap = free time
| 11 AM ──────────────────────────── |
|       ┌──────────────────────────┐ |
|       │ 11:00 AM - 12:15 PM [C] │ |
| 11:30 │ Sarah Kim            · · │ |
|       │ Full Set Acrylics        │ |
| 12 PM │                          │ |
|       └──────────────────────────┘ |
```

Time labels sit in a fixed-width left column (~50px). Appointment cards fill the remaining width with small horizontal margin.

## Edge cases

- **Overlapping appointments**: If two appointments overlap in time (multi-service with different techs), stack them vertically at their respective positions. Overlap is rare for a single technician, so no side-by-side layout needed.
- **Appointment extends past 8 PM**: Clamp the visual bottom to 8 PM. The card content still shows the real end time.
- **No appointments**: Show the empty calendar with time markers. No special empty state needed — the emptiness IS the message.
- **Short appointments (< 20 min)**: Use minimum card height (70px). The card may visually overlap the next time marker, which is acceptable.

## Out of scope

- Drag-to-create appointments by tapping empty slots (future enhancement).
- Multi-column view showing other technicians' schedules.
- Pinch-to-zoom to change the time scale.
- Receptionist or owner views — this is staff-only.
