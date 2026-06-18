import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
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
import { CLIENTS } from '../../../../src/data/clients';
import { shadows } from '../../../../src/theme/tokens';
import type { Client } from '../../../../src/types/models';

const FILTERS = ['All', 'VIP', 'Regular', 'New'];

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function ClientsListScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');

  const filtered = useMemo(() => {
    let list = CLIENTS;
    if (filter !== 'All') {
      const key = filter.toLowerCase() as Client['status'];
      list = list.filter((c) => c.status === key);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          `${c.first} ${c.last}`.toLowerCase().includes(q) ||
          c.phone.includes(q) ||
          c.email.toLowerCase().includes(q)
      );
    }
    return list;
  }, [search, filter]);

  const renderItem = ({ item }: { item: Client }) => (
    <Card
      onPress={() => router.push(`/(tabs)/more/clients/${item.id}` as any)}
      style={styles.cardSpacing}
    >
      <View style={styles.cardRow}>
        <View style={styles.cardInfo}>
          <Text style={[styles.cardName, { color: colors.obsidian }]}>
            {item.first} {item.last}
          </Text>
          <Text style={[styles.cardPhone, { color: colors.textMuted }]}>{item.phone}</Text>
        </View>
        <StatusBadge status={item.status} />
      </View>
      <View style={[styles.cardMeta, { borderTopColor: colors.border }]}>
        <View style={styles.metaItem}>
          <Feather name="calendar" size={12} color={colors.textFaint} />
          <Text style={[styles.metaText, { color: colors.textMuted }]}>
            {item.visits} {t('clVisits').toLowerCase()}
          </Text>
        </View>
        <View style={styles.metaItem}>
          <Feather name="clock" size={12} color={colors.textFaint} />
          <Text style={[styles.metaText, { color: colors.textMuted }]}>
            {formatDate(item.lastVisit)}
          </Text>
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
        <Text style={[styles.title, { color: colors.obsidian }]}>{t('clTitle')}</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <SearchBar value={search} onChangeText={setSearch} placeholder={`${t('search')}...`} />
      </View>

      {/* Filter Chips */}
      <View style={styles.chipWrap}>
        <FilterChips options={FILTERS} selected={filter} onSelect={setFilter} />
      </View>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<EmptyState icon="users" title={t('noResults')} />}
        showsVerticalScrollIndicator={false}
      />

      {/* FAB */}
      <Pressable
        style={[styles.fab, { backgroundColor: colors.gold }, shadows.elevated]}
        onPress={() => router.push('/(tabs)/more/clients/new' as any)}
      >
        <Feather name="plus" size={24} color="#FFFFFF" />
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
  chipWrap: { marginBottom: 12 },
  listContent: { paddingHorizontal: 16, paddingBottom: 100 },
  cardSpacing: { marginBottom: 10 },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardInfo: { flex: 1, marginRight: 12 },
  cardName: { fontSize: 16, fontFamily: 'Jost_500Medium' },
  cardPhone: { fontSize: 13, fontFamily: 'Jost_400Regular', marginTop: 2 },
  cardMeta: { flexDirection: 'row', gap: 16, marginTop: 10, paddingTop: 10, borderTopWidth: StyleSheet.hairlineWidth },
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
