/**
 * WelcomeAboard — Post-Authentication Interactive Onboarding Screen
 * 
 * Embeds InteractiveOnboarding component to guide the authenticated user:
 * - If user already completed or skipped onboarding, they can still view or re-navigate.
 * - Non-authenticated visitors are automatically routed to /login.
 */
import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuthStore } from '@/stores/useAuthStore';
import { InteractiveOnboarding } from '@/components/onboarding/InteractiveOnboarding';

export default function WelcomeAboard() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const timer = setTimeout(() => {
        setLocation('/login');
      }, 600);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isAuthenticated, isLoading, setLocation]);

  return <InteractiveOnboarding />;
}
