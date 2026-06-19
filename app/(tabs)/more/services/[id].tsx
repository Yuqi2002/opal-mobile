import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../../../src/contexts/ThemeContext';
import { useTranslation } from '../../../../src/contexts/I18nContext';
import { FilterChips } from '../../../../src/components/FilterChips';
import { TurnIcon, TURN_ICON_LIST, TURN_ICONS } from '../../../../src/components/TurnIcon';
import { SERVICES, SERVICE_CATEGORIES } from '../../../../src/data/services';
import type { Service, ServiceCategory } from '../../../../src/types/models';

const CATEGORIES: ServiceCategory[] = [...SERVICE_CATEGORIES];

function getAbbreviation(name: string): string {
  if (!name) return '??';
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

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

  const [name, setName] = useState(initial?.name ?? '');
  const [category, setCategory] = useState<ServiceCategory>(initial?.category ?? 'Manicure');
  const [duration, setDuration] = useState(String(initial?.duration ?? 30));
  const [price, setPrice] = useState(String(initial?.price ?? 0));
  const [description, setDescription] = useState(initial?.description ?? '');
  const [active, setActive] = useState(initial?.active ?? true);
  const [turnIcon, setTurnIcon] = useState(initial?.turnIcon ?? 'nail_polish');
  const [showIconPicker, setShowIconPicker] = useState(false);

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
          <Pressable
            onPress={() => setShowIconPicker(!showIconPicker)}
            style={[
              styles.iconTrigger,
              { backgroundColor: colors.creamDark },
            ]}
          >
            <View style={styles.iconTriggerLeft}>
              {turnIcon ? (
                <TurnIcon icon={turnIcon} size={20} color={colors.obsidian} />
              ) : (
                <View style={[styles.iconAbbrCircle, { backgroundColor: colors.border }]}>
                  <Text style={[styles.iconAbbrText, { color: colors.textMuted }]}>
                    {getAbbreviation(name)}
                  </Text>
                </View>
              )}
              <Text style={[styles.iconTriggerLabel, { color: turnIcon ? colors.obsidian : colors.textMuted }]}>
                {turnIcon ? (TURN_ICONS[turnIcon]?.label ?? turnIcon) : 'None (abbreviation)'}
              </Text>
            </View>
            <Feather
              name={showIconPicker ? 'chevron-up' : 'chevron-down'}
              size={18}
              color={colors.textMuted}
            />
          </Pressable>

          {showIconPicker && (
            <View style={[styles.iconGrid, { backgroundColor: colors.warmWhite, borderColor: colors.border }]}>
              {/* None option */}
              <Pressable
                onPress={() => { setTurnIcon(''); setShowIconPicker(false); }}
                style={[
                  styles.iconBtn,
                  { borderColor: !turnIcon ? colors.goldDeep : colors.border },
                  !turnIcon && { backgroundColor: colors.goldSoft },
                ]}
              >
                <Text style={[styles.iconAbbrSmall, { color: !turnIcon ? colors.goldDeep : colors.textMuted }]}>
                  {getAbbreviation(name)}
                </Text>
              </Pressable>
              {TURN_ICON_LIST.map((entry) => {
                const active = turnIcon === entry.key;
                return (
                  <Pressable
                    key={entry.key}
                    onPress={() => { setTurnIcon(active ? '' : entry.key); setShowIconPicker(false); }}
                    style={[
                      styles.iconBtn,
                      { borderColor: active ? colors.goldDeep : colors.border },
                      active && { backgroundColor: colors.goldSoft },
                    ]}
                  >
                    <TurnIcon icon={entry.key} size={20} color={active ? colors.goldDeep : colors.charcoal} />
                  </Pressable>
                );
              })}
            </View>
          )}
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

  // Icon picker
  iconTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  iconTriggerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconTriggerLabel: {
    fontSize: 14,
    fontFamily: 'Jost_400Regular',
  },
  iconAbbrCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconAbbrText: {
    fontSize: 10,
    fontFamily: 'Jost_600SemiBold',
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconAbbrSmall: {
    fontSize: 11,
    fontFamily: 'Jost_600SemiBold',
  },
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
    color: '#1A1A18',
  },
});
