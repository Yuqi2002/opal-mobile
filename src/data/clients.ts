import type { Client, BookingClient } from '../types/models';

export const CLIENTS: Client[] = [
  { id: 'c01', first: 'Emma', last: 'Fontaine', phone: '(212) 555-0182', email: 'emma.fontaine@email.com', visits: 24, lastVisit: '2026-04-28', status: 'vip', notes: 'Prefers neutral palette. Allergic to acetone.', preferredTech: 'sofia', spend: 4280 },
  { id: 'c02', first: 'Claire', last: 'Levesque', phone: '(212) 555-0247', email: 'c.levesque@email.com', visits: 12, lastVisit: '2026-04-22', status: 'regular', notes: 'Loves seasonal nail art.', preferredTech: 'jade', spend: 1620 },
  { id: 'c03', first: 'Olivia', last: 'Bennett', phone: '(212) 555-0391', email: 'olivia.b@email.com', visits: 8, lastVisit: '2026-04-15', status: 'regular', notes: '', preferredTech: 'mia', spend: 940 },
  { id: 'c04', first: 'Isla', last: 'Romano', phone: '(212) 555-0463', email: 'isla.romano@email.com', visits: 31, lastVisit: '2026-05-01', status: 'vip', notes: 'Always books 90-min slot. Early bird.', preferredTech: 'sofia', spend: 6120 },
  { id: 'c05', first: 'Margaux', last: 'Beaumont', phone: '(212) 555-0518', email: 'margaux@email.com', visits: 5, lastVisit: '2026-03-30', status: 'regular', notes: '', preferredTech: null, spend: 480 },
  { id: 'c06', first: 'Camille', last: 'Aoki', phone: '(212) 555-0674', email: 'camille.aoki@email.com', visits: 19, lastVisit: '2026-04-29', status: 'vip', notes: 'Gel only. No acrylics.', preferredTech: 'mia', spend: 2980 },
  { id: 'c07', first: 'Ava', last: 'Castellano', phone: '(212) 555-0721', email: 'ava.c@email.com', visits: 2, lastVisit: '2026-04-10', status: 'new', notes: 'First visit was a gift card.', preferredTech: null, spend: 190 },
  { id: 'c08', first: 'Sienna', last: 'Park', phone: '(212) 555-0836', email: 'sienna.park@email.com', visits: 7, lastVisit: '2026-04-18', status: 'regular', notes: '', preferredTech: 'jade', spend: 820 },
  { id: 'c09', first: 'Lucia', last: 'Marchetti', phone: '(212) 555-0942', email: 'l.marchetti@email.com', visits: 14, lastVisit: '2026-04-25', status: 'regular', notes: 'Brings referrals frequently.', preferredTech: 'lena', spend: 1740 },
  { id: 'c10', first: 'Aria', last: 'Kowalski', phone: '(212) 555-1001', email: 'aria.k@email.com', visits: 1, lastVisit: '2026-05-02', status: 'new', notes: '', preferredTech: null, spend: 85 },
  { id: 'c11', first: 'Penelope', last: 'Voss', phone: '(212) 555-1147', email: 'p.voss@email.com', visits: 22, lastVisit: '2026-04-30', status: 'vip', notes: 'Sensitive skin. Avoid strong fragrances.', preferredTech: 'sofia', spend: 3740 },
  { id: 'c12', first: 'Genevieve', last: 'Hart', phone: '(212) 555-1223', email: 'gen.hart@email.com', visits: 9, lastVisit: '2026-04-12', status: 'regular', notes: '', preferredTech: 'mia', spend: 1100 },
  { id: 'c13', first: 'Elise', last: 'Devereux', phone: '(212) 555-1388', email: 'elise.d@email.com', visits: 3, lastVisit: '2026-03-22', status: 'regular', notes: '', preferredTech: null, spend: 320 },
  { id: 'c14', first: 'Charlotte', last: 'Linden', phone: '(212) 555-1452', email: 'c.linden@email.com', visits: 16, lastVisit: '2026-04-27', status: 'regular', notes: 'Combo bookings only.', preferredTech: 'lena', spend: 2240 },
  { id: 'c15', first: 'Amelia', last: 'Quinn', phone: '(212) 555-1567', email: 'amelia.q@email.com', visits: 28, lastVisit: '2026-05-01', status: 'vip', notes: 'Monthly standing appointment, 3rd Thursday.', preferredTech: 'jade', spend: 5160 },
  { id: 'c16', first: 'Beatrice', last: 'Hollow', phone: '(212) 555-1634', email: 'bea.hollow@email.com', visits: 6, lastVisit: '2026-04-08', status: 'regular', notes: '', preferredTech: null, spend: 640 },
  { id: 'c17', first: 'Iris', last: 'Yamamoto', phone: '(212) 555-1789', email: 'iris.y@email.com', visits: 11, lastVisit: '2026-04-20', status: 'regular', notes: '', preferredTech: 'priya', spend: 1280 },
  { id: 'c18', first: 'Vivienne', last: 'Leger', phone: '(212) 555-1823', email: 'v.leger@email.com', visits: 35, lastVisit: '2026-04-29', status: 'vip', notes: 'Long-time client since opening.', preferredTech: 'sofia', spend: 7420 },
  { id: 'c19', first: 'Tess', last: 'McAllister', phone: '(212) 555-1965', email: 'tess.mc@email.com', visits: 4, lastVisit: '2026-03-15', status: 'regular', notes: '', preferredTech: null, spend: 390 },
  { id: 'c20', first: 'Hadley', last: 'Sinclair', phone: '(212) 555-2041', email: 'hadley.s@email.com', visits: 18, lastVisit: '2026-04-26', status: 'regular', notes: 'Prefers morning slots.', preferredTech: 'mia', spend: 2560 },
];

export const BOOKING_CLIENTS: BookingClient[] = CLIENTS.map((c) => ({
  id: c.id,
  name: `${c.first} ${c.last}`,
  phone: c.phone,
  vip: c.status === 'vip',
  lastVisit: c.lastVisit,
  lastService: 'Gel Manicure',
  visits: c.visits,
}));
