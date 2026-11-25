import React, { useState } from 'react';
import { useComics, useStories, useCharacters, useCreators } from '@/lib/hooks';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import {
  Sparkles,
  BookOpen,
  Award,
  ChevronLeft,
  Users,
  Feather,
  Layers,
  Star,
  Send,
} from 'lucide-react';

export default function HekayatySelected() {
  const [tab, setTab] = useState<'all' | 'comics' | 'stories'>('all');
  const { data: comics = [] } = useComics();
  const { data: stories = [] } = useStories();
  const { data: characters = [] } = useCharacters();
  const { data: creators = [] } = useCreators();

  const selectedComics = comics.filter((c) => c.classification === 'hekayaty_selected');
  const selectedStories = stories.filter((s) => s.classification === 'hekayaty_selected');
  const selectedCreators = creators;

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto font-arabic" dir="rtl">
      {/* Editorial Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-deep-teal/30 dark:border-rich-turquoise/30 bg-gradient-to-br from-deep-teal/15 via-soft-cream/40 to-background dark:from-deep-teal/30 dark:via-midnight-navy dark:to-midnight-navy p-8 sm:p-14 mb-16 shadow-[0_15px_50px_rgba(8,124,123,0.12)]">
        <div className="max-w-3xl space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-deep-teal/10 dark:bg-rich-turquoise/15 border border-deep-teal/30 dark:border-rich-turquoise/30 text-deep-teal dark:text-rich-turquoise text-xs font-semibold">
            <Award className="w-4 h-4" />
            <span>المجموعة التحريرية المنتقاة بعناية</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-foreground font-cinzel leading-tight">
            هـكـايـتـي <span className="text-transparent bg-clip-text bg-gradient-to-r from-deep-teal via-rich-turquoise to-emerald-600 dark:from-rich-turquoise dark:via-antique-gold dark:to-champagne-gold">الـمُـخـتـارة</span>
          </h1>

          <p className="text-sm sm:text-lg text-foreground/80 leading-relaxed">
            مساحة مرموقة للاحتفاء بأروع القصص والكوميكس التي أبدعها مشاركو ومبدعو برامج حكاياتي.
            تخضع جميع الأعمال في هذا القسم لمعايير انتقاء تحريرية دقيقة لتقديم محتوى استثنائي
            يليق بتطلعات القراء.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-foreground/60">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-deep-teal dark:text-rich-turquoise" />
              أعمال مؤلفة بإشراف تحريري
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-deep-teal dark:text-rich-turquoise" />
              إبراز هوية المبدعين المستقلين
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Star className="w-4 h-4 text-deep-teal dark:text-rich-turquoise" />
              جودة بصرية وسردية عالمية
            </span>
          </div>
        </div>
      </div>

      {/* Featured Creators Section */}
      <div className="mb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl sm:text-3xl font-bold text-foreground font-cinzel flex items-center gap-2.5">
              <Feather className="w-6 h-6 text-deep-teal dark:text-rich-turquoise" />
              <span>مبدعو حكاياتي في دائرة الضوء</span>
            </h2>
            <p className="text-xs sm:text-sm text-foreground/60 mt-1">
              تعرف على الكتاب والرسامين الذين أثرت أعمالهم فضاءات حكاياتي المختارة
            </p>
          </div>
        </div>

        {selectedCreators.length === 0 ? (
          <div className="glass-panel p-10 rounded-3xl border border-soft-sand/50 dark:border-white/10 text-center max-w-xl mx-auto shadow-sm">
            <Feather className="w-12 h-12 mx-auto mb-3 text-deep-teal/40 dark:text-rich-turquoise/40" />
            <h3 className="text-base font-bold text-foreground mb-1">لا يوجد مبدعون معتمدون حالياً</h3>
            <p className="text-xs text-foreground/60 leading-relaxed mb-4">
              باب التقديم مفتوح لجميع الكتّاب والرسامين للانضمام إلى برنامج حكاياتي المختارة.
            </p>
            <Link
              href="/editorial"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-deep-teal text-white dark:bg-rich-turquoise dark:text-midnight-navy font-bold text-xs shadow-md"
            >
              <span>تقديم عملك للمراجعة التحريرية</span>
              <ChevronLeft className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {selectedCreators.map((creator) => (
              <div
                key={creator.id}
                className="glass-panel p-6 rounded-3xl border border-soft-sand/50 dark:border-white/10 hover:border-deep-teal/40 dark:hover:border-rich-turquoise/40 transition-all flex flex-col sm:flex-row items-center sm:items-start gap-5 shadow-md group"
              >
                <img
                  src={creator.avatar}
                  alt={creator.nameAr}
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-deep-teal/30 dark:border-rich-turquoise/30 group-hover:border-deep-teal dark:group-hover:border-rich-turquoise transition-colors shrink-0 shadow-sm"
                />
                <div className="space-y-2 text-center sm:text-right">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    {creator.profileId || creator.id ? (
                      <Link
                        href={creator.profileId ? `/profile/${creator.profileId}` : `/creators/${creator.id}`}
                        className="text-lg font-bold text-foreground font-cinzel hover:text-deep-teal dark:hover:text-rich-turquoise transition-colors"
                      >
                        {creator.nameAr}
                      </Link>
                    ) : (
                      <h3 className="text-lg font-bold text-foreground font-cinzel">{creator.nameAr}</h3>
                    )}
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-deep-teal/15 text-deep-teal dark:bg-rich-turquoise/15 dark:text-rich-turquoise border border-deep-teal/30 dark:border-rich-turquoise/30">
                      {creator.role === 'publishing_house' ? 'دار نشر مختارة' : 'مبدع مختار'}
                    </span>
                  </div>
                  <p className="text-xs text-foreground/75 leading-relaxed">{creator.bioAr}</p>
                  <div className="flex flex-wrap gap-1.5 pt-1 justify-center sm:justify-start">
                    {creator.speciality?.map((spec: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded bg-soft-cream/60 dark:bg-white/5 text-[10px] text-foreground/60 dark:text-zinc-400 border border-soft-sand/40 dark:border-white/5"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                  {(creator.profileId || creator.id) && (
                    <Link
                      href={creator.profileId ? `/profile/${creator.profileId}` : `/creators/${creator.id}`}
                      className="inline-flex items-center gap-1.5 mt-1 text-[11px] text-deep-teal dark:text-rich-turquoise font-semibold hover:underline"
                    >
                      عرض ملف المبدع الكامل ←
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between mb-8 border-b border-soft-sand/40 dark:border-white/10 pb-4">
        <div className="flex gap-2">
          {[
            { key: 'all', label: 'كافة الأعمال المختارة' },
            { key: 'comics', label: `الكوميكس المصور (${selectedComics.length})` },
            { key: 'stories', label: `القصص والمرويات (${selectedStories.length})` },
          ].map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setTab(item.key as any)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                tab === item.key
                  ? 'bg-deep-teal text-white dark:bg-rich-turquoise dark:text-midnight-navy font-bold shadow-md'
                  : 'bg-soft-cream/60 dark:bg-white/[0.03] text-foreground/70 dark:text-zinc-300 hover:text-foreground dark:hover:text-white hover:bg-soft-cream'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Comics Grid */}
      {(tab === 'all' || tab === 'comics') && (
        <div className="mb-14">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-foreground font-cinzel flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-deep-teal dark:text-rich-turquoise" />
              <span>الكوميكس المصور في حكاياتي المختارة</span>
            </h3>
          </div>

          {selectedComics.length === 0 ? (
            <div className="glass-panel p-10 rounded-3xl border border-soft-sand/50 dark:border-white/10 text-center max-w-xl mx-auto shadow-sm">
              <BookOpen className="w-10 h-10 mx-auto mb-2 text-deep-teal/40 dark:text-rich-turquoise/40" />
              <h4 className="text-sm font-bold text-foreground mb-1">لا توجد أعداد كوميكس معتمدة حالياً</h4>
              <p className="text-xs text-foreground/60 leading-relaxed">
                سيتم إدراج الإصدارات المنتقاة فور اعتمادها من قبل لجنة التحرير.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {selectedComics.map((comic) => (
                <motion.div
                  key={comic.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="group rounded-3xl overflow-hidden glass-card border border-soft-sand/50 dark:border-white/10 hover:border-deep-teal/50 dark:hover:border-rich-turquoise/50 p-3.5 transition-all shadow-md hover:shadow-xl flex flex-col justify-between"
                >
                  <div>
                    <div className="relative aspect-[2/3] rounded-2xl overflow-hidden mb-3 bg-soft-cream/30 dark:bg-zinc-900 shadow-sm">
                      <img
                        src={comic.coverImage}
                        alt={comic.titleAr}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-deep-teal text-white dark:bg-rich-turquoise dark:text-midnight-navy shadow">
                        مختار
                      </div>
                    </div>

                    <h4 className="text-sm font-bold text-foreground group-hover:text-deep-teal dark:group-hover:text-rich-turquoise transition-colors mb-1 truncate font-cinzel">
                      {comic.titleAr}
                    </h4>
                    <p className="text-xs text-foreground/60 line-clamp-2 leading-relaxed mb-2">
                      {comic.synopsisAr}
                    </p>
                    <span className="text-[11px] text-deep-teal dark:text-rich-turquoise block mb-3 font-semibold">
                      المؤلف: {comic.originalCreator || comic.createdBy || comic.writer || 'غير محدد'}
                    </span>
                  </div>

                  <Link
                    href={`/comics/${comic.id}`}
                    className="w-full py-2 px-3 rounded-xl bg-soft-cream/80 dark:bg-white/5 hover:bg-deep-teal hover:text-white dark:hover:bg-rich-turquoise dark:hover:text-midnight-navy text-foreground text-xs font-semibold border border-soft-sand/50 dark:border-white/10 transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>عرض التفاصيل</span>
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Selected Stories Grid */}
      {(tab === 'all' || tab === 'stories') && (
        <div className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-foreground font-cinzel flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-deep-teal dark:text-rich-turquoise" />
              <span>القصص والنصوص المختارة</span>
            </h3>
          </div>

          {selectedStories.length === 0 ? (
            <div className="glass-panel p-10 rounded-3xl border border-soft-sand/50 dark:border-white/10 text-center max-w-xl mx-auto shadow-sm">
              <Sparkles className="w-10 h-10 mx-auto mb-2 text-deep-teal/40 dark:text-rich-turquoise/40" />
              <h4 className="text-sm font-bold text-foreground mb-1">لا توجد نصوص أو قصص معتمدة حالياً</h4>
              <p className="text-xs text-foreground/60 leading-relaxed">
                سيتم إدراج الروايات والقصص القصيرة المعتمدة هنا فور نشرها.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {selectedStories.map((story) => (
                <div
                  key={story.id}
                  className="glass-panel p-6 rounded-3xl border border-soft-sand/50 dark:border-white/10 hover:border-deep-teal/40 dark:hover:border-rich-turquoise/40 transition-all flex flex-col justify-between shadow-md hover:shadow-xl group"
                >
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-deep-teal/15 text-deep-teal dark:bg-rich-turquoise/15 dark:text-rich-turquoise border border-deep-teal/30 dark:border-rich-turquoise/30">
                        نص روائي مختار
                      </span>
                      <span className="text-xs text-foreground/50">
                        {story.readTimeMinutes} دقيقة قراءة
                      </span>
                    </div>

                    <h4 className="text-xl font-bold text-foreground font-cinzel group-hover:text-deep-teal dark:group-hover:text-rich-turquoise transition-colors">
                      {story.titleAr}
                    </h4>

                    <span className="text-xs font-semibold text-foreground/60 block">
                      بقلم المبدع: {story.originalCreator || story.authorAr || 'غير محدد'}
                    </span>

                    <p className="text-xs sm:text-sm text-foreground/75 leading-relaxed">
                      {story.synopsisAr}
                    </p>
                  </div>

                  <Link
                    href={`/stories/${story.id}`}
                    className="py-2.5 px-4 rounded-xl bg-deep-teal/10 dark:bg-white/[0.04] hover:bg-deep-teal hover:text-white dark:hover:bg-rich-turquoise dark:hover:text-midnight-navy text-deep-teal dark:text-white text-xs font-semibold border border-deep-teal/20 dark:border-white/10 transition-all flex items-center justify-center gap-2"
                  >
                    <span>قراءة النص كاملاً</span>
                    <ChevronLeft className="w-4 h-4" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Creator Submission Callout Box */}
      <div className="glass-panel rounded-3xl border border-deep-teal/30 dark:border-antique-gold/30 p-8 sm:p-12 text-center max-w-3xl mx-auto space-y-4 shadow-xl">
        <h3 className="text-2xl font-bold text-foreground font-cinzel">هل أنت كاتب أو رسام قصص مصورة؟</h3>
        <p className="text-sm text-foreground/75 leading-relaxed">
          نفتح باب التقديم لبرامج حكاياتي الإبداعية. يمكن لأعمالك المميزة أن تنضم إلى قسم "حكاياتي
          المختارة" وتحظى بدعم فني وتحريري وإنتاجي كامل.
        </p>
        <Link
          href="/editorial"
          className="px-6 py-3 rounded-xl bg-deep-teal text-white dark:bg-gradient-to-r dark:from-antique-gold dark:to-muted-gold dark:text-midnight-navy font-bold text-sm shadow-[0_0_20px_rgba(8,124,123,0.3)] dark:shadow-[0_0_20px_rgba(197,161,91,0.3)] hover:brightness-110 transition-all inline-flex items-center gap-2"
        >
          <span>التقديم والانضمام إلى مبدعي حكاياتي</span>
          <Send className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
