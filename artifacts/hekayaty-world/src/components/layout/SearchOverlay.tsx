import React, { useState, useEffect, useRef } from 'react';
import { useLocation, Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  X,
  BookOpen,
  Users,
  Globe,
  Sparkles,
  ArrowRight,
  Clock,
  ChevronLeft,
} from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';
import { useComics, useCharacters, useWorlds, useStories } from '@/lib/hooks';

export function SearchOverlay() {
  const { searchOpen, setSearchOpen, recentSearches, addRecentSearch, clearRecentSearches } =
    useAppStore();
  const [query, setQuery] = useState('');
  const [, setLocation] = useLocation();
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: comics = [] } = useComics();
  const { data: characters = [] } = useCharacters();
  const { data: worlds = [] } = useWorlds();
  const { data: stories = [] } = useStories();

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
    }
  }, [searchOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && searchOpen) {
        setSearchOpen(false);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchOpen, setSearchOpen]);

  if (!searchOpen) return null;

  const trimmed = query.trim().toLowerCase();

  const matchingCharacters = trimmed
    ? characters.filter(
        (c) =>
          c.nameAr.toLowerCase().includes(trimmed) ||
          c.nameEn.toLowerCase().includes(trimmed) ||
          c.aliasAr.toLowerCase().includes(trimmed) ||
          c.bioAr.toLowerCase().includes(trimmed)
      )
    : [];

  const matchingComics = trimmed
    ? comics.filter(
        (c) =>
          c.titleAr.toLowerCase().includes(trimmed) ||
          c.titleEn.toLowerCase().includes(trimmed) ||
          c.synopsisAr.toLowerCase().includes(trimmed) ||
          c.genresAr.some((g) => g.toLowerCase().includes(trimmed))
      )
    : [];

  const matchingWorlds = trimmed
    ? worlds.filter(
        (w) =>
          w.nameAr.toLowerCase().includes(trimmed) ||
          w.nameEn.toLowerCase().includes(trimmed) ||
          w.descriptionAr.toLowerCase().includes(trimmed)
      )
    : [];

  const matchingStories = trimmed
    ? stories.filter(
        (s) =>
          s.titleAr.toLowerCase().includes(trimmed) ||
          s.synopsisAr.toLowerCase().includes(trimmed) ||
          s.authorAr.toLowerCase().includes(trimmed)
      )
    : [];

  const totalResults =
    matchingCharacters.length +
    matchingComics.length +
    matchingWorlds.length +
    matchingStories.length;

  const handleSelect = (url: string, searchTitle?: string) => {
    if (searchTitle) {
      addRecentSearch(searchTitle);
    }
    setSearchOpen(false);
    setLocation(url);
  };

  const trendingTags = [
    'خيال علمي',
    'مغامرة',
    'أكشن',
    'أساطير',
    'روايات مصورة',
    'سلاسل ملحمية',
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto" dir="rtl">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSearchOpen(false)}
          className="fixed inset-0 bg-[#111C2B]/80 dark:bg-black/80 backdrop-blur-xl"
        />

        {/* Content Container */}
        <div className="min-h-screen px-4 py-8 sm:py-16 flex justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -20 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-3xl bg-[#FAF5ED] dark:bg-[#172538] border border-[#D8C5A8] dark:border-[#C5A15B]/30 rounded-2xl sm:rounded-3xl shadow-2xl p-5 sm:p-7 relative z-10 font-arabic flex flex-col gap-6"
          >
            {/* Search Input Bar */}
            <div className="relative flex items-center border-b border-[#D8C5A8] dark:border-white/10 pb-4">
              <Search className="w-6 h-6 text-[#087C7B] dark:text-[#C5A15B] ml-3 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ابحث عن أبطال، كوميكس، عوالم، مرويات، أو أسرار..."
                className="w-full bg-transparent text-xl sm:text-2xl text-[#2A1F17] dark:text-white placeholder-[#604735]/60 dark:placeholder-zinc-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="p-2 rounded-xl text-[#604735] dark:text-zinc-400 hover:text-[#087C7B] dark:hover:text-white hover:bg-[#EFE5D4] dark:hover:bg-white/5 transition-colors shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Results or Suggestions */}
            {query.trim() === '' ? (
              <div className="space-y-6">
                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between text-xs text-[#604735] dark:text-zinc-400 mb-3">
                      <span className="flex items-center gap-1.5 font-semibold text-[#2A1F17] dark:text-zinc-300">
                        <Clock className="w-3.5 h-3.5 text-[#087C7B] dark:text-[#C5A15B]" />
                        عمليات البحث الأخيرة
                      </span>
                      <button
                        type="button"
                        onClick={clearRecentSearches}
                        className="hover:text-red-500 transition-colors text-[11px]"
                      >
                        مسح السجل
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {recentSearches.map((s, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setQuery(s)}
                          className="px-3 py-1.5 rounded-lg bg-[#EFE5D4] dark:bg-white/[0.03] border border-[#D8C5A8] dark:border-white/10 text-xs text-[#2A1F17] dark:text-zinc-300 hover:text-[#087C7B] dark:hover:text-[#E1C58B] hover:border-[#087C7B] dark:hover:border-[#C5A15B]/40 transition-colors"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Trending Tags */}
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#2A1F17] dark:text-zinc-300 mb-3">
                    <Sparkles className="w-3.5 h-3.5 text-[#087C7B] dark:text-[#C5A15B]" />
                    <span>موضوعات شائعة في الكون</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {trendingTags.map((tag, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setQuery(tag)}
                        className="px-3.5 py-1.5 rounded-xl bg-[#EFE5D4] dark:bg-white/[0.04] border border-[#D8C5A8] dark:border-[#C5A15B]/20 text-xs text-[#2A1F17] dark:text-white hover:bg-[#087C7B]/15 hover:border-[#087C7B] dark:hover:bg-[#C5A15B]/20 dark:hover:border-[#C5A15B]/50 transition-all"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick Shortcuts */}
                <div className="pt-4 border-t border-[#D8C5A8]/50 dark:border-white/5">
                  <div className="text-xs text-[#604735] dark:text-zinc-400 mb-3 font-semibold">تصفح سريع:</div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <button
                      type="button"
                      onClick={() => handleSelect('/comics')}
                      className="p-3 rounded-xl bg-[#EFE5D4]/60 dark:bg-white/[0.02] border border-[#D8C5A8] dark:border-white/5 hover:border-[#087C7B] dark:hover:border-[#C5A15B]/40 text-right flex items-center justify-between text-xs font-semibold text-[#2A1F17] dark:text-zinc-300 hover:text-[#087C7B] dark:hover:text-white"
                    >
                      <span>كل الكوميكس</span>
                      <ChevronLeft className="w-3.5 h-3.5 text-[#087C7B] dark:text-[#C5A15B]" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelect('/characters')}
                      className="p-3 rounded-xl bg-[#EFE5D4]/60 dark:bg-white/[0.02] border border-[#D8C5A8] dark:border-white/5 hover:border-[#087C7B] dark:hover:border-[#C5A15B]/40 text-right flex items-center justify-between text-xs font-semibold text-[#2A1F17] dark:text-zinc-300 hover:text-[#087C7B] dark:hover:text-white"
                    >
                      <span>كل الشخصيات</span>
                      <ChevronLeft className="w-3.5 h-3.5 text-[#087C7B] dark:text-[#C5A15B]" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelect('/worlds')}
                      className="p-3 rounded-xl bg-[#EFE5D4]/60 dark:bg-white/[0.02] border border-[#D8C5A8] dark:border-white/5 hover:border-[#087C7B] dark:hover:border-[#C5A15B]/40 text-right flex items-center justify-between text-xs font-semibold text-[#2A1F17] dark:text-zinc-300 hover:text-[#087C7B] dark:hover:text-white"
                    >
                      <span>أطلس العوالم</span>
                      <ChevronLeft className="w-3.5 h-3.5 text-[#087C7B] dark:text-[#C5A15B]" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelect('/selected')}
                      className="p-3 rounded-xl bg-[#EFE5D4]/60 dark:bg-white/[0.02] border border-[#D8C5A8] dark:border-white/5 hover:border-[#087C7B] dark:hover:border-[#C5A15B]/40 text-right flex items-center justify-between text-xs font-semibold text-[#2A1F17] dark:text-zinc-300 hover:text-[#087C7B] dark:hover:text-white"
                    >
                      <span>حكاياتي المختارة</span>
                      <ChevronLeft className="w-3.5 h-3.5 text-[#087C7B] dark:text-[#C5A15B]" />
                    </button>
                  </div>
                </div>
              </div>
            ) : totalResults === 0 ? (
              <div className="py-12 text-center text-[#604735] dark:text-zinc-400">
                <Search className="w-12 h-12 text-[#D8C5A8] dark:text-zinc-600 mx-auto mb-3" />
                <p className="text-base text-[#2A1F17] dark:text-zinc-300 font-semibold mb-1">
                  لم نعثر على نتائج مطابقة لـ "{query}"
                </p>
                <p className="text-xs text-[#604735] dark:text-zinc-500">
                  جرّب البحث باسم شخصية مثل "زايد" أو اسم عالم مثل "زلامار" أو نوع قصة مثل "أكشن".
                </p>
              </div>
            ) : (
              <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-1">
                {/* Comics */}
                {matchingComics.length > 0 && (
                  <div>
                    <div className="text-xs font-bold text-[#087C7B] dark:text-[#C5A15B] mb-2.5 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>الكوميكس ({matchingComics.length})</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {matchingComics.map((comic) => (
                        <div
                          key={comic.id}
                          onClick={() => handleSelect(`/comics/${comic.id}`, comic.titleAr)}
                          className="p-2.5 rounded-xl bg-[#EFE5D4]/80 dark:bg-white/[0.02] hover:bg-[#EFE5D4] dark:hover:bg-white/[0.06] border border-[#D8C5A8] dark:border-white/5 hover:border-[#087C7B] dark:hover:border-[#C5A15B]/40 cursor-pointer flex items-center gap-3 transition-all"
                        >
                          <img
                            src={comic.coverImage}
                            alt={comic.titleAr}
                            className="w-12 h-16 object-cover rounded-lg shrink-0 border border-[#D8C5A8] dark:border-white/10"
                          />
                          <div className="overflow-hidden">
                            <h4 className="text-sm font-semibold text-[#2A1F17] dark:text-white truncate">
                              {comic.titleAr}
                            </h4>
                            <p className="text-xs text-[#604735] dark:text-zinc-400 truncate">{comic.synopsisAr}</p>
                            <span className="text-[10px] text-[#087C7B] dark:text-[#E1C58B] font-semibold mt-1 inline-block">
                              العدد #{comic.issueNumber} • تقييم {comic.rating}★
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Characters */}
                {matchingCharacters.length > 0 && (
                  <div>
                    <div className="text-xs font-bold text-[#087C7B] dark:text-[#C5A15B] mb-2.5 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" />
                      <span>الشخصيات ({matchingCharacters.length})</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {matchingCharacters.map((char) => (
                        <div
                          key={char.id}
                          onClick={() =>
                            handleSelect(`/characters/${char.id}`, char.nameAr)
                          }
                          className="p-2.5 rounded-xl bg-[#EFE5D4]/80 dark:bg-white/[0.02] hover:bg-[#EFE5D4] dark:hover:bg-white/[0.06] border border-[#D8C5A8] dark:border-white/5 hover:border-[#087C7B] dark:hover:border-[#C5A15B]/40 cursor-pointer flex items-center gap-3 transition-all"
                        >
                          <img
                            src={char.image}
                            alt={char.nameAr}
                            className="w-12 h-12 rounded-full object-cover shrink-0 border border-[#087C7B]/40 dark:border-[#C5A15B]/30"
                          />
                          <div className="overflow-hidden">
                            <h4 className="text-sm font-semibold text-[#2A1F17] dark:text-white truncate">
                              {char.nameAr}
                            </h4>
                            <p className="text-xs text-[#087C7B] dark:text-[#E1C58B]">{char.aliasAr}</p>
                            <p className="text-[11px] text-[#604735] dark:text-zinc-400 truncate">{char.bioAr}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Worlds */}
                {matchingWorlds.length > 0 && (
                  <div>
                    <div className="text-xs font-bold text-[#087C7B] dark:text-[#C5A15B] mb-2.5 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5" />
                      <span>العوالم ({matchingWorlds.length})</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {matchingWorlds.map((world) => (
                        <div
                          key={world.id}
                          onClick={() => handleSelect(`/worlds/${world.id}`, world.nameAr)}
                          className="p-2.5 rounded-xl bg-[#EFE5D4]/80 dark:bg-white/[0.02] hover:bg-[#EFE5D4] dark:hover:bg-white/[0.06] border border-[#D8C5A8] dark:border-white/5 hover:border-[#087C7B] dark:hover:border-[#C5A15B]/40 cursor-pointer flex items-center gap-3 transition-all"
                        >
                          <img
                            src={world.image}
                            alt={world.nameAr}
                            className="w-12 h-12 rounded-lg object-cover shrink-0 border border-[#D8C5A8] dark:border-white/10"
                          />
                          <div className="overflow-hidden">
                            <h4 className="text-sm font-semibold text-[#2A1F17] dark:text-white truncate">
                              عالم {world.nameAr}
                            </h4>
                            <p className="text-[11px] text-[#604735] dark:text-zinc-400 truncate">
                              {world.descriptionAr}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stories */}
                {matchingStories.length > 0 && (
                  <div>
                    <div className="text-xs font-bold text-[#087C7B] dark:text-[#C5A15B] mb-2.5 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>القصص والمرويات ({matchingStories.length})</span>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      {matchingStories.map((story) => (
                        <div
                          key={story.id}
                          onClick={() => handleSelect(`/stories/${story.id}`, story.titleAr)}
                          className="p-3 rounded-xl bg-[#EFE5D4]/80 dark:bg-white/[0.02] hover:bg-[#EFE5D4] dark:hover:bg-white/[0.06] border border-[#D8C5A8] dark:border-white/5 hover:border-[#087C7B] dark:hover:border-[#C5A15B]/40 cursor-pointer flex items-center justify-between transition-all"
                        >
                          <div>
                            <h4 className="text-sm font-semibold text-[#2A1F17] dark:text-white">
                              {story.titleAr}
                            </h4>
                            <p className="text-xs text-[#604735] dark:text-zinc-400">{story.synopsisAr}</p>
                            <span className="text-[11px] text-[#087C7B] dark:text-[#E1C58B]">
                              بقلم: {story.authorAr}
                            </span>
                          </div>
                          <ChevronLeft className="w-4 h-4 text-[#604735] dark:text-zinc-500 shrink-0" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}
