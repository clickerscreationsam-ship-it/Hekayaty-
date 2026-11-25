import React, { useState } from 'react';
import { useRoute, Link } from 'wouter';
import { useNews, useComics, useCharacters } from '@/lib/hooks';
import { Calendar, User, ChevronLeft, Share2, BookOpen, Users, Newspaper } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SEOHead } from '@/components/common/SEOHead';
import { SocialShareModal } from '@/components/common/SocialShareModal';

export default function NewsDetail() {
  const [, params] = useRoute('/news/:id');
  const { data: newsArticles = [] } = useNews();
  const { data: comics = [] } = useComics();
  const { data: characters = [] } = useCharacters();
  const article = newsArticles.find((n) => n.id === params?.id);
  const { toast } = useToast();
  const [shareOpen, setShareOpen] = useState(false);

  if (!article) {
    return (
      <div className="min-h-screen py-20 px-4 text-center font-arabic" dir="rtl">
        <h2 className="text-2xl font-bold text-foreground mb-2">المقال غير موجود</h2>
        <p className="text-sm text-foreground/50 mb-6">ربما تم حذف الخبر أو أن الرابط غير دقيق.</p>
        <Link
          href="/news"
          className="px-6 py-2.5 rounded-xl bg-deep-teal text-white dark:bg-antique-gold dark:text-midnight-navy font-semibold text-sm"
        >
          العودة للأخبار
        </Link>
      </div>
    );
  }

  const relatedComic = comics.find((c) => article.relatedComicIds?.includes(c.id));
  const relatedChar = characters.find((c) => article.relatedCharacterIds?.includes(c.id));

  const handleShare = () => {
    setShareOpen(true);
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-[900px] mx-auto font-arabic notranslate" dir="rtl" translate="no">
      <SEOHead
        title={article.titleAr}
        description={article.summaryAr || article.contentAr?.slice(0, 160)}
        ogImage={article.image}
        ogType="article"
        canonicalUrl={`/news/${article.id}`}
        author={article.author}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'NewsArticle',
          headline: article.titleAr,
          description: article.summaryAr,
          image: article.image,
          datePublished: article.date,
          inLanguage: 'ar',
          author: {
            '@type': 'Person',
            name: article.author || 'حكاياتي',
          },
          publisher: {
            '@type': 'Organization',
            name: 'حكاياتي | HEKAYATY',
          },
        }}
      />
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-foreground/60 mb-6">
        <Link href="/" className="hover:text-deep-teal dark:hover:text-antique-gold transition-colors">
          الرئيسية
        </Link>
        <ChevronLeft className="w-3.5 h-3.5" />
        <Link href="/news" className="hover:text-deep-teal dark:hover:text-antique-gold transition-colors">
          الأخبار
        </Link>
        <ChevronLeft className="w-3.5 h-3.5" />
        <span className="text-deep-teal dark:text-antique-gold font-semibold">{article.titleAr}</span>
      </div>

      <article className="glass-panel p-6 sm:p-12 rounded-3xl border border-soft-sand/50 dark:border-white/10 space-y-8 shadow-xl">
        <header className="space-y-4 pb-6 border-b border-soft-sand/40 dark:border-white/10">
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-deep-teal/15 text-deep-teal dark:bg-antique-gold/15 dark:text-antique-gold border border-deep-teal/20 dark:border-antique-gold/30">
              تصنيف: {article.category}
            </span>
            <button
              type="button"
              onClick={handleShare}
              className="p-2 rounded-xl bg-soft-cream/60 dark:bg-white/5 text-foreground/70 border border-soft-sand/50 dark:border-white/10 hover:border-deep-teal dark:hover:border-antique-gold transition-colors"
              title="مشاركة المقال"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>

          <h1 className="text-2xl sm:text-4xl font-bold text-foreground font-cinzel leading-tight">
            {article.titleAr}
          </h1>

          <div className="flex items-center gap-4 text-xs text-foreground/60">
            <span className="flex items-center gap-1.5 font-semibold text-foreground/80">
              <User className="w-3.5 h-3.5 text-deep-teal dark:text-antique-gold" />
              {article.author}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-deep-teal dark:text-antique-gold" />
              {article.date}
            </span>
          </div>
        </header>

        <div className="rounded-2xl overflow-hidden border border-soft-sand/50 dark:border-white/10 max-h-[440px] shadow-sm">
          <img
            src={article.image}
            alt={article.titleAr}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="text-foreground/85 text-base sm:text-lg leading-relaxed sm:leading-loose whitespace-pre-line font-arabic">
          {article.contentAr}
        </div>

        {(relatedComic || relatedChar) && (
          <footer className="pt-8 border-t border-soft-sand/40 dark:border-white/10 space-y-4">
            <h4 className="text-sm font-bold text-foreground font-cinzel">روابط ذات صلة بالخبر:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {relatedComic && (
                <Link
                  href={`/comics/${relatedComic.id}`}
                  className="p-3 rounded-2xl bg-soft-cream/60 dark:bg-white/[0.02] hover:bg-soft-cream dark:hover:bg-white/[0.05] border border-soft-sand/40 dark:border-white/5 flex items-center gap-3 transition-colors"
                >
                  <BookOpen className="w-5 h-5 text-deep-teal dark:text-antique-gold" />
                  <div>
                    <span className="text-xs text-foreground/60 block">إصدار مرتبط:</span>
                    <strong className="text-sm text-foreground">{relatedComic.titleAr}</strong>
                  </div>
                </Link>
              )}
              {relatedChar && (
                <Link
                  href={`/characters/${relatedChar.id}`}
                  className="p-3 rounded-2xl bg-soft-cream/60 dark:bg-white/[0.02] hover:bg-soft-cream dark:hover:bg-white/[0.05] border border-soft-sand/40 dark:border-white/5 flex items-center gap-3 transition-colors"
                >
                  <Users className="w-5 h-5 text-deep-teal dark:text-antique-gold" />
                  <div>
                    <span className="text-xs text-foreground/60 block">شخصية مرتبطة:</span>
                    <strong className="text-sm text-foreground">{relatedChar.nameAr}</strong>
                  </div>
                </Link>
              )}
            </div>
          </footer>
        )}
      </article>

      <SocialShareModal
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        title={article.titleAr}
        description={article.summaryAr || article.titleAr}
        url={typeof window !== 'undefined' ? window.location.href : `https://hekayaty.com/news/${article.id}`}
        imageUrl={article.image}
        contentType="article"
        contentId={article.id}
      />
    </div>
  );
}
