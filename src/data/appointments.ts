import type { Appointment } from '../types/models';
import { fmtKey } from '../utils/time';
import { SERVICES } from './services';
import { getCalendarStaffForStore, CALENDAR_STAFF } from './staff';
import { CLIENTS } from './clients';

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const SVCS: Record<string, { name: string; mins: number; key: string }> = {
  classic: { name: 'Classic Manicure', mins: 45, key: 'classic' },
  gel: { name: 'Gel Manicure', mins: 60, key: 'gel' },
  gelArt: { name: 'Gel + Nail Art', mins: 90, key: 'gelArt' },
  fullSet: { name: 'Full Set Acrylics', mins: 120, key: 'fullSet' },
  fill: { name: 'Acrylic Fill', mins: 75, key: 'fill' },
  pediClassic: { name: 'Classic Pedicure', mins: 45, key: 'pediClassic' },
  pediSpa: { name: 'Spa Pedicure', mins: 75, key: 'pediSpa' },
  pediGel: { name: 'Gel Pedicure', mins: 60, key: 'pediGel' },
  combo: { name: 'Mani + Pedi Combo', mins: 105, key: 'combo' },
  removal: { name: 'Soak-off Removal', mins: 30, key: 'removal' },
  dipPowder: { name: 'Dip Powder Set', mins: 75, key: 'dipPowder' },
  repair: { name: 'Nail Repair', mins: 20, key: 'repair' },
};

const SVC_KEYS = Object.keys(SVCS);
const CLIENT_NAMES = CLIENTS.map((c) => `${c.first} ${c.last}`);
const PRICES: Record<string, number> = {
  classic: 45, gel: 75, gelArt: 115, fullSet: 130, fill: 80,
  pediClassic: 50, pediSpa: 85, pediGel: 80, combo: 90,
  removal: 25, dipPowder: 85, repair: 15,
};

const APPT_TYPE_KEYS = ['chosen-tech', 'any-tech', 'new-customer', 'online'] as const;

// ─── Mutable appointment store ─────────────────────────
const addedAppointments: Map<string, Appointment[]> = new Map();
const appointmentOverrides: Map<string, Partial<Appointment>> = new Map();
let nextAddedId = 9000;

// Track the most recently created appointment so the list screen can scroll/highlight it
let _lastCreated: { id: string; date: string } | null = null;
export function getLastCreatedAppt() { return _lastCreated; }
export function clearLastCreatedAppt() { _lastCreated = null; }

export function addAppointment(appt: Omit<Appointment, 'id' | 'apptNum'>): Appointment {
  const id = nextAddedId++;
  const full: Appointment = {
    ...appt,
    id: `apt_${appt.date}_${id}`,
    apptNum: String(id),
  };
  const list = addedAppointments.get(appt.date) ?? [];
  list.push(full);
  addedAppointments.set(appt.date, list);
  _lastCreated = { id: full.id, date: full.date };
  return full;
}

// ─── Core generation — per store + date ────────────────

/** Cache key = "storeId|dateKey" */
const generationCache: Map<string, Appointment[]> = new Map();

function generateForStoreDate(storeId: string, dateKey: string): Appointment[] {
  const cacheKey = `${storeId}|${dateKey}`;
  const cached = generationCache.get(cacheKey);
  if (cached) return cached;

  const date = new Date(dateKey + 'T00:00:00');
  const isWeekend = date.getDay() === 0 || date.getDay() === 6;
  // Seed includes storeId hash so each store gets different appointments
  const storeHash = storeId.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const rand = mulberry32(((date.getTime() / 86400000) | 0) + storeHash * 997);
  const appts: Appointment[] = [];
  let id = 1;

  const techs = getCalendarStaffForStore(storeId).filter((s) => s.role === 'Staff');

  techs.forEach((s) => {
    let cursor = s.shift[0] * 60 + Math.floor(rand() * 30);
    const end = s.shift[1] * 60;
    // Keep Sofia's schedule light so we can demo booking into her open slots
    const targetCount = s.id === 'sofia'
      ? 3
      : isWeekend ? 7 + Math.floor(rand() * 3) : 5 + Math.floor(rand() * 3);
    let count = 0;

    while (cursor < end - 30 && count < targetCount) {
      const svcKey = SVC_KEYS[Math.floor(rand() * SVC_KEYS.length)];
      const svc = SVCS[svcKey];
      const client = CLIENT_NAMES[Math.floor(rand() * CLIENT_NAMES.length)];
      const vip = rand() < 0.13;
      const pending = rand() < 0.1;
      const typeKey = APPT_TYPE_KEYS[Math.floor(rand() * APPT_TYPE_KEYS.length)];

      appts.push({
        id: `apt_${storeId}_${dateKey}_${id}`,
        apptNum: String(100 + id),
        staffId: s.id,
        date: dateKey,
        startMin: cursor,
        endMin: cursor + svc.mins,
        client,
        service: svc.name,
        serviceKey: svc.key,
        status: pending ? 'pending' : 'confirmed',
        vip,
        apptType: typeKey,
        notes: vip ? 'Prefers neutral palette' : null,
        price: PRICES[svcKey] ?? 75,
      });

      cursor += svc.mins + 5 + Math.floor(rand() * 25);
      count++;
      id++;
    }
  });

  generationCache.set(cacheKey, appts);
  return appts;
}

const ALL_STORE_IDS = ['store_wv', 'store_ue', 'store_bk'];

/**
 * Get appointments for a date, optionally filtered by store.
 * storeId='all' or undefined returns combined appointments from all stores.
 */
export function getAppointments(dateKey: string, storeId?: string | 'all'): Appointment[] {
  const storeIds = (!storeId || storeId === 'all') ? ALL_STORE_IDS : [storeId];
  const generated = storeIds.flatMap((sid) => generateForStoreDate(sid, dateKey));

  // Merge in manually added appointments
  const added = addedAppointments.get(dateKey);
  const all = added ? [...generated, ...added] : generated;

  // Apply any overrides
  return all.map((a) => {
    const overrides = appointmentOverrides.get(a.id);
    return overrides ? { ...a, ...overrides } : a;
  });
}

export function updateAppointment(id: string, updates: Partial<Appointment>): void {
  const existing = appointmentOverrides.get(id) ?? {};
  appointmentOverrides.set(id, { ...existing, ...updates });
}

const today = new Date();
const todayKey = fmtKey(today);

export function getAppointmentsForDate(date: Date, storeId?: string | 'all'): Appointment[] {
  return getAppointments(fmtKey(date), storeId);
}

export function getTodayAppointments(storeId?: string | 'all'): Appointment[] {
  return getAppointments(todayKey, storeId);
}

export function getStaffAppointments(dateKey: string, staffId: string, storeId?: string | 'all'): Appointment[] {
  return getAppointments(dateKey, storeId).filter(
    (a) => a.staffId === staffId || a.staffIds?.includes(staffId)
  );
}

/**
 * Get appointments for a date range (inclusive), optionally filtered by store.
 * Used by reports, payroll, and earnings pages.
 */
export function getAppointmentsForRange(
  startDate: Date,
  endDate: Date,
  storeId?: string | 'all'
): Appointment[] {
  const result: Appointment[] = [];
  const cursor = new Date(startDate);
  cursor.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  while (cursor <= end) {
    result.push(...getAppointments(fmtKey(cursor), storeId));
    cursor.setDate(cursor.getDate() + 1);
  }
  return result;
}
