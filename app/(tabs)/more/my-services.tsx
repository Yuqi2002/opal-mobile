import React, { useState, useMemo } from 'react';
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
import { STAFF_MAP } from '../../../src/data/staff';
import { SERVICES } from '../../../src/data/services';

export default function MyServicesScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();

  const staffRecord = user ? STAFF_MAP[user.id] : null;

  const [selectedServiceIds, setSelectedServiceIds] = useState<Set<string>>(
    new Set(staffRecord?.services ?? [])
  );
  const [durationOverrides, setDurationOverrides] = useState<Record<string, number>>({});
  const [expandedServiceId, setExpandedServiceId] = useState<string | null>(null);

  const activeServices = useMemo(() => SERVICES.filter((s) => s.active), []);

  const toggleService = (id: string) => {
    setSelectedServiceIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        setDurationOverrides((d) => { const n = { ...d }; delete n[id]; return n; });
        if (expandedServiceId === id) setExpandedServiceId(null);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const adjustDuration = (serviceId: string, defaultDur: number, delta: number) => {
    setDurationOverrides((prev) => {
      const current = prev[serviceId] ?? defaultDur;
      const next = Math.max(5, current + delta);
      return { ...prev, [serviceId]: next };
    });
  };

  const resetDuration = (serviceId: string) => {
    setDurationOverrides((prev) => {
      const next = { ...prev };
      delete next[serviceId];
      return next;
    });
  };

  if (!user) return null;

  const handleSave = () => {
    Alert.alert('Saved', 'Service selections saved successfully.');
    router.back();
  };

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
          {selectedServiceIds.size} of {activeServices.length} services selected
        </Text>

        <View style={[s.card, { backgroundColor: colors.warmWhite }]}>
          {activeServices.map((svc, idx) => {
            const isSelected = selectedServiceIds.has(svc.id);
            const isExpanded = expandedServiceId === svc.id && isSelected;
            const customDur = durationOverrides[svc.id];
            const displayDur = customDur ?? svc.duration;
            const isCustom = customDur != null;

            return (
              <React.Fragment key={svc.id}>
                {idx > 0 && (
                  <View style={[s.divider, { backgroundColor: colors.border }]} />
                )}
                <View style={s.svcRow}>
                  <Pressable
                    style={s.svcToggleArea}
                    onPress={() => toggleService(svc.id)}
                  >
                    {/* Checkbox */}
                    <View
                      style={[
                        s.svcCheck,
                        {
                          backgroundColor: isSelected ? colors.obsidian : 'transparent',
                          borderColor: isSelected ? colors.obsidian : colors.border,
                        },
                      ]}
                    >
                      {isSelected && (
                        <Feather name="check" size={12} color={colors.warmWhite} />
                      )}
                    </View>

                    {/* Service info */}
                    <View style={s.svcInfo}>
                      <Text
                        style={[
                          s.svcName,
                          { color: isSelected ? colors.obsidian : colors.textMuted },
                        ]}
                        numberOfLines={1}
                      >
                        {svc.name}
                      </Text>
                      <Text style={[s.svcMeta, { color: colors.textFaint }]}>
                        {displayDur} min{isCustom ? ' (custom)' : ''}
                      </Text>
                    </View>
                  </Pressable>

                  {/* Expand button for duration edit */}
                  {isSelected && (
                    <Pressable
                      onPress={() => {
                        setExpandedServiceId(isExpanded ? null : svc.id);
                      }}
                      hitSlop={8}
                      style={s.svcExpandBtn}
                    >
                      <Feather
                        name={isExpanded ? 'chevron-up' : 'chevron-down'}
                        size={16}
                        color={colors.textFaint}
                      />
                    </Pressable>
                  )}
                </View>

                {/* Duration editor */}
                {isExpanded && (
                  <View style={[s.durPane, { backgroundColor: colors.cream }]}>
                    <Text style={[s.durLabel, { color: colors.textMuted }]}>
                      Duration ({t('mins')})
                    </Text>
                    <View style={s.durRow}>
                      <Pressable
                        onPress={() => adjustDuration(svc.id, svc.duration, -5)}
                        style={[s.durBtn, { backgroundColor: colors.creamDark }]}
                      >
                        <Feather name="minus" size={16} color={colors.charcoal} />
                      </Pressable>

                      <View style={s.durValueWrap}>
                        <Text style={[s.durValue, { color: colors.obsidian }]}>
                          {displayDur}
                        </Text>
                        <Text style={[s.durUnit, { color: colors.textMuted }]}>
                          min
                        </Text>
                      </View>

                      <Pressable
                        onPress={() => adjustDuration(svc.id, svc.duration, 5)}
                        style={[s.durBtn, { backgroundColor: colors.creamDark }]}
                      >
                        <Feather name="plus" size={16} color={colors.charcoal} />
                      </Pressable>

                      {isCustom && (
                        <Pressable
                          onPress={() => resetDuration(svc.id)}
                          style={[s.resetBtn, { borderColor: colors.border }]}
                        >
                          <Text style={[s.resetText, { color: colors.textMuted }]}>
                            Reset to {svc.duration}
                          </Text>
                        </Pressable>
                      )}
                    </View>
                  </View>
                )}
              </React.Fragment>
            );
          })}
        </View>
      </ScrollView>

      {/* Save button */}
      <View style={s.bottomBar}>
        <Pressable
          style={[s.saveBtn, { backgroundColor: colors.obsidian }]}
          onPress={handleSave}
        >
          <Text style={[s.saveBtnText, { color: colors.warmWhite }]}>{t('save')}</Text>
        </Pressable>
      </View>
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
  svcCheck: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
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
  svcExpandBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  durPane: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  durLabel: {
    fontSize: 12,
    fontFamily: 'Jost_500Medium',
    marginBottom: 6,
  },
  durRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  durBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  durValueWrap: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 3,
  },
  durValue: {
    fontSize: 20,
    fontFamily: 'Jost_600SemiBold',
  },
  durUnit: {
    fontSize: 12,
    fontFamily: 'Jost_400Regular',
  },
  resetBtn: {
    marginLeft: 'auto',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  resetText: {
    fontSize: 11,
    fontFamily: 'Jost_500Medium',
  },
  bottomBar: {
    paddingHorizontal: 16,
    paddingBottom: 34,
    paddingTop: 12,
  },
  saveBtn: {
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: { fontSize: 15, fontFamily: 'Jost_600SemiBold' },
});
