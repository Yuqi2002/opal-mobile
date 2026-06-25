import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../../src/contexts/ThemeContext';
import { useTranslation } from '../../../src/contexts/I18nContext';
import { useScheduleLayout } from '../../../src/hooks/useScheduleLayout';
import type { ScheduleLayout } from '../../../src/hooks/useScheduleLayout';

type ThemeOption = 'light' | 'dark';

const OPTIONS: { key: ThemeOption; icon: keyof typeof Feather.glyphMap; label: string; desc: string }[] = [
  { key: 'light', icon: 'sun', label: 'Light', desc: 'Warm cream surfaces with dark text' },
  { key: 'dark', icon: 'moon', label: 'Dark', desc: 'Dark surfaces with light text' },
];

const SCHEDULE_OPTIONS: { key: ScheduleLayout; icon: keyof typeof Feather.glyphMap; labelKey: string; descKey: string }[] = [
  { key: 'list', icon: 'list', labelKey: 'scheduleList', descKey: 'scheduleListDesc' },
  { key: 'calendar', icon: 'calendar', labelKey: 'scheduleCalendar', descKey: 'scheduleCalendarDesc' },
];

export default function AppearanceScreen() {
  const { colors, mode, setMode } = useTheme();
  const { t } = useTranslation();
  const { scheduleLayout, setScheduleLayout } = useScheduleLayout();
  const router = useRouter();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.cream }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Feather name="arrow-left" size={22} color={colors.obsidian} />
        </Pressable>
        <Text style={[styles.title, { color: colors.obsidian }]}>{t('moreAppearance')}</Text>
        <View style={{ width: 22 }} />
      </View>

      <View style={styles.body}>
        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>THEME</Text>
        <View style={[styles.card, { backgroundColor: colors.warmWhite }]}>
          {OPTIONS.map((opt, idx) => (
            <React.Fragment key={opt.key}>
              {idx > 0 && <View style={[styles.divider, { backgroundColor: colors.border }]} />}
              <Pressable
                style={styles.row}
                onPress={() => setMode(opt.key)}
              >
                <View style={[styles.iconCircle, { backgroundColor: colors.creamDark }]}>
                  <Feather name={opt.icon} size={18} color={mode === opt.key ? colors.gold : colors.textMuted} />
                </View>
                <View style={styles.rowText}>
                  <Text style={[styles.rowLabel, { color: colors.obsidian }]}>{opt.label}</Text>
                  <Text style={[styles.rowDesc, { color: colors.textMuted }]}>{opt.desc}</Text>
                </View>
                {mode === opt.key && (
                  <Feather name="check-circle" size={20} color={colors.gold} />
                )}
              </Pressable>
            </React.Fragment>
          ))}
        </View>

        <Text style={[styles.sectionLabel, { color: colors.textMuted, marginTop: 24 }]}>{t('scheduleView').toUpperCase()}</Text>
        <View style={[styles.card, { backgroundColor: colors.warmWhite }]}>
          {SCHEDULE_OPTIONS.map((opt, idx) => (
            <React.Fragment key={opt.key}>
              {idx > 0 && <View style={[styles.divider, { backgroundColor: colors.border }]} />}
              <Pressable
                style={styles.row}
                onPress={() => setScheduleLayout(opt.key)}
              >
                <View style={[styles.iconCircle, { backgroundColor: colors.creamDark }]}>
                  <Feather name={opt.icon} size={18} color={scheduleLayout === opt.key ? colors.gold : colors.textMuted} />
                </View>
                <View style={styles.rowText}>
                  <Text style={[styles.rowLabel, { color: colors.obsidian }]}>{t(opt.labelKey)}</Text>
                  <Text style={[styles.rowDesc, { color: colors.textMuted }]}>{t(opt.descKey)}</Text>
                </View>
                {scheduleLayout === opt.key && (
                  <Feather name="check-circle" size={20} color={colors.gold} />
                )}
              </Pressable>
            </React.Fragment>
          ))}
        </View>
      </View>
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
  body: { padding: 16 },
  sectionLabel: {
    fontSize: 10,
    fontFamily: 'Jost_500Medium',
    letterSpacing: 3,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  card: { borderRadius: 14, overflow: 'hidden' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
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
  rowLabel: { fontSize: 16, fontFamily: 'Jost_500Medium' },
  rowDesc: { fontSize: 12, fontFamily: 'Jost_400Regular' },
  divider: { height: StyleSheet.hairlineWidth, marginLeft: 64 },
});
