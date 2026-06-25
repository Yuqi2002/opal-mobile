# Staff Home Calendar View — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a calendar-style alternative to the staff home "My Schedule" section that shows appointments as time-positioned blocks on a vertical timeline with hour/half-hour markers, making schedule gaps visible at a glance.

**Architecture:** A new `useScheduleLayout` hook reads/writes a layout preference (`'list'` | `'calendar'`) to AsyncStorage. The Appearance settings screen gets a second section for this toggle. `StaffHome` conditionally renders either the existing `ScheduleList` or a new `ScheduleCalendar` component. The calendar uses absolute positioning within a fixed-height container to place appointment cards at their time positions.

**Tech Stack:** React Native, AsyncStorage, react-native-reanimated (for the ongoing card glow), expo-linear-gradient (for scroll fade), existing Card/StatusBadge/SlideToStart components.

## Global Constraints

- Expo SDK 56, React 19, React Native 0.85, TypeScript 6
- No linter, formatter, or unit test runner configured
- Font: Jost (via `@expo-google-fonts/jost`)
- Design tokens imported from `src/theme/tokens.ts`, colors from `useTheme().colors`
- All user-facing strings use `t('keyName')` via `useTranslation()`
- Time values are minutes-from-midnight; business hours 480–1200 (8 AM–8 PM)
- No backend; all data from `src/data/` mock layer

## File Map

| File | Action | Responsibility |
|---|---|---|
| `src/hooks/useScheduleLayout.ts` | Create | Hook: read/write `opal-staff-schedule-layout` from AsyncStorage |
| `src/contexts/I18nContext.tsx` | Modify | Add i18n keys for schedule view labels |
| `app/(tabs)/more/appearance.tsx` | Modify | Add "Schedule View" toggle section |
| `app/(tabs)/home.tsx` | Modify | Add `ScheduleCalendar` component, wire toggle into `StaffHome` |

---

### Task 1: Create `useScheduleLayout` hook + i18n keys

**Files:**
- Create: `src/hooks/useScheduleLayout.ts`
- Modify: `src/contexts/I18nContext.tsx` (add 3 keys to `en` ~line 98, 3 keys to `vi` ~line 257)

**Interfaces:**
- Consumes: `AsyncStorage` from `@react-native-async-storage/async-storage`
- Produces: `useScheduleLayout()` → `{ scheduleLayout: 'list' | 'calendar', setScheduleLayout: (v: 'list' | 'calendar') => void }`

- [ ] **Step 1: Create the hook file**

Create `src/hooks/useScheduleLayout.ts`:

```typescript
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ScheduleLayout = 'list' | 'calendar';

const STORAGE_KEY = 'opal-staff-schedule-layout';

export function useScheduleLayout() {
  const [scheduleLayout, setLayoutState] = useState<ScheduleLayout>('list');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((val) => {
      if (val === 'calendar') setLayoutState('calendar');
    });
  }, []);

  const setScheduleLayout = (v: ScheduleLayout) => {
    setLayoutState(v);
    AsyncStorage.setItem(STORAGE_KEY, v);
  };

  return { scheduleLayout, setScheduleLayout };
}
```

- [ ] **Step 2: Add i18n keys**

In `src/contexts/I18nContext.tsx`, add to the English translations object (after the `moreAppearance` line, around line 98):

```typescript
scheduleView: 'Schedule view',
scheduleList: 'List',
scheduleListDesc: 'Appointments in a simple list',
scheduleCalendar: 'Calendar',
scheduleCalendarDesc: 'Appointments on a time grid',
```

Add to the Vietnamese translations object (after the `moreAppearance` line, around line 257):

```typescript
scheduleView: 'Chế độ lịch',
scheduleList: 'Danh sách',
scheduleListDesc: 'Cuộc hẹn trong danh sách',
scheduleCalendar: 'Lịch',
scheduleCalendarDesc: 'Cuộc hẹn trên lưới thời gian',
```

- [ ] **Step 3: Verify**

Run `npm run web` and confirm the app starts without errors. Navigate to the staff home (login as `sofia@opal.salon` / `staff123`) — should render exactly as before since nothing consumes the hook yet.

- [ ] **Step 4: Commit**

```bash
git add src/hooks/useScheduleLayout.ts src/contexts/I18nContext.tsx
git commit -m "feat: add useScheduleLayout hook and i18n keys for schedule view toggle"
```

---

### Task 2: Add schedule view toggle to Appearance screen

**Files:**
- Modify: `app/(tabs)/more/appearance.tsx`

**Interfaces:**
- Consumes: `useScheduleLayout()` from `src/hooks/useScheduleLayout.ts`, `useTranslation()` for labels
- Produces: Visual toggle in Settings > Appearance that writes the preference

- [ ] **Step 1: Add the schedule view section**

In `app/(tabs)/more/appearance.tsx`, add the imports at the top:

```typescript
import { useScheduleLayout } from '../../../src/hooks/useScheduleLayout';
import type { ScheduleLayout } from '../../../src/hooks/useScheduleLayout';
```

Add a second options array after the existing `OPTIONS` array:

```typescript
const SCHEDULE_OPTIONS: { key: ScheduleLayout; icon: keyof typeof Feather.glyphMap; labelKey: string; descKey: string }[] = [
  { key: 'list', icon: 'list', labelKey: 'scheduleList', descKey: 'scheduleListDesc' },
  { key: 'calendar', icon: 'calendar', labelKey: 'scheduleCalendar', descKey: 'scheduleCalendarDesc' },
];
```

Inside `AppearanceScreen`, add after the existing `useTheme` line:

```typescript
const { scheduleLayout, setScheduleLayout } = useScheduleLayout();
```

In the JSX, after the closing `</View>` of the THEME card's parent `<View style={styles.body}>`, replace the entire `body` View to include both sections. The body should now contain:

```tsx
<View style={styles.body}>
  <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>THEME</Text>
  <View style={[styles.card, { backgroundColor: colors.warmWhite }]}>
    {OPTIONS.map((opt, idx) => (
      <React.Fragment key={opt.key}>
        {idx > 0 && <View style={[styles.divider, { backgroundColor: colors.border }]} />}
        <Pressable
          style={styles.row}
          onPress={() => setMode(opt.key)}
        >
          <View style={[styles.iconCircle, { backgroundColor: colors.creamDark }]}>
            <Feather name={opt.icon} size={18} color={mode === opt.key ? colors.gold : colors.textMuted} />
          </View>
          <View style={styles.rowText}>
            <Text style={[styles.rowLabel, { color: colors.obsidian }]}>{opt.label}</Text>
            <Text style={[styles.rowDesc, { color: colors.textMuted }]}>{opt.desc}</Text>
          </View>
          {mode === opt.key && (
            <Feather name="check-circle" size={20} color={colors.gold} />
          )}
        </Pressable>
      </React.Fragment>
    ))}
  </View>

  <Text style={[styles.sectionLabel, { color: colors.textMuted, marginTop: 24 }]}>{t('scheduleView').toUpperCase()}</Text>
  <View style={[styles.card, { backgroundColor: colors.warmWhite }]}>
    {SCHEDULE_OPTIONS.map((opt, idx) => (
      <React.Fragment key={opt.key}>
        {idx > 0 && <View style={[styles.divider, { backgroundColor: colors.border }]} />}
        <Pressable
          style={styles.row}
          onPress={() => setScheduleLayout(opt.key)}
        >
          <View style={[styles.iconCircle, { backgroundColor: colors.creamDark }]}>
            <Feather name={opt.icon} size={18} color={scheduleLayout === opt.key ? colors.gold : colors.textMuted} />
          </View>
          <View style={styles.rowText}>
            <Text style={[styles.rowLabel, { color: colors.obsidian }]}>{t(opt.labelKey)}</Text>
            <Text style={[styles.rowDesc, { color: colors.textMuted }]}>{t(opt.descKey)}</Text>
          </View>
          {scheduleLayout === opt.key && (
            <Feather name="check-circle" size={20} color={colors.gold} />
          )}
        </Pressable>
      </React.Fragment>
    ))}
  </View>
</View>
```

- [ ] **Step 2: Verify**

Run `npm run web`. Login as `sofia@opal.salon` / `staff123`. Navigate to More > Appearance. Confirm:
- THEME section still works.
- New SCHEDULE VIEW section appears below with List and Calendar options.
- Tapping Calendar selects it (gold check circle). Tapping List switches back.
- Refreshing the page preserves the selection.

- [ ] **Step 3: Commit**

```bash
git add app/(tabs)/more/appearance.tsx
git commit -m "feat: add schedule view toggle to Appearance settings"
```

---

### Task 3: Build `ScheduleCalendar` component and wire into `StaffHome`

This is the main task. The `ScheduleCalendar` component renders a time-positioned calendar view.

**Files:**
- Modify: `app/(tabs)/home.tsx`

**Interfaces:**
- Consumes: `useScheduleLayout()`, `getStaffAppointments()`, `getDemoNow()`, `DAY_START_MIN`, `DAY_END_MIN` from time utils, `Card`, `StatusBadge`, `SlideToStart` components
- Produces: `ScheduleCalendar` component rendered conditionally inside `StaffHome`

- [ ] **Step 1: Add the `ScheduleCalendar` component**

In `app/(tabs)/home.tsx`, add these imports near the top (alongside existing imports):

```typescript
import { useScheduleLayout } from '../../src/hooks/useScheduleLayout';
import { DAY_START_MIN, DAY_END_MIN } from '../../src/utils/time';
```

Add the `ScheduleCalendar` component after the `ScheduleList` function (around line 223, before the `// ─── Owner Home` comment). Here is the complete component:

```typescript
// ─── Calendar Schedule View (staff home) ──────────────

const MIN_PX = 1.5; // pixels per minute — 90px per hour, ~1080px total
const CALENDAR_LEFT = 50; // width of the time-label gutter
const CARD_MIN_H = 70;
const ACTIVE_CARD_MIN_H = 120;

function ScheduleCalendar({
  appointments,
  t,
  nextApptId,
  onSlideStart,
  activeAppt,
  startedAt,
  onEditActive,
  onCompleteActive,
}: {
  appointments: Appointment[];
  t: (k: string) => string;
  nextApptId?: string;
  onSlideStart?: (appt: Appointment) => void;
  activeAppt?: Appointment | null;
  startedAt?: number | null;
  onEditActive?: () => void;
  onCompleteActive?: () => void;
}) {
  const { colors, mode } = useTheme();
  const scrollRef = useRef<ScrollView>(null);
  const demoNow = getDemoNow();
  const nowMin = demoNow.getHours() * 60 + demoNow.getMinutes();

  const totalHeight = (DAY_END_MIN - DAY_START_MIN) * MIN_PX;

  // Auto-scroll to current time on mount
  useEffect(() => {
    const offset = Math.max(0, (nowMin - DAY_START_MIN) * MIN_PX - 80);
    setTimeout(() => scrollRef.current?.scrollTo({ y: offset, animated: false }), 50);
  }, []);

  // Now-line position updates each minute
  const [currentMin, setCurrentMin] = useState(nowMin);
  useEffect(() => {
    const id = setInterval(() => {
      const n = getDemoNow();
      setCurrentMin(n.getHours() * 60 + n.getMinutes());
    }, 60_000);
    return () => clearInterval(id);
  }, []);

  const cardText = mode === 'dark' ? '#FFFFFF' : colors.obsidian;
  const cardGold = mode === 'dark' ? '#F5DFA0' : colors.goldDeep;

  // Build hour + half-hour markers
  const markers: { min: number; label: string; isHour: boolean }[] = [];
  for (let m = DAY_START_MIN; m <= DAY_END_MIN; m += 30) {
    const h = Math.floor(m / 60);
    const mm = m % 60;
    const isHour = mm === 0;
    const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    const suffix = h >= 12 ? 'PM' : 'AM';
    const label = isHour ? `${hour12} ${suffix}` : `${hour12}:30`;
    markers.push({ min: m, label, isHour });
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ height: totalHeight + 40, paddingBottom: 40 }}
      >
        {/* Time markers */}
        {markers.map(({ min, label, isHour }) => {
          const top = (min - DAY_START_MIN) * MIN_PX;
          return (
            <View
              key={min}
              style={[
                calStyles.markerRow,
                { top },
              ]}
            >
              <Text
                style={[
                  calStyles.markerLabel,
                  {
                    color: isHour ? colors.textMuted : colors.textFaint,
                    fontFamily: isHour ? 'Jost_500Medium' : 'Jost_400Regular',
                    fontSize: isHour ? 11 : 10,
                  },
                ]}
              >
                {label}
              </Text>
              <View
                style={[
                  calStyles.markerLine,
                  {
                    backgroundColor: colors.border,
                    opacity: isHour ? 1 : 0.5,
                    height: isHour ? StyleSheet.hairlineWidth * 2 : StyleSheet.hairlineWidth,
                  },
                ]}
              />
            </View>
          );
        })}

        {/* Now indicator */}
        {currentMin >= DAY_START_MIN && currentMin <= DAY_END_MIN && (
          <View
            style={[
              calStyles.nowRow,
              { top: (currentMin - DAY_START_MIN) * MIN_PX },
            ]}
          >
            <View style={[calStyles.nowDot, { backgroundColor: colors.sage }]} />
            <View style={[calStyles.nowLine, { backgroundColor: colors.sage }]} />
          </View>
        )}

        {/* Appointment cards */}
        {appointments.map((appt) => {
          const isActive = activeAppt?.id === appt.id;
          const isPast =
            !isActive &&
            (appt.endMin < currentMin || appt.status === 'ended' || appt.status === 'finished');
          const isNext = appt.id === nextApptId;

          const top = (Math.max(appt.startMin, DAY_START_MIN) - DAY_START_MIN) * MIN_PX;
          const calcHeight =
            (Math.min(appt.endMin, DAY_END_MIN) - Math.max(appt.startMin, DAY_START_MIN)) * MIN_PX;
          const minH = isActive ? ACTIVE_CARD_MIN_H : CARD_MIN_H;
          const height = Math.max(calcHeight, minH);

          if (isActive && startedAt && onEditActive && onCompleteActive) {
            return (
              <View
                key={appt.id}
                style={[calStyles.cardSlot, { top, minHeight: height, left: CALENDAR_LEFT + 4, right: 8 }]}
              >
                <OngoingCard
                  appt={appt}
                  startedAt={startedAt}
                  onEdit={onEditActive}
                  onComplete={onCompleteActive}
                  t={t}
                />
              </View>
            );
          }

          return (
            <View
              key={appt.id}
              style={[
                calStyles.cardSlot,
                { top, minHeight: height, left: CALENDAR_LEFT + 4, right: 8, opacity: isPast ? 0.5 : 1 },
              ]}
            >
              <Card style={calStyles.apptCard}>
                <View style={calStyles.cardHeader}>
                  <Text style={[calStyles.cardTime, { color: cardGold }]}>
                    {fmtTime(appt.startMin)} - {fmtTime(appt.endMin)}
                  </Text>
                  <StatusBadge status={appt.status} />
                </View>
                <Text style={[calStyles.cardClient, { color: cardGold }]} numberOfLines={1}>
                  {appt.client}
                </Text>
                <Text style={[calStyles.cardService, { color: cardText }]} numberOfLines={1}>
                  {appt.service}
                </Text>
                {isNext && onSlideStart && !isPast && (
                  <SlideToStart
                    label={t('asSlideToStart')}
                    onStart={() => onSlideStart(appt)}
                  />
                )}
              </Card>
            </View>
          );
        })}
      </ScrollView>

      {/* Bottom fade */}
      <LinearGradient
        colors={[withAlpha(colors.cream, 0), colors.cream]}
        style={calStyles.fade}
        pointerEvents="none"
      />
    </View>
  );
}

const calStyles = StyleSheet.create({
  markerRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },
  markerLabel: {
    width: CALENDAR_LEFT - 4,
    textAlign: 'right',
    paddingRight: 8,
  },
  markerLine: {
    flex: 1,
  },
  nowRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
  },
  nowDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: CALENDAR_LEFT - 4,
  },
  nowLine: {
    flex: 1,
    height: 2,
  },
  cardSlot: {
    position: 'absolute',
  },
  apptCard: {
    flex: 1,
    padding: 10,
    gap: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTime: {
    fontSize: 12,
    fontFamily: 'Jost_500Medium',
  },
  cardClient: {
    fontSize: 14,
    fontFamily: 'Jost_600SemiBold',
  },
  cardService: {
    fontSize: 12,
    fontFamily: 'Jost_400Regular',
  },
  fade: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
});
```

- [ ] **Step 2: Wire `ScheduleCalendar` into `StaffHome`**

In the `StaffHome` function, add the hook call near the top (after the existing `useActiveService` line):

```typescript
const { scheduleLayout } = useScheduleLayout();
```

Add a new memo for all appointments (not just upcoming) when in calendar mode. Place this after the existing `myAppts` memo:

```typescript
const allMyAppts_cal = useMemo(
  () =>
    scheduleLayout === 'calendar' && user
      ? getStaffAppointments(todayKey, user.id).sort((a, b) => a.startMin - b.startMin)
      : [],
  [scheduleLayout, todayKey, user, revision, bookingRev]
);
```

In the JSX return of `StaffHome`, make two changes:

**a) Conditionally hide the Ongoing Service section when in calendar mode.**

Change the ongoing service section wrapper from:

```tsx
{activeApptLive && startedAt && (
```

to:

```tsx
{activeApptLive && startedAt && scheduleLayout !== 'calendar' && (
```

**b) Replace the schedule section** with a conditional render. Change:

```tsx
{/* My Schedule — Today — flexes to fill remaining space */}
<View style={[styles.section, { flex: 1, marginBottom: 0 }]}>
  <SectionHeader title={`${t('dashMySchedule')} · ${t('today')}`} showFilament />
  <ScheduleList
    appointments={myAppts}
    t={t}
    nextApptId={!activeAppt && nextAppt ? nextAppt.id : undefined}
    onSlideStart={handleSlideStart}
    flexFill
  />
</View>
```

to:

```tsx
{/* My Schedule — Today — flexes to fill remaining space */}
<View style={[styles.section, { flex: 1, marginBottom: 0 }]}>
  <SectionHeader title={`${t('dashMySchedule')} · ${t('today')}`} showFilament />
  {scheduleLayout === 'calendar' ? (
    <ScheduleCalendar
      appointments={allMyAppts_cal}
      t={t}
      nextApptId={!activeAppt && nextAppt ? nextAppt.id : undefined}
      onSlideStart={handleSlideStart}
      activeAppt={activeApptLive}
      startedAt={startedAt ?? null}
      onEditActive={() =>
        activeApptLive &&
        router.push({
          pathname: '/(tabs)/appointments/edit-active',
          params: { id: activeApptLive.id, date: activeApptLive.date },
        })
      }
      onCompleteActive={completeService}
    />
  ) : (
    <ScheduleList
      appointments={myAppts}
      t={t}
      nextApptId={!activeAppt && nextAppt ? nextAppt.id : undefined}
      onSlideStart={handleSlideStart}
      flexFill
    />
  )}
</View>
```

- [ ] **Step 3: Verify list mode**

Run `npm run web`. Login as `sofia@opal.salon` / `staff123`. The staff home should look exactly the same as before (list view is the default).

- [ ] **Step 4: Verify calendar mode**

Navigate to More > Appearance. Select "Calendar" under Schedule View. Go back to Home. Confirm:
- The time rail shows 8 AM – 8 PM with hour and half-hour markers.
- Hour markers are bolder than half-hour markers.
- Appointments are positioned at their correct times.
- Gaps between appointments are visible as empty space.
- The "now" indicator line appears at the current time.
- The view auto-scrolled to the current time area.
- The "Slide to start" control appears on the next upcoming appointment.

- [ ] **Step 5: Verify active service in calendar mode**

In calendar mode, slide to start the next appointment. Confirm:
- The card turns into the green ongoing card with glow, timer, edit and complete buttons.
- The separate "Ongoing Service" section above is hidden.
- Complete the service and confirm it fades to past (reduced opacity).

- [ ] **Step 6: Verify toggle persistence**

Refresh the page. Confirm calendar mode is still selected. Switch back to List in Appearance, go to Home, confirm list view returns.

- [ ] **Step 7: Commit**

```bash
git add app/(tabs)/home.tsx
git commit -m "feat: add calendar schedule view for staff home with time-positioned appointment blocks"
```
