import React, {
  useState,
  useMemo,
  useRef,
  useCallback,
  useEffect,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  FlatList,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  interpolate,
  interpolateColor,
  Easing,
} from "react-native-reanimated";
import { useTheme } from "../../../src/contexts/ThemeContext";
import { useAuth } from "../../../src/contexts/AuthContext";
import { useTranslation } from "../../../src/contexts/I18nContext";
import {
  getAppointments,
  getStaffAppointments,
} from "../../../src/data/appointments";
import { subscribeNewAppt } from "../../../src/hooks/useNewApptHighlight";
import {
  getCalendarStaffForStore,
  CALENDAR_STAFF,
} from "../../../src/data/staff";
import { useStore } from "../../../src/contexts/StoreContext";
import { APPT_TYPES } from "../../../src/data/services";
import {
  fmtKey,
  fmtTime,
  formatDate,
  getDemoNow,
  DAY_START_MIN,
  DAY_END_MIN,
} from "../../../src/utils/time";
import { fmtCurrency } from "../../../src/utils/currency";
import { LinearGradient } from "expo-linear-gradient";
import {
  isOwner,
  isReceptionist,
  isStaff,
} from "../../../src/utils/permissions";
import { Avatar } from "../../../src/components/Avatar";
import { StatusBadge } from "../../../src/components/StatusBadge";
import { SearchBar } from "../../../src/components/SearchBar";
import { EmptyState } from "../../../src/components/EmptyState";
import { Card } from "../../../src/components/Card";
import { StorePicker } from "../../../src/components/StorePicker";
import { shadows, radii } from "../../../src/theme/tokens";
import type { Appointment } from "../../../src/types/models";

type TabMode = "upcoming" | "past";
type TimeGroup = "Morning" | "Afternoon" | "Evening";

const STAFF_MAP: Record<string, (typeof CALENDAR_STAFF)[number]> = {};
CALENDAR_STAFF.forEach((s) => {
  STAFF_MAP[s.id] = s;
});

const APPT_TYPE_MAP: Record<string, string> = {};
APPT_TYPES.forEach((a) => {
  APPT_TYPE_MAP[a.key] = a.label;
});

function getTimeGroup(startMin: number): TimeGroup {
  if (startMin < 720) return "Morning";
  if (startMin < 1020) return "Afternoon";
  return "Evening";
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

const DAY_ABBR = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

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
  const [viewMonth, setViewMonth] = useState(
    new Date(selected.getFullYear(), selected.getMonth(), 1),
  );
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
    setViewMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1),
    );
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
        <View style={{ flex: 1 }} />
        <Pressable
          onPress={() => goDay(-1)}
          style={s.calArrowBtn}
          hitSlop={8}
          disabled={prevDisabled}
        >
          <Feather
            name="chevron-left"
            size={20}
            color={prevDisabled ? colors.textFaint : colors.charcoal}
          />
        </Pressable>
        <Pressable
          onPress={() => {
            setViewMonth(
              new Date(selected.getFullYear(), selected.getMonth(), 1),
            );
            setOpen(!open);
          }}
          style={s.calDateBtn}
        >
          <Text style={[s.calDateText, { color: colors.obsidian }]}>
            {formatDate(selected)}
          </Text>
          <Feather
            name={open ? "chevron-up" : "chevron-down"}
            size={16}
            color={colors.textMuted}
          />
        </Pressable>
        <Pressable
          onPress={() => goDay(1)}
          style={s.calArrowBtn}
          hitSlop={8}
          disabled={nextDisabled}
        >
          <Feather
            name="chevron-right"
            size={20}
            color={nextDisabled ? colors.textFaint : colors.charcoal}
          />
        </Pressable>
        <View style={{ flex: 1 }} />
      </View>

      {/* Dropdown calendar grid — popover */}
      {open && (
        <>
          <Pressable
            style={{
              position: "fixed" as any,
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 15,
            }}
            onPress={() => setOpen(false)}
          />
          <View
            style={[
              s.calDropdown,
              { backgroundColor: colors.warmWhite, borderColor: colors.border },
            ]}
          >
            {/* Month navigation */}
            <View style={s.calMonthRow}>
              <Pressable onPress={() => goMonth(-1)} hitSlop={8}>
                <Feather
                  name="chevron-left"
                  size={18}
                  color={colors.charcoal}
                />
              </Pressable>
              <Text style={[s.calMonthLabel, { color: colors.obsidian }]}>
                {MONTH_NAMES[month]} {year}
              </Text>
              <Pressable onPress={() => goMonth(1)} hitSlop={8}>
                <Feather
                  name="chevron-right"
                  size={18}
                  color={colors.charcoal}
                />
              </Pressable>
            </View>

            {/* Day-of-week headers */}
            <View style={s.calWeekRow}>
              {DAY_ABBR.map((d) => (
                <Text
                  key={d}
                  style={[s.calWeekDay, { color: colors.textFaint }]}
                >
                  {d.charAt(0)}
                </Text>
              ))}
            </View>

            {/* Day grid */}
            <View style={s.calGrid}>
              {calendarCells.map((day, i) => {
                if (day === null)
                  return <View key={`e-${i}`} style={s.calCell} />;
                const cellKey = fmtKey(new Date(year, month, day));
                const isSelected = cellKey === selectedKey;
                const isToday = cellKey === todayKey;
                const isDisabled =
                  (disablePast && cellKey < todayKey) ||
                  (disableFuture && cellKey > todayKey);
                return (
                  <Pressable
                    key={cellKey}
                    onPress={() => !isDisabled && handleDayPress(day)}
                    disabled={isDisabled}
                    style={[
                      s.calCell,
                      isSelected && {
                        backgroundColor: colors.obsidian,
                        borderRadius: 8,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        s.calDay,
                        {
                          color: isDisabled
                            ? colors.textFaint
                            : isSelected
                              ? colors.warmWhite
                              : colors.obsidian,
                        },
                        isToday &&
                          !isSelected &&
                          !isDisabled && { color: colors.goldDeep },
                      ]}
                    >
                      {day}
                    </Text>
                    {isToday && (
                      <View
                        style={[
                          s.calTodayDot,
                          {
                            backgroundColor: isSelected
                              ? colors.gold
                              : colors.goldDeep,
                          },
                        ]}
                      />
                    )}
                  </Pressable>
                );
              })}
            </View>
          </View>
        </>
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
  const { selectedStoreId } = useStore();
  const [open, setOpen] = useState(false);
  const techs = getCalendarStaffForStore(selectedStoreId).filter(
    (st) => st.role === "Staff",
  );
  const activeTech = techs.find((tc) => tc.id === selected);

  return (
    <View style={s.techDropContainer}>
      <Pressable
        onPress={() => setOpen(!open)}
        style={[
          s.techDropBtn,
          { backgroundColor: colors.warmWhite, borderColor: colors.border },
        ]}
      >
        {activeTech ? (
          <Avatar
            initials={activeTech.initials}
            gold={activeTech.gold}
            size="compact"
          />
        ) : (
          <Feather name="users" size={14} color={colors.charcoal} />
        )}
        <Text
          style={[s.techDropLabel, { color: colors.obsidian }]}
          numberOfLines={1}
        >
          {activeTech ? activeTech.first : t("all")}
        </Text>
        <Feather
          name={open ? "chevron-up" : "chevron-down"}
          size={14}
          color={colors.textMuted}
        />
      </Pressable>

      {open && (
        <View
          style={[
            s.techDropList,
            { backgroundColor: colors.warmWhite, borderColor: colors.border },
          ]}
        >
          <Pressable
            onPress={() => {
              onSelect("all");
              setOpen(false);
            }}
            style={[
              s.techDropItem,
              selected === "all" && { backgroundColor: colors.goldSoft },
            ]}
          >
            <Feather name="users" size={14} color={colors.charcoal} />
            <Text style={[s.techDropItemText, { color: colors.obsidian }]}>
              {t("all")}
            </Text>
          </Pressable>
          {techs.map((tech) => (
            <Pressable
              key={tech.id}
              onPress={() => {
                onSelect(tech.id);
                setOpen(false);
              }}
              style={[
                s.techDropItem,
                selected === tech.id && { backgroundColor: colors.goldSoft },
              ]}
            >
              <Avatar
                initials={tech.initials}
                gold={tech.gold}
                size="compact"
              />
              <Text style={[s.techDropItemText, { color: colors.obsidian }]}>
                {tech.first}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

// ─── Glow Wrapper (single pulse for newly created appts) ───

function GlowCard({
  children,
  active,
}: {
  children: React.ReactNode;
  active: boolean;
}) {
  const glow = useSharedValue(0);

  useEffect(() => {
    if (active) {
      glow.value = withDelay(
        800,
        withSequence(
          withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) }),
          withTiming(0, { duration: 600, easing: Easing.in(Easing.cubic) }),
        ),
      );
    }
  }, [active]);

  const glowStyle = useAnimatedStyle(() => ({
    borderRadius: radii.lg,
    borderWidth: interpolate(glow.value, [0, 1], [0, 2]),
    borderColor: interpolateColor(
      glow.value,
      [0, 1],
      ["rgba(214,188,138,0)", "rgba(214,188,138,1)"],
    ),
    shadowColor: "#D6BC8A",
    shadowOpacity: interpolate(glow.value, [0, 1], [0, 0.7]),
    shadowRadius: interpolate(glow.value, [0, 1], [0, 16]),
    shadowOffset: { width: 0, height: 0 },
  }));

  if (!active) return <>{children}</>;

  return <Animated.View style={glowStyle}>{children}</Animated.View>;
}

// ─── Staff Calendar Timeline ──────────────────────────

const CAL_MIN_PX = 2.0; // pixels per minute — 120px per hour
const CAL_LEFT = 50; // time-label gutter width
const CAL_CARD_MIN_H = 44; // minimum card height (touch target)

/** Convert hex to rgba */
function withAlpha(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function StaffCalendarView({
  appointments,
  onPress,
}: {
  appointments: Appointment[];
  onPress: (id: string) => void;
}) {
  const { colors, mode } = useTheme();
  const scrollRef = useRef<ScrollView>(null);
  const demoNow = getDemoNow();
  const nowMin = demoNow.getHours() * 60 + demoNow.getMinutes();
  const totalHeight = (DAY_END_MIN - DAY_START_MIN) * CAL_MIN_PX;

  // Auto-scroll to current time on mount
  useEffect(() => {
    const offset = Math.max(0, (nowMin - DAY_START_MIN) * CAL_MIN_PX - 80);
    setTimeout(
      () => scrollRef.current?.scrollTo({ y: offset, animated: false }),
      50,
    );
  }, []);

  const [currentMin, setCurrentMin] = useState(nowMin);
  useEffect(() => {
    const id = setInterval(() => {
      const n = getDemoNow();
      setCurrentMin(n.getHours() * 60 + n.getMinutes());
    }, 60_000);
    return () => clearInterval(id);
  }, []);

  const cardText = mode === "dark" ? "#FFFFFF" : colors.obsidian;
  const cardGold = mode === "dark" ? "#F5DFA0" : colors.goldDeep;

  // Hour + half-hour markers
  const markers: { min: number; label: string; isHour: boolean }[] = [];
  for (let m = DAY_START_MIN; m <= DAY_END_MIN; m += 30) {
    const h = Math.floor(m / 60);
    const mm = m % 60;
    const isHour = mm === 0;
    const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    const suffix = h >= 12 ? "PM" : "AM";
    const label = isHour ? `${hour12} ${suffix}` : `${hour12}:30`;
    markers.push({ min: m, label, isHour });
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ height: totalHeight + 40, paddingBottom: 40 }}
      >
        {/* Time markers */}
        {markers.map(({ min, label, isHour }) => {
          const top = (min - DAY_START_MIN) * CAL_MIN_PX;
          return (
            <View key={min} style={[cs.markerRow, { top }]}>
              <Text
                style={[
                  cs.markerLabel,
                  {
                    color: isHour ? colors.textMuted : colors.textFaint,
                    fontFamily: isHour ? "Jost_500Medium" : "Jost_400Regular",
                    fontSize: isHour ? 11 : 10,
                  },
                ]}
              >
                {label}
              </Text>
              <View
                style={[
                  cs.markerLine,
                  {
                    backgroundColor: colors.border,
                    opacity: isHour ? 1 : 0.5,
                    height: isHour
                      ? StyleSheet.hairlineWidth * 2
                      : StyleSheet.hairlineWidth,
                  },
                ]}
              />
            </View>
          );
        })}

        {/* Now indicator */}
        {currentMin >= DAY_START_MIN && currentMin <= DAY_END_MIN && (
          <View
            style={[
              cs.nowRow,
              { top: (currentMin - DAY_START_MIN) * CAL_MIN_PX },
            ]}
          >
            <View style={[cs.nowDot, { backgroundColor: colors.sage }]} />
            <View style={[cs.nowLine, { backgroundColor: colors.sage }]} />
          </View>
        )}

        {/* Appointment cards */}
        {appointments.map((appt) => {
          const isPast =
            appt.endMin < currentMin ||
            appt.status === "ended" ||
            appt.status === "finished";
          const top =
            (Math.max(appt.startMin, DAY_START_MIN) - DAY_START_MIN) *
            CAL_MIN_PX;
          const calcH =
            (Math.min(appt.endMin, DAY_END_MIN) -
              Math.max(appt.startMin, DAY_START_MIN)) *
            CAL_MIN_PX;
          const height = Math.max(calcH, CAL_CARD_MIN_H);
          const isCompact = height < 60;
          const tech = STAFF_MAP[appt.staffId];

          return (
            <View
              key={appt.id}
              style={[
                cs.cardSlot,
                {
                  top,
                  minHeight: height,
                  left: CAL_LEFT + 4,
                  right: 8,
                  opacity: isPast ? 0.5 : 1,
                },
              ]}
            >
              <Card style={cs.card} onPress={() => onPress(appt.id)}>
                {isCompact ? (
                  /* Compact: two lines */
                  <>
                    <View style={cs.compactRow}>
                      <Text
                        style={[cs.clientText, { color: cardGold, flex: 1 }]}
                        numberOfLines={1}
                      >
                        {appt.client}
                      </Text>
                      <StatusBadge status={appt.status} />
                    </View>
                    <Text
                      style={[cs.serviceText, { color: cardText }]}
                      numberOfLines={1}
                    >
                      {appt.service}
                    </Text>
                  </>
                ) : (
                  /* Standard: time, client, service, tech */
                  <>
                    <View style={cs.headerRow}>
                      <Text style={[cs.timeText, { color: cardGold }]}>
                        {fmtTime(appt.startMin)} - {fmtTime(appt.endMin)}
                      </Text>
                      <StatusBadge status={appt.status} />
                    </View>
                    <Text
                      style={[cs.clientText, { color: cardGold }]}
                      numberOfLines={1}
                    >
                      {appt.client}
                    </Text>
                    <Text
                      style={[cs.serviceText, { color: cardText }]}
                      numberOfLines={1}
                    >
                      {appt.service}
                    </Text>
                    {tech && (
                      <View style={cs.techRow}>
                        <Avatar
                          initials={tech.initials}
                          gold={tech.gold}
                          size="compact"
                        />
                        <Text
                          style={[cs.techName, { color: cardText }]}
                          numberOfLines={1}
                        >
                          {tech.first}
                        </Text>
                      </View>
                    )}
                  </>
                )}
              </Card>
            </View>
          );
        })}
      </ScrollView>

      {/* Bottom fade */}
      <LinearGradient
        colors={[withAlpha(colors.cream, 0), colors.cream]}
        style={cs.fade}
        pointerEvents="none"
      />
    </View>
  );
}

const cs = StyleSheet.create({
  markerRow: {
    position: "absolute",
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
  },
  markerLabel: {
    width: CAL_LEFT - 4,
    textAlign: "right",
    paddingRight: 8,
  },
  markerLine: {
    flex: 1,
  },
  nowRow: {
    position: "absolute",
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    zIndex: 10,
  },
  nowDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: CAL_LEFT - 4,
  },
  nowLine: {
    flex: 1,
    height: 2,
  },
  cardSlot: {
    position: "absolute",
  },
  card: {
    flex: 1,
    padding: 10,
    gap: 2,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  compactRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  timeText: {
    fontSize: 12,
    fontFamily: "Jost_500Medium",
  },
  clientText: {
    fontSize: 14,
    fontFamily: "Jost_600SemiBold",
  },
  serviceText: {
    fontSize: 12,
    fontFamily: "Jost_400Regular",
  },
  techRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 2,
  },
  techName: {
    fontSize: 11,
    fontFamily: "Jost_400Regular",
  },
  fade: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
});

// ─── Appointment Card ──────────────────────────────────

function ApptCard({
  appt,
  onPress,
}: {
  appt: Appointment;
  onPress: () => void;
}) {
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
            <Text style={[s.apptClient, { color: colors.obsidian }]}>
              {appt.client}
            </Text>
            {appt.vip && <StatusBadge status="vip" />}
          </View>
          <Text style={[s.apptService, { color: colors.textMuted }]}>
            {appt.service}
          </Text>
          {tech && (
            <View style={s.apptTechRow}>
              <Avatar
                initials={tech.initials}
                gold={tech.gold}
                size="compact"
              />
              <Text style={[s.apptTechName, { color: colors.charcoal }]}>
                {tech.first} {tech.last}
              </Text>
            </View>
          )}
        </View>
        <View style={s.apptCardRight}>
          <StatusBadge status={appt.status} />
          <Feather
            name="chevron-right"
            size={18}
            color={colors.textFaint}
            style={{ marginTop: 8 }}
          />
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
  const { selectedStoreId } = useStore();

  const [tab, setTab] = useState<TabMode>("upcoming");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [search, setSearch] = useState("");
  const [techFilter, setTechFilter] = useState("all");
  const [highlightId, setHighlightId] = useState<string | null>(null);

  const scrollRef = useRef<ScrollView>(null);
  const newCardRef = useRef<View>(null);

  // Listen for newly created appointments from the booking flow
  useEffect(() => {
    return subscribeNewAppt(({ id, date }) => {
      setSelectedDate(new Date(date + "T00:00:00"));
      setHighlightId(id);
    });
  }, []);

  // Scroll to the highlighted card once it's laid out
  const scrollToNewCard = useCallback(() => {
    if (!highlightId) return;
    setTimeout(() => {
      if (!newCardRef.current || !scrollRef.current) return;
      if (Platform.OS === "web") {
        const node = newCardRef.current as unknown as HTMLElement;
        if (node && typeof node.scrollIntoView === "function") {
          node.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      } else {
        (newCardRef.current as any).measureLayout(
          scrollRef.current,
          (_: number, y: number) => {
            scrollRef.current?.scrollTo({
              y: Math.max(0, y - 80),
              animated: true,
            });
          },
          () => {},
        );
      }
    }, 100);
  }, [highlightId]);

  // Past/Completed tab state
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const [pastDate, setPastDate] = useState(yesterday);
  const [pastSearch, setPastSearch] = useState("");
  const [pastTechFilter, setPastTechFilter] = useState("all");

  const userRole = user?.role ?? "r04";
  const canFilterByTech = isOwner(userRole) || isReceptionist(userRole);
  const isStaffUser = isStaff(userRole);

  // Upcoming appointments
  const upcomingAppts = useMemo(() => {
    const dateKey = fmtKey(selectedDate);
    const todayKey = fmtKey(new Date());
    const demoNow = getDemoNow();
    const nowMin = demoNow.getHours() * 60 + demoNow.getMinutes();
    let appts: Appointment[];
    if (isStaffUser && user) {
      appts = getStaffAppointments(dateKey, user.id, selectedStoreId);
    } else if (techFilter !== "all") {
      appts = getStaffAppointments(dateKey, techFilter, selectedStoreId);
    } else {
      appts = getAppointments(dateKey, selectedStoreId);
    }

    // For today, only show appointments that haven't ended yet
    if (dateKey === todayKey) {
      appts = appts.filter(
        (a) => a.status !== "finished" && a.endMin >= nowMin,
      );
    }

    if (search) {
      const q = search.toLowerCase();
      appts = appts.filter(
        (a) =>
          a.client.toLowerCase().includes(q) ||
          a.service.toLowerCase().includes(q),
      );
    }

    return appts.sort((a, b) => a.startMin - b.startMin);
  }, [selectedDate, techFilter, search, isStaffUser, user, selectedStoreId]);

  const groupedUpcoming = useMemo(
    () => groupByTime(upcomingAppts),
    [upcomingAppts],
  );

  // Staff calendar view — all appointments for selected date (no time/search filter)
  const staffCalendarAppts = useMemo(() => {
    if (!isStaffUser || !user) return [];
    const dateKey = fmtKey(selectedDate);
    return getStaffAppointments(dateKey, user.id, selectedStoreId).sort(
      (a, b) => a.startMin - b.startMin,
    );
  }, [selectedDate, isStaffUser, user, selectedStoreId]);

  // Past/completed appointments for selected past date
  const pastAppts = useMemo(() => {
    const dateKey = fmtKey(pastDate);
    let appts: Appointment[];
    if (isStaffUser && user) {
      appts = getStaffAppointments(dateKey, user.id, selectedStoreId);
    } else if (pastTechFilter !== "all") {
      appts = getStaffAppointments(dateKey, pastTechFilter, selectedStoreId);
    } else {
      appts = getAppointments(dateKey, selectedStoreId);
    }

    // Mark all as finished
    appts = appts.map((a) => ({ ...a, status: "finished" as const }));

    if (pastSearch) {
      const q = pastSearch.toLowerCase();
      appts = appts.filter(
        (a) =>
          a.client.toLowerCase().includes(q) ||
          a.service.toLowerCase().includes(q),
      );
    }

    return appts.sort((a, b) => a.startMin - b.startMin);
  }, [pastDate, pastTechFilter, pastSearch, isStaffUser, user]);

  const groupedPast = useMemo(() => groupByTime(pastAppts), [pastAppts]);

  const navigateToDetail = useCallback(
    (apptId: string) => {
      router.push(`/(tabs)/appointments/${apptId}`);
    },
    [router],
  );

  const timeGroupLabels: Record<TimeGroup, string> = {
    Morning: t("apptMorning"),
    Afternoon: t("apptAfternoon"),
    Evening: t("apptEvening"),
  };

  const renderUpcoming = () => {
    const groups: TimeGroup[] = ["Morning", "Afternoon", "Evening"];
    const hasAny = upcomingAppts.length > 0;

    if (!hasAny) {
      return (
        <EmptyState
          icon="calendar"
          title={t("apptNoAppointments")}
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
                <View
                  style={[s.groupFilament, { backgroundColor: colors.gold }]}
                />
                <Text style={[s.groupLabel, { color: colors.textMuted }]}>
                  {timeGroupLabels[group]}
                </Text>
                <Text style={[s.groupCount, { color: colors.textFaint }]}>
                  {items.length}
                </Text>
              </View>
              {items.map((appt) => {
                const isNew = appt.id === highlightId;
                return (
                  <View
                    key={appt.id}
                    ref={isNew ? newCardRef : undefined}
                    onLayout={isNew ? scrollToNewCard : undefined}
                  >
                    <GlowCard active={isNew}>
                      <ApptCard
                        appt={appt}
                        onPress={() => navigateToDetail(appt.id)}
                      />
                    </GlowCard>
                  </View>
                );
              })}
            </View>
          );
        })}
      </View>
    );
  };

  const renderPast = () => {
    const groups: TimeGroup[] = ["Morning", "Afternoon", "Evening"];
    const hasAny = pastAppts.length > 0;

    if (!hasAny) {
      return (
        <EmptyState
          icon="clock"
          title={t("apptNoAppointments")}
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
                <View
                  style={[s.groupFilament, { backgroundColor: colors.gold }]}
                />
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
    <SafeAreaView
      style={[s.safe, { backgroundColor: colors.cream }]}
      edges={["top"]}
    >
      {/* Header */}
      <View style={s.header}>
        <Text style={[s.headerTitle, { color: colors.obsidian }]}>
          {t("navAppts")}
        </Text>
        <View style={s.headerActions}>
          <StorePicker />
          <Pressable
            onPress={() => router.push("/(tabs)/appointments/block-time")}
            style={[s.headerBtn, { backgroundColor: colors.creamDark }]}
          >
            <Feather name="clock" size={18} color={colors.charcoal} />
          </Pressable>
        </View>
      </View>

      {/* Segmented Control */}
      <View
        style={[s.segmentedContainer, { backgroundColor: colors.creamDark }]}
      >
        <Pressable
          onPress={() => setTab("upcoming")}
          style={[
            s.segment,
            tab === "upcoming" && [
              { backgroundColor: colors.obsidian },
              shadows.card,
            ],
          ]}
        >
          <Text
            style={[
              s.segmentLabel,
              {
                color: tab === "upcoming" ? colors.warmWhite : colors.charcoal,
              },
            ]}
          >
            {t("apptUpcoming")}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setTab("past")}
          style={[
            s.segment,
            tab === "past" && [
              { backgroundColor: colors.obsidian },
              shadows.card,
            ],
          ]}
        >
          <Text
            style={[
              s.segmentLabel,
              { color: tab === "past" ? colors.warmWhite : colors.charcoal },
            ]}
          >
            {t("apptPast")}
          </Text>
        </Pressable>
      </View>

      {/* Staff upcoming — calendar timeline (own scroll) */}
      {tab === "upcoming" && isStaffUser ? (
        <View style={{ flex: 1 }}>
          {/* Date picker */}
          <View style={s.dateAndTechRow}>
            <View style={{ flex: 1 }}>
              <CalendarDatePicker
                selected={selectedDate}
                onSelect={(d) => setSelectedDate(d)}
              />
            </View>
          </View>

          {/* Calendar timeline */}
          {staffCalendarAppts.length > 0 ? (
            <StaffCalendarView
              appointments={staffCalendarAppts}
              onPress={navigateToDetail}
            />
          ) : (
            <EmptyState
              icon="calendar"
              title={t("apptNoAppointments")}
              subtitle="No appointments scheduled for this date"
            />
          )}
        </View>
      ) : (
        <ScrollView
          ref={scrollRef}
          style={s.scroll}
          showsVerticalScrollIndicator={false}
        >
          {tab === "upcoming" ? (
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
                  <TechDropdown
                    selected={techFilter}
                    onSelect={setTechFilter}
                  />
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
                  <TechDropdown
                    selected={pastTechFilter}
                    onSelect={setPastTechFilter}
                  />
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
      )}

      {/* FAB */}
      <Pressable
        onPress={() => router.push("/(tabs)/appointments/book")}
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: "Jost_300Light",
    letterSpacing: -0.5,
  },
  headerActions: { flexDirection: "row", gap: 8 },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },

  // Segmented Control
  segmentedContainer: {
    flexDirection: "row",
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 3,
    marginBottom: 12,
  },
  segment: {
    flex: 1,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentLabel: {
    fontSize: 14,
    fontFamily: "Jost_500Medium",
  },

  scroll: { flex: 1 },

  // Calendar Date Picker
  calPickerContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    zIndex: 10,
  },
  calPickerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  calArrowBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  calDateBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  calDateText: {
    fontSize: 16,
    fontFamily: "Jost_500Medium",
  },
  calDropdown: {
    position: "absolute",
    top: "100%",
    alignSelf: "center",
    width: 400,
    height: 300,
    marginTop: 4,
    borderRadius: 14,
    borderWidth: 1,
    padding: 10,
    zIndex: 20,
    ...shadows.card,
  },
  calMonthRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  calMonthLabel: {
    fontSize: 14,
    fontFamily: "Jost_500Medium",
  },
  calWeekRow: {
    flexDirection: "row",
    marginBottom: 2,
  },
  calWeekDay: {
    flex: 1,
    textAlign: "center",
    fontSize: 10,
    fontFamily: "Jost_500Medium",
  },
  calGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  calCell: {
    width: "14.28%" as any,
    height: 46.7,
    alignItems: "center",
    justifyContent: "center",
  },
  calDay: {
    fontSize: 12,
    fontFamily: "Jost_400Regular",
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
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  techChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    height: 32,
    borderRadius: 16,
  },
  techChipLabel: {
    fontSize: 13,
    fontFamily: "Jost_500Medium",
  },

  // Date + Tech row
  dateAndTechRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingRight: 16,
    zIndex: 100,
  },

  // Tech dropdown
  techDropContainer: {
    paddingTop: 2,
    zIndex: 100,
  },
  techDropBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
  },
  techDropLabel: {
    fontSize: 13,
    fontFamily: "Jost_500Medium",
    maxWidth: 70,
  },
  techDropList: {
    position: "absolute",
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
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  techDropItemText: {
    fontSize: 14,
    fontFamily: "Jost_400Regular",
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
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  groupFilament: {
    width: 16,
    height: 1.5,
  },
  groupLabel: {
    fontSize: 10,
    fontFamily: "Jost_500Medium",
    letterSpacing: 3,
    textTransform: "uppercase",
  },
  groupCount: {
    fontSize: 11,
    fontFamily: "Jost_400Regular",
  },

  // Appointment Card
  apptCard: {
    padding: 14,
  },
  apptCardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  apptCardLeft: {
    flex: 1,
    gap: 4,
  },
  apptCardRight: {
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  apptTime: {
    fontSize: 13,
    fontFamily: "Jost_500Medium",
  },
  apptClientRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  apptClient: {
    fontSize: 15,
    fontFamily: "Jost_500Medium",
  },
  apptService: {
    fontSize: 13,
    fontFamily: "Jost_400Regular",
  },
  apptTechRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  apptTechName: {
    fontSize: 12,
    fontFamily: "Jost_400Regular",
  },

  bottomSpacer: { height: 96 },
});
