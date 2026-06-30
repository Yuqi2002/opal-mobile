import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../../src/contexts/ThemeContext';
import { useAuth } from '../../../src/contexts/AuthContext';
import { useTranslation } from '../../../src/contexts/I18nContext';
import { Avatar } from '../../../src/components/Avatar';
import { StatusBadge } from '../../../src/components/StatusBadge';
import { StorePicker } from '../../../src/components/StorePicker';
import { isOwner, isStaff, canViewBusiness, canManageRoles } from '../../../src/utils/permissions';

type FeatherIconName = React.ComponentProps<typeof Feather>['name'];

interface MenuItem {
  key: string;
  icon: FeatherIconName;
  label: string;
  route: string;
  show: boolean;
}

export default function MoreScreen() {
  const { colors } = useTheme();
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();

  if (!user) return null;

  const role = user.role;

  const businessItems: MenuItem[] = [
    { key: 'reports', icon: 'bar-chart-2', label: t('moreReports'), route: '/(tabs)/more/reports', show: isOwner(role) },
    { key: 'payroll', icon: 'dollar-sign', label: t('morePayroll'), route: '/(tabs)/more/payroll', show: isOwner(role) },
    { key: 'earnings', icon: 'trending-up', label: t('moreMyEarnings'), route: '/(tabs)/more/earnings', show: isStaff(role) },
    { key: 'biz-info', icon: 'info', label: t('moreBusinessInfo'), route: '/(tabs)/more/business-info', show: canViewBusiness(role) },
    { key: 'biz-hours', icon: 'clock', label: t('moreBusinessHours'), route: '/(tabs)/more/business-hours', show: canViewBusiness(role) },
    { key: 'staff-policies', icon: 'sliders', label: t('moreStaffPolicies'), route: '/(tabs)/more/staff-policies', show: isOwner(role) },
  ];

  const manageItems: MenuItem[] = [
    { key: 'my-schedule', icon: 'calendar', label: 'My Schedule', route: '/(tabs)/more/my-schedule', show: isStaff(role) },
    { key: 'my-services', icon: 'scissors', label: 'My Services', route: '/(tabs)/more/my-services', show: isStaff(role) },
    { key: 'clients', icon: 'users', label: t('moreClients'), route: '/(tabs)/more/clients', show: !isStaff(role) },
    { key: 'services', icon: 'scissors', label: t('moreServices'), route: '/(tabs)/more/services', show: !isStaff(role) },
    { key: 'products', icon: 'package', label: t('moreProducts'), route: '/(tabs)/more/products', show: !isStaff(role) },
    { key: 'staff', icon: 'user-check', label: t('moreStaff'), route: '/(tabs)/more/staff', show: !isStaff(role) },
    { key: 'roles', icon: 'shield', label: t('moreRoles'), route: '/(tabs)/more/roles', show: canManageRoles(role) },
  ];

  const preferenceItems: MenuItem[] = [
    { key: 'notifications', icon: 'bell', label: t('moreNotifications'), route: '/(tabs)/more/notifications', show: true },
    { key: 'appearance', icon: 'sun', label: t('moreAppearance'), route: '/(tabs)/more/appearance', show: true },
    { key: 'language', icon: 'globe', label: t('moreLanguage'), route: '/(tabs)/more/language', show: true },
  ];

  const handleSignOut = () => {
    logout();
    router.replace('/login');
  };

  const renderSection = (title: string, items: MenuItem[]) => {
    const visible = items.filter((i) => i.show);
    if (visible.length === 0) return null;
    return (
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>{title}</Text>
        <View style={[styles.card, { backgroundColor: colors.warmWhite }]}>
          {visible.map((item, idx) => (
            <React.Fragment key={item.key}>
              {idx > 0 && <View style={[styles.divider, { backgroundColor: colors.border }]} />}
              <Pressable
                style={styles.menuRow}
                onPress={() => router.push(item.route as any)}
              >
                <View style={[styles.iconCircle, { backgroundColor: colors.creamDark }]}>
                  <Feather name={item.icon} size={18} color={colors.textMuted} />
                </View>
                <Text style={[styles.menuLabel, { color: colors.obsidian }]}>{item.label}</Text>
                <Feather name="chevron-right" size={18} color={colors.textFaint} />
              </Pressable>
            </React.Fragment>
          ))}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.cream }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.obsidian }]}>{t('navMore')}</Text>
        <View style={styles.headerActions}>
          <StorePicker />
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <Pressable
          style={[styles.profileCard, { backgroundColor: colors.warmWhite }]}
          onPress={() => router.push('/(tabs)/more/profile' as any)}
        >
          <View style={styles.profileLeft}>
            <Avatar initials={user.initials} gold={user.gold} size="profile" />
            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, { color: colors.obsidian }]}>
                {user.first} {user.last}
              </Text>
              <StatusBadge status={isOwner(role) ? 'vip' : 'active'} label={user.roleName} />
              <Text style={[styles.profileEmail, { color: colors.textMuted }]}>{user.email}</Text>
            </View>
          </View>
          <Feather name="chevron-right" size={20} color={colors.textFaint} />
        </Pressable>

        {/* Sections */}
        {renderSection(t('moreBusiness'), businessItems)}
        {renderSection(t('moreManage'), manageItems)}
        {renderSection(t('morePreferences'), preferenceItems)}

        {/* Sign Out */}
        <Pressable style={styles.signOutRow} onPress={handleSignOut}>
          <Feather name="log-out" size={18} color="#C62828" />
          <Text style={styles.signOutText}>{t('signOut')}</Text>
        </Pressable>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'Jost_300Light',
    letterSpacing: -0.5,
  },
  headerActions: { flexDirection: 'row', gap: 8 },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 32 },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
    padding: 16,
    borderRadius: 14,
  },
  profileLeft: { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 },
  profileInfo: { flex: 1, gap: 4 },
  profileName: { fontSize: 18, fontFamily: 'Jost_600SemiBold' },
  profileEmail: { fontSize: 12, fontFamily: 'Jost_400Regular', marginTop: 2 },
  section: { marginTop: 20 },
  sectionTitle: {
    fontSize: 10,
    fontFamily: 'Jost_500Medium',
    letterSpacing: 3,
    textTransform: 'uppercase',
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  card: {
    marginHorizontal: 16,
    borderRadius: 14,
    overflow: 'hidden',
  },
  divider: { height: StyleSheet.hairlineWidth, marginLeft: 56 },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    paddingHorizontal: 14,
    gap: 12,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Jost_500Medium',
  },
  signOutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 32,
    paddingVertical: 14,
  },
  signOutText: {
    fontSize: 15,
    fontFamily: 'Jost_500Medium',
    color: '#C62828',
  },
  bottomSpacer: { height: 24 },
});
