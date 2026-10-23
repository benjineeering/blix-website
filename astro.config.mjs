// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';
import rehypeBlix from './src/lib/rehype-blix.mjs';

// On GitHub Pages the deploy workflow sets SITE_URL and BASE_PATH
// (e.g. https://<user>.github.io + /blix-website). With a custom domain
// BASE_PATH is empty and everything is served from the root.
const site = process.env.SITE_URL || 'https://www.blixmunich.de';
const base = process.env.BASE_PATH || '/';

// Astro doesn't add the base path to redirect targets, so do it here.
/** @param {Record<string, string>} redirects */
const withBase = (redirects) =>
  Object.fromEntries(Object.entries(redirects).map(([from, to]) => [from, base.replace(/\/$/, '') + to + '/']));

export default defineConfig({
  site,
  base,
  integrations: [sitemap({ filter: (page) => !page.includes('/admin/') })],
  image: {
    layout: 'constrained',
    breakpoints: [480, 800, 1200, 1600, 2000],
  },
  markdown: {
    processor: unified({ rehypePlugins: [[rehypeBlix, { base }]] }),
  },
  // Old Squarespace URLs that may be linked from Instagram, Google etc.
  redirects: withBase({
    '/home': '',
    '/dsgvo': '/datenschutz',
    '/blog/kwvx8ktq2zqj9ai891bn14qvifpf17': '/blog/fuji-frontier',
    '/blog/blog-post-title-two-t5my5-k4xmd-67jzh-dztjk': '/blog/photo-contest-2025',
    '/events/event-one-l6fhf': '/events/2025-01-25-bw-part-1-shoot-and-dev',
    '/events/event-one-l6fhf-exst5': '/events/2025-05-10-bw-part-2-darkroom-printing',
    '/events/wiesnphotowalk': '/events/2025-09-27-wiesn-photo-walk',
    '/events/event-one-l6fhf-exst5-aesre': '/events/2025-10-11-bw-darkroom-printing',
    '/events/olympiadorfphotowalk': '/events/2025-10-18-olympiadorf-photo-walk',
    '/events/deadlinephotocontest': '/events/2025-11-16-photo-contest-deadline',
    '/events/photocontest': '/events/2025-12-13-blixmas-photo-contest-exhibition',
    '/events/event-one-l6fhf-exst5-aesre-pezw4': '/events/2026-01-24-bw-darkroom-printing',
    '/events/event-one-l6fhf-exst5-aesre-pezw4-s6jyt-f5fwk': '/events/2026-02-28-photowalk-werksviertel',
    '/events/event-one-l6fhf-exst5-aesre-pezw4-s6jyt': '/events/2026-04-18-bw-darkroom-printing',
    '/events/event-one-l6fhf-exst5-aesre-pezw4-s6jyt-aebw2-k8mc8': '/events/2026-05-16-triple-photowalk-krachparade',
    '/events/event-one-l6fhf-exst5-aesre-pezw4-s6jyt-aebw2': '/events/2026-05-30-studio-workshop-portrait',
    '/events/event-one-l6fhf-exst5-aesre-pezw4-s6jyt-aebw2-k8mc8-zecsy': '/events/2026-09-26-wiesn-photowalk',
  }),
});
