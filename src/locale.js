import { languages } from './i18n/index.js';
import { keys, readString, writeString } from './storage.js';

const FALLBACK = 'en';

function detectLanguage() {
  const saved = readString(keys.language);
  if (saved && Object.hasOwn(languages, saved)) return saved;
  for (const tag of navigator.languages || [navigator.language]) {
    const code = String(tag).toLowerCase().split('-')[0];
    if (Object.hasOwn(languages, code)) return code;
  }
  return FALLBACK;
}

export function createLocale() {
  const listeners = new Set();
  let code = detectLanguage();
  let formatter = new Intl.NumberFormat(languages[code].locale);

  return {
    languages,
    get code() {
      return code;
    },
    get t() {
      return languages[code];
    },
    format(value) {
      return formatter.format(value);
    },
    set(next) {
      if (!Object.hasOwn(languages, next) || next === code) return;
      code = next;
      formatter = new Intl.NumberFormat(languages[code].locale);
      writeString(keys.language, code);
      for (const listener of listeners) listener();
    },
    subscribe(listener) {
      listeners.add(listener);
    },
  };
}
