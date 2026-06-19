import React, { useMemo, useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useAuth } from '../../src/contexts/AuthContext';
import { useTranslation } from '../../src/contexts/I18nContext';
import { useStore } from '../../src/contexts/StoreContext';
import { isOwner, isReceptionist, isStaff } from '../../src/utils/permissions';
import { getGreeting, formatDate, fmtTime, fmtKey } from '../../src/utils/time';
import { fmt$ } from '../../src/utils/currency';
import {
  KPI_DATA,
  WEEKLY_REVENUE,
  MONTHLY_REVENUE,
  TOP_PERFORMERS,
  OPS_DATA,
} from '../../src/data/reports';
import { getTodayAppointments, getStaffAppointments } from '../../src/data/appointments';
import { STAFF_MAP } from '../../src/data/staff';
import { generateTurnQueueState } from '../../src/data/turns';
import { StorePicker } from '../../src/components/StorePicker';
import { SectionHeader } from '../../src/components/SectionHeader';
import { Card } from '../../src/components/Card';
import { Avatar } from '../../src/components/Avatar';
import { StatusBadge } from '../../src/components/StatusBadge';
import { KPICard } from '../../src/components/KPICard';
import { BarChart, LineChart } from '../../src/components/BarChart';
import { shadows, radii, spacing } from '../../src/theme/tokens';
import type { RoleId } from '../../src/types/models';

// ─── Helpers ────────────────────────────────────────────

function greetingKey(t: (k: string) => string): string {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return t('greetMorning');
  if (h >= 12 && h < 17) return t('greetAfternoon');
  return t('greetEvening');
}

/** Convert a hex color to rgba with the given alpha (for gradient fade) */
function withAlpha(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const SCHEDULE_LIST_HEIGHT = 450;
const FADE_HEIGHT = 60;

// ─── Shared Schedule List (staff + receptionist) ────────

import type { Appointment } from '../../src/types/models';

function ScheduleList({
  appointments,
  showTech,
  t,
}: {
  appointments: Appointment[];
  showTech?: boolean;
  t: (k: string) => string;
}) {
  const { colors, mode } = useTheme();
  const nowMin = new Date().getHours() * 60 + new Date().getMinutes();

  // High-contrast card text — theme tokens are too muted in dark mode
  const cardText = mode === 'dark' ? '#FFFFFF' : colors.obsidian;
  const cardGold = mode === 'dark' ? '#F5DFA0' : colors.goldDeep;

  return (
    <View style={{ height: SCHEDULE_LIST_HEIGHT }}>
      {appointments.length === 0 ? (
        <View style={styles.emptyList}>
          <Feather name="sun" size={28} color={colors.textFaint} />
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>
            No upcoming appointments for today
          </Text>
        </View>
      ) : (
        <>
          <ScrollView
            nestedScrollEnabled
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: FADE_HEIGHT }}
          >
            <View style={styles.timeline}>
              {appointments.map((appt, i) => {
                const isCurrent =
                  appt.startMin <= nowMin && appt.endMin > nowMin;
                const techName =
                  showTech && appt.staffId
                    ? STAFF_MAP[appt.staffId]
                      ? `${STAFF_MAP[appt.staffId].first} ${STAFF_MAP[appt.staffId].last}`
                      : null
                    : null;

                return (
                  <View key={appt.id} style={styles.timelineRow}>
                    {/* Time rail */}
                    <View style={styles.timelineRail}>
                      <View
                        style={[
                          styles.timelineDot,
                          {
                            backgroundColor: isCurrent
                              ? colors.gold
                              : colors.charcoal,
                          },
                        ]}
                      />
                      {i < appointments.length - 1 && (
                        <View
                          style={[
                            styles.timelineLine,
                            { backgroundColor: colors.border },
                          ]}
                        />
                      )}
                    </View>

                    {/* Card */}
                    <Card
                      style={[
                        styles.scheduleCard,
                        isCurrent
                          ? {
                              borderLeftWidth: 3,
                              borderLeftColor: colors.gold,
                            }
                          : undefined,
                      ] as any}
                    >
                      <View style={styles.scheduleCardHeader}>
                        <Text
                          style={[
                            styles.scheduleTime,
                            {
                              color: isCurrent ? cardGold : cardText,
                            },
                          ]}
                        >
                          {fmtTime(appt.startMin)} - {fmtTime(appt.endMin)}
                        </Text>
                        <StatusBadge status={appt.status} />
                      </View>
                      <Text
                        style={[
                          styles.scheduleClient,
                          { color: cardGold },
                        ]}
                        numberOfLines={1}
                      >
                        {appt.client}
                      </Text>
                      <Text
                        style={[
                          styles.scheduleService,
                          { color: cardText },
                        ]}
                        numberOfLines={1}
                      >
                        {appt.service}
                      </Text>
                      {techName && (
                        <View style={styles.scheduleTechRow}>
                          <Feather
                            name="user"
                            size={11}
                            color={cardText}
                          />
                          <Text
                            style={[
                              styles.scheduleTechName,
                              { color: cardText },
                            ]}
                            numberOfLines={1}
                          >
                            {techName}
                          </Text>
                        </View>
                      )}
                    </Card>
                  </View>
                );
              })}
            </View>
          </ScrollView>
          <LinearGradient
            colors={[withAlpha(colors.cream, 0), colors.cream]}
            style={styles.listFade}
            pointerEvents="none"
          />
        </>
      )}
    </View>
  );
}

// ─── Owner Home ─────────────────────────────────────────

function OwnerHome() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();

  const [revenueRange, setRevenueRange] = useState<'week' | 'month'>('week');

  const barData = (revenueRange === 'week' ? WEEKLY_REVENUE : MONTHLY_REVENUE).map((d) => ({
    label: d.day,
    value: d.amount,
  }));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.cream }} edges={['top']}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.greetingRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.greeting, { color: colors.obsidian }]}>
                {greetingKey(t)}, {user?.first}
              </Text>
              <Text style={[styles.dateText, { color: colors.textMuted }]}>
                {formatDate(new Date())}
              </Text>
            </View>
            <StorePicker />
          </View>
        </View>

        {/* KPI Cards — horizontal scroll */}
        <View style={styles.kpiSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.kpiScroll}
          >
            <KPICard
              value={fmt$(KPI_DATA.todayRevenue.value)}
              subtitle={t('dashTodayRevenue')}
              change={KPI_DATA.todayRevenue.change}
            />
            <KPICard
              value={String(KPI_DATA.appointments.value)}
              subtitle={t('dashAppointments')}
              secondaryLabel={`${KPI_DATA.appointments.remaining} remaining`}
            />
            <KPICard
              value={fmt$(KPI_DATA.avgTicket.value)}
              subtitle={t('dashAvgTicket')}
              change={KPI_DATA.avgTicket.change}
              changeSuffix=""
            />
            <KPICard
              value={`${KPI_DATA.utilization.value}%`}
              subtitle={t('dashUtilization')}
              progress={KPI_DATA.utilization.value}
            />
          </ScrollView>
        </View>

        {/* Revenue chart */}
        <View style={styles.section}>
          <View style={styles.revHeaderRow}>
            <View>
              <View style={[styles.revFilament, { backgroundColor: colors.gold }]} />
              <Text style={[styles.revLabel, { color: colors.textMuted }]}>
                {t('dashRevenueThisWeek').replace(/ this .+/i, '').toUpperCase() || 'REVENUE'}
              </Text>
            </View>
            <View style={[styles.revToggleTrack, { backgroundColor: colors.border }]}>
              <Pressable
                style={[
                  styles.revToggleBtn,
                  revenueRange === 'week' && { backgroundColor: colors.goldSoft },
                ]}
                onPress={() => setRevenueRange('week')}
              >
                <Text style={[
                  styles.revToggleBtnText,
                  { color: colors.textMuted },
                  revenueRange === 'week' && { color: colors.goldDeep },
                ]}>
                  {t('rpThisWeek')}
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.revToggleBtn,
                  revenueRange === 'month' && { backgroundColor: colors.goldSoft },
                ]}
                onPress={() => setRevenueRange('month')}
              >
                <Text style={[
                  styles.revToggleBtnText,
                  { color: colors.textMuted },
                  revenueRange === 'month' && { color: colors.goldDeep },
                ]}>
                  {t('rpThisMonth')}
                </Text>
              </Pressable>
            </View>
          </View>
          <Card style={styles.chartCard}>
            {revenueRange === 'week'
              ? <BarChart data={barData} height={110} />
              : <LineChart data={barData} height={110} showDots={false} xLabelInterval={5} />
            }
          </Card>
        </View>

        {/* Top Performers */}
        <View style={styles.section}>
          <SectionHeader title={t('dashTopPerformers')} showFilament />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.performersScroll}
          >
            {TOP_PERFORMERS.map((perf, i) => (
              <Card key={perf.id} style={styles.performerCard}>
                <View style={styles.performerTop}>
                  <Avatar initials={perf.initials} gold={perf.gold} size="card" />
                  {i === 0 && (
                    <View
                      style={[
                        styles.crownBadge,
                        { backgroundColor: colors.goldSoft },
                      ]}
                    >
                      <Feather name="award" size={12} color={colors.goldDeep} />
                    </View>
                  )}
                </View>
                <Text
                  style={[styles.performerName, { color: colors.obsidian }]}
                  numberOfLines={1}
                >
                  {perf.name}
                </Text>
                <Text style={[styles.performerStat, { color: colors.textMuted }]}>
                  {fmt$(perf.revenue)} · {perf.appointments} appts
                </Text>
              </Card>
            ))}
          </ScrollView>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <View style={styles.actionsRow}>
            <Pressable
              style={[styles.actionPill, { backgroundColor: colors.gold }]}
              onPress={() => router.push('/(tabs)/appointments/book')}
            >
              <Feather name="plus" size={16} color={colors.goldButtonText} />
              <Text style={[styles.actionText, { color: colors.goldButtonText }]}>
                {t('dashBookAppt')}
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.actionPill,
                {
                  backgroundColor: colors.warmWhite,
                  borderWidth: 1,
                  borderColor: colors.borderStrong,
                },
              ]}
              onPress={() => router.push('/(tabs)/more/reports')}
            >
              <Feather name="bar-chart-2" size={16} color={colors.charcoal} />
              <Text style={[styles.actionText, { color: colors.charcoal }]}>
                {t('dashViewReports')}
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Receptionist Home ──────────────────────────────────

function ReceptionistHome() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();

  const todayAppts = getTodayAppointments();

  const nowMin = new Date().getHours() * 60 + new Date().getMinutes();
  const upcoming = useMemo(
    () =>
      todayAppts
        .filter((a) => a.status !== 'finished' && a.endMin >= nowMin)
        .sort((a, b) => a.startMin - b.startMin),
    [todayAppts, nowMin]
  );

  const ops = OPS_DATA;

  const quickStats: { label: string; value: number; icon: string; color: string }[] = [
    { label: t('dashBooked'), value: ops.bookedToday, icon: 'calendar', color: colors.charcoal },
    { label: t('dashWaiting'), value: ops.waiting, icon: 'clock', color: colors.statusPendingText },
    { label: t('dashInService'), value: ops.inService, icon: 'scissors', color: colors.statusInProgressText },
    { label: t('dashReadyCheckout'), value: ops.readyCheckout, icon: 'check-circle', color: colors.statusCompletedText },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.cream }} edges={['top']}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.greetingRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.greeting, { color: colors.obsidian }]}>
                {greetingKey(t)}, {user?.first}
              </Text>
              <Text style={[styles.dateText, { color: colors.textMuted }]}>
                {formatDate(new Date())}
              </Text>
            </View>
            <StorePicker />
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsGrid}>
        {quickStats.map((stat) => (
          <Card key={stat.label} style={styles.statCard}>
            <Feather name={stat.icon as any} size={18} color={stat.color} />
            <Text style={[styles.statValue, { color: colors.obsidian }]}>
              {stat.value}
            </Text>
            <Text
              style={[styles.statLabel, { color: colors.textMuted }]}
              numberOfLines={1}
            >
              {stat.label}
            </Text>
          </Card>
        ))}
      </View>

      {/* Today's Appointments */}
      <View style={styles.section}>
        <SectionHeader title={`${t('dashUpNext')} · ${t('today')}`} showFilament />
        <ScheduleList appointments={upcoming} showTech t={t} />
      </View>

      {/* Waiting Queue */}
      {ops.waiting > 0 && (
        <View style={styles.section}>
          <SectionHeader title={t('dashWaitingQueue')} showFilament />
          <Card style={styles.waitingCard}>
            <View style={styles.waitingRow}>
              <Feather name="clock" size={20} color={colors.statusPendingText} />
              <Text style={[styles.waitingText, { color: colors.obsidian }]}>
                {ops.waiting} {ops.waiting === 1 ? 'client' : 'clients'} waiting
              </Text>
            </View>
          </Card>
        </View>
      )}

      {/* Quick Actions */}
      <View style={styles.section}>
        <View style={styles.actionsRow}>
          <Pressable
            style={[styles.actionPill, { backgroundColor: colors.gold }]}
            onPress={() => router.push('/(tabs)/appointments/book')}
          >
            <Feather name="plus" size={16} color={colors.goldButtonText} />
            <Text style={[styles.actionText, { color: colors.goldButtonText }]}>
              {t('dashBookAppt')}
            </Text>
          </Pressable>
        </View>
      </View>

        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Clock In / Out Card ───────────────────────────────

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  interpolateColor,
  Easing,
} from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function ClockCard() {
  const { colors } = useTheme();
  const [clockedIn, setClockedIn] = useState(false);
  const [clockInTime, setClockInTime] = useState<Date | null>(null);
  const [elapsed, setElapsed] = useState('0h 0m');

  // Shared values for animations
  const progress = useSharedValue(0); // 0 = clocked out, 1 = clocked in
  const cardScale = useSharedValue(1);
  const btnScale = useSharedValue(1);
  const iconRotate = useSharedValue(0);
  const textOpacity = useSharedValue(1);
  const pulseScale = useSharedValue(0); // for the ring pulse

  useEffect(() => {
    if (!clockedIn || !clockInTime) return;
    const tick = () => {
      const diff = Date.now() - clockInTime.getTime();
      const h = Math.floor(diff / 3_600_000);
      const m = Math.floor((diff % 3_600_000) / 60_000);
      setElapsed(`${h}h ${m}m`);
    };
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, [clockedIn, clockInTime]);

  const handlePress = () => {
    // Button bounce
    btnScale.value = withSequence(
      withSpring(0.88, { damping: 15, stiffness: 400 }),
      withSpring(1, { damping: 12, stiffness: 300 })
    );

    // Card pop
    cardScale.value = withSequence(
      withSpring(0.97, { damping: 15, stiffness: 400 }),
      withSpring(1, { damping: 10, stiffness: 200 })
    );

    // Icon spin
    iconRotate.value = withSequence(
      withTiming(iconRotate.value + 360, { duration: 500, easing: Easing.out(Easing.cubic) })
    );

    // Text fade out and back in
    textOpacity.value = withSequence(
      withTiming(0, { duration: 120 }),
      withTiming(1, { duration: 280 })
    );

    // Pulse ring
    pulseScale.value = 0;
    pulseScale.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) });

    if (clockedIn) {
      progress.value = withSpring(0, { damping: 18, stiffness: 200 });
      setClockedIn(false);
      setClockInTime(null);
      setElapsed('0h 0m');
    } else {
      progress.value = withSpring(1, { damping: 18, stiffness: 200 });
      setClockedIn(true);
      setClockInTime(new Date());
    }
  };

  const fmtClockTime = (d: Date) =>
    d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

  // Animated styles
  const cardAnim = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      [colors.warmWhite, colors.statusConfirmedBg]
    ),
    borderColor: interpolateColor(
      progress.value,
      [0, 1],
      [colors.border, colors.statusConfirmedText]
    ),
  }));

  const btnAnim = useAnimatedStyle(() => ({
    transform: [{ scale: btnScale.value }],
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      [colors.forest, colors.statusCancelledBg]
    ),
  }));

  const btnTextAnim = useAnimatedStyle(() => ({
    color: interpolateColor(
      progress.value,
      [0, 1],
      ['#FFFFFF', colors.statusCancelledText]
    ),
  }));

  const iconAnim = useAnimatedStyle(() => ({
    transform: [{ rotate: `${iconRotate.value}deg` }],
  }));

  const textAnim = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  const pulseAnim = useAnimatedStyle(() => ({
    position: 'absolute' as const,
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: interpolateColor(
      progress.value,
      [0, 1],
      [colors.forest, colors.statusConfirmedText]
    ),
    opacity: 1 - pulseScale.value,
    transform: [{ scale: 1 + pulseScale.value * 0.8 }],
  }));

  return (
    <Animated.View style={[styles.clockCard, cardAnim]}>
      <View style={styles.clockInfo}>
        <View style={styles.clockIconWrap}>
          <Animated.View style={iconAnim}>
            <Feather
              name={clockedIn ? 'log-out' : 'log-in'}
              size={20}
              color={clockedIn ? colors.statusConfirmedText : colors.charcoal}
            />
          </Animated.View>
          <Animated.View style={pulseAnim} />
        </View>
        <Animated.View style={[{ flex: 1 }, textAnim]}>
          <Text style={[styles.clockStatus, { color: colors.obsidian }]}>
            {clockedIn ? 'Clocked In' : 'Not Clocked In'}
          </Text>
          {clockedIn && clockInTime ? (
            <Text style={[styles.clockDetail, { color: colors.textMuted }]}>
              Since {fmtClockTime(clockInTime)} · {elapsed}
            </Text>
          ) : (
            <Text style={[styles.clockDetail, { color: colors.textMuted }]}>
              Tap to start your shift
            </Text>
          )}
        </Animated.View>
      </View>
      <AnimatedPressable
        style={[styles.clockBtn, btnAnim]}
        onPress={handlePress}
      >
        <Animated.Text style={[styles.clockBtnText, btnTextAnim]}>
          {clockedIn ? 'Clock Out' : 'Clock In'}
        </Animated.Text>
      </AnimatedPressable>
    </Animated.View>
  );
}

// ─── Staff Home ─────────────────────────────────────────

function StaffHome() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();

  const todayKey = fmtKey(new Date());

  const nowMin = new Date().getHours() * 60 + new Date().getMinutes();
  const myAppts = useMemo(
    () =>
      user
        ? getStaffAppointments(todayKey, user.id)
            .filter((a) => a.endMin >= nowMin)
            .sort((a, b) => a.startMin - b.startMin)
        : [],
    [todayKey, user, nowMin]
  );

  const turnState = useMemo(() => generateTurnQueueState(), []);
  const myTurn = turnState.find((ts) => ts.techId === user?.id);
  const turnPosition = myTurn
    ? turnState
        .filter((ts) => ts.status === 'queue' || ts.status === 'serving')
        .findIndex((ts) => ts.techId === user?.id) + 1
    : null;

  const allMyAppts = user ? getStaffAppointments(todayKey, user.id) : [];
  const totalEarnings = allMyAppts.reduce((sum, a) => sum + (a.price ?? 0), 0);
  const apptCount = myAppts.length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.cream }} edges={['top']}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with large avatar */}
        <View style={styles.header}>
          <View style={styles.staffHeaderRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.staffStoreLabel, { color: colors.textMuted }]}>
                {user?.stores[0]?.name ?? 'Store'}
              </Text>
              <Text style={[styles.greeting, { color: colors.obsidian }]}>
                {greetingKey(t)}, {user?.first}
              </Text>
              <Text style={[styles.dateText, { color: colors.textMuted }]}>
                {formatDate(new Date())}
              </Text>
            </View>
            <Avatar
              initials={user?.initials ?? ''}
              gold={user?.gold ?? false}
              size="profile"
            />
          </View>
        </View>

        {/* Clock In / Out */}
        <View style={{ paddingHorizontal: spacing.base, marginBottom: spacing.lg }}>
          <ClockCard />
        </View>

        {/* Today's stats — 3 cards */}
        <View style={styles.staffStatsRow}>
          <Card style={styles.staffStatCard}>
            <Feather name="calendar" size={18} color={colors.charcoal} />
            <Text style={[styles.statValue, { color: colors.obsidian }]}>
              {apptCount}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>
              {t('dashAppointments')}
            </Text>
          </Card>
          <Card style={styles.staffStatCard}>
            <Feather name="dollar-sign" size={18} color={colors.forest} />
            <Text style={[styles.statValue, { color: colors.obsidian }]}>
              {fmt$(totalEarnings)}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>
              {t('dashEarnings')}
            </Text>
          </Card>
          <Card style={styles.staffStatCard}>
            <Feather name="layers" size={18} color={colors.goldDeep} />
            <Text style={[styles.statValue, { color: colors.obsidian }]}>
              {turnPosition != null && turnPosition > 0
                ? `#${turnPosition}`
                : '--'}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>
              {t('dashTurnPosition')}
            </Text>
          </Card>
        </View>

        {/* My Schedule — Today */}
        <View style={styles.section}>
          <SectionHeader title={`${t('dashMySchedule')} · ${t('today')}`} showFilament />
          <ScheduleList appointments={myAppts} t={t} />
        </View>

        {/* Book Appointment */}
        <View style={styles.section}>
          <View style={styles.actionsRow}>
            <Pressable
              style={[styles.actionPill, { backgroundColor: colors.gold }]}
              onPress={() => router.push('/(tabs)/appointments/book')}
            >
              <Feather name="plus" size={16} color={colors.goldButtonText} />
              <Text style={[styles.actionText, { color: colors.goldButtonText }]}>
                {t('dashBookAppt')}
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Root dispatcher ────────────────────────────────────

export default function HomeScreen() {
  const { user } = useAuth();
  const role = user?.role as RoleId | undefined;

  if (!user || !role) return null;

  if (isOwner(role)) return <OwnerHome />;
  if (isReceptionist(role)) return <ReceptionistHome />;
  return <StaffHome />;
}

// ─── Styles ─────────────────────────────────────────────

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: spacing.xl,
  },

  // ── Header ──────────────────
  header: {
    paddingTop: spacing.md,
    paddingBottom: spacing.base,
    gap: spacing.md,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
  },
  greeting: {
    fontSize: 24,
    fontFamily: 'Jost_300Light',
    letterSpacing: -0.3,
  },
  dateText: {
    fontSize: 13,
    fontFamily: 'Jost_400Regular',
    marginTop: 2,
  },

  // ── Staff header ────────────
  staffHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    gap: spacing.base,
  },
  staffStoreLabel: {
    fontSize: 11,
    fontFamily: 'Jost_500Medium',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 2,
  },

  // ── Revenue header + toggle ─
  revHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    marginBottom: 8,
  },
  revFilament: {
    width: 20,
    height: 1.5,
    marginBottom: 6,
  },
  revLabel: {
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 3,
    textTransform: 'uppercase',
    fontFamily: 'Jost_500Medium',
  },
  revToggleTrack: {
    flexDirection: 'row',
    borderRadius: radii.pill,
    padding: 2,
  },
  revToggleBtn: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: radii.pill,
  },
  revToggleBtnText: {
    fontSize: 12,
    fontFamily: 'Jost_500Medium',
  },

  // ── KPI Section ─────────────
  kpiSection: {
    marginBottom: spacing.lg,
  },
  kpiScroll: {
    paddingHorizontal: spacing.base,
    gap: spacing.md,
  },

  // ── Sections ────────────────
  section: {
    marginBottom: spacing.lg,
  },
  chartCard: {
    marginHorizontal: spacing.base,
    paddingTop: 20,
    paddingBottom: 0,
    paddingHorizontal: spacing.base,
    overflow: 'hidden',
  },

  // ── Quick Stats (receptionist) ──
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.base,
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    minWidth: 70,
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  statValue: {
    fontSize: 20,
    fontFamily: 'Jost_600SemiBold',
  },
  statLabel: {
    fontSize: 11,
    fontFamily: 'Jost_400Regular',
    textAlign: 'center',
  },

  // ── Staff Stats ─────────────
  staffStatsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.base,
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  staffStatCard: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
  },

  // ── Waiting ─────────────────
  waitingCard: {
    marginHorizontal: spacing.base,
  },
  waitingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  waitingText: {
    fontSize: 14,
    fontFamily: 'Jost_500Medium',
  },

  // ── Empty ───────────────────
  emptyCard: {
    marginHorizontal: spacing.base,
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xl,
  },
  emptyList: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Jost_400Regular',
  },

  // ── List fade gradient ─────
  listFade: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: FADE_HEIGHT,
  },

  // ── Performers ──────────────
  performersScroll: {
    paddingHorizontal: spacing.base,
    gap: spacing.md,
  },
  performerCard: {
    width: 130,
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.base,
  },
  performerTop: {
    position: 'relative',
  },
  crownBadge: {
    position: 'absolute',
    top: -4,
    right: -8,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  performerName: {
    fontSize: 13,
    fontFamily: 'Jost_500Medium',
  },
  performerStat: {
    fontSize: 11,
    fontFamily: 'Jost_400Regular',
    textAlign: 'center',
  },

  // ── Quick Actions ───────────
  actionsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.base,
    gap: spacing.md,
  },
  actionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    height: 50,
    flex: 1,
    borderRadius: radii.pill,
  },
  actionText: {
    fontSize: 15,
    fontFamily: 'Jost_600SemiBold',
  },

  // ── Timeline (staff) ────────
  timeline: {
    paddingHorizontal: spacing.base,
  },
  timelineRow: {
    flexDirection: 'row',
    minHeight: 80,
  },
  timelineRail: {
    width: 24,
    alignItems: 'center',
    paddingTop: 6,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  timelineLine: {
    width: 1.5,
    flex: 1,
    marginTop: 4,
  },
  scheduleCard: {
    flex: 1,
    marginLeft: spacing.sm,
    marginBottom: spacing.md,
  },
  scheduleCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  scheduleTime: {
    fontSize: 12,
    fontFamily: 'Jost_500Medium',
  },
  scheduleClient: {
    fontSize: 14,
    fontFamily: 'Jost_500Medium',
  },
  scheduleService: {
    fontSize: 12,
    fontFamily: 'Jost_400Regular',
    marginTop: 2,
  },
  scheduleTechRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  scheduleTechName: {
    fontSize: 11,
    fontFamily: 'Jost_400Regular',
  },

  // ── Clock Card ──────────────
  clockCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: spacing.base,
    gap: spacing.md,
  },
  clockInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  clockIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  clockStatus: {
    fontSize: 15,
    fontFamily: 'Jost_600SemiBold',
  },
  clockDetail: {
    fontSize: 12,
    fontFamily: 'Jost_400Regular',
    marginTop: 2,
  },
  clockBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: radii.pill,
  },
  clockBtnText: {
    fontSize: 13,
    fontFamily: 'Jost_600SemiBold',
  },

  // ── FAB ─────────────────────
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
