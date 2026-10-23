import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// The CMS saves entry-relative images as bare filenames ("poster.jpg"),
// but Astro resolves them like imports, so they need a "./" prefix.
const relative = (value: unknown) =>
  typeof value === 'string' && value && !/^(\.{1,2}\/|\/|https?:)/.test(value) ? `./${value}` : value;

// The CMS writes empty optional fields as "" — treat those as missing.
const optionalText = z.preprocess((v) => (v === '' || v === null ? undefined : v), z.string().optional());

// YAML turns 2026-09-26 into a Date; keep dates as plain YYYY-MM-DD strings.
const isoDate = z.preprocess(
  (v) => (v instanceof Date ? v.toISOString().slice(0, 10) : v),
  z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use the format YYYY-MM-DD'),
);
const optionalDate = z.preprocess((v) => (v === '' || v === null ? undefined : v), isoDate.optional());
const optionalTime = z.preprocess(
  (v) => (v === '' || v === null ? undefined : v),
  z.string().regex(/^\d{1,2}:\d{2}/, 'Use the format HH:MM').optional(),
);

const home = defineCollection({
  loader: glob({ pattern: 'index.md', base: './src/content/home' }),
  schema: ({ image }) =>
    z.object({
      heading: z.string(),
      text: optionalText,
      hero_image: z.preprocess(relative, image()).optional(),
      hero_caption: optionalText,
      strip_heading: optionalText,
    }),
});

const pages = defineCollection({
  loader: glob({ pattern: '*/index.md', base: './src/content/pages' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      nav_label: z.string(),
      order: z.number().default(99),
      summary: z.string(),
      from_price: optionalText,
      intro: optionalText,
      facts: z.array(z.object({ label: z.string(), value: z.string() })).default([]),
      sections: z
        .array(
          z.object({
            heading: z.string(),
            text: optionalText,
            prices: z.array(z.object({ item: z.string(), price: z.string() })).default([]),
            note: optionalText,
          }),
        )
        .default([]),
      cta_label: optionalText,
      cta_url: optionalText,
      gallery_heading: optionalText,
      gallery: z
        .array(z.object({ image: z.preprocess(relative, image()), caption: optionalText }))
        .default([]),
    }),
});

const events = defineCollection({
  loader: glob({ pattern: '*/index.md', base: './src/content/events' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      date: isoDate,
      start_time: optionalTime,
      end_time: optionalTime,
      end_date: optionalDate,
      location: optionalText,
      summary: optionalText,
      poster: z.preprocess(relative, image()).optional(),
      ticket_url: optionalText,
      draft: z.boolean().default(false),
    }),
});

const blog = defineCollection({
  loader: glob({ pattern: '*/index.md', base: './src/content/blog' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      date: isoDate,
      author: optionalText,
      excerpt: optionalText,
      cover: z.preprocess(relative, image()).optional(),
      draft: z.boolean().default(false),
    }),
});

const legal = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/legal' }),
  schema: z.object({
    title: z.string(),
    nav_label: z.string(),
    order: z.number().default(99),
  }),
});

export const collections = { home, pages, events, blog, legal };
