import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../../../src/contexts/ThemeContext';
import { useTranslation } from '../../../../src/contexts/I18nContext';
import { FilterChips } from '../../../../src/components/FilterChips';
import { PRODUCTS, PRODUCT_CATEGORIES } from '../../../../src/data/services';
import type { Product, ProductCategory } from '../../../../src/types/models';

const CATEGORIES: ProductCategory[] = [...PRODUCT_CATEGORIES];

export default function ProductDetailScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const product = useMemo(() => PRODUCTS.find((p) => p.id === id), [id]);
  const isNew = id === 'new';

  const empty: Product = {
    id: `p${Date.now()}`,
    category: 'Polish',
    name: '',
    price: 0,
    sku: '',
    stock: 0,
    active: true,
    description: '',
  };

  const initial = isNew ? empty : product;

  const [name, setName] = useState(initial?.name ?? '');
  const [category, setCategory] = useState<ProductCategory>(initial?.category ?? 'Polish');
  const [price, setPrice] = useState(String(initial?.price ?? 0));
  const [sku, setSku] = useState(initial?.sku ?? '');
  const [stock, setStock] = useState(String(initial?.stock ?? 0));
  const [active, setActive] = useState(initial?.active ?? true);
  const [description, setDescription] = useState(initial?.description ?? '');

  if (!initial) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.cream }]} edges={['top']}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Feather name="chevron-left" size={24} color={colors.obsidian} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.obsidian }]}>{t('prTitle')}</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.center}>
          <Text style={[styles.notFound, { color: colors.textMuted }]}>Product not found</Text>
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
          {isNew ? 'New Product' : initial.name}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Product Info */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>PRODUCT INFO</Text>

          <Text style={[styles.fieldLabel, { color: colors.charcoal }]}>Name</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.creamDark, color: colors.obsidian }]}
            value={name}
            onChangeText={setName}
            placeholder="Product name"
            placeholderTextColor={colors.textFaint}
          />

          <Text style={[styles.fieldLabel, { color: colors.charcoal }]}>{t('prCategory')}</Text>
          <View style={styles.chipRow}>
            <FilterChips
              options={CATEGORIES}
              selected={category}
              onSelect={(opt) => setCategory(opt as ProductCategory)}
            />
          </View>

          <Text style={[styles.fieldLabel, { color: colors.charcoal }]}>{t('prPrice')}</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.creamDark, color: colors.obsidian }]}
            value={price}
            onChangeText={setPrice}
            keyboardType="decimal-pad"
            placeholder="0.00"
            placeholderTextColor={colors.textFaint}
          />

          <Text style={[styles.fieldLabel, { color: colors.charcoal }]}>{t('prSku')}</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.creamDark, color: colors.obsidian }]}
            value={sku}
            onChangeText={setSku}
            placeholder="SKU-000"
            placeholderTextColor={colors.textFaint}
            autoCapitalize="characters"
          />

          <Text style={[styles.fieldLabel, { color: colors.charcoal }]}>{t('prStock')}</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.creamDark, color: colors.obsidian }]}
            value={stock}
            onChangeText={setStock}
            keyboardType="number-pad"
            placeholder="0"
            placeholderTextColor={colors.textFaint}
          />

          <Text style={[styles.fieldLabel, { color: colors.charcoal }]}>{t('prDescription')}</Text>
          <TextInput
            style={[styles.input, styles.textArea, { backgroundColor: colors.creamDark, color: colors.obsidian }]}
            value={description}
            onChangeText={setDescription}
            placeholder="Product description..."
            placeholderTextColor={colors.textFaint}
            multiline
            textAlignVertical="top"
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
    color: '#1A1A18',
  },
});
