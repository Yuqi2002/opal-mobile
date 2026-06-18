import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../../../src/contexts/ThemeContext';
import { useTranslation } from '../../../../src/contexts/I18nContext';
import { Avatar } from '../../../../src/components/Avatar';
import { StatusBadge } from '../../../../src/components/StatusBadge';
import { STAFF } from '../../../../src/data/staff';
import { SERVICES } from '../../../../src/data/services';

const DAY_LABELS: Record<string, string> = {
  mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun',
};

export default function StaffDetailScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const staff = STAFF.find((s) => s.id === id);
  if (!staff) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.cream }]} edges={['top']}>
        <View style={styles.empty}>
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>Staff not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const staffServices = SERVICES.filter((s) => staff.services.includes(s.id));

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.cream }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Feather name="arrow-left" size={22} color={colors.obsidian} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.obsidian }]}>Staff Detail</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
        {/* Profile card */}
        <View style={[styles.profileCard, { backgroundColor: colors.warmWhite }]}>
          <Avatar initials={staff.initials} gold={staff.gold} size="profile" />
          <Text style={[styles.name, { color: colors.obsidian }]}>
            {staff.first} {staff.last}
          </Text>
          <StatusBadge status={staff.status === 'active' ? 'active' : 'inactive'} label={staff.role} />
          {staff.bio && (
            <Text style={[styles.bio, { color: colors.textMuted }]}>{staff.bio}</Text>
          )}
        </View>

        {/* Contact */}
        <View style={[styles.section, { backgroundColor: colors.warmWhite }]}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>CONTACT</Text>
          <View style={styles.infoRow}>
            <Feather name="phone" size={16} color={colors.textMuted} />
            <Text style={[styles.infoText, { color: colors.obsidian }]}>{staff.phone}</Text>
          </View>
          <View style={styles.infoRow}>
            <Feather name="mail" size={16} color={colors.textMuted} />
            <Text style={[styles.infoText, { color: colors.obsidian }]}>{staff.email}</Text>
          </View>
        </View>

        {/* Schedule */}
        <View style={[styles.section, { backgroundColor: colors.warmWhite }]}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>SCHEDULE</Text>
          <Text style={[styles.infoText, { color: colors.obsidian }]}>
            {staff.shift} · {staff.days}
          </Text>
          <View style={styles.dayChips}>
            {Object.entries(staff.schedule).map(([day, sched]) => (
              <View
                key={day}
                style={[
                  styles.dayChip,
                  {
                    backgroundColor: sched.off ? colors.creamDark : colors.gold,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.dayChipText,
                    { color: sched.off ? colors.textFaint : '#FFFFFF' },
                  ]}
                >
                  {DAY_LABELS[day]}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Compensation */}
        <View style={[styles.section, { backgroundColor: colors.warmWhite }]}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>COMPENSATION</Text>
          <Text style={[styles.infoText, { color: colors.obsidian }]}>
            {staff.compensationType === 'commission'
              ? `${staff.commissionRate}% Commission`
              : `$${staff.hourlyRate}/hr`}
          </Text>
        </View>

        {/* Services */}
        {staffServices.length > 0 && (
          <View style={[styles.section, { backgroundColor: colors.warmWhite }]}>
            <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>
              SERVICES ({staffServices.length})
            </Text>
            <View style={styles.serviceTags}>
              {staffServices.map((svc) => (
                <View key={svc.id} style={[styles.serviceTag, { backgroundColor: colors.creamDark }]}>
                  <Text style={[styles.serviceTagText, { color: colors.obsidian }]}>{svc.name}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Stats */}
        {staff.rating != null && (
          <View style={[styles.section, { backgroundColor: colors.warmWhite }]}>
            <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>PERFORMANCE</Text>
            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Text style={[styles.statValue, { color: colors.obsidian }]}>{staff.rating}</Text>
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>Rating</Text>
              </View>
              <View style={styles.stat}>
                <Text style={[styles.statValue, { color: colors.obsidian }]}>{staff.clients}</Text>
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>Clients</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
  },
  headerTitle: { fontSize: 18, fontFamily: 'Jost_500Medium' },
  body: { flex: 1 },
  bodyContent: { padding: 16, gap: 12 },
  profileCard: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 14,
    gap: 8,
  },
  name: { fontSize: 20, fontFamily: 'Jost_600SemiBold', marginTop: 8 },
  bio: { fontSize: 13, fontFamily: 'Jost_400Regular', textAlign: 'center', marginTop: 4 },
  section: { borderRadius: 14, padding: 16, gap: 10 },
  sectionTitle: {
    fontSize: 10,
    fontFamily: 'Jost_500Medium',
    letterSpacing: 2,
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  infoText: { fontSize: 14, fontFamily: 'Jost_400Regular' },
  dayChips: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  dayChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  dayChipText: { fontSize: 12, fontFamily: 'Jost_500Medium' },
  serviceTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  serviceTag: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  serviceTagText: { fontSize: 12, fontFamily: 'Jost_400Regular' },
  statsRow: { flexDirection: 'row', gap: 32 },
  stat: { alignItems: 'center', gap: 2 },
  statValue: { fontSize: 22, fontFamily: 'Jost_600SemiBold' },
  statLabel: { fontSize: 11, fontFamily: 'Jost_400Regular' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: 16, fontFamily: 'Jost_500Medium' },
});
