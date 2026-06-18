import React from 'react';
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
import { useTheme } from '../../../../src/contexts/ThemeContext';
import { useTranslation } from '../../../../src/contexts/I18nContext';
import { ROLES } from '../../../../src/data/services';

export default function RolesListScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.cream }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Feather name="arrow-left" size={22} color={colors.obsidian} />
        </Pressable>
        <Text style={[styles.title, { color: colors.obsidian }]}>{t('moreRoles')}</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
        {ROLES.map((role) => (
          <Pressable
            key={role.id}
            style={[styles.card, { backgroundColor: colors.warmWhite }]}
            onPress={() => router.push(`/(tabs)/more/roles/${role.id}` as any)}
          >
            <View style={[styles.colorDot, { backgroundColor: role.color }]} />
            <View style={styles.cardInfo}>
              <Text style={[styles.cardName, { color: colors.obsidian }]}>{role.name}</Text>
              <Text style={[styles.cardDesc, { color: colors.textMuted }]} numberOfLines={2}>
                {role.description}
              </Text>
            </View>
            <Feather name="chevron-right" size={18} color={colors.textFaint} />
          </Pressable>
        ))}
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
  bodyContent: { padding: 16, gap: 10 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    gap: 12,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  cardInfo: { flex: 1, gap: 3 },
  cardName: { fontSize: 16, fontFamily: 'Jost_500Medium' },
  cardDesc: { fontSize: 13, fontFamily: 'Jost_400Regular' },
});
