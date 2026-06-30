import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Switch,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../../src/contexts/ThemeContext';
import { useTranslation } from '../../../src/contexts/I18nContext';
import { useStore } from '../../../src/contexts/StoreContext';
import { SelectStorePrompt } from '../../../src/components/SelectStorePrompt';
import { StorePicker } from '../../../src/components/StorePicker';

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

interface Holiday {
  id: string;
  date: string; // YYYY-MM-DD
  name: string;
}

const DEFAULT_HOLIDAYS: Holiday[] = [
  { id: 'h1', date: '2026-01-01', name: "New Year's Day" },
  { id: 'h2', date: '2026-05-25', name: 'Memorial Day' },
  { id: 'h3', date: '2026-07-04', name: 'Independence Day' },
  { id: 'h4', date: '2026-09-07', name: 'Labor Day' },
  { id: 'h5', date: '2026-11-26', name: 'Thanksgiving' },
  { id: 'h6', date: '2026-12-25', name: 'Christmas Day' },
];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatHolidayDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  return `${MONTHS[m - 1]} ${d}, ${y}`;
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
  const { selectedStore, isAllStores } = useStore();
  const router = useRouter();

  const [hours, setHours] = useState<Record<string, DayHours>>(DEFAULT_HOURS);
  const [holidays, setHolidays] = useState<Holiday[]>(DEFAULT_HOLIDAYS);
  const [addingHoliday, setAddingHoliday] = useState(false);
  const [newHolName, setNewHolName] = useState('');
  const [newHolDate, setNewHolDate] = useState('');

  const addHoliday = () => {
    if (!newHolDate || !newHolName.trim()) return;
    setHolidays((prev) =>
      [...prev, { id: 'h_' + Date.now(), date: newHolDate, name: newHolName.trim() }].sort(
        (a, b) => a.date.localeCompare(b.date)
      )
    );
    setNewHolName('');
    setNewHolDate('');
    setAddingHoliday(false);
  };

  const removeHoliday = (id: string) => {
    setHolidays((prev) => prev.filter((h) => h.id !== id));
  };

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
        <View style={styles.headerSide}>
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <Feather name="arrow-left" size={22} color={colors.obsidian} />
          </Pressable>
        </View>
        <Text style={[styles.title, { color: colors.obsidian }]} numberOfLines={1}>
          {t('moreBusinessHours')}
        </Text>
        <View style={[styles.headerSide, styles.headerSideRight]}>
          <StorePicker allowAllStores={false} />
        </View>
      </View>

      {isAllStores ? (
        <SelectStorePrompt icon="clock" message={t('selectStoreBusinessHours')} />
      ) : (
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

        {/* Holidays & Closures */}
        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
          {t('hoursHolidaysTitle').toUpperCase()}
        </Text>

        <View style={[styles.holidaysCard, { backgroundColor: colors.warmWhite }]}>
          {holidays.length === 0 && !addingHoliday && (
            <View style={[styles.holRow, { borderBottomWidth: 0 }]}>
              <Text style={[styles.holEmpty, { color: colors.textMuted }]}>
                {t('hoursNoHolidays')}
              </Text>
            </View>
          )}

          {holidays.map((hol, i) => (
            <View
              key={hol.id}
              style={[
                styles.holRow,
                { borderBottomColor: colors.border },
                i === holidays.length - 1 && !addingHoliday && { borderBottomWidth: 0 },
              ]}
            >
              <View style={styles.holInfo}>
                <Text style={[styles.holDate, { color: colors.obsidian }]}>
                  {formatHolidayDate(hol.date)}
                </Text>
                <Text style={[styles.holName, { color: colors.obsidian }]}>{hol.name}</Text>
              </View>
              <Pressable onPress={() => removeHoliday(hol.id)} hitSlop={8}>
                <Feather name="trash-2" size={16} color={colors.textFaint} />
              </Pressable>
            </View>
          ))}

          {addingHoliday ? (
            <View style={[styles.holAddForm, { borderTopColor: colors.border }]}>
              <TextInput
                style={[
                  styles.holInput,
                  { backgroundColor: colors.creamDark, color: colors.obsidian, borderColor: colors.border },
                ]}
                placeholder="MM/DD/YYYY"
                placeholderTextColor={colors.textFaint}
                value={newHolDate}
                onChangeText={(text) => {
                  // Auto-format: insert slashes as user types
                  const digits = text.replace(/\D/g, '');
                  let formatted = digits;
                  if (digits.length > 2) formatted = digits.slice(0, 2) + '/' + digits.slice(2);
                  if (digits.length > 4) formatted = digits.slice(0, 2) + '/' + digits.slice(2, 4) + '/' + digits.slice(4, 8);
                  // Convert to YYYY-MM-DD for storage when complete
                  if (digits.length === 8) {
                    const mm = digits.slice(0, 2);
                    const dd = digits.slice(2, 4);
                    const yyyy = digits.slice(4, 8);
                    setNewHolDate(`${yyyy}-${mm}-${dd}`);
                  } else {
                    setNewHolDate(formatted);
                  }
                }}
                keyboardType="number-pad"
                maxLength={10}
              />
              <TextInput
                style={[
                  styles.holInput,
                  styles.holInputName,
                  { backgroundColor: colors.creamDark, color: colors.obsidian, borderColor: colors.border },
                ]}
                placeholder={t('hoursHolidayName')}
                placeholderTextColor={colors.textFaint}
                value={newHolName}
                onChangeText={setNewHolName}
                onSubmitEditing={addHoliday}
              />
              <View style={styles.holAddActions}>
                <Pressable onPress={addHoliday} hitSlop={8} style={{ opacity: newHolDate.length === 10 && newHolName.trim() ? 1 : 0.4 }}>
                  <Feather name="check" size={18} color={colors.goldDeep} />
                </Pressable>
                <Pressable
                  onPress={() => {
                    setAddingHoliday(false);
                    setNewHolDate('');
                    setNewHolName('');
                  }}
                  hitSlop={8}
                >
                  <Feather name="x" size={18} color={colors.textMuted} />
                </Pressable>
              </View>
            </View>
          ) : (
            <Pressable
              style={[styles.holAddBtn, { borderTopColor: colors.border }]}
              onPress={() => setAddingHoliday(true)}
            >
              <Feather name="plus" size={15} color={colors.goldDeep} />
              <Text style={[styles.holAddText, { color: colors.goldDeep }]}>
                {t('hoursAddHoliday').toUpperCase()}
              </Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
      )}
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
  headerSide: { flex: 1 },
  headerSideRight: { alignItems: 'flex-end' },
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

  // Holidays
  sectionLabel: {
    fontSize: 12,
    fontFamily: 'Jost_500Medium',
    letterSpacing: 1.2,
    marginTop: 14,
    marginBottom: 2,
  },
  holidaysCard: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  holRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
  },
  holInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  holDate: {
    fontSize: 14,
    fontFamily: 'Jost_400Regular',
    width: 100,
  },
  holName: {
    fontSize: 15,
    fontFamily: 'Jost_500Medium',
    flex: 1,
  },
  holEmpty: {
    fontSize: 13,
    fontFamily: 'Jost_400Regular',
    textAlign: 'center',
    flex: 1,
  },
  holAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderTopWidth: 0.5,
  },
  holAddText: {
    fontSize: 13,
    fontFamily: 'Jost_500Medium',
    letterSpacing: 0.8,
  },
  holAddForm: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
    borderTopWidth: 0.5,
  },
  holInput: {
    fontSize: 14,
    fontFamily: 'Jost_400Regular',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 0.5,
  },
  holInputName: {
    flex: 1,
  },
  holAddActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 16,
  },
});
