import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type TurnQueueVisibility = 'full' | 'limited' | 'own-only';

interface StaffPolicies {
  staffCanBook: boolean;
  staffCanBookWithinHour: boolean;
  turnQueueVisibility: TurnQueueVisibility;
}

interface StaffPoliciesState extends StaffPolicies {
  setStaffCanBook: (v: boolean) => void;
  setStaffCanBookWithinHour: (v: boolean) => void;
  setTurnQueueVisibility: (v: TurnQueueVisibility) => void;
}

const STORAGE_KEY = 'opal-staff-policies';

const defaults: StaffPolicies = {
  staffCanBook: true,
  staffCanBookWithinHour: true,
  turnQueueVisibility: 'full',
};

const StaffPoliciesContext = createContext<StaffPoliciesState>({
  ...defaults,
  setStaffCanBook: () => {},
  setStaffCanBookWithinHour: () => {},
  setTurnQueueVisibility: () => {},
});

export function StaffPoliciesProvider({ children }: { children: React.ReactNode }) {
  const [policies, setPolicies] = useState<StaffPolicies>(defaults);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((val) => {
      if (val) {
        try {
          const parsed = JSON.parse(val);
          setPolicies({ ...defaults, ...parsed });
        } catch {}
      }
    });
  }, []);

  const persist = (next: StaffPolicies) => {
    setPolicies(next);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const setStaffCanBook = (v: boolean) => persist({ ...policies, staffCanBook: v });
  const setStaffCanBookWithinHour = (v: boolean) => persist({ ...policies, staffCanBookWithinHour: v });
  const setTurnQueueVisibility = (v: TurnQueueVisibility) => persist({ ...policies, turnQueueVisibility: v });

  return (
    <StaffPoliciesContext.Provider value={{ ...policies, setStaffCanBook, setStaffCanBookWithinHour, setTurnQueueVisibility }}>
      {children}
    </StaffPoliciesContext.Provider>
  );
}

export const useStaffPolicies = () => useContext(StaffPoliciesContext);
