import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, Modal, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  withSpring,
  Easing,
  runOnJS,
  interpolate,
} from 'react-native-reanimated';
import { useTheme } from '../contexts/ThemeContext';
import { useStore } from '../contexts/StoreContext';
import { useAuth } from '../contexts/AuthContext';
import { isStaff } from '../utils/permissions';

// ─── Store Gate (full-screen takeover on switch) ─────

export function StoreGate() {
  const { colors } = useTheme();
  const { gateStore, clearGate } = useStore();
  const progress = useSharedValue(0);
  const contentOpacity = useSharedValue(0);
  const contentTranslateY = useSharedValue(20);

  useEffect(() => {
    if (gateStore) {
      // Reset
      progress.value = 0;
      contentOpacity.value = 0;
      contentTranslateY.value = 20;

      // Backdrop: fade in, hold, fade out
      progress.value = withSequence(
        withTiming(1, { duration: 300, easing: Easing.out(Easing.cubic) }),
        withDelay(1300, withTiming(0, { duration: 400, easing: Easing.in(Easing.cubic) }, () => {
          runOnJS(clearGate)();
        }))
      );

      // Content: delayed fade in, hold, fade out
      contentOpacity.value = withDelay(150, withSequence(
        withTiming(1, { duration: 350, easing: Easing.out(Easing.cubic) }),
        withDelay(1050, withTiming(0, { duration: 300, easing: Easing.in(Easing.cubic) }))
      ));

      // Content slide: delayed spring up, then slide out
      contentTranslateY.value = withDelay(150, withSequence(
        withSpring(0, { damping: 20, stiffness: 200 }),
        withDelay(1050, withTiming(-10, { duration: 300, easing: Easing.in(Easing.cubic) }))
      ));
    }
  }, [gateStore]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
  }));

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentTranslateY.value }],
  }));

  const dotScale = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(contentOpacity.value, [0, 1], [0.5, 1]) }],
  }));

  if (!gateStore) return null;

  const accent = gateStore.accentColor;

  return (
    <Animated.View style={[styles.gate, backdropStyle]} pointerEvents="none">
      <Animated.View style={[styles.gateContent, contentStyle]}>
        {/* Store color dot */}
        <Animated.View style={[styles.gateDot, { backgroundColor: accent }, dotScale]} />

        {/* "Switched to" label */}
        <Text style={styles.gateSwitchedLabel}>
          Switched to
        </Text>

        {/* Store name */}
        <Text style={styles.gateStoreName}>
          {gateStore.name}
        </Text>

        {/* Address */}
        <Text style={styles.gateAddress}>
          {gateStore.address}
        </Text>

        {/* Accent bar */}
        <View style={[styles.gateBar, { backgroundColor: accent }]} />
      </Animated.View>
    </Animated.View>
  );
}

// ─── Shared modal ─────────────────────────────────────

function StoreModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { selectedStoreId, userStores, setSelectedStoreId, isAllStores } = useStore();
  const showAllOption = user ? !isStaff(user.role) : false;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <Pressable style={styles.backdrop} onPress={onClose}>
        <View style={[styles.sheet, { backgroundColor: colors.warmWhite }]}>
          <Text style={[styles.sheetTitle, { color: colors.obsidian }]}>Select a store</Text>

          {showAllOption && (
            <Pressable
              style={[styles.option, isAllStores && { backgroundColor: colors.goldSoft }]}
              onPress={() => { setSelectedStoreId('all'); onClose(); }}
            >
              <View style={styles.optionRow}>
                <View style={[styles.optionDot, { backgroundColor: colors.gold }]} />
                <View>
                  <Text style={[styles.optionText, { color: colors.obsidian }]}>All Stores</Text>
                  <Text style={[styles.optionSub, { color: colors.textMuted }]}>{userStores.length} locations</Text>
                </View>
              </View>
              {isAllStores && <Feather name="check" size={18} color={colors.goldDeep} />}
            </Pressable>
          )}

          {userStores.map((store) => {
            const active = selectedStoreId === store.id;
            return (
              <Pressable
                key={store.id}
                style={[styles.option, active && { backgroundColor: store.accentColor + '14' }]}
                onPress={() => { setSelectedStoreId(store.id); onClose(); }}
              >
                <View style={styles.optionRow}>
                  <View style={[styles.optionDot, { backgroundColor: store.accentColor }]} />
                  <View>
                    <Text style={[styles.optionText, { color: colors.obsidian }]}>{store.name}</Text>
                    <Text style={[styles.optionSub, { color: colors.textMuted }]}>{store.address}</Text>
                  </View>
                </View>
                {active && <Feather name="check" size={18} color={store.accentColor} />}
              </Pressable>
            );
          })}
        </View>
      </Pressable>
    </Modal>
  );
}

// ─── Colored pill in header row ───────────────────────

export function StorePickerA() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { selectedStore, userStores, isAllStores, storeColor } = useStore();
  const [visible, setVisible] = useState(false);

  if (!user) return null;

  if (userStores.length <= 1) {
    const store = userStores[0];
    const accent = store?.accentColor ?? colors.charcoal;
    return (
      <View style={[styles.pillStatic, { backgroundColor: accent }]}>
        <Text style={styles.pillText}>{store?.name ?? 'Store'}</Text>
      </View>
    );
  }

  const accent = isAllStores ? colors.gold : (storeColor ?? colors.charcoal);
  const displayName = isAllStores ? 'All Stores' : selectedStore?.name ?? 'Store';

  return (
    <>
      <Pressable
        onPress={() => setVisible(true)}
        style={[styles.pill, { backgroundColor: accent }]}
      >
        <Text style={[styles.pillText, isAllStores && { color: '#1A1A18' }]}>{displayName}</Text>
        <Feather name="chevron-down" size={13} color={isAllStores ? 'rgba(26,26,24,0.5)' : 'rgba(255,255,255,0.8)'} />
      </Pressable>
      <StoreModal visible={visible} onClose={() => setVisible(false)} />
    </>
  );
}

// ─── Default export ───────────────────────────────────

export function StorePicker() {
  return <StorePickerA />;
}

const styles = StyleSheet.create({
  // ── Pill ────────────────────
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  pillStatic: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  pillText: {
    fontSize: 13,
    fontFamily: 'Jost_500Medium',
    color: '#FFFFFF',
  },

  // ── Modal ───────────────────
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  sheetTitle: {
    fontSize: 18,
    fontFamily: 'Jost_500Medium',
    marginBottom: 16,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 4,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  optionDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  optionText: {
    fontSize: 15,
    fontFamily: 'Jost_500Medium',
  },
  optionSub: {
    fontSize: 12,
    fontFamily: 'Jost_400Regular',
    marginTop: 1,
  },

  // ── Gate transition ─────────
  gate: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gateContent: {
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 36,
    paddingHorizontal: 44,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 20,
  },
  gateDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginBottom: 8,
  },
  gateSwitchedLabel: {
    fontSize: 13,
    fontFamily: 'Jost_500Medium',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: '#555550',
  },
  gateStoreName: {
    fontSize: 26,
    fontFamily: 'Jost_600SemiBold',
    letterSpacing: 0.5,
    marginTop: 2,
    color: '#000000',
  },
  gateAddress: {
    fontSize: 13,
    fontFamily: 'Jost_500Medium',
    marginTop: 2,
    textAlign: 'center',
    color: '#555550',
  },
  gateBar: {
    width: 40,
    height: 3,
    borderRadius: 1.5,
    marginTop: 16,
  },
});
