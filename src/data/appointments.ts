import type { Appointment } from '../types/models';
import { fmtKey } from '../utils/time';
import { SERVICES } from './services';
import { CALENDAR_STAFF } from './staff';
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
// Manually added appointments (from booking flow) keyed by dateKey
const addedAppointments: Map<string, Appointment[]> = new Map();
let nextAddedId = 9000;

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
  return full;
}

export function getAppointments(dateKey: string): Appointment[] {
  const date = new Date(dateKey + 'T00:00:00');
  const isWeekend = date.getDay() === 0 || date.getDay() === 6;
  const rand = mulberry32((date.getTime() / 86400000) | 0);
  const appts: Appointment[] = [];
  let id = 1;

  const techs = CALENDAR_STAFF.filter((s) => s.role === 'Staff');

  techs.forEach((s) => {
    if (rand() < 0.12) return;

    let cursor = s.shift[0] * 60 + Math.floor(rand() * 30);
    const end = s.shift[1] * 60;
    const targetCount = isWeekend ? 7 + Math.floor(rand() * 3) : 5 + Math.floor(rand() * 3);
    let count = 0;

    while (cursor < end - 30 && count < targetCount) {
      const svcKey = SVC_KEYS[Math.floor(rand() * SVC_KEYS.length)];
      const svc = SVCS[svcKey];
      const client = CLIENT_NAMES[Math.floor(rand() * CLIENT_NAMES.length)];
      const vip = rand() < 0.13;
      const pending = rand() < 0.1;
      const typeKey = APPT_TYPE_KEYS[Math.floor(rand() * APPT_TYPE_KEYS.length)];

      appts.push({
        id: `apt_${dateKey}_${id}`,
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

  // Merge in manually added appointments
  const added = addedAppointments.get(dateKey);
  if (added) appts.push(...added);

  return appts;
}

// Pre-generate today and nearby dates
const today = new Date();
const todayKey = fmtKey(today);

export function getAppointmentsForDate(date: Date): Appointment[] {
  return getAppointments(fmtKey(date));
}

export function getTodayAppointments(): Appointment[] {
  return getAppointments(todayKey);
}

export function getStaffAppointments(dateKey: string, staffId: string): Appointment[] {
  return getAppointments(dateKey).filter(
    (a) => a.staffId === staffId || a.staffIds?.includes(staffId)
  );
}
