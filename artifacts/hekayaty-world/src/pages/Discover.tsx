import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import {
  Compass,
  BookOpen,
  Sparkles,
  Globe,
  Users,
  Clock,
  BookMarked,
  Award,
  ChevronLeft,
  Flame,
  ArrowRight,
} from 'lucide-react';
import { useComics, useCharacters, useWorlds, useSeries, useStories } from '@/lib/hooks';

export default function Discover() {
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const { data: comics = [] } = useComics();
  const { data: characters = [] } = useCharacters();
  const { data: worlds = [] } = useWorlds();
  const { data: series = [] } = useSeries();
  const { data: stories = [] } = useStories();

  const genres = ['all', 'أكشن', 'خيال', 'خيال علمي', 'مغامرة', 'سايبربانك', 'كوني'];

  const entryPoints = comics.slice(0, 3).map((comic, idx) => ({
    title: idx === 0 ? 'نقطة الانطلاق الأولى للمبتدئين' : idx === 1 ? 'استكشاف الأبعاد والعوالم' : 'من حكاياتي المختارة',
    subtitle: comic.titleAr,
    desc: comic.synopsisAr || 'المدخل الأساسي للتعرف على أبطال هذا الإصدار وبداية رحلته.',
    link: `/comics/${comic.id}`,
    tag: idx === 0 ? 'موصى به للبدء' : idx === 1 ? 'إصدار مميز' : 'من حكاياتي المختارة',
    comic: comic,
  }));

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto font-arabic" dir="rtl">
      {/* Hero Banner */}
      <div className="mb-12 text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-deep-teal/10 dark:bg-antique-gold/10 border border-deep-teal/20 dark:border-antique-gold/30 text-deep-teal dark:text-antique-gold text-xs font-semibold mb-1">
          <Compass className="w-3.5 h-3.5" />
          <span>بوابة الاستكشاف الشاملة</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold text-foreground font-cinzel">
          استكشف <span className="text-deep-teal dark:gold-gradient">عوالم وحكايات حكاياتي</span>
        </h1>
        <p className="text-base text-foreground/70 leading-relaxed">
          دليلك الموجه للبدء في قراءة الأعداد المصورة، متابعة السلاسل المترابطة، واستكشاف الأساطير
          والعوالم المتشعبة.
        </p>
      </div>

      {/* Suggested Reading Entry Points */}
      <div className="mb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground font-cinzel flex items-center gap-2">
            <Flame className="w-5 h-5 text-deep-teal dark:text-antique-gold" />
            <span>من أين تبدأ القراءة؟ (نقاط الانطلاق الموصى بها)</span>
          </h2>
        </div>

        {entryPoints.length === 0 ? (
          <div className="glass-panel rounded-3xl p-10 text-center border border-soft-sand/50 dark:border-white/10 max-w-xl mx-auto shadow-sm">
            <BookOpen className="w-12 h-12 mx-auto mb-3 text-deep-teal/40 dark:text-antique-gold/40" />
            <h3 className="text-base font-bold text-foreground mb-1">لا توجد نقاط انطلاق مقترحة حالياً</h3>
            <p className="text-xs text-foreground/60 leading-relaxed">
              سيتم عرض نقاط الانطلاق الموصى بها فور نشر أعداد الكوميكس والروايات في المنصة.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {entryPoints.map((ep, idx) => (
              <div
                key={idx}
                className="glass-panel rounded-3xl overflow-hidden border border-soft-sand/50 dark:border-white/10 hover:border-deep-teal/40 dark:hover:border-antique-gold/50 transition-all flex flex-col justify-between shadow-md hover:shadow-xl group"
              >
                <div>
                  {ep.comic && (
                    <div className="aspect-[16/9] overflow-hidden bg-soft-cream/30 dark:bg-zinc-900 relative shadow-sm">
                      <img
                        src={ep.comic.coverImage}
                        alt={ep.subtitle}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3.5 right-3.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-background/80 backdrop-blur-md text-deep-teal dark:text-antique-gold border border-soft-sand/40 dark:border-white/10">
                        {ep.tag}
                      </div>
                    </div>
                  )}

                  <div className="p-6 space-y-2">
                    <span className="text-[11px] font-semibold text-deep-teal dark:text-antique-gold block">
                      {ep.title}
                    </span>
                    <h3 className="text-lg font-bold text-foreground font-cinzel group-hover:text-deep-teal dark:group-hover:text-antique-gold transition-colors">
                      {ep.subtitle}
                    </h3>
                    <p className="text-xs text-foreground/75 leading-relaxed">{ep.desc}</p>
                  </div>
                </div>

                <div className="p-6 pt-0">
                  <Link
                    href={ep.link}
                    className="w-full py-2.5 px-4 rounded-xl bg-deep-teal/10 dark:bg-white/[0.04] hover:bg-deep-teal hover:text-white dark:hover:bg-antique-gold dark:hover:text-midnight-navy text-deep-teal dark:text-white font-bold text-xs border border-deep-teal/20 dark:border-white/10 transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>ابدأ القراءة الآن</span>
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Universe Hub Links Grid */}
      <div className="mb-16">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground font-cinzel mb-6">
          بوابات وأقسام الكون
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { title: 'الكوميكس', desc: 'كل الأعداد والسلاسل', path: '/comics', icon: BookOpen },
            { title: 'القصص', desc: 'المرويات واليوميات', path: '/stories', icon: Sparkles },
            { title: 'الشخصيات', desc: 'سجل الأبطال والأشرار', path: '/characters', icon: Users },
            { title: 'العوالم', desc: 'أطلس الأبعاد الخمسة', path: '/worlds', icon: Globe },
            { title: 'الخط الزمني', desc: 'تاريخ ووقائع المجرة', path: '/timeline', icon: Clock },
            { title: 'الموسوعة', desc: 'الأسلحة والتقنيات', path: '/encyclopedia', icon: BookMarked },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <Link
                key={idx}
                href={item.path}
                className="glass-panel p-5 rounded-2xl border border-soft-sand/50 dark:border-white/10 hover:border-deep-teal/40 dark:hover:border-antique-gold/50 flex flex-col items-center text-center gap-2.5 transition-all group hover:scale-[1.02] shadow-sm"
              >
                <div className="w-12 h-12 rounded-xl bg-deep-teal/10 dark:bg-antique-gold/10 border border-deep-teal/20 dark:border-antique-gold/30 flex items-center justify-center text-deep-teal dark:text-antique-gold group-hover:bg-deep-teal group-hover:text-white dark:group-hover:bg-antique-gold dark:group-hover:text-midnight-navy transition-colors">
                  <Icon className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-foreground font-cinzel group-hover:text-deep-teal dark:group-hover:text-antique-gold transition-colors">
                  {item.title}
                </h4>
                <p className="text-[11px] text-foreground/50">{item.desc}</p>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Series Spotlight */}
      <div className="mb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground font-cinzel">
            السلاسل الملحمية المتكاملة
          </h2>
          <Link href="/comics" className="text-xs text-deep-teal dark:text-antique-gold hover:underline font-semibold">
            عرض كل السلاسل ←
          </Link>
        </div>

        {series.length === 0 ? (
          <div className="glass-panel rounded-3xl p-10 text-center border border-soft-sand/50 dark:border-white/10 max-w-xl mx-auto shadow-sm">
            <Compass className="w-12 h-12 mx-auto mb-3 text-deep-teal/40 dark:text-antique-gold/40" />
            <h3 className="text-base font-bold text-foreground mb-1">لا توجد سلاسل ملحمية منشورة حالياً</h3>
            <p className="text-xs text-foreground/60 leading-relaxed">
              ترقبوا قريباً إطلاق السلاسل الملحمية المتكاملة في كون حكاياتي.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {series.map((s) => (
              <Link
                key={s.id}
                href={`/series/${s.id}`}
                className="glass-panel p-4 rounded-3xl border border-soft-sand/50 dark:border-white/10 hover:border-deep-teal/40 dark:hover:border-antique-gold/50 transition-all flex flex-col justify-between group shadow-md"
              >
                <div>
                  <div className="aspect-[4/3] rounded-2xl overflow-hidden mb-3.5 bg-soft-cream/30 dark:bg-zinc-900 shadow-sm">
                    <img
                      src={s.coverImage}
                      alt={s.titleAr}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-deep-teal/10 dark:bg-white/5 text-deep-teal dark:text-antique-gold">
                      {s.status === 'ongoing' ? 'مستمرة' : 'مكتملة'}
                    </span>
                    <span className="text-[11px] text-foreground/50">{s.issueCount} أعداد</span>
                  </div>
                  <h3 className="text-base font-bold text-foreground font-cinzel group-hover:text-deep-teal dark:group-hover:text-antique-gold transition-colors mb-1">
                    {s.titleAr}
                  </h3>
                  <p className="text-xs text-foreground/60 line-clamp-2 leading-relaxed">
                    {s.descriptionAr}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-soft-sand/40 dark:border-white/5 flex items-center justify-between text-xs text-deep-teal dark:text-antique-gold font-semibold">
                  <span>تصفح أعداد السلسلة</span>
                  <ChevronLeft className="w-3.5 h-3.5" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
