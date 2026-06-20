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
import { useStore } from '../../../src/contexts/StoreContext';
import { StorePicker } from '../../../src/components/StorePicker';
import { Avatar } from '../../../src/components/Avatar';
import { getPayrollData } from '../../../src/data/reports';
import { fmt$ } from '../../../src/utils/currency';
import { radii, shadows, spacing } from '../../../src/theme/tokens';

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

/** Derive additional receipt fields from existing tech data */
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
      {/* Month nav */}
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

      {/* Day headers */}
      <View style={mcStyles.weekRow}>
        {DAY_ABBR.map((d, i) => (
          <Text key={i} style={[mcStyles.weekDay, { color: colors.textMuted }]}>{d}</Text>
        ))}
      </View>

      {/* Day grid */}
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

export default function PayrollScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const { selectedStoreId } = useStore();

  // Date range state
  const [startDate, setStartDate] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - 13); return d;
  });
  const [endDate, setEndDate] = useState(() => new Date());

  // Calendar open state: null | 'start' | 'end'
  const [calendarOpen, setCalendarOpen] = useState<'start' | 'end' | null>(null);

  // Tech filter: null = all
  const [selectedTechId, setSelectedTechId] = useState<string | null>(null);

  const PAYROLL_DATA = useMemo(
    () => getPayrollData(startDate, endDate, selectedStoreId),
    [startDate, endDate, selectedStoreId]
  );

  const techs = PAYROLL_DATA.technicians;
  const enrichedTechs = useMemo(() => techs.map(enrichTech), [techs]);
  const selectedTech = selectedTechId ? enrichedTechs.find((t) => t.id === selectedTechId) : null;

  const techOptions = [{ id: null as string | null, label: 'All Technicians' }, ...techs.map((t) => ({ id: t.id, label: t.name }))];
  const [techDropdownOpen, setTechDropdownOpen] = useState(false);

  const dateRangeStr = fmtDateRange(startDate, endDate);

  // Close all dropdowns helper
  const closeDropdowns = () => {
    setCalendarOpen(null);
    setTechDropdownOpen(false);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.cream }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.replace('/(tabs)/more')} hitSlop={12}>
          <Feather name="arrow-left" size={24} color={colors.obsidian} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.obsidian }]}>{t('pyTitle')}</Text>
        <StorePicker />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Controls Row ── */}
        <View style={styles.controls}>
          {/* Date pickers */}
          <View style={styles.dateGroup}>
            <View style={styles.dateFieldWrapper}>
              <Text style={[styles.controlLabel, { color: colors.textMuted }]}>FROM</Text>
              <Pressable
                style={[styles.dateField, { backgroundColor: colors.warmWhite, borderColor: calendarOpen === 'start' ? colors.gold : colors.border }]}
                onPress={() => {
                  setTechDropdownOpen(false);
                  setCalendarOpen(calendarOpen === 'start' ? null : 'start');
                }}
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
                onPress={() => {
                  setTechDropdownOpen(false);
                  setCalendarOpen(calendarOpen === 'end' ? null : 'end');
                }}
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

          {/* Tech dropdown */}
          <View style={styles.techGroup}>
            <Pressable
              style={[styles.dropdown, { backgroundColor: colors.warmWhite, borderColor: techDropdownOpen ? colors.gold : colors.border }]}
              onPress={() => {
                setCalendarOpen(null);
                setTechDropdownOpen(!techDropdownOpen);
              }}
            >
              <Text style={[styles.dropdownText, { color: colors.obsidian }]} numberOfLines={1}>
                {selectedTechId ? techs.find((t) => t.id === selectedTechId)?.name : 'All Technicians'}
              </Text>
              <Feather name={techDropdownOpen ? 'chevron-up' : 'chevron-down'} size={14} color={colors.textMuted} />
            </Pressable>
            {techDropdownOpen && (
              <View style={[styles.dropdownMenu, shadows.elevated, { backgroundColor: colors.warmWhite, borderColor: colors.border }]}>
                {techOptions.map((opt) => (
                  <Pressable
                    key={opt.id ?? 'all'}
                    style={({ pressed }) => [
                      styles.dropdownItem,
                      (opt.id === selectedTechId) && { backgroundColor: colors.gold + '15' },
                      pressed && { backgroundColor: colors.creamDark },
                    ]}
                    onPress={() => {
                      setSelectedTechId(opt.id);
                      setTechDropdownOpen(false);
                    }}
                  >
                    <Text style={[styles.dropdownItemText, { color: colors.obsidian }]}>{opt.label}</Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* ── Content: All techs table OR individual receipt ── */}
        {!selectedTech ? (
          /* ═══ ALL TECHNICIANS TABLE ═══ */
          <View style={[styles.listCard, shadows.card, { backgroundColor: colors.warmWhite }]}>
            <View style={[styles.colHeaders, { borderBottomColor: colors.border }]}>
              <Text style={[styles.colH, styles.colHName, { color: colors.textMuted }]}>TECHNICIAN</Text>
              <Text style={[styles.colH, styles.colHNum, { color: colors.textMuted }]}>HRS</Text>
              <Text style={[styles.colH, styles.colHMoney, { color: colors.textMuted }]}>TIPS</Text>
              <Text style={[styles.colH, styles.colHMoney, { color: colors.textMuted }]}>CHECK</Text>
              <Text style={[styles.colH, styles.colHMoney, { color: colors.textMuted }]}>CASH</Text>
              <Text style={[styles.colH, styles.colHTotal, { color: colors.textMuted }]}>TOTAL</Text>
            </View>

            {enrichedTechs.map((tech, idx) => (
              <View key={tech.id}>
                {idx > 0 && <View style={[styles.rowDivider, { backgroundColor: colors.border }]} />}
                <Pressable
                  style={({ pressed }) => [styles.row, pressed && { backgroundColor: colors.creamDark }]}
                  onPress={() => setSelectedTechId(tech.id)}
                >
                  <View style={styles.cellName}>
                    <Avatar initials={tech.initials} gold={tech.gold} size="compact" />
                    <Text style={[styles.name, { color: colors.obsidian }]} numberOfLines={1}>{tech.name}</Text>
                  </View>
                  <Text style={[styles.cellNum, { color: colors.textMuted }]}>{tech.hours}</Text>
                  <Text style={[styles.cellMoney, { color: colors.charcoal }]}>{fmt$(tech.tips)}</Text>
                  <Text style={[styles.cellMoney, { color: colors.charcoal }]}>{fmt$(tech.checkPay)}</Text>
                  <Text style={[styles.cellMoney, { color: colors.charcoal }]}>{fmt$(tech.cashPay)}</Text>
                  <Text style={[styles.cellTotal, { color: colors.obsidian }]}>{fmt$(tech.totalPayout)}</Text>
                </Pressable>
              </View>
            ))}

            <View style={[styles.footer, { borderTopColor: colors.border }]}>
              <Text style={[styles.footerLabel, { color: colors.obsidian }]}>Totals</Text>
              <Text style={[styles.cellNum, { color: colors.textMuted }]}>
                {techs.reduce((s, t) => s + t.hours, 0)}
              </Text>
              <Text style={[styles.cellMoney, { color: colors.charcoal }]}>
                {fmt$(PAYROLL_DATA.totalTips)}
              </Text>
              <Text style={[styles.cellMoney, { color: colors.charcoal }]}>
                {fmt$(enrichedTechs.reduce((s, t) => s + t.checkPay, 0))}
              </Text>
              <Text style={[styles.cellMoney, { color: colors.charcoal }]}>
                {fmt$(enrichedTechs.reduce((s, t) => s + t.cashPay, 0))}
              </Text>
              <Text style={[styles.cellTotal, { color: colors.obsidian }]}>
                {fmt$(PAYROLL_DATA.totalPayout)}
              </Text>
            </View>
          </View>
        ) : (
          /* ═══ INDIVIDUAL TECH RECEIPT ═══ */
          <View style={[styles.receipt, shadows.card, { backgroundColor: colors.warmWhite }]}>
            {/* Header rows */}
            <ReceiptRow label="Payroll Date" value={dateRangeStr} colors={colors} />
            <ReceiptRow label="Technician" value={selectedTech.name} colors={colors} />
            <ReceiptRow label="Payroll Type" value="Commission" colors={colors} />
            <ReceiptRow label="# of Work Days" value={String(selectedTech.workDays)} colors={colors} />

            {/* Section: Technician Pay */}
            <View style={styles.receiptSection}>
              <View style={[styles.receiptSectionLine, { backgroundColor: colors.border }]} />
              <Text style={[styles.receiptSectionText, { color: colors.textMuted }]}>TECHNICIAN PAY</Text>
              <View style={[styles.receiptSectionLine, { backgroundColor: colors.border }]} />
            </View>

            <ReceiptRow label="Total Sale" value={fmt$(selectedTech.totalSales)} colors={colors} />
            <ReceiptRow label="Product Total Sale" value={fmt$(selectedTech.productSales)} colors={colors} />
            <ReceiptRow label="Service Total Sale" value={fmt$(selectedTech.serviceSales)} colors={colors} />
            <ReceiptRow label="Net Total Sale" value={fmt$(selectedTech.netSales)} colors={colors} />
            <ReceiptRow label={`Service Commission (${selectedTech.commissionRate}%)`} value={fmt$(selectedTech.commission)} colors={colors} />
            <ReceiptRow label="Product Commission (10%)" value={fmt$(selectedTech.prodCommission)} colors={colors} />
            <ReceiptRow label="Daily Maintenance Fee" value={fmt$(selectedTech.maintenanceFee)} colors={colors} />
            <ReceiptRow label="Net Non-Cash Tip" value={fmt$(selectedTech.cardTips)} colors={colors} />
            <ReceiptRow label="Tax Withheld on Cash" value={fmt$(selectedTech.taxWithheld)} colors={colors} />

            {/* Divider + Totals */}
            <View style={[styles.receiptDivider, { backgroundColor: colors.border }]} />

            <View style={styles.receiptRowTotal}>
              <Text style={[styles.receiptTotalLabel, { color: colors.obsidian }]}>Total Payout</Text>
              <Text style={[styles.receiptTotalValue, { color: colors.obsidian }]}>{fmt$(selectedTech.totalPayout)}</Text>
            </View>
            <ReceiptRow label="Pay 1 — Cash" value={fmt$(selectedTech.cashPay)} colors={colors} />
            <ReceiptRow label="Pay 2 — Check" value={fmt$(selectedTech.checkPay)} colors={colors} />
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
  headerSub: { fontSize: 11, fontFamily: 'Jost_400Regular', marginTop: 1 },
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
  techGroup: {
    zIndex: 10,
  },
  dropdown: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
  },
  dropdownText: { fontSize: 13, fontFamily: 'Jost_400Regular', flex: 1 },
  dropdownMenu: {
    position: 'absolute',
    top: 46,
    left: 0,
    right: 0,
    borderRadius: 10,
    borderWidth: 1,
    overflow: 'hidden',
    zIndex: 100,
  },
  dropdownItem: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  dropdownItemText: { fontSize: 13, fontFamily: 'Jost_400Regular' },

  // ── List card (all techs) ──
  listCard: {
    marginHorizontal: 16,
    borderRadius: radii.lg,
    overflow: 'hidden',
  },
  colHeaders: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  colH: {
    fontSize: 9,
    fontFamily: 'Jost_600SemiBold',
    letterSpacing: 0.6,
  },
  colHName: { flex: 1 },
  colHNum: { width: 30, textAlign: 'right' },
  colHMoney: { width: 46, textAlign: 'right' },
  colHTotal: { width: 50, textAlign: 'right' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  rowDivider: { height: StyleSheet.hairlineWidth, marginLeft: 12 },
  cellName: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginRight: 4,
  },
  name: { fontSize: 13, fontFamily: 'Jost_500Medium', flex: 1 },
  cellNum: { width: 30, textAlign: 'right', fontSize: 11, fontFamily: 'Jost_400Regular' },
  cellMoney: { width: 46, textAlign: 'right', fontSize: 11, fontFamily: 'Jost_500Medium' },
  cellTotal: { width: 50, textAlign: 'right', fontSize: 12, fontFamily: 'Jost_600SemiBold' },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderTopWidth: 2,
    marginTop: 2,
  },
  footerLabel: { flex: 1, fontSize: 13, fontFamily: 'Jost_600SemiBold' },

  // ── Receipt (individual tech) ──
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

  bottomSpacer: { height: 24 },
});
