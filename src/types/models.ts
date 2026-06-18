// ─── Opal Mobile — TypeScript Models ───────────────────

export type RoleId = 'r01' | 'r02' | 'r03' | 'r04';

export interface Role {
  id: RoleId;
  name: string;
  description: string;
  color: string;
}

export interface DaySchedule {
  off: boolean;
  start: string;
  end: string;
}

export type WeekSchedule = Record<'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun', DaySchedule>;

export type CompensationType = 'commission' | 'hourly' | 'both';

export interface Staff {
  id: string;
  first: string;
  last: string;
  initials: string;
  role: string;
  roleIds: RoleId[];
  phone: string;
  email: string;
  shift: string;
  days: string;
  status: 'active' | 'inactive';
  gold: boolean;
  rating: number | null;
  clients: number | null;
  bio: string;
  services: string[];
  schedule: WeekSchedule;
  compensationType: CompensationType;
  commissionRate: number | null;
  hourlyRate: number | null;
}

export interface CalendarStaff {
  id: string;
  first: string;
  last: string;
  initials: string;
  role: string;
  shift: [number, number];
  gold: boolean;
}

export type ClientStatus = 'vip' | 'regular' | 'new';

export interface Client {
  id: string;
  first: string;
  last: string;
  phone: string;
  email: string;
  visits: number;
  lastVisit: string;
  status: ClientStatus;
  notes: string;
  preferredTech: string | null;
  spend: number;
}

export interface BookingClient {
  id: string;
  name: string;
  phone: string;
  vip: boolean;
  lastVisit: string;
  lastService: string;
  visits: number;
}

export type ServiceCategory = 'Manicure' | 'Pedicure' | 'Combo' | 'Add-on';

export interface Service {
  id: string;
  category: ServiceCategory;
  name: string;
  duration: number;
  price: number;
  description: string;
  active: boolean;
  turnIcon: string;
}

export type ProductCategory = 'Polish' | 'Treatment' | 'Care' | 'Tools' | 'Gift';

export interface Product {
  id: string;
  category: ProductCategory;
  name: string;
  price: number;
  sku: string;
  stock: number;
  active: boolean;
  description: string;
}

export type AppointmentStatus = 'confirmed' | 'pending' | 'checked-in' | 'started' | 'ended' | 'finished';

export type AppointmentTypeKey = 'chosen-tech' | 'misc' | 'new-customer' | 'any-tech' | 'online' | 'walk-in';

export interface AppointmentType {
  id: string;
  key: AppointmentTypeKey;
  label: string;
  color: string;
}

export interface AppointmentService {
  name: string;
  price: number;
  techId: string;
  techName: string;
  startMin: number;
  endMin: number;
  mins: number;
}

export interface Appointment {
  id: string;
  apptNum: string;
  staffId: string;
  staffIds?: string[];
  date: string;
  startMin: number;
  endMin: number;
  client: string;
  service: string;
  serviceKey: string;
  status: AppointmentStatus;
  vip: boolean;
  apptType: AppointmentTypeKey;
  notes: string | null;
  price: number;
  services?: AppointmentService[];
}

export interface WaitingEntry {
  id: string;
  name: string;
  service: string;
  arrivedAt: string;
  isVip: boolean;
  notes: string;
  bookedFor: string | null;
}

export interface ActiveService {
  id: string;
  techId: string;
  techName: string;
  clientName: string;
  service: string;
  startedAt: string;
  duration: number;
  endsAt: string;
  status: 'in-progress' | 'ready';
  station: number;
  multiTech: boolean;
}

export interface ReadyCheckout {
  id: string;
  techName: string;
  clientName: string;
  service: string;
  price: number;
  completedAt: string;
  station: number;
}

export type TurnTechStatus = 'queue' | 'serving' | 'break' | 'not_in';

export interface TurnQueueEntry {
  serviceId: string;
  type: 'appointment' | 'walk_in';
  duration: number;
  addOns: string[];
  clientInitials: string;
  time: string;
}

export interface TurnService {
  id: string;
  name: string;
  weight: number;
  duration: number;
  price: number;
  turnIcon: string;
  abbr: string;
  badgeColor: string;
}

export interface TurnAddOn {
  id: string;
  name: string;
  weight: number;
}

export interface Store {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  timezone: string;
  taxRate: number;
  hours: Record<string, { closed: boolean; open: string; close: string }>;
}

export interface UserAccount {
  id: string;
  email: string;
  first: string;
  last: string;
  initials: string;
  role: RoleId;
  roleName: string;
  gold: boolean;
  stores: { id: string; name: string; address: string }[];
  primaryStore: string;
  biometricEnabled: boolean;
}

export interface TimeOffBlock {
  id: string;
  storeId: string;
  techId: string;
  date: string;
  allDay: boolean;
  startMin: number;
  endMin: number;
  reason: string;
}

export interface OpalNotification {
  id: string;
  type: string;
  title: string;
  body: string;
  storeId: string;
  data: { appointmentId?: string; screen?: string };
  timestamp: string;
  read: boolean;
}

export interface NotificationPreferences {
  userId: string;
  preferences: Record<string, boolean>;
}

export interface TurnTechState {
  techId: string;
  techName: string;
  initials: string;
  status: TurnTechStatus;
  station?: number;
  queue: TurnQueueEntry[];
  gold: boolean;
}
