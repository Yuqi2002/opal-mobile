import React from 'react';
import { Pressable, StyleSheet, type ViewStyle } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useTheme } from '../contexts/ThemeContext';
import { shadows, radii } from '../theme/tokens';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
}

export function Card({ children, onPress, style }: CardProps) {
  const { colors } = useTheme();
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPressIn={() => { if (onPress) scale.value = withSpring(0.98); }}
      onPressOut={() => { scale.value = withSpring(1); }}
      onPress={onPress}
      style={[styles.card, { backgroundColor: colors.warmWhite }, shadows.card, animStyle, style]}
    >
      {children}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radii.lg, padding: 16 },
});
