import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../../src/contexts/ThemeContext';
import { useTranslation } from '../../../src/contexts/I18nContext';
import { useAuth } from '../../../src/contexts/AuthContext';
import { Card } from '../../../src/components/Card';
import { FilterChips } from '../../../src/components/FilterChips';
import { getStaffEarnings } from '../../../src/data/reports';
import { fmt$ } from '../../../src/utils/currency';

const PERIOD_OPTIONS = ['This week', 'Last week', 'This month', 'Last month'];

function getPeriodDates(period: string): { start: Date; end: Date } {
  const today = new Date();
  const start = new Date(today);
  const end = new Date(today);
  switch (period) {
    case 'Last week': {
      const dayOfWeek = today.getDay();
      start.setDate(today.getDate() - ((dayOfWeek + 6) % 7) - 7);
      end.setDate(start.getDate() + 6);
      break;
    }
    case 'This month':
      start.setDate(1);
      break;
    case 'Last month':
      start.setMonth(today.getMonth() - 1, 1);
      end.setDate(0); // last day of prev month
      break;
    default: // This week
      start.setDate(today.getDate() - ((today.getDay() + 6) % 7));
      break;
  }
  return { start, end };
}

export default function EarningsScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useAuth();
  const [period, setPeriod] = useState(PERIOD_OPTIONS[0]);

  const { start, end } = useMemo(() => getPeriodDates(period), [period]);
  const staffId = user?.id ?? 'sofia';
  const storeId = user?.primaryStore ?? 'store_wv';

  const earnings = useMemo(
    () => getStaffEarnings(staffId, start, end, storeId),
    [staffId, start, end, storeId]
  );

  const { totalEarnings, breakdown, hoursWorked, apptsCompleted, avgTicket, dailyBreakdown } = earnings;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.cream }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Feather name="arrow-left" size={24} color={colors.obsidian} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.obsidian }]}>{t('earnTitle')}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Period Selector */}
        <View style={styles.periodRow}>
          <FilterChips options={PERIOD_OPTIONS} selected={period} onSelect={setPeriod} />
        </View>

        {/* Large Earnings Display */}
        <View style={styles.earningsHero}>
          <Text style={[styles.earningsLabel, { color: colors.textMuted }]}>{t('earnTotalEarnings')}</Text>
          <Text style={[styles.earningsValue, { color: colors.goldDeep }]}>{fmt$(totalEarnings)}</Text>
        </View>

        {/* Breakdown */}
        <View style={styles.breakdownRow}>
          <Card style={styles.breakdownCard}>
            <Text style={[styles.bdLabel, { color: colors.textMuted }]}>{t('pyCommission')}</Text>
            <Text style={[styles.bdValue, { color: colors.obsidian }]}>{fmt$(breakdown.commission)}</Text>
          </Card>
          <Card style={styles.breakdownCard}>
            <Text style={[styles.bdLabel, { color: colors.textMuted }]}>{t('pyTips')}</Text>
            <Text style={[styles.bdValue, { color: colors.obsidian }]}>{fmt$(breakdown.tips)}</Text>
          </Card>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <StatItem icon="clock" label={t('earnHoursWorked')} value={`${hoursWorked}h`} colors={colors} />
          <StatItem icon="check-circle" label={t('earnApptsCompleted')} value={`${apptsCompleted}`} colors={colors} />
          <StatItem icon="tag" label={t('earnAvgTicket')} value={fmt$(avgTicket)} colors={colors} />
        </View>

        {/* Daily Breakdown */}
        <View style={styles.dailySection}>
          <Text style={[styles.sectionTitle, { color: colors.obsidian }]}>{t('earnDailyBreakdown')}</Text>
          <View style={[styles.dailyCard, { backgroundColor: colors.warmWhite }]}>
            {dailyBreakdown.map((day, idx) => (
              <React.Fragment key={day.date}>
                {idx > 0 && <View style={[styles.divider, { backgroundColor: colors.border }]} />}
                <View style={[styles.dailyRow, day.isOff && styles.dailyRowOff]}>
                  <View style={styles.dailyLeft}>
                    <Text
                      style={[
                        styles.dailyDate,
                        { color: day.isOff ? colors.textFaint : colors.obsidian },
                      ]}
                    >
                      {day.date}
                    </Text>
                    {day.isOff ? (
                      <Text style={[styles.dailyMeta, { color: colors.textFaint }]}>Day off</Text>
                    ) : (
                      <Text style={[styles.dailyMeta, { color: colors.textMuted }]}>
                        {day.hours}h · {day.appts} appts
                      </Text>
                    )}
                  </View>
                  <Text
                    style={[
                      styles.dailyEarnings,
                      { color: day.isOff ? colors.textFaint : colors.obsidian },
                    ]}
                  >
                    {day.isOff ? '-' : fmt$(day.earnings)}
                  </Text>
                </View>
              </React.Fragment>
            ))}
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

function StatItem({
  icon,
  label,
  value,
  colors,
}: {
  icon: string;
  label: string;
  value: string;
  colors: any;
}) {
  return (
    <View style={styles.statItem}>
      <Feather name={icon as any} size={18} color={colors.goldDeep} />
      <Text style={[styles.statValue, { color: colors.obsidian }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.textMuted }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: { fontSize: 18, fontFamily: 'Jost_600SemiBold' },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 32 },
  periodRow: { marginTop: 4, marginBottom: 20 },
  earningsHero: { alignItems: 'center', gap: 6, marginBottom: 24 },
  earningsLabel: { fontSize: 12, fontFamily: 'Jost_500Medium', letterSpacing: 2, textTransform: 'uppercase' },
  earningsValue: { fontSize: 40, fontFamily: 'Jost_300Light' },
  breakdownRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 10, marginBottom: 20 },
  breakdownCard: { flex: 1, padding: 14, alignItems: 'center', gap: 4 },
  bdLabel: { fontSize: 12, fontFamily: 'Jost_400Regular' },
  bdValue: { fontSize: 20, fontFamily: 'Jost_600SemiBold' },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    marginBottom: 28,
  },
  statItem: { alignItems: 'center', gap: 4 },
  statValue: { fontSize: 16, fontFamily: 'Jost_600SemiBold' },
  statLabel: { fontSize: 11, fontFamily: 'Jost_400Regular', textAlign: 'center', maxWidth: 80 },
  dailySection: { paddingHorizontal: 16 },
  sectionTitle: { fontSize: 16, fontFamily: 'Jost_600SemiBold', marginBottom: 10 },
  dailyCard: { borderRadius: 14, overflow: 'hidden' },
  dailyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 },
  dailyRowOff: { opacity: 0.6 },
  dailyLeft: { gap: 2 },
  dailyDate: { fontSize: 14, fontFamily: 'Jost_500Medium' },
  dailyMeta: { fontSize: 12, fontFamily: 'Jost_400Regular' },
  dailyEarnings: { fontSize: 16, fontFamily: 'Jost_600SemiBold' },
  divider: { height: StyleSheet.hairlineWidth },
  bottomSpacer: { height: 24 },
});
