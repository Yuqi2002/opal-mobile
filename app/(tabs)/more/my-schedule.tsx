import React, { useMemo } from 'react';
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
import { useAuth } from '../../../src/contexts/AuthContext';
import { useTranslation } from '../../../src/contexts/I18nContext';
import { STAFF_MAP } from '../../../src/data/staff';
import type { WeekSchedule } from '../../../src/types/models';

const DAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;
const DAY_LABELS: Record<string, string> = {
  mon: 'Monday',
  tue: 'Tuesday',
  wed: 'Wednesday',
  thu: 'Thursday',
  fri: 'Friday',
  sat: 'Saturday',
  sun: 'Sunday',
};

export default function MyScheduleScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();

  const staffRecord = user ? STAFF_MAP[user.id] : null;

  const schedule = useMemo<WeekSchedule | null>(() => {
    if (!staffRecord) return null;
    return { ...staffRecord.schedule };
  }, [staffRecord]);

  if (!user || !schedule) return null;

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
            return (
              <React.Fragment key={day}>
                {idx > 0 && <View style={[s.divider, { backgroundColor: colors.border }]} />}
                <View style={s.dayRow}>
                  <Text style={[s.dayLabel, { color: colors.obsidian }]}>{DAY_LABELS[day]}</Text>
                  <View style={s.dayRight}>
                    {daySchedule.off ? (
                      <Text style={[s.offLabel, { color: colors.textFaint }]}>{t('hoursClosed')}</Text>
                    ) : (
                      <Text style={[s.timeLabel, { color: colors.charcoal }]}>
                        {daySchedule.start} – {daySchedule.end}
                      </Text>
                    )}
                  </View>
                </View>
              </React.Fragment>
            );
          })}
        </View>

        <Text style={[s.readOnlyNote, { color: colors.textFaint }]}>
          Contact your manager to update your schedule.
        </Text>
      </ScrollView>
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
  readOnlyNote: {
    fontSize: 12,
    fontFamily: 'Jost_400Regular',
    textAlign: 'center',
    marginTop: 16,
  },
});
