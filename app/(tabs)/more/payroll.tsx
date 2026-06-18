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
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '../../../src/contexts/ThemeContext';
import { useTranslation } from '../../../src/contexts/I18nContext';
import { StorePicker } from '../../../src/components/StorePicker';
import { Card } from '../../../src/components/Card';
import { Avatar } from '../../../src/components/Avatar';
import { FilterChips } from '../../../src/components/FilterChips';
import { PAYROLL_DATA } from '../../../src/data/reports';
import { fmt$ } from '../../../src/utils/currency';

const PAY_PERIODS = ['Jun 1 – 15', 'May 16 – 31', 'May 1 – 15', 'Apr 16 – 30'];

function TechCard({
  tech,
}: {
  tech: (typeof PAYROLL_DATA.technicians)[0];
}) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const rotation = useSharedValue(0);

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const toggle = () => {
    setExpanded(!expanded);
    rotation.value = withTiming(expanded ? 0 : 180, { duration: 200 });
  };

  return (
    <Card style={styles.techCard}>
      <Pressable style={styles.techHeader} onPress={toggle}>
        <Avatar initials={tech.initials} gold={tech.gold} size="list" />
        <View style={styles.techInfo}>
          <Text style={[styles.techName, { color: colors.obsidian }]}>{tech.name}</Text>
          <Text style={[styles.techMeta, { color: colors.textMuted }]}>
            {tech.commissionRate}% {t('pyCommission')} · {tech.hours}h
          </Text>
        </View>
        <Text style={[styles.techPayout, { color: colors.obsidian }]}>{fmt$(tech.totalPayout)}</Text>
        <Animated.View style={chevronStyle}>
          <Feather name="chevron-down" size={18} color={colors.textFaint} />
        </Animated.View>
      </Pressable>

      {expanded && (
        <View style={[styles.techDetails, { borderTopColor: colors.border }]}>
          <DetailRow label={t('pyServiceSales')} value={fmt$(tech.serviceSales)} colors={colors} />
          <DetailRow label={t('pyCommission')} value={fmt$(tech.commission)} colors={colors} />
          <DetailRow label={t('pyTips')} value={fmt$(tech.tips)} colors={colors} />
          <DetailRow label={t('pyDeductions')} value={`-${fmt$(tech.deductions)}`} colors={colors} negative />
          <View style={[styles.detailDivider, { backgroundColor: colors.border }]} />
          <DetailRow label={t('pyTotalPayoutLabel')} value={fmt$(tech.totalPayout)} colors={colors} bold />
        </View>
      )}
    </Card>
  );
}

function DetailRow({
  label,
  value,
  colors,
  bold,
  negative,
}: {
  label: string;
  value: string;
  colors: any;
  bold?: boolean;
  negative?: boolean;
}) {
  return (
    <View style={styles.detailRow}>
      <Text
        style={[
          styles.detailLabel,
          { color: colors.charcoal },
          bold && styles.detailBold,
        ]}
      >
        {label}
      </Text>
      <Text
        style={[
          styles.detailValue,
          { color: negative ? colors.statusCancelledText : colors.obsidian },
          bold && styles.detailBold,
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

export default function PayrollScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const [period, setPeriod] = useState(PAY_PERIODS[0]);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.cream }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Feather name="arrow-left" size={24} color={colors.obsidian} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.obsidian }]}>{t('pyTitle')}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <StorePicker />

        {/* Period Selector */}
        <View style={styles.periodRow}>
          <FilterChips
            options={PAY_PERIODS}
            selected={period}
            onSelect={setPeriod}
          />
        </View>

        {/* Summary Card */}
        <View style={styles.summaryWrap}>
          <Card style={styles.summaryCard}>
            <Text style={[styles.summaryTitle, { color: colors.textMuted }]}>{t('pyPeriodSummary')}</Text>
            <View style={styles.summaryGrid}>
              <SummaryItem label={t('pyTotalPayout')} value={fmt$(PAYROLL_DATA.totalPayout)} colors={colors} highlight />
              <SummaryItem label={t('pyServiceSales')} value={fmt$(PAYROLL_DATA.serviceSales)} colors={colors} />
              <SummaryItem label={t('pyTotalTips')} value={fmt$(PAYROLL_DATA.totalTips)} colors={colors} />
              <SummaryItem label={t('pyDeductions')} value={fmt$(PAYROLL_DATA.deductions)} colors={colors} />
            </View>
          </Card>
        </View>

        {/* Per-Tech Cards */}
        <View style={styles.techSection}>
          {PAYROLL_DATA.technicians.map((tech) => (
            <TechCard key={tech.id} tech={tech} />
          ))}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

function SummaryItem({
  label,
  value,
  colors,
  highlight,
}: {
  label: string;
  value: string;
  colors: any;
  highlight?: boolean;
}) {
  return (
    <View style={styles.summaryItem}>
      <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>{label}</Text>
      <Text
        style={[
          styles.summaryValue,
          { color: highlight ? colors.goldDeep : colors.obsidian },
          highlight && styles.summaryHighlight,
        ]}
      >
        {value}
      </Text>
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
  periodRow: { marginTop: 12, marginBottom: 16 },
  summaryWrap: { paddingHorizontal: 16, marginBottom: 20 },
  summaryCard: { padding: 16 },
  summaryTitle: { fontSize: 12, fontFamily: 'Jost_500Medium', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 14 },
  summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  summaryItem: { width: '45%' as any, gap: 4 },
  summaryLabel: { fontSize: 12, fontFamily: 'Jost_400Regular' },
  summaryValue: { fontSize: 20, fontFamily: 'Jost_600SemiBold' },
  summaryHighlight: { fontSize: 24 },
  techSection: { paddingHorizontal: 16, gap: 10 },
  techCard: { padding: 0, overflow: 'hidden' },
  techHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
  },
  techInfo: { flex: 1, gap: 2 },
  techName: { fontSize: 14, fontFamily: 'Jost_500Medium' },
  techMeta: { fontSize: 12, fontFamily: 'Jost_400Regular' },
  techPayout: { fontSize: 16, fontFamily: 'Jost_600SemiBold', marginRight: 6 },
  techDetails: { paddingHorizontal: 14, paddingBottom: 14, paddingTop: 10, borderTopWidth: StyleSheet.hairlineWidth, gap: 8 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  detailLabel: { fontSize: 13, fontFamily: 'Jost_400Regular' },
  detailValue: { fontSize: 13, fontFamily: 'Jost_500Medium' },
  detailBold: { fontFamily: 'Jost_600SemiBold', fontSize: 14 },
  detailDivider: { height: StyleSheet.hairlineWidth, marginVertical: 4 },
  bottomSpacer: { height: 24 },
});
