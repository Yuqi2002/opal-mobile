import React, { createContext, useContext, useState, useCallback } from 'react';
import { updateAppointment } from '../data/appointments';
import type { Appointment } from '../types/models';

interface ActiveServiceState {
  /** The currently active appointment (null if none) */
  activeAppt: Appointment | null;
  /** Timestamp when the service was started */
  startedAt: number | null;
  /** Start serving an appointment */
  startService: (appt: Appointment) => void;
  /** Complete the active service */
  completeService: () => void;
  /** Bump a revision counter so consumers re-render after edits */
  refreshActive: () => void;
  /** Revision counter — changes when the active appointment is edited */
  revision: number;
}

const ActiveServiceContext = createContext<ActiveServiceState>({
  activeAppt: null,
  startedAt: null,
  startService: () => {},
  completeService: () => {},
  refreshActive: () => {},
  revision: 0,
});

export function ActiveServiceProvider({ children }: { children: React.ReactNode }) {
  const [activeAppt, setActiveAppt] = useState<Appointment | null>(null);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [revision, setRevision] = useState(0);

  const startService = useCallback((appt: Appointment) => {
    updateAppointment(appt.id, { status: 'started' });
    setActiveAppt({ ...appt, status: 'started' });
    setStartedAt(Date.now());
  }, []);

  const completeService = useCallback(() => {
    if (activeAppt) {
      updateAppointment(activeAppt.id, { status: 'ended' });
    }
    setActiveAppt(null);
    setStartedAt(null);
  }, [activeAppt]);

  const refreshActive = useCallback(() => {
    setRevision((r) => r + 1);
  }, []);

  return (
    <ActiveServiceContext.Provider
      value={{ activeAppt, startedAt, startService, completeService, refreshActive, revision }}
    >
      {children}
    </ActiveServiceContext.Provider>
  );
}

export function useActiveService() {
  return useContext(ActiveServiceContext);
}
