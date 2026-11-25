/**
 * useOnboardingStore — Reliable, per-user scoped onboarding state manager.
 * 
 * Persists in localStorage with keys scoped to the user ID.
 * Tracks:
 *  - isCompleted
 *  - isDismissed / skipped
 *  - currentStep (1 to 4)
 *  - can restart anytime from profile or settings
 */
import { create } from 'zustand';
import { useAuthStore } from './useAuthStore';

interface OnboardingState {
  currentStep: number; // 1: Welcome, 2: Discover Ecosystem, 3: Role Action, 4: Finished
  isCompleted: boolean;
  isSkipped: boolean;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  completeOnboarding: () => void;
  skipOnboarding: () => void;
  restartOnboarding: () => void;
  syncWithUser: () => void;
}

function getUserKey(userId?: string | null) {
  return userId ? `hekayaty_onboard_${userId}` : 'hekayaty_onboard_guest';
}

function loadState(userId?: string | null) {
  if (typeof window === 'undefined') return { isCompleted: false, isSkipped: false, currentStep: 1 };
  try {
    const raw = localStorage.getItem(getUserKey(userId));
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // fallback
  }
  return { isCompleted: false, isSkipped: false, currentStep: 1 };
}

function saveState(userId: string | null | undefined, data: { isCompleted: boolean; isSkipped: boolean; currentStep: number }) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(getUserKey(userId), JSON.stringify(data));
  } catch {
    // ignore
  }
}

export const useOnboardingStore = create<OnboardingState>((set, get) => {
  const initial = loadState(useAuthStore.getState().user?.id);

  return {
    currentStep: initial.currentStep || 1,
    isCompleted: !!initial.isCompleted,
    isSkipped: !!initial.isSkipped,

    setStep: (step: number) => {
      const user = useAuthStore.getState().user;
      const state = { ...get(), currentStep: step };
      set({ currentStep: step });
      saveState(user?.id, {
        isCompleted: state.isCompleted,
        isSkipped: state.isSkipped,
        currentStep: step,
      });
    },

    nextStep: () => {
      const current = get().currentStep;
      get().setStep(Math.min(current + 1, 4));
    },

    prevStep: () => {
      const current = get().currentStep;
      get().setStep(Math.max(current - 1, 1));
    },

    completeOnboarding: () => {
      const user = useAuthStore.getState().user;
      set({ isCompleted: true, currentStep: 4 });
      saveState(user?.id, {
        isCompleted: true,
        isSkipped: false,
        currentStep: 4,
      });
    },

    skipOnboarding: () => {
      const user = useAuthStore.getState().user;
      set({ isSkipped: true, isCompleted: true });
      saveState(user?.id, {
        isCompleted: true,
        isSkipped: true,
        currentStep: 1,
      });
    },

    restartOnboarding: () => {
      const user = useAuthStore.getState().user;
      set({ isCompleted: false, isSkipped: false, currentStep: 1 });
      saveState(user?.id, {
        isCompleted: false,
        isSkipped: false,
        currentStep: 1,
      });
    },

    syncWithUser: () => {
      const user = useAuthStore.getState().user;
      const loaded = loadState(user?.id);
      set({
        currentStep: loaded.currentStep || 1,
        isCompleted: !!loaded.isCompleted,
        isSkipped: !!loaded.isSkipped,
      });
    },
  };
});
