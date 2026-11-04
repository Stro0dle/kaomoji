export const keys = {
  position: 'bc-kaomoji-position-v1',
  recent: 'bc-kaomoji-recent-v1',
  language: 'bc-kaomoji-language-v1',
};

export function readString(key) {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.warn(`Kaomoji: could not read ${key}.`, error);
    return null;
  }
}

export function writeString(key, value) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.warn(`Kaomoji: could not save ${key}.`, error);
    return false;
  }
}

export function readJSON(key) {
  const raw = readString(key);
  if (raw === null) return null;
  try {
    return JSON.parse(raw);
  } catch (error) {
    console.warn(`Kaomoji: could not parse ${key}.`, error);
    return null;
  }
}

export function writeJSON(key, value) {
  return writeString(key, JSON.stringify(value));
}
