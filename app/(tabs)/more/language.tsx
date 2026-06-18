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

const LANGUAGES = [
  { key: 'en' as const, label: 'English', native: 'English' },
  { key: 'vi' as const, label: 'Vietnamese', native: 'Tiếng Việt' },
];

export default function LanguageScreen() {
  const { colors } = useTheme();
  const { t, language, setLanguage } = useTranslation();
  const router = useRouter();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.cream }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Feather name="arrow-left" size={22} color={colors.obsidian} />
        </Pressable>
        <Text style={[styles.title, { color: colors.obsidian }]}>{t('moreLanguage')}</Text>
        <View style={{ width: 22 }} />
      </View>

      <View style={styles.body}>
        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>SELECT LANGUAGE</Text>
        <View style={[styles.card, { backgroundColor: colors.warmWhite }]}>
          {LANGUAGES.map((lang, idx) => (
            <React.Fragment key={lang.key}>
              {idx > 0 && <View style={[styles.divider, { backgroundColor: colors.border }]} />}
              <Pressable
                style={styles.row}
                onPress={() => setLanguage(lang.key)}
              >
                <View style={[styles.iconCircle, { backgroundColor: colors.creamDark }]}>
                  <Feather name="globe" size={18} color={language === lang.key ? colors.gold : colors.textMuted} />
                </View>
                <View style={styles.rowText}>
                  <Text style={[styles.rowLabel, { color: colors.obsidian }]}>{lang.label}</Text>
                  <Text style={[styles.rowDesc, { color: colors.textMuted }]}>{lang.native}</Text>
                </View>
                {language === lang.key && (
                  <Feather name="check-circle" size={20} color={colors.gold} />
                )}
              </Pressable>
            </React.Fragment>
          ))}
        </View>

        <Text style={[styles.hint, { color: colors.textFaint }]}>
          Changing language will update all text throughout the app.
        </Text>
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
  rowDesc: { fontSize: 13, fontFamily: 'Jost_400Regular' },
  divider: { height: StyleSheet.hairlineWidth, marginLeft: 64 },
  hint: { fontSize: 12, fontFamily: 'Jost_400Regular', marginTop: 16, paddingHorizontal: 4 },
});
