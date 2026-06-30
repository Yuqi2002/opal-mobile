import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useStore } from '../contexts/StoreContext';
import { useTranslation } from '../contexts/I18nContext';

interface SelectStorePromptProps {
  /** Feather icon shown above the prompt */
  icon?: string;
  /** Heading — defaults to the localized "Choose a location" */
  title?: string;
  /** Per-page explanation of why a store must be selected */
  message: string;
}

/**
 * Empty state for pages that can only be viewed for a single location
 * (Turns, Business Info, Business Hours) when the owner is in "All Stores".
 * Lists the user's stores as tappable rows; tapping one switches store
 * (firing the store-gate animation) and the page fills in.
 */
export function SelectStorePrompt({
  icon = 'map-pin',
  title,
  message,
}: SelectStorePromptProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { userStores, setSelectedStoreId } = useStore();

  return (
    <View style={styles.container}>
      <Feather name={icon as any} size={48} color={colors.textFaint} />
      <Text style={[styles.title, { color: colors.textMuted }]}>
        {title ?? t('selectStoreTitle')}
      </Text>
      <Text style={[styles.message, { color: colors.textFaint }]}>{message}</Text>

      <View style={[styles.card, { backgroundColor: colors.warmWhite }]}>
        {userStores.map((store, idx) => (
          <React.Fragment key={store.id}>
            {idx > 0 && (
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
            )}
            <Pressable
              style={styles.row}
              onPress={() => setSelectedStoreId(store.id)}
            >
              <View style={[styles.dot, { backgroundColor: store.accentColor }]} />
              <View style={styles.rowText}>
                <Text style={[styles.storeName, { color: colors.obsidian }]}>
                  {store.name}
                </Text>
                <Text
                  style={[styles.storeAddr, { color: colors.textMuted }]}
                  numberOfLines={1}
                >
                  {store.address}
                </Text>
              </View>
              <Feather name="chevron-right" size={18} color={colors.textFaint} />
            </Pressable>
          </React.Fragment>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 56,
    paddingHorizontal: 24,
    gap: 12,
  },
  title: { fontSize: 16, fontFamily: 'Jost_500Medium' },
  message: {
    fontSize: 13,
    fontFamily: 'Jost_400Regular',
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  card: {
    alignSelf: 'stretch',
    marginTop: 12,
    borderRadius: 14,
    overflow: 'hidden',
  },
  divider: { height: StyleSheet.hairlineWidth, marginLeft: 48 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    paddingHorizontal: 16,
    gap: 14,
  },
  dot: { width: 10, height: 10, borderRadius: 5 },
  rowText: { flex: 1, gap: 2 },
  storeName: { fontSize: 15, fontFamily: 'Jost_500Medium' },
  storeAddr: { fontSize: 12, fontFamily: 'Jost_400Regular' },
});
