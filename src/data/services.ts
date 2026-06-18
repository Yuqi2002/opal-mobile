import type { Service, Product, Role, AppointmentType } from '../types/models';

export const SERVICES: Service[] = [
  { id: 's01', category: 'Manicure', name: 'Classic Manicure', duration: 45, price: 45, description: 'Shape, buff, cuticle care and polish of your choice.', active: true, turnIcon: 'nail_polish' },
  { id: 's02', category: 'Manicure', name: 'Gel Manicure', duration: 60, price: 75, description: 'Long-lasting gel polish with full manicure prep.', active: true, turnIcon: 'gel_lamp' },
  { id: 's03', category: 'Manicure', name: 'Gel + Nail Art', duration: 90, price: 115, description: 'Gel manicure with custom nail art designs.', active: true, turnIcon: 'brush' },
  { id: 's04', category: 'Manicure', name: 'Full Set Acrylics', duration: 120, price: 130, description: 'Full acrylic nail set with shape and polish.', active: true, turnIcon: 'acrylic' },
  { id: 's05', category: 'Manicure', name: 'Acrylic Fill', duration: 75, price: 80, description: 'Fill and reshape existing acrylic nails.', active: true, turnIcon: 'nail_file' },
  { id: 's06', category: 'Manicure', name: 'Dip Powder Set', duration: 75, price: 85, description: 'Dip powder application for a durable, chip-free finish.', active: true, turnIcon: 'drop' },
  { id: 's07', category: 'Manicure', name: 'Soak-off Removal', duration: 30, price: 25, description: 'Safe removal of gel, acrylic or dip powder.', active: true, turnIcon: 'soak' },
  { id: 's08', category: 'Manicure', name: 'Nail Repair', duration: 20, price: 15, description: 'Repair for broken or cracked nails.', active: true, turnIcon: 'repair' },
  { id: 's09', category: 'Pedicure', name: 'Classic Pedicure', duration: 45, price: 50, description: 'Soak, scrub, shape, cuticle care and polish.', active: true, turnIcon: 'foot' },
  { id: 's10', category: 'Pedicure', name: 'Spa Pedicure', duration: 75, price: 85, description: 'Deluxe pedicure with hot stone massage and mask.', active: true, turnIcon: 'flower' },
  { id: 's11', category: 'Pedicure', name: 'Gel Pedicure', duration: 60, price: 80, description: 'Classic pedicure with long-lasting gel polish.', active: true, turnIcon: 'gel_lamp' },
  { id: 's12', category: 'Combo', name: 'Mani + Pedi Combo', duration: 105, price: 90, description: 'Classic manicure and pedicure bundle.', active: true, turnIcon: 'combo' },
  { id: 's13', category: 'Combo', name: 'Gel Mani + Pedi Combo', duration: 120, price: 145, description: 'Gel manicure and classic pedicure bundle.', active: true, turnIcon: 'combo' },
  { id: 's14', category: 'Add-on', name: 'Chrome Powder', duration: 15, price: 20, description: 'Metallic chrome finish applied over gel.', active: true, turnIcon: 'chrome' },
  { id: 's15', category: 'Add-on', name: 'Nail Art (per nail)', duration: 10, price: 12, description: 'Custom art design per nail.', active: true, turnIcon: 'palette' },
  { id: 's16', category: 'Add-on', name: 'Paraffin Wax Treatment', duration: 15, price: 20, description: 'Warm paraffin wax for deep skin hydration.', active: false, turnIcon: 'wax' },
  { id: 's17', category: 'Add-on', name: 'Cuticle Oil Treatment', duration: 10, price: 8, description: 'Nourishing oil treatment for cuticle health.', active: false, turnIcon: 'drop' },
];

export const PRODUCTS: Product[] = [
  { id: 'p01', category: 'Polish', name: 'OPI Infinite Shine — Bubble Bath', price: 14, sku: 'OPI-IS-001', stock: 48, active: true, description: 'Sheer, natural pink gel-effect lacquer.' },
  { id: 'p02', category: 'Polish', name: 'OPI Infinite Shine — Lincoln Park After Dark', price: 14, sku: 'OPI-IS-002', stock: 36, active: true, description: 'Deep, vampy blackened plum.' },
  { id: 'p03', category: 'Polish', name: 'Essie Gel Couture — Fairy Tailor', price: 12, sku: 'ESS-GC-001', stock: 29, active: true, description: 'Sheer lavender with shimmer.' },
  { id: 'p04', category: 'Polish', name: 'CND Shellac — Romantique', price: 16, sku: 'CND-SH-001', stock: 42, active: true, description: 'Sheer milky pink gel polish.' },
  { id: 'p05', category: 'Treatment', name: 'OPI Nail Envy — Original', price: 22, sku: 'OPI-NE-001', stock: 18, active: true, description: 'Strengthening nail treatment.' },
  { id: 'p06', category: 'Treatment', name: 'CND SolarOil', price: 10, sku: 'CND-SO-001', stock: 56, active: true, description: 'Cuticle and nail oil blend.' },
  { id: 'p07', category: 'Care', name: 'Deborah Lippmann Rich Girl Hand Cream', price: 28, sku: 'DL-HC-001', stock: 22, active: true, description: 'Luxurious SPF 25 hand cream.' },
  { id: 'p08', category: 'Care', name: 'Burt\'s Bees Lemon Butter Cuticle Cream', price: 8, sku: 'BB-CC-001', stock: 40, active: true, description: 'Natural cuticle conditioning cream.' },
  { id: 'p09', category: 'Tools', name: 'Crystal Nail File — Rose Gold', price: 18, sku: 'TNF-CF-001', stock: 15, active: true, description: 'Tempered glass nail file.' },
  { id: 'p10', category: 'Gift', name: 'Opal Gift Card — $50', price: 50, sku: 'OPL-GC-050', stock: 100, active: true, description: 'Gift card redeemable at any Opal location.' },
  { id: 'p11', category: 'Gift', name: 'Opal Gift Card — $100', price: 100, sku: 'OPL-GC-100', stock: 80, active: true, description: 'Gift card redeemable at any Opal location.' },
  { id: 'p12', category: 'Polish', name: 'Gelish — Forever Fabulous', price: 15, sku: 'GEL-FF-001', stock: 32, active: true, description: 'Rose gold gel polish.' },
];

export const ROLES: Role[] = [
  { id: 'r01', name: 'Main Owner', description: 'Primary business owner with full administrative access.', color: '#1A1A18' },
  { id: 'r02', name: 'Owner', description: 'Business owner overseeing salon operations.', color: '#C9A84C' },
  { id: 'r03', name: 'Receptionist', description: 'Manages scheduling, client intake, and daily operations.', color: '#9E9E9E' },
  { id: 'r04', name: 'Staff', description: 'Salon technician performing nail services.', color: '#5A9DB5' },
];

export const APPT_TYPES: AppointmentType[] = [
  { id: 'at1', key: 'chosen-tech', label: 'Chosen Tech', color: '#C0392B' },
  { id: 'at2', key: 'misc', label: 'Miscellaneous', color: '#1A1A18' },
  { id: 'at3', key: 'new-customer', label: 'New Customer', color: '#8E44AD' },
  { id: 'at4', key: 'any-tech', label: 'Any Tech', color: '#2980B9' },
  { id: 'at5', key: 'online', label: 'Online', color: '#27AE60' },
  { id: 'at6', key: 'walk-in', label: 'Walk-in', color: '#1B2A4A' },
];

export const SERVICE_CATEGORIES = ['Manicure', 'Pedicure', 'Combo', 'Add-on'] as const;
export const PRODUCT_CATEGORIES = ['Polish', 'Treatment', 'Care', 'Tools', 'Gift'] as const;
