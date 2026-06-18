import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../../../src/contexts/ThemeContext';
import { useTranslation } from '../../../../src/contexts/I18nContext';
import { FilterChips } from '../../../../src/components/FilterChips';
import { SERVICES, SERVICE_CATEGORIES } from '../../../../src/data/services';
import type { Service, ServiceCategory } from '../../../../src/types/models';

const CATEGORIES: ServiceCategory[] = [...SERVICE_CATEGORIES];

export default function ServiceDetailScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const service = useMemo(() => SERVICES.find((s) => s.id === id), [id]);
  const isNew = id === 'new';

  const empty: Service = {
    id: `s${Date.now()}`,
    category: 'Manicure',
    name: '',
    duration: 30,
    price: 0,
    description: '',
    active: true,
    turnIcon: 'nail_polish',
  };

  const initial = isNew ? empty : service;
  if (!initial) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.cream }]} edges={['top']}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Feather name="chevron-left" size={24} color={colors.obsidian} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.obsidian }]}>{t('svTitle')}</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.center}>
          <Text style={[styles.notFound, { color: colors.textMuted }]}>Service not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const [name, setName] = useState(initial.name);
  const [category, setCategory] = useState<ServiceCategory>(initial.category);
  const [duration, setDuration] = useState(String(initial.duration));
  const [price, setPrice] = useState(String(initial.price));
  const [description, setDescription] = useState(initial.description);
  const [active, setActive] = useState(initial.active);
  const [turnIcon, setTurnIcon] = useState(initial.turnIcon);

  const handleSave = () => {
    Alert.alert(t('save'), 'Changes saved (mock)', [{ text: t('done') }]);
    router.back();
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.cream }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Feather name="chevron-left" size={24} color={colors.obsidian} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.obsidian }]}>
          {isNew ? 'New Service' : initial.name}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Name */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>SERVICE INFO</Text>

          <Text style={[styles.fieldLabel, { color: colors.charcoal }]}>Name</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.creamDark, color: colors.obsidian }]}
            value={name}
            onChangeText={setName}
            placeholder="Service name"
            placeholderTextColor={colors.textFaint}
          />

          <Text style={[styles.fieldLabel, { color: colors.charcoal }]}>{t('svCategory')}</Text>
          <View style={styles.chipRow}>
            <FilterChips
              options={CATEGORIES}
              selected={category}
              onSelect={(opt) => setCategory(opt as ServiceCategory)}
            />
          </View>

          <Text style={[styles.fieldLabel, { color: colors.charcoal }]}>{t('svDuration')} ({t('mins')})</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.creamDark, color: colors.obsidian }]}
            value={duration}
            onChangeText={setDuration}
            keyboardType="number-pad"
            placeholder="30"
            placeholderTextColor={colors.textFaint}
          />

          <Text style={[styles.fieldLabel, { color: colors.charcoal }]}>{t('svPrice')}</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.creamDark, color: colors.obsidian }]}
            value={price}
            onChangeText={setPrice}
            keyboardType="decimal-pad"
            placeholder="0"
            placeholderTextColor={colors.textFaint}
          />

          <Text style={[styles.fieldLabel, { color: colors.charcoal }]}>{t('svDescription')}</Text>
          <TextInput
            style={[styles.input, styles.textArea, { backgroundColor: colors.creamDark, color: colors.obsidian }]}
            value={description}
            onChangeText={setDescription}
            placeholder="Service description..."
            placeholderTextColor={colors.textFaint}
            multiline
            textAlignVertical="top"
          />

          <Text style={[styles.fieldLabel, { color: colors.charcoal }]}>Turn Icon</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.creamDark, color: colors.obsidian }]}
            value={turnIcon}
            onChangeText={setTurnIcon}
            placeholder="nail_polish"
            placeholderTextColor={colors.textFaint}
          />
        </View>

        {/* Active Toggle */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>STATUS</Text>
          <View style={styles.toggleRow}>
            <Text style={[styles.toggleLabel, { color: colors.obsidian }]}>{t('active')}</Text>
            <Switch
              value={active}
              onValueChange={setActive}
              trackColor={{ false: colors.creamDark, true: colors.gold }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>
      </ScrollView>

      {/* Save button */}
      <View style={styles.bottomBar}>
        <Pressable
          style={[styles.saveBtn, { backgroundColor: colors.gold }]}
          onPress={handleSave}
        >
          <Text style={styles.saveBtnText}>{t('save')}</Text>
        </Pressable>
      </View>
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
  headerTitle: { fontSize: 20, fontFamily: 'Jost_500Medium' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFound: { fontSize: 16, fontFamily: 'Jost_400Regular' },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 100 },
  section: { marginBottom: 24 },
  sectionLabel: {
    fontSize: 10,
    fontFamily: 'Jost_500Medium',
    letterSpacing: 3,
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 12,
    fontFamily: 'Jost_500Medium',
    marginBottom: 4,
    marginTop: 10,
  },
  input: {
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 14,
    fontFamily: 'Jost_400Regular',
  },
  textArea: {
    height: 96,
    paddingTop: 14,
  },
  chipRow: { marginLeft: -16, marginTop: 4 },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  toggleLabel: { fontSize: 15, fontFamily: 'Jost_500Medium' },
  bottomBar: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    paddingTop: 12,
  },
  saveBtn: {
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    fontSize: 16,
    fontFamily: 'Jost_600SemiBold',
    color: '#FFFFFF',
  },
});
