import { create } from 'zustand';

interface AppState {
  searchOpen: boolean;
  notificationsOpen: boolean;
  language: 'en' | 'ar';
  theme: 'dark'; // We force dark mode as requested
  setSearchOpen: (open: boolean) => void;
  setNotificationsOpen: (open: boolean) => void;
  setLanguage: (lang: 'en' | 'ar') => void;
}

export const useAppStore = create<AppState>((set) => ({
  searchOpen: false,
  notificationsOpen: false,
  language: 'en',
  theme: 'dark',
  setSearchOpen: (open) => set({ searchOpen: open }),
  setNotificationsOpen: (open) => set({ notificationsOpen: open }),
  setLanguage: (lang) => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    set({ language: lang });
  },
}));
