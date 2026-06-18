import type { TurnService, TurnAddOn, TurnTechState, TurnQueueEntry } from '../types/models';

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

export function generateTurnQueueState(): TurnTechState[] {
  return [
    {
      techId: 'sofia', techName: 'Sofia Reyes', initials: 'SR', status: 'serving', station: 1, gold: true,
      queue: [
        { serviceId: 'gel_mani', type: 'appointment', duration: 60, addOns: [], clientInitials: 'EF', time: '2:30' },
        { serviceId: 'nail_art', type: 'appointment', duration: 30, addOns: ['french'], clientInitials: 'CL', time: '3:30' },
      ],
    },
    {
      techId: 'mia', techName: 'Mia Tanaka', initials: 'MT', status: 'queue', gold: false,
      queue: [
        { serviceId: 'classic_pedi', type: 'walk_in', duration: 45, addOns: [], clientInitials: 'OB', time: '3:00' },
      ],
    },
    {
      techId: 'jade', techName: 'Jade Kim', initials: 'JK', status: 'break', gold: false,
      queue: [],
    },
    {
      techId: 'priya', techName: 'Priya Shah', initials: 'PS', status: 'serving', station: 3, gold: false,
      queue: [
        { serviceId: 'classic_mani', type: 'appointment', duration: 45, addOns: [], clientInitials: 'IR', time: '3:15' },
      ],
    },
    {
      techId: 'lena', techName: 'Lena Park', initials: 'LP', status: 'queue', gold: false,
      queue: [
        { serviceId: 'gel_pedi', type: 'appointment', duration: 60, addOns: ['paraffin'], clientInitials: 'MB', time: '3:00' },
        { serviceId: 'classic_pedi', type: 'walk_in', duration: 45, addOns: [], clientInitials: 'PV', time: '4:00' },
      ],
    },
  ];
}
