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
import { getPayrollData } from '../../../src/data/reports';
import { fmt$ } from '../../../src/utils/currency';
import { radii, shadows } from '../../../src/theme/tokens';

// ── Helpers ──

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const MONTHS_FULL = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAY_ABBR = ['S','M','T','W','T','F','S'];

function fmtDate(d: Date): string {
  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  return `${days[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

function fmtDateRange(start: Date, end: Date): string {
  return `${MONTHS[start.getMonth()]} ${start.getDate()}, ${start.getFullYear()} – ${MONTHS[end.getMonth()]} ${end.getDate()}, ${end.getFullYear()}`;
}

function fmtKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

type PayrollTech = ReturnType<typeof getPayrollData>['technicians'][number];

function enrichTech(tech: PayrollTech) {
  const productSales = Math.round(tech.serviceSales * 0.04);
  const totalSales = tech.serviceSales + productSales;
  const prodCommission = Math.round(productSales * 0.10 * 100) / 100;
  const workDays = Math.round(tech.hours / 7.5);
  const maintenanceFee = Math.round(workDays * 4.2 * 100) / 100;
  const cardTips = Math.round(tech.tips * 0.6 * 100) / 100;
  const cashTips = Math.round((tech.tips - cardTips) * 100) / 100;
  const taxWithheld = Math.round((tech.commission + prodCommission + cardTips) * 0.08 * 100) / 100;
  const totalPayout = tech.totalPayout;
  const cashPay = cashTips;
  const checkPay = Math.round((totalPayout - cashPay) * 100) / 100;

  return {
    ...tech,
    productSales,
    totalSales,
    netSales: totalSales,
    prodCommission,
    workDays,
    maintenanceFee,
    cardTips,
    cashTips,
    taxWithheld,
    cashPay,
    checkPay,
  };
}

// ── Mini Calendar Dropdown ──

function MiniCalendar({
  selected,
  onSelect,
  onClose,
  colors,
}: {
  selected: Date;
  onSelect: (d: Date) => void;
  onClose: () => void;
  colors: any;
}) {
  const [viewMonth, setViewMonth] = useState(new Date(selected.getFullYear(), selected.getMonth(), 1));
  const todayKey = fmtKey(new Date());
  const selectedKey = fmtKey(selected);

  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <View style={[mcStyles.container, shadows.elevated, { backgroundColor: colors.warmWhite, borderColor: colors.border }]}>
      <View style={mcStyles.monthRow}>
        <Pressable onPress={() => setViewMonth(new Date(year, month - 1, 1))} hitSlop={8}>
          <Feather name="chevron-left" size={18} color={colors.charcoal} />
        </Pressable>
        <Text style={[mcStyles.monthLabel, { color: colors.obsidian }]}>
          {MONTHS_FULL[month]} {year}
        </Text>
        <Pressable onPress={() => setViewMonth(new Date(year, month + 1, 1))} hitSlop={8}>
          <Feather name="chevron-right" size={18} color={colors.charcoal} />
        </Pressable>
      </View>
      <View style={mcStyles.weekRow}>
        {DAY_ABBR.map((d, i) => (
          <Text key={i} style={[mcStyles.weekDay, { color: colors.textMuted }]}>{d}</Text>
        ))}
      </View>
      <View style={mcStyles.grid}>
        {cells.map((day, i) => {
          if (day === null) return <View key={`e-${i}`} style={mcStyles.cell} />;
          const cellKey = fmtKey(new Date(year, month, day));
          const isSelected = cellKey === selectedKey;
          const isToday = cellKey === todayKey;
          return (
            <Pressable
              key={cellKey}
              onPress={() => {
                onSelect(new Date(year, month, day));
                onClose();
              }}
              style={[
                mcStyles.cell,
                isSelected && { backgroundColor: colors.obsidian, borderRadius: 8 },
              ]}
            >
              <Text style={[
                mcStyles.dayText,
                { color: isSelected ? colors.warmWhite : colors.obsidian },
                isToday && !isSelected && { color: colors.gold },
              ]}>
                {day}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const mcStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 56,
    left: 0,
    right: 0,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    zIndex: 200,
  },
  monthRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  monthLabel: { fontSize: 14, fontFamily: 'Jost_600SemiBold' },
  weekRow: { flexDirection: 'row', marginBottom: 4 },
  weekDay: {
    flex: 1,
    textAlign: 'center',
    fontSize: 11,
    fontFamily: 'Jost_500Medium',
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayText: { fontSize: 13, fontFamily: 'Jost_400Regular' },
});

// ── Component ──

export default function EarningsScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useAuth();

  const staffId = user?.id ?? 'sofia';
  const storeId = user?.primaryStore ?? 'store_wv';

  // Date range state — default last 14 days
  const [startDate, setStartDate] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - 13); return d;
  });
  const [endDate, setEndDate] = useState(() => new Date());
  const [calendarOpen, setCalendarOpen] = useState<'start' | 'end' | null>(null);

  const PAYROLL_DATA = useMemo(
    () => getPayrollData(startDate, endDate, storeId),
    [startDate, endDate, storeId]
  );

  const myTech = useMemo(() => {
    const raw = PAYROLL_DATA.technicians.find((t) => t.id === staffId);
    return raw ? enrichTech(raw) : null;
  }, [PAYROLL_DATA, staffId]);

  const dateRangeStr = fmtDateRange(startDate, endDate);

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
        {/* ── Date Pickers ── */}
        <View style={styles.controls}>
          <View style={styles.dateGroup}>
            <View style={styles.dateFieldWrapper}>
              <Text style={[styles.controlLabel, { color: colors.textMuted }]}>FROM</Text>
              <Pressable
                style={[styles.dateField, { backgroundColor: colors.warmWhite, borderColor: calendarOpen === 'start' ? colors.gold : colors.border }]}
                onPress={() => setCalendarOpen(calendarOpen === 'start' ? null : 'start')}
              >
                <Feather name="calendar" size={14} color={calendarOpen === 'start' ? colors.gold : colors.textMuted} />
                <Text style={[styles.dateText, { color: colors.obsidian }]}>{fmtDate(startDate)}</Text>
              </Pressable>
              {calendarOpen === 'start' && (
                <MiniCalendar
                  selected={startDate}
                  onSelect={(d) => {
                    setStartDate(d);
                    if (d > endDate) setEndDate(d);
                  }}
                  onClose={() => setCalendarOpen(null)}
                  colors={colors}
                />
              )}
            </View>

            <Text style={[styles.dateSep, { color: colors.textMuted }]}>—</Text>

            <View style={styles.dateFieldWrapper}>
              <Text style={[styles.controlLabel, { color: colors.textMuted }]}>TO</Text>
              <Pressable
                style={[styles.dateField, { backgroundColor: colors.warmWhite, borderColor: calendarOpen === 'end' ? colors.gold : colors.border }]}
                onPress={() => setCalendarOpen(calendarOpen === 'end' ? null : 'end')}
              >
                <Feather name="calendar" size={14} color={calendarOpen === 'end' ? colors.gold : colors.textMuted} />
                <Text style={[styles.dateText, { color: colors.obsidian }]}>{fmtDate(endDate)}</Text>
                {fmtKey(endDate) === fmtKey(new Date()) && (
                  <View style={[styles.todayBadge, { backgroundColor: colors.gold + '25' }]}>
                    <Text style={[styles.todayText, { color: colors.gold }]}>TODAY</Text>
                  </View>
                )}
              </Pressable>
              {calendarOpen === 'end' && (
                <MiniCalendar
                  selected={endDate}
                  onSelect={(d) => {
                    setEndDate(d);
                    if (d < startDate) setStartDate(d);
                  }}
                  onClose={() => setCalendarOpen(null)}
                  colors={colors}
                />
              )}
            </View>
          </View>
        </View>

        {/* ── Receipt ── */}
        {myTech ? (
          <View style={[styles.receipt, shadows.card, { backgroundColor: colors.warmWhite }]}>
            <ReceiptRow label="Payroll Date" value={dateRangeStr} colors={colors} />
            <ReceiptRow label="Technician" value={myTech.name} colors={colors} />
            <ReceiptRow label="Payroll Type" value="Commission" colors={colors} />
            <ReceiptRow label="# of Work Days" value={String(myTech.daysWorked)} colors={colors} />
            <ReceiptRow label="Earnings / Day" value={myTech.daysWorked > 0 ? fmt$(Math.round(myTech.totalPayout / myTech.daysWorked)) : '-'} colors={colors} />

            {/* Section: Technician Pay */}
            <View style={styles.receiptSection}>
              <View style={[styles.receiptSectionLine, { backgroundColor: colors.border }]} />
              <Text style={[styles.receiptSectionText, { color: colors.textMuted }]}>TECHNICIAN PAY</Text>
              <View style={[styles.receiptSectionLine, { backgroundColor: colors.border }]} />
            </View>

            <ReceiptRow label="Total Sale" value={fmt$(myTech.totalSales)} colors={colors} />
            <ReceiptRow label="Product Total Sale" value={fmt$(myTech.productSales)} colors={colors} />
            <ReceiptRow label="Service Total Sale" value={fmt$(myTech.serviceSales)} colors={colors} />
            <ReceiptRow label="Net Total Sale" value={fmt$(myTech.netSales)} colors={colors} />
            <ReceiptRow label={`Service Commission (${myTech.commissionRate}%)`} value={fmt$(myTech.commission)} colors={colors} />
            <ReceiptRow label="Product Commission (10%)" value={fmt$(myTech.prodCommission)} colors={colors} />
            <ReceiptRow label="Daily Maintenance Fee" value={fmt$(myTech.maintenanceFee)} colors={colors} />
            <ReceiptRow label="Net Non-Cash Tip" value={fmt$(myTech.cardTips)} colors={colors} />
            <ReceiptRow label="Tax Withheld on Cash" value={fmt$(myTech.taxWithheld)} colors={colors} />

            {/* Divider + Totals */}
            <View style={[styles.receiptDivider, { backgroundColor: colors.border }]} />

            <View style={styles.receiptRowTotal}>
              <Text style={[styles.receiptTotalLabel, { color: colors.obsidian }]}>Total Payout</Text>
              <Text style={[styles.receiptTotalValue, { color: colors.obsidian }]}>{fmt$(myTech.totalPayout)}</Text>
            </View>
            <ReceiptRow label="Pay 1 — Cash" value={fmt$(myTech.cashPay)} colors={colors} />
            <ReceiptRow label="Pay 2 — Check" value={fmt$(myTech.checkPay)} colors={colors} />
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>No payroll data for this period</Text>
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Receipt Row ──

function ReceiptRow({ label, value, colors }: { label: string; value: string; colors: any }) {
  return (
    <View style={styles.receiptRow}>
      <Text style={[styles.receiptLabel, { color: colors.charcoal }]}>{label}</Text>
      <Text style={[styles.receiptValue, { color: colors.obsidian }]}>{value}</Text>
    </View>
  );
}

// ── Styles ──

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

  // ── Controls ──
  controls: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
    gap: 12,
    zIndex: 100,
  },
  dateGroup: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    zIndex: 20,
  },
  dateFieldWrapper: {
    flex: 1,
    zIndex: 10,
  },
  controlLabel: {
    fontSize: 10,
    fontFamily: 'Jost_600SemiBold',
    letterSpacing: 0.5,
  },
  dateField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  dateText: { fontSize: 13, fontFamily: 'Jost_400Regular' },
  dateSep: { fontSize: 13, paddingBottom: 8 },
  todayBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    marginLeft: 2,
  },
  todayText: { fontSize: 9, fontFamily: 'Jost_600SemiBold', letterSpacing: 0.3 },

  // ── Receipt ──
  receipt: {
    marginHorizontal: 16,
    borderRadius: radii.lg,
    padding: 20,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingVertical: 8,
  },
  receiptLabel: { fontSize: 14, fontFamily: 'Jost_400Regular', flex: 1, marginRight: 12 },
  receiptValue: { fontSize: 14, fontFamily: 'Jost_600SemiBold', textAlign: 'right' },
  receiptSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 18,
    marginBottom: 8,
  },
  receiptSectionLine: { flex: 1, height: 1 },
  receiptSectionText: {
    fontSize: 11,
    fontFamily: 'Jost_600SemiBold',
    letterSpacing: 0.8,
  },
  receiptDivider: { height: 1, marginTop: 14, marginBottom: 6 },
  receiptRowTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingVertical: 10,
  },
  receiptTotalLabel: { fontSize: 16, fontFamily: 'Jost_600SemiBold' },
  receiptTotalValue: { fontSize: 22, fontFamily: 'Jost_600SemiBold' },

  // ── Empty state ──
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: { fontSize: 14, fontFamily: 'Jost_400Regular' },

  bottomSpacer: { height: 24 },
});
