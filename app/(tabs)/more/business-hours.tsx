import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../../src/contexts/ThemeContext';
import { useTranslation } from '../../../src/contexts/I18nContext';
import { useStore } from '../../../src/contexts/StoreContext';

const DAYS = [
  { key: 'mon', label: 'Monday' },
  { key: 'tue', label: 'Tuesday' },
  { key: 'wed', label: 'Wednesday' },
  { key: 'thu', label: 'Thursday' },
  { key: 'fri', label: 'Friday' },
  { key: 'sat', label: 'Saturday' },
  { key: 'sun', label: 'Sunday' },
];

interface DayHours {
  open: boolean;
  start: string;
  end: string;
}

const DEFAULT_HOURS: Record<string, DayHours> = {
  mon: { open: true, start: '9:00 AM', end: '7:00 PM' },
  tue: { open: true, start: '9:00 AM', end: '7:00 PM' },
  wed: { open: true, start: '9:00 AM', end: '7:00 PM' },
  thu: { open: true, start: '9:00 AM', end: '8:00 PM' },
  fri: { open: true, start: '9:00 AM', end: '8:00 PM' },
  sat: { open: true, start: '10:00 AM', end: '6:00 PM' },
  sun: { open: false, start: '', end: '' },
};

export default function BusinessHoursScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { selectedStore } = useStore();
  const router = useRouter();

  const [hours, setHours] = useState<Record<string, DayHours>>(DEFAULT_HOURS);

  const toggleDay = (key: string) => {
    setHours((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        open: !prev[key].open,
        start: !prev[key].open ? '9:00 AM' : '',
        end: !prev[key].open ? '7:00 PM' : '',
      },
    }));
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.cream }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Feather name="arrow-left" size={22} color={colors.obsidian} />
        </Pressable>
        <Text style={[styles.title, { color: colors.obsidian }]}>{t('moreBusinessHours')}</Text>
        <Pressable hitSlop={8}>
          <Text style={[styles.saveBtn, { color: colors.goldDeep }]}>{t('save')}</Text>
        </Pressable>
      </View>

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
        {selectedStore && (
          <Text style={[styles.storeName, { color: colors.textMuted }]}>
            {selectedStore.name}
          </Text>
        )}

        {DAYS.map((day) => {
          const h = hours[day.key];
          return (
            <View
              key={day.key}
              style={[styles.dayRow, { backgroundColor: colors.warmWhite }]}
            >
              <View style={styles.dayTop}>
                <Text style={[styles.dayLabel, { color: colors.obsidian }]}>{day.label}</Text>
                <Switch
                  value={h.open}
                  onValueChange={() => toggleDay(day.key)}
                  trackColor={{ false: colors.border, true: colors.gold }}
                  thumbColor={colors.warmWhite}
                />
              </View>
              {h.open ? (
                <View style={styles.timeRow}>
                  <View style={[styles.timePill, { backgroundColor: colors.creamDark }]}>
                    <Feather name="sunrise" size={14} color={colors.textMuted} />
                    <Text style={[styles.timeText, { color: colors.obsidian }]}>{h.start}</Text>
                  </View>
                  <Text style={[styles.timeDash, { color: colors.textMuted }]}>—</Text>
                  <View style={[styles.timePill, { backgroundColor: colors.creamDark }]}>
                    <Feather name="sunset" size={14} color={colors.textMuted} />
                    <Text style={[styles.timeText, { color: colors.obsidian }]}>{h.end}</Text>
                  </View>
                </View>
              ) : (
                <Text style={[styles.closedLabel, { color: colors.textFaint }]}>Closed</Text>
              )}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
  },
  title: { fontSize: 18, fontFamily: 'Jost_500Medium' },
  saveBtn: { fontSize: 15, fontFamily: 'Jost_600SemiBold' },
  body: { flex: 1 },
  bodyContent: { padding: 16, gap: 10 },
  storeName: { fontSize: 13, fontFamily: 'Jost_400Regular', marginBottom: 4 },
  dayRow: {
    borderRadius: 14,
    padding: 16,
  },
  dayTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayLabel: { fontSize: 16, fontFamily: 'Jost_500Medium' },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },
  timePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  timeText: { fontSize: 14, fontFamily: 'Jost_400Regular' },
  timeDash: { fontSize: 16 },
  closedLabel: { fontSize: 13, fontFamily: 'Jost_400Regular', marginTop: 6 },
});
