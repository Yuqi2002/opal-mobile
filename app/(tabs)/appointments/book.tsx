import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
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
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  withSequence,
  Easing,
  runOnJS,
  interpolate,
} from 'react-native-reanimated';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../../src/contexts/ThemeContext';
import { useAuth } from '../../../src/contexts/AuthContext';
import { useTranslation } from '../../../src/contexts/I18nContext';
import { useStore } from '../../../src/contexts/StoreContext';
import { BOOKING_CLIENTS } from '../../../src/data/clients';
import { SERVICES, SERVICE_CATEGORIES, APPT_TYPES } from '../../../src/data/services';
import { CALENDAR_STAFF, getCalendarStaffForStore } from '../../../src/data/staff';
import { getStaffAppointments, addAppointment } from '../../../src/data/appointments';
import { emitNewAppt } from '../../../src/hooks/useNewApptHighlight';
import { STORES } from '../../../src/data/stores';
import { fmtKey, fmtTime, formatDate, DAY_START_MIN, DAY_END_MIN } from '../../../src/utils/time';
import { fmtCurrency } from '../../../src/utils/currency';
import { isStaff, canBookForOthers } from '../../../src/utils/permissions';
import { Avatar } from '../../../src/components/Avatar';
import { StatusBadge } from '../../../src/components/StatusBadge';
import { shadows } from '../../../src/theme/tokens';
import type { Service, BookingClient, Store } from '../../../src/types/models';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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
  while (rows.length > 0 && rows[rows.length - 1].length < 7) {
    rows[rows.length - 1].push(null);
  }

  return (
    <View style={cs.calContainer}>
      <View style={cs.calWeekRow}>
        {DAY_NAMES.map((dn) => (
          <View key={dn} style={cs.calCell}>
            <Text style={[cs.calDowLabel, { color: colors.textMuted }]}>{dn}</Text>
          </View>
        ))}
      </View>
      {rows.map((row, ri) => (
        <View key={ri} style={cs.calWeekRow}>
          {row.map((day, ci) => {
            if (day === null) return <View key={ci} style={cs.calCell} />;
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

// ─── Service Config Modal ──────────────────────────────

interface ServiceConfig {
  serviceId: string;
  techId: string | null;
  time: number | null;
  date?: string;
}

function ServiceConfigSheet({
  service,
  config,
  storeId: _storeId,
  selectedDate,
  onSave,
  onCancel,
}: {
  service: Service;
  config: ServiceConfig;
  storeId: string;
  selectedDate: string | null;
  onSave: (cfg: ServiceConfig) => void;
  onCancel: () => void;
}) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { user } = useAuth();
  const userRole = user?.role ?? 'r04';
  const staffUser = isStaff(userRole);

  // ─── Date state ────────────────────────
  const todayKey = fmtKey(new Date());
  const [dateKey, setDateKey] = useState<string>(selectedDate ?? todayKey);
  const [showCalendar, setShowCalendar] = useState(false);

  const dateObj = useMemo(() => new Date(dateKey + 'T00:00:00'), [dateKey]);
  const [calMonth, setCalMonth] = useState(dateObj.getMonth());
  const [calYear, setCalYear] = useState(dateObj.getFullYear());

  const stepDate = (delta: number) => {
    const d = new Date(dateKey + 'T00:00:00');
    d.setDate(d.getDate() + delta);
    const newKey = fmtKey(d);
    if (newKey < todayKey) return;
    setDateKey(newKey);
    setCalMonth(d.getMonth());
    setCalYear(d.getFullYear());
  };

  const handleDateSelect = (key: string) => {
    setDateKey(key);
    setShowCalendar(false);
    const d = new Date(key + 'T00:00:00');
    setCalMonth(d.getMonth());
    setCalYear(d.getFullYear());
  };

  const prevCalMonth = () => {
    if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1); }
    else setCalMonth(calMonth - 1);
  };
  const nextCalMonth = () => {
    if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1); }
    else setCalMonth(calMonth + 1);
  };

  // ─── Tech state ────────────────────────
  const [techId, setTechId] = useState<string | null>(
    config.techId ?? (staffUser && user ? user.id : null)
  );
  const [time, setTime] = useState<number | null>(config.time);
  const [techSearch, setTechSearch] = useState('');
  const [showTechDropdown, setShowTechDropdown] = useState(false);

  const { selectedStoreId } = useStore();
  const storeStaff = useMemo(() => getCalendarStaffForStore(selectedStoreId), [selectedStoreId]);

  const techsForBooking = useMemo(() => {
    return storeStaff.filter((t) => t.role === 'Staff');
  }, [storeStaff]);

  const filteredTechs = useMemo(() => {
    if (!techSearch) return techsForBooking;
    const q = techSearch.toLowerCase();
    return techsForBooking.filter(
      (t) => t.first.toLowerCase().includes(q) || t.last.toLowerCase().includes(q)
    );
  }, [techSearch, techsForBooking]);

  const selectedTechData = techId ? storeStaff.find((t) => t.id === techId) : null;

  // ─── Schedule data ────────────────────
  const HOUR_PX = 100;
  const techShift = selectedTechData?.shift;
  const shiftStartMin = techShift ? techShift[0] * 60 : DAY_START_MIN;
  const shiftEndMin = techShift ? techShift[1] * 60 : DAY_END_MIN;
  const totalHeight = ((shiftEndMin - shiftStartMin) / 60) * HOUR_PX;

  const existingAppts = useMemo(() => {
    if (!techId) return [];
    return getStaffAppointments(dateKey, techId);
  }, [techId, dateKey]);

  const hours = useMemo(() => {
    const h: number[] = [];
    const startH = Math.floor(shiftStartMin / 60);
    const endH = Math.ceil(shiftEndMin / 60);
    for (let i = startH; i <= endH; i++) h.push(i);
    return h;
  }, [shiftStartMin, shiftEndMin]);

  const wouldOverlap = useCallback((startMin: number) => {
    const endMin = startMin + service.duration;
    return existingAppts.some(
      (a) => startMin < a.endMin && endMin > a.startMin
    );
  }, [existingAppts, service.duration]);

  const slotCount = Math.floor((shiftEndMin - shiftStartMin) / 15);
  const slotHeight = (15 / 60) * HOUR_PX;

  // ─── Drag-to-reposition (Google Calendar style) ────
  const [scrollEnabled, setScrollEnabledState] = useState(true);
  const [dragTime, setDragTime] = useState<number | null>(null);
  const displayTime = dragTime ?? time;

  const dragOffsetY = useSharedValue(0);
  const isDraggingVal = useSharedValue(false);
  const dragScaleVal = useSharedValue(1);
  const lastDragSnap = useSharedValue(0);

  const baseTopSV = useSharedValue(0);
  const shiftStartMinSV = useSharedValue(shiftStartMin);
  const shiftEndMinSV = useSharedValue(shiftEndMin);
  const durationSV = useSharedValue(service.duration);

  useEffect(() => {
    shiftStartMinSV.value = shiftStartMin;
    shiftEndMinSV.value = shiftEndMin;
    durationSV.value = service.duration;
  }, [shiftStartMin, shiftEndMin, service.duration]);

  useEffect(() => {
    if (time != null) {
      baseTopSV.value = ((time - shiftStartMin) / 60) * HOUR_PX;
    }
  }, [time, shiftStartMin]);

  const finishDrag = useCallback((clampedMin: number) => {
    if (!wouldOverlap(clampedMin)) {
      setTime(clampedMin);
    }
    setDragTime(null);
    setScrollEnabledState(true);
  }, [wouldOverlap]);

  const triggerHaptic = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, []);

  const dragGesture = useMemo(() =>
    Gesture.Pan()
      .activateAfterLongPress(300)
      .onStart(() => {
        isDraggingVal.value = true;
        dragScaleVal.value = withTiming(1.04, { duration: 100 });
        runOnJS(triggerHaptic)();
        runOnJS(setScrollEnabledState)(false);
      })
      .onUpdate((e) => {
        dragOffsetY.value = e.translationY;
        const currentTop = baseTopSV.value + e.translationY;
        const rawMin = (currentTop / HOUR_PX) * 60 + shiftStartMinSV.value;
        const snappedMin = Math.round(rawMin / 15) * 15;
        const clamped = Math.max(
          shiftStartMinSV.value,
          Math.min(shiftEndMinSV.value - durationSV.value, snappedMin)
        );
        if (clamped !== lastDragSnap.value) {
          lastDragSnap.value = clamped;
          runOnJS(setDragTime)(clamped);
        }
      })
      .onEnd(() => {
        const currentTop = baseTopSV.value + dragOffsetY.value;
        const rawMin = (currentTop / HOUR_PX) * 60 + shiftStartMinSV.value;
        const snappedMin = Math.round(rawMin / 15) * 15;
        const clamped = Math.max(
          shiftStartMinSV.value,
          Math.min(shiftEndMinSV.value - durationSV.value, snappedMin)
        );
        dragOffsetY.value = 0;
        dragScaleVal.value = withTiming(1, { duration: 150 });
        isDraggingVal.value = false;
        runOnJS(finishDrag)(clamped);
      })
      .onFinalize(() => {
        if (isDraggingVal.value) {
          dragOffsetY.value = 0;
          dragScaleVal.value = withTiming(1, { duration: 150 });
          isDraggingVal.value = false;
          runOnJS(setScrollEnabledState)(true);
          runOnJS(setDragTime)(null);
        }
      }),
    [triggerHaptic, finishDrag]
  );

  const animatedApptStyle = useAnimatedStyle(() => {
    const dragging = isDraggingVal.value;
    return {
      top: baseTopSV.value + dragOffsetY.value,
      transform: [{ scale: dragScaleVal.value }],
      zIndex: dragging ? 100 : 1,
      shadowOpacity: dragging ? 0.25 : 0,
      shadowRadius: dragging ? 8 : 0,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: dragging ? 4 : 0 },
      elevation: dragging ? 8 : 0,
    };
  });

  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet">
      <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={[s.safe, { backgroundColor: colors.cream }]} edges={['top']}>
        {/* Header */}
        <View style={s.navBar}>
          <Pressable onPress={onCancel} style={s.backBtn}>
            <Feather name="x" size={22} color={colors.obsidian} />
          </Pressable>
          <Text style={[s.navTitle, { color: colors.obsidian }]} numberOfLines={1}>
            {service.name}
          </Text>
          <View style={s.backBtn} />
        </View>

        {/* Service info bar */}
        <View style={[scs.serviceBar, { backgroundColor: colors.warmWhite }]}>
          <Text style={[scs.serviceBarName, { color: colors.obsidian }]}>{service.name}</Text>
          <Text style={[scs.serviceBarMeta, { color: colors.textMuted }]}>
            {service.duration} {t('mins')} · {fmtCurrency(service.price)}
          </Text>
        </View>

        {/* Date Picker Row + popover calendar */}
        <View style={scs.dateRowWrapper}>
          <View style={[scs.dateRow, { borderBottomColor: colors.border }]}>
            <Pressable
              onPress={() => stepDate(-1)}
              style={scs.dateStepBtn}
              disabled={dateKey <= todayKey}
            >
              <Feather
                name="chevron-left"
                size={20}
                color={dateKey <= todayKey ? colors.textFaint : colors.obsidian}
              />
            </Pressable>
            <Pressable
              onPress={() => setShowCalendar(!showCalendar)}
              style={scs.dateLabelBtn}
            >
              <Text style={[scs.dateLabel, { color: colors.obsidian }]}>
                {formatDate(dateObj)}
              </Text>
              <Feather
                name={showCalendar ? 'chevron-up' : 'chevron-down'}
                size={16}
                color={colors.textMuted}
              />
            </Pressable>
            <Pressable onPress={() => stepDate(1)} style={scs.dateStepBtn}>
              <Feather name="chevron-right" size={20} color={colors.obsidian} />
            </Pressable>
          </View>

          {/* Calendar popover */}
          {showCalendar && (
            <View
              style={[
                scs.calPopover,
                { backgroundColor: colors.warmWhite, borderColor: colors.border },
              ]}
            >
              <View style={s.monthNav}>
                <Pressable onPress={prevCalMonth} style={s.monthNavBtn}>
                  <Feather name="chevron-left" size={20} color={colors.obsidian} />
                </Pressable>
                <Text style={[s.monthNavLabel, { color: colors.obsidian }]}>
                  {MONTHS[calMonth]} {calYear}
                </Text>
                <Pressable onPress={nextCalMonth} style={s.monthNavBtn}>
                  <Feather name="chevron-right" size={20} color={colors.obsidian} />
                </Pressable>
              </View>
              <CalendarMonth
                year={calYear}
                month={calMonth}
                selectedDate={dateKey}
                onSelectDate={handleDateSelect}
                todayKey={todayKey}
              />
            </View>
          )}
        </View>

        {/* Technician selector */}
        <View style={[scs.techSection, { borderBottomColor: colors.border }]}>
          {staffUser && user ? (
            <View style={[scs.techChip, { backgroundColor: colors.warmWhite }]}>
              <Avatar initials={user.initials} gold={user.gold} size="compact" />
              <Text style={[scs.techChipName, { color: colors.obsidian }]}>
                {user.first} {user.last}
              </Text>
            </View>
          ) : (
            <View>
              <Pressable
                onPress={() => setShowTechDropdown(!showTechDropdown)}
                style={[
                  scs.techTrigger,
                  { backgroundColor: colors.warmWhite, borderColor: colors.border },
                ]}
              >
                {selectedTechData ? (
                  <View style={s.techTriggerContent}>
                    <Avatar
                      initials={selectedTechData.initials}
                      gold={selectedTechData.gold}
                      size="compact"
                    />
                    <Text style={[s.techDropdownName, { color: colors.obsidian }]}>
                      {selectedTechData.first} {selectedTechData.last}
                    </Text>
                  </View>
                ) : (
                  <View style={s.techTriggerContent}>
                    <Feather name="users" size={16} color={colors.textMuted} />
                    <Text style={[s.placeholderText, { color: colors.textMuted }]}>
                      {t('bkAnyAvailable')}
                    </Text>
                  </View>
                )}
                <Feather
                  name={showTechDropdown ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color={colors.textMuted}
                />
              </Pressable>

              {showTechDropdown && (
                <View
                  style={[
                    s.dropdown,
                    { backgroundColor: colors.warmWhite, borderColor: colors.border },
                    shadows.elevated,
                  ]}
                >
                  <View style={[s.techSearchRow, { borderBottomColor: colors.border }]}>
                    <Feather name="search" size={14} color={colors.textMuted} style={{ marginRight: 8 }} />
                    <TextInput
                      style={[s.techSearchInput, { color: colors.obsidian }]}
                      value={techSearch}
                      onChangeText={setTechSearch}
                      placeholder="Search technicians..."
                      placeholderTextColor={colors.textMuted}
                      autoFocus
                    />
                    {techSearch.length > 0 && (
                      <Pressable onPress={() => setTechSearch('')}>
                        <Feather name="x" size={14} color={colors.textMuted} />
                      </Pressable>
                    )}
                  </View>

                  {!techSearch && (
                    <Pressable
                      onPress={() => {
                        setTechId(null);
                        setShowTechDropdown(false);
                        setTechSearch('');
                      }}
                      style={[
                        s.dropdownItem,
                        { borderBottomColor: colors.border },
                        techId === null && { backgroundColor: colors.goldSoft },
                      ]}
                    >
                      <View style={s.techTriggerContent}>
                        <Feather name="users" size={14} color={colors.textMuted} />
                        <Text style={[s.dropdownItemName, { color: colors.textMuted }]}>
                          {t('bkAnyAvailable')}
                        </Text>
                      </View>
                      {techId === null && (
                        <Feather name="check" size={14} color={colors.goldDeep} />
                      )}
                    </Pressable>
                  )}

                  {filteredTechs.map((tech) => {
                    const active = techId === tech.id;
                    return (
                      <Pressable
                        key={tech.id}
                        onPress={() => {
                          setTechId(tech.id);
                          setShowTechDropdown(false);
                          setTechSearch('');
                        }}
                        style={[
                          s.dropdownItem,
                          { borderBottomColor: colors.border },
                          active && { backgroundColor: colors.goldSoft },
                        ]}
                      >
                        <View style={s.techTriggerContent}>
                          <Avatar initials={tech.initials} gold={tech.gold} size="compact" />
                          <Text style={[s.dropdownItemName, { color: colors.obsidian }]}>
                            {tech.first} {tech.last}
                          </Text>
                        </View>
                        {active && <Feather name="check" size={14} color={colors.goldDeep} />}
                      </Pressable>
                    );
                  })}

                  {filteredTechs.length === 0 && techSearch.length > 0 && (
                    <View style={s.techNoResults}>
                      <Text style={[s.techNoResultsText, { color: colors.textMuted }]}>
                        No technicians found
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          )}
        </View>

        {/* Schedule Column */}
        {techId ? (
          <ScrollView
            style={scs.scheduleScroll}
            contentContainerStyle={scs.scheduleContent}
            showsVerticalScrollIndicator={false}
            scrollEnabled={scrollEnabled}
          >
            <Text style={[scs.scheduleTitle, { color: colors.textMuted }]}>
              Tap to select a time slot
            </Text>
            <View style={{ height: totalHeight, position: 'relative' }}>
              {/* Tappable 15-min slots */}
              {Array.from({ length: slotCount }).map((_, i) => {
                const slotMin = shiftStartMin + i * 15;
                const top = ((slotMin - shiftStartMin) / 60) * HOUR_PX;
                const isOccupied = existingAppts.some(
                  (a) => slotMin >= a.startMin && slotMin < a.endMin
                );
                return (
                  <Pressable
                    key={slotMin}
                    onPress={() => {
                      if (!isOccupied && !wouldOverlap(slotMin)) {
                        setTime(slotMin);
                      }
                    }}
                    style={{
                      position: 'absolute',
                      left: 62,
                      right: 0,
                      top,
                      height: slotHeight,
                    }}
                  />
                );
              })}

              {/* Hour lines + labels */}
              {hours.map((hour) => {
                const top = ((hour * 60 - shiftStartMin) / 60) * HOUR_PX;
                return (
                  <View
                    key={hour}
                    style={[scs.hourRow, { top }]}
                    pointerEvents="none"
                  >
                    <Text style={[scs.hourLabel, { color: colors.textFaint }]}>
                      {fmtTime(hour * 60)}
                    </Text>
                    <View style={[scs.hourLine, { backgroundColor: colors.border }]} />
                  </View>
                );
              })}

              {/* Existing appointments */}
              {existingAppts.map((appt) => {
                const top = ((appt.startMin - shiftStartMin) / 60) * HOUR_PX;
                const height = Math.max(
                  ((appt.endMin - appt.startMin) / 60) * HOUR_PX,
                  24
                );
                return (
                  <View
                    key={appt.id}
                    style={[
                      scs.apptBlock,
                      {
                        top,
                        height,
                        backgroundColor: colors.creamDark,
                        borderLeftColor: colors.textMuted,
                      },
                    ]}
                    pointerEvents="none"
                  >
                    <Text
                      style={[scs.apptBlockClient, { color: colors.charcoal }]}
                      numberOfLines={1}
                    >
                      {appt.client}
                    </Text>
                    {height > 30 && (
                      <Text
                        style={[scs.apptBlockService, { color: colors.textMuted }]}
                        numberOfLines={1}
                      >
                        {appt.service}
                      </Text>
                    )}
                  </View>
                );
              })}

              {/* New appointment preview — long press & drag to reposition */}
              {time != null && (
                <GestureDetector gesture={dragGesture}>
                  <Animated.View
                    style={[
                      scs.newApptBlock,
                      {
                        height: Math.max((service.duration / 60) * HOUR_PX, 24),
                        backgroundColor: colors.goldSoft,
                        borderLeftColor: colors.goldDeep,
                      },
                      animatedApptStyle,
                    ]}
                  >
                    <Text
                      style={[scs.newApptName, { color: colors.goldDeep }]}
                      numberOfLines={1}
                    >
                      {service.name}
                    </Text>
                    <Text style={[scs.newApptTime, { color: colors.goldDeep }]}>
                      {fmtTime(displayTime!)} – {fmtTime(displayTime! + service.duration)}
                    </Text>
                  </Animated.View>
                </GestureDetector>
              )}
            </View>
          </ScrollView>
        ) : (
          <View style={scs.noTechHint}>
            <Feather name="calendar" size={32} color={colors.textFaint} />
            <Text style={[scs.noTechHintText, { color: colors.textMuted }]}>
              Select a technician to view their schedule
            </Text>
          </View>
        )}

        {/* Save button */}
        <View
          style={[
            s.bottomBar,
            { backgroundColor: colors.cream, borderTopColor: colors.border },
          ]}
        >
          <Pressable
            onPress={() =>
              onSave({ serviceId: service.id, techId, time, date: dateKey })
            }
            disabled={techId === null || time === null}
            style={[
              s.confirmBtn,
              { backgroundColor: techId !== null && time !== null ? colors.goldDeep : colors.textFaint },
            ]}
          >
            <Text style={[s.confirmBtnText, { color: colors.warmWhite }]}>
              {t('done')}
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
      </GestureHandlerRootView>
    </Modal>
  );
}

// ─── Service Config Styles ────────────────────────────

const scs = StyleSheet.create({
  serviceBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  serviceBarName: {
    fontSize: 14,
    fontFamily: 'Jost_500Medium',
  },
  serviceBarMeta: {
    fontSize: 12,
    fontFamily: 'Jost_400Regular',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  dateStepBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateLabelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  dateLabel: {
    fontSize: 15,
    fontFamily: 'Jost_500Medium',
  },
  dateRowWrapper: {
    zIndex: 10,
  },
  calPopover: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  techSection: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  techChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  techChipName: {
    fontSize: 14,
    fontFamily: 'Jost_500Medium',
  },
  techTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
  },
  scheduleScroll: {
    flex: 1,
  },
  scheduleContent: {
    paddingLeft: 4,
    paddingRight: 16,
    paddingTop: 8,
    paddingBottom: 40,
  },
  hourRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },
  hourLabel: {
    width: 56,
    fontSize: 10,
    fontFamily: 'Jost_400Regular',
    textAlign: 'right',
    paddingRight: 8,
  },
  hourLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
  apptBlock: {
    position: 'absolute',
    left: 62,
    right: 0,
    borderRadius: 6,
    borderLeftWidth: 3,
    paddingHorizontal: 8,
    paddingVertical: 4,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  apptBlockClient: {
    fontSize: 12,
    fontFamily: 'Jost_500Medium',
  },
  apptBlockService: {
    fontSize: 11,
    fontFamily: 'Jost_400Regular',
  },
  newApptBlock: {
    position: 'absolute',
    left: 62,
    right: 0,
    borderRadius: 6,
    borderLeftWidth: 3,
    paddingHorizontal: 8,
    paddingVertical: 4,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  newApptName: {
    fontSize: 12,
    fontFamily: 'Jost_600SemiBold',
  },
  newApptTime: {
    fontSize: 11,
    fontFamily: 'Jost_400Regular',
  },
  noTechHint: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 32,
  },
  scheduleTitle: {
    fontSize: 12,
    fontFamily: 'Jost_500Medium',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 12,
    paddingLeft: 62,
  },
  noTechHintText: {
    fontSize: 14,
    fontFamily: 'Jost_400Regular',
    textAlign: 'center',
  },
});

// ─── Main Booking Screen ───────────────────────────────

export default function BookScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();
  const { selectedStoreId, userStores } = useStore();

  const scrollRef = useRef<ScrollView>(null);
  const restSectionY = useRef(0);

  // ─── Validation highlight ──────────────────────────
  const MUTED_RED = '#B05050';
  const sectionYs = useRef<Record<string, number>>({ client: 0, date: 0, services: 0 });
  const [errorField, setErrorField] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const errorShake = useSharedValue(0);
  const errorOpacity = useSharedValue(0);
  const bannerTranslateY = useSharedValue(20);
  const bannerOpacity = useSharedValue(0);

  const errorBorderStyle = useAnimatedStyle(() => ({
    borderColor: `rgba(176, 80, 80, ${errorOpacity.value})`,
    borderWidth: interpolate(errorOpacity.value, [0, 1], [0, 2]),
    borderRadius: 14,
    transform: [{ translateX: errorShake.value }],
  }));

  const bannerStyle = useAnimatedStyle(() => ({
    opacity: bannerOpacity.value,
    transform: [{ translateY: bannerTranslateY.value }],
  }));

  // ─── Store + Client ─────────────────────────────────
  const singleStore = userStores.length === 1;
  const [storeId, setStoreId] = useState<string | null>(
    singleStore ? userStores[0].id : (selectedStoreId !== 'all' ? selectedStoreId : null)
  );
  const [showStorePicker, setShowStorePicker] = useState(false);

  const [clientSearch, setClientSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState<BookingClient | null>(null);
  const [showClientDropdown, setShowClientDropdown] = useState(false);

  const selectedStore = storeId ? STORES.find((st) => st.id === storeId) ?? null : null;

  // ─── Date + Services ─────────────────────────────────
  const todayKey = fmtKey(new Date());
  const today = new Date();
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [serviceConfigs, setServiceConfigs] = useState<Record<string, ServiceConfig>>({});
  const [serviceCategory, setServiceCategory] = useState<string>('All');

  const [configuringService, setConfiguringService] = useState<Service | null>(null);

  const [notes, setNotes] = useState('');
  const [selectedApptType, setSelectedApptType] = useState('chosen-tech');

  // ─── Confirmation overlay ───────────────────────────
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationData, setConfirmationData] = useState<{ client: string; services: string; date: string } | null>(null);
  const confirmBgOpacity = useSharedValue(0);
  const confirmCheckScale = useSharedValue(0);
  const confirmCheckOpacity = useSharedValue(0);
  const confirmTextOpacity = useSharedValue(0);
  const confirmTextTranslateY = useSharedValue(20);

  const confirmBgStyle = useAnimatedStyle(() => ({
    opacity: confirmBgOpacity.value,
  }));
  const confirmCheckStyle = useAnimatedStyle(() => ({
    opacity: confirmCheckOpacity.value,
    transform: [{ scale: confirmCheckScale.value }],
  }));
  const confirmTextStyle = useAnimatedStyle(() => ({
    opacity: confirmTextOpacity.value,
    transform: [{ translateY: confirmTextTranslateY.value }],
  }));

  // ─── Reveal animation ────────────────────────────────
  const showRest = storeId !== null;
  const revealProgress = useSharedValue(showRest ? 1 : 0);
  const [restMounted, setRestMounted] = useState(showRest);

  useEffect(() => {
    if (showRest) {
      setRestMounted(true);
      revealProgress.value = withTiming(1, {
        duration: 400,
        easing: Easing.out(Easing.cubic),
      });
      // Scroll down after a short delay so layout has settled
      setTimeout(() => {
        if (restSectionY.current > 0) {
          scrollRef.current?.scrollTo({ y: restSectionY.current - 20, animated: true });
        }
      }, 150);
    } else {
      revealProgress.value = withTiming(0, {
        duration: 300,
        easing: Easing.in(Easing.cubic),
      }, () => {
        runOnJS(setRestMounted)(false);
      });
    }
  }, [showRest]);

  const revealStyle = useAnimatedStyle(() => ({
    opacity: revealProgress.value,
    transform: [{ translateY: (1 - revealProgress.value) * 30 }],
  }));

  // Client search
  const filteredClients = useMemo(() => {
    if (!clientSearch) return BOOKING_CLIENTS.slice(0, 8);
    const q = clientSearch.toLowerCase();
    const qDigits = q.replace(/\D/g, '');
    return BOOKING_CLIENTS.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        (qDigits.length > 0 && c.phone.replace(/\D/g, '').includes(qDigits))
    ).slice(0, 8);
  }, [clientSearch]);

  // Services filter
  const filteredServices = useMemo(() => {
    const active = SERVICES.filter((sv) => sv.active);
    if (serviceCategory === 'All') return active;
    return active.filter((sv) => sv.category === serviceCategory);
  }, [serviceCategory]);

  // Total
  const totalPrice = selectedServices.reduce((sum, svc) => sum + svc.price, 0);
  const totalDuration = selectedServices.reduce((sum, svc) => sum + svc.duration, 0);

  // Calendar navigation
  const prevMonth = () => {
    if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1); }
    else setCalMonth(calMonth - 1);
  };
  const nextMonth = () => {
    if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1); }
    else setCalMonth(calMonth + 1);
  };

  const toggleService = (svc: Service) => {
    setSelectedServices((prev) => {
      const exists = prev.find((sv) => sv.id === svc.id);
      if (exists) {
        setServiceConfigs((cfgs) => {
          const next = { ...cfgs };
          delete next[svc.id];
          return next;
        });
        return prev.filter((sv) => sv.id !== svc.id);
      }
      return [...prev, svc];
    });
  };

  const handleServiceConfigSave = (cfg: ServiceConfig) => {
    setServiceConfigs((prev) => ({ ...prev, [cfg.serviceId]: cfg }));
    if (cfg.date) setSelectedDate(cfg.date);
    setConfiguringService(null);
  };

  const unconfiguredService = selectedServices.find((svc) => {
    const cfg = serviceConfigs[svc.id];
    return !cfg || cfg.techId === null || cfg.time === null;
  });
  const allServicesConfigured = selectedServices.length > 0 && !unconfiguredService;
  const canConfirm = !!selectedClient && selectedServices.length > 0 && !!selectedDate && allServicesConfigured;

  const fieldLabels: Record<string, string> = {
    client: 'Please select a client',
    date: 'Please choose a date',
    services: 'Please add at least one service',
    serviceConfig: unconfiguredService
      ? `Assign a technician & time for ${unconfiguredService.name}`
      : 'Assign technician & time for all services',
  };

  const highlightMissing = useCallback((field: string) => {
    // Haptic
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

    // Show banner
    setErrorMessage(fieldLabels[field] ?? 'Missing field');
    bannerTranslateY.value = 20;
    bannerOpacity.value = 0;
    bannerTranslateY.value = withSpring(0, { damping: 18, stiffness: 200 });
    bannerOpacity.value = withTiming(1, { duration: 200 });

    // serviceConfig highlights the services section
    const sectionKey = field === 'serviceConfig' ? 'services' : field;
    setErrorField(sectionKey);
    const y = sectionYs.current[sectionKey] ?? 0;
    scrollRef.current?.scrollTo({ y: Math.max(0, y - 60), animated: true });

    errorOpacity.value = withTiming(1, { duration: 200 });
    errorShake.value = withSequence(
      withTiming(-6, { duration: 50 }),
      withTiming(6, { duration: 50 }),
      withTiming(-4, { duration: 50 }),
      withTiming(4, { duration: 50 }),
      withTiming(0, { duration: 50 }),
    );

    // Fade out everything
    setTimeout(() => {
      bannerOpacity.value = withTiming(0, { duration: 300 });
      bannerTranslateY.value = withTiming(20, { duration: 300 });
      errorOpacity.value = withTiming(0, { duration: 400 });
      setTimeout(() => {
        setErrorField(null);
        setErrorMessage(null);
      }, 400);
    }, 2000);
  }, []);

  const handleConfirm = () => {
    if (!selectedClient) { highlightMissing('client'); return; }
    if (!selectedDate) { highlightMissing('date'); return; }
    if (selectedServices.length === 0) { highlightMissing('services'); return; }
    if (!allServicesConfigured) { highlightMissing('serviceConfig'); return; }

    const clientName = selectedClient.name;
    const clientVip = selectedClient.vip;
    let newApptId = '';

    if (selectedServices.length === 1) {
      // ─── Single-service appointment ───
      const svc = selectedServices[0];
      const cfg = serviceConfigs[svc.id];
      const techId = cfg?.techId ?? user?.id ?? 'sofia';
      const startMin = cfg?.time ?? DAY_START_MIN;

      const created = addAppointment({
        staffId: techId,
        date: selectedDate,
        startMin,
        endMin: startMin + svc.duration,
        client: clientName,
        service: svc.name,
        serviceKey: svc.id,
        status: 'confirmed',
        vip: clientVip,
        apptType: selectedApptType as any,
        notes: notes || null,
        price: svc.price,
      });
      newApptId = created.id;
    } else {
      // ─── Multi-service appointment ───
      const allTechIds = new Set<string>();
      let earliestStart = DAY_END_MIN;
      let latestEnd = DAY_START_MIN;

      const apptServices = selectedServices.map((svc) => {
        const cfg = serviceConfigs[svc.id];
        const techId = cfg?.techId ?? user?.id ?? 'sofia';
        const techData = CALENDAR_STAFF.find((t) => t.id === techId);
        const startMin = cfg?.time ?? DAY_START_MIN;
        const endMin = startMin + svc.duration;

        allTechIds.add(techId);
        if (startMin < earliestStart) earliestStart = startMin;
        if (endMin > latestEnd) latestEnd = endMin;

        return {
          name: svc.name,
          price: svc.price,
          techId,
          techName: techData ? `${techData.first} ${techData.last}` : 'Staff',
          startMin,
          endMin,
          mins: svc.duration,
        };
      });

      const primaryTechId = apptServices[0].techId;
      const compositeName = selectedServices.map((sv) => sv.name).join(' + ');

      const created = addAppointment({
        staffId: primaryTechId,
        staffIds: Array.from(allTechIds),
        date: selectedDate,
        startMin: earliestStart,
        endMin: latestEnd,
        client: clientName,
        service: compositeName,
        serviceKey: 'multi',
        status: 'confirmed',
        vip: clientVip,
        apptType: selectedApptType as any,
        notes: notes || null,
        price: totalPrice,
        services: apptServices,
      });
      newApptId = created.id;
    }

    // Show animated confirmation overlay
    setConfirmationData({
      client: clientName,
      services: selectedServices.map((sv) => sv.name).join(', '),
      date: formatDate(new Date(selectedDate + 'T00:00:00')),
    });
    setShowConfirmation(true);

    // Sequence: bg fades in → check pops → text slides up
    confirmBgOpacity.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.cubic) });
    confirmCheckScale.value = withDelay(200, withSpring(1, { damping: 12, stiffness: 180 }));
    confirmCheckOpacity.value = withDelay(200, withTiming(1, { duration: 200 }));
    confirmTextOpacity.value = withDelay(500, withTiming(1, { duration: 300 }));
    confirmTextTranslateY.value = withDelay(500, withTiming(0, { duration: 300, easing: Easing.out(Easing.cubic) }));

    // Navigate away after animation
    const _newApptId = newApptId;
    const _newApptDate = selectedDate;
    setTimeout(() => {
      emitNewAppt({ id: _newApptId, date: _newApptDate });
      router.replace('/(tabs)/appointments');
    }, 2000);
  };

  const apptTypes = APPT_TYPES.filter((a) => a.key !== 'misc' && a.key !== 'walk-in');

  // ─── Render ──────────────────────────────────────────

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: colors.cream }]} edges={['top']}>
      {/* Navigation Bar */}
      <View style={s.navBar}>
        <Pressable onPress={() => {
          router.replace('/(tabs)/appointments');
        }} style={s.backBtn}>
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
          ref={scrollRef}
          style={s.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ─── 01 Store (only if multi-store user) ── */}
          {!singleStore && (
            <View style={s.formSection}>
              <View style={s.sectionHeader}>
                <SectionNumber num="01" />
                <Text style={[s.sectionTitle, { color: colors.obsidian }]}>Store</Text>
                <Text style={[s.requiredBadge, { color: colors.goldDeep }]}>Required</Text>
              </View>

              <Pressable
                onPress={() => setShowStorePicker(!showStorePicker)}
                style={[
                  s.dropdownTrigger,
                  {
                    backgroundColor: colors.warmWhite,
                    borderColor: storeId ? colors.border : colors.goldDeep,
                    borderWidth: storeId ? 1 : 1.5,
                  },
                  shadows.card,
                ]}
              >
                {selectedStore ? (
                  <View style={{ flex: 1 }}>
                    <Text style={[s.storeName, { color: colors.obsidian }]}>
                      {selectedStore.name}
                    </Text>
                    <Text style={[s.storeAddress, { color: colors.textMuted }]}>
                      {selectedStore.address}
                    </Text>
                  </View>
                ) : (
                  <Text style={[s.placeholderText, { color: colors.textMuted }]}>
                    Select a store...
                  </Text>
                )}
                <Feather
                  name={showStorePicker ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color={colors.textMuted}
                />
              </Pressable>

              {showStorePicker && (
                <View
                  style={[
                    s.dropdown,
                    { backgroundColor: colors.warmWhite, borderColor: colors.border },
                    shadows.elevated,
                  ]}
                >
                  {userStores.map((store) => {
                    const active = storeId === store.id;
                    return (
                      <Pressable
                        key={store.id}
                        onPress={() => {
                          setStoreId(store.id);
                          setShowStorePicker(false);
                        }}
                        style={[
                          s.dropdownItem,
                          { borderBottomColor: colors.border },
                          active && { backgroundColor: colors.goldSoft },
                        ]}
                      >
                        <View style={{ flex: 1 }}>
                          <Text style={[s.dropdownItemName, { color: colors.obsidian }]}>
                            {store.name}
                          </Text>
                          <Text style={[s.dropdownItemSub, { color: colors.textMuted }]}>
                            {store.address}
                          </Text>
                        </View>
                        {active && <Feather name="check" size={16} color={colors.goldDeep} />}
                      </Pressable>
                    );
                  })}
                </View>
              )}
            </View>
          )}

          {/* ═══════════════════════════════════════════════════
              REST OF FORM — revealed when store is set
              ═══════════════════════════════════════════════════ */}
          {restMounted && (
            <Animated.View
              style={revealStyle}
              onLayout={(e) => {
                restSectionY.current = e.nativeEvent.layout.y;
              }}
            >
              {/* ─── Client ──────────────────── */}
              <Animated.View
                style={[s.formSection, errorField === 'client' && errorBorderStyle]}
                onLayout={(e) => { sectionYs.current.client = e.nativeEvent.layout.y + restSectionY.current; }}
              >
                <View style={s.sectionHeader}>
                  <SectionNumber num={singleStore ? '01' : '02'} />
                  <Text style={[s.sectionTitle, { color: colors.obsidian }]}>{t('bkClient')}</Text>
                </View>

                {selectedClient ? (
                  <View
                    style={[
                      s.selectedClientCard,
                      { backgroundColor: colors.warmWhite },
                      shadows.card,
                    ]}
                  >
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
                      <Feather
                        name="search"
                        size={16}
                        color={colors.textMuted}
                        style={{ marginRight: 8 }}
                      />
                      <TextInput
                        style={[s.searchInput, { color: colors.obsidian }]}
                        value={clientSearch}
                        onChangeText={(text) => {
                          setClientSearch(text);
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
                      <View
                        style={[
                          s.dropdown,
                          { backgroundColor: colors.warmWhite, borderColor: colors.border },
                          shadows.elevated,
                        ]}
                      >
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
              </Animated.View>

              {/* Divider */}
              <View style={s.formSection}>
                <View style={[s.divider, { backgroundColor: colors.border }]} />
              </View>

              {/* ─── Date ────────────────────────── */}
              <Animated.View
                style={[s.formSection, errorField === 'date' && errorBorderStyle]}
                onLayout={(e) => { sectionYs.current.date = e.nativeEvent.layout.y + restSectionY.current; }}
              >
                <View style={s.sectionHeader}>
                  <SectionNumber num={singleStore ? '02' : '03'} />
                  <Text style={[s.sectionTitle, { color: colors.obsidian }]}>Date</Text>
                </View>

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

                <CalendarMonth
                  year={calYear}
                  month={calMonth}
                  selectedDate={selectedDate}
                  onSelectDate={setSelectedDate}
                  todayKey={todayKey}
                />
              </Animated.View>

              {/* ─── Services ─────────────────────── */}
              <Animated.View
                style={[s.formSection, errorField === 'services' && errorBorderStyle]}
                onLayout={(e) => { sectionYs.current.services = e.nativeEvent.layout.y + restSectionY.current; }}
              >
                <View style={s.sectionHeader}>
                  <SectionNumber num={singleStore ? '03' : '04'} />
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
                    const cfg = serviceConfigs[svc.id];
                    const techData = cfg?.techId
                      ? CALENDAR_STAFF.find((ct) => ct.id === cfg.techId)
                      : null;

                    return (
                      <View key={svc.id}>
                        <Pressable
                          onPress={() => toggleService(svc)}
                          style={[
                            s.serviceCard,
                            {
                              backgroundColor: colors.warmWhite,
                              borderColor: isSelected ? colors.goldDeep : colors.border,
                              borderWidth: isSelected ? 1.5 : 1,
                              borderBottomLeftRadius: isSelected ? 0 : 12,
                              borderBottomRightRadius: isSelected ? 0 : 12,
                            },
                          ]}
                        >
                          <View style={s.serviceCardLeft}>
                            <Text style={[s.serviceCardName, { color: colors.obsidian }]}>
                              {svc.name}
                            </Text>
                            <Text style={[s.serviceCardMeta, { color: colors.textMuted }]}>
                              {svc.duration} {t('mins')} · {fmtCurrency(svc.price)}
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

                        {/* Config strip */}
                        {isSelected && (
                          <Pressable
                            onPress={() => setConfiguringService(svc)}
                            style={[
                              s.configStrip,
                              {
                                backgroundColor: colors.creamDark,
                                borderColor: colors.goldDeep,
                                borderWidth: 1.5,
                                borderTopWidth: 0,
                              },
                            ]}
                          >
                            {cfg?.techId || cfg?.time ? (
                              <View style={s.configStripContent}>
                                {techData && (
                                  <View style={s.configChip}>
                                    <Avatar
                                      initials={techData.initials}
                                      gold={techData.gold}
                                      size="compact"
                                    />
                                    <Text style={[s.configChipText, { color: colors.obsidian }]}>
                                      {techData.first}
                                    </Text>
                                  </View>
                                )}
                                {!cfg?.techId && (
                                  <View style={s.configChip}>
                                    <Feather name="users" size={12} color={colors.textMuted} />
                                    <Text style={[s.configChipText, { color: colors.textMuted }]}>
                                      Any
                                    </Text>
                                  </View>
                                )}
                                {cfg?.time != null && (
                                  <View style={s.configChip}>
                                    <Feather name="clock" size={12} color={colors.textMuted} />
                                    <Text style={[s.configChipText, { color: colors.obsidian }]}>
                                      {fmtTime(cfg.time)}
                                    </Text>
                                  </View>
                                )}
                              </View>
                            ) : (
                              <Text style={[s.configStripHint, { color: colors.textMuted }]}>
                                Tap to assign tech & time
                              </Text>
                            )}
                            <Feather name="chevron-right" size={16} color={colors.textMuted} />
                          </Pressable>
                        )}
                      </View>
                    );
                  })}
                </View>

                {/* Selected services summary */}
                {selectedServices.length > 0 && (
                  <View style={[s.summaryBar, { backgroundColor: colors.creamDark }]}>
                    <Text style={[s.summaryText, { color: colors.charcoal }]}>
                      {selectedServices.length} service{selectedServices.length > 1 ? 's' : ''} ·{' '}
                      {totalDuration} {t('mins')}
                    </Text>
                    <Text style={[s.summaryPrice, { color: colors.obsidian }]}>
                      {fmtCurrency(totalPrice)}
                    </Text>
                  </View>
                )}
              </Animated.View>

              {/* ─── Notes ────────────────────────── */}
              <View style={s.formSection}>
                <View style={s.sectionHeader}>
                  <SectionNumber num={singleStore ? '04' : '05'} />
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

              {/* ─── Type ─────────────────────────── */}
              <View style={s.formSection}>
                <View style={s.sectionHeader}>
                  <SectionNumber num={singleStore ? '05' : '06'} />
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
            </Animated.View>
          )}

          {/* Extra space when rest is hidden */}
          {!restMounted && <View style={s.bottomSpacer} />}
        </ScrollView>

        {/* Validation error banner — floats above bottom bar */}
        {showRest && errorMessage && (
          <Animated.View style={[s.errorBanner, { backgroundColor: MUTED_RED }, bannerStyle]}>
            <Feather name="alert-circle" size={14} color="#F5F0E8" />
            <Text style={s.errorBannerText}>{errorMessage}</Text>
          </Animated.View>
        )}

        {/* Bottom bar */}
        {showRest && (
          <View
            style={[s.bottomBar, { backgroundColor: colors.cream, borderTopColor: colors.border }]}
          >
            {totalPrice > 0 && (
              <Text style={[s.bottomTotal, { color: colors.textMuted }]}>
                Total: {fmtCurrency(totalPrice)} · {totalDuration} {t('mins')}
              </Text>
            )}
            <Pressable
              onPress={handleConfirm}
              style={[
                s.confirmBtn,
                { backgroundColor: canConfirm ? colors.goldDeep : colors.textFaint },
              ]}
            >
              <Text style={[s.confirmBtnText, { color: colors.warmWhite }]}>
                {t('bkConfirm')}
              </Text>
            </Pressable>
          </View>
        )}
      </KeyboardAvoidingView>

      {/* Service config sheet */}
      {configuringService && (
        <ServiceConfigSheet
          service={configuringService}
          config={
            serviceConfigs[configuringService.id] ?? {
              serviceId: configuringService.id,
              techId: null,
              time: null,
            }
          }
          storeId={storeId!}
          selectedDate={selectedDate}
          onSave={handleServiceConfigSave}
          onCancel={() => setConfiguringService(null)}
        />
      )}

      {/* Confirmation overlay */}
      {showConfirmation && confirmationData && (
        <Animated.View style={[s.confirmOverlay, confirmBgStyle]}>
          <View style={s.confirmContent}>
            <Animated.View style={[s.confirmCheckCircle, confirmCheckStyle]}>
              <Feather name="check" size={36} color="#F5F0E8" />
            </Animated.View>
            <Animated.View style={confirmTextStyle}>
              <Text style={s.confirmTitle}>Booking Confirmed</Text>
              <Text style={s.confirmClient}>{confirmationData.client}</Text>
              <Text style={s.confirmDetail}>{confirmationData.services}</Text>
              <Text style={s.confirmDetail}>{confirmationData.date}</Text>
            </Animated.View>
          </View>
        </Animated.View>
      )}
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
  requiredBadge: {
    fontSize: 11,
    fontFamily: 'Jost_500Medium',
  },

  // Store
  storeName: {
    fontSize: 15,
    fontFamily: 'Jost_500Medium',
  },
  storeAddress: {
    fontSize: 12,
    fontFamily: 'Jost_400Regular',
    marginTop: 1,
  },

  // Divider
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 4,
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
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
  },
  placeholderText: {
    fontSize: 14,
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
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
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

  // Config strip (under selected service)
  configStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  configStripContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  configStripHint: {
    fontSize: 12,
    fontFamily: 'Jost_400Regular',
    fontStyle: 'italic',
  },
  configChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  configChipText: {
    fontSize: 12,
    fontFamily: 'Jost_500Medium',
  },

  // Config sheet
  configServiceInfo: {
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    gap: 4,
  },
  configServiceName: {
    fontSize: 17,
    fontFamily: 'Jost_500Medium',
  },
  configServiceMeta: {
    fontSize: 13,
    fontFamily: 'Jost_400Regular',
  },

  // Tech dropdown (config sheet)
  techTriggerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  techDropdownName: {
    fontSize: 14,
    fontFamily: 'Jost_500Medium',
  },
  techSearchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
  },
  techSearchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Jost_400Regular',
    padding: 0,
  },
  techNoResults: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  techNoResultsText: {
    fontSize: 13,
    fontFamily: 'Jost_400Regular',
  },

  // Tech card (staff self-view)
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

  hintText: {
    fontSize: 13,
    fontFamily: 'Jost_400Regular',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 20,
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
    paddingTop: 8,
    paddingBottom: 28,
    gap: 6,
  },
  bottomTotal: {
    fontSize: 13,
    fontFamily: 'Jost_400Regular',
    textAlign: 'center',
  },
  confirmBtn: {
    height: 50,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtnText: {
    fontSize: 16,
    fontFamily: 'Jost_600SemiBold',
  },

  bottomSpacer: { height: 24 },

  // Validation error banner
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginHorizontal: 16,
    marginBottom: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  errorBannerText: {
    fontSize: 12,
    fontFamily: 'Jost_500Medium',
    color: '#F5F0E8',
    flex: 1,
  },

  // Confirmation overlay
  confirmOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#1A1A18',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  confirmContent: {
    alignItems: 'center',
    gap: 24,
  },
  confirmCheckCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#D6BC8A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmTitle: {
    fontSize: 22,
    fontFamily: 'Jost_600SemiBold',
    color: '#F5F0E8',
    textAlign: 'center',
    marginBottom: 8,
  },
  confirmClient: {
    fontSize: 17,
    fontFamily: 'Jost_500Medium',
    color: '#D6BC8A',
    textAlign: 'center',
  },
  confirmDetail: {
    fontSize: 14,
    fontFamily: 'Jost_400Regular',
    color: 'rgba(245, 240, 232, 0.6)',
    textAlign: 'center',
    marginTop: 2,
  },
});
