import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { ImageUploadField } from '@/components/common/ImageUploadField';
import {
  Layers,
  BookOpen,
  Plus,
  Edit,
  Trash2,
  Calendar,
  Clock,
  Eye,
  Heart,
  Sparkles,
  ChevronRight,
  ChevronDown,
  FileText,
  Image as ImageIcon,
  CheckCircle,
  BarChart3,
  Users,
  Search,
  Filter,
  ArrowRight,
  Bookmark,
} from 'lucide-react';

interface Props {
  toast: any;
}

export function SeriesPlatformMgmtPanel({ toast }: Props) {
  const [seriesList, setSeriesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSeries, setSelectedSeries] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'catalog' | 'builder' | 'episodes' | 'analytics'>('catalog');

  // Filters
  const [search, setSearch] = useState('');
  const [formatFilter, setFormatFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Series Builder Modal
  const [showSeriesModal, setShowSeriesModal] = useState(false);
  const [builderStep, setBuilderStep] = useState<1 | 2 | 3>(1);
  const [editingSeriesId, setEditingSeriesId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Series form state
  const defaultSeriesForm = {
    title_ar: '',
    title_en: '',
    short_description_ar: '',
    description_ar: '',
    cover_image_url: '',
    banner_image_url: '',
    thumbnail_url: '',
    format: 'novel',
    status: 'ongoing',
    genre: 'خيال وفانتازيا',
    subgenres: '',
    tags: '',
    language: 'ar',
    age_rating: '13+',
    classification: 'original',
    is_original: true,
    publisher_name: 'دار حكاياتي للنشر الرقمي',
    author_name: '',
    artist_name: '',
    editor_name: '',
    structure_type: 'season_episode',
    structure_label: 'الموسم',
    release_schedule: 'weekly',
    release_day_time: 'كل جمعة الساعة 8 مساءً',
    is_featured: false,
    banner_priority: 1,
  };
  const [seriesForm, setSeriesForm] = useState(defaultSeriesForm);

  // Season Modal
  const [showSeasonModal, setShowSeasonModal] = useState(false);
  const [seasonForm, setSeasonForm] = useState({
    number: 1,
    title_ar: '',
    title_en: '',
    description_ar: '',
    cover_image_url: '',
    status: 'published',
    release_date: new Date().toISOString().split('T')[0],
  });

  // Episode Modal
  const [showEpisodeModal, setShowEpisodeModal] = useState(false);
  const [editingEpisodeId, setEditingEpisodeId] = useState<string | null>(null);
  const [episodeForm, setEpisodeForm] = useState({
    season_id: '',
    episode_number: 1,
    title_ar: '',
    title_en: '',
    short_description_ar: '',
    content_type: 'novel',
    content_ar: '',
    pdf_url: '',
    cover_image_url: '',
    reading_time_minutes: 5,
    status: 'published',
    publication_date: new Date().toISOString().slice(0, 16),
    scheduled_at: '',
    access_level: 'free',
    author_notes: '',
  });

  // Analytics
  const [analytics, setAnalytics] = useState<any>(null);

  const refreshData = () => {
    setLoading(true);
    api
      .adminListSeriesPlatform()
      .then((data) => {
        setSeriesList(Array.isArray(data) ? data : []);
        if (selectedSeries) {
          const updated = data.find((s: any) => s.id === selectedSeries.id);
          if (updated) setSelectedSeries(updated);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));

    api
      .adminGetSeriesAnalytics()
      .then((res) => setAnalytics(res))
      .catch(() => {});
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Filtered series list
  const filteredSeries = seriesList.filter((s) => {
    const matchesSearch =
      !search ||
      s.title_ar.toLowerCase().includes(search.toLowerCase()) ||
      s.title_en?.toLowerCase().includes(search.toLowerCase());
    const matchesFormat = formatFilter === 'all' || s.format === formatFilter;
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchesSearch && matchesFormat && matchesStatus;
  });

  // Open series create
  const handleOpenCreateSeries = () => {
    setEditingSeriesId(null);
    setSeriesForm(defaultSeriesForm);
    setBuilderStep(1);
    setShowSeriesModal(true);
  };

  // Open series edit
  const handleOpenEditSeries = (s: any) => {
    setEditingSeriesId(s.id);
    setSeriesForm({
      title_ar: s.title_ar || '',
      title_en: s.title_en || '',
      short_description_ar: s.short_description_ar || '',
      description_ar: s.description_ar || '',
      cover_image_url: s.cover_image_url || '',
      banner_image_url: s.banner_image_url || '',
      thumbnail_url: s.thumbnail_url || '',
      format: s.format || 'novel',
      status: s.status || 'ongoing',
      genre: s.genre || 'خيال وفانتازيا',
      subgenres: Array.isArray(s.subgenres) ? s.subgenres.join(', ') : '',
      tags: Array.isArray(s.tags) ? s.tags.join(', ') : '',
      language: s.language || 'ar',
      age_rating: s.age_rating || '13+',
      classification: s.classification || 'original',
      is_original: s.is_original !== false,
      publisher_name: s.publisher_name || '',
      author_name: s.author_name || '',
      artist_name: s.artist_name || '',
      editor_name: s.editor_name || '',
      structure_type: s.structure_type || 'season_episode',
      structure_label: s.structure_label || 'الموسم',
      release_schedule: s.release_schedule || 'weekly',
      release_day_time: s.release_day_time || '',
      is_featured: !!s.is_featured,
      banner_priority: s.banner_priority || 1,
    });
    setBuilderStep(1);
    setShowSeriesModal(true);
  };

  // Submit series
  const handleSubmitSeries = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...seriesForm,
        subgenres: seriesForm.subgenres ? seriesForm.subgenres.split(',').map((x) => x.trim()) : [],
        tags: seriesForm.tags ? seriesForm.tags.split(',').map((x) => x.trim()) : [],
      };

      if (editingSeriesId) {
        await api.adminUpdateSeriesPlatform(editingSeriesId, payload);
        toast({ title: '✅ تم تحديث بيانات السلسلة بنجاح!' });
      } else {
        await api.adminCreateSeriesPlatform(payload);
        toast({ title: '🎉 تم إنشاء السلسلة الجديدة بنجاح!' });
      }

      setShowSeriesModal(false);
      refreshData();
    } catch (err: any) {
      toast({ title: err.message || 'فشل في حفظ السلسلة', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  // Delete series
  const handleDeleteSeries = async (s: any) => {
    if (!window.confirm(`هل أنت متأكد من حذف السلسلة "${s.title_ar}" وجميع مواسمها وفصولها؟`)) return;
    try {
      await api.adminDeleteSeriesPlatform(s.id);
      toast({ title: '🗑️ تم حذف السلسلة بنجاح.' });
      if (selectedSeries?.id === s.id) setSelectedSeries(null);
      refreshData();
    } catch (err: any) {
      toast({ title: err.message || 'فشل في حذف السلسلة', variant: 'destructive' });
    }
  };

  // Submit Season
  const handleSubmitSeason = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSeries) return;
    setSubmitting(true);
    try {
      await api.adminCreateSeriesSeason(selectedSeries.id, seasonForm);
      toast({ title: '✅ تمت إضافة الموسم/المجلد بنجاح!' });
      setShowSeasonModal(false);
      refreshData();
    } catch (err: any) {
      toast({ title: err.message || 'فشل في إضافة الموسم', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Season
  const handleDeleteSeason = async (seasonId: string) => {
    if (!selectedSeries || !window.confirm('هل أنت متأكد من حذف هذا الموسم؟')) return;
    try {
      await api.adminDeleteSeriesSeason(selectedSeries.id, seasonId);
      toast({ title: '🗑️ تم حذف الموسم بنجاح.' });
      refreshData();
    } catch (err: any) {
      toast({ title: err.message || 'فشل في حذف الموسم', variant: 'destructive' });
    }
  };

  // Open episode modal
  const handleOpenCreateEpisode = (seasonId?: string) => {
    if (!selectedSeries) return;
    setEditingEpisodeId(null);
    const existing = selectedSeries.episodes || [];
    setEpisodeForm({
      season_id: seasonId || (selectedSeries.seasons?.[0]?.id || ''),
      episode_number: existing.length + 1,
      title_ar: '',
      title_en: '',
      short_description_ar: '',
      content_type: selectedSeries.format === 'comic' ? 'comic' : 'novel',
      content_ar: '',
      pdf_url: '',
      cover_image_url: selectedSeries.cover_image_url,
      reading_time_minutes: 5,
      status: 'published',
      publication_date: new Date().toISOString().slice(0, 16),
      scheduled_at: '',
      access_level: 'free',
      author_notes: '',
    });
    setShowEpisodeModal(true);
  };

  // Open episode edit
  const handleOpenEditEpisode = (ep: any) => {
    setEditingEpisodeId(ep.id);
    setEpisodeForm({
      season_id: ep.season_id || '',
      episode_number: ep.episode_number,
      title_ar: ep.title_ar,
      title_en: ep.title_en || '',
      short_description_ar: ep.short_description_ar || '',
      content_type: ep.content_type || 'novel',
      content_ar: ep.content_ar || '',
      pdf_url: ep.pdf_url || '',
      cover_image_url: ep.cover_image_url || '',
      reading_time_minutes: ep.reading_time_minutes || 5,
      status: ep.status || 'published',
      publication_date: ep.publication_date ? ep.publication_date.slice(0, 16) : new Date().toISOString().slice(0, 16),
      scheduled_at: ep.scheduled_at ? ep.scheduled_at.slice(0, 16) : '',
      access_level: ep.access_level || 'free',
      author_notes: ep.author_notes || '',
    });
    setShowEpisodeModal(true);
  };

  // Submit episode
  const handleSubmitEpisode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSeries) return;
    setSubmitting(true);
    try {
      if (editingEpisodeId) {
        await api.adminUpdateSeriesEpisode(selectedSeries.id, editingEpisodeId, episodeForm);
        toast({ title: '✅ تم تحديث الفصل/الحلقة بنجاح!' });
      } else {
        await api.adminCreateSeriesEpisode(selectedSeries.id, episodeForm);
        toast({ title: '🚀 تم نشر الفصل/الحلقة بنجاح!' });
      }
      setShowEpisodeModal(false);
      refreshData();
    } catch (err: any) {
      toast({ title: err.message || 'فشل في حفظ الفصل', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  // Delete episode
  const handleDeleteEpisode = async (episodeId: string) => {
    if (!selectedSeries || !window.confirm('هل أنت متأكد من حذف هذا الفصل/الحلقة نهائياً؟')) return;
    try {
      await api.adminDeleteSeriesEpisode(selectedSeries.id, episodeId);
      toast({ title: '🗑️ تم حذف الفصل بنجاح.' });
      refreshData();
    } catch (err: any) {
      toast({ title: err.message || 'فشل في حذف الفصل', variant: 'destructive' });
    }
  };

  const inputCls =
    'w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-[#C5A15B] transition-colors';
  const labelCls = 'block text-xs font-bold text-zinc-300 mb-1';

  return (
    <div className="space-y-6 font-arabic" dir="rtl">
      {/* ── Top Header & KPI Summary ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0A101D] border border-[#C5A15B]/30 p-5 rounded-3xl shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C5A15B]/20 text-[#E1C58B] text-xs font-bold border border-[#C5A15B]/40">
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span>منظومة سلاسل حكاياتي والمواسم (Hekayaty Series Platform)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">إدارة السلاسل، المواسم، والروايات المصورة</h2>
          <p className="text-xs text-zinc-400">
            بناء وتنسيق السلاسل الروائية والكوميكس بمواسم ومجلدات وفصول متسلسلة مع القارئ التفاعلي المتقدم.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'analytics'
                ? 'bg-[#087C7B] text-white border-[#087C7B]'
                : 'bg-zinc-900 text-zinc-300 border-zinc-700 hover:border-zinc-500'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>الإحصائيات</span>
          </button>

          <button
            onClick={handleOpenCreateSeries}
            className="px-5 py-2.5 rounded-xl bg-[#C5A15B] hover:bg-[#E5C77D] text-black text-xs font-black shadow-lg flex items-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>إنشاء سلسلة جديدة</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Strip */}
      {analytics && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-3.5 rounded-2xl bg-[#0F172A] border border-white/10 text-center">
            <span className="text-[11px] text-zinc-400 font-bold block">إجمالي السلاسل</span>
            <span className="text-xl font-black text-white">{analytics.total_series ?? 0}</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#0F172A] border border-white/10 text-center">
            <span className="text-[11px] text-zinc-400 font-bold block">المواسم والمجلدات</span>
            <span className="text-xl font-black text-[#E1C58B]">{analytics.total_seasons ?? 0}</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#0F172A] border border-white/10 text-center">
            <span className="text-[11px] text-zinc-400 font-bold block">الفصول والأعداد</span>
            <span className="text-xl font-black text-teal-400">{analytics.total_episodes ?? 0}</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#0F172A] border border-white/10 text-center">
            <span className="text-[11px] text-zinc-400 font-bold block">المشاهدات والقراءات</span>
            <span className="text-xl font-black text-blue-400">{(analytics.total_views ?? 0).toLocaleString()}</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#0F172A] border border-white/10 text-center">
            <span className="text-[11px] text-zinc-400 font-bold block">المتابعون للسلاسل</span>
            <span className="text-xl font-black text-amber-400">{(analytics.total_followers ?? 0).toLocaleString()}</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#0F172A] border border-white/10 text-center">
            <span className="text-[11px] text-zinc-400 font-bold block">القراء النشطون</span>
            <span className="text-xl font-black text-emerald-400">~{analytics.active_readers_metric ?? 0}</span>
          </div>
        </div>
      )}

      {/* ── Content Tabs: Catalog View vs Detail View ─────────────────────── */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
        <button
          onClick={() => {
            setActiveTab('catalog');
            setSelectedSeries(null);
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'catalog' && !selectedSeries
              ? 'bg-[#C5A15B] text-black shadow-md'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          فهرس جميع السلاسل ({seriesList.length})
        </button>

        {selectedSeries && (
          <button
            onClick={() => setActiveTab('episodes')}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-[#087C7B] text-white shadow-md flex items-center gap-1.5"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>إدارة شجرة المحتوى: {selectedSeries.title_ar}</span>
          </button>
        )}
      </div>

      {/* ── TAB 1: CATALOG OF ALL SERIES ─────────────────────────────────── */}
      {activeTab === 'catalog' && !selectedSeries && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-wrap items-center gap-3 p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="البحث في السلاسل بالعنوان..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pr-10 pl-4 py-2 rounded-xl bg-black/60 border border-zinc-700 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#C5A15B]"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-400 font-bold">النوع:</span>
              <select
                value={formatFilter}
                onChange={(e) => setFormatFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-black/60 border border-zinc-700 text-xs text-zinc-300"
              >
                <option value="all">جميع الأنواع</option>
                <option value="novel">روايات (Novel Series)</option>
                <option value="comic">كوميكس (Comic Series)</option>
                <option value="hybrid">هجين روايات وكوميكس (Hybrid)</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-400 font-bold">الحالة:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-black/60 border border-zinc-700 text-xs text-zinc-300"
              >
                <option value="all">جميع الحالات</option>
                <option value="ongoing">مستمرة (Ongoing)</option>
                <option value="completed">مكتملة (Completed)</option>
                <option value="upcoming">قادمة (Upcoming)</option>
                <option value="draft">مسودة (Draft)</option>
              </select>
            </div>
          </div>

          {/* Series Grid Cards */}
          {loading ? (
            <div className="py-20 flex justify-center">
              <div className="w-8 h-8 rounded-full border-4 border-[#C5A15B]/30 border-t-[#C5A15B] animate-spin" />
            </div>
          ) : filteredSeries.length === 0 ? (
            <div className="py-16 text-center text-zinc-500 bg-zinc-900/40 rounded-3xl border border-zinc-800">
              <Layers className="w-12 h-12 mx-auto mb-2 opacity-40 text-amber-400" />
              <p className="text-sm font-bold">لا توجد سلاسل مطابقة للبحث أو الفلتر.</p>
              <button onClick={handleOpenCreateSeries} className="mt-3 text-xs text-[#C5A15B] font-bold underline">
                إنشاء سلسلة جديدة الآن
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSeries.map((s) => (
                <div
                  key={s.id}
                  className="bg-[#0B1220] border border-zinc-800 rounded-3xl p-4 flex flex-col justify-between hover:border-[#C5A15B]/50 transition-all shadow-xl group"
                >
                  <div className="space-y-3">
                    <div className="relative h-40 rounded-2xl overflow-hidden">
                      <img src={s.cover_image_url} alt={s.title_ar} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                      <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            s.format === 'novel'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : s.format === 'comic'
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                              : 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                          }`}
                        >
                          {s.format === 'novel' ? 'روايات' : s.format === 'comic' ? 'كوميكس' : 'هجين'}
                        </span>

                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            s.status === 'ongoing'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : s.status === 'completed'
                              ? 'bg-blue-500/20 text-blue-400'
                              : 'bg-zinc-700/40 text-zinc-300'
                          }`}
                        >
                          {s.status === 'ongoing' ? 'مستمرة' : s.status === 'completed' ? 'مكتملة' : 'قادمة'}
                        </span>
                      </div>

                      {s.is_featured && (
                        <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-[#C5A15B] text-black text-[10px] font-black">
                          مميزة على الرئيسية ★
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="font-black text-white text-base line-clamp-1">{s.title_ar}</h3>
                      <p className="text-[11px] text-zinc-400 line-clamp-2 mt-1 leading-relaxed">
                        {s.short_description_ar || s.description_ar}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-zinc-400 border-t border-zinc-800/80 pt-2 font-mono">
                      <span>{s.seasons_count || 0} مواسم / مجلدات</span>
                      <span>•</span>
                      <span>{s.episodes_count || 0} فصول منشورة</span>
                      <span>•</span>
                      <span>{s.followers_count || 0} متابع</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-zinc-800 flex items-center justify-between gap-2 mt-3">
                    <button
                      onClick={() => {
                        setSelectedSeries(s);
                        setActiveTab('episodes');
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-[#087C7B] hover:bg-[#0AA3A2] text-white text-xs font-black shadow flex items-center gap-1.5"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>إدارة الفصول والمواسم</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <a
                        href={`/series/${s.slug || s.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs"
                        title="عرض الصفحة العامة"
                      >
                        <Eye className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => handleOpenEditSeries(s)}
                        className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-amber-300 text-xs"
                        title="تعديل السلسلة"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteSeries(s)}
                        className="p-1.5 rounded-lg bg-red-900/30 hover:bg-red-800/40 text-red-400 text-xs"
                        title="حذف السلسلة"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: SERIES CONTENT TREE & EPISODES MANAGER ───────────────── */}
      {selectedSeries && (
        <div className="space-y-6">
          {/* Active Series Banner */}
          <div className="p-5 rounded-3xl bg-[#0F172A] border border-[#C5A15B]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-4">
              <img
                src={selectedSeries.cover_image_url}
                alt={selectedSeries.title_ar}
                className="w-16 h-20 rounded-xl object-cover border border-white/20 shrink-0"
              />
              <div className="space-y-1">
                <span className="text-[10px] text-amber-400 font-bold uppercase">
                  {selectedSeries.format === 'novel' ? 'روايات متسلسلة' : selectedSeries.format === 'comic' ? 'كوميكس متسلسل' : 'هجين روائي وكوميكس'}
                </span>
                <h3 className="text-lg font-black text-white">{selectedSeries.title_ar}</h3>
                <p className="text-xs text-zinc-400 line-clamp-1">{selectedSeries.short_description_ar}</p>
                <div className="flex items-center gap-3 text-xs text-zinc-500 font-mono pt-1">
                  <span>جدول النشر: {selectedSeries.release_day_time || 'أسبوعي'}</span>
                  <span>•</span>
                  <span>المصطلح المعتمد: {selectedSeries.structure_label}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setShowSeasonModal(true)}
                className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold flex items-center gap-1.5 border border-zinc-700"
              >
                <Plus className="w-3.5 h-3.5 text-teal-400" />
                <span>إضافة {selectedSeries.structure_label || 'موسم'} جديد</span>
              </button>

              <button
                onClick={() => handleOpenCreateEpisode()}
                className="px-4 py-2 rounded-xl bg-[#C5A15B] hover:bg-[#E5C77D] text-black text-xs font-black shadow flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>نشر فصل / عدد جديد</span>
              </button>
            </div>
          </div>

          {/* Visual Content Tree: Seasons & Chapters */}
          <div className="space-y-4">
            <h4 className="text-base font-black text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#C5A15B]" />
              <span>هيكل الفصول والمواسم المسجلة</span>
            </h4>

            {/* Check if seasons exist */}
            {selectedSeries.seasons && selectedSeries.seasons.length > 0 ? (
              <div className="space-y-4">
                {selectedSeries.seasons.map((sea: any) => {
                  const seasonEpisodes = (selectedSeries.episodes || []).filter(
                    (ep: any) => ep.season_id === sea.id
                  );

                  return (
                    <div
                      key={sea.id}
                      className="p-5 rounded-3xl bg-[#0B1220] border border-white/10 space-y-4 shadow-lg"
                    >
                      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                        <div className="flex items-center gap-3">
                          <span className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center justify-center font-black text-xs">
                            {sea.number}
                          </span>
                          <div>
                            <h5 className="font-extrabold text-white text-sm">{sea.title_ar}</h5>
                            <span className="text-[11px] text-zinc-500">
                              {seasonEpisodes.length} فصول منشورة في هذا {selectedSeries.structure_label}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenCreateEpisode(sea.id)}
                            className="px-3 py-1 rounded-lg bg-[#C5A15B]/20 hover:bg-[#C5A15B]/30 text-[#E1C58B] text-xs font-bold flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3" />
                            <span>إضافة فصل</span>
                          </button>
                          <button
                            onClick={() => handleDeleteSeason(sea.id)}
                            className="p-1 rounded-lg text-red-400 hover:bg-red-900/30 text-xs"
                            title="حذف الموسم"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Episode list inside season */}
                      {seasonEpisodes.length === 0 ? (
                        <p className="text-xs text-zinc-500 py-3 text-center">لا توجد فصول مضافة في هذا الموسم بعد.</p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {seasonEpisodes.map((ep: any) => (
                            <div
                              key={ep.id}
                              className="p-3 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-between gap-2 hover:border-[#C5A15B]/40 transition-all"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <span className="w-7 h-7 rounded-lg bg-black/60 text-[#E1C58B] border border-white/10 flex items-center justify-center font-bold text-xs shrink-0 font-mono">
                                  #{ep.episode_number}
                                </span>
                                <div className="min-w-0">
                                  <h6 className="font-bold text-xs text-white truncate">{ep.title_ar}</h6>
                                  <span className="text-[10px] text-zinc-500 font-mono">
                                    {ep.content_type === 'comic' ? '🖼️ كوميكس' : '📖 رواية'} • {ep.reading_time_minutes} د
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-1 shrink-0">
                                <a
                                  href={`/series/${selectedSeries.slug}/read/${ep.id}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="p-1 text-zinc-400 hover:text-white"
                                  title="قراءة في القارئ"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </a>
                                <button
                                  onClick={() => handleOpenEditEpisode(ep)}
                                  className="p-1 text-amber-300 hover:text-amber-200"
                                  title="تعديل"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteEpisode(ep.id)}
                                  className="p-1 text-red-400 hover:text-red-300"
                                  title="حذف"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : null}

            {/* Direct episodes not tied to a specific season */}
            {(() => {
              const directEps = (selectedSeries.episodes || []).filter((ep: any) => !ep.season_id);
              if (directEps.length === 0 && selectedSeries.seasons?.length > 0) return null;
              return (
                <div className="p-5 rounded-3xl bg-[#0B1220] border border-white/10 space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                    <h5 className="font-extrabold text-white text-sm">الفصول المباشرة ({directEps.length})</h5>
                    <button
                      onClick={() => handleOpenCreateEpisode()}
                      className="px-3 py-1 rounded-lg bg-[#C5A15B]/20 text-[#E1C58B] text-xs font-bold flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>إضافة فصل</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {directEps.map((ep: any) => (
                      <div
                        key={ep.id}
                        className="p-3 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="w-7 h-7 rounded-lg bg-black/60 text-[#E1C58B] border border-white/10 flex items-center justify-center font-bold text-xs shrink-0 font-mono">
                            #{ep.episode_number}
                          </span>
                          <div className="min-w-0">
                            <h6 className="font-bold text-xs text-white truncate">{ep.title_ar}</h6>
                            <span className="text-[10px] text-zinc-500 font-mono">
                              {ep.content_type === 'comic' ? '🖼️ كوميكس' : '📖 رواية'} • {ep.reading_time_minutes} د
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <a
                            href={`/series/${selectedSeries.slug}/read/${ep.id}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1 text-zinc-400 hover:text-white"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </a>
                          <button onClick={() => handleOpenEditEpisode(ep)} className="p-1 text-amber-300">
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDeleteEpisode(ep.id)} className="p-1 text-red-400">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* ── MODAL 1: MULTI-STEP SERIES BUILDER ──────────────────────────── */}
      {showSeriesModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0D1524] border border-[#C5A15B]/40 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl my-8">
            <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-[#162235]">
              <div className="flex items-center gap-3">
                <span className="text-xl">✨</span>
                <div>
                  <h3 className="font-black text-white text-base">
                    {editingSeriesId ? 'تعديل بيانات السلسلة' : 'منشئ السلاسل الاحترافي (Series Builder)'}
                  </h3>
                  <span className="text-[11px] text-zinc-400">
                    الخطوة {builderStep} من 3: {builderStep === 1 ? 'هوية السلسلة' : builderStep === 2 ? 'فريق العمل والملكية' : 'هيكل النشر والجدولة'}
                  </span>
                </div>
              </div>
              <button onClick={() => setShowSeriesModal(false)} className="text-zinc-400 hover:text-white text-lg">
                ✕
              </button>
            </div>

            {/* Stepper Tabs */}
            <div className="grid grid-cols-3 border-b border-zinc-800 text-xs font-bold text-center">
              <button
                type="button"
                onClick={() => setBuilderStep(1)}
                className={`py-3 ${builderStep === 1 ? 'bg-[#C5A15B] text-black font-black' : 'text-zinc-400 hover:bg-zinc-800'}`}
              >
                1. هوية السلسلة
              </button>
              <button
                type="button"
                onClick={() => setBuilderStep(2)}
                className={`py-3 ${builderStep === 2 ? 'bg-[#C5A15B] text-black font-black' : 'text-zinc-400 hover:bg-zinc-800'}`}
              >
                2. الملكية وفريق العمل
              </button>
              <button
                type="button"
                onClick={() => setBuilderStep(3)}
                className={`py-3 ${builderStep === 3 ? 'bg-[#C5A15B] text-black font-black' : 'text-zinc-400 hover:bg-zinc-800'}`}
              >
                3. الهيكل والجدولة
              </button>
            </div>

            <form onSubmit={handleSubmitSeries} className="p-6 space-y-4">
              {/* STEP 1: IDENTITY */}
              {builderStep === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>عنوان السلسلة بالعربية *</label>
                      <input
                        required
                        className={inputCls}
                        value={seriesForm.title_ar}
                        onChange={(e) => setSeriesForm((f) => ({ ...f, title_ar: e.target.value }))}
                        placeholder="مثال: ملحمة العابرين"
                      />
                    </div>
                    <div>
                      <label className={labelCls}>العنوان بالإنجليزية</label>
                      <input
                        className={inputCls}
                        value={seriesForm.title_en}
                        onChange={(e) => setSeriesForm((f) => ({ ...f, title_en: e.target.value }))}
                        placeholder="The Crossers"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className={labelCls}>صيغة السلسلة *</label>
                      <select
                        className={inputCls}
                        value={seriesForm.format}
                        onChange={(e) => setSeriesForm((f) => ({ ...f, format: e.target.value as any }))}
                      >
                        <option value="novel">📖 روايات متسلسلة (Novel Series)</option>
                        <option value="comic">🖼️ قصص مصورة (Comic Series)</option>
                        <option value="hybrid">✨ هجين روايات وكوميكس (Hybrid)</option>
                      </select>
                    </div>

                    <div>
                      <label className={labelCls}>حالة النشر</label>
                      <select
                        className={inputCls}
                        value={seriesForm.status}
                        onChange={(e) => setSeriesForm((f) => ({ ...f, status: e.target.value as any }))}
                      >
                        <option value="ongoing">🟢 مستمرة (Ongoing)</option>
                        <option value="upcoming">🟡 قادمة قريباً (Upcoming)</option>
                        <option value="completed">🔵 مكتملة (Completed)</option>
                        <option value="on_hiatus">⚪ متوقفة مؤقتاً (Hiatus)</option>
                        <option value="draft">📁 مسودة داخلية (Draft)</option>
                      </select>
                    </div>

                    <div>
                      <label className={labelCls}>الفئة العمرية</label>
                      <select
                        className={inputCls}
                        value={seriesForm.age_rating}
                        onChange={(e) => setSeriesForm((f) => ({ ...f, age_rating: e.target.value }))}
                      >
                        <option value="all">الجميع (All Ages)</option>
                        <option value="13+">+13 ناشئة</option>
                        <option value="16+">+16 شباب</option>
                        <option value="18+">+18 كبار</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className={labelCls}>الوصف الترويجي القصير *</label>
                    <textarea
                      rows={2}
                      required
                      className={inputCls}
                      value={seriesForm.short_description_ar}
                      onChange={(e) => setSeriesForm((f) => ({ ...f, short_description_ar: e.target.value }))}
                      placeholder="فقرة موجزة تظهر في بطاقة السلسلة وقائمة الاكتشاف..."
                    />
                  </div>

                  <div>
                    <label className={labelCls}>النبذة الكاملة والملحمة</label>
                    <textarea
                      rows={4}
                      className={inputCls}
                      value={seriesForm.description_ar}
                      onChange={(e) => setSeriesForm((f) => ({ ...f, description_ar: e.target.value }))}
                      placeholder="سرد قصة السلسلة وخلفيتها الدرامية..."
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <ImageUploadField
                      label="غلاف السلسلة الرئيسي (طولي)"
                      value={seriesForm.cover_image_url}
                      onChange={(url) => setSeriesForm((f) => ({ ...f, cover_image_url: url }))}
                      folder="series"
                      previewAspect="cover"
                    />
                    <ImageUploadField
                      label="بانر السلسلة العريض (عرضي)"
                      value={seriesForm.banner_image_url}
                      onChange={(url) => setSeriesForm((f) => ({ ...f, banner_image_url: url }))}
                      folder="series"
                      previewAspect="cover"
                    />
                  </div>
                </div>
              )}

              {/* STEP 2: OWNERSHIP & CREDITS */}
              {builderStep === 2 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>تصنيف الملكية *</label>
                      <select
                        className={inputCls}
                        value={seriesForm.classification}
                        onChange={(e) =>
                          setSeriesForm((f) => ({
                            ...f,
                            classification: e.target.value as any,
                            is_original: e.target.value === 'original',
                          }))
                        }
                      >
                        <option value="original">👑 إنتاج أصلي حصري (Hekayaty Original)</option>
                        <option value="selected">⭐ حكاياتي المختارة (Hekayaty Selected)</option>
                        <option value="licensed">📜 محتوى مرخص رسمياً (Licensed)</option>
                      </select>
                    </div>

                    <div>
                      <label className={labelCls}>دار النشر / الجهة الراعية</label>
                      <input
                        className={inputCls}
                        value={seriesForm.publisher_name}
                        onChange={(e) => setSeriesForm((f) => ({ ...f, publisher_name: e.target.value }))}
                        placeholder="دار حكاياتي للنشر الرقمي"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className={labelCls}>المؤلف / الكاتب</label>
                      <input
                        className={inputCls}
                        value={seriesForm.author_name}
                        onChange={(e) => setSeriesForm((f) => ({ ...f, author_name: e.target.value }))}
                        placeholder="اسم الكاتب"
                      />
                    </div>
                    <div>
                      <label className={labelCls}>الرسام / فنان الكوميكس</label>
                      <input
                        className={inputCls}
                        value={seriesForm.artist_name}
                        onChange={(e) => setSeriesForm((f) => ({ ...f, artist_name: e.target.value }))}
                        placeholder="اسم الرسام"
                      />
                    </div>
                    <div>
                      <label className={labelCls}>المحرر الأدبي</label>
                      <input
                        className={inputCls}
                        value={seriesForm.editor_name}
                        onChange={(e) => setSeriesForm((f) => ({ ...f, editor_name: e.target.value }))}
                        placeholder="اسم المحرر"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>النوع الأساسي (Genre)</label>
                      <input
                        className={inputCls}
                        value={seriesForm.genre}
                        onChange={(e) => setSeriesForm((f) => ({ ...f, genre: e.target.value }))}
                        placeholder="فانتازيا ملحمية"
                      />
                    </div>
                    <div>
                      <label className={labelCls}>التصنيفات الفرعية (مفصولة بفاصلة)</label>
                      <input
                        className={inputCls}
                        value={seriesForm.subgenres}
                        onChange={(e) => setSeriesForm((f) => ({ ...f, subgenres: e.target.value }))}
                        placeholder="مغامرات, أساطير, سحر"
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelCls}>الوسوم (Tags - مفصولة بفاصلة)</label>
                    <input
                      className={inputCls}
                      value={seriesForm.tags}
                      onChange={(e) => setSeriesForm((f) => ({ ...f, tags: e.target.value }))}
                      placeholder="أبطال, بوابات, سيوف, خيال علمي"
                    />
                  </div>
                </div>
              )}

              {/* STEP 3: STRUCTURE & SCHEDULING */}
              {builderStep === 3 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>هيكل تقسيم السلسلة</label>
                      <select
                        className={inputCls}
                        value={seriesForm.structure_type}
                        onChange={(e) => {
                          const val = e.target.value;
                          const label =
                            val === 'season_episode'
                              ? 'الموسم'
                              : val === 'volume_chapter'
                              ? 'المجلد'
                              : val === 'book_part'
                              ? 'الكتاب'
                              : 'الفصل';
                          setSeriesForm((f) => ({ ...f, structure_type: val as any, structure_label: label }));
                        }}
                      >
                        <option value="season_episode">سلسلة مقسمة لمواسم وفصول (Seasons & Episodes)</option>
                        <option value="volume_chapter">سلسلة مقسمة لمجلدات وفصول (Volumes & Chapters)</option>
                        <option value="book_part">سلسلة مقسمة لكتب وأجزاء (Books & Parts)</option>
                        <option value="direct_episodes">فصول وأعداد مباشرة بدون مواسم (Direct Episodes)</option>
                      </select>
                    </div>

                    <div>
                      <label className={labelCls}>تسمية التقسيم المعتمدة</label>
                      <input
                        className={inputCls}
                        value={seriesForm.structure_label}
                        onChange={(e) => setSeriesForm((f) => ({ ...f, structure_label: e.target.value }))}
                        placeholder="الموسم / المجلد / الجزء"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>نظام وجدول النشر المجدول</label>
                      <select
                        className={inputCls}
                        value={seriesForm.release_schedule}
                        onChange={(e) => setSeriesForm((f) => ({ ...f, release_schedule: e.target.value as any }))}
                      >
                        <option value="weekly">📅 نشر أسبوعي منتظم (Weekly)</option>
                        <option value="biweekly">📅 نشر كل أسبوعين (Bi-weekly)</option>
                        <option value="monthly">📅 نشر شهري (Monthly)</option>
                        <option value="immediate">⚡ نشر فوري عند الإضافة (Immediate)</option>
                        <option value="custom">⚙️ موعد مخصص (Custom)</option>
                      </select>
                    </div>

                    <div>
                      <label className={labelCls}>توقيت ويوم الصدور للمتابعين</label>
                      <input
                        className={inputCls}
                        value={seriesForm.release_day_time}
                        onChange={(e) => setSeriesForm((f) => ({ ...f, release_day_time: e.target.value }))}
                        placeholder="مثال: كل جمعة الساعة 8 مساءً"
                      />
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-white">
                      <input
                        type="checkbox"
                        checked={seriesForm.is_featured}
                        onChange={(e) => setSeriesForm((f) => ({ ...f, is_featured: e.target.checked }))}
                        className="rounded"
                      />
                      <span>عرض في بانر السلاسل المميزة على الرئيسية</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Stepper Navigation Buttons */}
              <div className="pt-4 border-t border-zinc-800 flex items-center justify-between">
                <div>
                  {builderStep > 1 && (
                    <button
                      type="button"
                      onClick={() => setBuilderStep((s) => (s - 1) as any)}
                      className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-bold"
                    >
                      ← الخطوة السابقة
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {builderStep < 3 ? (
                    <button
                      type="button"
                      onClick={() => setBuilderStep((s) => (s + 1) as any)}
                      className="px-5 py-2.5 rounded-xl bg-[#C5A15B] text-black text-xs font-black"
                    >
                      متابعة للخطوة التالية →
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-6 py-2.5 rounded-xl bg-[#C5A15B] hover:bg-[#E5C77D] text-black text-xs font-black shadow-lg disabled:opacity-50"
                    >
                      {submitting ? 'جاري الحفظ...' : editingSeriesId ? 'تحديث السلسلة' : 'حفظ ونشر السلسلة'}
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 2: ADD SEASON / VOLUME ────────────────────────────────── */}
      {showSeasonModal && selectedSeries && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0D1524] border border-[#C5A15B]/40 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-[#162235]">
              <h3 className="font-bold text-white text-sm">
                إضافة {selectedSeries.structure_label || 'موسم'} جديد في "{selectedSeries.title_ar}"
              </h3>
              <button onClick={() => setShowSeasonModal(false)} className="text-zinc-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSubmitSeason} className="p-6 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className={labelCls}>رقم {selectedSeries.structure_label} *</label>
                  <input
                    type="number"
                    min={1}
                    required
                    className={inputCls}
                    value={seasonForm.number}
                    onChange={(e) => setSeasonForm((f) => ({ ...f, number: Number(e.target.value) }))}
                  />
                </div>
                <div className="col-span-2">
                  <label className={labelCls}>عنوان {selectedSeries.structure_label} بالعربية *</label>
                  <input
                    required
                    className={inputCls}
                    value={seasonForm.title_ar}
                    onChange={(e) => setSeasonForm((f) => ({ ...f, title_ar: e.target.value }))}
                    placeholder={`مثال: ${selectedSeries.structure_label} الأول: نداء الصدع`}
                  />
                </div>
              </div>

              <div>
                <label className={labelCls}>وصف موجز للموسم</label>
                <textarea
                  rows={2}
                  className={inputCls}
                  value={seasonForm.description_ar}
                  onChange={(e) => setSeasonForm((f) => ({ ...f, description_ar: e.target.value }))}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSeasonModal(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-[#C5A15B] text-black text-xs font-black shadow"
                >
                  {submitting ? 'جاري الحفظ...' : 'حفظ الموسم'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 3: ADD / EDIT EPISODE OR CHAPTER ───────────────────────── */}
      {showEpisodeModal && selectedSeries && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0D1524] border border-[#C5A15B]/40 rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl my-8">
            <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-[#162235]">
              <div className="flex items-center gap-2">
                <span className="text-xl">📖</span>
                <h3 className="font-bold text-white text-sm">
                  {editingEpisodeId ? 'تعديل بيانات الفصل / الحلقة' : 'نشر فصل أو حلقة جديدة'} — {selectedSeries.title_ar}
                </h3>
              </div>
              <button onClick={() => setShowEpisodeModal(false)} className="text-zinc-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSubmitEpisode} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className={labelCls}>الموسم / المجلد</label>
                  <select
                    className={inputCls}
                    value={episodeForm.season_id}
                    onChange={(e) => setEpisodeForm((f) => ({ ...f, season_id: e.target.value }))}
                  >
                    <option value="">بدون موسم (مباشر)</option>
                    {(selectedSeries.seasons || []).map((sea: any) => (
                      <option key={sea.id} value={sea.id}>
                        {sea.title_ar}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelCls}>رقم الحلقة / الفصل *</label>
                  <input
                    type="number"
                    min={1}
                    required
                    className={inputCls}
                    value={episodeForm.episode_number}
                    onChange={(e) => setEpisodeForm((f) => ({ ...f, episode_number: Number(e.target.value) }))}
                  />
                </div>

                <div>
                  <label className={labelCls}>نوع المحتوى</label>
                  <select
                    className={inputCls}
                    value={episodeForm.content_type}
                    onChange={(e) => setEpisodeForm((f) => ({ ...f, content_type: e.target.value as any }))}
                  >
                    <option value="novel">📖 رواية نصية (Novel Chapter)</option>
                    <option value="comic">🖼️ قصة مصورة (Comic Issue)</option>
                  </select>
                </div>

                <div>
                  <label className={labelCls}>مستوى الوصول</label>
                  <select
                    className={inputCls}
                    value={episodeForm.access_level}
                    onChange={(e) => setEpisodeForm((f) => ({ ...f, access_level: e.target.value as any }))}
                  >
                    <option value="free">مجاني للجميع (Free)</option>
                    <option value="registered">للأعضاء المسجلين</option>
                    <option value="premium">اشتراك مميز (Premium)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={labelCls}>عنوان الفصل / الحلقة *</label>
                <input
                  required
                  className={inputCls}
                  value={episodeForm.title_ar}
                  onChange={(e) => setEpisodeForm((f) => ({ ...f, title_ar: e.target.value }))}
                  placeholder="مثال: الفصل الأول: حين ارتجف نسيج السماء"
                />
              </div>

              {/* Novel Editor Section */}
              {episodeForm.content_type === 'novel' ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className={labelCls}>نص الرواية وسرد أحداث الفصل *</label>
                    <span className="text-[11px] text-zinc-500 font-mono">
                      الكلمات: {episodeForm.content_ar ? episodeForm.content_ar.trim().split(/\s+/).length : 0} • مدة القراءة: ~{Math.max(1, Math.ceil((episodeForm.content_ar ? episodeForm.content_ar.trim().split(/\s+/).length : 0) / 160))} د
                    </span>
                  </div>
                  <textarea
                    rows={12}
                    required
                    className={inputCls}
                    value={episodeForm.content_ar}
                    onChange={(e) => {
                      const val = e.target.value;
                      const words = val.trim().split(/\s+/).length;
                      const mins = Math.max(1, Math.ceil(words / 160));
                      setEpisodeForm((f) => ({ ...f, content_ar: val, reading_time_minutes: mins }));
                    }}
                    placeholder="اكتب أو الصق نص الفصل الروائي هنا..."
                  />
                </div>
              ) : (
                /* Comic Section */
                <div className="space-y-3 p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
                  <label className={labelCls}>رابط ملف الـ PDF أو الصور المرفوعة للكوميكس</label>
                  <input
                    className={inputCls}
                    value={episodeForm.pdf_url}
                    onChange={(e) => setEpisodeForm((f) => ({ ...f, pdf_url: e.target.value }))}
                    placeholder="https://... /comic.pdf"
                  />
                  <p className="text-[11px] text-zinc-500">
                    يمكنك إدخال رابط ملف PDF مباشر للعدد أو رفع صفحات مصورة للعدد.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>ملاحظات المؤلف في نهاية الفصل</label>
                  <input
                    className={inputCls}
                    value={episodeForm.author_notes}
                    onChange={(e) => setEpisodeForm((f) => ({ ...f, author_notes: e.target.value }))}
                    placeholder="شكر خاص للقراء..."
                  />
                </div>

                <div>
                  <label className={labelCls}>حالة النشر والجدولة</label>
                  <select
                    className={inputCls}
                    value={episodeForm.status}
                    onChange={(e) => setEpisodeForm((f) => ({ ...f, status: e.target.value as any }))}
                  >
                    <option value="published">🟢 نشر فوري</option>
                    <option value="scheduled">🟡 جدولة موعد للنشر الآلي</option>
                    <option value="draft">⚪ حفظ كمسودة</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowEpisodeModal(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-[#C5A15B] text-black text-xs font-black shadow disabled:opacity-50"
                >
                  {submitting ? 'جاري الحفظ...' : editingEpisodeId ? 'تحديث الفصل' : 'نشر الفصل الآن'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
