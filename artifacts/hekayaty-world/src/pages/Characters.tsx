import React, { useState, useEffect } from 'react';
import { useCharacters, useWorlds } from '@/lib/hooks';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'wouter';
import { Search, Shield, Sparkles, Globe, ChevronLeft, Zap, Trophy, SlidersHorizontal, LayoutGrid, Layers, Eye } from 'lucide-react';
import { SEOHead } from '@/components/common/SEOHead';
import { LegendaryCharacterCard, getCharacterRarity } from '@/components/characters/LegendaryCharacterCard';
import type { Character } from '@/types';

export default function Characters() {
  const [alignmentFilter, setAlignmentFilter] = useState<'all' | 'hero' | 'villain' | 'antihero' | 'neutral'>('all');
  const [worldFilter, setWorldFilter] = useState<string>('all');
  const [rarityFilter, setRarityFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'showcase'>('grid');

  const { data: characters = [] } = useCharacters();
  const { data: worlds = [] } = useWorlds();

  // Set initial selected character to first available
  useEffect(() => {
    if (!selectedCharacter && characters.length > 0) {
      setSelectedCharacter(characters[0]);
    }
  }, [characters, selectedCharacter]);

  const alignments = [
    { key: 'all', label: 'الكل' },
    { key: 'hero', label: 'أبطال' },
    { key: 'villain', label: 'أشرار' },
    { key: 'antihero', label: 'أبطال غامضون' },
    { key: 'neutral', label: 'كيانات محايدة' },
  ];

  const rarities = [
    { key: 'all', label: 'جميع المستويات' },
    { key: 'mythic', label: 'ميثيك أسطوري (95+)' },
    { key: 'legendary', label: 'ليجندري (85+)' },
    { key: 'epic', label: 'إيبك ملحمي (70+)' },
    { key: 'rare', label: 'نادر (50+)' },
  ];

  const filteredCharacters = characters.filter((c) => {
    const matchesAlignment = alignmentFilter === 'all' || c.alignment === alignmentFilter;
    const matchesWorld = worldFilter === 'all' || c.worldId === worldFilter;
    const matchesRarity = rarityFilter === 'all' || getCharacterRarity(c) === rarityFilter;
    const query = search.trim().toLowerCase();
    const matchesSearch =
      !query ||
      c.nameAr.toLowerCase().includes(query) ||
      c.nameEn.toLowerCase().includes(query) ||
      (c.aliasAr && c.aliasAr.toLowerCase().includes(query)) ||
      (c.bioAr && c.bioAr.toLowerCase().includes(query)) ||
      (c.powersAr && c.powersAr.some((p) => p.toLowerCase().includes(query)));

    return matchesAlignment && matchesWorld && matchesRarity && matchesSearch;
  });

  const activeChar = selectedCharacter || filteredCharacters[0] || characters[0];
  const activeWorld = worlds.find((w) => w.id === activeChar?.worldId);

  return (
    <div className="relative min-h-screen text-white font-arabic notranslate overflow-hidden bg-[#070B12]" dir="rtl" translate="no">
      <SEOHead
        title="موسوعة وبطاقات الشخصيات الأسطورية | عالم حكاياتي"
        description="استكشف سجل الأبطال والشخصيات والكيانات الأسطورية في عوالم حكاياتي مع بطاقات تداول أسطورية تفاعلية ومؤشرات قوة شاملة."
        canonicalUrl="https://hekayaty.com/characters"
        ogType="website"
      />

      {/* ─────────────────────────────────────────────────────────────────────────────
          1. IMMERSIVE DYNAMIC ARTWORK BACKGROUND OF THE SELECTED CHARACTER
          ───────────────────────────────────────────────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <AnimatePresence mode="wait">
          {activeChar && (
            <motion.div
              key={activeChar.id}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="absolute inset-0"
            >
              {/* Actual High-Res Artwork of the Character — Maximum Visibility */}
              <img
                src={activeChar.image}
                alt={activeChar.nameAr}
                className="w-full h-full object-cover object-top filter brightness-[0.75] contrast-105 saturate-120"
              />

              {/* Minimal edge gradients only — artwork stays vivid & clear */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#070B12] via-[#070B12]/30 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#070B12]/70 via-transparent to-transparent" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────────────
          2. FOREGROUND PAGE CONTENT
          ───────────────────────────────────────────────────────────────────────────── */}
      <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Cinematic Header & Selected Character Focus Bar */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-white/10">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#C5A15B]/20 border border-[#C5A15B]/40 text-[#E1C58B] text-xs font-bold shadow-md">
              <Sparkles className="w-3.5 h-3.5" />
              <span>موسوعة وبطاقات الأبطال والكيانات الأسطورية</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight drop-shadow-[0_4px_25px_rgba(0,0,0,0.9)]">
              سجل الشخصيات وبطاقات القوة
            </h1>

            <p className="text-sm sm:text-base text-zinc-300 leading-relaxed font-medium">
              تصفح بطاقات الأبطال والكيانات المستوحاة من ألعاب البطاقات الأسطورية. كل بطاقة تكشف هوية البطل، تقييم القوة، وقدراته الخارقة.
            </p>
          </div>

          {/* Quick Active Character Spotlight Preview */}
          {activeChar && (
            <motion.div
              key={activeChar.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-black/60 backdrop-blur-xl border border-[#C5A15B]/40 rounded-2xl p-4 flex items-center gap-4 shadow-2xl lg:max-w-sm shrink-0"
            >
              <img
                src={activeChar.image}
                alt={activeChar.nameAr}
                className="w-16 h-20 object-cover object-top rounded-xl border border-white/20 shrink-0"
              />
              <div className="space-y-1">
                <span className="text-[10px] text-[#C5A15B] font-bold block uppercase tracking-wider">
                  البطل المحدد حالياً في الخلفية
                </span>
                <h3 className="font-extrabold text-base text-white">{activeChar.nameAr}</h3>
                <p className="text-xs text-zinc-400 line-clamp-1">{activeChar.aliasAr}</p>
                <Link
                  href={`/characters/${activeChar.id}`}
                  className="text-xs text-[#C5A15B] hover:text-[#F3DEB0] font-bold flex items-center gap-1 mt-1"
                >
                  <span>فتح الملف الكامل</span>
                  <ChevronLeft className="w-3.5 h-3.5" />
                </Link>
              </div>
            </motion.div>
          )}
        </div>

        {/* ─────────────────────────────────────────────────────────────────────────────
            3. ADVANCED SEARCH & CONTROLS TOOLBAR
            ───────────────────────────────────────────────────────────────────────────── */}
        <div className="bg-[#0D1524]/85 backdrop-blur-xl p-4 sm:p-5 rounded-2xl border border-white/10 shadow-xl space-y-4">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="ابحث بالاسم، اللقب، العالم، أو القدرات الخارقة..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-[#C5A15B] transition-all"
              />
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-black/60 p-1 rounded-xl border border-white/10 shrink-0">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  viewMode === 'grid'
                    ? 'bg-[#C5A15B] text-black shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
                title="عرض شبكة البطاقات"
              >
                <LayoutGrid className="w-4 h-4" />
                <span className="hidden sm:inline">شبكة البطاقات</span>
              </button>

              <button
                onClick={() => setViewMode('showcase')}
                className={`p-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  viewMode === 'showcase'
                    ? 'bg-[#C5A15B] text-black shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
                title="معرض العرض الكبير"
              >
                <Layers className="w-4 h-4" />
                <span className="hidden sm:inline">عرض المعرض</span>
              </button>
            </div>
          </div>

          {/* Filter Pills Strip */}
          <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-white/10 text-xs">
            <span className="text-zinc-400 font-bold">الانتماء:</span>
            {alignments.map((a) => (
              <button
                key={a.key}
                onClick={() => setAlignmentFilter(a.key as any)}
                className={`px-3 py-1 rounded-xl border transition-all font-bold ${
                  alignmentFilter === a.key
                    ? 'bg-[#087C7B] border-[#087C7B] text-white shadow-md'
                    : 'bg-black/40 border-white/10 text-zinc-400 hover:text-white hover:border-white/20'
                }`}
              >
                {a.label}
              </button>
            ))}

            <div className="h-4 w-[1px] bg-white/20 mx-1 hidden sm:block" />

            <span className="text-zinc-400 font-bold">المستوى / الندرة:</span>
            <select
              value={rarityFilter}
              onChange={(e) => setRarityFilter(e.target.value)}
              className="px-3 py-1 rounded-xl bg-black/60 border border-white/15 text-zinc-300 text-xs focus:outline-none focus:border-[#C5A15B]"
            >
              {rarities.map((r) => (
                <option key={r.key} value={r.key}>
                  {r.label}
                </option>
              ))}
            </select>

            <span className="text-zinc-400 font-bold">العالم:</span>
            <select
              value={worldFilter}
              onChange={(e) => setWorldFilter(e.target.value)}
              className="px-3 py-1 rounded-xl bg-black/60 border border-white/15 text-zinc-300 text-xs focus:outline-none focus:border-[#C5A15B]"
            >
              <option value="all">جميع العوالم ({worlds.length})</option>
              {worlds.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.nameAr}
                </option>
              ))}
            </select>

            <span className="mr-auto text-zinc-400 text-xs font-semibold">
              تم العثور على <strong className="text-[#E1C58B]">{filteredCharacters.length}</strong> بطل وبطاقة
            </span>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────────────────────
            4. LEGENDARY CARDS PRESENTATION (GRID / SHOWCASE)
            ───────────────────────────────────────────────────────────────────────────── */}
        {filteredCharacters.length === 0 ? (
          <div className="text-center py-20 bg-[#0B1220]/80 backdrop-blur-md rounded-3xl p-8 max-w-xl mx-auto border border-white/10 shadow-2xl">
            <Shield className="w-14 h-14 text-[#C5A15B]/40 mx-auto mb-3" />
            <h3 className="text-xl font-bold text-white mb-2">لا توجد شخصيات مطابقة للبحث</h3>
            <p className="text-xs text-zinc-400 leading-relaxed mb-4">
              جرّب تغيير فلاتر الانتماء أو الندرة أو البحث بكلمات أخرى.
            </p>
            <button
              onClick={() => {
                setSearch('');
                setAlignmentFilter('all');
                setWorldFilter('all');
                setRarityFilter('all');
              }}
              className="px-5 py-2 bg-[#C5A15B] text-black font-bold rounded-xl text-xs hover:opacity-90"
            >
              إعادة ضبط الفلاتر
            </button>
          </div>
        ) : (
          <div
            className={`grid gap-6 ${
              viewMode === 'grid'
                ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
                : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
            }`}
          >
            {filteredCharacters.map((char) => {
              const world = worlds.find((w) => w.id === char.worldId);
              const isSelected = activeChar?.id === char.id;

              return (
                <LegendaryCharacterCard
                  key={char.id}
                  character={char}
                  world={world}
                  isSelected={isSelected}
                  onSelect={(c) => setSelectedCharacter(c)}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
