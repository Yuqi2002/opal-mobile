import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../../src/contexts/ThemeContext';
import { useAuth } from '../../../src/contexts/AuthContext';
import { useTranslation } from '../../../src/contexts/I18nContext';
import { useStore } from '../../../src/contexts/StoreContext';
import { canEditBusiness } from '../../../src/utils/permissions';
import { STORES } from '../../../src/data/stores';

export default function BusinessInfoScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();
  const { selectedStore, userStores } = useStore();

  const store = selectedStore ?? userStores[0] ?? STORES[0];
  const canEdit = user ? canEditBusiness(user.role) : false;

  const [name, setName] = useState(store.name);
  const [address, setAddress] = useState(store.address);
  const [phone, setPhone] = useState(store.phone);
  const [email, setEmail] = useState(store.email);
  const [taxRate, setTaxRate] = useState(store.taxRate.toString());

  const handleSave = () => {
    Alert.alert('Saved', 'Business info updated.');
  };

  const renderField = (
    label: string,
    value: string,
    onChange: (v: string) => void,
    options?: { keyboardType?: 'default' | 'phone-pad' | 'email-address' | 'numeric' }
  ) => (
    <View style={styles.fieldRow}>
      <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>{label}</Text>
      {canEdit ? (
        <TextInput
          style={[styles.input, { backgroundColor: colors.creamDark, color: colors.obsidian }]}
          value={value}
          onChangeText={onChange}
          keyboardType={options?.keyboardType ?? 'default'}
          placeholderTextColor={colors.textFaint}
        />
      ) : (
        <View style={[styles.readOnly, { backgroundColor: colors.creamDark }]}>
          <Text style={[styles.readOnlyText, { color: colors.charcoal }]}>{value}</Text>
          <Feather name="lock" size={14} color={colors.textFaint} />
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.cream }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Feather name="arrow-left" size={24} color={colors.obsidian} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.obsidian }]}>{t('moreBusinessInfo')}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Store indicator */}
        <View style={[styles.storeChip, { backgroundColor: colors.warmWhite }]}>
          <Feather name="map-pin" size={14} color={colors.goldDeep} />
          <Text style={[styles.storeName, { color: colors.obsidian }]}>{store.name}</Text>
        </View>

        <View style={styles.form}>
          {renderField(t('bizName'), name, setName)}
          {renderField(t('bizAddress'), address, setAddress)}
          {renderField(t('bizPhone'), phone, setPhone, { keyboardType: 'phone-pad' })}
          {renderField(t('bizEmail'), email, setEmail, { keyboardType: 'email-address' })}
          {renderField(t('bizTaxRate'), `${taxRate}%`, (v) => setTaxRate(v.replace('%', '')), { keyboardType: 'numeric' })}
        </View>

        {canEdit && (
          <Pressable
            style={[styles.saveButton, { backgroundColor: colors.obsidian }]}
            onPress={handleSave}
          >
            <Text style={[styles.saveText, { color: colors.warmWhite }]}>{t('save')}</Text>
          </Pressable>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
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
  headerTitle: { fontSize: 18, fontFamily: 'Jost_600SemiBold' },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 32 },
  storeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  storeName: { fontSize: 14, fontFamily: 'Jost_500Medium' },
  form: { paddingHorizontal: 16, gap: 18 },
  fieldRow: { gap: 6 },
  fieldLabel: { fontSize: 12, fontFamily: 'Jost_500Medium', letterSpacing: 0.5 },
  input: {
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 15,
    fontFamily: 'Jost_400Regular',
  },
  readOnly: {
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  readOnlyText: { fontSize: 15, fontFamily: 'Jost_400Regular' },
  saveButton: {
    marginHorizontal: 16,
    marginTop: 32,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveText: { fontSize: 15, fontFamily: 'Jost_600SemiBold' },
  bottomSpacer: { height: 24 },
});
