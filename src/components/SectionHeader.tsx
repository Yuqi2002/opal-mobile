import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface SectionHeaderProps {
  title: string;
  showFilament?: boolean;
}

export function SectionHeader({ title, showFilament = false }: SectionHeaderProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      {showFilament && <View style={[styles.filament, { backgroundColor: colors.gold }]} />}
      <Text style={[styles.label, { color: colors.textMuted }]}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, marginBottom: 8 },
  filament: { width: 20, height: 1.5, marginBottom: 6 },
  label: { fontSize: 10, fontWeight: '500', letterSpacing: 3, textTransform: 'uppercase', fontFamily: 'Jost_500Medium' },
});
