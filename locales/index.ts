import { en } from './en';
import { es } from './es';
import { cat } from './cat';

export type Language = 'en' | 'es' | 'cat';

export const translations = {
  en,
  es,
  cat
};

export const languageNames = {
  en: 'English',
  es: 'Español',
  cat: 'Català'
};

export const languageFlags = {
  en: '🇬🇧',
  es: '🇪🇸',
  cat: '🏴󠁥󠁳󠁣󠁴󠁿'  // Catalonia flag (ES-CT)
};
