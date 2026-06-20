import type { Staff, CalendarStaff, WeekSchedule } from '../types/models';

const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;
const DA: Record<string, typeof DAYS[number]> = { Mon: 'mon', Tue: 'tue', Wed: 'wed', Thu: 'thu', Fri: 'fri', Sat: 'sat', Sun: 'sun' };

function mkSched(start: string, end: string, fromDay: string, toDay: string): WeekSchedule {
  const fi = DAYS.indexOf(DA[fromDay]);
  const ti = DAYS.indexOf(DA[toDay]);
  const s: any = {};
  DAYS.forEach((d, i) => {
    const inRange = fi <= ti ? i >= fi && i <= ti : i >= fi || i <= ti;
    s[d] = inRange ? { off: false, start, end } : { off: true, start: '', end: '' };
  });
  return s;
}

// All service IDs for convenience
const ALL_SVCS = ['s01','s02','s03','s04','s05','s06','s07','s08','s09','s10','s11','s12','s13','s14','s15','s16','s17'];
const MANI_SVCS = ['s01','s02','s06','s07','s08','s09','s11','s12','s13','s16','s17'];
const ART_SVCS = ['s01','s02','s03','s07','s08','s14','s15','s16','s17'];
const PEDI_SVCS = ['s01','s09','s10','s11','s12','s13','s16','s17'];
const BASIC_SVCS = ['s01','s07','s08','s09','s17'];

// ─── West Village (store_wv) ──────────────────────────
export const STAFF_WV: Staff[] = [
  { id: 'sofia', first: 'Sofia', last: 'Reyes', initials: 'SR', role: 'Staff', roleIds: ['r04'], phone: '(212) 555-8001', email: 'sofia.r@opal.salon', shift: '9am – 7pm', days: 'Mon – Sat', status: 'active', gold: true, rating: 4.9, clients: 148, bio: 'Specialises in intricate nail art and gel extensions. 8 years experience.', services: ALL_SVCS, schedule: mkSched('09:00','19:00','Mon','Sat'), compensationType: 'commission', commissionRate: 50, hourlyRate: null, storeId: 'store_wv' },
  { id: 'mia', first: 'Mia', last: 'Tanaka', initials: 'MT', role: 'Staff', roleIds: ['r04'], phone: '(212) 555-8002', email: 'mia.t@opal.salon', shift: '10am – 7pm', days: 'Mon – Fri', status: 'active', gold: false, rating: 4.8, clients: 112, bio: 'Gel and classic manicure expert. Known for clean, precise work.', services: MANI_SVCS, schedule: mkSched('10:00','19:00','Mon','Fri'), compensationType: 'commission', commissionRate: 50, hourlyRate: null, storeId: 'store_wv' },
  { id: 'jade', first: 'Jade', last: 'Kim', initials: 'JK', role: 'Staff', roleIds: ['r04'], phone: '(212) 555-8003', email: 'jade.k@opal.salon', shift: '11am – 8pm', days: 'Tue – Sun', status: 'active', gold: false, rating: 4.9, clients: 96, bio: 'Creative specialist in 3D nail art, chrome powder and seasonal designs.', services: ART_SVCS, schedule: mkSched('11:00','20:00','Tue','Sun'), compensationType: 'commission', commissionRate: 50, hourlyRate: null, storeId: 'store_wv' },
  { id: 'naomi', first: 'Naomi', last: 'Walsh', initials: 'NW', role: 'Receptionist', roleIds: ['r03'], phone: '(212) 555-8004', email: 'naomi.w@opal.salon', shift: '9am – 6pm', days: 'Mon – Fri', status: 'active', gold: false, rating: null, clients: null, bio: 'Manages bookings, client intake and daily operations.', services: [], schedule: mkSched('09:00','18:00','Mon','Fri'), compensationType: 'hourly', commissionRate: null, hourlyRate: 18, storeId: 'store_wv' },
  { id: 'alex', first: 'Alex', last: 'Moreau', initials: 'AM', role: 'Main Owner', roleIds: ['r01'], phone: '(212) 555-8005', email: 'alex.m@opal.salon', shift: '9am – 5pm', days: 'Mon – Fri', status: 'active', gold: false, rating: null, clients: null, bio: 'Founder of Opal Nail Studio. Oversees all salon operations.', services: ALL_SVCS, schedule: mkSched('09:00','17:00','Mon','Fri'), compensationType: 'hourly', commissionRate: null, hourlyRate: 45, storeId: 'store_wv' },
  { id: 'priya', first: 'Priya', last: 'Shah', initials: 'PS', role: 'Staff', roleIds: ['r04'], phone: '(212) 555-8006', email: 'priya.s@opal.salon', shift: '12pm – 8pm', days: 'Wed – Sun', status: 'active', gold: false, rating: 4.7, clients: 54, bio: 'Rising talent with a focus on classic manicures and nail health.', services: BASIC_SVCS, schedule: mkSched('12:00','20:00','Wed','Sun'), compensationType: 'commission', commissionRate: 45, hourlyRate: null, storeId: 'store_wv' },
  { id: 'lena', first: 'Lena', last: 'Park', initials: 'LP', role: 'Staff', roleIds: ['r04'], phone: '(212) 555-8007', email: 'lena.p@opal.salon', shift: '10am – 6pm', days: 'Mon – Sat', status: 'active', gold: false, rating: 4.8, clients: 78, bio: 'Certified pedicure specialist and reflexology practitioner.', services: PEDI_SVCS, schedule: mkSched('10:00','18:00','Mon','Sat'), compensationType: 'commission', commissionRate: 50, hourlyRate: null, storeId: 'store_wv' },
];

// ─── Upper East Side (store_ue) ───────────────────────
export const STAFF_UE: Staff[] = [
  { id: 'nina', first: 'Nina', last: 'Choi', initials: 'NC', role: 'Staff', roleIds: ['r04'], phone: '(212) 555-8101', email: 'nina.c@opal.salon', shift: '9am – 6pm', days: 'Mon – Sat', status: 'active', gold: true, rating: 4.9, clients: 134, bio: 'Master gel sculptor with 10 years in luxury nail care.', services: ALL_SVCS, schedule: mkSched('09:00','18:00','Mon','Sat'), compensationType: 'commission', commissionRate: 50, hourlyRate: null, storeId: 'store_ue' },
  { id: 'diana', first: 'Diana', last: 'Vasquez', initials: 'DV', role: 'Staff', roleIds: ['r04'], phone: '(212) 555-8102', email: 'diana.v@opal.salon', shift: '10am – 7pm', days: 'Mon – Fri', status: 'active', gold: false, rating: 4.8, clients: 98, bio: 'Expert in classic and spa pedicures with a medical background.', services: PEDI_SVCS, schedule: mkSched('10:00','19:00','Mon','Fri'), compensationType: 'commission', commissionRate: 50, hourlyRate: null, storeId: 'store_ue' },
  { id: 'yuki', first: 'Yuki', last: 'Ono', initials: 'YO', role: 'Staff', roleIds: ['r04'], phone: '(212) 555-8103', email: 'yuki.o@opal.salon', shift: '11am – 8pm', days: 'Tue – Sun', status: 'active', gold: false, rating: 4.7, clients: 76, bio: 'Nail art specialist trained in Tokyo. Chrome and 3D design.', services: ART_SVCS, schedule: mkSched('11:00','20:00','Tue','Sun'), compensationType: 'commission', commissionRate: 48, hourlyRate: null, storeId: 'store_ue' },
  { id: 'rachel', first: 'Rachel', last: 'Abrams', initials: 'RA', role: 'Staff', roleIds: ['r04'], phone: '(212) 555-8104', email: 'rachel.a@opal.salon', shift: '9am – 5pm', days: 'Mon – Fri', status: 'active', gold: false, rating: 4.6, clients: 62, bio: 'Focused on nail health, dip powder, and gentle removal.', services: BASIC_SVCS, schedule: mkSched('09:00','17:00','Mon','Fri'), compensationType: 'commission', commissionRate: 45, hourlyRate: null, storeId: 'store_ue' },
  { id: 'suki', first: 'Suki', last: 'Nguyen', initials: 'SN', role: 'Staff', roleIds: ['r04'], phone: '(212) 555-8105', email: 'suki.n@opal.salon', shift: '10am – 7pm', days: 'Wed – Sun', status: 'active', gold: false, rating: 4.8, clients: 88, bio: 'Acrylic and extension specialist. Consistent, fast work.', services: MANI_SVCS, schedule: mkSched('10:00','19:00','Wed','Sun'), compensationType: 'commission', commissionRate: 50, hourlyRate: null, storeId: 'store_ue' },
  { id: 'elena', first: 'Elena', last: 'Petrov', initials: 'EP', role: 'Receptionist', roleIds: ['r03'], phone: '(212) 555-8106', email: 'elena.p@opal.salon', shift: '9am – 6pm', days: 'Mon – Fri', status: 'active', gold: false, rating: null, clients: null, bio: 'Front desk and booking management. Fluent in English and Russian.', services: [], schedule: mkSched('09:00','18:00','Mon','Fri'), compensationType: 'hourly', commissionRate: null, hourlyRate: 19, storeId: 'store_ue' },
];

// ─── Brooklyn (store_bk) ──────────────────────────────
export const STAFF_BK: Staff[] = [
  { id: 'tamara', first: 'Tamara', last: 'Chen', initials: 'TC', role: 'Staff', roleIds: ['r04'], phone: '(718) 555-8201', email: 'tamara.c@opal.salon', shift: '10am – 8pm', days: 'Mon – Sat', status: 'active', gold: true, rating: 4.9, clients: 118, bio: 'Award-winning nail artist. Specialises in hand-painted designs.', services: ALL_SVCS, schedule: mkSched('10:00','20:00','Mon','Sat'), compensationType: 'commission', commissionRate: 50, hourlyRate: null, storeId: 'store_bk' },
  { id: 'maya', first: 'Maya', last: 'Robinson', initials: 'MR', role: 'Staff', roleIds: ['r04'], phone: '(718) 555-8202', email: 'maya.r@opal.salon', shift: '10am – 7pm', days: 'Mon – Fri', status: 'active', gold: false, rating: 4.7, clients: 84, bio: 'Gel manicure and pedicure expert. 5 years experience.', services: MANI_SVCS, schedule: mkSched('10:00','19:00','Mon','Fri'), compensationType: 'commission', commissionRate: 48, hourlyRate: null, storeId: 'store_bk' },
  { id: 'zara', first: 'Zara', last: 'Ali', initials: 'ZA', role: 'Staff', roleIds: ['r04'], phone: '(718) 555-8203', email: 'zara.a@opal.salon', shift: '11am – 8pm', days: 'Tue – Sun', status: 'active', gold: false, rating: 4.8, clients: 72, bio: 'Creative nail art with a modern edge. Chrome and marble specialist.', services: ART_SVCS, schedule: mkSched('11:00','20:00','Tue','Sun'), compensationType: 'commission', commissionRate: 48, hourlyRate: null, storeId: 'store_bk' },
  { id: 'casey', first: 'Casey', last: 'Torres', initials: 'CT', role: 'Staff', roleIds: ['r04'], phone: '(718) 555-8204', email: 'casey.t@opal.salon', shift: '12pm – 8pm', days: 'Wed – Sun', status: 'active', gold: false, rating: 4.6, clients: 48, bio: 'New to the team. Fast learner with a passion for classic styles.', services: BASIC_SVCS, schedule: mkSched('12:00','20:00','Wed','Sun'), compensationType: 'commission', commissionRate: 45, hourlyRate: null, storeId: 'store_bk' },
  { id: 'rina', first: 'Rina', last: 'Kapoor', initials: 'RK', role: 'Staff', roleIds: ['r04'], phone: '(718) 555-8205', email: 'rina.k@opal.salon', shift: '10am – 6pm', days: 'Mon – Sat', status: 'active', gold: false, rating: 4.7, clients: 66, bio: 'Pedicure and foot-care specialist. Trained in podiatric nail care.', services: PEDI_SVCS, schedule: mkSched('10:00','18:00','Mon','Sat'), compensationType: 'commission', commissionRate: 50, hourlyRate: null, storeId: 'store_bk' },
  { id: 'harper', first: 'Harper', last: 'Lee', initials: 'HL', role: 'Staff', roleIds: ['r04'], phone: '(718) 555-8206', email: 'harper.l@opal.salon', shift: '10am – 7pm', days: 'Mon – Fri', status: 'active', gold: false, rating: 4.8, clients: 92, bio: 'Dip powder and gel-X pro. Instagram-worthy finishes.', services: MANI_SVCS, schedule: mkSched('10:00','19:00','Mon','Fri'), compensationType: 'commission', commissionRate: 50, hourlyRate: null, storeId: 'store_bk' },
  { id: 'keiko', first: 'Keiko', last: 'Sato', initials: 'KS', role: 'Receptionist', roleIds: ['r03'], phone: '(718) 555-8207', email: 'keiko.s@opal.salon', shift: '10am – 6pm', days: 'Mon – Fri', status: 'active', gold: false, rating: null, clients: null, bio: 'Warm and organised front desk manager. Bilingual: English/Japanese.', services: [], schedule: mkSched('10:00','18:00','Mon','Fri'), compensationType: 'hourly', commissionRate: null, hourlyRate: 18, storeId: 'store_bk' },
];

// ─── Combined exports ─────────────────────────────────

/** All staff across all stores */
export const STAFF: Staff[] = [...STAFF_WV, ...STAFF_UE, ...STAFF_BK];

/** Get staff by store ID, or all stores when storeId is 'all' or undefined */
export function getStaffForStore(storeId?: string | 'all'): Staff[] {
  if (!storeId || storeId === 'all') return STAFF;
  return STAFF.filter((s) => s.storeId === storeId);
}

/** Get technician-only staff for a store (excludes owners/receptionists) */
export function getTechsForStore(storeId?: string | 'all'): Staff[] {
  return getStaffForStore(storeId).filter((s) => s.role === 'Staff');
}

// Calendar staff — derived from STAFF for backward compat
function toCalendarStaff(s: Staff): CalendarStaff {
  const shiftStart = parseInt(s.shift.split('am')[0].split('pm')[0]);
  const shiftEnd = parseInt(s.shift.split('–')[1]?.trim().split('am')[0].split('pm')[0] ?? '17');
  // Parse from schedule instead
  const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;
  let startH = 9, endH = 17;
  for (const d of days) {
    const ds = s.schedule[d];
    if (!ds.off) {
      startH = parseInt(ds.start.split(':')[0]);
      endH = parseInt(ds.end.split(':')[0]);
      break;
    }
  }
  return { id: s.id, first: s.first, last: s.last, initials: s.initials, role: s.role, shift: [startH, endH], gold: s.gold, storeId: s.storeId };
}

export const CALENDAR_STAFF: CalendarStaff[] = STAFF.map(toCalendarStaff);

export function getCalendarStaffForStore(storeId?: string | 'all'): CalendarStaff[] {
  if (!storeId || storeId === 'all') return CALENDAR_STAFF;
  return CALENDAR_STAFF.filter((s) => s.storeId === storeId);
}

export const STAFF_MAP: Record<string, Staff> = {};
STAFF.forEach((s) => { STAFF_MAP[s.id] = s; });
