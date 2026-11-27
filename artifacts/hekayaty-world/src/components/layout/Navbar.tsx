import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useAppStore } from '@/stores/useAppStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { FeatherLogo } from '@/components/common/FeatherLogo';
import { api } from '@/lib/api';
import {
  Search,
  Bell,
  Menu,
  X,
  User,
  ChevronDown,
  Sparkles,
  BookOpen,
  Users,
  Globe,
  Clock,
  BookMarked,
  Newspaper,
  Calendar,
  Layers,
  Compass,
  Sun,
  Moon,
  LogIn,
  LogOut,
  PenTool,
  Shield,
  Bookmark,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function Navbar() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [universeDropdownOpen, setUniverseDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const { setSearchOpen, setNotificationsOpen, theme, toggleTheme } = useAppStore();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) {
      setUnreadCount(0);
      return;
    }
    api
      .getNotifications()
      .then((notifs: any[]) => {
        if (Array.isArray(notifs)) {
          const unread = notifs.filter((n: any) => !n.isRead && !n.is_read).length;
          setUnreadCount(unread);
        }
      })
      .catch(() => {});
  }, [isAuthenticated]);

  const mainLinks = [
    { name: 'الرئيسية', path: '/', exact: true },
    { name: 'السلاسل', path: '/series' },
    { name: 'اكتشف', path: '/discover' },
    { name: 'الكوميكس', path: '/comics' },
    { name: 'القصص', path: '/stories' },
    { name: 'الشخصيات', path: '/characters' },
    { name: 'العوالم', path: '/worlds' },
    { name: 'حكاياتي المختارة', path: '/selected', badge: 'مختارة' },
  ];

  const universeItems = [
    {
      title: 'سلاسل ومواسم حكاياتي',
      desc: 'سلاسل الروايات والكوميكس بمواسم وفصول متتابعة',
      path: '/series',
      icon: Layers,
    },
    {
      title: 'القارئ الذكي (PDF ونصوص)',
      desc: 'قراءة الروايات والكوميكس ورفع ملفاتك الخاصة',
      path: '/reader',
      icon: BookOpen,
    },
    {
      title: 'الخط الزمني',
      desc: 'تاريخ وتطور أحداث الكون',
      path: '/timeline',
      icon: Clock,
    },
    {
      title: 'الموسوعة الكونية',
      desc: 'الآثار، التقنيات، والمنظمات',
      path: '/encyclopedia',
      icon: BookMarked,
    },
    {
      title: 'الأخبار والمستجدات',
      desc: 'إعلانات الإصدارات والمقالات',
      path: '/news',
      icon: Newspaper,
    },
    {
      title: 'الفعاليات والمعارض',
      desc: 'الملتقيات وورش العمل',
      path: '/events',
      icon: Calendar,
    },
  ];

  const isUniverseActive = universeItems.some((item) =>
    location.startsWith(item.path)
  );

  return (
    <>
      <nav
        className="sticky top-0 w-full z-50 bg-[#FAF5EB] dark:bg-[#111C2B] border-b border-[#E6DAC3] dark:border-white/10 shadow-[0_2px_12px_rgba(44,36,30,0.06)] dark:shadow-none transition-colors duration-200"
        dir="rtl"
      >
        <div className="max-w-[1400px] mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20 gap-2">
            {/* Official Feather Logo */}
            <Link href="/" className="flex items-center gap-2 sm:gap-3 group focus:outline-none shrink-0" aria-label="الصفحة الرئيسية لحكاياتي">
              <FeatherLogo size="md" />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1 xl:gap-2">
              {mainLinks.map((link) => {
                const isActive = link.exact
                  ? location === link.path
                  : location.startsWith(link.path);

                return (
                  <Link
                    key={link.path}
                    href={link.path}
                    className={`relative px-3.5 py-2 text-sm font-arabic font-semibold rounded-xl transition-all duration-200 flex items-center gap-1.5 ${
                      isActive
                        ? 'text-[#087C7B] dark:text-[#E1C58B] bg-[#087C7B]/10 dark:bg-white/[0.04] font-bold'
                        : 'text-[#2C241E] dark:text-zinc-200 hover:text-[#087C7B] dark:hover:text-white hover:bg-[#2C241E]/5 dark:hover:bg-white/[0.03]'
                    }`}
                  >
                    <span>{link.name}</span>
                    {link.badge && (
                      <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-[#087C7B]/12 text-[#087C7B] dark:bg-[#C5A15B]/20 dark:text-[#E1C58B] border border-[#087C7B]/30 dark:border-[#C5A15B]/40 font-bold">
                        {link.badge}
                      </span>
                    )}
                    {isActive && (
                      <motion.div
                        layoutId="nav-pill"
                        className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#087C7B] dark:bg-[#C5A15B] rounded-full shadow-[0_0_8px_rgba(8,124,123,0.5)] dark:shadow-[0_0_8px_#C5A15B]"
                        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                      />
                    )}
                  </Link>
                );
              })}

              {/* Universe Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setUniverseDropdownOpen(true)}
                onMouseLeave={() => setUniverseDropdownOpen(false)}
              >
                <button
                  type="button"
                  onClick={() => setUniverseDropdownOpen(!universeDropdownOpen)}
                  className={`px-3.5 py-2 text-sm font-arabic font-semibold rounded-xl transition-all duration-200 flex items-center gap-1.5 ${
                    isUniverseActive
                      ? 'text-[#087C7B] dark:text-[#E1C58B] bg-[#087C7B]/10 dark:bg-white/[0.04] font-bold'
                      : 'text-[#2C241E] dark:text-zinc-200 hover:text-[#087C7B] dark:hover:text-white hover:bg-[#2C241E]/5 dark:hover:bg-white/[0.03]'
                  }`}
                >
                  <span>الكون</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-[#2C241E] dark:text-zinc-300 transition-transform duration-200 ${
                      universeDropdownOpen ? 'rotate-180 text-[#087C7B] dark:text-[#E1C58B]' : ''
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {universeDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full right-0 mt-2 w-72 rounded-2xl bg-[#FAF5EB] dark:bg-[#111C2B] border border-[#E6DAC3] dark:border-white/10 p-2 shadow-2xl z-50 overflow-hidden"
                    >
                      <div className="px-3 py-2 border-b border-[#E6DAC3] dark:border-white/10 mb-1">
                        <span className="text-xs font-arabic font-bold text-[#1E293B] dark:text-[#E1C58B] tracking-wider">
                          سجلات الكون وعوالمه
                        </span>
                      </div>
                      <div className="grid grid-cols-1 gap-1">
                        {universeItems.map((item) => {
                          const Icon = item.icon;
                          const active = location.startsWith(item.path);
                          return (
                            <Link
                              key={item.path}
                              href={item.path}
                              onClick={() => setUniverseDropdownOpen(false)}
                              className={`p-2.5 rounded-xl transition-all duration-200 flex items-center gap-3 text-right group ${
                                active
                                  ? 'bg-[#087C7B]/15 dark:bg-[#C5A15B]/15 text-[#087C7B] dark:text-[#E1C58B]'
                                  : 'hover:bg-[#EFE5D4] dark:hover:bg-white/5 text-[#2C241E] dark:text-zinc-200'
                              }`}
                            >
                              <div className="w-9 h-9 rounded-lg bg-[#EFE5D4] dark:bg-zinc-900 border border-[#D8C5A8] dark:border-white/10 flex items-center justify-center shrink-0 group-hover:border-[#087C7B] dark:group-hover:border-[#C5A15B]/50 group-hover:text-[#087C7B] dark:group-hover:text-[#C5A15B] text-[#2C241E] transition-colors">
                                <Icon className="w-4 h-4" />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-sm font-bold text-[#2C241E] dark:text-white group-hover:text-[#087C7B] dark:group-hover:text-[#E1C58B] transition-colors">
                                  {item.title}
                                </span>
                                <span className="text-xs text-[#604735] dark:text-zinc-400 font-normal">
                                  {item.desc}
                                </span>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Right Action Buttons */}
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              {/* Theme Toggle (Day / Night) - hidden on tiny screens to avoid overcrowding, accessible in drawer */}
              <button
                type="button"
                onClick={toggleTheme}
                aria-label="تبديل المظهر"
                title={theme === 'dark' ? 'التحويل للمظهر النهاري الأدبي' : 'التحويل لمظهر المكتبة الليلية'}
                className="hidden xs:flex w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#EFE5D4] dark:bg-white/[0.06] hover:bg-[#E2D4BF] dark:hover:bg-white/[0.12] border border-[#D8C5A8] dark:border-white/10 hover:border-[#2C241E]/40 items-center justify-center text-[#2C241E] dark:text-[#E1C58B] transition-all duration-200 shadow-sm"
              >
                {theme === 'dark' ? <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#E1C58B]" /> : <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#2C241E]" />}
              </button>

              {/* Search Button */}
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                aria-label="البحث"
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#EFE5D4] dark:bg-white/[0.06] hover:bg-[#E2D4BF] dark:hover:bg-white/[0.12] border border-[#D8C5A8] dark:border-white/10 hover:border-[#2C241E]/40 flex items-center justify-center text-[#2C241E] dark:text-zinc-200 hover:text-[#087C7B] transition-all duration-200 shadow-sm"
              >
                <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#2C241E] dark:text-zinc-200" />
              </button>

              {/* Notifications Button */}
              <button
                type="button"
                onClick={() => {
                  setNotificationsOpen(true);
                  setUnreadCount(0);
                }}
                aria-label="الإشعارات"
                className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#EFE5D4] dark:bg-white/[0.06] hover:bg-[#E2D4BF] dark:hover:bg-white/[0.12] border border-[#D8C5A8] dark:border-white/10 hover:border-[#2C241E]/40 flex items-center justify-center text-[#2C241E] dark:text-zinc-200 hover:text-[#087C7B] transition-all duration-200 shadow-sm"
              >
                <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#2C241E] dark:text-zinc-200" />
                {unreadCount > 0 ? (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] sm:min-w-[18px] sm:h-[18px] px-1 rounded-full bg-deep-teal dark:bg-antique-gold text-white dark:text-midnight-navy text-[9px] sm:text-[10px] font-bold flex items-center justify-center shadow-md animate-pulse">
                    {unreadCount > 9 ? '+9' : unreadCount}
                  </span>
                ) : (
                  <span className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#087C7B] dark:bg-[#C5A15B] shadow-[0_0_8px_rgba(8,124,123,0.6)] animate-pulse" />
                )}
              </button>

              {/* Authentication / Profile Dynamic Dropdown */}
              {isAuthenticated && user ? (
                <div
                  className="relative flex items-center gap-1"
                  onMouseEnter={() => setUserDropdownOpen(true)}
                  onMouseLeave={() => setUserDropdownOpen(false)}
                >
                  <Link
                    href="/profile"
                    className="flex items-center gap-1.5 p-1 sm:p-1.5 sm:pr-2.5 rounded-xl bg-[#EFE5D4] dark:bg-white/[0.06] hover:bg-[#E2D4BF] dark:hover:bg-white/[0.12] border border-[#D8C5A8] dark:border-white/10 text-[#2C241E] dark:text-zinc-200 transition-all duration-200 shadow-sm"
                  >
                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-gradient-to-br from-[#087C7B] to-[#119B98] dark:from-[#C5A15B] dark:to-[#927849] flex items-center justify-center text-white dark:text-black font-bold text-xs shadow-sm">
                      {user.displayName.charAt(0)}
                    </div>
                    <span className="hidden md:inline text-xs font-arabic font-bold text-[#2C241E] dark:text-zinc-200 max-w-[90px] truncate">
                      {user.displayName.split(' ')[0]}
                    </span>
                    <ChevronDown className="hidden sm:inline w-3 h-3 text-[#2C241E] dark:text-zinc-300" />
                  </Link>

                  <AnimatePresence>
                    {userDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.98 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full left-0 sm:left-auto sm:right-0 mt-2 w-60 rounded-2xl bg-[#FAF5EB] dark:bg-[#111C2B] border border-[#E6DAC3] dark:border-white/10 p-2 shadow-2xl z-50"
                      >
                        <div className="px-3 py-2 border-b border-[#E6DAC3] dark:border-white/10 mb-1">
                          <span className="text-xs font-bold text-foreground block truncate">{user.displayName}</span>
                          <span className="text-[10px] text-foreground/60 block truncate">{user.email}</span>
                          <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-deep-teal/15 text-deep-teal dark:bg-antique-gold/20 dark:text-antique-gold">
                            {user.role === 'admin' ? 'مدير النظام (Admin)' : user.role}
                          </span>
                        </div>

                        <div className="flex flex-col gap-1">
                          {user.role === 'admin' && (
                            <Link
                              href="/admin"
                              onClick={() => setUserDropdownOpen(false)}
                              className="p-2 rounded-xl bg-deep-teal/10 dark:bg-antique-gold/15 text-deep-teal dark:text-antique-gold text-xs font-bold flex items-center gap-2 border border-deep-teal/20 dark:border-antique-gold/30 hover:brightness-105"
                            >
                              <Shield className="w-3.5 h-3.5" />
                              <span>لوحة الإدارة والتحرير المركزية</span>
                            </Link>
                          )}

                          <Link
                            href="/profile"
                            onClick={() => setUserDropdownOpen(false)}
                            className="p-2 rounded-xl hover:bg-[#EFE5D4] dark:hover:bg-white/5 text-xs font-bold text-foreground flex items-center gap-2"
                          >
                            <User className="w-3.5 h-3.5 text-deep-teal dark:text-antique-gold" />
                            <span>ملفي الشخصي والإعدادات</span>
                          </Link>

                          <Link
                            href="/following"
                            onClick={() => setUserDropdownOpen(false)}
                            className="p-2 rounded-xl hover:bg-[#EFE5D4] dark:hover:bg-white/5 text-xs font-bold text-foreground flex items-center gap-2"
                          >
                            <Bookmark className="w-3.5 h-3.5 text-[#C5A15B]" />
                            <span>متابعاتي (Following)</span>
                          </Link>

                          {(user.role === 'writer' || user.role === 'publishing_house') && (
                            <Link
                              href="/editorial"
                              onClick={() => setUserDropdownOpen(false)}
                              className="p-2 rounded-xl hover:bg-[#EFE5D4] dark:hover:bg-white/5 text-xs font-bold text-foreground flex items-center gap-2"
                            >
                              <PenTool className="w-3.5 h-3.5 text-deep-teal dark:text-antique-gold" />
                              <span>لوحة التحرير والمبدعين</span>
                            </Link>
                          )}

                          <button
                            type="button"
                            onClick={() => {
                              setUserDropdownOpen(false);
                              logout();
                            }}
                            className="p-2 rounded-xl hover:bg-red-500/10 text-xs font-bold text-red-500 flex items-center gap-2 text-right w-full"
                          >
                            <LogOut className="w-3.5 h-3.5" />
                            <span>تسجيل الخروج</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <Link
                    href="/login"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-deep-teal text-white dark:bg-antique-gold dark:text-midnight-navy font-bold text-xs shadow-sm hover:scale-[1.02] transition-transform"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">تسجيل الدخول</span>
                  </Link>
                  <Link
                    href="/register"
                    className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#D8C5A8] dark:border-white/10 hover:border-deep-teal dark:hover:border-antique-gold font-bold text-xs text-[#2C241E] dark:text-zinc-200 transition-colors"
                  >
                    <span>إنشاء حساب</span>
                  </Link>
                </div>
              )}

              {/* Mobile Menu Hamburger */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="القائمة الرئيسية"
                className="lg:hidden w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#EFE5D4] dark:bg-white/[0.06] border border-[#D8C5A8] dark:border-white/10 flex items-center justify-center text-[#2C241E] dark:text-zinc-200 shadow-sm"
              >
                {mobileMenuOpen ? <X className="w-4 h-4 sm:w-5 sm:h-5 text-[#2C241E]" /> : <Menu className="w-4 h-4 sm:w-5 sm:h-5 text-[#2C241E]" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="lg:hidden border-t border-[#E6DAC3] dark:border-white/10 bg-[#FAF5EB] dark:bg-[#111C2B] shadow-lg overflow-hidden"
            >
              <div className="max-w-[1400px] mx-auto px-4 py-5 flex flex-col gap-1">
                {/* Mobile Auth Bar & Theme Switcher */}
                <div className="p-3 mb-2 rounded-2xl bg-[#EFE5D4] dark:bg-white/[0.04] border border-[#D8C5A8] dark:border-white/5 flex flex-col gap-2.5">
                  {isAuthenticated && user ? (
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-deep-teal dark:bg-antique-gold text-white dark:text-midnight-navy font-bold flex items-center justify-center text-xs">
                          {user.displayName.charAt(0)}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-foreground">{user.displayName}</span>
                          <span className="text-[10px] text-foreground/60">{user.email}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {user.role === 'admin' && (
                          <Link
                            href="/admin"
                            onClick={() => setMobileMenuOpen(false)}
                            className="text-xs text-deep-teal dark:text-antique-gold font-bold hover:underline"
                          >
                            لوحة الإدارة
                          </Link>
                        )}
                        <Link
                          href="/profile"
                          onClick={() => setMobileMenuOpen(false)}
                          className="text-xs text-deep-teal dark:text-antique-gold font-bold hover:underline"
                        >
                          ملفي
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 w-full">
                      <Link
                        href="/login"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex-1 py-2.5 text-center rounded-xl bg-deep-teal text-white dark:bg-antique-gold dark:text-midnight-navy font-bold text-xs shadow-sm"
                      >
                        تسجيل الدخول
                      </Link>
                      <Link
                        href="/register"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex-1 py-2.5 text-center rounded-xl border border-soft-sand dark:border-white/10 font-bold text-xs text-foreground bg-white/5 hover:bg-white/10"
                      >
                        حساب جديد
                      </Link>
                    </div>
                  )}

                  {/* Mobile Theme Toggle Button */}
                  <div className="flex items-center justify-between pt-2 border-t border-[#D8C5A8]/50 dark:border-white/5">
                    <span className="text-xs text-foreground/70 font-semibold">المظهر</span>
                    <button
                      type="button"
                      onClick={toggleTheme}
                      className="px-3 py-1 rounded-lg bg-background/50 border border-[#D8C5A8] dark:border-white/10 text-xs font-bold flex items-center gap-1.5"
                    >
                      {theme === 'dark' ? (
                        <>
                          <Sun className="w-3.5 h-3.5 text-antique-gold" />
                          <span>النهاري الأدبي</span>
                        </>
                      ) : (
                        <>
                          <Moon className="w-3.5 h-3.5 text-[#2C241E]" />
                          <span>المكتبة الليلية</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {mainLinks.map((link) => {
                  const isActive = link.exact
                    ? location === link.path
                    : location.startsWith(link.path);

                  return (
                    <Link
                      key={link.path}
                      href={link.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`px-4 py-3 rounded-xl text-base font-arabic font-bold transition-all flex items-center justify-between ${
                        isActive
                          ? 'bg-[#087C7B]/15 dark:bg-[#C5A15B]/15 text-[#087C7B] dark:text-[#E1C58B] border border-[#087C7B]/30 dark:border-[#C5A15B]/30'
                          : 'text-[#2C241E] dark:text-zinc-200 hover:bg-[#EFE5D4] dark:hover:bg-white/5'
                      }`}
                    >
                      <span>{link.name}</span>
                      {link.badge && (
                        <span className="px-2 py-0.5 text-xs rounded-full bg-[#087C7B]/12 text-[#087C7B] dark:bg-[#C5A15B]/20 dark:text-[#E1C58B] border border-[#087C7B]/30 dark:border-[#C5A15B]/40 font-bold">
                          {link.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}

                <div className="pt-3 mt-2 border-t border-[#E6DAC3] dark:border-white/10">
                  <div className="text-xs font-bold text-[#1E293B] dark:text-[#E1C58B] px-4 py-1.5 mb-1 font-arabic">
                    أقسام وسجلات الكون
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {universeItems.map((item) => (
                      <Link
                        key={item.path}
                        href={item.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className="p-3 rounded-xl bg-[#EFE5D4] dark:bg-white/[0.04] border border-[#D8C5A8] dark:border-white/5 text-right flex flex-col gap-1 shadow-sm"
                      >
                        <span className="text-sm font-bold text-[#2C241E] dark:text-white">
                          {item.title}
                        </span>
                        <span className="text-[11px] text-[#604735] dark:text-zinc-400">
                          {item.desc}
                        </span>
                      </Link>
                    ))}
                    <Link
                      href="/card-game"
                      onClick={() => setMobileMenuOpen(false)}
                      className="p-3 rounded-xl bg-[#EFE5D4] dark:bg-white/[0.04] border border-[#D8C5A8] dark:border-white/5 text-right flex flex-col gap-1 shadow-sm"
                    >
                      <span className="text-sm font-bold text-[#2C241E] dark:text-white">
                        لعبة البطاقات
                      </span>
                      <span className="text-[11px] text-[#604735] dark:text-zinc-400">
                        معرض بطاقات الأبطال
                      </span>
                    </Link>
                    <Link
                      href="/community"
                      onClick={() => setMobileMenuOpen(false)}
                      className="p-3 rounded-xl bg-[#EFE5D4] dark:bg-white/[0.04] border border-[#D8C5A8] dark:border-white/5 text-right flex flex-col gap-1 shadow-sm"
                    >
                      <span className="text-sm font-bold text-[#2C241E] dark:text-white">
                        مجتمع المبدعين
                      </span>
                      <span className="text-[11px] text-[#604735] dark:text-zinc-400">
                        معرض الفنون والنقاشات
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
}
