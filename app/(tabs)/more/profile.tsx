import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../../src/contexts/ThemeContext';
import { useAuth } from '../../../src/contexts/AuthContext';
import { useTranslation } from '../../../src/contexts/I18nContext';
import { Avatar } from '../../../src/components/Avatar';
import { StatusBadge } from '../../../src/components/StatusBadge';
import { STAFF_MAP } from '../../../src/data/staff';

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

export default function ProfileScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();

  const staffRecord = user ? STAFF_MAP[user.id] : null;

  const [firstName, setFirstName] = useState(user?.first ?? '');
  const [lastName, setLastName] = useState(user?.last ?? '');
  const [phone, setPhone] = useState(staffRecord?.phone ?? '');
  const [biometric, setBiometric] = useState(user?.biometricEnabled ?? false);

  const schedule = useMemo(() => {
    if (!staffRecord) return null;
    return staffRecord.schedule;
  }, [staffRecord]);

  if (!user) return null;

  const handleSave = () => {
    Alert.alert('Saved', 'Profile changes saved successfully.');
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.cream }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Feather name="arrow-left" size={24} color={colors.obsidian} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.obsidian }]}>{t('profileTitle')}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar + Badge */}
        <View style={styles.avatarSection}>
          <Avatar initials={user.initials} gold={user.gold} sizeNum={80} />
          <StatusBadge status={user.role === 'r01' || user.role === 'r02' ? 'vip' : 'active'} label={user.roleName} />
        </View>

        {/* Form Fields */}
        <View style={styles.formSection}>
          <View style={styles.fieldRow}>
            <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>{t('profileFirstName')}</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.creamDark, color: colors.obsidian }]}
              value={firstName}
              onChangeText={setFirstName}
              placeholderTextColor={colors.textFaint}
            />
          </View>

          <View style={styles.fieldRow}>
            <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>{t('profileLastName')}</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.creamDark, color: colors.obsidian }]}
              value={lastName}
              onChangeText={setLastName}
              placeholderTextColor={colors.textFaint}
            />
          </View>

          <View style={styles.fieldRow}>
            <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>{t('profileEmail')}</Text>
            <View style={[styles.readOnlyField, { backgroundColor: colors.creamDark }]}>
              <Text style={[styles.readOnlyText, { color: colors.textMuted }]}>{user.email}</Text>
              <Feather name="lock" size={14} color={colors.textFaint} />
            </View>
          </View>

          <View style={styles.fieldRow}>
            <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>{t('profilePhone')}</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.creamDark, color: colors.obsidian }]}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholderTextColor={colors.textFaint}
            />
          </View>

          <View style={styles.fieldRow}>
            <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>{t('profileRole')}</Text>
            <View style={[styles.readOnlyField, { backgroundColor: colors.creamDark }]}>
              <Text style={[styles.readOnlyText, { color: colors.textMuted }]}>{user.roleName}</Text>
            </View>
          </View>
        </View>

        {/* Biometric Toggle */}
        <View style={[styles.toggleCard, { backgroundColor: colors.warmWhite }]}>
          <View style={styles.toggleInfo}>
            <Feather name="smartphone" size={20} color={colors.textMuted} />
            <Text style={[styles.toggleLabel, { color: colors.obsidian }]}>{t('profileBiometric')}</Text>
          </View>
          <Switch
            value={biometric}
            onValueChange={setBiometric}
            trackColor={{ false: colors.border, true: colors.goldDeep }}
            thumbColor={colors.warmWhite}
          />
        </View>

        {/* Schedule */}
        {schedule && (
          <View style={styles.scheduleSection}>
            <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>{t('profileSchedule')}</Text>
            <View style={[styles.scheduleCard, { backgroundColor: colors.warmWhite }]}>
              {DAY_KEYS.map((day, idx) => {
                const daySchedule = schedule[day];
                return (
                  <React.Fragment key={day}>
                    {idx > 0 && <View style={[styles.divider, { backgroundColor: colors.border }]} />}
                    <View style={styles.scheduleRow}>
                      <Text style={[styles.dayLabel, { color: colors.obsidian }]}>{DAY_LABELS[day]}</Text>
                      {daySchedule.off ? (
                        <Text style={[styles.offLabel, { color: colors.textFaint }]}>{t('hoursClosed')}</Text>
                      ) : (
                        <Text style={[styles.timeLabel, { color: colors.charcoal }]}>
                          {daySchedule.start} - {daySchedule.end}
                        </Text>
                      )}
                    </View>
                  </React.Fragment>
                );
              })}
            </View>
          </View>
        )}

        {/* Save Button */}
        <Pressable
          style={[styles.saveButton, { backgroundColor: colors.obsidian }]}
          onPress={handleSave}
        >
          <Text style={[styles.saveText, { color: colors.warmWhite }]}>{t('save')}</Text>
        </Pressable>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

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
  avatarSection: { alignItems: 'center', gap: 10, marginTop: 8, marginBottom: 24 },
  formSection: { paddingHorizontal: 16, gap: 16 },
  fieldRow: { gap: 6 },
  fieldLabel: { fontSize: 12, fontFamily: 'Jost_500Medium', letterSpacing: 0.5 },
  input: {
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 15,
    fontFamily: 'Jost_400Regular',
  },
  readOnlyField: {
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  readOnlyText: { fontSize: 15, fontFamily: 'Jost_400Regular' },
  toggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginTop: 24,
    padding: 16,
    borderRadius: 14,
  },
  toggleInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  toggleLabel: { fontSize: 15, fontFamily: 'Jost_500Medium' },
  scheduleSection: { marginTop: 24, paddingHorizontal: 16 },
  sectionLabel: {
    fontSize: 10,
    fontFamily: 'Jost_500Medium',
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  scheduleCard: { borderRadius: 14, overflow: 'hidden' },
  scheduleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  divider: { height: StyleSheet.hairlineWidth, marginLeft: 16 },
  dayLabel: { fontSize: 14, fontFamily: 'Jost_500Medium' },
  timeLabel: { fontSize: 14, fontFamily: 'Jost_400Regular' },
  offLabel: { fontSize: 14, fontFamily: 'Jost_400Regular', fontStyle: 'italic' },
  saveButton: {
    marginHorizontal: 16,
    marginTop: 32,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveText: { fontSize: 15, fontFamily: 'Jost_600SemiBold' },
  bottomSpacer: { height: 24 },
});
