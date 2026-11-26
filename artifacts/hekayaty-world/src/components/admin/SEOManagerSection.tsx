import React, { useState, useEffect } from 'react';
import {
  Search,
  Globe,
  Share2,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  FileCode,
  Eye,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SEOSettings {
  siteTitle: string;
  siteDescription: string;
  keywords: string;
  canonicalUrl: string;
  ogImage: string;
  twitterHandle: string;
  googleVerification: string;
  ga4Id: string;
  enableIndex: boolean;
  enableNoTranslate: boolean;
}

const STORAGE_KEY = 'hekayaty_seo_settings_v1';

const DEFAULT_SETTINGS: SEOSettings = {
  siteTitle: 'حكاياتي | HEKAYATY — منصة الأكوان القصصية والروايات الرقمية',
  siteDescription: 'الوجهة الترفيهية الأدبية الأولى لاكتشاف وقراءة أضخم الأكوان القصصية العربية المترابطة، الروايات، والكوميكس الأصلي بمؤثرات وتجربة قراءة غامرة.',
  keywords: 'حكاياتي, روايات عربية, كوميكس عربي, قصص خيالية, أدب رقمي, أبطال أسطوريون, قراءة رقمية',
  canonicalUrl: 'https://hekayaty.com',
  ogImage: 'https://hekayaty.com/assets/magic_library_clouds.png',
  twitterHandle: '@hekayatyn6',
  googleVerification: '',
  ga4Id: '',
  enableIndex: true,
  enableNoTranslate: true,
};

export function SEOManagerSection() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<SEOSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [activePreview, setActivePreview] = useState<'google' | 'facebook' | 'twitter'>('google');
  const [copiedLink, setCopiedLink] = useState(false);

  // Compute live SEO Health Audit Checks
  const titleLen = settings.siteTitle.trim().length;
  const descLen = settings.siteDescription.trim().length;

  const checks = [
    {
      label: 'عنوان الموقع القياسي (Title Length)',
      pass: titleLen >= 30 && titleLen <= 70,
      detail: `${titleLen} حرف (المثالي: 40 - 65 حرف)`,
      warn: titleLen < 30 ? 'العنوان قصير جداً' : titleLen > 70 ? 'قد يتم قصه في نتائج البحث' : null,
    },
    {
      label: 'الوصف التعريفي (Meta Description)',
      pass: descLen >= 120 && descLen <= 170,
      detail: `${descLen} حرف (المثالي: 130 - 160 حرف)`,
      warn: descLen < 120 ? 'الوصف قصير، أضف تفاصيل أكثر' : descLen > 170 ? 'الوصف أطول من الموصى به' : null,
    },
    {
      label: 'صورة المعاينة الاجتماعية (OG Image)',
      pass: !!settings.ogImage && settings.ogImage.startsWith('http'),
      detail: settings.ogImage ? 'موجودة وبصيغة صحيحة' : 'غير محددة',
      warn: !settings.ogImage ? 'مفقودة! ستظهر الروابط بدون صورة جذابة' : null,
    },
    {
      label: 'الرابط الأساسي المعتمد (Canonical URL)',
      pass: !!settings.canonicalUrl && settings.canonicalUrl.startsWith('https://'),
      detail: settings.canonicalUrl || 'غير محدد',
      warn: !settings.canonicalUrl ? 'ضروري لتفادي المحتوى المكرر' : null,
    },
    {
      label: 'حماية اللغة العربية من الترجمة المشوهة (notranslate)',
      pass: settings.enableNoTranslate,
      detail: settings.enableNoTranslate ? 'مفعلة وتمنع تشويه النصوص' : 'معطلة',
      warn: !settings.enableNoTranslate ? 'قد يقوم متصفح كروم بترجمة النصوص العربية بشكل مشوه' : null,
    },
    {
      label: 'فهرسة محركات البحث (Robots Index)',
      pass: settings.enableIndex,
      detail: settings.enableIndex ? 'مسموح بالأرشفة (index, follow)' : 'ممنوع (noindex)',
      warn: !settings.enableIndex ? 'الموقع مخفي عن محركات بحث جوجل!' : null,
    },
  ];

  const passedCount = checks.filter((c) => c.pass).length;
  const seoScore = Math.round((passedCount / checks.length) * 100);

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    toast({
      title: '✨ تم حفظ إعدادات السيو والظهور بنجاح!',
      description: 'تم تحديث البيانات الوصفية العامة للمنصة.',
    });
  };

  const handleCopy = (txt: string) => {
    navigator.clipboard.writeText(txt);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
    toast({ title: 'تم نسخ الرابط للحافظة' });
  };

  return (
    <div className="space-y-8 font-arabic" dir="rtl">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#111C2B] via-[#16253B] to-[#0A111A] border border-[#C5A15B]/30 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-80 h-80 bg-[#087C7B]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#087C7B] to-[#C5A15B] flex items-center justify-center text-white shadow-lg">
                <Globe className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-white">مركز القيادة المتقدم للسيو والظهور الرقمي</h2>
            </div>
            <p className="text-xs text-zinc-300 max-w-2xl leading-relaxed">
              إدارة الكلمات المفتاحية، بطاقات المعاينة الاجتماعية (WhatsApp / X / Facebook)، خريطة الموقع XML، وحماية نصوص الروايات والكوميكس العربية من الترجمة الآلية المشوهة.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-black/40 border border-[#C5A15B]/30">
              <span className="text-xs text-zinc-400">تقييم الجاهزية:</span>
              <span
                className={`text-sm font-bold font-mono ${
                  seoScore >= 80 ? 'text-emerald-400' : seoScore >= 50 ? 'text-amber-400' : 'text-rose-400'
                }`}
              >
                {seoScore}%
              </span>
            </div>
            <button
              onClick={handleSave}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#087C7B] to-[#0A9695] text-white text-xs font-bold shadow-lg shadow-[#087C7B]/25 hover:brightness-110 flex items-center gap-2 transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>اعتماد الإعدادات</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Settings Form & Live Previews */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left/Middle Column: Configuration Controls */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-3xl bg-[#111C2B]/90 border border-white/10 space-y-5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3">
              <Search className="w-4 h-4 text-[#C5A15B]" />
              <span>البيانات الوصفية الأساسية (Meta Tags)</span>
            </h3>

            {/* Site Title */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold text-zinc-300">عنوان المنصة الرئيسي (SEO Title)</label>
                <span className={`text-[11px] font-mono ${titleLen > 70 ? 'text-rose-400' : 'text-zinc-400'}`}>
                  {titleLen}/70
                </span>
              </div>
              <input
                type="text"
                value={settings.siteTitle}
                onChange={(e) => setSettings({ ...settings, siteTitle: e.target.value })}
                className="w-full bg-[#0B1220] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#087C7B]"
              />
            </div>

            {/* Meta Description */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold text-zinc-300">الوصف التعريفي (Meta Description)</label>
                <span className={`text-[11px] font-mono ${descLen > 170 ? 'text-rose-400' : 'text-zinc-400'}`}>
                  {descLen}/170
                </span>
              </div>
              <textarea
                rows={3}
                value={settings.siteDescription}
                onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                className="w-full bg-[#0B1220] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#087C7B] leading-relaxed"
              />
            </div>

            {/* Keywords */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">الكلمات المفتاحية (Keywords)</label>
              <input
                type="text"
                value={settings.keywords}
                onChange={(e) => setSettings({ ...settings, keywords: e.target.value })}
                className="w-full bg-[#0B1220] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#087C7B]"
                placeholder="روايات عربية, كوميكس, قصص مصورة..."
              />
            </div>

            {/* Canonical Base & OG Image */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">الرابط الرسمي المعتمد (Canonical)</label>
                <input
                  type="url"
                  value={settings.canonicalUrl}
                  onChange={(e) => setSettings({ ...settings, canonicalUrl: e.target.value })}
                  className="w-full bg-[#0B1220] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-[#087C7B]"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">رابط صورة المشاركة (OG Image)</label>
                <input
                  type="url"
                  value={settings.ogImage}
                  onChange={(e) => setSettings({ ...settings, ogImage: e.target.value })}
                  className="w-full bg-[#0B1220] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-[#087C7B]"
                  dir="ltr"
                />
              </div>
            </div>

            {/* Integration Tokens */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">رمز التحقق من Google Search Console</label>
                <input
                  type="text"
                  placeholder="google-site-verification token"
                  value={settings.googleVerification}
                  onChange={(e) => setSettings({ ...settings, googleVerification: e.target.value })}
                  className="w-full bg-[#0B1220] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-[#087C7B]"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">معرف Google Analytics 4 (GA4 ID)</label>
                <input
                  type="text"
                  placeholder="G-XXXXXXXXXX"
                  value={settings.ga4Id}
                  onChange={(e) => setSettings({ ...settings, ga4Id: e.target.value })}
                  className="w-full bg-[#0B1220] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-[#087C7B]"
                  dir="ltr"
                />
              </div>
            </div>

            {/* Toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-white/10">
              <label className="flex items-center gap-3 p-3 rounded-2xl bg-black/30 border border-white/10 cursor-pointer hover:border-white/20">
                <input
                  type="checkbox"
                  checked={settings.enableNoTranslate}
                  onChange={(e) => setSettings({ ...settings, enableNoTranslate: e.target.checked })}
                  className="rounded text-[#087C7B] focus:ring-0 w-4 h-4 bg-transparent border-white/20"
                />
                <div>
                  <span className="text-xs font-bold text-white block">حماية الترجمة (notranslate)</span>
                  <span className="text-[10px] text-zinc-400">تمنع المتصفحات من تشويه النصوص العربية</span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-2xl bg-black/30 border border-white/10 cursor-pointer hover:border-white/20">
                <input
                  type="checkbox"
                  checked={settings.enableIndex}
                  onChange={(e) => setSettings({ ...settings, enableIndex: e.target.checked })}
                  className="rounded text-[#087C7B] focus:ring-0 w-4 h-4 bg-transparent border-white/20"
                />
                <div>
                  <span className="text-xs font-bold text-white block">السماح بالأرشفة (Robots Index)</span>
                  <span className="text-[10px] text-zinc-400">تمكين عناكب البحث من قراءة الصفحات</span>
                </div>
              </label>
            </div>
          </div>

          {/* Quick Technical Links */}
          <div className="p-5 rounded-3xl bg-[#111C2B]/70 border border-white/10 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <FileCode className="w-5 h-5 text-[#087C7B]" />
              <div>
                <span className="text-xs font-bold text-white block">ملفات الفهرسة التقنية المنشورة:</span>
                <span className="text-[11px] text-zinc-400">خريطة الموقع وملف الروبوتات تعمل بشكل ديناميكي</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a
                href="/sitemap.xml"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-zinc-200 flex items-center gap-1.5"
              >
                <span>خريطة الموقع (sitemap.xml)</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <a
                href="/robots.txt"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-zinc-200 flex items-center gap-1.5"
              >
                <span>ملف الروبوتات (robots.txt)</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Right Column: Live Simulator Previews & Audit */}
        <div className="lg:col-span-5 space-y-6">
          {/* Real-time SEO Checks Panel */}
          <div className="p-6 rounded-3xl bg-[#111C2B]/90 border border-white/10">
            <h3 className="text-sm font-bold text-white flex items-center justify-between border-b border-white/10 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>فحص معايير محركات البحث (SEO Audit)</span>
              </div>
              <span className="text-xs font-mono font-bold text-[#C5A15B]">
                {passedCount}/{checks.length} معايير
              </span>
            </h3>

            <div className="space-y-3">
              {checks.map((chk, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-2xl border text-xs flex items-start gap-3 transition-colors ${
                    chk.pass
                      ? 'bg-emerald-500/5 border-emerald-500/20 text-zinc-200'
                      : 'bg-rose-500/5 border-rose-500/20 text-zinc-200'
                  }`}
                >
                  <div className="mt-0.5">
                    {chk.pass ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-bold text-white">{chk.label}</span>
                      <span className="text-[10px] text-zinc-400 font-mono">{chk.detail}</span>
                    </div>
                    {chk.warn && <p className="text-[11px] text-rose-300 mt-1">{chk.warn}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Live Simulator Previews */}
          <div className="p-6 rounded-3xl bg-[#111C2B]/90 border border-white/10">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#C5A15B]" />
                <span>المعاينة الحية (Live Previews)</span>
              </h3>

              <div className="flex items-center gap-1 p-1 bg-black/40 rounded-xl border border-white/10 text-xs">
                <button
                  type="button"
                  onClick={() => setActivePreview('google')}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    activePreview === 'google' ? 'bg-[#087C7B] text-white font-bold' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  جوجل
                </button>
                <button
                  type="button"
                  onClick={() => setActivePreview('facebook')}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    activePreview === 'facebook' ? 'bg-[#087C7B] text-white font-bold' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  فيسبوك / واتساب
                </button>
                <button
                  type="button"
                  onClick={() => setActivePreview('twitter')}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    activePreview === 'twitter' ? 'bg-[#087C7B] text-white font-bold' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  منصة X
                </button>
              </div>
            </div>

            {/* Google SERP Simulator */}
            {activePreview === 'google' && (
              <div className="p-4 rounded-2xl bg-[#202124] text-white border border-zinc-700 space-y-1.5 text-right font-sans">
                <div className="flex items-center gap-2 text-xs text-zinc-400" dir="ltr">
                  <div className="w-5 h-5 rounded-full bg-black/60 flex items-center justify-center p-0.5 border border-zinc-600">
                    <img src="/favicon.svg" alt="" className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] text-zinc-200 font-semibold">حكاياتي | HEKAYATY</span>
                    <span className="text-[10px] text-zinc-400 truncate max-w-xs">{settings.canonicalUrl}</span>
                  </div>
                </div>
                <h4 className="text-base font-medium text-[#8ab4f8] hover:underline cursor-pointer leading-tight pt-1">
                  {settings.siteTitle}
                </h4>
                <p className="text-xs text-zinc-300 leading-relaxed line-clamp-2">{settings.siteDescription}</p>
              </div>
            )}

            {/* Facebook / WhatsApp Card Simulator */}
            {activePreview === 'facebook' && (
              <div className="rounded-2xl overflow-hidden bg-[#18191a] border border-zinc-700 text-white">
                <div className="aspect-[1.91/1] w-full bg-zinc-900 overflow-hidden relative">
                  <img
                    src={settings.ogImage}
                    alt=""
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/assets/magic_library_clouds.png';
                    }}
                  />
                  <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-black/70 text-[10px] text-zinc-300 font-mono">
                    1200 × 630
                  </div>
                </div>
                <div className="p-3.5 bg-[#242526]">
                  <span className="text-[10px] uppercase tracking-wider text-zinc-400 block mb-0.5">HEKAYATY.COM</span>
                  <h4 className="text-xs font-bold text-white truncate mb-1">{settings.siteTitle}</h4>
                  <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">{settings.siteDescription}</p>
                </div>
              </div>
            )}

            {/* Twitter / X Large Summary Card Simulator */}
            {activePreview === 'twitter' && (
              <div className="rounded-2xl overflow-hidden bg-black border border-zinc-800 text-white">
                <div className="aspect-[2/1] w-full bg-zinc-900 overflow-hidden relative">
                  <img
                    src={settings.ogImage}
                    alt=""
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/assets/magic_library_clouds.png';
                    }}
                  />
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/80 text-[10px] text-white">
                    hekayaty.com
                  </div>
                </div>
                <div className="p-3">
                  <h4 className="text-xs font-bold text-white truncate mb-1">{settings.siteTitle}</h4>
                  <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">{settings.siteDescription}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
