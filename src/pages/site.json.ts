// Opening hours, address and links for other tools: /site.json
import type { APIRoute } from 'astro';
import site from '../data/site.json';

export const GET: APIRoute = () => {
  const { contact_form_endpoint, ...publicInfo } = site;
  return new Response(JSON.stringify({ ...publicInfo, timezone: 'Europe/Berlin' }, null, 2), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
