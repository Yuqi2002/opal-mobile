import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../contexts/ThemeContext';
import { avatarSizes } from '../theme/tokens';

interface AvatarProps {
  initials: string;
  gold?: boolean;
  size?: keyof typeof avatarSizes;
  sizeNum?: number;
}

export function Avatar({ initials, gold = false, size = 'list', sizeNum }: AvatarProps) {
  const { colors } = useTheme();
  const s = sizeNum ?? avatarSizes[size];
  const fontSize = s * 0.38;

  if (gold) {
    return (
      <LinearGradient
        colors={[colors.goldDeep, colors.gold]}
        style={[styles.circle, { width: s, height: s, borderRadius: s / 2 }]}
      >
        <Text style={[styles.text, { fontSize, color: colors.warmWhite }]}>{initials}</Text>
      </LinearGradient>
    );
  }

  return (
    <View style={[styles.circle, { width: s, height: s, borderRadius: s / 2, backgroundColor: colors.charcoal }]}>
      <Text style={[styles.text, { fontSize, color: colors.warmWhite }]}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: { alignItems: 'center', justifyContent: 'center' },
  text: { fontFamily: 'Jost_500Medium', textTransform: 'uppercase' },
});
