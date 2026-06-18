// Mock report data for Owner dashboard

export const WEEKLY_REVENUE = [
  { day: 'Mon', amount: 2840 },
  { day: 'Tue', amount: 3120 },
  { day: 'Wed', amount: 2560 },
  { day: 'Thu', amount: 3450 },
  { day: 'Fri', amount: 3890 },
  { day: 'Sat', amount: 4280 },
  { day: 'Sun', amount: 0 },
];

export const KPI_DATA = {
  todayRevenue: { value: 4280, change: 12, sparkline: [3200, 3400, 2900, 3600, 3100, 4000, 4280] },
  appointments: { value: 34, remaining: 6 },
  avgTicket: { value: 126, change: 8, sparkline: [118, 122, 115, 128, 120, 130, 126] },
  utilization: { value: 78 },
};

export const TOP_PERFORMERS = [
  { id: 'sofia', name: 'Sofia R.', initials: 'SR', gold: true, revenue: 1420, appointments: 12 },
  { id: 'mia', name: 'Mia T.', initials: 'MT', gold: false, revenue: 1180, appointments: 10 },
  { id: 'jade', name: 'Jade K.', initials: 'JK', gold: false, revenue: 980, appointments: 8 },
];

export const SERVICE_MIX = [
  { category: 'Manicure', revenue: 8400, percentage: 42 },
  { category: 'Pedicure', revenue: 5600, percentage: 28 },
  { category: 'Combo', revenue: 4200, percentage: 21 },
  { category: 'Add-on', revenue: 1800, percentage: 9 },
];

export const TECH_LEADERBOARD = [
  { id: 'sofia', name: 'Sofia R.', initials: 'SR', gold: true, revenue: 1420, appointments: 12 },
  { id: 'mia', name: 'Mia T.', initials: 'MT', gold: false, revenue: 1180, appointments: 10 },
  { id: 'jade', name: 'Jade K.', initials: 'JK', gold: false, revenue: 980, appointments: 8 },
  { id: 'lena', name: 'Lena P.', initials: 'LP', gold: false, revenue: 860, appointments: 7 },
  { id: 'priya', name: 'Priya S.', initials: 'PS', gold: false, revenue: 640, appointments: 5 },
];

export const HOURLY_BREAKDOWN = [
  { hour: '9 AM', count: 4 }, { hour: '10 AM', count: 6 }, { hour: '11 AM', count: 8 },
  { hour: '12 PM', count: 5 }, { hour: '1 PM', count: 7 }, { hour: '2 PM', count: 9 },
  { hour: '3 PM', count: 8 }, { hour: '4 PM', count: 6 }, { hour: '5 PM', count: 4 },
  { hour: '6 PM', count: 3 }, { hour: '7 PM', count: 2 },
];

export const OPS_DATA = {
  bookedToday: 12,
  waiting: 2,
  inService: 3,
  readyCheckout: 1,
};

export const PAYROLL_DATA = {
  totalPayout: 8420,
  serviceSales: 16840,
  totalTips: 2680,
  deductions: 1125,
  technicians: [
    { id: 'sofia', name: 'Sofia Reyes', initials: 'SR', gold: true, compensationType: 'commission' as const, commissionRate: 50, hours: 72.5, serviceSales: 4280, commission: 2140, tips: 680, deductions: 225, totalPayout: 2595 },
    { id: 'mia', name: 'Mia Tanaka', initials: 'MT', gold: false, compensationType: 'commission' as const, commissionRate: 50, hours: 65, serviceSales: 3540, commission: 1770, tips: 520, deductions: 185, totalPayout: 2105 },
    { id: 'jade', name: 'Jade Kim', initials: 'JK', gold: false, compensationType: 'commission' as const, commissionRate: 50, hours: 68, serviceSales: 2940, commission: 1470, tips: 480, deductions: 165, totalPayout: 1785 },
    { id: 'lena', name: 'Lena Park', initials: 'LP', gold: false, compensationType: 'commission' as const, commissionRate: 50, hours: 60, serviceSales: 2580, commission: 1290, tips: 420, deductions: 145, totalPayout: 1565 },
    { id: 'priya', name: 'Priya Shah', initials: 'PS', gold: false, compensationType: 'commission' as const, commissionRate: 45, hours: 48, serviceSales: 1920, commission: 864, tips: 340, deductions: 115, totalPayout: 1089 },
  ],
};

export const STAFF_EARNINGS = {
  totalEarnings: 2595,
  breakdown: { commission: 2140, tips: 680, hourly: 0 },
  hoursWorked: 72.5,
  apptsCompleted: 48,
  avgTicket: 89,
  dailyBreakdown: [
    { date: 'Mon, Jun 15', hours: 8.0, appts: 6, earnings: 420 },
    { date: 'Tue, Jun 16', hours: 7.5, appts: 5, earnings: 380 },
    { date: 'Wed, Jun 17', hours: 0, appts: 0, earnings: 0, isOff: true },
    { date: 'Thu, Jun 18', hours: 8.0, appts: 7, earnings: 460 },
    { date: 'Fri, Jun 19', hours: 8.0, appts: 6, earnings: 415 },
    { date: 'Sat, Jun 20', hours: 7.0, appts: 5, earnings: 350 },
    { date: 'Sun, Jun 21', hours: 0, appts: 0, earnings: 0, isOff: true },
  ],
};
