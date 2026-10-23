// Machine-readable event list for other tools: /events.json
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { eventTimes, isUpcoming, sortEvents } from '../lib/time';
import { url } from '../lib/url';

export const GET: APIRoute = async ({ site }) => {
  const { upcoming, past } = sortEvents(await getCollection('events', (e) => !e.data.draft));
  const abs = (path: string) => new URL(url(path), site).toString();

  const events = [...upcoming, ...past].map((event) => {
    const { start, end, allDay } = eventTimes(event);
    return {
      id: event.id,
      title: event.data.title,
      date: event.data.date,
      end_date: event.data.end_date ?? event.data.date,
      start_time: event.data.start_time ?? null,
      end_time: event.data.end_time ?? null,
      start: start.toISOString(),
      end: end.toISOString(),
      all_day: allDay,
      upcoming: isUpcoming(event),
      location: event.data.location ?? null,
      summary: event.data.summary ?? null,
      ticket_url: event.data.ticket_url ?? null,
      poster: event.data.poster ? new URL(event.data.poster.src, site).toString() : null,
      url: abs(`/events/${event.id}/`),
      ics: abs(`/events/${event.id}.ics`),
    };
  });

  return new Response(JSON.stringify({ generated: new Date().toISOString(), events }, null, 2), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
