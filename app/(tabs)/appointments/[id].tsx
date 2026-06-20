import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '../../../src/contexts/ThemeContext';
import { useTranslation } from '../../../src/contexts/I18nContext';
import { getAppointments } from '../../../src/data/appointments';
import { CALENDAR_STAFF } from '../../../src/data/staff';
import { APPT_TYPES } from '../../../src/data/services';
import { fmtTime, formatDateFull } from '../../../src/utils/time';
import { fmtCurrency } from '../../../src/utils/currency';
import { Avatar } from '../../../src/components/Avatar';
import { StatusBadge } from '../../../src/components/StatusBadge';
import { shadows } from '../../../src/theme/tokens';
import type { Appointment } from '../../../src/types/models';

const STAFF_MAP: Record<string, (typeof CALENDAR_STAFF)[number]> = {};
CALENDAR_STAFF.forEach((s) => {
  STAFF_MAP[s.id] = s;
});

const APPT_TYPE_MAP: Record<string, string> = {};
APPT_TYPES.forEach((a) => {
  APPT_TYPE_MAP[a.key] = a.label;
});

function DetailRow({
  label,
  value,
  children,
}: {
  label: string;
  value?: string;
  children?: React.ReactNode;
}) {
  const { colors } = useTheme();
  return (
    <View style={s.detailRow}>
      <Text style={[s.detailLabel, { color: colors.textMuted }]}>{label}</Text>
      {children ?? (
        <Text style={[s.detailValue, { color: colors.obsidian }]}>{value}</Text>
      )}
    </View>
  );
}

export default function AppointmentDetailScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  // Parse the appointment ID to extract the date key
  // Format: apt_storeId_YYYY-MM-DD_N (new) or apt_YYYY-MM-DD_N (legacy/added)
  const appointment = useMemo<Appointment | null>(() => {
    if (!id) return null;
    const parts = id.split('_');
    if (parts.length < 3) return null;
    // Try to find a date part (YYYY-MM-DD pattern)
    const datePart = parts.find((p) => /^\d{4}-\d{2}-\d{2}$/.test(p));
    if (!datePart) return null;
    const allAppts = getAppointments(datePart);
    return allAppts.find((a) => a.id === id) ?? null;
  }, [id]);

  if (!appointment) {
    return (
      <SafeAreaView style={[s.safe, { backgroundColor: colors.cream }]}>
        <View style={s.navBar}>
          <Pressable onPress={() => router.back()} style={s.backBtn}>
            <Feather name="chevron-left" size={24} color={colors.obsidian} />
          </Pressable>
          <Text style={[s.navTitle, { color: colors.obsidian }]}>{t('apptDetail')}</Text>
          <View style={s.backBtn} />
        </View>
        <View style={s.notFoundContainer}>
          <Feather name="alert-circle" size={48} color={colors.textFaint} />
          <Text style={[s.notFoundText, { color: colors.textMuted }]}>
            Appointment not found
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const tech = STAFF_MAP[appointment.staffId];
  const durationMins = appointment.endMin - appointment.startMin;
  const apptDate = new Date(appointment.date + 'T00:00:00');

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: colors.cream }]} edges={['top']}>
      {/* Navigation Bar */}
      <View style={s.navBar}>
        <Pressable onPress={() => router.back()} style={s.backBtn}>
          <Feather name="chevron-left" size={24} color={colors.obsidian} />
        </Pressable>
        <Text style={[s.navTitle, { color: colors.obsidian }]}>{t('apptDetail')}</Text>
        <View style={s.backBtn} />
      </View>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Status + Ticket header */}
        <View style={s.statusHeader}>
          <StatusBadge status={appointment.status} />
          <Text style={[s.ticketNum, { color: colors.textMuted }]}>
            #{appointment.apptNum}
          </Text>
        </View>

        {/* Client section */}
        <View style={[s.section, { backgroundColor: colors.warmWhite }, shadows.card]}>
          <View style={s.sectionHeaderRow}>
            <Feather name="user" size={16} color={colors.goldDeep} />
            <Text style={[s.sectionTitle, { color: colors.obsidian }]}>Client</Text>
          </View>
          <Text style={[s.clientName, { color: colors.obsidian }]}>{appointment.client}</Text>
          {appointment.vip && (
            <View style={{ marginTop: 6 }}>
              <StatusBadge status="vip" />
            </View>
          )}
        </View>

        {/* Details section */}
        <View style={[s.section, { backgroundColor: colors.warmWhite }, shadows.card]}>
          <View style={s.sectionHeaderRow}>
            <Feather name="info" size={16} color={colors.goldDeep} />
            <Text style={[s.sectionTitle, { color: colors.obsidian }]}>Details</Text>
          </View>

          <DetailRow label={t('apptDate')} value={formatDateFull(apptDate)} />
          <DetailRow
            label={t('apptTime')}
            value={`${fmtTime(appointment.startMin)} - ${fmtTime(appointment.endMin)}`}
          />
          <DetailRow label={t('apptDuration')} value={`${durationMins} ${t('mins')}`} />
          <DetailRow label={t('apptType')} value={APPT_TYPE_MAP[appointment.apptType] ?? appointment.apptType} />
          <DetailRow label={t('apptStatus')}>
            <StatusBadge status={appointment.status} />
          </DetailRow>
        </View>

        {/* Services section */}
        <View style={[s.section, { backgroundColor: colors.warmWhite }, shadows.card]}>
          <View style={s.sectionHeaderRow}>
            <Feather name="scissors" size={16} color={colors.goldDeep} />
            <Text style={[s.sectionTitle, { color: colors.obsidian }]}>{t('apptServices')}</Text>
          </View>

          {appointment.services && appointment.services.length > 0 ? (
            appointment.services.map((svc, i) => {
              const svcTech = STAFF_MAP[svc.techId];
              return (
                <View
                  key={i}
                  style={[
                    s.serviceItem,
                    i < appointment.services!.length - 1 && {
                      borderBottomWidth: 1,
                      borderBottomColor: colors.border,
                    },
                  ]}
                >
                  <View style={s.serviceItemTop}>
                    <Text style={[s.serviceName, { color: colors.obsidian }]}>{svc.name}</Text>
                    <Text style={[s.servicePrice, { color: colors.obsidian }]}>
                      {fmtCurrency(svc.price)}
                    </Text>
                  </View>
                  <View style={s.serviceItemBottom}>
                    {svcTech && (
                      <View style={s.svcTechRow}>
                        <Avatar initials={svcTech.initials} gold={svcTech.gold} size="compact" />
                        <Text style={[s.svcTechName, { color: colors.textMuted }]}>
                          {svcTech.first}
                        </Text>
                      </View>
                    )}
                    <Text style={[s.svcDuration, { color: colors.textFaint }]}>
                      {svc.mins} {t('mins')}
                    </Text>
                  </View>
                </View>
              );
            })
          ) : (
            // Single service appointment
            <View style={s.serviceItem}>
              <View style={s.serviceItemTop}>
                <Text style={[s.serviceName, { color: colors.obsidian }]}>
                  {appointment.service}
                </Text>
                <Text style={[s.servicePrice, { color: colors.obsidian }]}>
                  {fmtCurrency(appointment.price)}
                </Text>
              </View>
              <View style={s.serviceItemBottom}>
                {tech && (
                  <View style={s.svcTechRow}>
                    <Avatar initials={tech.initials} gold={tech.gold} size="compact" />
                    <Text style={[s.svcTechName, { color: colors.textMuted }]}>
                      {tech.first} {tech.last}
                    </Text>
                  </View>
                )}
                <Text style={[s.svcDuration, { color: colors.textFaint }]}>
                  {durationMins} {t('mins')}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Technician section */}
        {tech && (
          <View style={[s.section, { backgroundColor: colors.warmWhite }, shadows.card]}>
            <View style={s.sectionHeaderRow}>
              <Feather name="users" size={16} color={colors.goldDeep} />
              <Text style={[s.sectionTitle, { color: colors.obsidian }]}>{t('bkTechnician')}</Text>
            </View>
            <View style={s.techProfile}>
              <Avatar initials={tech.initials} gold={tech.gold} size="card" />
              <View style={s.techInfo}>
                <Text style={[s.techName, { color: colors.obsidian }]}>
                  {tech.first} {tech.last}
                </Text>
                <Text style={[s.techRole, { color: colors.textMuted }]}>{tech.role}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Notes section */}
        {appointment.notes && (
          <View style={[s.section, { backgroundColor: colors.warmWhite }, shadows.card]}>
            <View style={s.sectionHeaderRow}>
              <Feather name="file-text" size={16} color={colors.goldDeep} />
              <Text style={[s.sectionTitle, { color: colors.obsidian }]}>{t('apptNotes')}</Text>
            </View>
            <Text style={[s.notesText, { color: colors.charcoal }]}>{appointment.notes}</Text>
          </View>
        )}

        {/* Total */}
        <View style={[s.totalSection, { borderTopColor: colors.border }]}>
          <Text style={[s.totalLabel, { color: colors.textMuted }]}>{t('apptTotal')}</Text>
          <Text style={[s.totalValue, { color: colors.obsidian }]}>
            {fmtCurrency(appointment.price)}
          </Text>
        </View>

        <View style={s.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTitle: {
    fontSize: 16,
    fontFamily: 'Jost_500Medium',
  },
  scroll: { flex: 1 },

  // Status header
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  ticketNum: {
    fontSize: 13,
    fontFamily: 'Jost_400Regular',
  },

  // Sections
  section: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 14,
    padding: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'Jost_500Medium',
  },

  // Client
  clientName: {
    fontSize: 18,
    fontFamily: 'Jost_500Medium',
  },

  // Detail rows
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  detailLabel: {
    fontSize: 13,
    fontFamily: 'Jost_400Regular',
  },
  detailValue: {
    fontSize: 14,
    fontFamily: 'Jost_500Medium',
  },

  // Services
  serviceItem: {
    paddingVertical: 10,
  },
  serviceItemTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  serviceName: {
    fontSize: 14,
    fontFamily: 'Jost_500Medium',
    flex: 1,
  },
  servicePrice: {
    fontSize: 14,
    fontFamily: 'Jost_500Medium',
    marginLeft: 12,
  },
  serviceItemBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  svcTechRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  svcTechName: {
    fontSize: 12,
    fontFamily: 'Jost_400Regular',
  },
  svcDuration: {
    fontSize: 12,
    fontFamily: 'Jost_400Regular',
  },

  // Tech profile
  techProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  techInfo: {
    gap: 2,
  },
  techName: {
    fontSize: 15,
    fontFamily: 'Jost_500Medium',
  },
  techRole: {
    fontSize: 12,
    fontFamily: 'Jost_400Regular',
  },

  // Notes
  notesText: {
    fontSize: 14,
    fontFamily: 'Jost_400Regular',
    lineHeight: 20,
  },

  // Total
  totalSection: {
    marginHorizontal: 16,
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 14,
    fontFamily: 'Jost_500Medium',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  totalValue: {
    fontSize: 22,
    fontFamily: 'Jost_600SemiBold',
  },

  // Not found
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  notFoundText: {
    fontSize: 16,
    fontFamily: 'Jost_500Medium',
  },

  bottomSpacer: { height: 40 },
});
