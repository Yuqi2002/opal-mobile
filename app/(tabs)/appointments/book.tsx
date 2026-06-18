import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../../src/contexts/ThemeContext';
import { useAuth } from '../../../src/contexts/AuthContext';
import { useTranslation } from '../../../src/contexts/I18nContext';
import { BOOKING_CLIENTS } from '../../../src/data/clients';
import { SERVICES, SERVICE_CATEGORIES, APPT_TYPES } from '../../../src/data/services';
import { CALENDAR_STAFF, STAFF } from '../../../src/data/staff';
import { fmtKey, fmtTime, DAY_START_MIN, DAY_END_MIN } from '../../../src/utils/time';
import { fmtCurrency } from '../../../src/utils/currency';
import { isOwner, isReceptionist, isStaff, canBookForOthers } from '../../../src/utils/permissions';
import { Avatar } from '../../../src/components/Avatar';
import { StatusBadge } from '../../../src/components/StatusBadge';
import { shadows } from '../../../src/theme/tokens';
import type { Service, BookingClient } from '../../../src/types/models';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Generate time slots from 9am to 7pm at 30 min intervals
function buildTimeSlots(): number[] {
  const slots: number[] = [];
  for (let m = DAY_START_MIN; m <= DAY_END_MIN - 30; m += 30) {
    slots.push(m);
  }
  return slots;
}

const TIME_SLOTS = buildTimeSlots();

// ─── Calendar Month View ───────────────────────────────

function CalendarMonth({
  year,
  month,
  selectedDate,
  onSelectDate,
  todayKey,
}: {
  year: number;
  month: number;
  selectedDate: string | null;
  onSelectDate: (key: string) => void;
  todayKey: string;
}) {
  const { colors } = useTheme();

  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDow = firstDay.getDay();

  const cells: (number | null)[] = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const rows: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    rows.push(cells.slice(i, i + 7));
  }

  // Pad last row
  while (rows.length > 0 && rows[rows.length - 1].length < 7) {
    rows[rows.length - 1].push(null);
  }

  return (
    <View style={cs.calContainer}>
      {/* Day headers */}
      <View style={cs.calWeekRow}>
        {DAY_NAMES.map((dn) => (
          <View key={dn} style={cs.calCell}>
            <Text style={[cs.calDowLabel, { color: colors.textMuted }]}>{dn}</Text>
          </View>
        ))}
      </View>

      {/* Date rows */}
      {rows.map((row, ri) => (
        <View key={ri} style={cs.calWeekRow}>
          {row.map((day, ci) => {
            if (day === null) {
              return <View key={ci} style={cs.calCell} />;
            }
            const m = String(month + 1).padStart(2, '0');
            const d = String(day).padStart(2, '0');
            const key = `${year}-${m}-${d}`;
            const isSelected = key === selectedDate;
            const isToday = key === todayKey;
            const isPast = key < todayKey;

            return (
              <Pressable
                key={ci}
                onPress={() => !isPast && onSelectDate(key)}
                style={[
                  cs.calCell,
                  isSelected && { backgroundColor: colors.obsidian, borderRadius: 20 },
                ]}
                disabled={isPast}
              >
                <Text
                  style={[
                    cs.calDayNum,
                    {
                      color: isPast
                        ? colors.textFaint
                        : isSelected
                        ? colors.warmWhite
                        : colors.obsidian,
                    },
                  ]}
                >
                  {day}
                </Text>
                {isToday && !isSelected && (
                  <View style={[cs.calTodayDot, { backgroundColor: colors.goldDeep }]} />
                )}
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const cs = StyleSheet.create({
  calContainer: { marginTop: 4 },
  calWeekRow: { flexDirection: 'row' },
  calCell: {
    flex: 1,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calDowLabel: { fontSize: 11, fontFamily: 'Jost_500Medium' },
  calDayNum: { fontSize: 14, fontFamily: 'Jost_400Regular' },
  calTodayDot: { width: 4, height: 4, borderRadius: 2, marginTop: 1 },
});

// ─── Section Number ────────────────────────────────────

function SectionNumber({ num }: { num: string }) {
  const { colors } = useTheme();
  return (
    <View style={[s.sectionNum, { backgroundColor: colors.goldSoft }]}>
      <Text style={[s.sectionNumText, { color: colors.goldDeep }]}>{num}</Text>
    </View>
  );
}

// ─── Main Booking Screen ───────────────────────────────

export default function BookScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();

  const userRole = user?.role ?? 'r04';
  const canPickTech = canBookForOthers(userRole);
  const staffUser = isStaff(userRole);

  // Form state
  const [clientSearch, setClientSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState<BookingClient | null>(null);
  const [showClientDropdown, setShowClientDropdown] = useState(false);

  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [serviceCategory, setServiceCategory] = useState<string>('All');

  const [selectedTech, setSelectedTech] = useState<string | null>(
    staffUser && user ? user.id : null
  );
  const [showTechDropdown, setShowTechDropdown] = useState(false);

  const todayKey = fmtKey(new Date());
  const today = new Date();
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<number | null>(null);

  const [notes, setNotes] = useState('');
  const [selectedApptType, setSelectedApptType] = useState('chosen-tech');

  // Client search
  const filteredClients = useMemo(() => {
    if (!clientSearch) return BOOKING_CLIENTS.slice(0, 8);
    const q = clientSearch.toLowerCase();
    return BOOKING_CLIENTS.filter(
      (c) => c.name.toLowerCase().includes(q) || c.phone.includes(q)
    ).slice(0, 8);
  }, [clientSearch]);

  // Services filter
  const filteredServices = useMemo(() => {
    const active = SERVICES.filter((s) => s.active);
    if (serviceCategory === 'All') return active;
    return active.filter((s) => s.category === serviceCategory);
  }, [serviceCategory]);

  // Techs
  const techsForBooking = useMemo(() => {
    return CALENDAR_STAFF.filter((t) => t.role === 'Staff');
  }, []);

  const selectedTechData = selectedTech
    ? CALENDAR_STAFF.find((t) => t.id === selectedTech)
    : null;

  // Total
  const totalPrice = selectedServices.reduce((sum, svc) => sum + svc.price, 0);
  const totalDuration = selectedServices.reduce((sum, svc) => sum + svc.duration, 0);

  // Calendar navigation
  const prevMonth = () => {
    if (calMonth === 0) {
      setCalMonth(11);
      setCalYear(calYear - 1);
    } else {
      setCalMonth(calMonth - 1);
    }
  };
  const nextMonth = () => {
    if (calMonth === 11) {
      setCalMonth(0);
      setCalYear(calYear + 1);
    } else {
      setCalMonth(calMonth + 1);
    }
  };

  const toggleService = (svc: Service) => {
    setSelectedServices((prev) => {
      const exists = prev.find((s) => s.id === svc.id);
      if (exists) return prev.filter((s) => s.id !== svc.id);
      return [...prev, svc];
    });
  };

  const handleConfirm = () => {
    if (!selectedClient) {
      Alert.alert('Missing Client', 'Please select a client.');
      return;
    }
    if (selectedServices.length === 0) {
      Alert.alert('Missing Service', 'Please select at least one service.');
      return;
    }
    if (!selectedDate) {
      Alert.alert('Missing Date', 'Please select a date.');
      return;
    }
    if (selectedTime === null) {
      Alert.alert('Missing Time', 'Please select a time slot.');
      return;
    }

    Alert.alert(
      'Booking Confirmed',
      `${selectedClient.name}\n${selectedServices.map((s) => s.name).join(', ')}\n${selectedDate} at ${fmtTime(selectedTime)}`,
      [{ text: 'OK', onPress: () => router.back() }]
    );
  };

  const apptTypes = APPT_TYPES.filter(
    (a) => a.key !== 'misc' && a.key !== 'walk-in'
  );

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: colors.cream }]} edges={['top']}>
      {/* Navigation Bar */}
      <View style={s.navBar}>
        <Pressable onPress={() => router.back()} style={s.backBtn}>
          <Feather name="x" size={22} color={colors.obsidian} />
        </Pressable>
        <Text style={[s.navTitle, { color: colors.obsidian }]}>{t('bkTitle')}</Text>
        <View style={s.backBtn} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={s.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ─── 01 Client ──────────────────── */}
          <View style={s.formSection}>
            <View style={s.sectionHeader}>
              <SectionNumber num="01" />
              <Text style={[s.sectionTitle, { color: colors.obsidian }]}>{t('bkClient')}</Text>
            </View>

            {selectedClient ? (
              <View style={[s.selectedClientCard, { backgroundColor: colors.warmWhite }, shadows.card]}>
                <View style={s.selectedClientInfo}>
                  <Text style={[s.selectedClientName, { color: colors.obsidian }]}>
                    {selectedClient.name}
                  </Text>
                  <Text style={[s.selectedClientPhone, { color: colors.textMuted }]}>
                    {selectedClient.phone}
                  </Text>
                  {selectedClient.vip && <StatusBadge status="vip" />}
                </View>
                <Pressable
                  onPress={() => {
                    setSelectedClient(null);
                    setClientSearch('');
                  }}
                  style={s.clearClientBtn}
                >
                  <Feather name="x" size={16} color={colors.textMuted} />
                </Pressable>
              </View>
            ) : (
              <View>
                <View style={[s.searchContainer, { backgroundColor: colors.creamDark }]}>
                  <Feather name="search" size={16} color={colors.textMuted} style={{ marginRight: 8 }} />
                  <TextInput
                    style={[s.searchInput, { color: colors.obsidian }]}
                    value={clientSearch}
                    onChangeText={(t) => {
                      setClientSearch(t);
                      setShowClientDropdown(true);
                    }}
                    onFocus={() => setShowClientDropdown(true)}
                    placeholder={t('bkSearchClients')}
                    placeholderTextColor={colors.textMuted}
                  />
                  {clientSearch.length > 0 && (
                    <Pressable onPress={() => setClientSearch('')}>
                      <Feather name="x" size={16} color={colors.textMuted} />
                    </Pressable>
                  )}
                </View>

                {showClientDropdown && (
                  <View style={[s.dropdown, { backgroundColor: colors.warmWhite, borderColor: colors.border }, shadows.elevated]}>
                    {filteredClients.map((client) => (
                      <Pressable
                        key={client.id}
                        onPress={() => {
                          setSelectedClient(client);
                          setClientSearch('');
                          setShowClientDropdown(false);
                        }}
                        style={[s.dropdownItem, { borderBottomColor: colors.border }]}
                      >
                        <View style={s.dropdownItemLeft}>
                          <Text style={[s.dropdownItemName, { color: colors.obsidian }]}>
                            {client.name}
                          </Text>
                          <Text style={[s.dropdownItemSub, { color: colors.textMuted }]}>
                            {client.phone}
                          </Text>
                        </View>
                        {client.vip && <StatusBadge status="vip" />}
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>
            )}
          </View>

          {/* ─── 02 Services ────────────────── */}
          <View style={s.formSection}>
            <View style={s.sectionHeader}>
              <SectionNumber num="02" />
              <Text style={[s.sectionTitle, { color: colors.obsidian }]}>{t('bkServices')}</Text>
              {selectedServices.length > 0 && (
                <View style={[s.countBadge, { backgroundColor: colors.obsidian }]}>
                  <Text style={[s.countBadgeText, { color: colors.warmWhite }]}>
                    {selectedServices.length}
                  </Text>
                </View>
              )}
            </View>

            {/* Category tabs */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.categoryRow}
            >
              {['All', ...SERVICE_CATEGORIES].map((cat) => {
                const active = cat === serviceCategory;
                return (
                  <Pressable
                    key={cat}
                    onPress={() => setServiceCategory(cat)}
                    style={[
                      s.categoryChip,
                      active
                        ? { backgroundColor: colors.obsidian }
                        : { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.border },
                    ]}
                  >
                    <Text
                      style={[
                        s.categoryChipLabel,
                        { color: active ? colors.warmWhite : colors.charcoal },
                      ]}
                    >
                      {cat}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            {/* Service list */}
            <View style={s.servicesList}>
              {filteredServices.map((svc) => {
                const isSelected = selectedServices.some((ss) => ss.id === svc.id);
                return (
                  <Pressable
                    key={svc.id}
                    onPress={() => toggleService(svc)}
                    style={[
                      s.serviceCard,
                      {
                        backgroundColor: colors.warmWhite,
                        borderColor: isSelected ? colors.goldDeep : colors.border,
                        borderWidth: isSelected ? 1.5 : 1,
                      },
                    ]}
                  >
                    <View style={s.serviceCardLeft}>
                      <Text style={[s.serviceCardName, { color: colors.obsidian }]}>
                        {svc.name}
                      </Text>
                      <Text style={[s.serviceCardMeta, { color: colors.textMuted }]}>
                        {svc.duration} {t('mins')} &middot; {fmtCurrency(svc.price)}
                      </Text>
                    </View>
                    <View
                      style={[
                        s.serviceCheck,
                        {
                          backgroundColor: isSelected ? colors.obsidian : 'transparent',
                          borderColor: isSelected ? colors.obsidian : colors.border,
                        },
                      ]}
                    >
                      {isSelected && (
                        <Feather name="check" size={12} color={colors.warmWhite} />
                      )}
                    </View>
                  </Pressable>
                );
              })}
            </View>

            {/* Selected services summary */}
            {selectedServices.length > 0 && (
              <View style={[s.summaryBar, { backgroundColor: colors.creamDark }]}>
                <Text style={[s.summaryText, { color: colors.charcoal }]}>
                  {selectedServices.length} service{selectedServices.length > 1 ? 's' : ''} &middot;{' '}
                  {totalDuration} {t('mins')}
                </Text>
                <Text style={[s.summaryPrice, { color: colors.obsidian }]}>
                  {fmtCurrency(totalPrice)}
                </Text>
              </View>
            )}
          </View>

          {/* ─── 03 Technician ──────────────── */}
          <View style={s.formSection}>
            <View style={s.sectionHeader}>
              <SectionNumber num="03" />
              <Text style={[s.sectionTitle, { color: colors.obsidian }]}>{t('bkTechnician')}</Text>
            </View>

            {staffUser && user ? (
              // Staff can only see themselves
              <View style={[s.techCard, { backgroundColor: colors.warmWhite }, shadows.card]}>
                <Avatar
                  initials={user.initials}
                  gold={user.gold}
                  size="list"
                />
                <Text style={[s.techCardName, { color: colors.obsidian }]}>
                  {user.first} {user.last}
                </Text>
                <View style={[s.techLocked, { backgroundColor: colors.creamDark }]}>
                  <Text style={[s.techLockedText, { color: colors.textMuted }]}>Your schedule</Text>
                </View>
              </View>
            ) : (
              <View>
                <Pressable
                  onPress={() => setShowTechDropdown(!showTechDropdown)}
                  style={[s.dropdownTrigger, { backgroundColor: colors.warmWhite, borderColor: colors.border }, shadows.card]}
                >
                  {selectedTechData ? (
                    <View style={s.techTriggerContent}>
                      <Avatar
                        initials={selectedTechData.initials}
                        gold={selectedTechData.gold}
                        size="list"
                      />
                      <Text style={[s.techCardName, { color: colors.obsidian }]}>
                        {selectedTechData.first} {selectedTechData.last}
                      </Text>
                    </View>
                  ) : (
                    <Text style={[s.placeholderText, { color: colors.textMuted }]}>
                      {t('bkAnyAvailable')}
                    </Text>
                  )}
                  <Feather
                    name={showTechDropdown ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color={colors.textMuted}
                  />
                </Pressable>

                {showTechDropdown && (
                  <View style={[s.dropdown, { backgroundColor: colors.warmWhite, borderColor: colors.border }, shadows.elevated]}>
                    <Pressable
                      onPress={() => {
                        setSelectedTech(null);
                        setShowTechDropdown(false);
                      }}
                      style={[s.dropdownItem, { borderBottomColor: colors.border }]}
                    >
                      <Text style={[s.dropdownItemName, { color: colors.textMuted }]}>
                        {t('bkAnyAvailable')}
                      </Text>
                    </Pressable>
                    {techsForBooking.map((tech) => (
                      <Pressable
                        key={tech.id}
                        onPress={() => {
                          setSelectedTech(tech.id);
                          setShowTechDropdown(false);
                        }}
                        style={[s.dropdownItem, { borderBottomColor: colors.border }]}
                      >
                        <View style={s.techDropdownRow}>
                          <Avatar initials={tech.initials} gold={tech.gold} size="compact" />
                          <Text style={[s.dropdownItemName, { color: colors.obsidian }]}>
                            {tech.first} {tech.last}
                          </Text>
                        </View>
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>
            )}
          </View>

          {/* ─── 04 Date & Time ─────────────── */}
          <View style={s.formSection}>
            <View style={s.sectionHeader}>
              <SectionNumber num="04" />
              <Text style={[s.sectionTitle, { color: colors.obsidian }]}>{t('bkDateTime')}</Text>
            </View>

            {/* Month navigation */}
            <View style={s.monthNav}>
              <Pressable onPress={prevMonth} style={s.monthNavBtn}>
                <Feather name="chevron-left" size={20} color={colors.obsidian} />
              </Pressable>
              <Text style={[s.monthNavLabel, { color: colors.obsidian }]}>
                {MONTHS[calMonth]} {calYear}
              </Text>
              <Pressable onPress={nextMonth} style={s.monthNavBtn}>
                <Feather name="chevron-right" size={20} color={colors.obsidian} />
              </Pressable>
            </View>

            {/* Calendar */}
            <CalendarMonth
              year={calYear}
              month={calMonth}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              todayKey={todayKey}
            />

            {/* Time slots */}
            {selectedDate && (
              <View style={s.timeSlotsSection}>
                <Text style={[s.timeSlotsLabel, { color: colors.textMuted }]}>
                  Available times
                </Text>
                <View style={s.timeGrid}>
                  {TIME_SLOTS.map((min) => {
                    const active = selectedTime === min;
                    return (
                      <Pressable
                        key={min}
                        onPress={() => setSelectedTime(min)}
                        style={[
                          s.timeSlot,
                          active
                            ? { backgroundColor: colors.obsidian }
                            : { backgroundColor: colors.warmWhite, borderWidth: 1, borderColor: colors.border },
                        ]}
                      >
                        <Text
                          style={[
                            s.timeSlotText,
                            { color: active ? colors.warmWhite : colors.charcoal },
                          ]}
                        >
                          {fmtTime(min)}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            )}
          </View>

          {/* ─── 05 Notes ───────────────────── */}
          <View style={s.formSection}>
            <View style={s.sectionHeader}>
              <SectionNumber num="05" />
              <Text style={[s.sectionTitle, { color: colors.obsidian }]}>{t('bkNotes')}</Text>
            </View>
            <TextInput
              style={[
                s.notesInput,
                {
                  backgroundColor: colors.warmWhite,
                  color: colors.obsidian,
                  borderColor: colors.border,
                },
              ]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Add notes for this appointment..."
              placeholderTextColor={colors.textFaint}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {/* ─── 06 Type ────────────────────── */}
          <View style={s.formSection}>
            <View style={s.sectionHeader}>
              <SectionNumber num="06" />
              <Text style={[s.sectionTitle, { color: colors.obsidian }]}>{t('apptType')}</Text>
            </View>
            <View style={s.typeRow}>
              {apptTypes.map((at) => {
                const active = selectedApptType === at.key;
                return (
                  <Pressable
                    key={at.key}
                    onPress={() => setSelectedApptType(at.key)}
                    style={[
                      s.typePill,
                      active
                        ? { backgroundColor: colors.obsidian }
                        : { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.border },
                    ]}
                  >
                    <Text
                      style={[
                        s.typePillText,
                        { color: active ? colors.warmWhite : colors.charcoal },
                      ]}
                    >
                      {at.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={s.bottomSpacer} />
        </ScrollView>

        {/* Confirm Button */}
        <View style={[s.bottomBar, { backgroundColor: colors.cream, borderTopColor: colors.border }]}>
          {totalPrice > 0 && (
            <Text style={[s.bottomTotal, { color: colors.textMuted }]}>
              Total: {fmtCurrency(totalPrice)} &middot; {totalDuration} {t('mins')}
            </Text>
          )}
          <Pressable
            onPress={handleConfirm}
            style={[s.confirmBtn, { backgroundColor: colors.goldDeep }]}
          >
            <Text style={[s.confirmBtnText, { color: colors.warmWhite }]}>
              {t('bkConfirm')}
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Styles ────────────────────────────────────────────

const s = StyleSheet.create({
  safe: { flex: 1 },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTitle: {
    fontSize: 16,
    fontFamily: 'Jost_500Medium',
  },
  scroll: { flex: 1 },

  // Sections
  formSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  sectionNum: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionNumText: {
    fontSize: 12,
    fontFamily: 'Jost_600SemiBold',
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Jost_500Medium',
    flex: 1,
  },

  // Client
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Jost_400Regular',
  },
  selectedClientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 14,
    padding: 14,
  },
  selectedClientInfo: {
    gap: 2,
  },
  selectedClientName: {
    fontSize: 15,
    fontFamily: 'Jost_500Medium',
  },
  selectedClientPhone: {
    fontSize: 12,
    fontFamily: 'Jost_400Regular',
  },
  clearClientBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Dropdown
  dropdown: {
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 6,
    overflow: 'hidden',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
  },
  dropdownItemLeft: {
    gap: 2,
  },
  dropdownItemName: {
    fontSize: 14,
    fontFamily: 'Jost_500Medium',
  },
  dropdownItemSub: {
    fontSize: 12,
    fontFamily: 'Jost_400Regular',
  },

  // Services
  categoryRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  categoryChip: {
    paddingHorizontal: 14,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryChipLabel: {
    fontSize: 13,
    fontFamily: 'Jost_500Medium',
  },
  servicesList: {
    gap: 8,
  },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    padding: 14,
  },
  serviceCardLeft: {
    flex: 1,
    gap: 2,
  },
  serviceCardName: {
    fontSize: 14,
    fontFamily: 'Jost_500Medium',
  },
  serviceCardMeta: {
    fontSize: 12,
    fontFamily: 'Jost_400Regular',
  },
  serviceCheck: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countBadgeText: {
    fontSize: 11,
    fontFamily: 'Jost_600SemiBold',
  },
  summaryBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 10,
  },
  summaryText: {
    fontSize: 13,
    fontFamily: 'Jost_400Regular',
  },
  summaryPrice: {
    fontSize: 15,
    fontFamily: 'Jost_600SemiBold',
  },

  // Technician
  techCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 14,
    padding: 14,
  },
  techCardName: {
    fontSize: 14,
    fontFamily: 'Jost_500Medium',
    flex: 1,
  },
  techLocked: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  techLockedText: {
    fontSize: 11,
    fontFamily: 'Jost_400Regular',
  },
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
  },
  techTriggerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  techDropdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  placeholderText: {
    fontSize: 14,
    fontFamily: 'Jost_400Regular',
  },

  // Calendar
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  monthNavBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthNavLabel: {
    fontSize: 16,
    fontFamily: 'Jost_500Medium',
  },

  // Time slots
  timeSlotsSection: {
    marginTop: 16,
  },
  timeSlotsLabel: {
    fontSize: 12,
    fontFamily: 'Jost_500Medium',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeSlot: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  timeSlotText: {
    fontSize: 13,
    fontFamily: 'Jost_500Medium',
  },

  // Notes
  notesInput: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    fontSize: 14,
    fontFamily: 'Jost_400Regular',
    minHeight: 80,
  },

  // Type pills
  typeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typePill: {
    paddingHorizontal: 16,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  typePillText: {
    fontSize: 13,
    fontFamily: 'Jost_500Medium',
  },

  // Bottom bar
  bottomBar: {
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 34,
    gap: 8,
  },
  bottomTotal: {
    fontSize: 13,
    fontFamily: 'Jost_400Regular',
    textAlign: 'center',
  },
  confirmBtn: {
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtnText: {
    fontSize: 16,
    fontFamily: 'Jost_600SemiBold',
  },

  bottomSpacer: { height: 24 },
});
