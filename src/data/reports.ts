// Dynamic report data derived from appointment generation
import { getAppointments, getAppointmentsForRange } from './appointments';
import { getTechsForStore, STAFF_MAP } from './staff';
import { fmtKey } from '../utils/time';
import type { Appointment } from '../types/models';

// ─── Seeded random helper (for sparklines/variation) ───
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ─── Helpers ──────────────────────────────────────────

function totalRevenue(appts: Appointment[]): number {
  return appts.reduce((sum, a) => sum + (a.price ?? 0), 0);
}

function dayLabel(d: Date): string {
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()];
}

const DAY_NAMES_FULL = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const MONTH_ABBR = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function fmtShortDate(d: Date): string {
  return `${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()]}, ${MONTH_ABBR[d.getMonth()]} ${d.getDate()}`;
}

// ─── KPI Data ─────────────────────────────────────────

export function getKpiData(storeId?: string | 'all') {
  const today = new Date();
  const todayKey = fmtKey(today);
  const todayAppts = getAppointments(todayKey, storeId);
  const todayRev = totalRevenue(todayAppts);

  // Build sparkline from last 7 days
  const sparkline: number[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dayAppts = getAppointments(fmtKey(d), storeId);
    sparkline.push(totalRevenue(dayAppts));
  }

  const prevDayAppts = getAppointments(fmtKey(new Date(today.getTime() - 86400000)), storeId);
  const prevRev = totalRevenue(prevDayAppts);
  const change = prevRev > 0 ? Math.round(((todayRev - prevRev) / prevRev) * 100) : 0;

  const totalAppts = todayAppts.length;
  const nowMin = today.getHours() * 60 + today.getMinutes();
  const remaining = todayAppts.filter((a) => a.startMin > nowMin).length;

  const avgTicket = totalAppts > 0 ? Math.round(todayRev / totalAppts) : 0;
  // Avg ticket sparkline
  const avgSparkline: number[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dayAppts = getAppointments(fmtKey(d), storeId);
    avgSparkline.push(dayAppts.length > 0 ? Math.round(totalRevenue(dayAppts) / dayAppts.length) : 0);
  }
  const prevAvg = avgSparkline.length >= 2 ? avgSparkline[avgSparkline.length - 2] : avgTicket;
  const avgChange = prevAvg > 0 ? Math.round(((avgTicket - prevAvg) / prevAvg) * 100) : 0;

  // Utilization: % of tech shift hours that are booked
  const techs = getTechsForStore(storeId);
  const dayOfWeek = (['sun','mon','tue','wed','thu','fri','sat'] as const)[today.getDay()];
  let totalShiftMins = 0;
  let totalBookedMins = 0;
  techs.forEach((tech) => {
    const sched = tech.schedule[dayOfWeek];
    if (sched.off) return;
    const start = parseInt(sched.start.split(':')[0]) * 60;
    const end = parseInt(sched.end.split(':')[0]) * 60;
    totalShiftMins += end - start;
    const techAppts = todayAppts.filter((a) => a.staffId === tech.id);
    totalBookedMins += techAppts.reduce((s, a) => s + (a.endMin - a.startMin), 0);
  });
  const utilization = totalShiftMins > 0 ? Math.min(100, Math.round((totalBookedMins / totalShiftMins) * 100)) : 0;

  return {
    todayRevenue: { value: todayRev, change, sparkline },
    appointments: { value: totalAppts, remaining },
    avgTicket: { value: avgTicket, change: avgChange, sparkline: avgSparkline },
    utilization: { value: utilization },
  };
}

// ─── Weekly Revenue ───────────────────────────────────

export function getWeeklyRevenue(storeId?: string | 'all') {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0=Sun
  // Start from Monday of current week
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));

  const data: { day: string; amount: number }[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const appts = getAppointments(fmtKey(d), storeId);
    data.push({ day: dayLabel(d), amount: totalRevenue(appts) });
  }
  return data;
}

// ─── Monthly Revenue ──────────────────────────────────

export function getMonthlyRevenue(storeId?: string | 'all') {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const data: { day: string; amount: number }[] = [];
  for (let i = 1; i <= daysInMonth; i++) {
    const d = new Date(year, month, i);
    const appts = getAppointments(fmtKey(d), storeId);
    data.push({ day: String(i), amount: totalRevenue(appts) });
  }
  return data;
}

// ─── Top Performers ───────────────────────────────────

export function getTopPerformers(storeId?: string | 'all') {
  const todayAppts = getAppointments(fmtKey(new Date()), storeId);
  const techMap: Record<string, { revenue: number; appointments: number }> = {};

  todayAppts.forEach((a) => {
    if (!techMap[a.staffId]) techMap[a.staffId] = { revenue: 0, appointments: 0 };
    techMap[a.staffId].revenue += a.price ?? 0;
    techMap[a.staffId].appointments += 1;
  });

  return Object.entries(techMap)
    .map(([id, data]) => {
      const staff = STAFF_MAP[id];
      if (!staff || staff.role !== 'Staff') return null;
      return {
        id,
        name: `${staff.first} ${staff.last.charAt(0)}.`,
        initials: staff.initials,
        gold: staff.gold,
        revenue: data.revenue,
        appointments: data.appointments,
      };
    })
    .filter(Boolean)
    .sort((a, b) => b!.revenue - a!.revenue)
    .slice(0, 5) as { id: string; name: string; initials: string; gold: boolean; revenue: number; appointments: number }[];
}

// ─── Service Mix ──────────────────────────────────────

const SERVICE_CATEGORIES: Record<string, string> = {
  classic: 'Manicure', gel: 'Manicure', gelArt: 'Manicure',
  fullSet: 'Manicure', fill: 'Manicure', dipPowder: 'Manicure',
  pediClassic: 'Pedicure', pediSpa: 'Pedicure', pediGel: 'Pedicure',
  combo: 'Combo', removal: 'Add-on', repair: 'Add-on',
};

export function getServiceMix(startDate: Date, endDate: Date, storeId?: string | 'all') {
  const appts = getAppointmentsForRange(startDate, endDate, storeId);
  const catRev: Record<string, number> = { Manicure: 0, Pedicure: 0, Combo: 0, 'Add-on': 0 };

  appts.forEach((a) => {
    const cat = SERVICE_CATEGORIES[a.serviceKey] ?? 'Manicure';
    catRev[cat] += a.price ?? 0;
  });

  const total = Object.values(catRev).reduce((s, v) => s + v, 0) || 1;
  return Object.entries(catRev).map(([category, revenue]) => ({
    category,
    revenue,
    percentage: Math.round((revenue / total) * 100),
  }));
}

// ─── Tech Leaderboard ─────────────────────────────────

export function getTechLeaderboard(startDate: Date, endDate: Date, storeId?: string | 'all') {
  const appts = getAppointmentsForRange(startDate, endDate, storeId);
  const techMap: Record<string, { revenue: number; appointments: number }> = {};

  appts.forEach((a) => {
    if (!techMap[a.staffId]) techMap[a.staffId] = { revenue: 0, appointments: 0 };
    techMap[a.staffId].revenue += a.price ?? 0;
    techMap[a.staffId].appointments += 1;
  });

  return Object.entries(techMap)
    .map(([id, data]) => {
      const staff = STAFF_MAP[id];
      if (!staff || staff.role !== 'Staff') return null;
      return {
        id,
        name: `${staff.first} ${staff.last.charAt(0)}.`,
        initials: staff.initials,
        gold: staff.gold,
        revenue: data.revenue,
        appointments: data.appointments,
      };
    })
    .filter(Boolean)
    .sort((a, b) => b!.revenue - a!.revenue) as { id: string; name: string; initials: string; gold: boolean; revenue: number; appointments: number }[];
}

// ─── Hourly Breakdown ─────────────────────────────────

export function getHourlyBreakdown(storeId?: string | 'all') {
  const todayAppts = getAppointments(fmtKey(new Date()), storeId);
  const hours: { hour: string; count: number }[] = [];
  for (let h = 9; h <= 19; h++) {
    const label = h < 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h - 12} PM`;
    const startMin = h * 60;
    const endMin = (h + 1) * 60;
    const count = todayAppts.filter((a) => a.startMin >= startMin && a.startMin < endMin).length;
    hours.push({ hour: label, count });
  }
  return hours;
}

// ─── Ops Data ─────────────────────────────────────────

export function getOpsData(storeId?: string | 'all') {
  const todayAppts = getAppointments(fmtKey(new Date()), storeId);
  const nowMin = new Date().getHours() * 60 + new Date().getMinutes();

  const booked = todayAppts.length;
  const waiting = todayAppts.filter((a) => a.status === 'checked-in').length;
  const inService = todayAppts.filter((a) => a.status === 'started').length;
  const readyCheckout = todayAppts.filter((a) => a.status === 'ended').length;

  return {
    bookedToday: booked,
    waiting: Math.max(waiting, todayAppts.filter((a) => a.status === 'pending' && a.startMin <= nowMin + 15 && a.startMin >= nowMin - 15).length),
    inService: Math.max(inService, todayAppts.filter((a) => a.status === 'confirmed' && a.startMin <= nowMin && a.endMin > nowMin).length > 0 ? 3 : 0),
    readyCheckout: Math.max(readyCheckout, todayAppts.filter((a) => a.status === 'confirmed' && a.endMin <= nowMin && a.endMin >= nowMin - 30).length),
  };
}

// ─── Payroll Data ─────────────────────────────────────

export function getPayrollData(startDate: Date, endDate: Date, storeId?: string | 'all') {
  const appts = getAppointmentsForRange(startDate, endDate, storeId);
  const techs = getTechsForStore(storeId).filter((s) => s.role === 'Staff');
  const numDays = Math.max(1, Math.round((endDate.getTime() - startDate.getTime()) / 86400000) + 1);

  const techData = techs.map((tech) => {
    const techAppts = appts.filter((a) => a.staffId === tech.id);
    const serviceSales = totalRevenue(techAppts);
    const rate = tech.commissionRate ?? 50;
    const commission = Math.round(serviceSales * (rate / 100));
    // Estimate hours from schedule
    const dayOfWeekMap = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;
    let totalHours = 0;
    const cursor = new Date(startDate);
    while (cursor <= endDate) {
      const dow = dayOfWeekMap[cursor.getDay()];
      const sched = tech.schedule[dow];
      if (!sched.off) {
        const startH = parseInt(sched.start.split(':')[0]);
        const endH = parseInt(sched.end.split(':')[0]);
        totalHours += endH - startH;
      }
      cursor.setDate(cursor.getDate() + 1);
    }
    // Seed tips from tech id + date range for deterministic variation
    const seed = tech.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0) + numDays;
    const rand = mulberry32(seed);
    const tips = Math.round(serviceSales * (0.12 + rand() * 0.08));
    const deductions = Math.round(commission * 0.08 + totalHours * 0.6);
    const totalPayout = commission + tips - deductions;

    return {
      id: tech.id,
      name: `${tech.first} ${tech.last}`,
      initials: tech.initials,
      gold: tech.gold,
      compensationType: tech.compensationType,
      commissionRate: rate,
      hours: Math.round(totalHours * 10) / 10,
      serviceSales,
      commission,
      tips,
      deductions,
      totalPayout: Math.max(0, totalPayout),
    };
  });

  return {
    totalPayout: techData.reduce((s, t) => s + t.totalPayout, 0),
    serviceSales: techData.reduce((s, t) => s + t.serviceSales, 0),
    totalTips: techData.reduce((s, t) => s + t.tips, 0),
    deductions: techData.reduce((s, t) => s + t.deductions, 0),
    technicians: techData.sort((a, b) => b.totalPayout - a.totalPayout),
  };
}

// ─── Staff Earnings (for individual staff view) ───────

export function getStaffEarnings(
  staffId: string,
  startDate: Date,
  endDate: Date,
  storeId?: string | 'all'
) {
  const staff = STAFF_MAP[staffId];
  if (!staff) {
    return {
      totalEarnings: 0,
      breakdown: { commission: 0, tips: 0, hourly: 0 },
      hoursWorked: 0,
      apptsCompleted: 0,
      avgTicket: 0,
      dailyBreakdown: [],
    };
  }

  const rate = staff.commissionRate ?? 50;
  const dayOfWeekMap = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;
  const dailyBreakdown: { date: string; hours: number; appts: number; earnings: number; isOff?: boolean }[] = [];
  let totalHours = 0;
  let totalAppts = 0;
  let totalRevAll = 0;
  let totalTips = 0;

  const cursor = new Date(startDate);
  while (cursor <= endDate) {
    const dow = dayOfWeekMap[cursor.getDay()];
    const sched = staff.schedule[dow];
    const dateKey = fmtKey(cursor);
    const dayAppts = getAppointments(dateKey, storeId).filter(
      (a) => a.staffId === staffId
    );

    if (sched.off) {
      dailyBreakdown.push({ date: fmtShortDate(cursor), hours: 0, appts: 0, earnings: 0, isOff: true });
    } else {
      const startH = parseInt(sched.start.split(':')[0]);
      const endH = parseInt(sched.end.split(':')[0]);
      const hours = endH - startH;
      totalHours += hours;

      const dayRev = totalRevenue(dayAppts);
      totalRevAll += dayRev;
      totalAppts += dayAppts.length;

      const dayCommission = Math.round(dayRev * (rate / 100));
      const seed = staffId.split('').reduce((a, c) => a + c.charCodeAt(0), 0) + cursor.getDate();
      const rand = mulberry32(seed);
      const dayTips = Math.round(dayRev * (0.1 + rand() * 0.1));
      totalTips += dayTips;

      dailyBreakdown.push({
        date: fmtShortDate(cursor),
        hours,
        appts: dayAppts.length,
        earnings: dayCommission + dayTips,
      });
    }

    cursor.setDate(cursor.getDate() + 1);
  }

  const totalCommission = Math.round(totalRevAll * (rate / 100));
  const hourlyEarnings = staff.compensationType === 'hourly' && staff.hourlyRate
    ? Math.round(totalHours * staff.hourlyRate)
    : 0;
  const totalEarnings = totalCommission + totalTips + hourlyEarnings;

  return {
    totalEarnings,
    breakdown: { commission: totalCommission, tips: totalTips, hourly: hourlyEarnings },
    hoursWorked: Math.round(totalHours * 10) / 10,
    apptsCompleted: totalAppts,
    avgTicket: totalAppts > 0 ? Math.round(totalRevAll / totalAppts) : 0,
    dailyBreakdown,
  };
}

// ─── Backward-compatible static exports ───────────────
// These are kept for any code that still imports the constants directly.
// They default to all stores.

export const KPI_DATA = getKpiData('all');
export const WEEKLY_REVENUE = getWeeklyRevenue('all');
export const MONTHLY_REVENUE = getMonthlyRevenue('all');
export const TOP_PERFORMERS = getTopPerformers('all');

const weekStart = new Date();
weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7));
const weekEnd = new Date(weekStart);
weekEnd.setDate(weekStart.getDate() + 6);

export const SERVICE_MIX = getServiceMix(weekStart, weekEnd, 'all');
export const TECH_LEADERBOARD = getTechLeaderboard(weekStart, weekEnd, 'all');
export const HOURLY_BREAKDOWN = getHourlyBreakdown('all');
export const OPS_DATA = getOpsData('all');
export const PAYROLL_DATA = getPayrollData(
  (() => { const d = new Date(); d.setDate(d.getDate() - 13); return d; })(),
  new Date(),
  'all'
);
export const STAFF_EARNINGS = getStaffEarnings('sofia', weekStart, weekEnd, 'all');
