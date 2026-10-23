// "Add to calendar" file for a single event: /events/<slug>.ics
import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection, type CollectionEntry } from 'astro:content';
import { buildCalendar } from '../../lib/ics';
import { url } from '../../lib/url';

export const getStaticPaths = (async () => {
  const events = await getCollection('events', (e) => !e.data.draft);
  return events.map((event) => ({ params: { slug: event.id }, props: { event } }));
}) satisfies GetStaticPaths;

export const GET: APIRoute<{ event: CollectionEntry<'events'> }> = ({ props, site }) => {
  const siteUrl = new URL(url('/'), site).toString();
  return new Response(buildCalendar([props.event], siteUrl, props.event.data.title), {
    headers: { 'Content-Type': 'text/calendar; charset=utf-8' },
  });
};
