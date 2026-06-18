import React, { useState } from 'react';
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
import { StorePicker } from '../../../src/components/StorePicker';
import { Card } from '../../../src/components/Card';
import { Sparkline } from '../../../src/components/Sparkline';
import { BarChart } from '../../../src/components/BarChart';
import { ProgressRing } from '../../../src/components/ProgressRing';
import { Avatar } from '../../../src/components/Avatar';
import { FilterChips } from '../../../src/components/FilterChips';
import {
  KPI_DATA,
  WEEKLY_REVENUE,
  SERVICE_MIX,
  TECH_LEADERBOARD,
  HOURLY_BREAKDOWN,
} from '../../../src/data/reports';
import { fmt$ } from '../../../src/utils/currency';

const RANGE_OPTIONS = ['This week', 'This month', 'This quarter', 'Custom'];

export default function ReportsScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const [range, setRange] = useState('This week');

  const rangeLabels = [t('rpThisWeek'), t('rpThisMonth'), t('rpThisQuarter'), t('rpCustom')];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.cream }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Feather name="arrow-left" size={24} color={colors.obsidian} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.obsidian }]}>{t('moreReports')}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Store Picker */}
        <StorePicker />

        {/* Date Range */}
        <View style={styles.rangeRow}>
          <FilterChips
            options={rangeLabels}
            selected={rangeLabels[RANGE_OPTIONS.indexOf(range)] ?? rangeLabels[0]}
            onSelect={(opt) => {
              const idx = rangeLabels.indexOf(opt);
              setRange(RANGE_OPTIONS[idx] ?? 'This week');
            }}
          />
        </View>

        {/* KPI Grid */}
        <View style={styles.kpiGrid}>
          {/* Revenue */}
          <Card style={styles.kpiCard}>
            <Text style={[styles.kpiLabel, { color: colors.textMuted }]}>{t('rpRevenue')}</Text>
            <View style={styles.kpiValueRow}>
              <Text style={[styles.kpiValue, { color: colors.obsidian }]}>{fmt$(KPI_DATA.todayRevenue.value)}</Text>
              <View style={[styles.changeBadge, { backgroundColor: colors.statusConfirmedBg }]}>
                <Feather name="trending-up" size={10} color={colors.statusConfirmedText} />
                <Text style={[styles.changeText, { color: colors.statusConfirmedText }]}>
                  {KPI_DATA.todayRevenue.change}%
                </Text>
              </View>
            </View>
            <Sparkline data={KPI_DATA.todayRevenue.sparkline} width={100} height={24} />
          </Card>

          {/* Appointments */}
          <Card style={styles.kpiCard}>
            <Text style={[styles.kpiLabel, { color: colors.textMuted }]}>{t('rpAppointments')}</Text>
            <Text style={[styles.kpiValue, { color: colors.obsidian }]}>{KPI_DATA.appointments.value}</Text>
            <Text style={[styles.kpiSub, { color: colors.textFaint }]}>
              {KPI_DATA.appointments.remaining} remaining
            </Text>
          </Card>

          {/* Avg Ticket */}
          <Card style={styles.kpiCard}>
            <Text style={[styles.kpiLabel, { color: colors.textMuted }]}>{t('rpAvgTicket')}</Text>
            <View style={styles.kpiValueRow}>
              <Text style={[styles.kpiValue, { color: colors.obsidian }]}>{fmt$(KPI_DATA.avgTicket.value)}</Text>
              <View style={[styles.changeBadge, { backgroundColor: colors.statusConfirmedBg }]}>
                <Feather name="trending-up" size={10} color={colors.statusConfirmedText} />
                <Text style={[styles.changeText, { color: colors.statusConfirmedText }]}>
                  {KPI_DATA.avgTicket.change}%
                </Text>
              </View>
            </View>
            <Sparkline data={KPI_DATA.avgTicket.sparkline} width={100} height={24} />
          </Card>

          {/* Utilization */}
          <Card style={styles.kpiCard}>
            <Text style={[styles.kpiLabel, { color: colors.textMuted }]}>{t('rpUtilization')}</Text>
            <View style={styles.utilRow}>
              <ProgressRing percent={KPI_DATA.utilization.value} size={44} strokeWidth={4} label={`${KPI_DATA.utilization.value}%`} />
            </View>
          </Card>
        </View>

        {/* Revenue Chart */}
        <View style={styles.sectionWrap}>
          <Text style={[styles.sectionTitle, { color: colors.obsidian }]}>{t('rpRevenue')}</Text>
          <Card style={styles.chartCard}>
            <BarChart
              data={WEEKLY_REVENUE.map((d) => ({ label: d.day, value: d.amount }))}
              height={140}
            />
          </Card>
        </View>

        {/* Service Mix */}
        <View style={styles.sectionWrap}>
          <Text style={[styles.sectionTitle, { color: colors.obsidian }]}>{t('rpServiceMix')}</Text>
          <Card style={styles.mixCard}>
            {SERVICE_MIX.map((item, idx) => (
              <View key={item.category}>
                {idx > 0 && <View style={[styles.divider, { backgroundColor: colors.border }]} />}
                <View style={styles.mixRow}>
                  <View style={styles.mixLeft}>
                    <Text style={[styles.mixCategory, { color: colors.obsidian }]}>{item.category}</Text>
                    <Text style={[styles.mixRevenue, { color: colors.textMuted }]}>{fmt$(item.revenue)}</Text>
                  </View>
                  <View style={styles.mixRight}>
                    <View style={[styles.mixBarTrack, { backgroundColor: colors.creamDark }]}>
                      <View
                        style={[styles.mixBarFill, { width: `${item.percentage}%`, backgroundColor: colors.gold }]}
                      />
                    </View>
                    <Text style={[styles.mixPct, { color: colors.charcoal }]}>{item.percentage}%</Text>
                  </View>
                </View>
              </View>
            ))}
          </Card>
        </View>

        {/* Tech Leaderboard */}
        <View style={styles.sectionWrap}>
          <Text style={[styles.sectionTitle, { color: colors.obsidian }]}>{t('rpTechLeaderboard')}</Text>
          <Card style={styles.leaderCard}>
            {TECH_LEADERBOARD.map((tech, idx) => (
              <View key={tech.id}>
                {idx > 0 && <View style={[styles.divider, { backgroundColor: colors.border }]} />}
                <View style={styles.leaderRow}>
                  <Text style={[styles.rank, { color: colors.textFaint }]}>{idx + 1}</Text>
                  <Avatar initials={tech.initials} gold={tech.gold} size="compact" />
                  <View style={styles.leaderInfo}>
                    <Text style={[styles.leaderName, { color: colors.obsidian }]}>{tech.name}</Text>
                    <Text style={[styles.leaderAppts, { color: colors.textMuted }]}>
                      {tech.appointments} appts
                    </Text>
                  </View>
                  <Text style={[styles.leaderRevenue, { color: colors.obsidian }]}>{fmt$(tech.revenue)}</Text>
                </View>
              </View>
            ))}
          </Card>
        </View>

        {/* Hourly Breakdown */}
        <View style={styles.sectionWrap}>
          <Text style={[styles.sectionTitle, { color: colors.obsidian }]}>{t('rpHourlyBreakdown')}</Text>
          <Card style={styles.chartCard}>
            <BarChart
              data={HOURLY_BREAKDOWN.map((h) => ({ label: h.hour.replace(' ', '\n'), value: h.count }))}
              height={100}
            />
          </Card>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
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
  rangeRow: { marginTop: 12, marginBottom: 16 },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 10,
  },
  kpiCard: {
    width: '47%' as any,
    flexGrow: 1,
    padding: 14,
    gap: 6,
  },
  kpiLabel: { fontSize: 12, fontFamily: 'Jost_500Medium' },
  kpiValue: { fontSize: 24, fontFamily: 'Jost_600SemiBold' },
  kpiValueRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  kpiSub: { fontSize: 12, fontFamily: 'Jost_400Regular' },
  changeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  changeText: { fontSize: 11, fontFamily: 'Jost_500Medium' },
  utilRow: { alignItems: 'flex-start', marginTop: 4 },
  sectionWrap: { marginTop: 24, paddingHorizontal: 16 },
  sectionTitle: { fontSize: 16, fontFamily: 'Jost_600SemiBold', marginBottom: 10 },
  chartCard: { padding: 16 },
  mixCard: { padding: 0, overflow: 'hidden' },
  mixRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  mixLeft: { gap: 2 },
  mixCategory: { fontSize: 14, fontFamily: 'Jost_500Medium' },
  mixRevenue: { fontSize: 12, fontFamily: 'Jost_400Regular' },
  mixRight: { flexDirection: 'row', alignItems: 'center', gap: 10, width: 140 },
  mixBarTrack: { flex: 1, height: 6, borderRadius: 3, overflow: 'hidden' },
  mixBarFill: { height: 6, borderRadius: 3 },
  mixPct: { fontSize: 13, fontFamily: 'Jost_500Medium', width: 36, textAlign: 'right' },
  leaderCard: { padding: 0, overflow: 'hidden' },
  leaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  rank: { fontSize: 14, fontFamily: 'Jost_500Medium', width: 18, textAlign: 'center' },
  leaderInfo: { flex: 1 },
  leaderName: { fontSize: 14, fontFamily: 'Jost_500Medium' },
  leaderAppts: { fontSize: 12, fontFamily: 'Jost_400Regular' },
  leaderRevenue: { fontSize: 15, fontFamily: 'Jost_600SemiBold' },
  divider: { height: StyleSheet.hairlineWidth },
  bottomSpacer: { height: 24 },
});
