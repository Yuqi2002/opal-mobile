import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useAuth } from '../../src/contexts/AuthContext';
import { useTranslation } from '../../src/contexts/I18nContext';
import { StorePicker } from '../../src/components/StorePicker';
import { Avatar } from '../../src/components/Avatar';
import { EmptyState } from '../../src/components/EmptyState';
import { generateTurnQueueState } from '../../src/data/turns';
import { TURN_SERVICES } from '../../src/data/turns';
import type { TurnTechState, TurnTechStatus, TurnQueueEntry } from '../../src/types/models';

// ─── Status indicator configs ─────────────────────
const STATUS_SERVING_COLOR = '#2D6A4F';
const STATUS_BREAK_COLOR = '#D6BC8A';
const STATUS_NOT_IN_COLOR = '#B0AC9F';
const STATUS_QUEUE_COLOR = '#3D3D38';

function formatCurrentDate(): string {
  const now = new Date();
  return now.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

// ─── Status dot component ─────────────────────────
function StatusDot({ status }: { status: TurnTechStatus }) {
  switch (status) {
    case 'serving':
      return (
        <View style={[dotStyles.dot, { backgroundColor: STATUS_SERVING_COLOR }]} />
      );
    case 'queue':
      return (
        <View
          style={[
            dotStyles.dot,
            {
              backgroundColor: 'transparent',
              borderWidth: 2,
              borderColor: STATUS_QUEUE_COLOR,
            },
          ]}
        />
      );
    case 'break':
      // Half-filled dot
      return (
        <View style={[dotStyles.dot, { backgroundColor: 'transparent', overflow: 'hidden', borderWidth: 1.5, borderColor: STATUS_BREAK_COLOR }]}>
          <View style={dotStyles.halfFill} />
        </View>
      );
    case 'not_in':
      return (
        <View style={[dotStyles.dot, { backgroundColor: STATUS_NOT_IN_COLOR }]} />
      );
    default:
      return null;
  }
}

const dotStyles = StyleSheet.create({
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  halfFill: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: STATUS_BREAK_COLOR,
  },
});

// ─── Status label ─────────────────────────────────
function StatusLabel({ status, station, t }: { status: TurnTechStatus; station?: number; t: (key: string) => string }) {
  const { colors } = useTheme();

  let label = '';
  let color = colors.textMuted;

  switch (status) {
    case 'serving':
      label = `${t('turnServing')} \u00B7 ${t('turnStation')} ${station ?? ''}`;
      color = STATUS_SERVING_COLOR;
      break;
    case 'queue':
      label = t('turnQueue');
      color = STATUS_QUEUE_COLOR;
      break;
    case 'break':
      label = t('turnBreak');
      color = STATUS_BREAK_COLOR;
      break;
    case 'not_in':
      label = t('turnNotIn');
      color = STATUS_NOT_IN_COLOR;
      break;
  }

  return <Text style={[styles.statusLabel, { color }]}>{label}</Text>;
}

// ─── Service badge pill ───────────────────────────
function ServiceBadge({ entry }: { entry: TurnQueueEntry }) {
  const svc = TURN_SERVICES.find((s) => s.id === entry.serviceId);
  if (!svc) return null;

  return (
    <View style={[styles.badge, { backgroundColor: svc.badgeColor }]}>
      <Text style={styles.badgeText}>
        {svc.abbr} \u00B7 {entry.duration}m
      </Text>
    </View>
  );
}

// ─── Tech card ────────────────────────────────────
function TechCard({ tech, isCurrentUser }: { tech: TurnTechState; isCurrentUser: boolean }) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.warmWhite,
          borderLeftColor: isCurrentUser ? colors.gold : 'transparent',
        },
      ]}
    >
      <View style={styles.cardTop}>
        <Avatar initials={tech.initials} gold={tech.gold} size="list" />
        <View style={styles.cardInfo}>
          <Text style={[styles.techName, { color: colors.obsidian }]}>
            {tech.techName}
          </Text>
          <View style={styles.statusRow}>
            <StatusDot status={tech.status} />
            <StatusLabel status={tech.status} station={tech.station} t={t} />
          </View>
        </View>
      </View>

      {tech.queue.length > 0 && (
        <View style={styles.badgeRow}>
          {tech.queue.map((entry, idx) => (
            <ServiceBadge key={`${entry.serviceId}-${idx}`} entry={entry} />
          ))}
        </View>
      )}
    </View>
  );
}

// ─── Main screen ──────────────────────────────────
export default function TurnsScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { t } = useTranslation();

  const turnState = useMemo(() => generateTurnQueueState(), []);

  // Sort: serving first, then queue, then break, then not_in
  const statusOrder: Record<TurnTechStatus, number> = {
    serving: 0,
    queue: 1,
    break: 2,
    not_in: 3,
  };

  const sortedTechs = useMemo(
    () => [...turnState].sort((a, b) => statusOrder[a.status] - statusOrder[b.status]),
    [turnState]
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.cream }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <StorePicker />
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: colors.obsidian }]}>{t('turnQueue')}</Text>
          <Text style={[styles.dateLabel, { color: colors.textMuted }]}>
            {formatCurrentDate()}
          </Text>
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
          {sortedTechs.map((tech) => (
            <TechCard
              key={tech.techId}
              tech={tech}
              isCurrentUser={tech.techId === user?.id}
            />
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingHorizontal: 16,
    marginTop: 12,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Jost_500Medium',
    letterSpacing: 0,
  },
  dateLabel: {
    fontSize: 13,
    fontFamily: 'Jost_400Regular',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 32,
    gap: 10,
  },

  // Card
  card: {
    borderRadius: 14,
    padding: 16,
    borderLeftWidth: 3,
    // shadow
    shadowColor: '#1A1A18',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardInfo: {
    flex: 1,
    gap: 2,
  },
  techName: {
    fontSize: 15,
    fontFamily: 'Jost_500Medium',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusLabel: {
    fontSize: 12,
    fontFamily: 'Jost_400Regular',
  },

  // Badges
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 12,
    paddingLeft: 48, // align with name (avatar 36 + gap 12)
  },
  badge: {
    height: 28,
    paddingHorizontal: 10,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 12,
    fontFamily: 'Jost_500Medium',
    color: '#FFFFFF',
  },
});
