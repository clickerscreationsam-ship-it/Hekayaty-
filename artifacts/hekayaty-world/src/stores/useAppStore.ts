import { create } from 'zustand';
import type { ReadingProgress, CollectionItem } from '../types';
import * as storage from '../lib/localStorage';
import { api } from '../lib/api';

interface AppState {
  searchOpen: boolean;
  notificationsOpen: boolean;
  language: 'en' | 'ar';
  theme: 'light' | 'dark';
  readingProgress: ReadingProgress[];
  collections: CollectionItem[];
  favorites: CollectionItem[];
  recentSearches: string[];
  
  setSearchOpen: (open: boolean) => void;
  setNotificationsOpen: (open: boolean) => void;
  setLanguage: (lang: 'en' | 'ar') => void;
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
  
  // Progress
  saveReadingProgress: (entry: ReadingProgress) => void;
  updatePageProgress: (comicId: string, lastPage: number, totalPages: number) => void;
  getComicProgress: (comicId: string) => ReadingProgress | undefined;
  
  // Collections
  addToCollection: (item: Omit<CollectionItem, 'addedAt'>) => void;
  removeFromCollection: (id: string, type: CollectionItem['type']) => void;
  isInCollection: (id: string, type: CollectionItem['type']) => boolean;
  
  // Favorites
  addToFavorites: (item: Omit<CollectionItem, 'addedAt'>) => void;
  removeFromFavorites: (id: string, type: CollectionItem['type']) => void;
  isInFavorites: (id: string, type: CollectionItem['type']) => boolean;
  
  // Searches
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;

  // Real Database Sync
  syncWithBackend: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => {
  const initialPrefs = typeof window !== 'undefined' ? storage.getPreferences() : { language: 'ar' as const, theme: 'light' as const };
  const initialProgress = typeof window !== 'undefined' ? storage.getReadingProgress() : [];
  const initialCollections = typeof window !== 'undefined' ? storage.getCollections() : [];
  const initialFavorites = typeof window !== 'undefined' ? storage.getFavorites() : [];
  const initialSearches = typeof window !== 'undefined' ? storage.getRecentSearches() : [];

  // Initialize theme class on document element
  if (typeof document !== 'undefined') {
    if (initialPrefs.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  return {
    searchOpen: false,
    notificationsOpen: false,
    language: initialPrefs.language || 'ar',
    theme: initialPrefs.theme || 'light',
    readingProgress: initialProgress,
    collections: initialCollections,
    favorites: initialFavorites,
    recentSearches: initialSearches,

    setSearchOpen: (open) => set({ searchOpen: open }),
    setNotificationsOpen: (open) => set({ notificationsOpen: open }),
    setLanguage: (lang) => {
      if (typeof document !== 'undefined') {
        document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = lang;
      }
      storage.setLanguage(lang);
      set({ language: lang });
    },
    setTheme: (theme) => {
      if (typeof document !== 'undefined') {
        if (theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
      storage.setTheme(theme);
      set({ theme });
    },
    toggleTheme: () => {
      const nextTheme = get().theme === 'dark' ? 'light' : 'dark';
      get().setTheme(nextTheme);
    },

    saveReadingProgress: (entry) => {
      storage.saveReadingProgress(entry);
      set({ readingProgress: storage.getReadingProgress() });
      // Background sync to Supabase backend
      api.saveProgress({
        contentType: 'comic',
        contentId: entry.comicId,
        progress: entry.lastPage,
        isCompleted: entry.completed,
      }).catch(() => {});
    },
    updatePageProgress: (comicId, lastPage, totalPages) => {
      storage.updatePageProgress(comicId, lastPage, totalPages);
      set({ readingProgress: storage.getReadingProgress() });
      // Background sync to Supabase backend
      api.saveProgress({
        contentType: 'comic',
        contentId: comicId,
        progress: lastPage,
        isCompleted: lastPage >= totalPages,
      }).catch(() => {});
    },
    getComicProgress: (comicId) => {
      return get().readingProgress.find((p) => p.comicId === comicId);
    },

    addToCollection: (item) => {
      storage.addToCollection(item);
      set({ collections: storage.getCollections() });
    },
    removeFromCollection: (id, type) => {
      storage.removeFromCollection(id, type);
      set({ collections: storage.getCollections() });
    },
    isInCollection: (id, type) => {
      return get().collections.some((c) => c.id === id && c.type === type);
    },

    addToFavorites: (item) => {
      storage.addToFavorites(item);
      set({ favorites: storage.getFavorites() });
      // Background sync to Supabase backend
      api.toggleFavorite(item.type, item.id).catch(() => {});
    },
    removeFromFavorites: (id, type) => {
      storage.removeFromFavorites(id, type);
      set({ favorites: storage.getFavorites() });
      // Background sync to Supabase backend
      api.toggleFavorite(type, id).catch(() => {});
    },
    isInFavorites: (id, type) => {
      return get().favorites.some((f) => f.id === id && f.type === type);
    },

    addRecentSearch: (query) => {
      storage.addRecentSearch(query);
      set({ recentSearches: storage.getRecentSearches() });
    },
    clearRecentSearches: () => {
      storage.clearRecentSearches();
      set({ recentSearches: [] });
    },

    syncWithBackend: async () => {
      try {
        const [remoteFavs, remoteProgress] = await Promise.all([
          api.getFavorites(),
          api.getProgress(),
        ]);
        if (remoteFavs && remoteFavs.length > 0) {
          set({ favorites: remoteFavs });
        }
        if (remoteProgress && remoteProgress.length > 0) {
          const mapped: ReadingProgress[] = remoteProgress.map((p: any) => ({
            comicId: p.contentId,
            lastPage: p.progress,
            totalPages: 24,
            completed: p.isCompleted,
            lastRead: p.updatedAt || new Date().toISOString(),
          }));
          set({ readingProgress: mapped });
        }
      } catch {
        // Fallback to local
      }
    },
  };
});
