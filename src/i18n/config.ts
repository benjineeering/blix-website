// Languages of the site. English is served at the root, German under /de/.
export const LOCALES = ['en', 'de'] as const;
export type Lang = (typeof LOCALES)[number];
export const DEFAULT_LANG: Lang = 'en';

export const LANG_NAMES: Record<Lang, string> = { en: 'English', de: 'Deutsch' };

const base = import.meta.env.BASE_URL.replace(/\/$/, '');

/** Path without the site base, e.g. "/blix-website/de/lab/" → "/de/lab/". */
function stripBase(pathname: string): string {
  return base && pathname.startsWith(base) ? pathname.slice(base.length) || '/' : pathname;
}

/** The language of a page, from its URL. */
export function langFromUrl(url: URL): Lang {
  const path = stripBase(url.pathname);
  return path === '/de' || path.startsWith('/de/') ? 'de' : 'en';
}

/** "/lab/" → "/de/lab/" for German. Use together with url() from lib/url. */
export function localizePath(path: string, lang: Lang): string {
  if (lang === DEFAULT_LANG || /^(https?:|mailto:|tel:|#)/.test(path)) return path;
  return `/${lang}${path.startsWith('/') ? path : `/${path}`}`;
}

/** The same page in another language: "/blix-website/de/lab/" → "/lab/". */
export function switchLangPath(pathname: string, target: Lang): string {
  const path = stripBase(pathname).replace(/^\/de(?=\/|$)/, '') || '/';
  return localizePath(path, target);
}

/** getStaticPaths() params for the [...lang] route segment. */
export const langParams = () => LOCALES.map((lang) => ({ lang: lang === DEFAULT_LANG ? undefined : lang }));

export const langFromParam = (param: string | undefined): Lang => (param === 'de' ? 'de' : 'en');
