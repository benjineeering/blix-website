import type { CollectionEntry } from 'astro:content';
import site from '../data/site.json';
import { eventTimes } from './time';

type Event = CollectionEntry<'events'>;

const escape = (text: string) => text.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/([,;])/g, '\\$1');

const utcStamp = (date: Date) => date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
const dateStamp = (iso: string) => iso.replace(/-/g, '');

/** RFC 5545 line folding: lines longer than 75 octets continue on the next line after a space. */
function fold(line: string): string {
  const bytes = new TextEncoder().encode(line);
  if (bytes.length <= 75) return line;
  const parts: string[] = [];
  let current = '';
  let size = 0;
  for (const char of line) {
    const len = new TextEncoder().encode(char).length;
    if (size + len > (parts.length ? 74 : 75)) {
      parts.push(current);
      current = '';
      size = 0;
    }
    current += char;
    size += len;
  }
  parts.push(current);
  return parts.join('\r\n ');
}

function nextDay(iso: string): string {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

export function buildCalendar(events: Event[], siteUrl: string, name = `${site.name} events`): string {
  const now = utcStamp(new Date());
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//blix//website//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escape(name)}`,
    'X-WR-TIMEZONE:Europe/Berlin',
  ];

  for (const event of events) {
    const { start, end, allDay } = eventTimes(event);
    const link = new URL(`events/${event.id}/`, siteUrl).toString();
    const description = [event.data.summary, link].filter(Boolean).join('\n\n');
    lines.push(
      'BEGIN:VEVENT',
      `UID:${event.id}@blixmunich.de`,
      `DTSTAMP:${now}`,
      ...(allDay
        ? [`DTSTART;VALUE=DATE:${dateStamp(event.data.date)}`, `DTEND;VALUE=DATE:${dateStamp(nextDay(event.data.end_date ?? event.data.date))}`]
        : [`DTSTART:${utcStamp(start)}`, `DTEND:${utcStamp(end)}`]),
      `SUMMARY:${escape(event.data.title)}`,
      `DESCRIPTION:${escape(description)}`,
      `LOCATION:${escape(event.data.location ?? `${site.name}, ${site.address.street}, ${site.address.postcode} ${site.address.city}`)}`,
      `URL:${link}`,
      'END:VEVENT',
    );
  }

  lines.push('END:VCALENDAR');
  return lines.map(fold).join('\r\n') + '\r\n';
}
