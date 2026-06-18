import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { Sparkline } from './Sparkline';
import { ProgressRing } from './ProgressRing';
import { shadows, radii, spacing } from '../theme/tokens';

interface KPICardProps {
  /** Main value string, e.g. "$4,280" or "34" */
  value: string;
  /** Label beneath the value */
  subtitle: string;
  /** Percentage change, e.g. 12 for +12%. Omit for no badge. */
  change?: number;
  /** Suffix shown after change value, e.g. "%" or "$8" — defaults to "%" */
  changeSuffix?: string;
  /** Secondary info line, e.g. "6 remaining" */
  secondaryLabel?: string;
  /** Sparkline data (7 points). Pass to render a sparkline. */
  sparkline?: number[];
  /** Progress ring percentage (0–100). Pass to render a ring instead of sparkline. */
  progress?: number;
  /** Fixed width for horizontal scroll. Defaults to 156. */
  width?: number;
}

export function KPICard({
  value,
  subtitle,
  change,
  changeSuffix = '%',
  secondaryLabel,
  sparkline,
  progress,
  width = 156,
}: KPICardProps) {
  const { colors } = useTheme();

  const isPositive = change !== undefined && change >= 0;
  const changeText =
    change !== undefined
      ? `${isPositive ? '+' : ''}${change}${changeSuffix}`
      : null;

  return (
    <View
      style={[
        styles.card,
        shadows.card,
        { width, backgroundColor: colors.warmWhite },
      ]}
    >
      {/* Top row: value + visual */}
      <View style={styles.topRow}>
        <View style={styles.valueCol}>
          <Text
            style={[styles.value, { color: colors.obsidian }]}
            numberOfLines={1}
          >
            {value}
          </Text>
          {changeText && (
            <View
              style={[
                styles.changeBadge,
                {
                  backgroundColor: isPositive
                    ? colors.statusConfirmedBg
                    : colors.statusCancelledBg,
                },
              ]}
            >
              <Feather
                name={isPositive ? 'trending-up' : 'trending-down'}
                size={10}
                color={
                  isPositive
                    ? colors.statusConfirmedText
                    : colors.statusCancelledText
                }
              />
              <Text
                style={[
                  styles.changeText,
                  {
                    color: isPositive
                      ? colors.statusConfirmedText
                      : colors.statusCancelledText,
                  },
                ]}
              >
                {changeText}
              </Text>
            </View>
          )}
          {secondaryLabel && !changeText && (
            <Text style={[styles.secondary, { color: colors.textMuted }]}>
              {secondaryLabel}
            </Text>
          )}
        </View>

        {/* Visual indicator */}
        {sparkline && (
          <Sparkline data={sparkline} width={64} height={28} />
        )}
        {progress !== undefined && (
          <ProgressRing percent={progress} size={44} strokeWidth={3.5} label={`${progress}%`} />
        )}
      </View>

      {/* Subtitle */}
      <Text style={[styles.subtitle, { color: colors.textMuted }]}>
        {subtitle}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.lg,
    padding: spacing.base,
    gap: spacing.sm,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  valueCol: {
    flexShrink: 1,
    gap: 4,
  },
  value: {
    fontSize: 22,
    fontFamily: 'Jost_600SemiBold',
  },
  changeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  changeText: {
    fontSize: 11,
    fontFamily: 'Jost_500Medium',
  },
  secondary: {
    fontSize: 12,
    fontFamily: 'Jost_400Regular',
  },
  subtitle: {
    fontSize: 12,
    fontFamily: 'Jost_400Regular',
  },
});
