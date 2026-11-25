import type { ReadingProgress, CollectionItem } from '../types';

// ---------------------------------------------------------------------------
// Keys
// ---------------------------------------------------------------------------
const KEYS = {
  READING_PROGRESS: 'hekayaty_reading_progress',
  COLLECTIONS: 'hekayaty_collections',
  FAVORITES: 'hekayaty_favorites',
  PREFERENCES: 'hekayaty_preferences',
  RECENT_SEARCHES: 'hekayaty_recent_searches',
  AUTH_TOKEN: 'hekayaty_auth_token',
  AUTH_USER: 'hekayaty_auth_user',
} as const;

// ---------------------------------------------------------------------------
// Generic helpers
// ---------------------------------------------------------------------------
function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw == null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJSON<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or unavailable — silent fail
  }
}

// ---------------------------------------------------------------------------
// Auth Session Persistence
// ---------------------------------------------------------------------------
export function getAuthToken(): string | null {
  try {
    return localStorage.getItem(KEYS.AUTH_TOKEN);
  } catch {
    return null;
  }
}

export function setAuthToken(token: string): void {
  try {
    localStorage.setItem(KEYS.AUTH_TOKEN, token);
  } catch {}
}

export function getAuthUser(): any | null {
  return readJSON<any | null>(KEYS.AUTH_USER, null);
}

export function setAuthUser(user: any | null): void {
  writeJSON(KEYS.AUTH_USER, user);
}

export function clearAuthSession(): void {
  try {
    localStorage.removeItem(KEYS.AUTH_TOKEN);
    localStorage.removeItem(KEYS.AUTH_USER);
  } catch {}
}

// ---------------------------------------------------------------------------
// User Preferences
// ---------------------------------------------------------------------------
export interface UserPreferences {
  language: 'ar' | 'en';
  theme: 'light' | 'dark';
}

const DEFAULT_PREFERENCES: UserPreferences = {
  language: 'ar',
  theme: 'light', // Warm Literary primary identity
};

export function getPreferences(): UserPreferences {
  return readJSON<UserPreferences>(KEYS.PREFERENCES, DEFAULT_PREFERENCES);
}

export function setPreferences(prefs: Partial<UserPreferences>): UserPreferences {
  const current = getPreferences();
  const updated: UserPreferences = { ...current, ...prefs };
  writeJSON(KEYS.PREFERENCES, updated);
  return updated;
}

export function setLanguage(language: 'ar' | 'en'): void {
  setPreferences({ language });
}

export function setTheme(theme: 'light' | 'dark'): void {
  setPreferences({ theme });
}

// ---------------------------------------------------------------------------
// Reading Progress
// ---------------------------------------------------------------------------
export function getReadingProgress(): ReadingProgress[] {
  return readJSON<ReadingProgress[]>(KEYS.READING_PROGRESS, []);
}

export function getComicProgress(comicId: string): ReadingProgress | undefined {
  return getReadingProgress().find((p) => p.comicId === comicId);
}

export function saveReadingProgress(entry: ReadingProgress): void {
  const all = getReadingProgress();
  const idx = all.findIndex((p) => p.comicId === entry.comicId);
  if (idx >= 0) {
    all[idx] = entry;
  } else {
    all.push(entry);
  }
  writeJSON(KEYS.READING_PROGRESS, all);
}

export function updatePageProgress(
  comicId: string,
  lastPage: number,
  totalPages: number,
): void {
  saveReadingProgress({
    comicId,
    lastPage,
    totalPages,
    lastRead: new Date().toISOString(),
    completed: lastPage >= totalPages,
  });
}

export function removeReadingProgress(comicId: string): void {
  const all = getReadingProgress().filter((p) => p.comicId !== comicId);
  writeJSON(KEYS.READING_PROGRESS, all);
}

// ---------------------------------------------------------------------------
// Collections
// ---------------------------------------------------------------------------
export function getCollections(): CollectionItem[] {
  return readJSON<CollectionItem[]>(KEYS.COLLECTIONS, []);
}

export function addToCollection(item: Omit<CollectionItem, 'addedAt'>): void {
  const all = getCollections();
  const exists = all.some((c) => c.id === item.id && c.type === item.type);
  if (!exists) {
    all.push({ ...item, addedAt: new Date().toISOString() });
    writeJSON(KEYS.COLLECTIONS, all);
  }
}

export function removeFromCollection(id: string, type: CollectionItem['type']): void {
  const all = getCollections().filter((c) => !(c.id === id && c.type === type));
  writeJSON(KEYS.COLLECTIONS, all);
}

export function isInCollection(id: string, type: CollectionItem['type']): boolean {
  return getCollections().some((c) => c.id === id && c.type === type);
}

export function clearCollections(): void {
  writeJSON(KEYS.COLLECTIONS, []);
}

// ---------------------------------------------------------------------------
// Favorites
// ---------------------------------------------------------------------------
export function getFavorites(): CollectionItem[] {
  return readJSON<CollectionItem[]>(KEYS.FAVORITES, []);
}

export function addToFavorites(item: Omit<CollectionItem, 'addedAt'>): void {
  const all = getFavorites();
  const exists = all.some((f) => f.id === item.id && f.type === item.type);
  if (!exists) {
    all.push({ ...item, addedAt: new Date().toISOString() });
    writeJSON(KEYS.FAVORITES, all);
  }
}

export function removeFromFavorites(id: string, type: CollectionItem['type']): void {
  const all = getFavorites().filter((f) => !(f.id === id && f.type === type));
  writeJSON(KEYS.FAVORITES, all);
}

export function isInFavorites(id: string, type: CollectionItem['type']): boolean {
  return getFavorites().some((f) => f.id === id && f.type === type);
}

export function clearFavorites(): void {
  writeJSON(KEYS.FAVORITES, []);
}

// ---------------------------------------------------------------------------
// Recent Searches (max 10)
// ---------------------------------------------------------------------------
const MAX_RECENT_SEARCHES = 10;

export function getRecentSearches(): string[] {
  return readJSON<string[]>(KEYS.RECENT_SEARCHES, []);
}

export function addRecentSearch(query: string): void {
  if (!query.trim()) return;
  let searches = getRecentSearches().filter((s) => s !== query);
  searches.unshift(query);
  if (searches.length > MAX_RECENT_SEARCHES) {
    searches = searches.slice(0, MAX_RECENT_SEARCHES);
  }
  writeJSON(KEYS.RECENT_SEARCHES, searches);
}

export function removeRecentSearch(query: string): void {
  const searches = getRecentSearches().filter((s) => s !== query);
  writeJSON(KEYS.RECENT_SEARCHES, searches);
}

export function clearRecentSearches(): void {
  writeJSON(KEYS.RECENT_SEARCHES, []);
}
