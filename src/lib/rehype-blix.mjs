/**
 * Small rehype plugin for Markdown content:
 * - prefixes root-relative links ("/lab") with the site base path
 * - opens external links in a new tab
 * - turns a paragraph that only contains images into a row of <figure>s,
 *   using each image's title ("caption") as the caption. Two images on
 *   consecutive lines therefore show side by side.
 */
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

  function walk(node) {
    if (!node.children) return;
    node.children = node.children.map((child) => {
      if (child.type !== 'element') return child;

      if (child.tagName === 'a' && child.properties?.href) {
        const href = String(child.properties.href);
        if (/^https?:\/\//.test(href)) {
          child.properties.target = '_blank';
          child.properties.rel = ['noopener', 'noreferrer'];
        } else {
          child.properties.href = withBase(href);
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
              walk({ children: [img] });
              return toFigure(img);
            }),
          };
        }
      }

      walk(child);
      return child;
    });
  }

  return (tree) => walk(tree);
}
