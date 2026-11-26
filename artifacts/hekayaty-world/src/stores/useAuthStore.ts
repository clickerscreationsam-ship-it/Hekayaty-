import { create } from 'zustand';
import { api } from '../lib/api';
import * as storage from '../lib/localStorage';
import { useAppStore } from './useAppStore';

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  role: 'reader' | 'writer' | 'publishing_house' | 'admin';
  avatarUrl?: string | null;
  bio?: string | null;
}

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  subscription: any | null;
  initAuth: () => Promise<void>;
  login: (credentials: { email: string; password: string }) => Promise<{ success: boolean; error?: string }>;
  register: (payload: { email: string; password: string; displayName: string; role?: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (data: { displayName?: string; bio?: string; avatarUrl?: string }) => Promise<{ success: boolean; error?: string }>;
  changePassword: (data: { currentPassword: string; newPassword: string }) => Promise<{ success: boolean; error?: string }>;
  deactivateAccount: () => Promise<{ success: boolean; error?: string }>;
}

const initialUser = typeof window !== 'undefined' ? storage.getAuthUser() : null;
const initialToken = typeof window !== 'undefined' ? storage.getAuthToken() : null;

export const useAuthStore = create<AuthState>((set, get) => ({
  user: initialUser,
  isAuthenticated: !!(initialUser && initialToken),
  isLoading: !initialUser,
  subscription: null,

  initAuth: async () => {
    try {
      const cachedToken = storage.getAuthToken();
      const cachedUser = storage.getAuthUser();

      if (!cachedToken && !cachedUser) {
        set({ user: null, isAuthenticated: false, subscription: null, isLoading: false });
        return;
      }

      // If we have cached credentials, maintain active session immediately while refreshing in background
      if (cachedUser && cachedToken) {
        set({
          user: cachedUser,
          isAuthenticated: true,
          isLoading: false,
        });
      }

      const res = await api.getMe();
      if (res && res.isAuthenticated && res.user) {
        storage.setAuthUser(res.user);
        set({
          user: res.user,
          isAuthenticated: true,
          subscription: res.subscription || null,
          isLoading: false,
        });
        useAppStore.getState().syncWithBackend().catch(() => {});
      } else {
        // Backend returned not authenticated — session token expired or invalid
        storage.clearAuthSession();
        set({ user: null, isAuthenticated: false, subscription: null, isLoading: false });
      }
    } catch {
      // In case of network glitch or offline, preserve existing cached session
      if (storage.getAuthUser() && storage.getAuthToken()) {
        set({ isLoading: false, isAuthenticated: true, user: storage.getAuthUser() });
      } else {
        storage.clearAuthSession();
        set({ user: null, isAuthenticated: false, subscription: null, isLoading: false });
      }
    }
  },

  login: async (credentials) => {
    try {
      const res = await api.login(credentials);
      if (res?.user) {
        if (res.token) {
          storage.setAuthToken(res.token);
        }
        storage.setAuthUser(res.user);
        set({
          user: res.user,
          isAuthenticated: true,
        });
        useAppStore.getState().syncWithBackend().catch(() => {});
        return { success: true };
      }
      return { success: false, error: res?.error || 'فشل تسجيل الدخول' };
    } catch (err: any) {
      return { success: false, error: err.message || 'حدث خطأ أثناء تسجيل الدخول' };
    }
  },

  register: async (payload) => {
    try {
      const res = await api.register(payload);
      if (res?.user) {
        if (res.token) {
          storage.setAuthToken(res.token);
        }
        storage.setAuthUser(res.user);
        set({
          user: res.user,
          isAuthenticated: true,
        });
        useAppStore.getState().syncWithBackend().catch(() => {});
        return { success: true };
      }
      return { success: false, error: res?.error || 'فشل إنشاء الحساب' };
    } catch (err: any) {
      return { success: false, error: err.message || 'حدث خطأ أثناء معالجة التسجيل' };
    }
  },

  logout: async () => {
    try {
      await api.logout();
    } finally {
      storage.clearAuthSession();
      set({ user: null, isAuthenticated: false, subscription: null });
    }
  },

  updateProfile: async (data) => {
    try {
      const res = await api.updateProfile(data);
      if (res?.user) {
        storage.setAuthUser(res.user);
        set({ user: res.user });
        return { success: true };
      }
      return { success: false, error: res?.error || 'فشل تحديث الملف الشخصي' };
    } catch (err: any) {
      return { success: false, error: err.message || 'خطأ أثناء تحديث الملف الشخصي' };
    }
  },

  changePassword: async (data) => {
    try {
      const res = await api.changePassword(data);
      if (res?.message) {
        return { success: true };
      }
      return { success: false, error: res?.error || 'فشل تغيير كلمة المرور' };
    } catch (err: any) {
      return { success: false, error: err.message || 'خطأ أثناء تغيير كلمة المرور' };
    }
  },

  deactivateAccount: async () => {
    try {
      const res = await api.deactivateAccount();
      if (res?.message) {
        storage.clearAuthSession();
        set({ user: null, isAuthenticated: false, subscription: null });
        return { success: true };
      }
      return { success: false, error: res?.error || 'فشل تعطيل الحساب' };
    } catch (err: any) {
      return { success: false, error: err.message || 'خطأ أثناء تعطيل الحساب' };
    }
  },
}));
