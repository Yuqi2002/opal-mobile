import type { OpalNotification } from '../types/models';

export const NOTIFICATIONS: OpalNotification[] = [
  { id: 'notif_001', type: 'appt_new', title: 'New Booking', body: 'Emma Fontaine booked Gel Manicure with Sofia R. at 10:30 AM', storeId: 'store_wv', data: { appointmentId: 'apt_1', screen: 'appointmentDetail' }, timestamp: '2026-06-17T09:15:00Z', read: false },
  { id: 'notif_002', type: 'appt_checkin', title: 'Client Checked In', body: 'Claire Levesque has arrived for Classic Manicure', storeId: 'store_wv', data: { appointmentId: 'apt_2', screen: 'appointmentDetail' }, timestamp: '2026-06-17T10:28:00Z', read: false },
  { id: 'notif_003', type: 'svc_checkout', title: 'Ready for Checkout', body: 'Isla Romano is ready for checkout', storeId: 'store_wv', data: { screen: 'appointments' }, timestamp: '2026-06-17T11:30:00Z', read: false },
  { id: 'notif_004', type: 'appt_cancel', title: 'Booking Cancelled', body: "Margaux Beaumont's Classic Manicure at 2:00 PM was cancelled", storeId: 'store_wv', data: {}, timestamp: '2026-06-17T08:45:00Z', read: true },
  { id: 'notif_005', type: 'turn_upcoming', title: 'Your Turn', body: "You're next up in the queue", storeId: 'store_wv', data: { screen: 'turns' }, timestamp: '2026-06-17T14:00:00Z', read: false },
  { id: 'notif_006', type: 'daily_recap', title: 'Good Morning', body: 'Today: 8 appointments, first at 9:30 AM', storeId: 'store_wv', data: { screen: 'home' }, timestamp: '2026-06-17T07:00:00Z', read: true },
  { id: 'notif_007', type: 'appt_reminder', title: 'Upcoming Appointment', body: 'Penelope Voss for Gel Manicure in 1 hour', storeId: 'store_wv', data: { appointmentId: 'apt_5', screen: 'appointmentDetail' }, timestamp: '2026-06-17T13:30:00Z', read: false },
  { id: 'notif_008', type: 'appt_new', title: 'New Booking', body: 'Camille Aoki booked Spa Pedicure with Lena P. at 3:00 PM', storeId: 'store_wv', data: { appointmentId: 'apt_8', screen: 'appointmentDetail' }, timestamp: '2026-06-16T16:20:00Z', read: true },
  { id: 'notif_009', type: 'svc_complete', title: 'Service Complete', body: 'Sofia R. finished Gel Manicure for Emma Fontaine', storeId: 'store_wv', data: {}, timestamp: '2026-06-16T15:30:00Z', read: true },
  { id: 'notif_010', type: 'daily_summary', title: 'Day Summary', body: 'Today: $2,840 revenue, 12 appointments completed', storeId: 'store_wv', data: { screen: 'reports' }, timestamp: '2026-06-16T19:00:00Z', read: true },
];
