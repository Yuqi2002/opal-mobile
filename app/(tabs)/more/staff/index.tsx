import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../../../src/contexts/ThemeContext';
import { shadows } from '../../../../src/theme/tokens';
import { useTranslation } from '../../../../src/contexts/I18nContext';
import { useAuth } from '../../../../src/contexts/AuthContext';
import { canManageStaff } from '../../../../src/utils/permissions';
import { SearchBar } from '../../../../src/components/SearchBar';
import { FilterChips } from '../../../../src/components/FilterChips';
import { Avatar } from '../../../../src/components/Avatar';
import { StatusBadge } from '../../../../src/components/StatusBadge';
import { getStaffForStore } from '../../../../src/data/staff';
import { useStore } from '../../../../src/contexts/StoreContext';
import { StorePicker } from '../../../../src/components/StorePicker';

const ROLE_FILTERS = ['All', 'Staff', 'Receptionist', 'Owner'];

export default function StaffListScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useAuth();

  const { selectedStoreId } = useStore();
  const showAdd = user ? canManageStaff(user.role) : false;

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');

  const filtered = useMemo(() => {
    let list = getStaffForStore(selectedStoreId);
    if (roleFilter !== 'All') {
      list = list.filter((s) => s.role.toLowerCase().includes(roleFilter.toLowerCase()));
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          s.first.toLowerCase().includes(q) ||
          s.last.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q)
      );
    }
    return list;
  }, [search, roleFilter]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.cream }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View style={styles.headerSide}>
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <Feather name="arrow-left" size={22} color={colors.obsidian} />
          </Pressable>
        </View>
        <Text style={[styles.title, { color: colors.obsidian }]} numberOfLines={1}>
          {t('moreStaff')}
        </Text>
        <View style={[styles.headerSide, styles.headerSideRight]}>
          <StorePicker />
        </View>
      </View>

      <View style={styles.filters}>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Search staff..." />
        <FilterChips
          options={ROLE_FILTERS}
          selected={roleFilter}
          onSelect={setRoleFilter}
        />
      </View>

      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Feather name="users" size={40} color={colors.textFaint} />
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>{t('noResults')}</Text>
          </View>
        ) : (
          filtered.map((staff) => (
            <Pressable
              key={staff.id}
              style={[styles.card, { backgroundColor: colors.warmWhite }]}
              onPress={() => router.push(`/(tabs)/more/staff/${staff.id}` as any)}
            >
              <Avatar initials={staff.initials} gold={staff.gold} size="list" />
              <View style={styles.cardInfo}>
                <Text style={[styles.cardName, { color: colors.obsidian }]}>
                  {staff.first} {staff.last}
                </Text>
                <View style={styles.cardMeta}>
                  <StatusBadge
                    status={staff.status}
                    label={staff.role}
                  />
                  <Text style={[styles.cardShift, { color: colors.textMuted }]}>{staff.shift}</Text>
                </View>
              </View>
              <Feather name="chevron-right" size={18} color={colors.textFaint} />
            </Pressable>
          ))
        )}
      </ScrollView>

      {showAdd && (
        <Pressable
          style={[styles.fab, { backgroundColor: colors.gold }, shadows.elevated]}
          onPress={() => router.push('/(tabs)/more/staff/new' as any)}
        >
          <Feather name="plus" size={24} color={colors.goldButtonText} />
        </Pressable>
      )}
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
  title: { fontSize: 18, fontFamily: 'Jost_500Medium' },
  headerSide: { flex: 1 },
  headerSideRight: { alignItems: 'flex-end' },
  filters: { paddingHorizontal: 16, paddingTop: 12, gap: 10 },
  list: { flex: 1 },
  listContent: { padding: 16, gap: 8 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    gap: 12,
  },
  cardInfo: { flex: 1, gap: 4 },
  cardName: { fontSize: 15, fontFamily: 'Jost_500Medium' },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardShift: { fontSize: 12, fontFamily: 'Jost_400Regular' },
  empty: { alignItems: 'center', justifyContent: 'center', paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 15, fontFamily: 'Jost_400Regular' },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
