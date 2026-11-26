import React, { useState } from 'react';
import { useEncyclopedia, useCharacters, useWorlds } from '@/lib/hooks';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import {
  BookMarked,
  Search,
  Tag,
  Shield,
  Zap,
  MapPin,
  Cpu,
  Layers,
  ChevronLeft,
  Sparkles,
} from 'lucide-react';

export default function Encyclopedia() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [search, setSearch] = useState('');
  const { data: encyclopediaEntries = [] } = useEncyclopedia();
  const { data: characters = [] } = useCharacters();
  const { data: worlds = [] } = useWorlds();

  const categories = [
    { key: 'all', label: 'كافة المدخلات' },
    { key: 'artifact', label: 'القطع والأسلحة الأثرية' },
    { key: 'technology', label: 'التقنيات ومصادر الطاقة' },
    { key: 'organization', label: 'الجيوش والمنظمات' },
    { key: 'creature', label: 'الكائنات الحيوية' },
    { key: 'location', label: 'المواقع الحيوية' },
    { key: 'power', label: 'المدارس والقدرات' },
  ];

  const filteredEntries = encyclopediaEntries.filter((entry) => {
    const matchesCat = selectedCategory === 'all' || entry.category === selectedCategory;
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      entry.titleAr.toLowerCase().includes(q) ||
      entry.titleEn.toLowerCase().includes(q) ||
      entry.descriptionAr.toLowerCase().includes(q) ||
      entry.tags.some((t) => t.toLowerCase().includes(q));

    return matchesCat && matchesSearch;
  });

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'artifact':
        return { label: 'أثر كوني', color: 'bg-antique-gold/15 text-antique-gold border-antique-gold/30' };
      case 'technology':
        return { label: 'تكنولوجيا', color: 'bg-deep-teal/15 text-deep-teal dark:text-rich-turquoise border-deep-teal/30 dark:border-rich-turquoise/30' };
      case 'organization':
        return { label: 'منظمة', color: 'bg-purple-600/15 text-purple-700 dark:text-purple-300 border-purple-500/30' };
      case 'creature':
        return { label: 'كائن كوني', color: 'bg-emerald-600/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30' };
      case 'power':
        return { label: 'قدرة', color: 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30' };
      default:
        return { label: 'موقع', color: 'bg-rich-turquoise/15 text-deep-teal dark:text-rich-turquoise border-rich-turquoise/30' };
    }
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto font-arabic" dir="rtl">
      {/* Header */}
      <div className="mb-10 text-right">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-deep-teal/10 dark:bg-antique-gold/10 border border-deep-teal/20 dark:border-antique-gold/30 text-deep-teal dark:text-antique-gold text-xs font-semibold mb-3">
          <BookMarked className="w-3.5 h-3.5" />
          <span>الموسوعة الشاملة لأسرار الكون</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold text-foreground mb-4 font-cinzel">
          موسوعة <span className="text-deep-teal dark:gold-gradient">حكاياتي</span>
        </h1>
        <p className="text-base text-foreground/70 max-w-2xl leading-relaxed">
          دليلك الموثق إلى علوم الأسلحة النادرة، التكنولوجيا البلورية الهجينة، الفصائل السرية،
          والكيانات الأسطورية في مجرة حكاياتي.
        </p>
      </div>

      {/* Filter and Search Box */}
      <div className="glass-panel p-5 rounded-3xl border border-soft-sand/50 dark:border-white/10 mb-10 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c.key}
                type="button"
                onClick={() => setSelectedCategory(c.key)}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  selectedCategory === c.key
                    ? 'bg-deep-teal text-white dark:bg-antique-gold dark:text-midnight-navy font-bold shadow-md'
                    : 'bg-soft-cream/60 dark:bg-white/[0.03] text-foreground/70 dark:text-zinc-300 hover:bg-soft-cream dark:hover:bg-white/[0.08] border border-soft-sand/40 dark:border-white/5'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث في الموسوعة أو بالوسوم..."
              className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-soft-cream/50 dark:bg-black/40 border border-soft-sand/60 dark:border-white/10 text-foreground placeholder:text-foreground/40 text-xs sm:text-sm focus:outline-none focus:border-deep-teal dark:focus:border-antique-gold/60"
            />
          </div>
        </div>

        <div className="text-xs text-foreground/60 pt-2 border-t border-soft-sand/40 dark:border-white/5 flex items-center justify-between">
          <span>
            عرض <strong className="text-deep-teal dark:text-antique-gold">{filteredEntries.length}</strong> مادة توثيقية
          </span>
          <span className="text-[11px] text-foreground/40">تم التحديث طبقاً للارشيف الأسطوري الأخير</span>
        </div>
      </div>

      {/* Entries Grid */}
      {filteredEntries.length === 0 ? (
        <div className="text-center py-20 glass-card rounded-3xl p-8 border border-soft-sand/50 dark:border-white/10 max-w-xl mx-auto shadow-sm">
          <BookMarked className="w-12 h-12 text-foreground/30 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-foreground mb-1">
            {encyclopediaEntries.length === 0 ? 'الموسوعة الكونية قيد التوثيق' : 'لم نعثر على مدخلات'}
          </h3>
          <p className="text-xs text-foreground/50 leading-relaxed">
            {encyclopediaEntries.length === 0
              ? 'سيتم إدراج مواد الموسوعة والأسرار والعتاد فور توثيقها في قاعدة البيانات.'
              : 'جرّب البحث باسم قطعة مثل "الدرع" أو كلمة أعم.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEntries.map((entry) => {
            const badge = getCategoryBadge(entry.category);
            const chars = characters.filter((c) => entry.relatedCharacterIds?.includes(c.id));
            const entryWorlds = worlds.filter((w) => entry.relatedWorldIds?.includes(w.id));

            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="glass-panel p-6 rounded-3xl border border-soft-sand/50 dark:border-white/10 hover:border-deep-teal/40 dark:hover:border-antique-gold/50 transition-all flex flex-col justify-between shadow-md hover:shadow-xl group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${badge.color}`}>
                      {badge.label}
                    </span>
                    <span className="text-[11px] text-foreground/40 font-mono">{entry.titleEn}</span>
                  </div>

                  {entry.image && (
                    <div className="aspect-[16/9] rounded-2xl overflow-hidden mb-4 border border-soft-sand/40 dark:border-white/10 bg-soft-cream/30 dark:bg-zinc-900 shadow-sm">
                      <img
                        src={entry.image}
                        alt={entry.titleAr}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}

                  <h3 className="text-lg font-bold text-foreground font-cinzel group-hover:text-deep-teal dark:group-hover:text-antique-gold transition-colors mb-2">
                    {entry.titleAr}
                  </h3>

                  <p className="text-xs sm:text-sm text-foreground/75 leading-relaxed line-clamp-3 mb-4">
                    {entry.descriptionAr}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {entry.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-soft-cream/60 dark:bg-white/[0.04] text-[10px] text-foreground/60 dark:text-zinc-400 border border-soft-sand/40 dark:border-white/5"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-soft-sand/40 dark:border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-foreground/60">
                    {chars.length > 0 && <span>{chars[0].nameAr}</span>}
                    {entryWorlds.length > 0 && <span>• {entryWorlds[0].nameAr}</span>}
                  </div>

                  <Link
                    href={`/encyclopedia/${entry.id}`}
                    className="text-xs text-deep-teal dark:text-antique-gold font-semibold hover:underline flex items-center gap-1 group-hover:-translate-x-1 transition-transform"
                  >
                    <span>التفاصيل</span>
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
