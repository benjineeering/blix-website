// Site settings (src/data/site.json) with German texts from site.de.json.
import site from '../data/site.json';
import siteDe from '../data/site.de.json';
import { mergeTranslation } from './content';
import type { Lang } from './config';

export type Site = typeof site;

export const getSite = (lang: Lang): Site => (lang === 'de' ? mergeTranslation(site, siteDe) : site);
