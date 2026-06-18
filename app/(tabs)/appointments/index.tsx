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
import { fmtKey, fmtTime, buildDateStrip, formatDate } from '../../../src/utils/time';
import { fmtCurrency } from '../../../src/utils/currency';
import { isOwner, isReceptionist, isStaff } from '../../../src/utils/permissions';
import { Avatar } from '../../../src/components/Avatar';
import { StatusBadge } from '../../../src/components/StatusBadge';
import { SearchBar } from '../../../src/components/SearchBar';
import { EmptyState } from '../../../src/components/EmptyState';
import { Card } from '../../../src/components/Card';
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

// ─── Date Strip ────────────────────────────────────────

function DateStrip({
  dates,
  selected,
  onSelect,
}: {
  dates: Date[];
  selected: string;
  onSelect: (d: Date) => void;
}) {
  const { colors } = useTheme();
  const todayKey = fmtKey(new Date());
  const DAY_ABBR = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={s.dateStripContent}
    >
      {dates.map((d) => {
        const key = fmtKey(d);
        const isToday = key === todayKey;
        const isSelected = key === selected;

        return (
          <Pressable
            key={key}
            onPress={() => onSelect(d)}
            style={[
              s.dateItem,
              isSelected && { backgroundColor: colors.obsidian },
            ]}
          >
            <Text
              style={[
                s.dateDow,
                {
                  color: isSelected ? colors.warmWhite : colors.textMuted,
                },
              ]}
            >
              {DAY_ABBR[d.getDay()]}
            </Text>
            <Text
              style={[
                s.dateNum,
                {
                  color: isSelected ? colors.warmWhite : colors.obsidian,
                },
              ]}
            >
              {d.getDate()}
            </Text>
            {isToday && (
              <View
                style={[
                  s.todayDot,
                  {
                    backgroundColor: isSelected ? colors.gold : colors.goldDeep,
                  },
                ]}
              />
            )}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

// ─── Tech Filter (Owner/Receptionist only) ─────────────

function TechFilter({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (id: string) => void;
}) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const techs = CALENDAR_STAFF.filter((s) => s.role === 'Staff');

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={s.techFilterRow}
    >
      <Pressable
        onPress={() => onSelect('all')}
        style={[
          s.techChip,
          selected === 'all'
            ? { backgroundColor: colors.obsidian }
            : { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.border },
        ]}
      >
        <Text
          style={[
            s.techChipLabel,
            { color: selected === 'all' ? colors.warmWhite : colors.charcoal },
          ]}
        >
          {t('all')}
        </Text>
      </Pressable>
      {techs.map((tech) => {
        const active = selected === tech.id;
        return (
          <Pressable
            key={tech.id}
            onPress={() => onSelect(tech.id)}
            style={[
              s.techChip,
              active
                ? { backgroundColor: colors.obsidian }
                : { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.border },
            ]}
          >
            <Avatar initials={tech.initials} gold={tech.gold} size="compact" />
            <Text
              style={[
                s.techChipLabel,
                { color: active ? colors.warmWhite : colors.charcoal },
              ]}
            >
              {tech.first}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
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

// ─── Past Date Range Filter ────────────────────────────

function PastFilters({
  serviceFilter,
  setServiceFilter,
  techFilter,
  setTechFilter,
  canFilterTech,
}: {
  serviceFilter: string;
  setServiceFilter: (v: string) => void;
  techFilter: string;
  setTechFilter: (v: string) => void;
  canFilterTech: boolean;
}) {
  const { colors } = useTheme();
  const serviceOptions = ['All', 'Manicure', 'Pedicure', 'Combo'];
  const techs = CALENDAR_STAFF.filter((s) => s.role === 'Staff');

  return (
    <View style={s.pastFilters}>
      {/* Service type filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.techFilterRow}
      >
        {serviceOptions.map((opt) => {
          const active = opt === serviceFilter;
          return (
            <Pressable
              key={opt}
              onPress={() => setServiceFilter(opt)}
              style={[
                s.techChip,
                active
                  ? { backgroundColor: colors.obsidian }
                  : { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.border },
              ]}
            >
              <Text
                style={[
                  s.techChipLabel,
                  { color: active ? colors.warmWhite : colors.charcoal },
                ]}
              >
                {opt}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Tech filter for owners/receptionists */}
      {canFilterTech && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[s.techFilterRow, { marginTop: 8 }]}
        >
          <Pressable
            onPress={() => setTechFilter('all')}
            style={[
              s.techChip,
              techFilter === 'all'
                ? { backgroundColor: colors.obsidian }
                : { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.border },
            ]}
          >
            <Text
              style={[
                s.techChipLabel,
                { color: techFilter === 'all' ? colors.warmWhite : colors.charcoal },
              ]}
            >
              All Techs
            </Text>
          </Pressable>
          {techs.map((tech) => {
            const active = techFilter === tech.id;
            return (
              <Pressable
                key={tech.id}
                onPress={() => setTechFilter(tech.id)}
                style={[
                  s.techChip,
                  active
                    ? { backgroundColor: colors.obsidian }
                    : { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.border },
                ]}
              >
                <Avatar initials={tech.initials} gold={tech.gold} size="compact" />
                <Text
                  style={[
                    s.techChipLabel,
                    { color: active ? colors.warmWhite : colors.charcoal },
                  ]}
                >
                  {tech.first}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      )}
    </View>
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

  // Past tab state
  const [pastServiceFilter, setPastServiceFilter] = useState('All');
  const [pastTechFilter, setPastTechFilter] = useState('all');

  const userRole = user?.role ?? 'r04';
  const canFilterByTech = isOwner(userRole) || isReceptionist(userRole);
  const isStaffUser = isStaff(userRole);

  const dateStrip = useMemo(() => buildDateStrip(new Date(), 14), []);

  // Upcoming appointments
  const upcomingAppts = useMemo(() => {
    const dateKey = fmtKey(selectedDate);
    let appts: Appointment[];
    if (isStaffUser && user) {
      appts = getStaffAppointments(dateKey, user.id);
    } else if (techFilter !== 'all') {
      appts = getStaffAppointments(dateKey, techFilter);
    } else {
      appts = getAppointments(dateKey);
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

  // Past appointments (generate from past 7 days)
  const pastAppts = useMemo(() => {
    const all: Appointment[] = [];
    for (let i = 1; i <= 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateKey = fmtKey(d);
      let dayAppts: Appointment[];
      if (isStaffUser && user) {
        dayAppts = getStaffAppointments(dateKey, user.id);
      } else if (pastTechFilter !== 'all') {
        dayAppts = getStaffAppointments(dateKey, pastTechFilter);
      } else {
        dayAppts = getAppointments(dateKey);
      }

      // Mark all past appts as completed
      dayAppts = dayAppts.map((a) => ({ ...a, status: 'finished' as const }));
      all.push(...dayAppts);
    }

    let filtered = all;
    if (pastServiceFilter !== 'All') {
      const category = pastServiceFilter.toLowerCase();
      filtered = filtered.filter((a) => {
        const svc = a.service.toLowerCase();
        if (category === 'manicure') return svc.includes('mani') || svc.includes('gel') || svc.includes('acrylic') || svc.includes('dip') || svc.includes('removal') || svc.includes('repair');
        if (category === 'pedicure') return svc.includes('pedi');
        if (category === 'combo') return svc.includes('combo');
        return true;
      });
    }

    return filtered.sort((a, b) => {
      // Sort by date descending, then by time descending
      if (a.date !== b.date) return b.date.localeCompare(a.date);
      return b.startMin - a.startMin;
    });
  }, [pastServiceFilter, pastTechFilter, isStaffUser, user]);

  const navigateToDetail = useCallback(
    (apptId: string) => {
      router.push(`./appointments/${apptId}` as any);
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
    if (pastAppts.length === 0) {
      return (
        <EmptyState
          icon="clock"
          title={t('apptNoAppointments')}
          subtitle="No past appointments found"
        />
      );
    }

    // Group past by date
    const byDate: Record<string, Appointment[]> = {};
    pastAppts.forEach((a) => {
      if (!byDate[a.date]) byDate[a.date] = [];
      byDate[a.date].push(a);
    });

    return (
      <View style={s.listContainer}>
        {Object.entries(byDate).map(([dateKey, items]) => {
          const d = new Date(dateKey + 'T00:00:00');
          return (
            <View key={dateKey} style={s.timeGroup}>
              <View style={s.groupHeaderRow}>
                <View style={[s.groupFilament, { backgroundColor: colors.gold }]} />
                <Text style={[s.groupLabel, { color: colors.textMuted }]}>
                  {formatDate(d)}
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
          <Pressable
            onPress={() => router.push('./appointments/block-time' as any)}
            style={[s.headerBtn, { backgroundColor: colors.creamDark }]}
          >
            <Feather name="clock" size={18} color={colors.charcoal} />
          </Pressable>
          <Pressable
            onPress={() => router.push('./appointments/book' as any)}
            style={[s.addBtn, { backgroundColor: colors.obsidian }]}
          >
            <Feather name="plus" size={18} color={colors.warmWhite} />
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
            {/* Date Strip */}
            <DateStrip
              dates={dateStrip}
              selected={fmtKey(selectedDate)}
              onSelect={(d) => setSelectedDate(d)}
            />

            {/* Search */}
            <View style={s.searchRow}>
              <SearchBar
                value={search}
                onChangeText={setSearch}
                placeholder="Search client or service..."
              />
            </View>

            {/* Tech filter (owners/receptionists only) */}
            {canFilterByTech && (
              <TechFilter selected={techFilter} onSelect={setTechFilter} />
            )}

            {/* Appointment List */}
            {renderUpcoming()}
          </>
        ) : (
          <>
            {/* Past filters */}
            <PastFilters
              serviceFilter={pastServiceFilter}
              setServiceFilter={setPastServiceFilter}
              techFilter={pastTechFilter}
              setTechFilter={setPastTechFilter}
              canFilterTech={canFilterByTech}
            />

            {/* Past Appointment List */}
            {renderPast()}
          </>
        )}

        <View style={s.bottomSpacer} />
      </ScrollView>
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
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
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

  // Date Strip
  dateStripContent: {
    paddingHorizontal: 16,
    gap: 4,
    paddingBottom: 12,
  },
  dateItem: {
    width: 48,
    height: 68,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  dateDow: {
    fontSize: 11,
    fontFamily: 'Jost_400Regular',
  },
  dateNum: {
    fontSize: 18,
    fontFamily: 'Jost_500Medium',
  },
  todayDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },

  // Search
  searchRow: {
    paddingHorizontal: 16,
    marginBottom: 10,
  },

  // Tech filter
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

  // Past filters
  pastFilters: {
    paddingTop: 4,
    paddingBottom: 4,
  },

  bottomSpacer: { height: 32 },
});
