import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface StatusBadgeProps {
  status: string;
  label?: string;
}

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const { colors } = useTheme();

  const statusStyles: Record<string, { bg: string; text: string; label: string }> = {
    confirmed: { bg: colors.statusConfirmedBg, text: colors.statusConfirmedText, label: 'Confirmed' },
    pending: { bg: colors.statusPendingBg, text: colors.statusPendingText, label: 'Pending' },
    'checked-in': { bg: colors.statusCheckedInBg, text: colors.statusCheckedInText, label: 'Checked In' },
    'in-progress': { bg: colors.statusInProgressBg, text: colors.statusInProgressText, label: 'In Progress' },
    started: { bg: colors.statusInProgressBg, text: colors.statusInProgressText, label: 'In Progress' },
    completed: { bg: colors.statusCompletedBg, text: colors.statusCompletedText, label: 'Completed' },
    ended: { bg: colors.statusCompletedBg, text: colors.statusCompletedText, label: 'Completed' },
    finished: { bg: colors.statusCompletedBg, text: colors.statusCompletedText, label: 'Completed' },
    cancelled: { bg: colors.statusCancelledBg, text: colors.statusCancelledText, label: 'Cancelled' },
    vip: { bg: colors.statusVipBg, text: colors.statusVipText, label: 'VIP' },
    new: { bg: colors.statusConfirmedBg, text: colors.statusConfirmedText, label: 'New' },
    regular: { bg: colors.creamDark, text: colors.textMuted, label: 'Regular' },
    active: { bg: colors.statusConfirmedBg, text: colors.statusConfirmedText, label: 'Active' },
    inactive: { bg: colors.creamDark, text: colors.textMuted, label: 'Inactive' },
  };

  const s = statusStyles[status] ?? { bg: colors.creamDark, text: colors.textMuted, label: status };

  return (
    <View style={[styles.badge, { backgroundColor: s.bg }]}>
      <Text style={[styles.label, { color: s.text }]}>{label ?? s.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 11, alignSelf: 'flex-start' },
  label: { fontSize: 11, fontFamily: 'Jost_500Medium' },
});
