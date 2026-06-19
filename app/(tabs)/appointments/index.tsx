import React, { useState, useMemo, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  FlatList,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../../src/contexts/ThemeContext';
import { useAuth } from '../../../src/contexts/AuthContext';
import { useTranslation } from '../../../src/contexts/I18nContext';
import { getAppointments, getStaffAppointments } from '../../../src/data/appointments';
import { CALENDAR_STAFF } from '../../../src/data/staff';
import { APPT_TYPES } from '../../../src/data/services';
import { fmtKey, fmtTime, formatDate } from '../../../src/utils/time';
import { fmtCurrency } from '../../../src/utils/currency';
import { isOwner, isReceptionist, isStaff } from '../../../src/utils/permissions';
import { Avatar } from '../../../src/components/Avatar';
import { StatusBadge } from '../../../src/components/StatusBadge';
import { SearchBar } from '../../../src/components/SearchBar';
import { EmptyState } from '../../../src/components/EmptyState';
import { Card } from '../../../src/components/Card';
import { StorePicker } from '../../../src/components/StorePicker';
import { shadows } from '../../../src/theme/tokens';
import type { Appointment } from '../../../src/types/models';

type TabMode = 'upcoming' | 'past';
type TimeGroup = 'Morning' | 'Afternoon' | 'Evening';

const STAFF_MAP: Record<string, (typeof CALENDAR_STAFF)[number]> = {};
CALENDAR_STAFF.forEach((s) => {
  STAFF_MAP[s.id] = s;
});

const APPT_TYPE_MAP: Record<string, string> = {};
APPT_TYPES.forEach((a) => {
  APPT_TYPE_MAP[a.key] = a.label;
});

function getTimeGroup(startMin: number): TimeGroup {
  if (startMin < 720) return 'Morning';
  if (startMin < 1020) return 'Afternoon';
  return 'Evening';
}

function groupByTime(appts: Appointment[]): Record<TimeGroup, Appointment[]> {
  const groups: Record<TimeGroup, Appointment[]> = {
    Morning: [],
    Afternoon: [],
    Evening: [],
  };
  appts.forEach((a) => {
    groups[getTimeGroup(a.startMin)].push(a);
  });
  return groups;
}

// ─── Calendar Date Picker ──────────────────────────────

const DAY_ABBR = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function CalendarDatePicker({
  selected,
  onSelect,
  disablePast,
  disableFuture,
}: {
  selected: Date;
  onSelect: (d: Date) => void;
  /** Grey out dates before today */
  disablePast?: boolean;
  /** Grey out dates after today */
  disableFuture?: boolean;
}) {
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(new Date(selected.getFullYear(), selected.getMonth(), 1));
  const todayKey = fmtKey(new Date());
  const selectedKey = fmtKey(selected);

  const goDay = (delta: number) => {
    const d = new Date(selected);
    d.setDate(d.getDate() + delta);
    const key = fmtKey(d);
    if (disablePast && key < todayKey) return;
    if (disableFuture && key > todayKey) return;
    onSelect(d);
    setViewMonth(new Date(d.getFullYear(), d.getMonth(), 1));
  };

  const goMonth = (delta: number) => {
    setViewMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
  };

  // Build calendar grid for viewMonth
  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const calendarCells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) calendarCells.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarCells.push(d);

  const handleDayPress = (day: number) => {
    const d = new Date(year, month, day);
    onSelect(d);
    setOpen(false);
  };

  // Arrow disable checks
  const prevDayKey = (() => {
    const d = new Date(selected);
    d.setDate(d.getDate() - 1);
    return fmtKey(d);
  })();
  const nextDayKey = (() => {
    const d = new Date(selected);
    d.setDate(d.getDate() + 1);
    return fmtKey(d);
  })();
  const prevDisabled = !!(disablePast && prevDayKey < todayKey);
  const nextDisabled = !!(disableFuture && nextDayKey > todayKey);

  return (
    <View style={s.calPickerContainer}>
      {/* Selected date row with arrows */}
      <View style={s.calPickerRow}>
        <Pressable
          onPress={() => goDay(-1)}
          style={s.calArrowBtn}
          hitSlop={8}
          disabled={prevDisabled}
        >
          <Feather name="chevron-left" size={20} color={prevDisabled ? colors.textFaint : colors.charcoal} />
        </Pressable>
        <Pressable onPress={() => { setViewMonth(new Date(selected.getFullYear(), selected.getMonth(), 1)); setOpen(!open); }} style={s.calDateBtn}>
          <Text style={[s.calDateText, { color: colors.obsidian }]}>{formatDate(selected)}</Text>
          <Feather name={open ? 'chevron-up' : 'chevron-down'} size={16} color={colors.textMuted} />
        </Pressable>
        <Pressable
          onPress={() => goDay(1)}
          style={s.calArrowBtn}
          hitSlop={8}
          disabled={nextDisabled}
        >
          <Feather name="chevron-right" size={20} color={nextDisabled ? colors.textFaint : colors.charcoal} />
        </Pressable>
      </View>

      {/* Dropdown calendar grid */}
      {open && (
        <View style={[s.calDropdown, { backgroundColor: colors.warmWhite, borderColor: colors.border }]}>
          {/* Month navigation */}
          <View style={s.calMonthRow}>
            <Pressable onPress={() => goMonth(-1)} hitSlop={8}>
              <Feather name="chevron-left" size={18} color={colors.charcoal} />
            </Pressable>
            <Text style={[s.calMonthLabel, { color: colors.obsidian }]}>
              {MONTH_NAMES[month]} {year}
            </Text>
            <Pressable onPress={() => goMonth(1)} hitSlop={8}>
              <Feather name="chevron-right" size={18} color={colors.charcoal} />
            </Pressable>
          </View>

          {/* Day-of-week headers */}
          <View style={s.calWeekRow}>
            {DAY_ABBR.map((d) => (
              <Text key={d} style={[s.calWeekDay, { color: colors.textFaint }]}>{d.charAt(0)}</Text>
            ))}
          </View>

          {/* Day grid */}
          <View style={s.calGrid}>
            {calendarCells.map((day, i) => {
              if (day === null) return <View key={`e-${i}`} style={s.calCell} />;
              const cellKey = fmtKey(new Date(year, month, day));
              const isSelected = cellKey === selectedKey;
              const isToday = cellKey === todayKey;
              const isDisabled = (disablePast && cellKey < todayKey) || (disableFuture && cellKey > todayKey);
              return (
                <Pressable
                  key={cellKey}
                  onPress={() => !isDisabled && handleDayPress(day)}
                  disabled={isDisabled}
                  style={[
                    s.calCell,
                    isSelected && { backgroundColor: colors.obsidian, borderRadius: 8 },
                  ]}
                >
                  <Text style={[
                    s.calDay,
                    { color: isDisabled ? colors.textFaint : isSelected ? colors.warmWhite : colors.obsidian },
                    isToday && !isSelected && !isDisabled && { color: colors.goldDeep },
                  ]}>
                    {day}
                  </Text>
                  {isToday && (
                    <View style={[s.calTodayDot, { backgroundColor: isSelected ? colors.gold : colors.goldDeep }]} />
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>
      )}
    </View>
  );
}

// ─── Tech Dropdown (Owner/Receptionist only) ─────────────

function TechDropdown({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (id: string) => void;
}) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const techs = CALENDAR_STAFF.filter((st) => st.role === 'Staff');
  const activeTech = techs.find((tc) => tc.id === selected);

  return (
    <View style={s.techDropContainer}>
      <Pressable
        onPress={() => setOpen(!open)}
        style={[s.techDropBtn, { backgroundColor: colors.warmWhite, borderColor: colors.border }]}
      >
        {activeTech ? (
          <Avatar initials={activeTech.initials} gold={activeTech.gold} size="compact" />
        ) : (
          <Feather name="users" size={14} color={colors.charcoal} />
        )}
        <Text style={[s.techDropLabel, { color: colors.obsidian }]} numberOfLines={1}>
          {activeTech ? activeTech.first : t('all')}
        </Text>
        <Feather name={open ? 'chevron-up' : 'chevron-down'} size={14} color={colors.textMuted} />
      </Pressable>

      {open && (
        <View style={[s.techDropList, { backgroundColor: colors.warmWhite, borderColor: colors.border }]}>
          <Pressable
            onPress={() => { onSelect('all'); setOpen(false); }}
            style={[s.techDropItem, selected === 'all' && { backgroundColor: colors.goldSoft }]}
          >
            <Feather name="users" size={14} color={colors.charcoal} />
            <Text style={[s.techDropItemText, { color: colors.obsidian }]}>{t('all')}</Text>
          </Pressable>
          {techs.map((tech) => (
            <Pressable
              key={tech.id}
              onPress={() => { onSelect(tech.id); setOpen(false); }}
              style={[s.techDropItem, selected === tech.id && { backgroundColor: colors.goldSoft }]}
            >
              <Avatar initials={tech.initials} gold={tech.gold} size="compact" />
              <Text style={[s.techDropItemText, { color: colors.obsidian }]}>{tech.first}</Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

// ─── Appointment Card ──────────────────────────────────

function ApptCard({ appt, onPress }: { appt: Appointment; onPress: () => void }) {
  const { colors } = useTheme();
  const tech = STAFF_MAP[appt.staffId];

  return (
    <Card onPress={onPress} style={s.apptCard}>
      <View style={s.apptCardRow}>
        <View style={s.apptCardLeft}>
          <Text style={[s.apptTime, { color: colors.obsidian }]}>
            {fmtTime(appt.startMin)} - {fmtTime(appt.endMin)}
          </Text>
          <View style={s.apptClientRow}>
            <Text style={[s.apptClient, { color: colors.obsidian }]}>{appt.client}</Text>
            {appt.vip && <StatusBadge status="vip" />}
          </View>
          <Text style={[s.apptService, { color: colors.textMuted }]}>{appt.service}</Text>
          {tech && (
            <View style={s.apptTechRow}>
              <Avatar initials={tech.initials} gold={tech.gold} size="compact" />
              <Text style={[s.apptTechName, { color: colors.charcoal }]}>
                {tech.first} {tech.last}
              </Text>
            </View>
          )}
        </View>
        <View style={s.apptCardRight}>
          <StatusBadge status={appt.status} />
          <Feather name="chevron-right" size={18} color={colors.textFaint} style={{ marginTop: 8 }} />
        </View>
      </View>
    </Card>
  );
}

// ─── Main Screen ───────────────────────────────────────

export default function AppointmentsScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();

  const [tab, setTab] = useState<TabMode>('upcoming');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [search, setSearch] = useState('');
  const [techFilter, setTechFilter] = useState('all');

  // Past/Completed tab state
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const [pastDate, setPastDate] = useState(yesterday);
  const [pastSearch, setPastSearch] = useState('');
  const [pastTechFilter, setPastTechFilter] = useState('all');

  const userRole = user?.role ?? 'r04';
  const canFilterByTech = isOwner(userRole) || isReceptionist(userRole);
  const isStaffUser = isStaff(userRole);

  // Upcoming appointments
  const upcomingAppts = useMemo(() => {
    const dateKey = fmtKey(selectedDate);
    const todayKey = fmtKey(new Date());
    const nowMin = new Date().getHours() * 60 + new Date().getMinutes();
    let appts: Appointment[];
    if (isStaffUser && user) {
      appts = getStaffAppointments(dateKey, user.id);
    } else if (techFilter !== 'all') {
      appts = getStaffAppointments(dateKey, techFilter);
    } else {
      appts = getAppointments(dateKey);
    }

    // For today, only show appointments that haven't ended yet
    if (dateKey === todayKey) {
      appts = appts.filter((a) => a.status !== 'finished' && a.endMin >= nowMin);
    }

    if (search) {
      const q = search.toLowerCase();
      appts = appts.filter(
        (a) =>
          a.client.toLowerCase().includes(q) ||
          a.service.toLowerCase().includes(q)
      );
    }

    return appts.sort((a, b) => a.startMin - b.startMin);
  }, [selectedDate, techFilter, search, isStaffUser, user]);

  const groupedUpcoming = useMemo(() => groupByTime(upcomingAppts), [upcomingAppts]);

  // Past/completed appointments for selected past date
  const pastAppts = useMemo(() => {
    const dateKey = fmtKey(pastDate);
    let appts: Appointment[];
    if (isStaffUser && user) {
      appts = getStaffAppointments(dateKey, user.id);
    } else if (pastTechFilter !== 'all') {
      appts = getStaffAppointments(dateKey, pastTechFilter);
    } else {
      appts = getAppointments(dateKey);
    }

    // Mark all as finished
    appts = appts.map((a) => ({ ...a, status: 'finished' as const }));

    if (pastSearch) {
      const q = pastSearch.toLowerCase();
      appts = appts.filter(
        (a) =>
          a.client.toLowerCase().includes(q) ||
          a.service.toLowerCase().includes(q)
      );
    }

    return appts.sort((a, b) => a.startMin - b.startMin);
  }, [pastDate, pastTechFilter, pastSearch, isStaffUser, user]);

  const groupedPast = useMemo(() => groupByTime(pastAppts), [pastAppts]);

  const navigateToDetail = useCallback(
    (apptId: string) => {
      router.push(`/(tabs)/appointments/${apptId}`);
    },
    [router]
  );

  const timeGroupLabels: Record<TimeGroup, string> = {
    Morning: t('apptMorning'),
    Afternoon: t('apptAfternoon'),
    Evening: t('apptEvening'),
  };

  const renderUpcoming = () => {
    const groups: TimeGroup[] = ['Morning', 'Afternoon', 'Evening'];
    const hasAny = upcomingAppts.length > 0;

    if (!hasAny) {
      return (
        <EmptyState
          icon="calendar"
          title={t('apptNoAppointments')}
          subtitle="No appointments scheduled for this date"
        />
      );
    }

    return (
      <View style={s.listContainer}>
        {groups.map((group) => {
          const items = groupedUpcoming[group];
          if (items.length === 0) return null;
          return (
            <View key={group} style={s.timeGroup}>
              <View style={s.groupHeaderRow}>
                <View style={[s.groupFilament, { backgroundColor: colors.gold }]} />
                <Text style={[s.groupLabel, { color: colors.textMuted }]}>
                  {timeGroupLabels[group]}
                </Text>
                <Text style={[s.groupCount, { color: colors.textFaint }]}>
                  {items.length}
                </Text>
              </View>
              {items.map((appt) => (
                <ApptCard
                  key={appt.id}
                  appt={appt}
                  onPress={() => navigateToDetail(appt.id)}
                />
              ))}
            </View>
          );
        })}
      </View>
    );
  };

  const renderPast = () => {
    const groups: TimeGroup[] = ['Morning', 'Afternoon', 'Evening'];
    const hasAny = pastAppts.length > 0;

    if (!hasAny) {
      return (
        <EmptyState
          icon="clock"
          title={t('apptNoAppointments')}
          subtitle="No completed appointments for this date"
        />
      );
    }

    return (
      <View style={s.listContainer}>
        {groups.map((group) => {
          const items = groupedPast[group];
          if (items.length === 0) return null;
          return (
            <View key={group} style={s.timeGroup}>
              <View style={s.groupHeaderRow}>
                <View style={[s.groupFilament, { backgroundColor: colors.gold }]} />
                <Text style={[s.groupLabel, { color: colors.textMuted }]}>
                  {timeGroupLabels[group]}
                </Text>
                <Text style={[s.groupCount, { color: colors.textFaint }]}>
                  {items.length}
                </Text>
              </View>
              {items.map((appt) => (
                <ApptCard
                  key={appt.id}
                  appt={appt}
                  onPress={() => navigateToDetail(appt.id)}
                />
              ))}
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: colors.cream }]} edges={['top']}>
      {/* Header */}
      <View style={s.header}>
        <Text style={[s.headerTitle, { color: colors.obsidian }]}>
          {t('navAppts')}
        </Text>
        <View style={s.headerActions}>
          <StorePicker />
          <Pressable
            onPress={() => router.push('/(tabs)/appointments/block-time')}
            style={[s.headerBtn, { backgroundColor: colors.creamDark }]}
          >
            <Feather name="clock" size={18} color={colors.charcoal} />
          </Pressable>
        </View>
      </View>

      {/* Segmented Control */}
      <View style={[s.segmentedContainer, { backgroundColor: colors.creamDark }]}>
        <Pressable
          onPress={() => setTab('upcoming')}
          style={[
            s.segment,
            tab === 'upcoming' && [{ backgroundColor: colors.obsidian }, shadows.card],
          ]}
        >
          <Text
            style={[
              s.segmentLabel,
              { color: tab === 'upcoming' ? colors.warmWhite : colors.charcoal },
            ]}
          >
            {t('apptUpcoming')}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setTab('past')}
          style={[
            s.segment,
            tab === 'past' && [{ backgroundColor: colors.obsidian }, shadows.card],
          ]}
        >
          <Text
            style={[
              s.segmentLabel,
              { color: tab === 'past' ? colors.warmWhite : colors.charcoal },
            ]}
          >
            {t('apptPast')}
          </Text>
        </Pressable>
      </View>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        {tab === 'upcoming' ? (
          <>
            {/* Calendar + Tech dropdown row */}
            <View style={s.dateAndTechRow}>
              <View style={{ flex: 1 }}>
                <CalendarDatePicker
                  selected={selectedDate}
                  onSelect={(d) => setSelectedDate(d)}
                  disablePast
                />
              </View>
              {canFilterByTech && (
                <TechDropdown selected={techFilter} onSelect={setTechFilter} />
              )}
            </View>

            {/* Search */}
            <View style={s.searchRow}>
              <SearchBar
                value={search}
                onChangeText={setSearch}
                placeholder="Search client or service..."
              />
            </View>

            {/* Appointment List */}
            {renderUpcoming()}
          </>
        ) : (
          <>
            {/* Calendar + Tech dropdown row */}
            <View style={s.dateAndTechRow}>
              <View style={{ flex: 1 }}>
                <CalendarDatePicker
                  selected={pastDate}
                  onSelect={(d) => setPastDate(d)}
                  disableFuture
                />
              </View>
              {canFilterByTech && (
                <TechDropdown selected={pastTechFilter} onSelect={setPastTechFilter} />
              )}
            </View>

            {/* Search */}
            <View style={s.searchRow}>
              <SearchBar
                value={pastSearch}
                onChangeText={setPastSearch}
                placeholder="Search client or service..."
              />
            </View>

            {/* Completed Appointment List */}
            {renderPast()}
          </>
        )}

        <View style={s.bottomSpacer} />
      </ScrollView>

      {/* FAB */}
      <Pressable
        onPress={() => router.push('/(tabs)/appointments/book')}
        style={[s.fab, { backgroundColor: colors.gold }, shadows.elevated]}
      >
        <Feather name="plus" size={24} color={colors.goldButtonText} />
      </Pressable>
    </SafeAreaView>
  );
}

// ─── Styles ────────────────────────────────────────────

const s = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'Jost_300Light',
    letterSpacing: -0.5,
  },
  headerActions: { flexDirection: 'row', gap: 8 },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Segmented Control
  segmentedContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 3,
    marginBottom: 12,
  },
  segment: {
    flex: 1,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentLabel: {
    fontSize: 14,
    fontFamily: 'Jost_500Medium',
  },

  scroll: { flex: 1 },

  // Calendar Date Picker
  calPickerContainer: {
    paddingLeft: 16,
    paddingBottom: 12,
  },
  calPickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  calArrowBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calDateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  calDateText: {
    fontSize: 16,
    fontFamily: 'Jost_500Medium',
  },
  calDropdown: {
    marginTop: 8,
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
  },
  calMonthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  calMonthLabel: {
    fontSize: 15,
    fontFamily: 'Jost_500Medium',
  },
  calWeekRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  calWeekDay: {
    flex: 1,
    textAlign: 'center',
    fontSize: 11,
    fontFamily: 'Jost_500Medium',
  },
  calGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calCell: {
    width: '14.28%' as any,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calDay: {
    fontSize: 14,
    fontFamily: 'Jost_400Regular',
  },
  calTodayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 1,
  },

  // Search
  searchRow: {
    paddingHorizontal: 16,
    marginBottom: 10,
  },

  // Tech/service filter chips (past tab)
  techFilterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  techChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    height: 32,
    borderRadius: 16,
  },
  techChipLabel: {
    fontSize: 13,
    fontFamily: 'Jost_500Medium',
  },

  // Date + Tech row
  dateAndTechRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingRight: 16,
    zIndex: 100,
  },

  // Tech dropdown
  techDropContainer: {
    paddingTop: 2,
    zIndex: 100,
  },
  techDropBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
  },
  techDropLabel: {
    fontSize: 13,
    fontFamily: 'Jost_500Medium',
    maxWidth: 70,
  },
  techDropList: {
    position: 'absolute',
    top: 40,
    right: 0,
    minWidth: 150,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 4,
    zIndex: 200,
    elevation: 20,
  },
  techDropItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  techDropItemText: {
    fontSize: 14,
    fontFamily: 'Jost_400Regular',
  },

  // Groups
  listContainer: {
    paddingHorizontal: 16,
    gap: 16,
    paddingTop: 4,
  },
  timeGroup: {
    gap: 8,
  },
  groupHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  groupFilament: {
    width: 16,
    height: 1.5,
  },
  groupLabel: {
    fontSize: 10,
    fontFamily: 'Jost_500Medium',
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  groupCount: {
    fontSize: 11,
    fontFamily: 'Jost_400Regular',
  },

  // Appointment Card
  apptCard: {
    padding: 14,
  },
  apptCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  apptCardLeft: {
    flex: 1,
    gap: 4,
  },
  apptCardRight: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  apptTime: {
    fontSize: 13,
    fontFamily: 'Jost_500Medium',
  },
  apptClientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  apptClient: {
    fontSize: 15,
    fontFamily: 'Jost_500Medium',
  },
  apptService: {
    fontSize: 13,
    fontFamily: 'Jost_400Regular',
  },
  apptTechRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  apptTechName: {
    fontSize: 12,
    fontFamily: 'Jost_400Regular',
  },

  bottomSpacer: { height: 96 },
});
