import React from 'react';
import { Link } from 'wouter';

export function Footer() {
  return (
    <footer className="bg-black border-t border-border/50 pt-16 pb-8 relative overflow-hidden">
      <div className="absolute inset-0 islamic-pattern opacity-30 pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-12">
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center">
                <span className="text-xl font-cinzel font-bold text-black">H</span>
              </div>
              <span className="font-cinzel font-bold text-2xl tracking-wider text-white gold-gradient">
                HEKAYATY
              </span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              The official digital universe hub of the greatest Arabic superhero and fantasy franchise. Explore worlds, discover heroes, and read epic tales.
            </p>
          </div>
          
          <div>
            <h4 className="font-cinzel font-bold text-white mb-6 uppercase tracking-wider">Universe</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/comics" className="hover:text-primary transition-colors">Comics Library</Link></li>
              <li><Link href="/characters" className="hover:text-primary transition-colors">Character Database</Link></li>
              <li><Link href="/worlds" className="hover:text-primary transition-colors">The Realms</Link></li>
              <li><Link href="/timeline" className="hover:text-primary transition-colors">Timeline</Link></li>
              <li><Link href="/encyclopedia" className="hover:text-primary transition-colors">Encyclopedia</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-cinzel font-bold text-white mb-6 uppercase tracking-wider">Community</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/news" className="hover:text-primary transition-colors">Latest News</Link></li>
              <li><Link href="/community" className="hover:text-primary transition-colors">Forums</Link></li>
              <li><Link href="/community/fan-art" className="hover:text-primary transition-colors">Fan Art</Link></li>
              <li><Link href="/card-game" className="hover:text-primary transition-colors">Card Game</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-cinzel font-bold text-white mb-6 uppercase tracking-wider">Account</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/profile/me" className="hover:text-primary transition-colors">My Profile</Link></li>
              <li><Link href="/collections" className="hover:text-primary transition-colors">My Collection</Link></li>
              <li><Link href="/reading-guides" className="hover:text-primary transition-colors">Reading Guides</Link></li>
              <li><span className="hover:text-primary transition-colors cursor-pointer">Support</span></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border/50 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground text-center md:text-left">
            &copy; {new Date().getFullYear()} Hekayaty World. All rights reserved. Mockup version.
          </p>
          <div className="flex space-x-6 text-sm text-muted-foreground">
            <span className="hover:text-primary transition-colors cursor-pointer">Privacy Policy</span>
            <span className="hover:text-primary transition-colors cursor-pointer">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
