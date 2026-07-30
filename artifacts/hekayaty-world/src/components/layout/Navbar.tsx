import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAppStore } from '@/stores/useAppStore';
import { Search, Bell, Menu, X, User, Globe, Shield, BookOpen, Map as MapIcon, Clock, Users, Gamepad2, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function Navbar() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { setSearchOpen, setNotificationsOpen, language, setLanguage } = useAppStore();

  const navLinks = [
    { name: 'Comics', path: '/comics', icon: BookOpen },
    { name: 'Characters', path: '/characters', icon: Shield },
    { name: 'Worlds', path: '/worlds', icon: MapIcon },
    { name: 'Timeline', path: '/timeline', icon: Clock },
    { name: 'Community', path: '/community', icon: Users },
    { name: 'Card Game', path: '/card-game', icon: Gamepad2 },
  ];

  return (
    <>
      <nav className="fixed top-0 w-full z-50 glass-card border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center gap-2 group">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center shadow-[0_0_15px_rgba(212,160,23,0.5)] group-hover:shadow-[0_0_25px_rgba(212,160,23,0.8)] transition-all">
                  <span className="text-xl font-cinzel font-bold text-black">H</span>
                </div>
                <span className="font-cinzel font-bold text-2xl tracking-wider text-white hidden sm:block gold-gradient">
                  HEKAYATY
                </span>
              </Link>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex space-x-1 lg:space-x-4">
              {navLinks.map((link) => (
                <Link key={link.name} href={link.path}>
                  <div className={`px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-primary/20 hover:text-primary cursor-pointer flex items-center gap-2 ${location.startsWith(link.path) ? 'text-primary bg-primary/10' : 'text-foreground'}`}>
                    <link.icon className="w-4 h-4" />
                    {link.name}
                  </div>
                </Link>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 rounded-full hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>
              <button
                onClick={() => setNotificationsOpen(true)}
                className="p-2 rounded-full hover:bg-white/10 text-gray-300 hover:text-white transition-colors relative"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full"></span>
              </button>
              
              <div className="hidden sm:block h-6 w-px bg-border mx-2"></div>
              
              <button
                onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
                className="hidden sm:flex p-2 rounded-full hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
                aria-label="Language"
              >
                <Globe className="w-5 h-5" />
              </button>
              
              <Link href="/profile/me">
                <div className="hidden sm:flex p-2 rounded-full hover:bg-white/10 text-gray-300 hover:text-white transition-colors cursor-pointer">
                  <User className="w-5 h-5" />
                </div>
              </Link>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-md text-gray-400 hover:text-white hover:bg-white/10"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden fixed inset-0 z-40 bg-background/95 backdrop-blur-xl pt-24 pb-6 px-4 flex flex-col h-screen overflow-y-auto"
          >
            <div className="flex flex-col space-y-2 flex-grow">
              {navLinks.map((link) => (
                <Link key={link.name} href={link.path}>
                  <div 
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between p-4 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <link.icon className={`w-5 h-5 ${location.startsWith(link.path) ? 'text-primary' : 'text-muted-foreground'}`} />
                      <span className={`text-lg font-medium ${location.startsWith(link.path) ? 'text-primary' : 'text-foreground'}`}>
                        {link.name}
                      </span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                </Link>
              ))}
            </div>
            
            <div className="mt-auto pt-6 border-t border-border grid grid-cols-2 gap-4">
              <Link href="/profile/me">
                <div onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-center gap-2 p-3 rounded-lg bg-white/5 hover:bg-white/10">
                  <User className="w-5 h-5" /> Profile
                </div>
              </Link>
              <button 
                onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
                className="flex items-center justify-center gap-2 p-3 rounded-lg bg-white/5 hover:bg-white/10"
              >
                <Globe className="w-5 h-5" /> {language === 'en' ? 'عربي' : 'English'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
