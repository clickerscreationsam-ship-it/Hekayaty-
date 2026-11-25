import React, { useEffect } from 'react';
import { useAppStore } from '@/stores/useAppStore';

export interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string[];
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'book' | 'profile';
  author?: string;
  publishedTime?: string;
  noIndex?: boolean;
  jsonLd?: Record<string, any> | Array<Record<string, any>>;
}

export const DEFAULT_SITE_TITLE = 'حكاياتي | HEKAYATY — منصة الأكوان القصصية والروايات الرقمية';
export const DEFAULT_DESCRIPTION = 'الوجهة الترفيهية الأدبية الأولى لاكتشاف وقراءة أضخم الأكوان القصصية العربية المترابطة، الروايات، والكوميكس الأصلي بمؤثرات وتجربة قراءة غامرة.';
export const DEFAULT_OG_IMAGE = 'https://hekayaty.com/assets/magic_library_clouds.png';
export const SITE_URL = 'https://hekayaty.com';

export function SEOHead({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords,
  canonicalUrl,
  ogImage = DEFAULT_OG_IMAGE,
  ogType = 'website',
  author,
  publishedTime,
  noIndex = false,
  jsonLd,
}: SEOHeadProps) {
  const { language } = useAppStore();

  useEffect(() => {
    // 1. Language & Anti-translation Protection
    if (typeof document !== 'undefined') {
      const isArabic = language !== 'en';
      document.documentElement.lang = isArabic ? 'ar' : 'en';
      document.documentElement.dir = isArabic ? 'rtl' : 'ltr';
      document.documentElement.setAttribute('translate', 'no');
      document.documentElement.classList.add('notranslate');

      // 2. Title
      const fullTitle = title
        ? `${title} | حكاياتي HEKAYATY`
        : DEFAULT_SITE_TITLE;
      document.title = fullTitle;

      // Helper function to update/create meta
      const setMeta = (nameAttr: string, key: string, content: string) => {
        let el = document.querySelector(`meta[${nameAttr}="${key}"]`) as HTMLMetaElement | null;
        if (!el) {
          el = document.createElement('meta');
          el.setAttribute(nameAttr, key);
          document.head.appendChild(el);
        }
        el.setAttribute('content', content);
      };

      // 3. Standard Meta
      setMeta('name', 'description', description);
      if (keywords && keywords.length > 0) {
        setMeta('name', 'keywords', keywords.join(', '));
      }
      setMeta('name', 'robots', noIndex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large');
      if (author) setMeta('name', 'author', author);

      // 4. Open Graph
      const currentUrl = canonicalUrl || (typeof window !== 'undefined' ? window.location.href.split('?')[0] : SITE_URL);
      setMeta('property', 'og:title', title || 'حكاياتي — عوالم خيالية لا تنتهي');
      setMeta('property', 'og:description', description);
      setMeta('property', 'og:type', ogType);
      setMeta('property', 'og:url', currentUrl);
      setMeta('property', 'og:image', ogImage);
      setMeta('property', 'og:site_name', 'حكاياتي | HEKAYATY');
      setMeta('property', 'og:locale', isArabic ? 'ar_AR' : 'en_US');

      // 5. Twitter / X Card
      setMeta('name', 'twitter:card', 'summary_large_image');
      setMeta('name', 'twitter:site', '@hekayatyn6');
      setMeta('name', 'twitter:title', title || 'حكاياتي | HEKAYATY');
      setMeta('name', 'twitter:description', description);
      setMeta('name', 'twitter:image', ogImage);

      // 6. Canonical link
      let linkCanonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
      if (!linkCanonical) {
        linkCanonical = document.createElement('link');
        linkCanonical.setAttribute('rel', 'canonical');
        document.head.appendChild(linkCanonical);
      }
      linkCanonical.setAttribute('href', currentUrl);

      // 7. Dynamic JSON-LD structured data injection
      const existingScript = document.getElementById('dynamic-jsonld');
      if (existingScript) existingScript.remove();

      if (jsonLd) {
        const script = document.createElement('script');
        script.id = 'dynamic-jsonld';
        script.type = 'application/ld+json';
        script.text = JSON.stringify(jsonLd);
        document.head.appendChild(script);
      }
    }
  }, [title, description, keywords, canonicalUrl, ogImage, ogType, author, publishedTime, noIndex, jsonLd, language]);

  return null;
}
