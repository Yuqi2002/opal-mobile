import React, { useState } from 'react';
import { View, Text, Pressable, Modal, StyleSheet, FlatList } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useStore } from '../contexts/StoreContext';
import { useAuth } from '../contexts/AuthContext';
import { isStaff } from '../utils/permissions';

export function StorePicker() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { selectedStoreId, selectedStore, userStores, setSelectedStoreId, isAllStores } = useStore();
  const [visible, setVisible] = useState(false);

  if (!user) return null;
  if (userStores.length <= 1) {
    return (
      <View style={styles.staticContainer}>
        <Text style={[styles.storeName, { color: colors.charcoal }]}>{userStores[0]?.name ?? 'Store'}</Text>
      </View>
    );
  }

  const displayName = isAllStores ? 'All Stores' : selectedStore?.name ?? 'Select store';
  const showAllOption = !isStaff(user.role);

  return (
    <>
      <Pressable onPress={() => setVisible(true)} style={[styles.picker, { borderColor: colors.border }]}>
        <Feather name="chevron-down" size={14} color={colors.textMuted} />
        <Text style={[styles.storeName, { color: colors.charcoal }]}>{displayName}</Text>
      </Pressable>

      <Modal visible={visible} transparent animationType="slide">
        <Pressable style={styles.backdrop} onPress={() => setVisible(false)}>
          <View style={[styles.sheet, { backgroundColor: colors.warmWhite }]}>
            <Text style={[styles.sheetTitle, { color: colors.obsidian }]}>Select a store</Text>

            {showAllOption && (
              <Pressable
                style={[styles.option, isAllStores && { backgroundColor: colors.goldSoft }]}
                onPress={() => { setSelectedStoreId('all'); setVisible(false); }}
              >
                <Text style={[styles.optionText, { color: colors.obsidian }]}>All Stores</Text>
                {isAllStores && <Feather name="check" size={18} color={colors.goldDeep} />}
              </Pressable>
            )}

            {userStores.map((store) => (
              <Pressable
                key={store.id}
                style={[styles.option, selectedStoreId === store.id && { backgroundColor: colors.goldSoft }]}
                onPress={() => { setSelectedStoreId(store.id); setVisible(false); }}
              >
                <View>
                  <Text style={[styles.optionText, { color: colors.obsidian }]}>{store.name}</Text>
                  <Text style={[styles.optionAddress, { color: colors.textMuted }]}>{store.address}</Text>
                </View>
                {selectedStoreId === store.id && <Feather name="check" size={18} color={colors.goldDeep} />}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  staticContainer: { paddingHorizontal: 16, paddingVertical: 4 },
  picker: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 8, marginHorizontal: 16, borderWidth: 1, borderRadius: 10 },
  storeName: { fontSize: 14, fontFamily: 'Jost_500Medium' },
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.3)' },
  sheet: { borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingVertical: 24, paddingHorizontal: 16 },
  sheetTitle: { fontSize: 18, fontFamily: 'Jost_500Medium', marginBottom: 16 },
  option: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 12, borderRadius: 10, marginBottom: 4 },
  optionText: { fontSize: 15, fontFamily: 'Jost_500Medium' },
  optionAddress: { fontSize: 12, fontFamily: 'Jost_400Regular', marginTop: 2 },
});
