import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import {
  TrendingUp,
  Eye,
  Heart,
  Bookmark,
  Users,
  Activity,
  Calendar,
  Filter,
  RefreshCw,
  ExternalLink,
  BookOpen,
  Sparkles,
} from 'lucide-react';

interface EngagementAnalyticsPanelProps {
  toast: any;
}

export function EngagementAnalyticsPanel({ toast }: EngagementAnalyticsPanelProps) {
  const [timeRange, setTimeRange] = useState<'today' | '7d' | '30d' | '90d'>('30d');
  const [contentFilter, setContentFilter] = useState<'all' | 'novel' | 'comic' | 'series'>('all');
  const [metricSort, setMetricSort] = useState<'views' | 'likes' | 'followers'>('views');
  const [loading, setLoading] = useState(true);

  const [overview, setOverview] = useState<{
    kpis: {
      totalViews: number;
      uniqueViewers: number;
      totalLikes: number;
      totalFollows: number;
      totalEngagements: number;
      engagementRate: number;
    };
    chartData: {
      labels: string[];
      views: number[];
      likes: number[];
      follows: number[];
    };
  }>({
    kpis: {
      totalViews: 0,
      uniqueViewers: 0,
      totalLikes: 0,
      totalFollows: 0,
      totalEngagements: 0,
      engagementRate: 0,
    },
    chartData: { labels: [], views: [], likes: [], follows: [] },
  });

  const [topContent, setTopContent] = useState<any[]>([]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [ovRes, ctRes] = await Promise.all([
        api.getAdminAnalyticsOverview(timeRange),
        api.getAdminAnalyticsContent(contentFilter === 'all' ? undefined : contentFilter, metricSort, 20),
      ]);

      if (ovRes.kpis) setOverview(ovRes);
      if (Array.isArray(ctRes.items)) setTopContent(ctRes.items);
    } catch {
      toast({
        title: 'تعذر جلب التحليلات',
        description: 'حدث خطأ أثناء تحميل بيانات التفاعل والتحليلات.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [timeRange, contentFilter, metricSort]);

  const kpis = overview.kpis;
  const chart = overview.chartData;

  const maxViewVal = Math.max(...(chart.views || [1]), 1);

  return (
    <div className="space-y-8 font-arabic notranslate text-right" dir="rtl" translate="no">

      {/* ─── Top Header & Time Filter Bar ─── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#0B1322] border border-white/10 rounded-2xl p-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C5A15B]/15 text-[#E1C58B] text-xs font-bold border border-[#C5A15B]/30 mb-2">
            <Activity className="w-3.5 h-3.5 text-[#C5A15B]" />
            <span>لوحة تحليلات التفاعل الشاملة (Platform Engagement & Analytics)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">إحصائيات القراءة والتفاعل في حكاياتي</h2>
          <p className="text-xs text-zinc-400">تتبع المشاهدات الحقيقية الفريدة، الإعجابات، المتابعين، وتفاعل القراء عبر جميع المنصات.</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Time Filter Pills */}
          <div className="flex items-center gap-1 bg-[#060D1A] p-1 rounded-xl border border-white/10 text-xs">
            {[
              { key: 'today', label: 'اليوم' },
              { key: '7d', label: '7 أيام' },
              { key: '30d', label: '30 يوماً' },
              { key: '90d', label: '90 يوماً' },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setTimeRange(t.key as any)}
                className={`px-3 py-1.5 rounded-lg transition-all font-bold ${
                  timeRange === t.key
                    ? 'bg-[#C5A15B] text-black shadow'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <button
            onClick={loadData}
            disabled={loading}
            className="p-2 rounded-xl bg-white/5 border border-white/10 text-zinc-300 hover:text-white transition-all"
            title="تحديث البيانات"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* ─── Global KPI Cards ─── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          {
            label: 'إجمالي المشاهدات',
            value: kpis.totalViews.toLocaleString('ar-EG'),
            icon: Eye,
            color: 'text-teal-400',
            bg: 'bg-teal-500/10 border-teal-500/20',
          },
          {
            label: 'القراء الفريدون',
            value: kpis.uniqueViewers.toLocaleString('ar-EG'),
            icon: Users,
            color: 'text-blue-400',
            bg: 'bg-blue-500/10 border-blue-500/20',
          },
          {
            label: 'إجمالي الإعجابات',
            value: kpis.totalLikes.toLocaleString('ar-EG'),
            icon: Heart,
            color: 'text-rose-400',
            bg: 'bg-rose-500/10 border-rose-500/20',
          },
          {
            label: 'إجمالي المتابعين',
            value: kpis.totalFollows.toLocaleString('ar-EG'),
            icon: Bookmark,
            color: 'text-amber-400',
            bg: 'bg-amber-500/10 border-amber-500/20',
          },
          {
            label: 'إجمالي التفاعلات',
            value: kpis.totalEngagements.toLocaleString('ar-EG'),
            icon: TrendingUp,
            color: 'text-purple-400',
            bg: 'bg-purple-500/10 border-purple-500/20',
          },
          {
            label: 'معدل التفاعل',
            value: `${kpis.engagementRate}%`,
            icon: Sparkles,
            color: 'text-[#E1C58B]',
            bg: 'bg-[#C5A15B]/10 border-[#C5A15B]/20',
          },
        ].map((kpi, idx) => (
          <div key={idx} className={`p-4 rounded-2xl border ${kpi.bg} flex flex-col justify-between space-y-3`}>
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-400 font-semibold">{kpi.label}</span>
              <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
            </div>
            <div className="text-2xl font-black text-white font-mono">{kpi.value}</div>
          </div>
        ))}
      </div>

      {/* ─── Visual Trends Chart (SVG Bar Chart) ─── */}
      <div className="bg-[#0B1322] border border-white/10 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#C5A15B]" />
            <h3 className="text-sm font-bold text-white">تطور المشاهدات والتفاعل عبر الأيام</h3>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono text-zinc-400">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-teal-400" /> المشاهدات</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-400" /> الإعجابات</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> المتابعات</span>
          </div>
        </div>

        <div className="h-44 flex items-end gap-2 sm:gap-4 pt-6 px-2">
          {chart.labels.map((label, idx) => {
            const v = chart.views[idx] || 0;
            const heightPct = Math.max(12, Math.round((v / maxViewVal) * 100));
            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                <div className="w-full flex items-end justify-center gap-1 h-full">
                  <div
                    style={{ height: `${heightPct}%` }}
                    className="w-full max-w-[20px] rounded-t-md bg-gradient-to-t from-teal-600 to-teal-400 group-hover:brightness-125 transition-all"
                    title={`${label}: ${v} مشاهدة`}
                  />
                </div>
                <span className="text-[10px] text-zinc-500 font-mono rotate-45 sm:rotate-0 truncate">{label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── Top Content Ranking Tables ─── */}
      <div className="bg-[#0B1322] border border-white/10 rounded-2xl p-6 space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#C5A15B]" />
              <span>ترتيب الأعمال الأكثر تفاعلاً (Top Engaging Content)</span>
            </h3>
            <p className="text-xs text-zinc-400">استعرض ترتيب الروايات والقصص المصورة والسلاسل بحسب المشاهدات والإعجابات والمتابعين.</p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Content Filter */}
            <div className="flex items-center gap-1 bg-[#060D1A] p-1 rounded-xl border border-white/10 text-xs">
              {[
                { key: 'all', label: 'الكل' },
                { key: 'novel', label: 'الروايات' },
                { key: 'comic', label: 'الكوميكس' },
                { key: 'series', label: 'السلاسل' },
              ].map((c) => (
                <button
                  key={c.key}
                  onClick={() => setContentFilter(c.key as any)}
                  className={`px-3 py-1 rounded-lg font-bold transition-all ${
                    contentFilter === c.key
                      ? 'bg-[#087C7B] text-white shadow'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* Metric Sort */}
            <div className="flex items-center gap-1 bg-[#060D1A] p-1 rounded-xl border border-white/10 text-xs">
              {[
                { key: 'views', label: 'الأكثر مشاهدة' },
                { key: 'likes', label: 'الأكثر إعجاباً' },
                { key: 'followers', label: 'الأكثر متابعة' },
              ].map((m) => (
                <button
                  key={m.key}
                  onClick={() => setMetricSort(m.key as any)}
                  className={`px-3 py-1 rounded-lg font-bold transition-all ${
                    metricSort === m.key
                      ? 'bg-[#C5A15B] text-black shadow'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content Table */}
        {topContent.length === 0 ? (
          <div className="text-center py-12 text-xs text-zinc-500">
            لا توجد بيانات تفاعل كافية في هذه الفترة المحددة.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-right">
              <thead>
                <tr className="border-b border-white/5 text-zinc-400 font-bold">
                  <th className="py-3 px-3">#</th>
                  <th className="py-3 px-3">العمل الأدبي</th>
                  <th className="py-3 px-3">النوع</th>
                  <th className="py-3 px-3">المؤلف</th>
                  <th className="py-3 px-3">المشاهدات</th>
                  <th className="py-3 px-3">الإعجابات</th>
                  <th className="py-3 px-3">المتابعون</th>
                  <th className="py-3 px-3 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {topContent.map((item, idx) => (
                  <tr key={`${item.contentType}_${item.id}`} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-3 font-mono text-zinc-500 font-bold">{idx + 1}</td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-3">
                        <img src={item.coverUrl} alt={item.title} className="w-9 h-12 rounded-lg object-cover shrink-0" />
                        <div>
                          <div className="font-bold text-white text-xs">{item.title}</div>
                          {item.titleEn && <div className="text-[10px] text-zinc-500 font-mono">{item.titleEn}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/5 text-zinc-300 font-bold">
                        {item.contentTypeLabel}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-zinc-400">{item.author}</td>
                    <td className="py-3 px-3 font-mono text-teal-400 font-bold">{item.views.toLocaleString('ar-EG')}</td>
                    <td className="py-3 px-3 font-mono text-rose-400 font-bold">{item.likes.toLocaleString('ar-EG')}</td>
                    <td className="py-3 px-3 font-mono text-amber-400 font-bold">{item.followers.toLocaleString('ar-EG')}</td>
                    <td className="py-3 px-3 text-center">
                      <a
                        href={item.contentType === 'series' ? `/series/${item.id}` : item.contentType === 'comic' ? `/comics/${item.id}` : `/stories/${item.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-all text-[11px]"
                      >
                        <span>معاينة</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
