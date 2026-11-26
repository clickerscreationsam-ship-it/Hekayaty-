import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { SEOHead } from '@/components/common/SEOHead';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/useAuthStore';
import {
  Layers,
  BookOpen,
  Bookmark,
  Clock,
  Play,
  Heart,
  ChevronLeft,
  Sparkles,
} from 'lucide-react';

export default function MySeriesLibrary() {
  const { isAuthenticated } = useAuthStore();
  const [libraryData, setLibraryData] = useState<{ following: any[]; in_progress: any[] }>({
    following: [],
    in_progress: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    setLoading(true);
    api
      .getUserSeriesLibrary()
      .then((res) => {
        setLibraryData(res || { following: [], in_progress: [] });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [isAuthenticated]);

  return (
    <div className="min-h-screen bg-[#070B14] text-white font-arabic notranslate" dir="rtl" translate="no">
      <SEOHead title="مكتبة سلاسلي ومتابعاتي | حكاياتي" description="سجل قراءاتك، السلاسل التي تتابعها، ونسبة تقدمك في الفصول والمواسم." />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        {/* Header */}
        <div className="space-y-2 border-b border-zinc-800 pb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C5A15B]/20 text-[#E1C58B] text-xs font-bold border border-[#C5A15B]/40">
            <Bookmark className="w-3.5 h-3.5" />
            <span>مكتبة القارئ الشخصية</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white">سلاسل ومتابعات حكاياتي</h1>
          <p className="text-xs text-zinc-400">
            تابع مستوى تقدمك في قراءة السلاسل والمواسم واحصل على آخر التحديثات فور صدور فصول جديدة.
          </p>
        </div>

        {!isAuthenticated ? (
          <div className="py-20 text-center bg-[#0B1220] rounded-3xl border border-white/10 p-8 max-w-lg mx-auto space-y-4">
            <Bookmark className="w-12 h-12 text-[#C5A15B] mx-auto" />
            <h3 className="text-lg font-bold text-white">يرجى تسجيل الدخول لعرض مكتبتك الشخصية</h3>
            <p className="text-xs text-zinc-400">سجل الدخول لحفظ تقدمك ومتابعة سلاسلك المفضلة.</p>
            <Link href="/login">
              <button className="px-6 py-2.5 rounded-xl bg-[#C5A15B] text-black font-bold text-xs shadow-lg">
                تسجيل الدخول
              </button>
            </Link>
          </div>
        ) : loading ? (
          <div className="py-20 flex justify-center">
            <div className="w-8 h-8 rounded-full border-4 border-[#C5A15B]/30 border-t-[#C5A15B] animate-spin" />
          </div>
        ) : (
          <div className="space-y-12">
            {/* In Progress */}
            <div className="space-y-4">
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Play className="w-4 h-4 text-teal-400 fill-current" />
                <span>قراءاتي المستمرة ({libraryData.in_progress.length})</span>
              </h2>

              {libraryData.in_progress.length === 0 ? (
                <div className="py-10 text-center text-zinc-500 bg-[#0B1220] rounded-2xl border border-white/5 text-xs">
                  لم تبدأ بقراءة أي سلسلة بعد. <Link href="/series" className="text-[#C5A15B] underline mr-1">تصفح السلاسل</Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {libraryData.in_progress.map((item: any, i: number) => {
                    const s = item.series;
                    const prog = item.progress;
                    return (
                      <div key={i} className="p-4 rounded-3xl bg-[#0B1220] border border-white/10 flex items-center gap-4">
                        <img src={s.cover_image_url} alt={s.title_ar} className="w-16 h-20 rounded-xl object-cover shrink-0" />
                        <div className="flex-1 min-w-0 space-y-1.5">
                          <h4 className="font-bold text-sm text-white truncate">{s.title_ar}</h4>
                          <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono">
                            <span>التقدم: {prog.progressPercentage || 0}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-black/60 rounded-full overflow-hidden">
                            <div className="h-full bg-[#C5A15B] rounded-full" style={{ width: `${prog.progressPercentage || 10}%` }} />
                          </div>
                          <Link href={`/series/${s.slug}/read/${prog.currentEpisodeId}`}>
                            <span className="text-[11px] text-[#C5A15B] font-bold block pt-1 hover:underline">متابعة القراءة ↗</span>
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Following */}
            <div className="space-y-4">
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-[#C5A15B] fill-current" />
                <span>السلاسل التي أتابعها ({libraryData.following.length})</span>
              </h2>

              {libraryData.following.length === 0 ? (
                <div className="py-10 text-center text-zinc-500 bg-[#0B1220] rounded-2xl border border-white/5 text-xs">
                  لا تتابع أي سلسلة حالياً. اضغط "متابعة السلسلة" في أي سلسلة ليصلك إشعار بالفصول الجديدة.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {libraryData.following.map((s: any) => (
                    <Link key={s.id} href={`/series/${s.slug || s.id}`} className="group block">
                      <div className="bg-[#0B1220] border border-white/10 group-hover:border-[#C5A15B]/50 rounded-2xl overflow-hidden transition-all shadow-md">
                        <div className="aspect-[16/10] overflow-hidden bg-black/60">
                          <img src={s.cover_image_url} alt={s.title_ar} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        </div>
                        <div className="p-3.5 space-y-1">
                          <span className="text-[10px] text-[#C5A15B] font-bold block">{s.genre}</span>
                          <h5 className="font-bold text-sm text-white group-hover:text-[#E1C58B] truncate">{s.title_ar}</h5>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
