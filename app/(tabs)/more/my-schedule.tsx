import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../../src/contexts/ThemeContext';
import { useAuth } from '../../../src/contexts/AuthContext';
import { useTranslation } from '../../../src/contexts/I18nContext';
import { STAFF_MAP } from '../../../src/data/staff';
import type { DaySchedule, WeekSchedule } from '../../../src/types/models';

const DAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;
type DayKey = (typeof DAY_KEYS)[number];
const DAY_LABELS: Record<string, string> = {
  mon: 'Monday',
  tue: 'Tuesday',
  wed: 'Wednesday',
  thu: 'Thursday',
  fri: 'Friday',
  sat: 'Saturday',
  sun: 'Sunday',
};

const TIME_OPTIONS = [
  '07:00', '07:30', '08:00', '08:30', '09:00', '09:30',
  '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
  '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30',
  '19:00', '19:30', '20:00', '20:30', '21:00',
];

export default function MyScheduleScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();

  const staffRecord = user ? STAFF_MAP[user.id] : null;

  const initialSchedule = useMemo<WeekSchedule | null>(() => {
    if (!staffRecord) return null;
    return { ...staffRecord.schedule };
  }, [staffRecord]);

  const [schedule, setSchedule] = useState<WeekSchedule | null>(initialSchedule);
  const [editingDay, setEditingDay] = useState<DayKey | null>(null);

  const updateDay = (day: DayKey, patch: Partial<DaySchedule>) => {
    setSchedule((prev) => {
      if (!prev) return prev;
      return { ...prev, [day]: { ...prev[day], ...patch } };
    });
  };

  if (!user || !schedule) return null;

  const handleSave = () => {
    Alert.alert('Saved', 'Schedule changes saved successfully.');
    router.back();
  };

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: colors.cream }]} edges={['top']}>
      {/* Header */}
      <View style={s.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Feather name="arrow-left" size={24} color={colors.obsidian} />
        </Pressable>
        <Text style={[s.headerTitle, { color: colors.obsidian }]}>My Schedule</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[s.card, { backgroundColor: colors.warmWhite }]}>
          {DAY_KEYS.map((day, idx) => {
            const daySchedule = schedule[day];
            const isEditing = editingDay === day;
            return (
              <React.Fragment key={day}>
                {idx > 0 && <View style={[s.divider, { backgroundColor: colors.border }]} />}
                <Pressable
                  style={s.dayRow}
                  onPress={() => setEditingDay(isEditing ? null : day)}
                >
                  <Text style={[s.dayLabel, { color: colors.obsidian }]}>{DAY_LABELS[day]}</Text>
                  <View style={s.dayRight}>
                    {daySchedule.off ? (
                      <Text style={[s.offLabel, { color: colors.textFaint }]}>{t('hoursClosed')}</Text>
                    ) : (
                      <Text style={[s.timeLabel, { color: colors.charcoal }]}>
                        {daySchedule.start} - {daySchedule.end}
                      </Text>
                    )}
                    <Feather
                      name={isEditing ? 'chevron-up' : 'chevron-down'}
                      size={16}
                      color={colors.textFaint}
                    />
                  </View>
                </Pressable>

                {isEditing && (
                  <View style={[s.editPane, { backgroundColor: colors.cream }]}>
                    {/* Day off toggle */}
                    <View style={s.toggleRow}>
                      <Text style={[s.editLabel, { color: colors.textMuted }]}>Day off</Text>
                      <Switch
                        value={daySchedule.off}
                        onValueChange={(val) => updateDay(day, { off: val })}
                        trackColor={{ false: colors.border, true: colors.goldDeep }}
                        thumbColor={colors.warmWhite}
                      />
                    </View>

                    {!daySchedule.off && (
                      <View style={s.timesRow}>
                        {/* Start time */}
                        <View style={s.timeCol}>
                          <Text style={[s.editLabel, { color: colors.textMuted }]}>Start</Text>
                          <ScrollView
                            style={[s.timeList, { borderColor: colors.border }]}
                            showsVerticalScrollIndicator={false}
                            nestedScrollEnabled
                          >
                            {TIME_OPTIONS.map((time) => {
                              const active = daySchedule.start === time;
                              return (
                                <Pressable
                                  key={time}
                                  onPress={() => updateDay(day, { start: time })}
                                  style={[
                                    s.timeOption,
                                    active && { backgroundColor: colors.goldSoft },
                                  ]}
                                >
                                  <Text style={[
                                    s.timeOptionText,
                                    { color: active ? colors.goldDeep : colors.charcoal },
                                    active && { fontFamily: 'Jost_600SemiBold' },
                                  ]}>
                                    {time}
                                  </Text>
                                </Pressable>
                              );
                            })}
                          </ScrollView>
                        </View>

                        {/* End time */}
                        <View style={s.timeCol}>
                          <Text style={[s.editLabel, { color: colors.textMuted }]}>End</Text>
                          <ScrollView
                            style={[s.timeList, { borderColor: colors.border }]}
                            showsVerticalScrollIndicator={false}
                            nestedScrollEnabled
                          >
                            {TIME_OPTIONS.map((time) => {
                              const active = daySchedule.end === time;
                              return (
                                <Pressable
                                  key={time}
                                  onPress={() => updateDay(day, { end: time })}
                                  style={[
                                    s.timeOption,
                                    active && { backgroundColor: colors.goldSoft },
                                  ]}
                                >
                                  <Text style={[
                                    s.timeOptionText,
                                    { color: active ? colors.goldDeep : colors.charcoal },
                                    active && { fontFamily: 'Jost_600SemiBold' },
                                  ]}>
                                    {time}
                                  </Text>
                                </Pressable>
                              );
                            })}
                          </ScrollView>
                        </View>
                      </View>
                    )}
                  </View>
                )}
              </React.Fragment>
            );
          })}
        </View>
      </ScrollView>

      {/* Save button */}
      <View style={s.bottomBar}>
        <Pressable
          style={[s.saveBtn, { backgroundColor: colors.obsidian }]}
          onPress={handleSave}
        >
          <Text style={[s.saveBtnText, { color: colors.warmWhite }]}>{t('save')}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
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
  scrollContent: { padding: 16, paddingBottom: 32 },
  card: { borderRadius: 14, overflow: 'hidden' },
  divider: { height: StyleSheet.hairlineWidth, marginLeft: 16 },
  dayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  dayLabel: { fontSize: 14, fontFamily: 'Jost_500Medium' },
  dayRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  timeLabel: { fontSize: 14, fontFamily: 'Jost_400Regular' },
  offLabel: { fontSize: 14, fontFamily: 'Jost_400Regular', fontStyle: 'italic' },
  editPane: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  editLabel: {
    fontSize: 12,
    fontFamily: 'Jost_500Medium',
    marginBottom: 6,
  },
  timesRow: { flexDirection: 'row', gap: 12 },
  timeCol: { flex: 1 },
  timeList: {
    height: 150,
    borderRadius: 10,
    borderWidth: 1,
    overflow: 'hidden',
  },
  timeOption: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  timeOptionText: {
    fontSize: 14,
    fontFamily: 'Jost_400Regular',
    textAlign: 'center',
  },
  bottomBar: {
    paddingHorizontal: 16,
    paddingBottom: 34,
    paddingTop: 12,
  },
  saveBtn: {
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: { fontSize: 15, fontFamily: 'Jost_600SemiBold' },
});
