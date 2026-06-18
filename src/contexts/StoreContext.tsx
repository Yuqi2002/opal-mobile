import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Store } from '../types/models';
import { STORES } from '../data/stores';
import { useAuth } from './AuthContext';

export interface GateInfo {
  name: string;
  address: string;
  accentColor: string;
}

interface StoreState {
  selectedStoreId: string | 'all';
  selectedStore: Store | null;
  userStores: Store[];
  setSelectedStoreId: (id: string | 'all') => void;
  isAllStores: boolean;
  storeColor: string | null;
  /** Non-null while the gate transition is showing */
  gateStore: GateInfo | null;
  clearGate: () => void;
}

const StoreContext = createContext<StoreState>({
  selectedStoreId: 'all',
  selectedStore: null,
  userStores: [],
  setSelectedStoreId: () => {},
  isAllStores: true,
  storeColor: null,
  gateStore: null,
  clearGate: () => {},
});

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [selectedStoreId, setSelectedStoreIdRaw] = useState<string | 'all'>('all');
  const [gateStore, setGateStore] = useState<GateInfo | null>(null);

  const userStores = user
    ? STORES.filter((s) => user.stores.some((us) => us.id === s.id))
    : [];

  const selectedStore = selectedStoreId === 'all'
    ? null
    : STORES.find((s) => s.id === selectedStoreId) ?? null;

  const storeColor = selectedStore?.accentColor ?? null;

  const setSelectedStoreId = useCallback((id: string | 'all') => {
    setSelectedStoreIdRaw(id);
    if (id === 'all') {
      setGateStore({ name: 'All Stores', address: `${userStores.length} locations`, accentColor: '#D6BC8A' });
    } else {
      const store = STORES.find((s) => s.id === id) ?? null;
      if (store) setGateStore({ name: store.name, address: store.address, accentColor: store.accentColor });
    }
  }, [userStores.length]);

  const clearGate = useCallback(() => setGateStore(null), []);

  return (
    <StoreContext.Provider
      value={{
        selectedStoreId,
        selectedStore,
        userStores,
        setSelectedStoreId,
        isAllStores: selectedStoreId === 'all',
        storeColor,
        gateStore,
        clearGate,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export const useStore = () => useContext(StoreContext);
