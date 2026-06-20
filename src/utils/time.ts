// ─── Time utilities (ported from web) ──────────────────

export function fmtTime(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
}

export const fmtClock = fmtTime;

export function fmtKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function startOfWeek(d: Date): Date {
  const x = new Date(d);
  const dow = x.getDay();
  const diff = dow === 0 ? -6 : 1 - dow;
  x.setDate(x.getDate() + diff);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function getGreeting(): string {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return 'Good morning';
  if (h >= 12 && h < 17) return 'Good afternoon';
  return 'Good evening';
}

export function formatDate(d: Date): string {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}`;
}

export function formatDateFull(d: Date): string {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

export function minsSince(iso: string): number {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
}

export function minsUntil(iso: string): number {
  return Math.floor((new Date(iso).getTime() - Date.now()) / 60000);
}

export function buildDateStrip(today: Date, count = 14): Date[] {
  const dates: Date[] = [];
  for (let i = 0; i < count; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    dates.push(d);
  }
  return dates;
}

export const DAY_START_MIN = 480;
export const DAY_END_MIN = 1200;

/**
 * Returns the real time during business hours (8 AM – 8 PM),
 * or a fake 10:00 AM today when outside business hours.
 * This keeps the POC demo useful during evening presentations.
 */
export function getDemoNow(): Date {
  const now = new Date();
  const h = now.getHours();
  if (h >= 8 && h < 20) return now;
  const fake = new Date(now);
  fake.setHours(10, 0, 0, 0);
  return fake;
}
export const DURATION_OPTIONS = [15, 30, 45, 60, 75, 90, 105, 120];
