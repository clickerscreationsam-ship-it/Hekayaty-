import React, { useState } from 'react';
import { useCharacters, useWorlds } from '@/lib/hooks';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { Search, Shield, Sparkles, Globe, ChevronLeft, Zap } from 'lucide-react';

export default function Characters() {
  const [alignmentFilter, setAlignmentFilter] = useState<'all' | 'hero' | 'villain' | 'antihero' | 'neutral'>('all');
  const [worldFilter, setWorldFilter] = useState<string>('all');
  const [classificationFilter, setClassificationFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  const { data: characters = [] } = useCharacters();
  const { data: worlds = [] } = useWorlds();

  const alignments = [
    { key: 'all', label: 'الكل' },
    { key: 'hero', label: 'أبطال' },
    { key: 'villain', label: 'أشرار' },
    { key: 'antihero', label: 'أبطال غامضون' },
    { key: 'neutral', label: 'كيانات محايدة' },
  ];

  const classifications = [
    { key: 'all', label: 'جميع التصنيفات' },
    { key: 'original', label: 'حكاياتي الأصلية' },
    { key: 'hekayaty_selected', label: 'حكاياتي المختارة' },
    { key: 'official_collaboration', label: 'تعاون رسمي' },
  ];

  const filteredCharacters = characters.filter((c) => {
    const matchesAlignment = alignmentFilter === 'all' || c.alignment === alignmentFilter;
    const matchesWorld = worldFilter === 'all' || c.worldId === worldFilter;
    const matchesClassification = classificationFilter === 'all' || c.classification === classificationFilter;
    const query = search.trim().toLowerCase();
    const matchesSearch =
      !query ||
      c.nameAr.toLowerCase().includes(query) ||
      c.nameEn.toLowerCase().includes(query) ||
      c.aliasAr.toLowerCase().includes(query) ||
      c.bioAr.toLowerCase().includes(query) ||
      c.powersAr.some((p) => p.toLowerCase().includes(query));

    return matchesAlignment && matchesWorld && matchesClassification && matchesSearch;
  });

  const getAlignmentBadge = (alignment: string) => {
    switch (alignment) {
      case 'hero':
        return { label: 'بطل', bg: 'bg-[#087C7B]/10 dark:bg-emerald-500/10 text-[#087C7B] dark:text-emerald-400 border-[#087C7B]/30 dark:border-emerald-500/30' };
      case 'villain':
        return { label: 'شرير', bg: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30' };
      case 'antihero':
        return { label: 'غامض', bg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30' };
      default:
        return { label: 'محايد', bg: 'bg-[#604735]/10 dark:bg-zinc-500/10 text-[#604735] dark:text-zinc-300 border-[#D8C5A8] dark:border-zinc-500/30' };
    }
  };

  const getClassificationBadge = (cls: string) => {
    switch (cls) {
      case 'original':
        return { label: 'أصلي', bg: 'bg-[#C5A15B]/15 text-[#927849] dark:text-[#E1C58B] border-[#C5A15B]/40' };
      case 'hekayaty_selected':
        return { label: 'مختار', bg: 'bg-[#087C7B]/15 text-[#087C7B] dark:text-[#119B98] border-[#087C7B]/40' };
      default:
        return { label: 'تعاون', bg: 'bg-purple-500/15 text-purple-600 dark:text-purple-300 border-purple-500/40' };
    }
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto font-arabic" dir="rtl">
      {/* Header */}
      <div className="mb-10 text-right">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#087C7B]/10 dark:bg-[#C5A15B]/10 border border-[#087C7B]/30 dark:border-[#C5A15B]/30 text-[#087C7B] dark:text-[#E1C58B] text-xs font-semibold mb-3">
          <Shield className="w-3.5 h-3.5" />
          <span>سجل أبطال وشخصيات الكون</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold text-[#2A1F17] dark:text-white mb-4">
          أبطال <span className="gold-gradient">حكاياتي</span>
        </h1>
        <p className="text-base text-[#604735] dark:text-zinc-400 max-w-2xl leading-relaxed">
          تعرف على الشخصيات الخارقة، الكيانات الكوزمية، وسادة الظلال الذين يحددون مصير الأبعاد الخمسة في ملحمة حكاياتي.
        </p>
      </div>

      {/* Filter / Search Bar */}
      <div className="glass-panel p-5 rounded-3xl mb-10 space-y-4">
        {/* Alignment Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {alignments.map((a) => (
              <button
                key={a.key}
                type="button"
                onClick={() => setAlignmentFilter(a.key as any)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  alignmentFilter === a.key
                    ? 'bg-[#087C7B] dark:bg-[#C5A15B] text-[#F7F1E6] dark:text-[#111C2B] shadow-md'
                    : 'bg-[#EFE5D4]/70 dark:bg-white/[0.03] text-[#604735] dark:text-zinc-300 hover:text-[#087C7B] dark:hover:text-white border border-[#D8C5A8] dark:border-white/5'
                }`}
              >
                {a.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#604735] dark:text-zinc-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث بالاسم، القدرة، أو اللقب..."
              className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-white dark:bg-white/[0.04] border border-[#D8C5A8] dark:border-white/10 text-[#2A1F17] dark:text-white placeholder-[#604735]/60 dark:placeholder-zinc-500 text-xs sm:text-sm focus:outline-none focus:border-[#087C7B] dark:focus:border-[#C5A15B]/60"
            />
          </div>
        </div>

        {/* Secondary filters: Worlds & Classification */}
        <div className="pt-3 border-t border-[#D8C5A8]/50 dark:border-white/5 flex flex-wrap items-center gap-3 text-xs">
          <span className="text-[#604735] dark:text-zinc-500 font-semibold">تصفية بحسب:</span>

          {/* World Filter */}
          <select
            value={worldFilter}
            onChange={(e) => setWorldFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-[#EFE5D4] dark:bg-zinc-900 border border-[#D8C5A8] dark:border-white/10 text-[#2A1F17] dark:text-zinc-300 focus:outline-none focus:border-[#087C7B] dark:focus:border-[#C5A15B]"
          >
            <option value="all">كل العوالم</option>
            {worlds.map((w) => (
              <option key={w.id} value={w.id}>
                عالم {w.nameAr}
              </option>
            ))}
          </select>

          {/* Classification Filter */}
          <select
            value={classificationFilter}
            onChange={(e) => setClassificationFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-[#EFE5D4] dark:bg-zinc-900 border border-[#D8C5A8] dark:border-white/10 text-[#2A1F17] dark:text-zinc-300 focus:outline-none focus:border-[#087C7B] dark:focus:border-[#C5A15B]"
          >
            {classifications.map((c) => (
              <option key={c.key} value={c.key}>
                {c.label}
              </option>
            ))}
          </select>

          <span className="mr-auto text-[#604735] dark:text-zinc-400">
            تم العثور على <strong className="text-[#087C7B] dark:text-[#E1C58B]">{filteredCharacters.length}</strong> شخصية
          </span>
        </div>
      </div>

      {/* Characters Grid */}
      {filteredCharacters.length === 0 ? (
        <div className="text-center py-20 glass-card rounded-3xl p-8 max-w-xl mx-auto border border-[#D8C5A8] dark:border-white/10 shadow-sm">
          <Shield className="w-12 h-12 text-[#087C7B]/40 dark:text-[#C5A15B]/40 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-[#2A1F17] dark:text-zinc-300 mb-1">
            {characters.length === 0 ? 'سجل الأبطال والشخصيات قيد التجهيز' : 'لا توجد شخصيات مطابقة'}
          </h3>
          <p className="text-xs text-[#604735] dark:text-zinc-400 leading-relaxed">
            {characters.length === 0
              ? 'سيتم إدراج الشخصيات والأبطال فور توثيقهم في قاعدة البيانات.'
              : 'جرّب تغيير خيارات التصفية أو مسح عبارة البحث.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredCharacters.map((char) => {
            const world = worlds.find((w) => w.id === char.worldId);
            const align = getAlignmentBadge(char.alignment);
            const cls = getClassificationBadge(char.classification);

            return (
              <motion.div
                key={char.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="group relative rounded-3xl overflow-hidden bg-[#FAF5ED] dark:bg-zinc-950 border border-[#D8C5A8] dark:border-white/10 hover:border-[#087C7B] dark:hover:border-[#C5A15B]/50 transition-all duration-300 flex flex-col justify-between shadow-md hover:shadow-lg"
              >
                {/* Character Image */}
                <div className="relative aspect-[3/4] overflow-hidden bg-[#EFE5D4] dark:bg-zinc-900">
                  <img
                    src={char.image}
                    alt={char.nameAr}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111C2B] via-transparent to-transparent opacity-80 dark:opacity-90" />

                  {/* Top Badges */}
                  <div className="absolute top-3.5 right-3.5 left-3.5 flex items-center justify-between pointer-events-none">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border backdrop-blur-md ${align.bg}`}>
                      {align.label}
                    </span>
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border backdrop-blur-md ${cls.bg}`}>
                      {cls.label}
                    </span>
                  </div>

                  {/* World Badge */}
                  {world && (
                    <div className="absolute bottom-3 right-3.5 flex items-center gap-1.5 text-xs text-[#F3EBDD] bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10">
                      <Globe className="w-3.5 h-3.5 text-[#E1C58B]" />
                      <span>{world.nameAr}</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-[#2A1F17] dark:text-white group-hover:text-[#087C7B] dark:group-hover:text-[#E1C58B] transition-colors mb-1">
                      {char.nameAr}
                    </h3>
                    <p className="text-xs font-semibold text-[#087C7B] dark:text-[#E1C58B] mb-2">{char.aliasAr}</p>
                    <p className="text-xs text-[#604735] dark:text-zinc-400 line-clamp-2 leading-relaxed">
                      {char.bioAr}
                    </p>
                  </div>

                  {/* Power Rating + Powers Preview */}
                  <div>
                    {/* Power Rating Badge */}
                    {(() => {
                      const rating = char.powerRating ?? char.stats?.powerRating ?? null;
                      if (rating !== null && rating !== undefined) {
                        const ratingNum = Number(rating);
                        const color =
                          ratingNum >= 90 ? 'text-red-400 border-red-500/50 bg-red-500/10' :
                          ratingNum >= 70 ? 'text-orange-400 border-orange-500/50 bg-orange-500/10' :
                          ratingNum >= 50 ? 'text-[#C5A15B] border-[#C5A15B]/50 bg-[#C5A15B]/10' :
                          'text-[#087C7B] border-[#087C7B]/50 bg-[#087C7B]/10';
                        return (
                          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-bold mb-2.5 ${color}`}>
                            <Zap className="w-3 h-3" />
                            <span>⚡ {ratingNum}/100</span>
                          </div>
                        );
                      }
                      return null;
                    })()}

                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {char.powersAr.slice(0, 2).map((power, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-[#EFE5D4] dark:bg-white/[0.04] text-[10px] text-[#604735] dark:text-zinc-300 border border-[#D8C5A8] dark:border-white/5"
                        >
                          {power}
                        </span>
                      ))}
                      {char.powersAr.length > 2 && (
                        <span className="px-1.5 py-0.5 text-[10px] text-[#604735] dark:text-zinc-500">
                          +{char.powersAr.length - 2}
                        </span>
                      )}
                    </div>

                    {/* View Details Link */}
                    <Link
                      href={`/characters/${char.id}`}
                      className="w-full py-2.5 px-4 rounded-xl bg-[#EFE5D4] dark:bg-white/[0.04] hover:bg-[#087C7B] dark:hover:bg-[#C5A15B] text-[#2A1F17] hover:text-[#F7F1E6] dark:text-white dark:hover:text-[#111C2B] font-semibold text-xs border border-[#D8C5A8] dark:border-white/10 transition-all flex items-center justify-center gap-1.5 group/btn"
                    >
                      <span>الملف الكامل للشخصية</span>
                      <ChevronLeft className="w-3.5 h-3.5 group-hover/btn:-translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
