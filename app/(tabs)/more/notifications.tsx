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

interface NotifSetting {
  key: string;
  label: string;
  description: string;
  enabled: boolean;
}

export default function NotificationSettingsScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();

  const [settings, setSettings] = useState<NotifSetting[]>([
    { key: 'appt_reminders', label: 'Appointment Reminders', description: 'Get notified before upcoming appointments', enabled: true },
    { key: 'appt_changes', label: 'Appointment Changes', description: 'Cancellations, reschedules, and new bookings', enabled: true },
    { key: 'turn_updates', label: 'Turn Queue Updates', description: 'When it\'s your turn or queue changes', enabled: true },
    { key: 'daily_summary', label: 'Daily Summary', description: 'Morning overview of your schedule', enabled: true },
    { key: 'client_checkin', label: 'Client Check-ins', description: 'When clients arrive and check in', enabled: false },
    { key: 'marketing', label: 'Tips & Updates', description: 'Product updates and business tips', enabled: false },
  ]);

  const toggle = (key: string) => {
    setSettings((prev) =>
      prev.map((s) => (s.key === key ? { ...s, enabled: !s.enabled } : s))
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.cream }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Feather name="arrow-left" size={22} color={colors.obsidian} />
        </Pressable>
        <Text style={[styles.title, { color: colors.obsidian }]}>{t('moreNotifications')}</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
        {/* Push toggle */}
        <View style={[styles.card, { backgroundColor: colors.warmWhite }]}>
          <View style={styles.row}>
            <View style={[styles.iconCircle, { backgroundColor: colors.creamDark }]}>
              <Feather name="bell" size={18} color={colors.gold} />
            </View>
            <View style={styles.rowText}>
              <Text style={[styles.rowLabel, { color: colors.obsidian }]}>Push Notifications</Text>
              <Text style={[styles.rowDesc, { color: colors.textMuted }]}>Enable all push notifications</Text>
            </View>
            <Switch
              value={settings.some((s) => s.enabled)}
              onValueChange={(val) => {
                setSettings((prev) => prev.map((s) => ({ ...s, enabled: val })));
              }}
              trackColor={{ false: colors.border, true: colors.gold }}
              thumbColor={colors.warmWhite}
            />
          </View>
        </View>

        {/* Individual toggles */}
        <View style={[styles.card, { backgroundColor: colors.warmWhite }]}>
          {settings.map((setting, idx) => (
            <React.Fragment key={setting.key}>
              {idx > 0 && <View style={[styles.divider, { backgroundColor: colors.border }]} />}
              <View style={styles.row}>
                <View style={styles.rowText}>
                  <Text style={[styles.rowLabel, { color: colors.obsidian }]}>{setting.label}</Text>
                  <Text style={[styles.rowDesc, { color: colors.textMuted }]}>{setting.description}</Text>
                </View>
                <Switch
                  value={setting.enabled}
                  onValueChange={() => toggle(setting.key)}
                  trackColor={{ false: colors.border, true: colors.gold }}
                  thumbColor={colors.warmWhite}
                />
              </View>
            </React.Fragment>
          ))}
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
  body: { flex: 1 },
  bodyContent: { padding: 16, gap: 16 },
  card: { borderRadius: 14, overflow: 'hidden' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: { flex: 1, gap: 2 },
  rowLabel: { fontSize: 15, fontFamily: 'Jost_500Medium' },
  rowDesc: { fontSize: 12, fontFamily: 'Jost_400Regular' },
  divider: { height: StyleSheet.hairlineWidth, marginLeft: 16 },
});
