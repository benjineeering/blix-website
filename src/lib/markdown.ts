import { Marked } from 'marked';
import { url, isExternal } from './url';
import { protectedLinkAttributes, obfuscatedLabel } from './protect-email.mjs';
import { localizeHref } from './localize-link.mjs';
import type { Lang } from '../i18n/config';

// Renders short Markdown snippets that live in front matter fields
// (section texts, notes), with the same link handling as page bodies.
function createMarked(lang: Lang) {
  return new Marked({
    gfm: true,
    breaks: true,
    renderer: {
      link({ href, title, tokens }) {
        const text = this.parser.parseInline(tokens);
        if (/^mailto:/i.test(href)) {
          const { 'data-mail': encoded, address } = protectedLinkAttributes(href);
          return `<a href="#" data-mail="${encoded}">${text.split(address).join(obfuscatedLabel(address))}</a>`;
        }
        const external = isExternal(href);
        const attrs = [
          `href="${external ? href : url(localizeHref(href, lang))}"`,
          title ? `title="${title}"` : '',
          external ? 'target="_blank" rel="noopener noreferrer"' : '',
        ].filter(Boolean);
        return `<a ${attrs.join(' ')}>${text}</a>`;
      },
    },
  });
}

const renderers = { en: createMarked('en'), de: createMarked('de') } satisfies Record<Lang, Marked>;

export function md(text: string | undefined, lang: Lang = 'en'): string {
  return text ? (renderers[lang].parse(text, { async: false }) as string) : '';
}

export function mdInline(text: string | undefined, lang: Lang = 'en'): string {
  return text ? (renderers[lang].parseInline(text, { async: false }) as string) : '';
}
