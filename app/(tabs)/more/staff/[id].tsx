import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../../../src/contexts/ThemeContext';
import { useTranslation } from '../../../../src/contexts/I18nContext';
import { useAuth } from '../../../../src/contexts/AuthContext';
import { canManageStaff } from '../../../../src/utils/permissions';
import { Avatar } from '../../../../src/components/Avatar';
import { StatusBadge } from '../../../../src/components/StatusBadge';
import { FilterChips } from '../../../../src/components/FilterChips';
import { STAFF } from '../../../../src/data/staff';
import { SERVICES, ROLES } from '../../../../src/data/services';
import type { RoleId, CompensationType, WeekSchedule, Staff } from '../../../../src/types/models';

// ─── Constants ────────────────────────────────────────────

const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;
const DAY_LABELS: Record<string, string> = {
  mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun',
};

const COMP_OPTIONS: { key: CompensationType; label: string }[] = [
  { key: 'commission', label: 'Commission' },
  { key: 'hourly', label: 'Hourly' },
  { key: 'both', label: 'Both' },
];

const STATUS_OPTIONS: { key: Staff['status']; label: string }[] = [
  { key: 'active', label: 'Active' },
  { key: 'inactive', label: 'Inactive' },
  { key: 'invited', label: 'Invited' },
];

function makeTimeOptions() {
  const opts: { val: string; label: string }[] = [];
  for (let h = 6; h <= 23; h++) {
    for (let m = 0; m < 60; m += 30) {
      const val = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      const hr = h > 12 ? h - 12 : h === 0 ? 12 : h;
      const mer = h >= 12 ? 'PM' : 'AM';
      const label = `${hr}:${String(m).padStart(2, '0')} ${mer}`;
      opts.push({ val, label });
    }
  }
  return opts;
}
const TIME_OPTIONS = makeTimeOptions();

function defaultSchedule(): WeekSchedule {
  const s: any = {};
  DAYS.forEach((d) => { s[d] = { off: true, start: '', end: '' }; });
  return s;
}

// ─── Service categories ──────────────────────────────────

function getServiceCategories() {
  const map = new Map<string, typeof SERVICES>();
  SERVICES.forEach((s) => {
    if (!map.has(s.category)) map.set(s.category, []);
    map.get(s.category)!.push(s);
  });
  return [...map.entries()].map(([name, services]) => ({ name, services }));
}

// ═══════════════════════════════════════════════════════════
//  Main Screen
// ═══════════════════════════════════════════════════════════

export default function StaffDetailScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();

  const staff = useMemo(() => STAFF.find((s) => s.id === id), [id]);
  const isNew = id === 'new';
  const hasEditPermission = user ? canManageStaff(user.role) : false;

  const empty: Staff = {
    id: `staff_${Date.now()}`,
    first: '', last: '', initials: '??',
    role: 'Staff', roleIds: ['r04'],
    phone: '', email: '',
    shift: '', days: '',
    status: 'invited',
    gold: false, rating: null, clients: null,
    bio: '',
    services: [],
    schedule: defaultSchedule(),
    compensationType: 'commission',
    commissionRate: 50, hourlyRate: null,
    storeId: user?.primaryStore ?? 'store_wv',
  };

  const initial = isNew ? empty : staff;

  if (!initial) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.cream }]} edges={['top']}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Feather name="chevron-left" size={24} color={colors.obsidian} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.obsidian }]}>Staff</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.center}>
          <Text style={[styles.notFound, { color: colors.textMuted }]}>Staff not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ─── Read-only view for users without permission ───────
  if (!hasEditPermission && !isNew) {
    return <ReadOnlyView staff={initial} colors={colors} t={t} router={router} />;
  }

  return <StaffForm staff={initial} isNew={isNew} colors={colors} t={t} router={router} />;
}

// ═══════════════════════════════════════════════════════════
//  Read-only view (same as original)
// ═══════════════════════════════════════════════════════════

function ReadOnlyView({ staff, colors, t, router }: { staff: Staff; colors: any; t: any; router: any }) {
  const staffServices = SERVICES.filter((s) => staff.services.includes(s.id));

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.cream }]} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Feather name="chevron-left" size={24} color={colors.obsidian} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.obsidian }]}>Staff Detail</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.readOnlyContent}>
        <View style={[styles.profileCard, { backgroundColor: colors.warmWhite }]}>
          <Avatar initials={staff.initials} gold={staff.gold} size="profile" />
          <Text style={[styles.profileName, { color: colors.obsidian }]}>
            {staff.first} {staff.last}
          </Text>
          <StatusBadge status={staff.status} label={staff.role} />
          {staff.bio ? (
            <Text style={[styles.profileBio, { color: colors.textMuted }]}>{staff.bio}</Text>
          ) : null}
        </View>

        <View style={[styles.roSection, { backgroundColor: colors.warmWhite }]}>
          <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>CONTACT</Text>
          <View style={styles.infoRow}>
            <Feather name="phone" size={16} color={colors.textMuted} />
            <Text style={[styles.infoText, { color: colors.obsidian }]}>{staff.phone}</Text>
          </View>
          <View style={styles.infoRow}>
            <Feather name="mail" size={16} color={colors.textMuted} />
            <Text style={[styles.infoText, { color: colors.obsidian }]}>{staff.email}</Text>
          </View>
        </View>

        <View style={[styles.roSection, { backgroundColor: colors.warmWhite }]}>
          <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>SCHEDULE</Text>
          <Text style={[styles.infoText, { color: colors.obsidian }]}>
            {staff.shift} · {staff.days}
          </Text>
          <View style={styles.dayChips}>
            {Object.entries(staff.schedule).map(([day, sched]) => (
              <View
                key={day}
                style={[styles.dayChipRO, { backgroundColor: sched.off ? colors.creamDark : colors.gold }]}
              >
                <Text style={[styles.dayChipTextRO, { color: sched.off ? colors.textFaint : '#FFFFFF' }]}>
                  {DAY_LABELS[day]}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.roSection, { backgroundColor: colors.warmWhite }]}>
          <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>COMPENSATION</Text>
          <Text style={[styles.infoText, { color: colors.obsidian }]}>
            {staff.compensationType === 'commission'
              ? `${staff.commissionRate}% Commission`
              : staff.compensationType === 'hourly'
              ? `$${staff.hourlyRate}/hr`
              : `${staff.commissionRate}% + $${staff.hourlyRate}/hr`}
          </Text>
        </View>

        {staffServices.length > 0 && (
          <View style={[styles.roSection, { backgroundColor: colors.warmWhite }]}>
            <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
              SERVICES ({staffServices.length})
            </Text>
            <View style={styles.serviceTags}>
              {staffServices.map((svc) => (
                <View key={svc.id} style={[styles.serviceTagRO, { backgroundColor: colors.creamDark }]}>
                  <Text style={[styles.serviceTagTextRO, { color: colors.obsidian }]}>{svc.name}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {staff.rating != null && (
          <View style={[styles.roSection, { backgroundColor: colors.warmWhite }]}>
            <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>PERFORMANCE</Text>
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

// ═══════════════════════════════════════════════════════════
//  Editable Staff Form
// ═══════════════════════════════════════════════════════════

function StaffForm({ staff, isNew, colors, t, router }: {
  staff: Staff; isNew: boolean; colors: any; t: any; router: any;
}) {
  // ─── Form state ─────────────────────────────────────────
  const [first, setFirst] = useState(staff.first);
  const [last, setLast] = useState(staff.last);
  const [phone, setPhone] = useState(staff.phone);
  const [email, setEmail] = useState(staff.email);
  const [bio, setBio] = useState(staff.bio);
  const [roleIds, setRoleIds] = useState<RoleId[]>([...staff.roleIds]);
  const [status, setStatus] = useState<Staff['status']>(staff.status);
  const [compensationType, setCompensationType] = useState<CompensationType>(staff.compensationType);
  const [commissionRate, setCommissionRate] = useState(staff.commissionRate != null ? String(staff.commissionRate) : '');
  const [hourlyRate, setHourlyRate] = useState(staff.hourlyRate != null ? String(staff.hourlyRate) : '');
  const [schedule, setSchedule] = useState<WeekSchedule>({ ...staff.schedule });
  const [selectedServices, setSelectedServices] = useState<Set<string>>(new Set(staff.services));
  const [serviceSearch, setServiceSearch] = useState('');
  const [durationOverrides, setDurationOverrides] = useState<Record<string, number>>({});

  const categories = useMemo(getServiceCategories, []);

  const filteredCategories = useMemo(() => {
    const q = serviceSearch.trim().toLowerCase();
    if (!q) return categories;
    return categories
      .map((cat) => ({ ...cat, services: cat.services.filter((s) => s.name.toLowerCase().includes(q)) }))
      .filter((cat) => cat.services.length > 0);
  }, [categories, serviceSearch]);

  // ─── Helpers ────────────────────────────────────────────

  function toggleRole(rid: RoleId) {
    setRoleIds((prev) => {
      if (prev.includes(rid)) return prev.filter((r) => r !== rid);
      return [...prev, rid];
    });
  }

  function setDayField(day: string, key: 'off' | 'start' | 'end', val: any) {
    setSchedule((prev) => ({
      ...prev,
      [day]: { ...prev[day as keyof WeekSchedule], [key]: val },
    }));
  }

  function applyToAllDays() {
    const src = DAYS.find((d) => !schedule[d].off);
    if (!src) return;
    const ref = schedule[src];
    const next: any = {};
    DAYS.forEach((d) => { next[d] = { off: false, start: ref.start, end: ref.end }; });
    setSchedule(next);
  }

  function toggleService(svcId: string) {
    setSelectedServices((prev) => {
      const next = new Set(prev);
      if (next.has(svcId)) {
        next.delete(svcId);
        setDurationOverrides((d) => { const n = { ...d }; delete n[svcId]; return n; });
      } else {
        next.add(svcId);
      }
      return next;
    });
  }

  function setDurationFromText(svcId: string, text: string) {
    const num = parseInt(text, 10);
    if (!isNaN(num) && num > 0) {
      setDurationOverrides((prev) => ({ ...prev, [svcId]: num }));
    }
  }

  function toggleCategoryServices(svcIds: string[]) {
    setSelectedServices((prev) => {
      const next = new Set(prev);
      const allOn = svcIds.every((id) => next.has(id));
      svcIds.forEach((id) => (allOn ? next.delete(id) : next.add(id)));
      return next;
    });
  }

  function selectAllServices() {
    setSelectedServices(new Set(SERVICES.map((s) => s.id)));
  }

  function clearAllServices() {
    setSelectedServices(new Set());
  }

  // ─── Validate & Save ───────────────────────────────────

  function handleSave() {
    if (!first.trim()) return Alert.alert('Validation', 'First name is required');
    if (!last.trim()) return Alert.alert('Validation', 'Last name is required');
    if (!phone.trim()) return Alert.alert('Validation', 'Phone is required');
    if (!email.trim()) return Alert.alert('Validation', 'Email is required');
    if (roleIds.length === 0) return Alert.alert('Validation', 'At least one role is required');
    const hasWorkDay = DAYS.some((d) => !schedule[d].off && schedule[d].start && schedule[d].end);
    if (!hasWorkDay) return Alert.alert('Validation', 'At least one working day is required');
    if ((compensationType === 'commission' || compensationType === 'both') && !commissionRate)
      return Alert.alert('Validation', 'Commission rate is required');
    if ((compensationType === 'hourly' || compensationType === 'both') && !hourlyRate)
      return Alert.alert('Validation', 'Hourly rate is required');

    if (isNew) {
      Alert.alert(t('save'), `Invite sent to ${email || 'staff member'} (mock)`, [{ text: t('done') }]);
    } else {
      Alert.alert(t('save'), 'Changes saved (mock)', [{ text: t('done') }]);
    }
    router.back();
  }

  function handleDelete() {
    Alert.alert(
      'Delete Staff',
      `Are you sure you want to delete ${first} ${last}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => {
          Alert.alert('Deleted', 'Staff member deleted (mock)');
          router.back();
        }},
      ],
    );
  }

  // ─── Time picker helper ─────────────────────────────────

  function TimePicker({ value, onChange, disabled }: { value: string; onChange: (v: string) => void; disabled: boolean }) {
    const [open, setOpen] = useState(false);

    if (disabled) {
      return (
        <View style={[styles.timePicker, { backgroundColor: colors.creamDark, opacity: 0.5 }]}>
          <Text style={[styles.timePickerText, { color: colors.textFaint }]}>--:--</Text>
        </View>
      );
    }

    const selected = TIME_OPTIONS.find((o) => o.val === value);

    return (
      <View>
        <Pressable
          style={[styles.timePicker, { backgroundColor: colors.creamDark }]}
          onPress={() => setOpen(!open)}
        >
          <Text style={[styles.timePickerText, { color: value ? colors.obsidian : colors.textFaint }]}>
            {selected?.label ?? 'Select'}
          </Text>
          <Feather name={open ? 'chevron-up' : 'chevron-down'} size={14} color={colors.textMuted} />
        </Pressable>
        {open && (
          <ScrollView
            style={[styles.timeDropdown, { backgroundColor: colors.warmWhite, borderColor: colors.border }]}
            nestedScrollEnabled
          >
            {TIME_OPTIONS.map((opt) => (
              <Pressable
                key={opt.val}
                style={[
                  styles.timeOption,
                  opt.val === value && { backgroundColor: colors.goldSoft },
                ]}
                onPress={() => { onChange(opt.val); setOpen(false); }}
              >
                <Text style={[styles.timeOptionText, {
                  color: opt.val === value ? colors.goldDeep : colors.obsidian,
                  fontFamily: opt.val === value ? 'Jost_500Medium' : 'Jost_400Regular',
                }]}>
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        )}
      </View>
    );
  }

  // ─── Render ─────────────────────────────────────────────

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.cream }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Feather name="chevron-left" size={24} color={colors.obsidian} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.obsidian }]}>
          {isNew ? 'New Staff' : `${staff.first} ${staff.last}`}
        </Text>
        {!isNew ? (
          <Pressable onPress={handleDelete} hitSlop={8}>
            <Feather name="trash-2" size={20} color={colors.statusCancelledText} />
          </Pressable>
        ) : (
          <View style={{ width: 24 }} />
        )}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Contact ──────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>CONTACT</Text>

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

          <Text style={[styles.fieldLabel, { color: colors.charcoal }]}>Phone</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.creamDark, color: colors.obsidian }]}
            value={phone}
            onChangeText={setPhone}
            placeholder="(212) 555-0000"
            placeholderTextColor={colors.textFaint}
            keyboardType="phone-pad"
          />

          <Text style={[styles.fieldLabel, { color: colors.charcoal }]}>Email</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.creamDark, color: colors.obsidian }]}
            value={email}
            onChangeText={setEmail}
            placeholder="name@opal.salon"
            placeholderTextColor={colors.textFaint}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* ── Role ─────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>ROLE</Text>
          <View style={styles.roleChips}>
            {ROLES.map((r) => {
              const active = roleIds.includes(r.id);
              return (
                <Pressable
                  key={r.id}
                  onPress={() => toggleRole(r.id)}
                  style={[
                    styles.roleChip,
                    {
                      borderColor: active ? r.color : colors.border,
                      backgroundColor: active ? `${r.color}14` : 'transparent',
                    },
                  ]}
                >
                  <View style={[styles.roleDot, { backgroundColor: active ? r.color : colors.borderStrong }]} />
                  <Text style={[styles.roleChipText, { color: active ? r.color : colors.textMuted }]}>
                    {r.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* ── Status (edit only) ───────────────────────── */}
        {!isNew && (
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>STATUS</Text>
            <View style={styles.roleChips}>
              {STATUS_OPTIONS.map((opt) => {
                const active = status === opt.key;
                return (
                  <Pressable
                    key={opt.key}
                    onPress={() => setStatus(opt.key)}
                    style={[
                      styles.roleChip,
                      {
                        borderColor: active ? colors.gold : colors.border,
                        backgroundColor: active ? colors.goldSoft : 'transparent',
                      },
                    ]}
                  >
                    <Text style={[styles.roleChipText, { color: active ? colors.goldDeep : colors.textMuted }]}>
                      {opt.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        {/* ── Bio ──────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>BIO</Text>
          <TextInput
            style={[styles.input, styles.textArea, { backgroundColor: colors.creamDark, color: colors.obsidian }]}
            value={bio}
            onChangeText={setBio}
            placeholder="Specialisation, experience..."
            placeholderTextColor={colors.textFaint}
            multiline
            textAlignVertical="top"
          />
        </View>

        {/* ── Compensation ─────────────────────────────── */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>COMPENSATION</Text>

          <View style={styles.roleChips}>
            {COMP_OPTIONS.map((opt) => {
              const active = compensationType === opt.key;
              return (
                <Pressable
                  key={opt.key}
                  onPress={() => setCompensationType(opt.key)}
                  style={[
                    styles.roleChip,
                    {
                      borderColor: active ? colors.gold : colors.border,
                      backgroundColor: active ? colors.goldSoft : 'transparent',
                    },
                  ]}
                >
                  <Text style={[styles.roleChipText, { color: active ? colors.goldDeep : colors.textMuted }]}>
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {(compensationType === 'commission' || compensationType === 'both') && (
            <>
              <Text style={[styles.fieldLabel, { color: colors.charcoal }]}>Commission Rate (%)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.creamDark, color: colors.obsidian, width: 120 }]}
                value={commissionRate}
                onChangeText={setCommissionRate}
                placeholder="50"
                placeholderTextColor={colors.textFaint}
                keyboardType="number-pad"
              />
            </>
          )}

          {(compensationType === 'hourly' || compensationType === 'both') && (
            <>
              <Text style={[styles.fieldLabel, { color: colors.charcoal }]}>Hourly Rate ($)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.creamDark, color: colors.obsidian, width: 120 }]}
                value={hourlyRate}
                onChangeText={setHourlyRate}
                placeholder="18.00"
                placeholderTextColor={colors.textFaint}
                keyboardType="decimal-pad"
              />
            </>
          )}
        </View>

        {/* ── Schedule ─────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>SCHEDULE</Text>

          {DAYS.map((d) => {
            const day = schedule[d];
            return (
              <View key={d} style={[styles.schedRow, day.off && { opacity: 0.5 }]}>
                <Text style={[styles.schedDayLabel, { color: colors.obsidian }]}>{DAY_LABELS[d]}</Text>
                <Switch
                  value={!day.off}
                  onValueChange={(v) => setDayField(d, 'off', !v)}
                  trackColor={{ false: colors.creamDark, true: colors.gold }}
                  thumbColor="#FFFFFF"
                  style={styles.schedSwitch}
                />
                <View style={styles.schedTimes}>
                  <TimePicker
                    value={day.start}
                    onChange={(v) => setDayField(d, 'start', v)}
                    disabled={day.off}
                  />
                  <Text style={[styles.schedDash, { color: colors.textMuted }]}>–</Text>
                  <TimePicker
                    value={day.end}
                    onChange={(v) => setDayField(d, 'end', v)}
                    disabled={day.off}
                  />
                </View>
              </View>
            );
          })}

          <Pressable
            style={[styles.applyAllBtn, { borderColor: colors.border }]}
            onPress={applyToAllDays}
          >
            <Feather name="copy" size={14} color={colors.textMuted} />
            <Text style={[styles.applyAllText, { color: colors.textMuted }]}>Apply to all days</Text>
          </Pressable>
        </View>

        {/* ── Services ─────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
            SERVICES ({selectedServices.size} of {SERVICES.length})
          </Text>

          {/* Search + bulk actions */}
          <View style={[styles.svcSearchRow, { backgroundColor: colors.creamDark }]}>
            <Feather name="search" size={16} color={colors.textFaint} />
            <TextInput
              style={[styles.svcSearchInput, { color: colors.obsidian }]}
              value={serviceSearch}
              onChangeText={setServiceSearch}
              placeholder="Search services..."
              placeholderTextColor={colors.textFaint}
            />
            {serviceSearch ? (
              <Pressable onPress={() => setServiceSearch('')} hitSlop={8}>
                <Feather name="x" size={16} color={colors.textMuted} />
              </Pressable>
            ) : null}
          </View>

          <View style={styles.svcBulkRow}>
            <Pressable onPress={selectAllServices}>
              <Text style={[styles.svcBulkText, { color: colors.goldDeep }]}>Select All</Text>
            </Pressable>
            <Pressable onPress={clearAllServices}>
              <Text style={[styles.svcBulkText, { color: colors.textMuted }]}>Clear</Text>
            </Pressable>
          </View>

          {/* Category groups */}
          {filteredCategories.length === 0 ? (
            <Text style={[styles.svcEmpty, { color: colors.textMuted }]}>
              No services match "{serviceSearch}"
            </Text>
          ) : (
            filteredCategories.map((cat) => {
              const catIds = cat.services.map((s) => s.id);
              const allOn = catIds.every((id) => selectedServices.has(id));
              const someOn = !allOn && catIds.some((id) => selectedServices.has(id));
              return (
                <View key={cat.name} style={styles.svcCategory}>
                  <Pressable
                    style={styles.svcCatHeader}
                    onPress={() => toggleCategoryServices(catIds)}
                  >
                    <View style={[
                      styles.svcCheck,
                      allOn && { backgroundColor: colors.gold, borderColor: colors.gold },
                      someOn && { borderColor: colors.gold },
                      !allOn && !someOn && { borderColor: colors.border },
                    ]}>
                      {allOn && <Feather name="check" size={12} color="#FFF" />}
                      {someOn && <Feather name="minus" size={12} color={colors.gold} />}
                    </View>
                    <Text style={[styles.svcCatName, { color: colors.obsidian }]}>{cat.name}</Text>
                    <Text style={[styles.svcCatCount, { color: colors.textMuted }]}>
                      {catIds.filter((id) => selectedServices.has(id)).length}/{catIds.length}
                    </Text>
                  </Pressable>

                  {cat.services.map((svc) => {
                    const on = selectedServices.has(svc.id);
                    const displayDur = durationOverrides[svc.id] ?? svc.duration;
                    return (
                      <View key={svc.id} style={styles.svcItem}>
                        <Pressable
                          style={styles.svcItemToggle}
                          onPress={() => toggleService(svc.id)}
                        >
                          <View style={[
                            styles.svcCheck,
                            on
                              ? { backgroundColor: colors.gold, borderColor: colors.gold }
                              : { borderColor: colors.border },
                          ]}>
                            {on && <Feather name="check" size={12} color="#FFF" />}
                          </View>
                          <Text style={[styles.svcItemName, { color: on ? colors.obsidian : colors.textMuted }]}>
                            {svc.name}
                          </Text>
                        </Pressable>
                        {on && (
                          <View style={styles.svcDurInline}>
                            <TextInput
                              style={[styles.svcDurInput, { color: colors.obsidian, borderColor: colors.border }]}
                              value={String(displayDur)}
                              onChangeText={(text) => setDurationFromText(svc.id, text)}
                              keyboardType="number-pad"
                              selectTextOnFocus
                            />
                            <Text style={[styles.svcDurUnit, { color: colors.textMuted }]}>min</Text>
                          </View>
                        )}
                      </View>
                    );
                  })}
                </View>
              );
            })
          )}
        </View>

        {/* Invite info (new staff only) */}
        {isNew && (
          <View style={[styles.inviteInfo, { backgroundColor: colors.statusCheckedInBg }]}>
            <Feather name="mail" size={16} color={colors.statusCheckedInText} />
            <Text style={[styles.inviteInfoText, { color: colors.statusCheckedInText }]}>
              {email
                ? `An invitation email will be sent to ${email} to complete onboarding.`
                : 'Enter an email address to send an invite.'}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* ── Bottom save bar ────────────────────────────── */}
      <View style={styles.bottomBar}>
        <Pressable
          style={[styles.saveBtn, { backgroundColor: colors.gold }]}
          onPress={handleSave}
        >
          <Text style={[styles.saveBtnText, { color: colors.goldButtonText }]}>
            {isNew ? 'Save & Send Invite' : 'Save Changes'}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

// ═══════════════════════════════════════════════════════════
//  Styles
// ═══════════════════════════════════════════════════════════

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

  // ─── Form ──────────────────────────────────────────────
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

  // ─── Role / Status / Compensation chips ────────────────
  roleChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  roleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1.5,
  },
  roleDot: { width: 8, height: 8, borderRadius: 4 },
  roleChipText: { fontSize: 12, fontFamily: 'Jost_500Medium', letterSpacing: 0.4 },

  // ─── Schedule ──────────────────────────────────────────
  schedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  schedDayLabel: {
    width: 36,
    fontSize: 13,
    fontFamily: 'Jost_500Medium',
  },
  schedSwitch: { transform: [{ scaleX: 0.75 }, { scaleY: 0.75 }] },
  schedTimes: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  schedDash: { fontSize: 14, fontFamily: 'Jost_400Regular' },
  timePicker: {
    flex: 1,
    height: 38,
    borderRadius: 10,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timePickerText: { fontSize: 12, fontFamily: 'Jost_400Regular' },
  timeDropdown: {
    maxHeight: 160,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 4,
  },
  timeOption: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  timeOptionText: { fontSize: 13 },
  applyAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 8,
  },
  applyAllText: { fontSize: 12, fontFamily: 'Jost_500Medium' },

  // ─── Services picker ──────────────────────────────────
  svcSearchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 42,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  svcSearchInput: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'Jost_400Regular',
  },
  svcBulkRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  svcBulkText: { fontSize: 12, fontFamily: 'Jost_500Medium' },
  svcEmpty: { fontSize: 13, fontFamily: 'Jost_400Regular', textAlign: 'center', paddingVertical: 16 },
  svcCategory: { marginBottom: 12 },
  svcCatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
  },
  svcCatName: { flex: 1, fontSize: 13, fontFamily: 'Jost_600SemiBold' },
  svcCatCount: { fontSize: 11, fontFamily: 'Jost_400Regular' },
  svcCheck: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  svcItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
    paddingLeft: 28,
    paddingRight: 4,
  },
  svcItemToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  svcItemName: { fontSize: 13, fontFamily: 'Jost_400Regular' },
  svcDurInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  svcDurInput: {
    width: 46,
    height: 30,
    borderRadius: 6,
    borderWidth: 1,
    textAlign: 'center',
    fontSize: 13,
    fontFamily: 'Jost_400Regular',
    paddingVertical: 0,
  },
  svcDurUnit: {
    fontSize: 12,
    fontFamily: 'Jost_400Regular',
  },

  // ─── Invite info ───────────────────────────────────────
  inviteInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
  },
  inviteInfoText: { flex: 1, fontSize: 12, fontFamily: 'Jost_400Regular' },

  // ─── Bottom bar ────────────────────────────────────────
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
  },

  // ─── Read-only view ────────────────────────────────────
  readOnlyContent: { padding: 16, gap: 12 },
  profileCard: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 14,
    gap: 8,
  },
  profileName: { fontSize: 20, fontFamily: 'Jost_600SemiBold', marginTop: 8 },
  profileBio: { fontSize: 13, fontFamily: 'Jost_400Regular', textAlign: 'center', marginTop: 4 },
  roSection: { borderRadius: 14, padding: 16, gap: 10 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  infoText: { fontSize: 14, fontFamily: 'Jost_400Regular' },
  dayChips: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  dayChipRO: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 },
  dayChipTextRO: { fontSize: 12, fontFamily: 'Jost_500Medium' },
  serviceTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  serviceTagRO: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  serviceTagTextRO: { fontSize: 12, fontFamily: 'Jost_400Regular' },
  statsRow: { flexDirection: 'row', gap: 32 },
  stat: { alignItems: 'center', gap: 2 },
  statValue: { fontSize: 22, fontFamily: 'Jost_600SemiBold' },
  statLabel: { fontSize: 11, fontFamily: 'Jost_400Regular' },
});
