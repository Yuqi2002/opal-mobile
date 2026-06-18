import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../../../src/contexts/ThemeContext';
import { useTranslation } from '../../../../src/contexts/I18nContext';
import { SearchBar } from '../../../../src/components/SearchBar';
import { FilterChips } from '../../../../src/components/FilterChips';
import { Card } from '../../../../src/components/Card';
import { StatusBadge } from '../../../../src/components/StatusBadge';
import { EmptyState } from '../../../../src/components/EmptyState';
import { SERVICES } from '../../../../src/data/services';
import { fmtCurrency } from '../../../../src/utils/currency';
import { shadows } from '../../../../src/theme/tokens';
import type { Service } from '../../../../src/types/models';

const CATEGORY_FILTERS = ['All', 'Manicure', 'Pedicure', 'Combo', 'Add-on'];
const STATUS_FILTERS = ['All', 'Active', 'Inactive'];

export default function ServicesListScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [toggleStates, setToggleStates] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    SERVICES.forEach((s) => { map[s.id] = s.active; });
    return map;
  });

  const filtered = useMemo(() => {
    let list = SERVICES;
    if (categoryFilter !== 'All') {
      list = list.filter((s) => s.category === categoryFilter);
    }
    if (statusFilter === 'Active') {
      list = list.filter((s) => toggleStates[s.id]);
    } else if (statusFilter === 'Inactive') {
      list = list.filter((s) => !toggleStates[s.id]);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((s) => s.name.toLowerCase().includes(q));
    }
    return list;
  }, [search, categoryFilter, statusFilter, toggleStates]);

  const handleToggle = (id: string) => {
    setToggleStates((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const renderItem = ({ item }: { item: Service }) => (
    <Card
      onPress={() => router.push(`/(tabs)/more/services/${item.id}` as any)}
      style={styles.cardSpacing}
    >
      <View style={styles.cardTop}>
        <View style={styles.cardInfo}>
          <Text style={[styles.cardName, { color: colors.obsidian }]}>{item.name}</Text>
          <StatusBadge status={item.category === 'Add-on' ? 'pending' : 'confirmed'} label={item.category} />
        </View>
        <Switch
          value={toggleStates[item.id]}
          onValueChange={() => handleToggle(item.id)}
          trackColor={{ false: colors.creamDark, true: colors.gold }}
          thumbColor="#FFFFFF"
          style={styles.toggle}
        />
      </View>
      <View style={[styles.cardMeta, { borderTopColor: colors.border }]}>
        <View style={styles.metaItem}>
          <Feather name="clock" size={12} color={colors.textFaint} />
          <Text style={[styles.metaText, { color: colors.textMuted }]}>{item.duration} {t('mins')}</Text>
        </View>
        <View style={styles.metaItem}>
          <Feather name="dollar-sign" size={12} color={colors.textFaint} />
          <Text style={[styles.metaText, { color: colors.textMuted }]}>{fmtCurrency(item.price)}</Text>
        </View>
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.cream }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Feather name="chevron-left" size={24} color={colors.obsidian} />
        </Pressable>
        <Text style={[styles.title, { color: colors.obsidian }]}>{t('svTitle')}</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <SearchBar value={search} onChangeText={setSearch} placeholder={`${t('search')}...`} />
      </View>

      {/* Category Filter */}
      <View style={styles.chipWrap}>
        <FilterChips options={CATEGORY_FILTERS} selected={categoryFilter} onSelect={setCategoryFilter} />
      </View>

      {/* Status Filter */}
      <View style={styles.chipWrap}>
        <FilterChips options={STATUS_FILTERS} selected={statusFilter} onSelect={setStatusFilter} />
      </View>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<EmptyState icon="scissors" title={t('noResults')} />}
        showsVerticalScrollIndicator={false}
      />

      {/* FAB */}
      <Pressable
        style={[styles.fab, { backgroundColor: colors.gold }, shadows.elevated]}
        onPress={() => router.push('/(tabs)/more/services/new' as any)}
      >
        <Feather name="plus" size={24} color={colors.goldButtonText} />
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: { fontSize: 20, fontFamily: 'Jost_500Medium' },
  searchWrap: { paddingHorizontal: 16, marginBottom: 10 },
  chipWrap: { marginBottom: 8 },
  listContent: { paddingHorizontal: 16, paddingBottom: 100 },
  cardSpacing: { marginBottom: 10 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardInfo: { flex: 1, marginRight: 12, gap: 6 },
  cardName: { fontSize: 16, fontFamily: 'Jost_500Medium' },
  toggle: { transform: [{ scale: 0.85 }] },
  cardMeta: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, fontFamily: 'Jost_400Regular' },
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
