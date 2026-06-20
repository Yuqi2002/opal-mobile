import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, LayoutAnimation, Platform, UIManager } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useAuth } from '../../src/contexts/AuthContext';
import { useTranslation } from '../../src/contexts/I18nContext';
import { useStore } from '../../src/contexts/StoreContext';
import { StorePicker } from '../../src/components/StorePicker';
import { Avatar } from '../../src/components/Avatar';
import { EmptyState } from '../../src/components/EmptyState';
import { generateTurnQueueState, TURN_SERVICES } from '../../src/data/turns';
import type { TurnTechState, TurnTechStatus, CompletedService } from '../../src/types/models';
import { radii } from '../../src/theme/tokens';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ─── Status indicator configs ─────────────────────
const STATUS_SERVING_COLOR = '#2D6A4F';
const STATUS_BREAK_COLOR = '#D6BC8A';
const STATUS_NOT_IN_COLOR = '#B0AC9F';
const STATUS_QUEUE_COLOR = '#3D3D38';

// ─── Status dot component ─────────────────────────
function StatusDot({ status }: { status: TurnTechStatus }) {
  switch (status) {
    case 'serving':
      return <View style={[dotStyles.dot, { backgroundColor: STATUS_SERVING_COLOR }]} />;
    case 'queue':
      return (
        <View
          style={[dotStyles.dot, { backgroundColor: 'transparent', borderWidth: 2, borderColor: STATUS_QUEUE_COLOR }]}
        />
      );
    case 'break':
      return (
        <View style={[dotStyles.dot, { backgroundColor: 'transparent', overflow: 'hidden', borderWidth: 1.5, borderColor: STATUS_BREAK_COLOR }]}>
          <View style={dotStyles.halfFill} />
        </View>
      );
    case 'not_in':
      return <View style={[dotStyles.dot, { backgroundColor: STATUS_NOT_IN_COLOR }]} />;
    default:
      return null;
  }
}

const dotStyles = StyleSheet.create({
  dot: { width: 10, height: 10, borderRadius: 5 },
  halfFill: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%', backgroundColor: STATUS_BREAK_COLOR },
});

// ─── Status label ─────────────────────────────────
function statusText(status: TurnTechStatus, station: number | undefined, t: (key: string) => string): string {
  switch (status) {
    case 'serving': return `${t('turnServing')} · ${t('turnStation')} ${station ?? ''}`;
    case 'queue': return t('turnQueue');
    case 'break': return t('turnBreak');
    case 'not_in': return t('turnNotIn');
    default: return '';
  }
}

function statusColor(status: TurnTechStatus): string {
  switch (status) {
    case 'serving': return STATUS_SERVING_COLOR;
    case 'queue': return STATUS_QUEUE_COLOR;
    case 'break': return STATUS_BREAK_COLOR;
    case 'not_in': return STATUS_NOT_IN_COLOR;
    default: return STATUS_NOT_IN_COLOR;
  }
}

// ─── Completed service row ────────────────────────
function ServiceRow({ svc, colors }: { svc: CompletedService; colors: any }) {
  const service = TURN_SERVICES.find((s) => s.id === svc.serviceId);
  return (
    <View style={sStyles.row}>
      <View style={[sStyles.badge, { backgroundColor: service?.badgeColor ?? colors.charcoal }]}>
        <Text style={sStyles.badgeText}>{service?.abbr ?? '??'}</Text>
      </View>
      <View style={sStyles.info}>
        <Text style={[sStyles.name, { color: colors.obsidian }]}>{service?.name ?? svc.serviceId}</Text>
        <Text style={[sStyles.meta, { color: colors.textMuted }]}>
          {svc.time} · {svc.clientInitials} · {svc.duration}m
        </Text>
      </View>
      <Text style={[sStyles.weight, { color: colors.textMuted }]}>{service?.weight ?? 1}×</Text>
    </View>
  );
}

const sStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, gap: 10 },
  badge: { width: 32, height: 24, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  badgeText: { fontSize: 10, fontFamily: 'Jost_600SemiBold', color: '#FFF', letterSpacing: 0.3 },
  info: { flex: 1, gap: 1 },
  name: { fontSize: 13, fontFamily: 'Jost_500Medium' },
  meta: { fontSize: 11, fontFamily: 'Jost_400Regular' },
  weight: { fontSize: 13, fontFamily: 'Jost_500Medium' },
});

// ─── Rank badge ───────────────────────────────────
function RankBadge({ rank, colors }: { rank: number; colors: any }) {
  const isTop3 = rank <= 3;
  const bgColor = rank === 1 ? colors.gold : rank === 2 ? colors.goldLight : rank === 3 ? colors.goldLight + '60' : 'transparent';
  const textColor = isTop3 ? '#1A1A18' : colors.textMuted;

  return (
    <View style={[styles.rankBadge, isTop3 && { backgroundColor: bgColor }]}>
      <Text style={[styles.rankText, { color: textColor }]}>{rank}</Text>
    </View>
  );
}

// ─── Tech card ────────────────────────────────────
function TechCard({
  tech,
  rank,
  isCurrentUser,
  expanded,
  onToggle,
}: {
  tech: TurnTechState;
  rank: number;
  isCurrentUser: boolean;
  expanded: boolean;
  onToggle: () => void;
}) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  const sColor = statusColor(tech.status);
  const sText = statusText(tech.status, tech.station, t);

  return (
    <Pressable
      onPress={onToggle}
      style={[
        styles.card,
        {
          backgroundColor: colors.warmWhite,
          borderLeftColor: isCurrentUser ? colors.gold : 'transparent',
        },
      ]}
    >
      {/* Main row */}
      <View style={styles.cardMain}>
        <RankBadge rank={rank} colors={colors} />
        <Avatar initials={tech.initials} gold={tech.gold} size="list" />
        <View style={styles.cardInfo}>
          <Text style={[styles.techName, { color: colors.obsidian }]}>{tech.techName}</Text>
          <View style={styles.statusRow}>
            <StatusDot status={tech.status} />
            <Text style={[styles.statusLabel, { color: sColor }]}>{sText}</Text>
          </View>
        </View>
        <View style={styles.turnCount}>
          <Text style={[styles.turnNumber, { color: colors.obsidian }]}>{tech.turnsCompleted}</Text>
          <Text style={[styles.turnLabel, { color: colors.textMuted }]}>turns</Text>
        </View>
        <Feather
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={16}
          color={colors.textMuted}
          style={styles.chevron}
        />
      </View>

      {/* Expanded: completed services */}
      {expanded && tech.completedServices.length > 0 && (
        <View style={[styles.expandedSection, { borderTopColor: colors.border }]}>
          <Text style={[styles.expandedTitle, { color: colors.textMuted }]}>
            COMPLETED TODAY
          </Text>
          {tech.completedServices.map((svc, idx) => (
            <ServiceRow key={`${svc.serviceId}-${idx}`} svc={svc} colors={colors} />
          ))}
        </View>
      )}
    </Pressable>
  );
}

// ─── Main screen ──────────────────────────────────
export default function TurnsScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { t } = useTranslation();

  const { selectedStoreId } = useStore();
  const turnState = useMemo(() => generateTurnQueueState(selectedStoreId), [selectedStoreId]);

  // Sort by turnsCompleted descending (leaderboard rank)
  const sortedTechs = useMemo(
    () => [...turnState].sort((a, b) => b.turnsCompleted - a.turnsCompleted),
    [turnState]
  );

  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = useCallback((techId: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId((prev) => (prev === techId ? null : techId));
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.cream }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: colors.obsidian }]}>{t('turnQueue')}</Text>
          <StorePicker />
        </View>
      </View>

      {/* Tech list */}
      {sortedTechs.length === 0 ? (
        <EmptyState
          icon="layers"
          title={t('turnNoUpcoming')}
          subtitle="No technicians are currently on the turn queue."
        />
      ) : (
        <ScrollView
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          {sortedTechs.map((tech, idx) => (
            <TechCard
              key={tech.techId}
              tech={tech}
              rank={idx + 1}
              isCurrentUser={tech.techId === user?.id}
              expanded={expandedId === tech.techId}
              onToggle={() => toggleExpand(tech.techId)}
            />
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingBottom: 8 },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingHorizontal: 16,
    marginTop: 12,
  },
  title: { fontSize: 20, fontFamily: 'Jost_500Medium' },
  list: { flex: 1 },
  listContent: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 32, gap: 10 },

  // Card
  card: {
    borderRadius: radii.lg,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderLeftWidth: 3,
    shadowColor: '#1A1A18',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  // Rank
  rankBadge: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    fontSize: 13,
    fontFamily: 'Jost_600SemiBold',
  },

  cardInfo: { flex: 1, gap: 2 },
  techName: { fontSize: 15, fontFamily: 'Jost_500Medium' },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusLabel: { fontSize: 12, fontFamily: 'Jost_400Regular' },

  // Turn count (right side)
  turnCount: { alignItems: 'center', marginRight: 2 },
  turnNumber: { fontSize: 20, fontFamily: 'Jost_600SemiBold', lineHeight: 24 },
  turnLabel: { fontSize: 9, fontFamily: 'Jost_500Medium', letterSpacing: 0.3, textTransform: 'uppercase' },

  chevron: { marginLeft: 2 },

  // Expanded section
  expandedSection: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  expandedTitle: {
    fontSize: 10,
    fontFamily: 'Jost_600SemiBold',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
});
