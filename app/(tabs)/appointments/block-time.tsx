import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../../src/contexts/ThemeContext';
import { useAuth } from '../../../src/contexts/AuthContext';
import { useTranslation } from '../../../src/contexts/I18nContext';
import { STAFF } from '../../../src/data/staff';
import { isOwner, isReceptionist } from '../../../src/utils/permissions';

const TIME_OPTIONS = [
  '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
  '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
  '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM',
  '5:00 PM', '5:30 PM', '6:00 PM', '6:30 PM',
  '7:00 PM', '7:30 PM', '8:00 PM',
];

export default function BlockTimeScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();

  const [selectedStaff, setSelectedStaff] = useState(user?.id ?? '');
  const [startTime, setStartTime] = useState('9:00 AM');
  const [endTime, setEndTime] = useState('10:00 AM');
  const [reason, setReason] = useState('');
  const [showStaffPicker, setShowStaffPicker] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const canPickStaff = user ? isOwner(user.role) || isReceptionist(user.role) : false;
  const techs = STAFF.filter((s) => s.role === 'Staff');

  const selectedStaffName = STAFF.find((s) => s.id === selectedStaff);

  const handleSave = () => {
    Alert.alert('Time Blocked', `Blocked ${startTime} – ${endTime} for ${selectedStaffName?.first ?? 'staff'}.`, [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.cream }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Feather name="x" size={22} color={colors.obsidian} />
        </Pressable>
        <Text style={[styles.title, { color: colors.obsidian }]}>Block Time</Text>
        <Pressable onPress={handleSave} hitSlop={8}>
          <Text style={[styles.saveBtn, { color: colors.goldDeep }]}>{t('save')}</Text>
        </Pressable>
      </View>

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
        {/* Staff Picker */}
        {canPickStaff && (
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.textMuted }]}>Technician</Text>
            <Pressable
              style={[styles.pickerBtn, { backgroundColor: colors.warmWhite, borderColor: colors.border }]}
              onPress={() => setShowStaffPicker(!showStaffPicker)}
            >
              <Text style={[styles.pickerText, { color: colors.obsidian }]}>
                {selectedStaffName ? `${selectedStaffName.first} ${selectedStaffName.last}` : 'Select'}
              </Text>
              <Feather name="chevron-down" size={18} color={colors.textMuted} />
            </Pressable>
            {showStaffPicker && (
              <View style={[styles.dropdown, { backgroundColor: colors.warmWhite, borderColor: colors.border }]}>
                {techs.map((s) => (
                  <Pressable
                    key={s.id}
                    style={[styles.dropdownItem, selectedStaff === s.id && { backgroundColor: colors.creamDark }]}
                    onPress={() => { setSelectedStaff(s.id); setShowStaffPicker(false); }}
                  >
                    <Text style={[styles.dropdownText, { color: colors.obsidian }]}>
                      {s.first} {s.last}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Date */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.textMuted }]}>Date</Text>
          <View style={[styles.pickerBtn, { backgroundColor: colors.warmWhite, borderColor: colors.border }]}>
            <Text style={[styles.pickerText, { color: colors.obsidian }]}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </Text>
            <Feather name="calendar" size={18} color={colors.textMuted} />
          </View>
        </View>

        {/* Start Time */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.textMuted }]}>Start Time</Text>
          <Pressable
            style={[styles.pickerBtn, { backgroundColor: colors.warmWhite, borderColor: colors.border }]}
            onPress={() => { setShowStartPicker(!showStartPicker); setShowEndPicker(false); }}
          >
            <Text style={[styles.pickerText, { color: colors.obsidian }]}>{startTime}</Text>
            <Feather name="clock" size={18} color={colors.textMuted} />
          </Pressable>
          {showStartPicker && (
            <ScrollView style={[styles.timeDropdown, { backgroundColor: colors.warmWhite, borderColor: colors.border }]} nestedScrollEnabled>
              {TIME_OPTIONS.map((t) => (
                <Pressable
                  key={t}
                  style={[styles.dropdownItem, startTime === t && { backgroundColor: colors.creamDark }]}
                  onPress={() => { setStartTime(t); setShowStartPicker(false); }}
                >
                  <Text style={[styles.dropdownText, { color: colors.obsidian }]}>{t}</Text>
                </Pressable>
              ))}
            </ScrollView>
          )}
        </View>

        {/* End Time */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.textMuted }]}>End Time</Text>
          <Pressable
            style={[styles.pickerBtn, { backgroundColor: colors.warmWhite, borderColor: colors.border }]}
            onPress={() => { setShowEndPicker(!showEndPicker); setShowStartPicker(false); }}
          >
            <Text style={[styles.pickerText, { color: colors.obsidian }]}>{endTime}</Text>
            <Feather name="clock" size={18} color={colors.textMuted} />
          </Pressable>
          {showEndPicker && (
            <ScrollView style={[styles.timeDropdown, { backgroundColor: colors.warmWhite, borderColor: colors.border }]} nestedScrollEnabled>
              {TIME_OPTIONS.map((t) => (
                <Pressable
                  key={t}
                  style={[styles.dropdownItem, endTime === t && { backgroundColor: colors.creamDark }]}
                  onPress={() => { setEndTime(t); setShowEndPicker(false); }}
                >
                  <Text style={[styles.dropdownText, { color: colors.obsidian }]}>{t}</Text>
                </Pressable>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Reason */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.textMuted }]}>Reason (optional)</Text>
          <TextInput
            style={[styles.textInput, { backgroundColor: colors.warmWhite, borderColor: colors.border, color: colors.obsidian }]}
            value={reason}
            onChangeText={setReason}
            placeholder="e.g. Lunch break, Personal appointment"
            placeholderTextColor={colors.textFaint}
            multiline
          />
        </View>
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
  bodyContent: { padding: 16, gap: 20 },
  field: { gap: 6 },
  label: { fontSize: 12, fontFamily: 'Jost_500Medium', letterSpacing: 1, textTransform: 'uppercase' },
  pickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 48,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  pickerText: { fontSize: 15, fontFamily: 'Jost_400Regular' },
  dropdown: { borderRadius: 12, borderWidth: 1, overflow: 'hidden', marginTop: 4 },
  timeDropdown: { borderRadius: 12, borderWidth: 1, overflow: 'hidden', marginTop: 4, maxHeight: 200 },
  dropdownItem: { paddingHorizontal: 14, paddingVertical: 12 },
  dropdownText: { fontSize: 15, fontFamily: 'Jost_400Regular' },
  textInput: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: 'Jost_400Regular',
    minHeight: 80,
    textAlignVertical: 'top',
  },
});
