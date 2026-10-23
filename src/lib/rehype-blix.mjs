/**
 * Small rehype plugin for Markdown content:
 * - prefixes root-relative links ("/lab") with the site base path
 * - opens external links in a new tab
 * - turns a paragraph that only contains images into a row of <figure>s,
 *   using each image's title ("caption") as the caption. Two images on
 *   consecutive lines therefore show side by side.
 * - hides email addresses from bots (see protect-email.mjs)
 * - in German files (*.de.md), points internal links to the German pages
 */
import { protectedLinkAttributes, obfuscatedLabel } from './protect-email.mjs';
import { localizeHref } from './localize-link.mjs';

function replaceText(node, search, replacement) {
  for (const child of node.children ?? []) {
    if (child.type === 'text') child.value = child.value.split(search).join(replacement);
    else replaceText(child, search, replacement);
  }
}

export default function rehypeBlix({ base = '/' } = {}) {
  const prefix = base.replace(/\/$/, '');

  const withBase = (value) =>
    prefix && typeof value === 'string' && value.startsWith('/') && !value.startsWith('//') && !value.startsWith(prefix + '/')
      ? prefix + value
      : value;

  const isWhitespace = (node) => node.type === 'text' && !node.value.trim();
  const isBreak = (node) => node.type === 'element' && node.tagName === 'br';
  const isImage = (node) => node.type === 'element' && node.tagName === 'img';

  function toFigure(img) {
    const caption = img.properties?.title;
    const children = [img];
    if (caption) {
      delete img.properties.title;
      children.push({ type: 'element', tagName: 'figcaption', properties: {}, children: [{ type: 'text', value: String(caption) }] });
    }
    return { type: 'element', tagName: 'figure', properties: {}, children };
  }

  function walk(node, lang) {
    if (!node.children) return;
    node.children = node.children.map((child) => {
      if (child.type !== 'element') return child;

      if (child.tagName === 'a' && child.properties?.href) {
        const href = String(child.properties.href);
        if (/^mailto:/i.test(href)) {
          const { href: placeholder, 'data-mail': encoded, address } = protectedLinkAttributes(href);
          child.properties.href = placeholder;
          child.properties.dataMail = encoded;
          replaceText(child, address, obfuscatedLabel(address));
        } else if (/^https?:\/\//.test(href)) {
          child.properties.target = '_blank';
          child.properties.rel = ['noopener', 'noreferrer'];
        } else {
          child.properties.href = withBase(localizeHref(href, lang));
        }
      }
      if (child.tagName === 'img' && child.properties?.src) {
        child.properties.src = withBase(child.properties.src);
      }

      if (child.tagName === 'p') {
        const content = child.children.filter((c) => !isWhitespace(c) && !isBreak(c));
        if (content.length > 0 && content.every(isImage)) {
          return {
            type: 'element',
            tagName: 'div',
            properties: { className: ['figure-row'], dataCount: String(content.length) },
            children: content.map((img) => {
              walk({ children: [img] }, lang);
              return toFigure(img);
            }),
          };
        }
      }

      walk(child, lang);
      return child;
    });
  }

  return (tree, file) => {
    const path = String(file?.path ?? file?.history?.[0] ?? '');
    walk(tree, /\.de\.md$/.test(path) ? 'de' : 'en');
  };
}
