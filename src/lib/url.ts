const base = import.meta.env.BASE_URL.replace(/\/$/, '');

/** Prefix an internal path with the site base path (needed on GitHub Pages project sites). */
export function url(path = '/'): string {
  if (/^(https?:|mailto:|tel:|#)/.test(path)) return path;
  return base + (path.startsWith('/') ? path : `/${path}`);
}

/** Absolute URL, e.g. for Open Graph tags and feeds. */
export function absoluteUrl(path: string, site: URL | undefined): string {
  return new URL(url(path), site ?? 'https://www.blixmunich.de').toString();
}

export const isExternal = (href: string) => /^https?:\/\//.test(href);
