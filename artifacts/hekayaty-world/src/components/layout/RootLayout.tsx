import React, { useEffect } from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { SearchOverlay } from './SearchOverlay';
import { NotificationsPanel } from './NotificationsPanel';
import { StoryGuide } from '@/components/guidance/StoryGuide';
import { MagicParticles } from '@/components/effects/MagicParticles';
import { useAppStore } from '@/stores/useAppStore';
import magicLibraryBg from '@assets/generated_images/magic_library_clouds.png';

interface RootLayoutProps {
  children: React.ReactNode;
}

export function RootLayout({ children }: RootLayoutProps) {
  const { theme } = useAppStore();

  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [theme]);

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-background text-foreground flex flex-col font-arabic relative selection:bg-[#087C7B]/20 selection:text-[#087C7B] dark:selection:bg-[#C5A15B]/30 dark:selection:text-[#E1C58B] transition-colors duration-300"
    >
      {/* 3D Fantasy World Panoramic Backdrop */}
      <div className="fixed top-20 inset-x-0 bottom-0 pointer-events-none z-0 overflow-hidden bg-background">
        <img
          src={magicLibraryBg}
          alt="عوالم حكاياتي الساحرة"
          className="w-full h-full object-contain sm:object-cover object-top opacity-45 dark:opacity-35"
        />
        {/* Atmospheric Light Rays & Depth Sheen */}
        <div className="absolute inset-0 magical-light-rays pointer-events-none" />
        <div className="absolute inset-0 bg-background/30 dark:bg-background/60" />
      </div>

      {/* Living Magical Golden & Turquoise Particles */}
      <MagicParticles />

      {/* Ambient Starfield & Historic Geometric Watermark */}
      <div className="fixed inset-0 starfield pointer-events-none z-0" />
      <div className="fixed inset-0 islamic-pattern pointer-events-none opacity-[0.035] dark:opacity-[0.025] z-0" />

      {/* Navigation */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-1 w-full relative">{children}</main>

      {/* Footer */}
      <Footer />

      {/* Portals & Overlays */}
      <SearchOverlay />
      <NotificationsPanel />
      <StoryGuide />
    </div>
  );
}
