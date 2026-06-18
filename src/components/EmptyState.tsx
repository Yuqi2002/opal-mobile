import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

interface EmptyStateProps {
  icon?: string;
  title: string;
  subtitle?: string;
}

export function EmptyState({ icon = 'inbox', title, subtitle }: EmptyStateProps) {
  const { colors } = useTheme();
  return (
    <View style={styles.container}>
      <Feather name={icon as any} size={48} color={colors.textFaint} />
      <Text style={[styles.title, { color: colors.textMuted }]}>{title}</Text>
      {subtitle && <Text style={[styles.subtitle, { color: colors.textFaint }]}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', paddingVertical: 48, gap: 12 },
  title: { fontSize: 16, fontFamily: 'Jost_500Medium' },
  subtitle: { fontSize: 13, fontFamily: 'Jost_400Regular', textAlign: 'center', paddingHorizontal: 32 },
});
