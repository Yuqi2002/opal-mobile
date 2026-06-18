import type { TurnService, TurnAddOn, TurnTechState, TurnQueueEntry, CompletedService } from '../types/models';

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
      turnsCompleted: 7,
      completedServices: [
        { serviceId: 'gel_mani', clientInitials: 'AW', time: '9:00', duration: 60, price: 75 },
        { serviceId: 'full_acrylic', clientInitials: 'RJ', time: '10:00', duration: 120, price: 130 },
        { serviceId: 'nail_art', clientInitials: 'TL', time: '11:15', duration: 30, price: 40 },
        { serviceId: 'gel_mani', clientInitials: 'KS', time: '12:00', duration: 60, price: 75 },
        { serviceId: 'classic_mani', clientInitials: 'NP', time: '1:00', duration: 45, price: 45 },
        { serviceId: 'fill_acrylic', clientInitials: 'DM', time: '1:45', duration: 75, price: 80 },
        { serviceId: 'gel_mani', clientInitials: 'HL', time: '2:00', duration: 60, price: 75 },
      ],
      queue: [
        { serviceId: 'gel_mani', type: 'appointment', duration: 60, addOns: [], clientInitials: 'EF', time: '2:30' },
        { serviceId: 'nail_art', type: 'appointment', duration: 30, addOns: ['french'], clientInitials: 'CL', time: '3:30' },
      ],
    },
    {
      techId: 'priya', techName: 'Priya Shah', initials: 'PS', status: 'serving', station: 3, gold: false,
      turnsCompleted: 6,
      completedServices: [
        { serviceId: 'classic_pedi', clientInitials: 'BW', time: '9:30', duration: 45, price: 50 },
        { serviceId: 'gel_pedi', clientInitials: 'SC', time: '10:15', duration: 60, price: 80 },
        { serviceId: 'classic_mani', clientInitials: 'JR', time: '11:30', duration: 45, price: 45 },
        { serviceId: 'polish_change', clientInitials: 'MK', time: '12:15', duration: 15, price: 15 },
        { serviceId: 'gel_mani', clientInitials: 'AV', time: '1:00', duration: 60, price: 75 },
        { serviceId: 'classic_pedi', clientInitials: 'TH', time: '2:00', duration: 45, price: 50 },
      ],
      queue: [
        { serviceId: 'classic_mani', type: 'appointment', duration: 45, addOns: [], clientInitials: 'IR', time: '3:15' },
      ],
    },
    {
      techId: 'lena', techName: 'Lena Park', initials: 'LP', status: 'queue', gold: false,
      turnsCompleted: 5,
      completedServices: [
        { serviceId: 'gel_mani', clientInitials: 'WC', time: '9:00', duration: 60, price: 75 },
        { serviceId: 'classic_mani', clientInitials: 'FD', time: '10:00', duration: 45, price: 45 },
        { serviceId: 'gel_pedi', clientInitials: 'YL', time: '11:00', duration: 60, price: 80 },
        { serviceId: 'nail_art', clientInitials: 'RE', time: '12:30', duration: 30, price: 40 },
        { serviceId: 'classic_pedi', clientInitials: 'GN', time: '1:30', duration: 45, price: 50 },
      ],
      queue: [
        { serviceId: 'gel_pedi', type: 'appointment', duration: 60, addOns: ['paraffin'], clientInitials: 'MB', time: '3:00' },
        { serviceId: 'classic_pedi', type: 'walk_in', duration: 45, addOns: [], clientInitials: 'PV', time: '4:00' },
      ],
    },
    {
      techId: 'mia', techName: 'Mia Tanaka', initials: 'MT', status: 'queue', gold: false,
      turnsCompleted: 4,
      completedServices: [
        { serviceId: 'classic_pedi', clientInitials: 'LP', time: '9:30', duration: 45, price: 50 },
        { serviceId: 'gel_mani', clientInitials: 'CN', time: '10:30', duration: 60, price: 75 },
        { serviceId: 'polish_change', clientInitials: 'AG', time: '11:30', duration: 15, price: 15 },
        { serviceId: 'classic_mani', clientInitials: 'RB', time: '12:00', duration: 45, price: 45 },
      ],
      queue: [
        { serviceId: 'classic_pedi', type: 'walk_in', duration: 45, addOns: [], clientInitials: 'OB', time: '3:00' },
      ],
    },
    {
      techId: 'jade', techName: 'Jade Kim', initials: 'JK', status: 'break', gold: false,
      turnsCompleted: 3,
      completedServices: [
        { serviceId: 'nail_art', clientInitials: 'SM', time: '9:00', duration: 30, price: 40 },
        { serviceId: 'gel_mani', clientInitials: 'VR', time: '10:00', duration: 60, price: 75 },
        { serviceId: 'full_acrylic', clientInitials: 'KT', time: '11:00', duration: 120, price: 130 },
      ],
      queue: [],
    },
  ];
}
