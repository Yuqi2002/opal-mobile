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

export const STAFF: Staff[] = [
  { id: 'sofia', first: 'Sofia', last: 'Reyes', initials: 'SR', role: 'Staff', roleIds: ['r04'], phone: '(212) 555-8001', email: 'sofia.r@opal.salon', shift: '9am – 7pm', days: 'Mon – Sat', status: 'active', gold: true, rating: 4.9, clients: 148, bio: 'Specialises in intricate nail art and gel extensions. 8 years experience.', services: ['s01','s02','s03','s04','s05','s06','s07','s08','s09','s10','s11','s12','s13','s14','s15','s16','s17'], schedule: mkSched('09:00','19:00','Mon','Sat'), compensationType: 'commission', commissionRate: 50, hourlyRate: null },
  { id: 'mia', first: 'Mia', last: 'Tanaka', initials: 'MT', role: 'Staff', roleIds: ['r04'], phone: '(212) 555-8002', email: 'mia.t@opal.salon', shift: '10am – 7pm', days: 'Mon – Fri', status: 'active', gold: false, rating: 4.8, clients: 112, bio: 'Gel and classic manicure expert. Known for clean, precise work.', services: ['s01','s02','s06','s07','s08','s09','s11','s12','s13','s16','s17'], schedule: mkSched('10:00','19:00','Mon','Fri'), compensationType: 'commission', commissionRate: 50, hourlyRate: null },
  { id: 'jade', first: 'Jade', last: 'Kim', initials: 'JK', role: 'Staff', roleIds: ['r04'], phone: '(212) 555-8003', email: 'jade.k@opal.salon', shift: '11am – 8pm', days: 'Tue – Sun', status: 'active', gold: false, rating: 4.9, clients: 96, bio: 'Creative specialist in 3D nail art, chrome powder and seasonal designs.', services: ['s01','s02','s03','s07','s08','s14','s15','s16','s17'], schedule: mkSched('11:00','20:00','Tue','Sun'), compensationType: 'commission', commissionRate: 50, hourlyRate: null },
  { id: 'naomi', first: 'Naomi', last: 'Walsh', initials: 'NW', role: 'Receptionist', roleIds: ['r03'], phone: '(212) 555-8004', email: 'naomi.w@opal.salon', shift: '9am – 6pm', days: 'Mon – Fri', status: 'active', gold: false, rating: null, clients: null, bio: 'Manages bookings, client intake and daily operations.', services: [], schedule: mkSched('09:00','18:00','Mon','Fri'), compensationType: 'hourly', commissionRate: null, hourlyRate: 18 },
  { id: 'alex', first: 'Alex', last: 'Moreau', initials: 'AM', role: 'Main Owner', roleIds: ['r01'], phone: '(212) 555-8005', email: 'alex.m@opal.salon', shift: '9am – 5pm', days: 'Mon – Fri', status: 'active', gold: false, rating: null, clients: null, bio: 'Founder of Opal Nail Studio. Oversees all salon operations.', services: ['s01','s02','s03','s04','s05','s06','s07','s08','s09','s10','s11','s12','s13','s14','s15','s16','s17'], schedule: mkSched('09:00','17:00','Mon','Fri'), compensationType: 'hourly', commissionRate: null, hourlyRate: 45 },
  { id: 'priya', first: 'Priya', last: 'Shah', initials: 'PS', role: 'Staff', roleIds: ['r04'], phone: '(212) 555-8006', email: 'priya.s@opal.salon', shift: '12pm – 8pm', days: 'Wed – Sun', status: 'active', gold: false, rating: 4.7, clients: 54, bio: 'Rising talent with a focus on classic manicures and nail health.', services: ['s01','s07','s08','s09','s17'], schedule: mkSched('12:00','20:00','Wed','Sun'), compensationType: 'commission', commissionRate: 45, hourlyRate: null },
  { id: 'lena', first: 'Lena', last: 'Park', initials: 'LP', role: 'Staff', roleIds: ['r04'], phone: '(212) 555-8007', email: 'lena.p@opal.salon', shift: '10am – 6pm', days: 'Mon – Sat', status: 'active', gold: false, rating: 4.8, clients: 78, bio: 'Certified pedicure specialist and reflexology practitioner.', services: ['s01','s09','s10','s11','s12','s13','s16','s17'], schedule: mkSched('10:00','18:00','Mon','Sat'), compensationType: 'commission', commissionRate: 50, hourlyRate: null },
];

export const CALENDAR_STAFF: CalendarStaff[] = [
  { id: 'sofia', first: 'Sofia', last: 'Reyes', initials: 'SR', role: 'Staff', shift: [9, 19], gold: true },
  { id: 'mia', first: 'Mia', last: 'Tanaka', initials: 'MT', role: 'Staff', shift: [10, 19], gold: false },
  { id: 'jade', first: 'Jade', last: 'Kim', initials: 'JK', role: 'Staff', shift: [11, 20], gold: false },
  { id: 'naomi', first: 'Naomi', last: 'Walsh', initials: 'NW', role: 'Receptionist', shift: [9, 18], gold: false },
  { id: 'alex', first: 'Alex', last: 'Moreau', initials: 'AM', role: 'Main Owner', shift: [9, 17], gold: false },
  { id: 'priya', first: 'Priya', last: 'Shah', initials: 'PS', role: 'Staff', shift: [12, 20], gold: false },
  { id: 'lena', first: 'Lena', last: 'Park', initials: 'LP', role: 'Staff', shift: [10, 18], gold: false },
];

export const STAFF_MAP: Record<string, Staff> = {};
STAFF.forEach((s) => { STAFF_MAP[s.id] = s; });
