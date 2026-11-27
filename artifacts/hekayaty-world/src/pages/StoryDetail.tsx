import React, { useState } from 'react';
import { useRoute, Link } from 'wouter';
import { useStory, useCharacters, useWorlds } from '@/lib/hooks';
import {
  BookOpen,
  Clock,
  User,
  ChevronLeft,
  Share2,
  Bookmark,
  Type,
  ArrowRight,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAppStore } from '@/stores/useAppStore';
import { SEOHead } from '@/components/common/SEOHead';
import { SocialShareModal } from '@/components/common/SocialShareModal';
import { LikeButton } from '@/components/engagement/LikeButton';
import { FollowButton } from '@/components/engagement/FollowButton';
import { EngagementStats } from '@/components/engagement/EngagementStats';
import { ContentViewTracker } from '@/components/engagement/ContentViewTracker';

export default function StoryDetail() {
  const [, params] = useRoute('/stories/:id');
  const storyId = params?.id || '';
  const { data: story } = useStory(storyId);
  const { data: characters = [] } = useCharacters();
  const { data: worlds = [] } = useWorlds();
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [shareOpen, setShareOpen] = useState(false);
  const { toast } = useToast();
  const { addToFavorites, isInFavorites, removeFromFavorites } = useAppStore();

  if (!story) {
    return (
      <div className="min-h-screen py-20 px-4 text-center font-arabic" dir="rtl">
        <h2 className="text-2xl font-bold text-foreground mb-2">القصة غير موجودة</h2>
        <p className="text-sm text-foreground/50 mb-6">ربما تم حذفها أو أن الرابط غير دقيق.</p>
        <Link
          href="/stories"
          className="px-6 py-2.5 rounded-xl bg-deep-teal text-white dark:bg-antique-gold dark:text-midnight-navy font-semibold text-sm"
        >
          العودة للمرويات والقصص
        </Link>
      </div>
    );
  }

  const char = characters.find((c) => story.characterIds?.includes(c.id));
  const world = worlds.find((w) => w.id === story.worldId);
  const isFav = isInFavorites(story.id, 'story');

  const toggleFavorite = () => {
    if (isFav) {
      removeFromFavorites(story.id, 'story');
      toast({ title: 'تمت إزالة القصة من المفضلة' });
    } else {
      addToFavorites({ id: story.id, type: 'story' });
      toast({ title: 'تمت إضافة القصة إلى مفضلتك' });
    }
  };

  const handleShare = () => {
    setShareOpen(true);
  };

  const fontClasses = {
    normal: 'text-base sm:text-lg leading-relaxed sm:leading-loose',
    large: 'text-lg sm:text-xl leading-loose',
    xlarge: 'text-xl sm:text-2xl leading-loose',
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-[900px] mx-auto font-arabic notranslate" dir="rtl" translate="no">
      <SEOHead
        title={story.titleAr}
        description={story.synopsisAr || story.content?.slice(0, 160)}
        ogImage={story.coverImage}
        ogType="book"
        author={story.authorAr || story.author}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Book',
          name: story.titleAr,
          headline: story.titleAr,
          author: {
            '@type': 'Person',
            name: story.authorAr || story.author || 'فريق حكاياتي',
          },
          image: story.coverImage,
          description: story.synopsisAr,
          inLanguage: 'ar',
          publisher: {
            '@type': 'Organization',
            name: 'حكاياتي | HEKAYATY',
          },
        }}
      />

      <SocialShareModal
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        title={story.titleAr}
        description={story.synopsisAr}
        imageUrl={story.coverImage}
        contentType="novel"
        contentId={story.id}
      />
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-foreground/60 mb-6">
        <Link href="/" className="hover:text-deep-teal dark:hover:text-antique-gold transition-colors">
          الرئيسية
        </Link>
        <ChevronLeft className="w-3.5 h-3.5" />
        <Link href="/stories" className="hover:text-deep-teal dark:hover:text-antique-gold transition-colors">
          القصص والمرويات
        </Link>
        <ChevronLeft className="w-3.5 h-3.5" />
        <span className="text-deep-teal dark:text-antique-gold font-semibold">{story.titleAr}</span>
      </div>

      {/* Story Reader Card */}
      <article className="bg-[#F7F1E6] dark:bg-[#111C2B] p-6 sm:p-12 rounded-3xl border border-[#D8C5A8] dark:border-white/10 space-y-8 shadow-xl">
        {/* Header Metadata */}
        <header className="space-y-4 pb-6 border-b border-[#D8C5A8]/50 dark:border-white/10">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-deep-teal/10 text-deep-teal dark:bg-antique-gold/15 dark:text-antique-gold border border-deep-teal/20 dark:border-antique-gold/30">
              {story.classification === 'original'
                ? 'إصدار أصلي'
                : story.classification === 'hekayaty_selected'
                ? 'حكاياتي المختارة'
                : 'تعاون رسمي'}
            </span>

            {/* Reader Controls: Font Size & Actions */}
            <div className="flex items-center gap-2">
              <Link href={`/stories/${story.id}/read`}>
                <button
                  type="button"
                  className="px-3.5 py-1.5 rounded-xl bg-deep-teal text-white dark:bg-antique-gold dark:text-midnight-navy font-bold text-xs hover:brightness-110 transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>القارئ التفاعلي المتقدم</span>
                </button>
              </Link>

              <div className="flex items-center bg-soft-cream/80 dark:bg-white/5 rounded-xl p-1 border border-soft-sand/60 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setFontSize('normal')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                    fontSize === 'normal'
                      ? 'bg-deep-teal text-white dark:bg-antique-gold dark:text-midnight-navy font-bold'
                      : 'text-foreground/60'
                  }`}
                >
                  أ
                </button>
                <button
                  type="button"
                  onClick={() => setFontSize('large')}
                  className={`px-2.5 py-1 rounded-lg text-sm font-medium transition-colors ${
                    fontSize === 'large'
                      ? 'bg-deep-teal text-white dark:bg-antique-gold dark:text-midnight-navy font-bold'
                      : 'text-foreground/60'
                  }`}
                >
                  أ+
                </button>
                <button
                  type="button"
                  onClick={() => setFontSize('xlarge')}
                  className={`px-2.5 py-1 rounded-lg text-base font-medium transition-colors ${
                    fontSize === 'xlarge'
                      ? 'bg-deep-teal text-white dark:bg-antique-gold dark:text-midnight-navy font-bold'
                      : 'text-foreground/60'
                  }`}
                >
                  أ++
                </button>
              </div>

              {/* Engagement Buttons */}
              <LikeButton contentType="story" contentId={story.id} size="sm" />
              <FollowButton contentType="story" contentId={story.id} size="sm" />

              <button
                type="button"
                onClick={handleShare}
                className="p-2 rounded-xl bg-soft-cream/80 dark:bg-white/5 text-foreground/70 border border-soft-sand/60 dark:border-white/10 hover:border-deep-teal dark:hover:border-antique-gold transition-all"
                title="مشاركة القصة"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <ContentViewTracker contentType="story" contentId={story.id} source="story_detail" />

          <h1 className="text-2xl sm:text-4xl font-bold text-foreground font-cinzel leading-tight">
            {story.titleAr}
          </h1>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-foreground/60">
              <span className="flex items-center gap-1.5 font-semibold text-foreground/80">
                <User className="w-4 h-4 text-deep-teal dark:text-antique-gold" />
                بقلم: {story.authorAr || 'فريق حكاياتي'}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-deep-teal dark:text-antique-gold" />
                {story.readTimeMinutes} دقيقة قراءة ({story.wordCount || 3000} كلمة)
              </span>
              <span>•</span>
              <span>عام {story.year}</span>
            </div>

            <EngagementStats contentType="story" contentId={story.id} chaptersCount={(story as any).chapters?.length || 1} />
          </div>
        </header>

        {/* Cover Art */}
        <div className="rounded-2xl overflow-hidden border border-[#D8C5A8]/50 dark:border-white/10 max-h-[420px] shadow-sm">
          <img
            src={story.coverImage}
            alt={story.titleAr}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Story Text Body */}
        <div className={`text-[#2A1F17] dark:text-[#F3EBDD] font-arabic whitespace-pre-line tracking-normal ${fontClasses[fontSize]}`}>
          {story.content || (
            <>
              {story.synopsisAr}
              {`\n\nكانت السحب البلورية تتراقص في سماء الأفق البعيد، حاملة معها أصداء عهود غابرة. وقف البطل على حافة التل الصخري، يراقب تدفق تيارات الطاقة التي نسجها الأجداد الأوائل. لم يكن الأمر مجرد استعادة قوة مفقودة، بل كان استرداداً لكرامة أمة بأسرها.\n\n"إذا سقطت الشعلة هذه المرة،" همس في نفسه بصوت مبحوح، "فلن يكون هناك فجر جديد ليوقظ الصحراء النائمة."\n\nتحركت الرياح محملة بذرات الذهب المشع، فاستجاب لها الدرع بنبضة دافئة سرت في عروقه، مؤكدة أن الأمل لا يزال حياً بين الكثبان.`}
            </>
          )}
        </div>

        {/* Post-reading context footer */}
        <footer className="pt-8 border-t border-[#D8C5A8]/50 dark:border-white/10 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {story.genresAr.map((g, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-full bg-soft-cream/70 dark:bg-white/5 text-xs text-foreground/70 dark:text-zinc-400 border border-soft-sand/50 dark:border-white/5"
                >
                  #{g}
                </span>
              ))}
            </div>

            <Link
              href="/stories"
              className="px-5 py-2.5 rounded-xl bg-deep-teal text-white dark:bg-antique-gold dark:text-midnight-navy font-bold text-xs hover:brightness-110 transition-all flex items-center gap-2 shadow-sm"
            >
              <span>المزيد من القصص</span>
              <ChevronLeft className="w-4 h-4" />
            </Link>
          </div>

          {/* Related character & world cards */}
          {(char || world) && (
            <div className="p-4 rounded-2xl bg-soft-cream/60 dark:bg-white/[0.02] border border-soft-sand/50 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-foreground/70">
                تدور هذه القصة في سياق عالم{' '}
                {world && <strong className="text-foreground">{world.nameAr}</strong>}
                {char && (
                  <span>
                    {' '}
                    وتركز على شخصية <strong className="text-deep-teal dark:text-antique-gold">{char.nameAr}</strong>
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                {char && (
                  <Link
                    href={`/characters/${char.id}`}
                    className="px-3 py-1.5 rounded-lg bg-soft-cream/80 dark:bg-white/5 hover:border-deep-teal text-xs text-foreground/80 font-semibold border border-soft-sand/50 dark:border-white/10 transition-colors"
                  >
                    ملف {char.nameAr}
                  </Link>
                )}
                {world && (
                  <Link
                    href={`/worlds/${world.id}`}
                    className="px-3 py-1.5 rounded-lg bg-soft-cream/80 dark:bg-white/5 hover:border-deep-teal text-xs text-foreground/80 font-semibold border border-soft-sand/50 dark:border-white/10 transition-colors"
                  >
                    أطلس {world.nameAr}
                  </Link>
                )}
              </div>
            </div>
          )}
        </footer>
      </article>
    </div>
  );
}
