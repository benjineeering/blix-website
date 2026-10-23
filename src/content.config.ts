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

// English entries are index.md, German translations index.de.md in the same
// folder. Both get the folder name as id ("lab", "2026-09-26-wiesn-photowalk").
const entryId = ({ entry }: { entry: string }) => entry.replace(/(\.de)?\.md$/, '').replace(/\/index$/, '');
const english = (base: string, pattern = '*/index.md') => glob({ pattern, base, generateId: entryId });
const german = (base: string, pattern = '*/index.de.md') => glob({ pattern, base, generateId: entryId });

// German files only hold the translated texts (dates, images, links etc. come
// from the English entry), and any of them may still be missing.
const translation = z.looseObject({});

const home = defineCollection({
  loader: english('./src/content/home', 'index.md'),
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
  loader: english('./src/content/pages'),
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
  loader: english('./src/content/events'),
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
  loader: english('./src/content/blog'),
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

// Legal pages exist in German only and are shown on both language versions.
const legal = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/legal', generateId: entryId }),
  schema: z.object({
    title: z.string(),
    nav_label: z.string(),
    order: z.number().default(99),
  }),
});

const homeDe = defineCollection({ loader: german('./src/content/home', 'index.de.md'), schema: translation });
const pagesDe = defineCollection({ loader: german('./src/content/pages'), schema: translation });
const eventsDe = defineCollection({ loader: german('./src/content/events'), schema: translation });
const blogDe = defineCollection({ loader: german('./src/content/blog'), schema: translation });

export const collections = { home, pages, events, blog, legal, homeDe, pagesDe, eventsDe, blogDe };
