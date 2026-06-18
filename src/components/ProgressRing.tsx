import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '../contexts/ThemeContext';

interface ProgressRingProps {
  /** 0–100 */
  percent: number;
  size?: number;
  strokeWidth?: number;
  trackColor?: string;
  progressColor?: string;
  label?: string;
}

export function ProgressRing({
  percent,
  size = 48,
  strokeWidth = 4,
  trackColor,
  progressColor,
  label,
}: ProgressRingProps) {
  const { colors } = useTheme();
  const track = trackColor ?? colors.border;
  const progress = progressColor ?? colors.goldDeep;

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(100, Math.max(0, percent));
  const strokeDashoffset = circumference - (clamped / 100) * circumference;
  const center = size / 2;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        {/* Background track */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={track}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress arc */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={progress}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${circumference}`}
          strokeDashoffset={strokeDashoffset}
          transform={`rotate(-90 ${center} ${center})`}
        />
      </Svg>
      {label !== undefined && (
        <View style={styles.labelWrap}>
          <Text
            style={[
              styles.label,
              { color: colors.obsidian, fontSize: size * 0.26 },
            ]}
          >
            {label}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { position: 'relative', alignItems: 'center', justifyContent: 'center' },
  labelWrap: {
    ...(StyleSheet.absoluteFill as object),
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { fontFamily: 'Jost_600SemiBold' },
});
