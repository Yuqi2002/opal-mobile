import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ScheduleLayout = 'list' | 'calendar';

const STORAGE_KEY = 'opal-staff-schedule-layout';

export function useScheduleLayout() {
  const [scheduleLayout, setLayoutState] = useState<ScheduleLayout>('list');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((val) => {
      if (val === 'calendar') setLayoutState('calendar');
    });
  }, []);

  const setScheduleLayout = (v: ScheduleLayout) => {
    setLayoutState(v);
    AsyncStorage.setItem(STORAGE_KEY, v);
  };

  return { scheduleLayout, setScheduleLayout };
}
