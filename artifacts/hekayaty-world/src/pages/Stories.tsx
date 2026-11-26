import React, { useState } from 'react';
import { useStories, useCharacters, useWorlds } from '@/lib/hooks';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { SEOHead } from '@/components/common/SEOHead';
import {
  BookOpen,
  Search,
  Clock,
  Sparkles,
  ChevronLeft,
  User,
  Bookmark,
  Share2,
  FileText,
} from 'lucide-react';

export default function Stories() {
  const [classificationFilter, setClassificationFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const { data: stories = [] } = useStories();
  const { data: characters = [] } = useCharacters();
  const { data: worlds = [] } = useWorlds();

  const filteredStories = stories.filter((s) => {
    const matchesCls = classificationFilter === 'all' || s.classification === classificationFilter;
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      s.titleAr.toLowerCase().includes(q) ||
      s.authorAr.toLowerCase().includes(q) ||
      s.synopsisAr.toLowerCase().includes(q) ||
      s.genresAr.some((g) => g.toLowerCase().includes(q));

    return matchesCls && matchesSearch;
  });

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto font-arabic notranslate" dir="rtl" translate="no">
      <SEOHead
        title="مكتبة القصص والمرويات الأدبية"
        description="اقرأ أحدث القصص الأدبية، المرويات الخيالية، والروايات المصورة المكتوبة بقلم نخبة مبدعي حكاياتي."
        canonicalUrl="/stories"
        ogType="website"
      />
      {/* Header */}
      <div className="mb-10 text-right">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-deep-teal/10 dark:bg-antique-gold/10 border border-deep-teal/20 dark:border-antique-gold/30 text-deep-teal dark:text-antique-gold text-xs font-semibold mb-3">
          <BookOpen className="w-3.5 h-3.5" />
          <span>المرويات والنصوص الأدبية</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-5xl font-bold text-foreground mb-4 font-cinzel">
              قصص ومرويات <span className="text-deep-teal dark:gold-gradient">الكون</span>
            </h1>
            <p className="text-base text-foreground/70 max-w-2xl leading-relaxed">
              انغمس في نصوص روائية وسردية حصرية تغوص في أعماق الشخصيات، وتكشف أسرار العوالم بيوميات
              وجدانية وأحداث مشوقة.
            </p>
          </div>
          <Link
            href="/reader"
            className="self-start sm:self-auto inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-antique-gold/15 hover:bg-antique-gold/25 text-antique-gold border border-antique-gold/30 text-xs font-bold transition-all shadow-md group"
          >
            <FileText className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span>القارئ الذكي (رفع PDF أو لصق نصوص)</span>
          </Link>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="glass-panel p-5 rounded-3xl border border-soft-sand/50 dark:border-white/10 mb-10 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'all', label: 'كافة القصص' },
            { key: 'original', label: 'حكاياتي الأصلية' },
            { key: 'hekayaty_selected', label: 'حكاياتي المختارة' },
            { key: 'official_collaboration', label: 'تعاون رسمي' },
          ].map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setClassificationFilter(item.key)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                classificationFilter === item.key
                  ? 'bg-deep-teal text-white dark:bg-antique-gold dark:text-midnight-navy font-bold shadow-md'
                  : 'bg-soft-cream/60 dark:bg-white/5 text-foreground/70 dark:text-zinc-300 hover:bg-soft-cream dark:hover:bg-white/10 border border-soft-sand/40 dark:border-white/5'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث بالعنوان، الكاتب، أو الموضوع..."
            className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-soft-cream/50 dark:bg-black/40 border border-soft-sand/60 dark:border-white/10 text-foreground placeholder:text-foreground/40 text-xs sm:text-sm focus:outline-none focus:border-deep-teal dark:focus:border-antique-gold/60"
          />
        </div>
      </div>

      {/* Stories Grid */}
      {filteredStories.length === 0 ? (
        <div className="text-center py-20 glass-card rounded-3xl p-8 border border-soft-sand/50 dark:border-white/10 max-w-xl mx-auto shadow-sm">
          <BookOpen className="w-12 h-12 text-foreground/30 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-foreground mb-1">
            {stories.length === 0 ? 'لا توجد قصص منشورة حالياً' : 'لم نجد قصصاً مطابقة'}
          </h3>
          <p className="text-xs text-foreground/50 leading-relaxed">
            {stories.length === 0
              ? 'سيتم إدراج الروايات والقصص فور نشرها في قاعدة البيانات.'
              : 'جرّب البحث بكلمة مختلفة أو تغيير تصنيف القصص.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStories.map((story) => {
            const char = characters.find((c) => story.characterIds?.includes(c.id));

            return (
              <motion.div
                key={story.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="glass-panel rounded-3xl overflow-hidden border border-soft-sand/50 dark:border-white/10 hover:border-deep-teal/50 dark:hover:border-antique-gold/50 transition-all flex flex-col justify-between shadow-md hover:shadow-xl group"
              >
                <div>
                  <div className="relative aspect-[16/9] overflow-hidden bg-soft-cream/30 dark:bg-zinc-900">
                    <img
                      src={story.coverImage}
                      alt={story.titleAr}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    <div className="absolute top-3.5 right-3.5 flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-background/80 backdrop-blur-md text-deep-teal dark:text-antique-gold border border-soft-sand/40 dark:border-white/10">
                        {story.classification === 'original'
                          ? 'أصلي'
                          : story.classification === 'hekayaty_selected'
                          ? 'مختارة'
                          : 'تعاون'}
                      </span>
                    </div>

                    <div className="absolute bottom-3 right-3.5 flex items-center gap-2 text-xs text-warm-ivory">
                      <Clock className="w-3.5 h-3.5 text-antique-gold" />
                      <span>{story.readTimeMinutes} دقيقة قراءة</span>
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <h3 className="text-lg font-bold text-foreground group-hover:text-deep-teal dark:group-hover:text-antique-gold transition-colors font-cinzel">
                      {story.titleAr}
                    </h3>

                    <div className="flex items-center gap-2 text-xs text-foreground/60">
                      <User className="w-3.5 h-3.5 text-deep-teal dark:text-antique-gold" />
                      <span>بقلم: {story.authorAr}</span>
                    </div>

                    <p className="text-xs sm:text-sm text-foreground/75 line-clamp-3 leading-relaxed">
                      {story.synopsisAr}
                    </p>

                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {story.genresAr.map((g, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-soft-cream/60 dark:bg-white/5 text-[10px] text-foreground/60 dark:text-zinc-400 border border-soft-sand/40 dark:border-white/5"
                        >
                          {g}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <Link
                    href={`/stories/${story.id}`}
                    className="w-full py-2.5 px-4 rounded-xl bg-deep-teal/10 dark:bg-white/[0.04] hover:bg-deep-teal hover:text-white dark:hover:bg-antique-gold dark:hover:text-midnight-navy text-deep-teal dark:text-white font-semibold text-xs border border-deep-teal/20 dark:border-white/10 transition-all flex items-center justify-center gap-1.5 group/btn"
                  >
                    <span>قراءة القصة كاملة</span>
                    <ChevronLeft className="w-3.5 h-3.5 group-hover/btn:-translate-x-1 transition-transform" />
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
