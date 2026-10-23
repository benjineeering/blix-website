// Subscribable calendar of all events: /events.ics
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { buildCalendar } from '../lib/ics';
import { url } from '../lib/url';

export const GET: APIRoute = async ({ site }) => {
  const events = await getCollection('events', (e) => !e.data.draft);
  const siteUrl = new URL(url('/'), site).toString();
  return new Response(buildCalendar(events, siteUrl), {
    headers: { 'Content-Type': 'text/calendar; charset=utf-8' },
  });
};
