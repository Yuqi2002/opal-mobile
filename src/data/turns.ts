import type { TurnService, TurnAddOn, TurnTechState, TurnQueueEntry, CompletedService } from '../types/models';
import { getTechsForStore, STAFF_MAP } from './staff';

export const TURN_SERVICES: TurnService[] = [
  { id: 'classic_mani', name: 'Classic Manicure', weight: 0.50, duration: 45, price: 45, turnIcon: 'nail_polish', abbr: 'CM', badgeColor: '#3D3D38' },
  { id: 'gel_mani', name: 'Gel Manicure', weight: 1.00, duration: 60, price: 75, turnIcon: 'gel_lamp', abbr: 'GM', badgeColor: '#1A1A18' },
  { id: 'classic_pedi', name: 'Classic Pedicure', weight: 0.75, duration: 45, price: 50, turnIcon: 'foot', abbr: 'CP', badgeColor: '#8C5A6A' },
  { id: 'gel_pedi', name: 'Gel Pedicure', weight: 1.00, duration: 60, price: 80, turnIcon: 'gel_lamp', abbr: 'GP', badgeColor: '#6B4555' },
  { id: 'full_acrylic', name: 'Full Set Acrylic', weight: 1.50, duration: 120, price: 130, turnIcon: 'acrylic', abbr: 'FA', badgeColor: '#8A6830' },
  { id: 'fill_acrylic', name: 'Acrylic Fill', weight: 1.00, duration: 75, price: 80, turnIcon: 'nail_file', abbr: 'AF', badgeColor: '#6E5328' },
  { id: 'nail_art', name: 'Nail Art', weight: 0.50, duration: 30, price: 40, turnIcon: 'brush', abbr: 'NA', badgeColor: '#A68450' },
  { id: 'polish_change', name: 'Polish Change', weight: 0.25, duration: 15, price: 15, turnIcon: 'nail_polish', abbr: 'PC', badgeColor: '#B08A97' },
];

export const TURN_ADDONS: TurnAddOn[] = [
  { id: 'french', name: 'French Tips', weight: 0.25 },
  { id: 'chrome', name: 'Chrome Powder', weight: 0.25 },
  { id: 'art', name: 'Nail Art', weight: 0.50 },
  { id: 'paraffin', name: 'Paraffin Wax', weight: 0.25 },
];

// Seeded RNG for deterministic turn generation
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const SERVICE_IDS = TURN_SERVICES.map((s) => s.id);
const ADDON_IDS = TURN_ADDONS.map((a) => a.id);
const CLIENT_INITIALS = ['AW','RJ','TL','KS','NP','DM','HL','EF','CL','BW','SC','JR','MK','AV','TH','IR','WC','FD','YL','RE','GN','MB','PV','LP','CN','AG','RB','OB','SM','VR','KT'];
const STATUSES: ('serving' | 'queue' | 'break' | 'not_in')[] = ['serving', 'serving', 'queue', 'queue', 'break'];

function pickTime(rand: () => number, hour: number): string {
  const mins = Math.floor(rand() * 4) * 15;
  const h = hour > 12 ? hour - 12 : hour;
  const suffix = hour >= 12 ? 'PM' : 'AM';
  return `${h}:${mins.toString().padStart(2, '0')}`;
}

export function generateTurnQueueState(storeId?: string | 'all'): TurnTechState[] {
  const techs = getTechsForStore(storeId).filter((s) => s.role === 'Staff');
  if (techs.length === 0) return [];

  // Seed from storeId for per-store variation
  const storeHash = (storeId ?? 'all').split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const rand = mulberry32(storeHash * 31 + 42);

  return techs.map((tech, idx) => {
    const status = STATUSES[idx % STATUSES.length];
    const turnsCompleted = 3 + Math.floor(rand() * 5);

    // Generate completed services
    const completedServices: CompletedService[] = [];
    let hour = parseInt(tech.schedule.mon.off ? tech.schedule.tue.start.split(':')[0] : tech.schedule.mon.start.split(':')[0]) || 9;
    for (let i = 0; i < turnsCompleted; i++) {
      const svcId = SERVICE_IDS[Math.floor(rand() * SERVICE_IDS.length)];
      const svc = TURN_SERVICES.find((s) => s.id === svcId)!;
      completedServices.push({
        serviceId: svcId,
        clientInitials: CLIENT_INITIALS[Math.floor(rand() * CLIENT_INITIALS.length)],
        time: pickTime(rand, hour),
        duration: svc.duration,
        price: svc.price,
      });
      hour += Math.ceil(svc.duration / 60);
    }

    // Generate queue
    const queueSize = status === 'break' ? 0 : 1 + Math.floor(rand() * 2);
    const queue: TurnQueueEntry[] = [];
    for (let i = 0; i < queueSize; i++) {
      const svcId = SERVICE_IDS[Math.floor(rand() * SERVICE_IDS.length)];
      const svc = TURN_SERVICES.find((s) => s.id === svcId)!;
      const hasAddon = rand() < 0.3;
      queue.push({
        serviceId: svcId,
        type: rand() < 0.7 ? 'appointment' : 'walk_in',
        duration: svc.duration,
        addOns: hasAddon ? [ADDON_IDS[Math.floor(rand() * ADDON_IDS.length)]] : [],
        clientInitials: CLIENT_INITIALS[Math.floor(rand() * CLIENT_INITIALS.length)],
        time: pickTime(rand, hour + i),
      });
    }

    return {
      techId: tech.id,
      techName: `${tech.first} ${tech.last}`,
      initials: tech.initials,
      status,
      station: status === 'serving' ? idx + 1 : undefined,
      gold: tech.gold,
      turnsCompleted,
      completedServices,
      queue,
    };
  });
}
