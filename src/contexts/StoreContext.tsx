import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Store } from '../types/models';
import { STORES } from '../data/stores';
import { useAuth } from './AuthContext';

interface StoreState {
  selectedStoreId: string | 'all';
  selectedStore: Store | null;
  userStores: Store[];
  setSelectedStoreId: (id: string | 'all') => void;
  isAllStores: boolean;
}

const StoreContext = createContext<StoreState>({
  selectedStoreId: 'all',
  selectedStore: null,
  userStores: [],
  setSelectedStoreId: () => {},
  isAllStores: true,
});

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [selectedStoreId, setSelectedStoreId] = useState<string | 'all'>('all');

  const userStores = user
    ? STORES.filter((s) => user.stores.some((us) => us.id === s.id))
    : [];

  const selectedStore = selectedStoreId === 'all'
    ? null
    : STORES.find((s) => s.id === selectedStoreId) ?? null;

  return (
    <StoreContext.Provider
      value={{
        selectedStoreId,
        selectedStore,
        userStores,
        setSelectedStoreId,
        isAllStores: selectedStoreId === 'all',
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export const useStore = () => useContext(StoreContext);
