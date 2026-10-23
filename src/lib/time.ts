import type { CollectionEntry } from 'astro:content';
import site from '../data/site.json';

export const TIME_ZONE = 'Europe/Berlin';

const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;
const DAY_NAMES: Record<string, string> = {
  mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday', fri: 'Friday', sat: 'Saturday', sun: 'Sunday',
};
const WEEK_ORDER = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

/** Offset of a time zone from UTC in minutes at the given instant. */
function zoneOffset(timestamp: number, timeZone = TIME_ZONE): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  }).formatToParts(new Date(timestamp));
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  const asUtc = Date.UTC(get('year'), get('month') - 1, get('day'), get('hour'), get('minute'), get('second'));
  return Math.round((asUtc - timestamp) / 60000);
}

/** Convert a Munich wall-clock date + time ("2026-09-26", "14:00") to an absolute Date. */
export function munichTime(date: string, time = '00:00'): Date {
  const [y, m, d] = date.split('-').map(Number);
  const [hh, mm] = time.split(':').map(Number);
  const guess = Date.UTC(y, m - 1, d, hh, mm);
  let ts = guess - zoneOffset(guess) * 60000;
  const corrected = guess - zoneOffset(ts) * 60000;
  if (corrected !== ts) ts = corrected;
  return new Date(ts);
}

/** Today's date in Munich as YYYY-MM-DD. */
export function todayInMunich(now = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE }).format(now);
}

export const shortTime = (time?: string) => (time ? time.slice(0, 5).padStart(5, '0') : undefined);

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function dateParts(date: string) {
  const d = new Date(`${date}T12:00:00Z`);
  return {
    day: String(d.getUTCDate()).padStart(2, '0'),
    month: MONTHS[d.getUTCMonth()],
    year: String(d.getUTCFullYear()),
    weekday: WEEKDAYS[d.getUTCDay()],
  };
}

/** "Sat, 26 Sep 2026" — pass { weekday: false } or { year: false } to leave parts out. */
export function formatDate(date: string, { weekday = true, year = true } = {}): string {
  const p = dateParts(date);
  return `${weekday ? `${p.weekday}, ` : ''}${Number(p.day)} ${p.month}${year ? ` ${p.year}` : ''}`;
}

// ---------------------------------------------------------------- events

type Event = CollectionEntry<'events'>;

export function eventTimes(event: Event) {
  const { date, start_time, end_time, end_date } = event.data;
  const allDay = !start_time;
  const start = munichTime(date, shortTime(start_time) ?? '00:00');
  const end = allDay
    ? munichTime(end_date ?? date, '23:59')
    : munichTime(end_date ?? date, shortTime(end_time) ?? shortTime(start_time)!);
  // Events that run past midnight (e.g. 16:00 – 00:30) end on the next day.
  if (!allDay && !end_date && end <= start) end.setTime(end.getTime() + 24 * 3600 * 1000);
  return { start, end, allDay };
}

/** Upcoming = has not finished yet (an event stays "upcoming" for the whole day it ends on). */
export function isUpcoming(event: Event, now = new Date()): boolean {
  return (event.data.end_date ?? event.data.date) >= todayInMunich(now);
}

export function timeRange(event: Event): string | undefined {
  const start = shortTime(event.data.start_time);
  const end = shortTime(event.data.end_time);
  if (!start) return undefined;
  return end ? `${start} – ${end}` : start;
}

export function dateLabel(event: Event): string {
  const { date, end_date } = event.data;
  if (end_date && end_date !== date) return `${formatDate(date, { year: false })} – ${formatDate(end_date)}`;
  return formatDate(date);
}

export function sortEvents(events: Event[]) {
  const sorted = [...events].sort((a, b) => eventTimes(a).start.getTime() - eventTimes(b).start.getTime());
  return {
    upcoming: sorted.filter((e) => isUpcoming(e)),
    past: sorted.filter((e) => !isUpcoming(e)).reverse(),
  };
}

// ---------------------------------------------------------------- opening hours

export type Hours = { days: string[]; open: string; close: string };

/** "Wed – Fri" / "Saturday" / "Mon, Wed" */
export function formatDays(days: string[], long = false): string {
  const name = (key: string) => (long ? DAY_NAMES[key] : DAY_NAMES[key]?.slice(0, 3)) ?? key;
  const sorted = [...days].sort((a, b) => WEEK_ORDER.indexOf(a) - WEEK_ORDER.indexOf(b));
  const consecutive = sorted.every((d, i) => i === 0 || WEEK_ORDER.indexOf(d) === WEEK_ORDER.indexOf(sorted[i - 1]) + 1);
  if (sorted.length === 1) return name(sorted[0]);
  if (consecutive && sorted.length > 2) return `${name(sorted[0])} – ${name(sorted.at(-1)!)}`;
  return sorted.map(name).join(', ');
}

export const openingHours = (site.hours as Hours[]).map((h) => ({
  ...h,
  label: formatDays(h.days),
  longLabel: formatDays(h.days, true),
  time: `${h.open} – ${h.close}`,
}));

export { DAY_KEYS };
