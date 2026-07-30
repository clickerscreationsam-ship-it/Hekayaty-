import React from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { SearchOverlay } from './SearchOverlay';
import { NotificationsPanel } from './NotificationsPanel';

export function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col relative text-foreground">
      {/* Global Background Layer */}
      <div className="fixed inset-0 bg-background z-[-2]"></div>
      <div className="fixed inset-0 islamic-pattern opacity-[0.03] z-[-1] pointer-events-none mix-blend-screen"></div>
      
      <Navbar />
      
      <main className="flex-grow pt-20">
        {children}
      </main>
      
      <Footer />
      
      <SearchOverlay />
      <NotificationsPanel />
    </div>
  );
}
