import React, { useState } from 'react';
import { useTimeline, useCharacters, useWorlds, useComics } from '@/lib/hooks';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'wouter';
import { Clock, Filter, Sparkles, Globe, Users, BookOpen, ChevronLeft } from 'lucide-react';

export default function Timeline() {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activeEra, setActiveEra] = useState<string>('all');
  const { data: timelineEvents = [] } = useTimeline();
  const { data: characters = [] } = useCharacters();
  const { data: worlds = [] } = useWorlds();
  const { data: comics = [] } = useComics();

  const categories = [
    { key: 'all', label: 'كافة التصنيفات' },
    { key: 'creation', label: 'نشأة وتأسيس' },
    { key: 'catastrophe', label: 'كوارث وتصدعات' },
    { key: 'conflict', label: 'حروب ونزاعات' },
    { key: 'resurgence', label: 'بعث ونهضة' },
    { key: 'discovery', label: 'اكتشافات علمية' },
    { key: 'political', label: 'معاهدات ومواثيق' },
    { key: 'expansion', label: 'توسع كوني' },
  ];

  const eras = [
    { key: 'all', label: 'جميع العصور' },
    { key: 'ancient', label: 'العصر القديم' },
    { key: 'classical', label: 'العصر الكلاسيكي' },
    { key: 'modern', label: 'العصر الحديث' },
    { key: 'future', label: 'العصر المستقبلي' },
  ];

  const filteredEvents = timelineEvents.filter((e) => {
    const matchesCat = activeCategory === 'all' || e.category === activeCategory;
    const matchesEra = activeEra === 'all' || e.era === activeEra;
    return matchesCat && matchesEra;
  });

  const { scrollYProgress } = useScroll();
  const scaleY = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto font-arabic relative" dir="rtl">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-deep-teal/10 dark:bg-antique-gold/10 border border-deep-teal/20 dark:border-antique-gold/30 text-deep-teal dark:text-antique-gold text-xs font-semibold mb-3">
          <Clock className="w-3.5 h-3.5" />
          <span>سجل العصور والوقائع الأسطورية</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold text-foreground mb-4 font-cinzel">
          الخط الزمني <span className="text-deep-teal dark:gold-gradient">لكون حكاياتي</span>
        </h1>
        <p className="text-base text-foreground/70 max-w-2xl mx-auto leading-relaxed">
          يمتد تاريخ العوالم لآلاف السنين. تتبع اللحظات المفصلية، تصدعات الأبعاد، وصعود الأبطال الذين
          غيروا ميزان القوى في المجرة.
        </p>

        {/* Categories Bar */}
        <div className="flex flex-wrap justify-center gap-2 mt-6">
          {categories.map((cat) => (
            <button
              key={cat.key}
              type="button"
              onClick={() => setActiveCategory(cat.key)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeCategory === cat.key
                  ? 'bg-deep-teal text-white dark:bg-antique-gold dark:text-midnight-navy font-bold shadow-md'
                  : 'bg-soft-cream/60 dark:bg-white/[0.03] text-foreground/70 dark:text-zinc-300 hover:bg-soft-cream dark:hover:bg-white/[0.08] border border-soft-sand/40 dark:border-white/5'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Eras filter */}
        <div className="flex justify-center gap-3 mt-3 text-xs">
          <span className="text-foreground/50 font-semibold self-center">العصر:</span>
          {eras.map((era) => (
            <button
              key={era.key}
              type="button"
              onClick={() => setActiveEra(era.key)}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                activeEra === era.key
                  ? 'text-deep-teal bg-deep-teal/15 dark:text-antique-gold dark:bg-antique-gold/10 font-bold'
                  : 'text-foreground/60 dark:text-zinc-400 hover:text-foreground dark:hover:text-white'
              }`}
            >
              {era.label}
            </button>
          ))}
        </div>
      </div>

      {/* Central Timeline */}
      {filteredEvents.length === 0 ? (
        <div className="glass-panel rounded-3xl p-16 text-center border border-soft-sand/50 dark:border-white/10 max-w-xl mx-auto mt-12 shadow-sm">
          <Clock className="w-16 h-16 mx-auto mb-4 text-deep-teal/40 dark:text-antique-gold/40" />
          <h3 className="text-lg font-bold text-foreground mb-2">لا توجد أحداث تاريخية مسجلة حالياً</h3>
          <p className="text-xs sm:text-sm text-foreground/60 leading-relaxed">
            سيتم تدوين الوقائع التاريخية والمحطات الكبرى لكون حكاياتي فور إدراجها في قاعدة البيانات.
          </p>
        </div>
      ) : (
        <div className="relative mt-12 pb-16">
        {/* Static center line */}
        <div className="absolute right-4 md:right-1/2 top-0 bottom-0 w-0.5 bg-soft-sand/50 dark:bg-white/10 md:translate-x-1/2" />
        {/* Animated fill line */}
        <motion.div
          className="absolute right-4 md:right-1/2 top-0 bottom-0 w-0.5 bg-deep-teal dark:bg-antique-gold md:translate-x-1/2 origin-top shadow-[0_0_10px_rgba(8,124,123,0.5)] dark:shadow-[0_0_10px_#C5A15B]"
          style={{ scaleY }}
        />

        {/* Event Items */}
        <div className="space-y-12">
          {filteredEvents.map((event, index) => {
            const isLeft = index % 2 === 0;
            const eventChars = characters.filter((c) => event.characterIds?.includes(c.id));
            const eventWorlds = worlds.filter((w) => event.worldIds?.includes(w.id));

            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.4 }}
                className={`relative flex flex-col md:flex-row items-start ${
                  isLeft ? 'md:flex-row-reverse' : ''
                } gap-6 md:gap-0`}
              >
                {/* Node icon in center */}
                <div className="absolute right-4 md:right-1/2 top-5 -translate-y-1/2 translate-x-1/2 w-6 h-6 rounded-full bg-background border-2 border-deep-teal dark:border-antique-gold flex items-center justify-center z-10 shadow-md">
                  <div className="w-2 h-2 rounded-full bg-deep-teal dark:bg-antique-gold animate-pulse" />
                </div>

                {/* Card side */}
                <div className="w-full md:w-1/2 pr-12 md:pr-0 md:px-8">
                  <div className="glass-panel p-6 rounded-3xl border border-soft-sand/50 dark:border-white/10 hover:border-deep-teal/40 dark:hover:border-antique-gold/40 transition-all shadow-md group">
                    {/* Year & Impact */}
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-deep-teal/15 text-deep-teal dark:bg-antique-gold/15 dark:text-antique-gold border border-deep-teal/20 dark:border-antique-gold/30">
                        {event.year}
                      </span>
                      <span className="text-[11px] text-foreground/50">
                        تأثير {event.impact === 'legendary' ? 'أسطوري' : 'رئيسي'}
                      </span>
                    </div>

                    {/* Image if available */}
                    {event.image && (
                      <div className="aspect-[16/9] rounded-2xl overflow-hidden mb-4 border border-soft-sand/50 dark:border-white/10 shadow-sm">
                        <img
                          src={event.image}
                          alt={event.titleAr}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    )}

                    <h3 className="text-lg font-bold text-foreground font-cinzel mb-2 group-hover:text-deep-teal dark:group-hover:text-antique-gold transition-colors">
                      {event.titleAr}
                    </h3>
                    <p className="text-xs sm:text-sm text-foreground/75 leading-relaxed mb-4">
                      {event.descriptionAr}
                    </p>

                    {/* Related entities chips */}
                    {(eventChars.length > 0 || eventWorlds.length > 0) && (
                      <div className="pt-3 border-t border-soft-sand/40 dark:border-white/5 flex flex-wrap items-center gap-2 text-xs">
                        {eventChars.map((c) => (
                          <Link
                            key={c.id}
                            href={`/characters/${c.id}`}
                            className="px-2.5 py-1 rounded-lg bg-soft-cream/60 dark:bg-white/[0.03] text-foreground/80 dark:text-zinc-300 hover:text-deep-teal dark:hover:text-antique-gold border border-soft-sand/40 dark:border-white/5 flex items-center gap-1.5 transition-colors"
                          >
                            <Users className="w-3 h-3 text-deep-teal dark:text-antique-gold" />
                            <span>{c.nameAr}</span>
                          </Link>
                        ))}
                        {eventWorlds.map((w) => (
                          <Link
                            key={w.id}
                            href={`/worlds/${w.id}`}
                            className="px-2.5 py-1 rounded-lg bg-soft-cream/60 dark:bg-white/[0.03] text-foreground/80 dark:text-zinc-300 hover:text-deep-teal dark:hover:text-antique-gold border border-soft-sand/40 dark:border-white/5 flex items-center gap-1.5 transition-colors"
                          >
                            <Globe className="w-3 h-3 text-deep-teal dark:text-antique-gold" />
                            <span>عالم {w.nameAr}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Empty side for layout symmetry on desktop */}
                <div className="hidden md:block w-1/2" />
              </motion.div>
            );
          })}
        </div>
      </div>
      )}
    </div>
  );
}
