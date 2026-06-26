import React, { useMemo } from 'react';
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
import { useTheme } from '../../../src/contexts/ThemeContext';
import { useAuth } from '../../../src/contexts/AuthContext';
import { STAFF_MAP } from '../../../src/data/staff';
import { SERVICES } from '../../../src/data/services';

export default function MyServicesScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const router = useRouter();

  const staffRecord = user ? STAFF_MAP[user.id] : null;

  const selectedServiceIds = useMemo<Set<string>>(
    () => new Set(staffRecord?.services ?? []),
    [staffRecord]
  );

  const activeServices = useMemo(() => SERVICES.filter((s) => s.active), []);

  if (!user) return null;

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: colors.cream }]} edges={['top']}>
      {/* Header */}
      <View style={s.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Feather name="arrow-left" size={24} color={colors.obsidian} />
        </Pressable>
        <Text style={[s.headerTitle, { color: colors.obsidian }]}>My Services</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[s.hint, { color: colors.textFaint }]}>
          {selectedServiceIds.size} of {activeServices.length} services assigned
        </Text>

        <View style={[s.card, { backgroundColor: colors.warmWhite }]}>
          {activeServices.map((svc, idx) => {
            const isSelected = selectedServiceIds.has(svc.id);

            return (
              <React.Fragment key={svc.id}>
                {idx > 0 && (
                  <View style={[s.divider, { backgroundColor: colors.border }]} />
                )}
                <View style={s.svcRow}>
                  <View style={s.svcToggleArea}>
                    {/* Indicator dot */}
                    <View
                      style={[
                        s.svcDot,
                        {
                          backgroundColor: isSelected ? colors.gold : colors.border,
                        },
                      ]}
                    />

                    {/* Service info */}
                    <View style={s.svcInfo}>
                      <Text
                        style={[
                          s.svcName,
                          { color: isSelected ? colors.obsidian : colors.textFaint },
                        ]}
                        numberOfLines={1}
                      >
                        {svc.name}
                      </Text>
                      <Text style={[s.svcMeta, { color: colors.textFaint }]}>
                        {svc.duration} min
                      </Text>
                    </View>
                  </View>
                </View>
              </React.Fragment>
            );
          })}
        </View>

        <Text style={[s.readOnlyNote, { color: colors.textFaint }]}>
          Contact your manager to update your services.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
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
  scrollContent: { padding: 16, paddingBottom: 32 },
  hint: {
    fontSize: 12,
    fontFamily: 'Jost_400Regular',
    marginBottom: 8,
  },
  card: { borderRadius: 14, overflow: 'hidden' },
  divider: { height: StyleSheet.hairlineWidth, marginLeft: 16 },
  svcRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  svcToggleArea: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  svcDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  svcInfo: {
    flex: 1,
    gap: 1,
  },
  svcName: {
    fontSize: 14,
    fontFamily: 'Jost_500Medium',
  },
  svcMeta: {
    fontSize: 12,
    fontFamily: 'Jost_400Regular',
  },
  readOnlyNote: {
    fontSize: 12,
    fontFamily: 'Jost_400Regular',
    textAlign: 'center',
    marginTop: 16,
  },
});
