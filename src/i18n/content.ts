// Content in the visitor's language. German entries are laid over the English
// ones field by field, so anything not (yet) translated shows in English, and
// non-text fields (dates, images, links) always come from the English entry.
import { getCollection, type CollectionEntry } from 'astro:content';
import type { Lang } from './config';

type Translatable = 'home' | 'pages' | 'events' | 'blog';

const isImage = (value: unknown) => typeof value === 'object' && value !== null && 'src' in value && 'width' in value;

/** Deep-merge translated text over the English data. */
export function mergeTranslation<T>(base: T, translation: unknown): T {
  if (translation === undefined || translation === null) return base;
  if (typeof base === 'string' || base === undefined) {
    return typeof translation === 'string' && translation.trim() ? (translation as T) : base;
  }
  if (Array.isArray(base)) {
    if (!Array.isArray(translation)) return base;
    return base.map((item, i) => mergeTranslation(item, translation[i])) as T;
  }
  if (typeof base === 'object' && !isImage(base) && typeof translation === 'object') {
    const result: Record<string, unknown> = { ...(base as Record<string, unknown>) };
    for (const [key, value] of Object.entries(translation as Record<string, unknown>)) {
      const current = result[key];
      if (current === undefined) {
        // Text that only exists in the translation (an optional field left empty in English)
        if (typeof value === 'string' && value.trim()) result[key] = value;
      } else {
        result[key] = mergeTranslation(current, value);
      }
    }
    return result as T;
  }
  return base; // numbers, booleans, images: never translated
}

export type Localized<C extends Translatable> = CollectionEntry<C> & {
  /** Entry whose Markdown body to render (the translation if it has one). */
  bodyEntry: CollectionEntry<C> | CollectionEntry<`${C}De`>;
  /** False when a German page shows the English text because no translation exists. */
  bodyTranslated: boolean;
};

export async function getLocalized<C extends Translatable>(collection: C, lang: Lang): Promise<Localized<C>[]> {
  const entries = (await getCollection(collection)) as CollectionEntry<C>[];
  if (lang === 'en') return entries.map((entry) => ({ ...entry, bodyEntry: entry, bodyTranslated: true }));

  const translations = new Map(
    ((await getCollection(`${collection}De` as `${C}De`)) as CollectionEntry<`${C}De`>[]).map((t) => [t.id, t]),
  );
  return entries.map((entry) => {
    const translation = translations.get(entry.id);
    const hasBody = Boolean(translation?.body?.trim());
    return {
      ...entry,
      data: mergeTranslation(entry.data, translation?.data),
      bodyEntry: hasBody ? translation! : entry,
      bodyTranslated: hasBody || !entry.body?.trim(),
    };
  });
}

export async function getLocalizedEntry<C extends Translatable>(collection: C, id: string, lang: Lang) {
  return (await getLocalized(collection, lang)).find((entry) => entry.id === id);
}
