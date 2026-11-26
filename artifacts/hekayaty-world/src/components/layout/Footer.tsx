import React, { useState } from 'react';
import { Link } from 'wouter';
import { FeatherLogo } from '@/components/common/FeatherLogo';
import {
  FacebookIcon,
  InstagramIcon,
  TikTokIcon,
  XTwitterIcon,
  ThreadsIcon,
} from '@/components/common/BrandIcons';
import {
  Sparkles,
  Send,
  BookOpen,
  Users,
  Compass,
  Layers,
  Shield,
  Heart,
  ChevronLeft,
  CheckCircle2,
} from 'lucide-react';

const SOCIAL_LINKS = [
  {
    name: 'facebook',
    nameAr: 'فيسبوك',
    url: 'https://www.facebook.com/share/1CynVnhFwJ/',
    icon: <FacebookIcon className="w-4 h-4 text-[#1877F2] group-hover:scale-110 transition-transform" />,
    badgeBg: 'hover:border-[#1877F2]/50 hover:bg-[#1877F2]/10',
    color: 'hover:text-[#1877F2]',
  },
  {
    name: 'instagram',
    nameAr: 'إنستغرام',
    url: 'https://www.instagram.com/hekayaty3949',
    icon: <InstagramIcon className="w-4 h-4 text-[#E4405F] group-hover:scale-110 transition-transform" />,
    badgeBg: 'hover:border-[#E4405F]/50 hover:bg-[#E4405F]/10',
    color: 'hover:text-[#E4405F]',
  },
  {
    name: 'tiktok',
    nameAr: 'تيك توك',
    url: 'https://www.tiktok.com/@hekayaty0?lang=ar',
    icon: <TikTokIcon className="w-4 h-4 text-[#000000] dark:text-white group-hover:scale-110 transition-transform" />,
    badgeBg: 'hover:border-black/40 dark:hover:border-white/40 hover:bg-black/5 dark:hover:bg-white/10',
    color: 'hover:text-zinc-900 dark:hover:text-white',
  },
  {
    name: 'x-twitter',
    nameAr: 'X (تويتر)',
    url: 'https://x.com/hekayatyn6',
    icon: <XTwitterIcon className="w-3.5 h-3.5 text-[#000000] dark:text-white group-hover:scale-110 transition-transform" />,
    badgeBg: 'hover:border-black/40 dark:hover:border-white/40 hover:bg-black/5 dark:hover:bg-white/10',
    color: 'hover:text-zinc-900 dark:hover:text-white',
  },
  {
    name: 'threads',
    nameAr: 'ثريدز',
    url: 'https://www.threads.com/@hekayaty3949',
    icon: <ThreadsIcon className="w-4 h-4 text-[#000000] dark:text-white group-hover:scale-110 transition-transform" />,
    badgeBg: 'hover:border-purple-500/50 hover:bg-purple-500/10',
    color: 'hover:text-purple-600 dark:hover:text-purple-400',
  },
];

export function Footer() {
  const currentYear = 2026;
  const [subscribed, setSubscribed] = useState(false);
  const [emailInput, setEmailInput] = useState('');

  return (
    <footer className="relative bg-[#EFE5D4]/60 dark:bg-[#111C2B] border-t border-[#D8C5A8] dark:border-white/10 overflow-hidden transition-colors duration-300" dir="rtl">
      {/* Subtle ambient lighting */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#087C7B]/5 dark:bg-[#C5A15B]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#119B98]/5 dark:bg-[#087C7B]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
          {/* Brand Info */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-3 group focus:outline-none w-fit" aria-label="الصفحة الرئيسية لحكاياتي">
              <FeatherLogo size="md" />
            </Link>

            <p className="text-[#604735] dark:text-zinc-400 font-arabic text-sm leading-relaxed max-w-md">
              الوجهة الترفيهية الأدبية الأولى لاكتشاف وقراءة ومتابعة أضخم الأكوان القصصية العربية
              المترابطة. نجمع بين سلاسل حكاياتي الأصلية ونخبة الأعمال المنتقاة من مبدعينا المشاركين
              تحت هوية بصرية ساحرة.
            </p>

            <div className="flex items-center gap-2 pt-2">
              <span className="text-xs text-[#604735] dark:text-zinc-500 font-arabic">تصنيف المحتوى:</span>
              <span className="px-2.5 py-0.5 text-[11px] rounded bg-[#087C7B]/10 dark:bg-white/5 border border-[#087C7B]/30 dark:border-[#C5A15B]/30 text-[#087C7B] dark:text-[#E1C58B] font-semibold">
                أعمال أصلية
              </span>
              <span className="px-2.5 py-0.5 text-[11px] rounded bg-[#119B98]/10 dark:bg-blue-500/10 border border-[#119B98]/30 dark:border-blue-500/30 text-[#119B98] dark:text-blue-400 font-semibold">
                مختارة تحريرياً
              </span>
            </div>

            {/* Official Social Media Channels */}
            <div className="pt-3">
              <span className="text-xs font-bold text-[#2A1F17] dark:text-[#E1C58B] block mb-2 font-arabic">
                تواصل وتابع مجتمع حكاياتي الرسمي:
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {SOCIAL_LINKS.map((s) => (
                  <a
                    key={s.name}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={s.nameAr}
                    className={`px-3 py-1.5 rounded-xl border border-[#D8C5A8] dark:border-white/10 bg-white/70 dark:bg-white/[0.04] text-[#2A1F17] dark:text-zinc-200 ${s.badgeBg} ${s.color} transition-all duration-300 flex items-center gap-2 text-xs font-semibold shadow-sm hover:scale-105 hover:shadow-md group`}
                  >
                    <span className="shrink-0 flex items-center justify-center">{s.icon}</span>
                    <span className="text-[12px] font-arabic font-medium">{s.nameAr}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Universe Links */}
          <div className="flex flex-col gap-3 font-arabic">
            <h4 className="text-[#2A1F17] dark:text-white text-base font-bold flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#087C7B] dark:text-[#C5A15B]" />
              <span>الكون القصصي</span>
            </h4>
            <ul className="space-y-2 text-sm text-[#604735] dark:text-zinc-400">
              <li>
                <Link href="/comics" className="hover:text-[#087C7B] dark:hover:text-[#E1C58B] transition-colors flex items-center gap-1.5">
                  <ChevronLeft className="w-3.5 h-3.5 text-[#087C7B]/60 dark:text-[#C5A15B]/60" />
                  <span>مكتبة الكوميكس</span>
                </Link>
              </li>
              <li>
                <Link href="/stories" className="hover:text-[#087C7B] dark:hover:text-[#E1C58B] transition-colors flex items-center gap-1.5">
                  <ChevronLeft className="w-3.5 h-3.5 text-[#087C7B]/60 dark:text-[#C5A15B]/60" />
                  <span>القصص والمرويات</span>
                </Link>
              </li>
              <li>
                <Link href="/characters" className="hover:text-[#087C7B] dark:hover:text-[#E1C58B] transition-colors flex items-center gap-1.5">
                  <ChevronLeft className="w-3.5 h-3.5 text-[#087C7B]/60 dark:text-[#C5A15B]/60" />
                  <span>سجل الشخصيات</span>
                </Link>
              </li>
              <li>
                <Link href="/worlds" className="hover:text-[#087C7B] dark:hover:text-[#E1C58B] transition-colors flex items-center gap-1.5">
                  <ChevronLeft className="w-3.5 h-3.5 text-[#087C7B]/60 dark:text-[#C5A15B]/60" />
                  <span>أطلس العوالم</span>
                </Link>
              </li>
              <li>
                <Link href="/timeline" className="hover:text-[#087C7B] dark:hover:text-[#E1C58B] transition-colors flex items-center gap-1.5">
                  <ChevronLeft className="w-3.5 h-3.5 text-[#087C7B]/60 dark:text-[#C5A15B]/60" />
                  <span>الخط الزمني الشامل</span>
                </Link>
              </li>
              <li>
                <Link href="/encyclopedia" className="hover:text-[#087C7B] dark:hover:text-[#E1C58B] transition-colors flex items-center gap-1.5">
                  <ChevronLeft className="w-3.5 h-3.5 text-[#087C7B]/60 dark:text-[#C5A15B]/60" />
                  <span>الموسوعة والأسرار</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Community & Selected */}
          <div className="flex flex-col gap-3 font-arabic">
            <h4 className="text-[#2A1F17] dark:text-white text-base font-bold flex items-center gap-2">
              <Users className="w-4 h-4 text-[#087C7B] dark:text-[#C5A15B]" />
              <span>المجتمع والإبداع</span>
            </h4>
            <ul className="space-y-2 text-sm text-[#604735] dark:text-zinc-400">
              <li>
                <Link href="/selected" className="hover:text-[#087C7B] dark:hover:text-[#E1C58B] transition-colors flex items-center gap-1.5">
                  <ChevronLeft className="w-3.5 h-3.5 text-[#087C7B]/60 dark:text-[#C5A15B]/60" />
                  <span>حكاياتي المختارة</span>
                </Link>
              </li>
              <li>
                <Link href="/card-game" className="hover:text-[#087C7B] dark:hover:text-[#E1C58B] transition-colors flex items-center gap-1.5">
                  <ChevronLeft className="w-3.5 h-3.5 text-[#087C7B]/60 dark:text-[#C5A15B]/60" />
                  <span>لعبة البطاقات التكتيكية</span>
                </Link>
              </li>
              <li>
                <Link href="/community" className="hover:text-[#087C7B] dark:hover:text-[#E1C58B] transition-colors flex items-center gap-1.5">
                  <ChevronLeft className="w-3.5 h-3.5 text-[#087C7B]/60 dark:text-[#C5A15B]/60" />
                  <span>منتدى ومعرض المعجبين</span>
                </Link>
              </li>
              <li>
                <Link href="/news" className="hover:text-[#087C7B] dark:hover:text-[#E1C58B] transition-colors flex items-center gap-1.5">
                  <ChevronLeft className="w-3.5 h-3.5 text-[#087C7B]/60 dark:text-[#C5A15B]/60" />
                  <span>الأخبار والإعلانات</span>
                </Link>
              </li>
              <li>
                <Link href="/events" className="hover:text-[#087C7B] dark:hover:text-[#E1C58B] transition-colors flex items-center gap-1.5">
                  <ChevronLeft className="w-3.5 h-3.5 text-[#087C7B]/60 dark:text-[#C5A15B]/60" />
                  <span>الفعاليات والمعارض</span>
                </Link>
              </li>
              <li>
                <Link href="/editorial" className="text-zinc-500 hover:text-zinc-400 transition-colors flex items-center gap-1.5 text-xs">
                  <ChevronLeft className="w-3.5 h-3.5 text-zinc-400" />
                  <span>لوحة التحرير الداخلية</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter Signup */}
          <div className="flex flex-col gap-3 font-arabic">
            <h4 className="text-[#2A1F17] dark:text-white text-base font-bold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#087C7B] dark:text-[#C5A15B]" />
              <span>طليعة حكاياتي الأدبية</span>
            </h4>
            <p className="text-[#604735] dark:text-zinc-400 text-xs leading-relaxed">
              اشترك في النشرة الدورية للحصول على إشعارات الإصدارات الجديدة، فصول القصص الحصرية،
              وأحدث فعاليات مجتمع المبدعين.
            </p>
            {subscribed ? (
              <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs flex items-center gap-2 mt-1 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>شكراً لانضمامك إلى طليعة حكاياتي! سنرسل لك أحدث الإصدارات فور صدورها.</span>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (emailInput) {
                    setSubscribed(true);
                  }
                }}
                className="flex flex-col gap-2 mt-1"
              >
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="بريدك الإلكتروني..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-white/[0.04] border border-[#D8C5A8] dark:border-white/10 text-[#2A1F17] dark:text-white placeholder-[#604735]/60 dark:placeholder-zinc-500 text-xs focus:outline-none focus:border-[#087C7B] dark:focus:border-[#C5A15B]/60"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl bg-[#087C7B] hover:bg-[#075B5C] text-[#F7F1E6] font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(8,124,123,0.25)]"
                >
                  <span>انضم الآن</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-[#D8C5A8] dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 font-arabic text-xs text-[#604735] dark:text-zinc-500">
          <p>© {currentYear} حكاياتي (Hekayaty). جميع الحقوق محفوظة.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-[#087C7B] dark:hover:text-zinc-400 cursor-pointer">سياسة الخصوصية</span>
            <span className="hover:text-[#087C7B] dark:hover:text-zinc-400 cursor-pointer">شروط الاستخدام</span>
            <span className="hover:text-[#087C7B] dark:hover:text-zinc-400 cursor-pointer">معايير التحرير والنشر</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
