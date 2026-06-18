import React from 'react';
import { ScrollView, Pressable, Text, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface FilterChipsProps {
  options: string[];
  selected: string;
  onSelect: (option: string) => void;
}

export function FilterChips({ options, selected, onSelect }: FilterChipsProps) {
  const { colors } = useTheme();

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {options.map((opt) => {
        const active = opt === selected;
        return (
          <Pressable
            key={opt}
            onPress={() => onSelect(opt)}
            style={[
              styles.chip,
              active
                ? { backgroundColor: colors.obsidian }
                : { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.label, { color: active ? colors.warmWhite : colors.charcoal }]}>{opt}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8, paddingHorizontal: 16 },
  chip: { paddingHorizontal: 14, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  label: { fontSize: 13, fontFamily: 'Jost_500Medium' },
});
