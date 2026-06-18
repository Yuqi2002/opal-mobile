import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../src/contexts/ThemeContext';
import { useTranslation } from '../src/contexts/I18nContext';
import { NOTIFICATIONS } from '../src/data/notifications';
import type { OpalNotification } from '../src/types/models';

// ─── Helpers ──────────────────────────────────────

function getRelativeTime(timestamp: string): string {
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now.getTime() - then.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin} min ago`;
  if (diffHr < 24) return `${diffHr} hour${diffHr !== 1 ? 's' : ''} ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return then.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

type DateGroup = 'Today' | 'Yesterday' | 'Earlier';

function getDateGroup(timestamp: string): DateGroup {
  const now = new Date();
  const then = new Date(timestamp);

  const nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const thenDate = new Date(then.getFullYear(), then.getMonth(), then.getDate());
  const diffDays = Math.floor((nowDate.getTime() - thenDate.getTime()) / 86400000);

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return 'Earlier';
}

function getNotifIcon(type: string): keyof typeof Feather.glyphMap {
  if (type.startsWith('appt') || type === 'daily_recap' || type === 'daily_summary') {
    return 'calendar';
  }
  if (type.startsWith('svc') || type.startsWith('turn')) {
    return 'layers';
  }
  return 'bell';
}

// ─── Notification item ────────────────────────────

function NotificationItem({
  notification,
  onTap,
}: {
  notification: OpalNotification & { _read: boolean };
  onTap: (n: OpalNotification) => void;
}) {
  const { colors } = useTheme();
  const iconName = getNotifIcon(notification.type);
  const isUnread = !notification._read;

  return (
    <Pressable
      style={[styles.item, { backgroundColor: colors.warmWhite }]}
      onPress={() => onTap(notification)}
    >
      {/* Unread indicator */}
      <View style={styles.unreadCol}>
        {isUnread && <View style={[styles.unreadDot, { backgroundColor: colors.gold }]} />}
      </View>

      {/* Icon */}
      <View style={[styles.iconCircle, { backgroundColor: colors.cream }]}>
        <Feather name={iconName} size={16} color={colors.charcoal} />
      </View>

      {/* Content */}
      <View style={styles.itemContent}>
        <Text
          style={[
            styles.itemTitle,
            { color: colors.obsidian },
            isUnread && styles.itemTitleUnread,
          ]}
          numberOfLines={1}
        >
          {notification.title}
        </Text>
        <Text style={[styles.itemBody, { color: colors.textMuted }]} numberOfLines={2}>
          {notification.body}
        </Text>
        <Text style={[styles.itemTime, { color: colors.textFaint }]}>
          {getRelativeTime(notification.timestamp)}
        </Text>
      </View>
    </Pressable>
  );
}

// ─── Main screen ──────────────────────────────────

export default function NotificationsScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();

  // Local read state so "mark all read" works
  const [readIds, setReadIds] = useState<Set<string>>(() => {
    const set = new Set<string>();
    NOTIFICATIONS.forEach((n) => {
      if (n.read) set.add(n.id);
    });
    return set;
  });

  const markAllRead = useCallback(() => {
    setReadIds(new Set(NOTIFICATIONS.map((n) => n.id)));
  }, []);

  // Sorted newest first with local read state
  const enrichedNotifs = useMemo(() => {
    return [...NOTIFICATIONS]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .map((n) => ({ ...n, _read: readIds.has(n.id) }));
  }, [readIds]);

  // Group by date
  const grouped = useMemo(() => {
    const groups: { key: DateGroup; items: (OpalNotification & { _read: boolean })[] }[] = [];
    const groupMap = new Map<DateGroup, (OpalNotification & { _read: boolean })[]>();

    for (const n of enrichedNotifs) {
      const g = getDateGroup(n.timestamp);
      if (!groupMap.has(g)) {
        const arr: (OpalNotification & { _read: boolean })[] = [];
        groupMap.set(g, arr);
        groups.push({ key: g, items: arr });
      }
      groupMap.get(g)!.push(n);
    }
    return groups;
  }, [enrichedNotifs]);

  const hasUnread = enrichedNotifs.some((n) => !n._read);

  const handleTap = useCallback(
    (n: OpalNotification) => {
      // Mark as read
      setReadIds((prev) => {
        const next = new Set(prev);
        next.add(n.id);
        return next;
      });
      // Log navigation intent
      console.log('[Notifications] Tapped:', n.id, n.data?.screen ?? 'none');
    },
    []
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.cream }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.obsidian }]}>{t('notifTitle')}</Text>

        <View style={styles.headerActions}>
          {hasUnread && (
            <Pressable onPress={markAllRead} hitSlop={8}>
              <Text style={[styles.markAllRead, { color: colors.goldDeep }]}>
                {t('notifMarkAllRead')}
              </Text>
            </Pressable>
          )}
          <Pressable onPress={() => router.back()} hitSlop={8} style={styles.closeBtn}>
            <Feather name="x" size={22} color={colors.obsidian} />
          </Pressable>
        </View>
      </View>

      {/* List */}
      {enrichedNotifs.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Feather name="bell-off" size={48} color={colors.textFaint} />
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>
            No notifications
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          {grouped.map((group) => (
            <View key={group.key} style={styles.group}>
              <Text style={[styles.groupLabel, { color: colors.textMuted }]}>
                {group.key}
              </Text>
              {group.items.map((notif) => (
                <NotificationItem
                  key={notif.id}
                  notification={notif}
                  onTap={handleTap}
                />
              ))}
            </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Jost_500Medium',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  markAllRead: {
    fontSize: 13,
    fontFamily: 'Jost_500Medium',
  },
  closeBtn: {
    padding: 2,
  },

  // List
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 32,
  },

  // Group
  group: {
    paddingTop: 16,
  },
  groupLabel: {
    fontSize: 10,
    fontFamily: 'Jost_500Medium',
    letterSpacing: 3,
    textTransform: 'uppercase',
    paddingHorizontal: 16,
    marginBottom: 8,
  },

  // Item
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 14,
    paddingRight: 16,
    marginHorizontal: 16,
    marginBottom: 2,
    borderRadius: 14,
    // shadow
    shadowColor: '#1A1A18',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  unreadCol: {
    width: 24,
    alignItems: 'center',
    paddingTop: 6,
  },
  unreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  itemContent: {
    flex: 1,
    gap: 2,
  },
  itemTitle: {
    fontSize: 14,
    fontFamily: 'Jost_400Regular',
  },
  itemTitleUnread: {
    fontFamily: 'Jost_500Medium',
  },
  itemBody: {
    fontSize: 13,
    fontFamily: 'Jost_400Regular',
    lineHeight: 18,
  },
  itemTime: {
    fontSize: 11,
    fontFamily: 'Jost_400Regular',
    marginTop: 4,
  },

  // Empty
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Jost_500Medium',
  },
});
