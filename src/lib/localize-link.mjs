/**
 * In German content, internal page links point to the German version:
 * "/blog/fuji-frontier/" → "/de/blog/fuji-frontier/". Files ("/events.ics",
 * images) and links that already include /de/ are left alone.
 */
export function localizeHref(href, lang) {
  if (lang !== 'de' || typeof href !== 'string') return href;
  const [path] = href.split(/[?#]/);
  const isPage = path.startsWith('/') && !path.startsWith('//') && !/^\/de(\/|$)/.test(path) && !/\.[a-z0-9]+$/i.test(path);
  return isPage ? `/de${href}` : href;
}
