import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../../../src/contexts/ThemeContext';
import { useTranslation } from '../../../../src/contexts/I18nContext';
import { ROLES } from '../../../../src/data/services';
import { STAFF } from '../../../../src/data/staff';
import { Avatar } from '../../../../src/components/Avatar';

interface Permission {
  key: string;
  label: string;
  granted: boolean;
}

const PERMISSIONS_BY_ROLE: Record<string, Permission[]> = {
  r01: [
    { key: 'all', label: 'Full Access (all permissions)', granted: true },
  ],
  r02: [
    { key: 'view_reports', label: 'View Reports & Analytics', granted: true },
    { key: 'manage_staff', label: 'Manage Staff', granted: true },
    { key: 'manage_services', label: 'Manage Services & Products', granted: true },
    { key: 'manage_clients', label: 'Manage Clients', granted: true },
    { key: 'manage_bookings', label: 'Create & Edit Bookings', granted: true },
    { key: 'view_payroll', label: 'View Payroll', granted: true },
    { key: 'manage_roles', label: 'Manage Roles', granted: false },
  ],
  r03: [
    { key: 'manage_bookings', label: 'Create & Edit Bookings', granted: true },
    { key: 'manage_clients', label: 'Manage Clients', granted: true },
    { key: 'checkout', label: 'Process Checkout', granted: true },
    { key: 'view_schedule', label: 'View All Schedules', granted: true },
    { key: 'manage_staff', label: 'Manage Staff', granted: false },
    { key: 'view_reports', label: 'View Reports', granted: false },
    { key: 'view_payroll', label: 'View Payroll', granted: false },
  ],
  r04: [
    { key: 'view_own_schedule', label: 'View Own Schedule', granted: true },
    { key: 'view_turn_queue', label: 'View Turn Queue', granted: true },
    { key: 'view_own_earnings', label: 'View Own Earnings', granted: true },
    { key: 'manage_bookings', label: 'Create Bookings', granted: false },
    { key: 'manage_clients', label: 'Manage Clients', granted: false },
    { key: 'view_reports', label: 'View Reports', granted: false },
  ],
};

export default function RoleDetailScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const role = ROLES.find((r) => r.id === id);
  if (!role) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.cream }]} edges={['top']}>
        <View style={styles.empty}>
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>Role not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const permissions = PERMISSIONS_BY_ROLE[role.id] ?? [];
  const membersInRole = STAFF.filter((s) => s.roleIds.includes(role.id));

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.cream }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Feather name="arrow-left" size={22} color={colors.obsidian} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.obsidian }]}>Role Detail</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
        {/* Role info */}
        <View style={[styles.card, { backgroundColor: colors.warmWhite }]}>
          <View style={styles.roleHeader}>
            <View style={[styles.colorDot, { backgroundColor: role.color }]} />
            <Text style={[styles.roleName, { color: colors.obsidian }]}>{role.name}</Text>
          </View>
          <Text style={[styles.roleDesc, { color: colors.textMuted }]}>{role.description}</Text>
        </View>

        {/* Permissions */}
        <View style={[styles.card, { backgroundColor: colors.warmWhite }]}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>PERMISSIONS</Text>
          {permissions.map((perm) => (
            <View key={perm.key} style={styles.permRow}>
              <Feather
                name={perm.granted ? 'check-circle' : 'x-circle'}
                size={16}
                color={perm.granted ? colors.forest : colors.textFaint}
              />
              <Text
                style={[
                  styles.permLabel,
                  { color: perm.granted ? colors.obsidian : colors.textFaint },
                ]}
              >
                {perm.label}
              </Text>
            </View>
          ))}
        </View>

        {/* Members */}
        {membersInRole.length > 0 && (
          <View style={[styles.card, { backgroundColor: colors.warmWhite }]}>
            <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>
              MEMBERS ({membersInRole.length})
            </Text>
            {membersInRole.map((staff) => (
              <View key={staff.id} style={styles.memberRow}>
                <Avatar initials={staff.initials} gold={staff.gold} size="compact" />
                <Text style={[styles.memberName, { color: colors.obsidian }]}>
                  {staff.first} {staff.last}
                </Text>
              </View>
            ))}
          </View>
        )}
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
  headerTitle: { fontSize: 18, fontFamily: 'Jost_500Medium' },
  body: { flex: 1 },
  bodyContent: { padding: 16, gap: 12 },
  card: { borderRadius: 14, padding: 16, gap: 12 },
  roleHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  colorDot: { width: 14, height: 14, borderRadius: 7 },
  roleName: { fontSize: 20, fontFamily: 'Jost_600SemiBold' },
  roleDesc: { fontSize: 14, fontFamily: 'Jost_400Regular' },
  sectionTitle: {
    fontSize: 10,
    fontFamily: 'Jost_500Medium',
    letterSpacing: 2,
  },
  permRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  permLabel: { fontSize: 14, fontFamily: 'Jost_400Regular' },
  memberRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  memberName: { fontSize: 14, fontFamily: 'Jost_500Medium' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: 16, fontFamily: 'Jost_500Medium' },
});
