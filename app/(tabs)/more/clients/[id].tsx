import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../../../src/contexts/ThemeContext';
import { useTranslation } from '../../../../src/contexts/I18nContext';
import { StatusBadge } from '../../../../src/components/StatusBadge';
import { CLIENTS } from '../../../../src/data/clients';
import { STAFF } from '../../../../src/data/staff';
import { fmt$ } from '../../../../src/utils/currency';
import type { Client, ClientStatus } from '../../../../src/types/models';

const STATUS_OPTIONS: ClientStatus[] = ['vip', 'regular', 'new'];

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function ClientDetailScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const client = useMemo(() => CLIENTS.find((c) => c.id === id), [id]);

  const isNew = id === 'new';

  const empty: Client = {
    id: `c${Date.now()}`,
    first: '',
    last: '',
    phone: '',
    email: '',
    visits: 0,
    lastVisit: new Date().toISOString().slice(0, 10),
    status: 'new',
    notes: '',
    preferredTech: null,
    spend: 0,
  };

  const initial = isNew ? empty : client;
  if (!initial) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.cream }]} edges={['top']}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Feather name="chevron-left" size={24} color={colors.obsidian} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.obsidian }]}>{t('clTitle')}</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.center}>
          <Text style={[styles.notFound, { color: colors.textMuted }]}>Client not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const [first, setFirst] = useState(initial.first);
  const [last, setLast] = useState(initial.last);
  const [phone, setPhone] = useState(initial.phone);
  const [email, setEmail] = useState(initial.email);
  const [status, setStatus] = useState<ClientStatus>(initial.status);
  const [notes, setNotes] = useState(initial.notes);
  const [preferredTech, setPreferredTech] = useState(initial.preferredTech);

  const techName = preferredTech
    ? STAFF.find((s) => s.id === preferredTech)
      ? `${STAFF.find((s) => s.id === preferredTech)!.first} ${STAFF.find((s) => s.id === preferredTech)!.last}`
      : preferredTech
    : 'None';

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
          {isNew ? 'New Client' : `${initial.first} ${initial.last}`}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Status row */}
        {!isNew && (
          <View style={styles.statusRow}>
            <StatusBadge status={initial.status} />
            <Text style={[styles.visits, { color: colors.textMuted }]}>
              {initial.visits} {t('clVisits').toLowerCase()} · {fmt$(initial.spend)}
            </Text>
          </View>
        )}

        {/* Fields */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>PERSONAL INFO</Text>

          <Text style={[styles.fieldLabel, { color: colors.charcoal }]}>First Name</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.creamDark, color: colors.obsidian }]}
            value={first}
            onChangeText={setFirst}
            placeholder="First name"
            placeholderTextColor={colors.textFaint}
          />

          <Text style={[styles.fieldLabel, { color: colors.charcoal }]}>Last Name</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.creamDark, color: colors.obsidian }]}
            value={last}
            onChangeText={setLast}
            placeholder="Last name"
            placeholderTextColor={colors.textFaint}
          />

          <Text style={[styles.fieldLabel, { color: colors.charcoal }]}>{t('clPhone')}</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.creamDark, color: colors.obsidian }]}
            value={phone}
            onChangeText={setPhone}
            placeholder="(555) 000-0000"
            placeholderTextColor={colors.textFaint}
            keyboardType="phone-pad"
          />

          <Text style={[styles.fieldLabel, { color: colors.charcoal }]}>Email</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.creamDark, color: colors.obsidian }]}
            value={email}
            onChangeText={setEmail}
            placeholder="email@example.com"
            placeholderTextColor={colors.textFaint}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>STATUS</Text>
          <View style={styles.statusChips}>
            {STATUS_OPTIONS.map((s) => (
              <Pressable
                key={s}
                onPress={() => setStatus(s)}
                style={[
                  styles.statusChip,
                  s === status
                    ? { backgroundColor: colors.obsidian }
                    : { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.border },
                ]}
              >
                <Text
                  style={[
                    styles.statusChipText,
                    { color: s === status ? colors.warmWhite : colors.charcoal },
                  ]}
                >
                  {s.toUpperCase()}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>DETAILS</Text>

          <Text style={[styles.fieldLabel, { color: colors.charcoal }]}>{t('clPreferredTech')}</Text>
          <View style={[styles.input, styles.readonlyField, { backgroundColor: colors.creamDark }]}>
            <Text style={[styles.readonlyText, { color: colors.obsidian }]}>{techName}</Text>
          </View>

          {!isNew && (
            <>
              <Text style={[styles.fieldLabel, { color: colors.charcoal }]}>{t('clLastVisit')}</Text>
              <View style={[styles.input, styles.readonlyField, { backgroundColor: colors.creamDark }]}>
                <Text style={[styles.readonlyText, { color: colors.obsidian }]}>
                  {formatDate(initial.lastVisit)}
                </Text>
              </View>
            </>
          )}

          <Text style={[styles.fieldLabel, { color: colors.charcoal }]}>{t('clNotes')}</Text>
          <TextInput
            style={[styles.input, styles.textArea, { backgroundColor: colors.creamDark, color: colors.obsidian }]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Add notes..."
            placeholderTextColor={colors.textFaint}
            multiline
            textAlignVertical="top"
          />
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
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  visits: { fontSize: 13, fontFamily: 'Jost_400Regular' },
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
    justifyContent: 'center',
  },
  textArea: {
    height: 96,
    paddingTop: 14,
  },
  readonlyField: {
    justifyContent: 'center',
  },
  readonlyText: {
    fontSize: 14,
    fontFamily: 'Jost_400Regular',
  },
  statusChips: { flexDirection: 'row', gap: 8 },
  statusChip: {
    paddingHorizontal: 16,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusChipText: { fontSize: 11, fontFamily: 'Jost_500Medium', letterSpacing: 1 },
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
