import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '../../../src/contexts/ThemeContext';
import { useTranslation } from '../../../src/contexts/I18nContext';
import { useActiveService } from '../../../src/contexts/ActiveServiceContext';
import { getAppointments, updateAppointment } from '../../../src/data/appointments';
import { SERVICES } from '../../../src/data/services';
import { fmtTime } from '../../../src/utils/time';
import { fmt$ } from '../../../src/utils/currency';
import { shadows, radii, spacing, typography } from '../../../src/theme/tokens';
import type { Appointment, Service } from '../../../src/types/models';

// ─── Service item in the current appointment ───────────

function CurrentServiceRow({
  name,
  price,
  onRemove,
  colors,
}: {
  name: string;
  price: number;
  onRemove: () => void;
  colors: any;
}) {
  return (
    <View style={[s.serviceRow, { backgroundColor: colors.warmWhite, borderColor: colors.border }]}>
      <View style={{ flex: 1 }}>
        <Text style={[s.serviceName, { color: colors.obsidian }]}>{name}</Text>
        <Text style={[s.servicePrice, { color: colors.goldDeep }]}>{fmt$(price)}</Text>
      </View>
      <Pressable
        style={[s.removeBtn, { backgroundColor: colors.statusCancelledBg }]}
        onPress={onRemove}
      >
        <Feather name="x" size={14} color={colors.statusCancelledText} />
      </Pressable>
    </View>
  );
}

// ─── Catalog service row ───────────────────────────────

function CatalogServiceRow({
  service,
  onAdd,
  colors,
}: {
  service: Service;
  onAdd: () => void;
  colors: any;
}) {
  return (
    <Pressable
      style={[s.catalogRow, { backgroundColor: colors.warmWhite, borderColor: colors.border }]}
      onPress={onAdd}
    >
      <View style={{ flex: 1 }}>
        <Text style={[s.serviceName, { color: colors.obsidian }]}>{service.name}</Text>
        <Text style={[s.catalogMeta, { color: colors.textMuted }]}>
          {service.duration} min  ·  {fmt$(service.price)}
        </Text>
      </View>
      <View style={[s.addBadge, { backgroundColor: colors.goldSoft }]}>
        <Feather name="plus" size={14} color={colors.goldDeep} />
      </View>
    </Pressable>
  );
}

// ─── Main screen ───────────────────────────────────────

export default function EditActiveScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const { id, date } = useLocalSearchParams<{ id: string; date: string }>();
  const { refreshActive } = useActiveService();

  // Load the appointment from mock data
  const sourceAppt = useMemo(() => {
    if (!date || !id) return null;
    return getAppointments(date).find((a) => a.id === id) ?? null;
  }, [id, date]);

  // Editable state: list of services
  const [services, setServices] = useState<{ name: string; price: number; duration: number }[]>(
    () => {
      if (!sourceAppt) return [];
      if (sourceAppt.services && sourceAppt.services.length > 0) {
        return sourceAppt.services.map((sv) => ({
          name: sv.name,
          price: sv.price,
          duration: sv.mins,
        }));
      }
      // Single-service appointment
      return [
        {
          name: sourceAppt.service,
          price: sourceAppt.price,
          duration: sourceAppt.endMin - sourceAppt.startMin,
        },
      ];
    }
  );

  // Total time adjustment (minutes offset from original)
  const originalDuration = sourceAppt ? sourceAppt.endMin - sourceAppt.startMin : 0;
  const [timeAdjust, setTimeAdjust] = useState(0);
  const totalDuration = originalDuration + timeAdjust;

  // Search for catalog
  const [search, setSearch] = useState('');
  const catalogResults = useMemo(() => {
    const activeServices = SERVICES.filter((sv) => sv.active);
    if (!search.trim()) return activeServices;
    const q = search.toLowerCase();
    return activeServices.filter(
      (sv) =>
        sv.name.toLowerCase().includes(q) ||
        sv.category.toLowerCase().includes(q)
    );
  }, [search]);

  // Computed totals
  const totalPrice = services.reduce((sum, sv) => sum + sv.price, 0);

  const handleAddService = useCallback((service: Service) => {
    setServices((prev) => [
      ...prev,
      { name: service.name, price: service.price, duration: service.duration },
    ]);
  }, []);

  const handleRemoveService = useCallback((index: number) => {
    setServices((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleSave = () => {
    if (!sourceAppt) return;
    const newEndMin = sourceAppt.startMin + totalDuration;
    const serviceNames = services.map((sv) => sv.name).join(' + ');

    updateAppointment(sourceAppt.id, {
      service: serviceNames,
      price: totalPrice,
      endMin: newEndMin,
    });

    refreshActive();
    router.back();
  };

  if (!sourceAppt) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.cream }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: colors.textMuted }}>Appointment not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.cream }} edges={['top']}>
      {/* Header */}
      <View style={[s.header, { borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Feather name="arrow-left" size={22} color={colors.obsidian} />
        </Pressable>
        <Text style={[s.headerTitle, { color: colors.obsidian }]}>{t('asEditService')}</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Client info banner */}
        <View style={[s.clientBanner, { backgroundColor: colors.goldSoft }]}>
          <Feather name="user" size={16} color={colors.goldDeep} />
          <Text style={[s.clientName, { color: colors.goldDeep }]}>{sourceAppt.client}</Text>
          <Text style={[s.clientTime, { color: colors.goldDeep }]}>
            {fmtTime(sourceAppt.startMin)} - {fmtTime(sourceAppt.startMin + totalDuration)}
          </Text>
        </View>

        {/* Current services */}
        <View style={s.sectionBlock}>
          <Text style={[s.sectionTitle, { color: colors.textMuted }]}>
            {t('asCurrentServices')}
          </Text>
          {services.map((sv, i) => (
            <CurrentServiceRow
              key={`${sv.name}-${i}`}
              name={sv.name}
              price={sv.price}
              onRemove={() => handleRemoveService(i)}
              colors={colors}
            />
          ))}
          <View style={[s.totalRow, { borderTopColor: colors.border }]}>
            <Text style={[s.totalLabel, { color: colors.obsidian }]}>{t('apptTotal')}</Text>
            <Text style={[s.totalValue, { color: colors.goldDeep }]}>{fmt$(totalPrice)}</Text>
          </View>
        </View>

        {/* Adjust total time */}
        <View style={s.sectionBlock}>
          <Text style={[s.sectionTitle, { color: colors.textMuted }]}>
            {t('asTotalTime')}
          </Text>
          <View style={[s.timeAdjustRow, { backgroundColor: colors.warmWhite, borderColor: colors.border }]}>
            <Pressable
              style={[s.timeBtn, { backgroundColor: colors.cream }]}
              onPress={() => setTimeAdjust((v) => Math.max(v - 15, -originalDuration + 15))}
            >
              <Feather name="minus" size={18} color={colors.obsidian} />
            </Pressable>
            <View style={s.timeLabelWrap}>
              <Text style={[s.timeValue, { color: colors.obsidian }]}>{totalDuration} min</Text>
              {timeAdjust !== 0 && (
                <Text style={[s.timeOffset, { color: timeAdjust > 0 ? colors.forest : colors.statusCancelledText }]}>
                  {timeAdjust > 0 ? '+' : ''}{timeAdjust} min
                </Text>
              )}
            </View>
            <Pressable
              style={[s.timeBtn, { backgroundColor: colors.cream }]}
              onPress={() => setTimeAdjust((v) => v + 15)}
            >
              <Feather name="plus" size={18} color={colors.obsidian} />
            </Pressable>
          </View>
        </View>

        {/* Add service from catalog */}
        <View style={s.sectionBlock}>
          <Text style={[s.sectionTitle, { color: colors.textMuted }]}>
            {t('asServiceCatalog')}
          </Text>
          <View style={[s.searchBar, { backgroundColor: colors.warmWhite, borderColor: colors.border }]}>
            <Feather name="search" size={16} color={colors.textMuted} />
            <TextInput
              style={[s.searchInput, { color: colors.obsidian }]}
              placeholder={t('asSearchServices')}
              placeholderTextColor={colors.textFaint}
              value={search}
              onChangeText={setSearch}
            />
            {search.length > 0 && (
              <Pressable onPress={() => setSearch('')}>
                <Feather name="x" size={16} color={colors.textMuted} />
              </Pressable>
            )}
          </View>
          {catalogResults.length === 0 ? (
            <Text style={[s.emptyText, { color: colors.textMuted }]}>
              {t('asNoServicesFound')}
            </Text>
          ) : (
            catalogResults.map((sv) => (
              <CatalogServiceRow
                key={sv.id}
                service={sv}
                onAdd={() => handleAddService(sv)}
                colors={colors}
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* Sticky save button */}
      <View style={[s.bottomBar, { backgroundColor: colors.cream, borderTopColor: colors.border }]}>
        <Pressable
          style={[s.saveBtn, { backgroundColor: colors.gold }]}
          onPress={handleSave}
        >
          <Feather name="check" size={16} color={colors.goldButtonText} />
          <Text style={[s.saveBtnText, { color: colors.goldButtonText }]}>
            {t('asSaveChanges')}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ────────────────────────────────────────────

const s = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 17,
    fontFamily: 'Jost_600SemiBold',
  },
  clientBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: spacing.base,
    marginTop: spacing.base,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    borderRadius: radii.md,
  },
  clientName: {
    fontSize: 15,
    fontFamily: 'Jost_500Medium',
    flex: 1,
  },
  clientTime: {
    fontSize: 12,
    fontFamily: 'Jost_400Regular',
  },
  sectionBlock: {
    paddingHorizontal: spacing.base,
    marginTop: spacing.lg,
  },
  sectionTitle: {
    fontSize: 10,
    fontFamily: 'Jost_500Medium',
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: spacing.md,
  },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    marginBottom: spacing.sm,
  },
  serviceName: {
    fontSize: 14,
    fontFamily: 'Jost_500Medium',
  },
  servicePrice: {
    fontSize: 13,
    fontFamily: 'Jost_400Regular',
    marginTop: 2,
  },
  removeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.md,
    marginTop: spacing.xs,
    borderTopWidth: 1,
  },
  totalLabel: {
    fontSize: 14,
    fontFamily: 'Jost_500Medium',
  },
  totalValue: {
    fontSize: 16,
    fontFamily: 'Jost_600SemiBold',
  },
  timeAdjustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
  },
  timeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeLabelWrap: {
    alignItems: 'center',
  },
  timeValue: {
    fontSize: 18,
    fontFamily: 'Jost_600SemiBold',
  },
  timeOffset: {
    fontSize: 12,
    fontFamily: 'Jost_500Medium',
    marginTop: 2,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: spacing.md,
    height: 44,
    borderRadius: radii.md,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Jost_400Regular',
  },
  catalogRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    marginBottom: spacing.sm,
  },
  catalogMeta: {
    fontSize: 12,
    fontFamily: 'Jost_400Regular',
    marginTop: 2,
  },
  addBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Jost_400Regular',
    textAlign: 'center',
    paddingVertical: spacing.xl,
  },
  bottomBar: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    borderTopWidth: 1,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 50,
    borderRadius: radii.pill,
  },
  saveBtnText: {
    fontSize: 15,
    fontFamily: 'Jost_600SemiBold',
  },
});
