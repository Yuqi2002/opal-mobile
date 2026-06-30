import React from 'react';
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
import { useStaffPolicies, TurnQueueVisibility } from '../../../src/contexts/StaffPoliciesContext';
import { StorePicker } from '../../../src/components/StorePicker';

const TURN_OPTIONS: { key: TurnQueueVisibility; icon: keyof typeof Feather.glyphMap; labelKey: string; descKey: string }[] = [
  { key: 'full', icon: 'eye', labelKey: 'spTurnFull', descKey: 'spTurnFullDesc' },
  { key: 'limited', icon: 'eye-off', labelKey: 'spTurnLimited', descKey: 'spTurnLimitedDesc' },
  { key: 'own-only', icon: 'user', labelKey: 'spTurnOwnOnly', descKey: 'spTurnOwnOnlyDesc' },
];

export default function StaffPoliciesScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const {
    staffCanBook,
    setStaffCanBook,
    staffCanBookWithinHour,
    setStaffCanBookWithinHour,
    turnQueueVisibility,
    setTurnQueueVisibility,
  } = useStaffPolicies();

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
          {t('spTitle')}
        </Text>
        <View style={[styles.headerSide, styles.headerSideRight]}>
          <StorePicker />
        </View>
      </View>

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent} showsVerticalScrollIndicator={false}>
        {/* Booking section */}
        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>{t('spBookingSection')}</Text>
        <View style={[styles.card, { backgroundColor: colors.warmWhite }]}>
          {/* Staff can book */}
          <View style={styles.row}>
            <View style={[styles.iconCircle, { backgroundColor: colors.creamDark }]}>
              <Feather name="calendar" size={18} color={colors.gold} />
            </View>
            <View style={styles.rowText}>
              <Text style={[styles.rowLabel, { color: colors.obsidian }]}>{t('spStaffCanBook')}</Text>
              <Text style={[styles.rowDesc, { color: colors.textMuted }]}>{t('spStaffCanBookDesc')}</Text>
            </View>
            <Switch
              value={staffCanBook}
              onValueChange={setStaffCanBook}
              trackColor={{ false: colors.border, true: colors.gold }}
              thumbColor={colors.warmWhite}
            />
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* Block last-minute booking */}
          <View style={[styles.row, !staffCanBook && styles.rowDisabled]}>
            <View style={[styles.iconCircle, { backgroundColor: colors.creamDark }]}>
              <Feather name="clock" size={18} color={staffCanBook ? colors.gold : colors.textFaint} />
            </View>
            <View style={styles.rowText}>
              <Text style={[styles.rowLabel, { color: staffCanBook ? colors.obsidian : colors.textFaint }]}>{t('spBlockLastMinute')}</Text>
              <Text style={[styles.rowDesc, { color: staffCanBook ? colors.textMuted : colors.textFaint }]}>{t('spBlockLastMinuteDesc')}</Text>
            </View>
            <Switch
              value={!staffCanBookWithinHour}
              onValueChange={(v) => setStaffCanBookWithinHour(!v)}
              trackColor={{ false: colors.border, true: colors.gold }}
              thumbColor={colors.warmWhite}
              disabled={!staffCanBook}
            />
          </View>
        </View>

        {/* Turn queue section */}
        <Text style={[styles.sectionLabel, { color: colors.textMuted, marginTop: 24 }]}>{t('spTurnSection')}</Text>
        <View style={[styles.card, { backgroundColor: colors.warmWhite }]}>
          {TURN_OPTIONS.map((opt, idx) => (
            <React.Fragment key={opt.key}>
              {idx > 0 && <View style={[styles.divider, { backgroundColor: colors.border }]} />}
              <Pressable
                style={styles.row}
                onPress={() => setTurnQueueVisibility(opt.key)}
              >
                <View style={[styles.iconCircle, { backgroundColor: colors.creamDark }]}>
                  <Feather
                    name={opt.icon}
                    size={18}
                    color={turnQueueVisibility === opt.key ? colors.gold : colors.textMuted}
                  />
                </View>
                <View style={styles.rowText}>
                  <Text style={[styles.rowLabel, { color: colors.obsidian }]}>{t(opt.labelKey)}</Text>
                  <Text style={[styles.rowDesc, { color: colors.textMuted }]}>{t(opt.descKey)}</Text>
                </View>
                {turnQueueVisibility === opt.key && (
                  <Feather name="check-circle" size={20} color={colors.gold} />
                )}
              </Pressable>
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
  headerSide: { flex: 1 },
  headerSideRight: { alignItems: 'flex-end' },
  body: { flex: 1 },
  bodyContent: { padding: 16, paddingBottom: 40 },
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
    paddingVertical: 14,
    gap: 12,
  },
  rowDisabled: { opacity: 0.45 },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: { flex: 1, gap: 2 },
  rowLabel: { fontSize: 15, fontFamily: 'Jost_500Medium' },
  rowDesc: { fontSize: 12, fontFamily: 'Jost_400Regular', lineHeight: 17 },
  divider: { height: StyleSheet.hairlineWidth, marginLeft: 64 },
});
