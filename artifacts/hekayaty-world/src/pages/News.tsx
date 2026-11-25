import React, { useState } from 'react';
import { useNews } from '@/lib/hooks';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { Newspaper, Calendar, ChevronLeft, Search, Tag, Sparkles } from 'lucide-react';
import { SEOHead } from '@/components/common/SEOHead';

export default function News() {
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const { data: newsArticles = [] } = useNews();

  const categories = [
    { key: 'all', label: 'كافة المقالات' },
    { key: 'comics', label: 'إصدارات الكوميكس' },
    { key: 'selected', label: 'حكاياتي المختارة' },
    { key: 'announcements', label: 'إعلانات المنصة' },
    { key: 'community', label: 'المجتمع والفعاليات' },
  ];

  const filteredNews = newsArticles.filter((n) => {
    const matchesCat = categoryFilter === 'all' || n.category === categoryFilter;
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      n.titleAr.toLowerCase().includes(q) ||
      n.summaryAr.toLowerCase().includes(q) ||
      n.contentAr.toLowerCase().includes(q);

    return matchesCat && matchesSearch;
  });

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto font-arabic notranslate" dir="rtl" translate="no">
      <SEOHead
        title="أخبار وإعلانات منصة حكاياتي"
        description="تابع آخر أخبار الإصدارات، فعاليات المجتمع، وتحديثات ملحمة حكاياتي الرسمية."
        canonicalUrl="/news"
        ogType="website"
      />
      {/* Header */}
      <div className="mb-10 text-right">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-deep-teal/10 dark:bg-antique-gold/10 border border-deep-teal/20 dark:border-antique-gold/30 text-deep-teal dark:text-antique-gold text-xs font-semibold mb-3">
          <Newspaper className="w-3.5 h-3.5" />
          <span>مركز الأخبار والإعلانات الرسمية</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold text-foreground mb-4 font-cinzel">
          أخبار <span className="text-deep-teal dark:gold-gradient">حكاياتي</span>
        </h1>
        <p className="text-base text-foreground/70 max-w-2xl leading-relaxed">
          تابع مستجدات إصدارات القصص المصورة، تقارير أطلس العوالم، وإعلانات برامج المبدعين أولاً
          بأول.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-5 rounded-3xl border border-soft-sand/50 dark:border-white/10 mb-10 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c.key}
              type="button"
              onClick={() => setCategoryFilter(c.key)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                categoryFilter === c.key
                  ? 'bg-deep-teal text-white dark:bg-antique-gold dark:text-midnight-navy font-bold shadow-md'
                  : 'bg-soft-cream/60 dark:bg-white/[0.03] text-foreground/70 dark:text-zinc-300 hover:bg-soft-cream dark:hover:bg-white/[0.08] border border-soft-sand/40 dark:border-white/5'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث في الأخبار والبيانات..."
            className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-soft-cream/50 dark:bg-black/40 border border-soft-sand/60 dark:border-white/10 text-foreground placeholder:text-foreground/40 text-xs sm:text-sm focus:outline-none focus:border-deep-teal dark:focus:border-antique-gold/60"
          />
        </div>
      </div>

      {/* Articles Grid */}
      {filteredNews.length === 0 ? (
        <div className="text-center py-20 glass-card rounded-3xl p-8 border border-soft-sand/50 dark:border-white/10 max-w-xl mx-auto shadow-sm">
          <Newspaper className="w-12 h-12 text-foreground/30 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-foreground mb-1">
            {newsArticles.length === 0 ? 'لا توجد أخبار منشورة حالياً' : 'لا توجد أخبار مطابقة'}
          </h3>
          <p className="text-xs text-foreground/50 leading-relaxed">
            {newsArticles.length === 0
              ? 'تابعنا للاطلاع على آخر الإعلانات والبيانات الصحفية والفعاليات فور نشرها.'
              : 'جرّب اختيار تصنيف مختلف أو مسح البحث.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredNews.map((article) => (
            <motion.article
              key={article.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel rounded-3xl overflow-hidden border border-soft-sand/50 dark:border-white/10 hover:border-deep-teal/40 dark:hover:border-antique-gold/40 transition-all flex flex-col justify-between shadow-md hover:shadow-xl group"
            >
              <div>
                <div className="relative aspect-[16/9] overflow-hidden bg-soft-cream/30 dark:bg-zinc-900 shadow-sm">
                  <img
                    src={article.image}
                    alt={article.titleAr}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  <div className="absolute top-3.5 right-3.5 px-3 py-1 rounded-full text-xs font-bold bg-background/80 backdrop-blur-md text-deep-teal dark:text-antique-gold border border-soft-sand/40 dark:border-white/10">
                    {article.category}
                  </div>
                </div>

                <div className="p-6 space-y-3">
                  <div className="flex items-center gap-3 text-xs text-foreground/60">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-deep-teal dark:text-antique-gold" />
                      {article.date}
                    </span>
                    <span>•</span>
                    <span>{article.author}</span>
                  </div>

                  <h3 className="text-xl font-bold text-foreground font-cinzel group-hover:text-deep-teal dark:group-hover:text-antique-gold transition-colors leading-snug">
                    {article.titleAr}
                  </h3>

                  <p className="text-xs sm:text-sm text-foreground/75 line-clamp-3 leading-relaxed">
                    {article.summaryAr}
                  </p>
                </div>
              </div>

              <div className="p-6 pt-0">
                <Link
                  href={`/news/${article.id}`}
                  className="w-full py-2.5 px-4 rounded-xl bg-deep-teal/10 dark:bg-white/[0.04] hover:bg-deep-teal hover:text-white dark:hover:bg-antique-gold dark:hover:text-midnight-navy text-deep-teal dark:text-white font-semibold text-xs border border-deep-teal/20 dark:border-white/10 transition-all flex items-center justify-center gap-1.5 group/btn"
                >
                  <span>قراءة المقال بالكامل</span>
                  <ChevronLeft className="w-3.5 h-3.5 group-hover/btn:-translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.article>
          ))}
        </div>
      )}
    </div>
  );
}
