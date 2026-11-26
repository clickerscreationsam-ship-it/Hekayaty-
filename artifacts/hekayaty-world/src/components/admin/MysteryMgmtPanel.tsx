import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { ImageUploadField } from '@/components/common/ImageUploadField';
import { Sparkles, Calendar, Clock, Eye, Heart, Plus, Edit, Trash2, BookOpen, Layers, CheckCircle } from 'lucide-react';

interface Props {
  toast: any;
}

export function MysteryMgmtPanel({ toast }: Props) {
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEpisode, setEditingEpisode] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleOpenInReader = (currentTitle: string, currentContent: string) => {
    try {
      localStorage.setItem('hekayaty_draft_mystery_title', currentTitle || '');
      localStorage.setItem('hekayaty_draft_mystery_content', currentContent || '');
      window.open('/reader?draft_mystery=1', '_blank');
      toast({
        title: '📖 تم فتح قارئ حكاياتي الذكي في نافذة جديدة',
        description: 'اكتب محتوى الحلقة بتنسيق القارئ الكامل ثم اضغط "حفظ واعتماد النص".',
      });
    } catch {}
  };

  const handleImportFromReader = () => {
    try {
      const exported = localStorage.getItem('hekayaty_reader_exported_text');
      if (exported && exported.trim()) {
        const words = exported.trim().split(/\s+/).length;
        const mins = Math.max(1, Math.ceil(words / 160));
        setForm((f) => ({
          ...f,
          content_ar: exported,
          reading_time_minutes: mins,
        }));
        toast({
          title: '✅ تم استيراد النص من قارئ حكاياتي بنجاح!',
          description: `تم إدراج ${words} كلمة وحساب مدة القراءة بـ ${mins} دقيقة تلقائياً.`,
        });
      } else {
        toast({
          title: 'لم يتم العثور على نص محفوظ من القارئ',
          description: 'اضغط على "الكتابة في القارئ" واكتب النص ثم اضغط "اعتماد النص للوحة النشر".',
          variant: 'destructive',
        });
      }
    } catch {}
  };

  const defaultForm = {
    title_ar: '',
    title_en: '',
    episode_number: 1,
    series_title_ar: 'لغز حكاياتي: أسرار المخطوطة الغارقة',
    series_title_en: 'Mystery of Hekayaty: Secrets of the Sunken Manuscript',
    short_description_ar: '',
    content_ar: '',
    cover_image_url: '',
    publication_date: new Date().toISOString().split('T')[0],
    status: 'published',
    reading_time_minutes: 3,
    author_name: 'هيئة التحرير وسرد الألغاز',
    clues: '',
  };

  const [form, setForm] = useState(defaultForm);

  const refreshEpisodes = () => {
    setLoading(true);
    api
      .adminListMysteryEpisodes()
      .then((data) => {
        setEpisodes(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    refreshEpisodes();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        clues: form.clues
          ? form.clues.split(',').map((c) => c.trim()).filter(Boolean)
          : [],
      };
      await api.adminCreateMysteryEpisode(payload);
      toast({ title: '✅ تم إنشاء ونشر حلقة اللغز اليومي بنجاح!' });
      setShowCreateModal(false);
      setForm(defaultForm);
      refreshEpisodes();
    } catch (err: any) {
      toast({ title: err.message || 'فشل في إنشاء الحلقة', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEdit = (ep: any) => {
    setEditingEpisode(ep);
    setForm({
      title_ar: ep.title_ar || '',
      title_en: ep.title_en || '',
      episode_number: ep.episode_number || 1,
      series_title_ar: ep.series_title_ar || 'لغز حكاياتي: أسرار المخطوطة الغارقة',
      series_title_en: ep.series_title_en || 'Mystery of Hekayaty',
      short_description_ar: ep.short_description_ar || '',
      content_ar: ep.content_ar || '',
      cover_image_url: ep.cover_image_url || '',
      publication_date: ep.publication_date ? ep.publication_date.split('T')[0] : '',
      status: ep.status || 'published',
      reading_time_minutes: ep.reading_time_minutes || 3,
      author_name: ep.author_name || 'هيئة التحرير وسرد الألغاز',
      clues: Array.isArray(ep.clues) ? ep.clues.join(', ') : '',
    });
    setShowEditModal(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEpisode) return;
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        clues: form.clues
          ? form.clues.split(',').map((c) => c.trim()).filter(Boolean)
          : [],
      };
      await api.adminUpdateMysteryEpisode(editingEpisode.id, payload);
      toast({ title: '✅ تم تحديث بيانات الحلقة بنجاح!' });
      setShowEditModal(false);
      setEditingEpisode(null);
      refreshEpisodes();
    } catch (err: any) {
      toast({ title: err.message || 'فشل في تعديل الحلقة', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (ep: any) => {
    const confirmDelete = window.confirm(`هل أنت متأكد من رغبتك في حذف ${ep.title_ar} نهائياً؟`);
    if (!confirmDelete) return;

    try {
      await api.adminDeleteMysteryEpisode(ep.id);
      toast({ title: '🗑️ تم حذف حلقة اللغز بنجاح!' });
      refreshEpisodes();
    } catch (err: any) {
      toast({ title: err.message || 'فشل في حذف الحلقة', variant: 'destructive' });
    }
  };

  const inputCls =
    'w-full bg-[#0B1320] border border-[#2B3B52] rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-[#C5A15B]';
  const labelCls = 'block text-zinc-300 text-sm mb-1.5 font-semibold';
  const modalCls =
    'fixed inset-0 z-[9999] bg-black/85 backdrop-blur-md overflow-y-auto p-4 flex items-center justify-center';
  const modalBoxCls =
    'bg-[#141E2E] border border-zinc-700/80 rounded-2xl max-w-2xl w-full shadow-[0_25px_80px_rgba(0,0,0,0.9)] flex flex-col max-h-[90vh] overflow-hidden my-auto';

  return (
    <div className="space-y-8 font-arabic" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#C5A15B] flex items-center gap-2">
            <span>🔍</span>
            <span>استوديو لغز حكاياتي اليومي (Daily Mystery)</span>
          </h2>
          <p className="text-zinc-400 text-sm mt-1">
            إدارة ونشر وجدولة حلقات اللغز اليومية المتسلسلة على الصفحة الرئيسية وصفحة الأرشيف.
          </p>
        </div>

        <button
          onClick={() => {
            const nextNum = episodes.length > 0 ? Math.max(...episodes.map((e) => Number(e.episode_number) || 0)) + 1 : 1;
            setForm({
              ...defaultForm,
              episode_number: nextNum,
              title_ar: `الحلقة ${nextNum}: `,
            });
            setShowCreateModal(true);
          }}
          className="px-5 py-2.5 bg-gradient-to-r from-[#C5A15B] to-[#E5C77D] text-black font-extrabold rounded-xl text-sm shadow-[0_0_20px_rgba(197,161,91,0.4)] hover:scale-105 transition-all flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>+ نشر حلقة لغز جديدة</span>
        </button>
      </div>

      {/* Episodes Grid Table */}
      <div className="bg-[#121A2A] border border-[#223048] rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <h3 className="font-extrabold text-base text-zinc-200">
            الحلقات المسجلة ({episodes.length})
          </h3>
          <button onClick={refreshEpisodes} className="text-xs text-[#087C7B] hover:underline">
            تحديث القائمة ⟳
          </button>
        </div>

        {loading ? (
          <div className="py-12 flex justify-center">
            <div className="w-8 h-8 rounded-full border-4 border-[#C5A15B]/30 border-t-[#C5A15B] animate-spin" />
          </div>
        ) : episodes.length === 0 ? (
          <div className="text-center py-12 text-zinc-500">
            <p className="text-4xl mb-2">🔍</p>
            <p>لا توجد حلقات مسجلة حتى الآن.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {episodes.map((ep) => (
              <div
                key={ep.id}
                className="bg-[#0B1220] border border-zinc-800 rounded-2xl p-4 space-y-3 hover:border-[#C5A15B]/40 transition-all flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="relative">
                    <img
                      src={ep.cover_image_url || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80'}
                      alt={ep.title_ar}
                      className="w-full h-36 object-cover rounded-xl"
                    />
                    <span className="absolute top-2 right-2 bg-black/70 backdrop-blur-md text-[#E1C58B] text-[10px] font-black px-2 py-0.5 rounded-md border border-white/10">
                      الحلقة #{ep.episode_number}
                    </span>
                    <span
                      className={`absolute bottom-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                        ep.status === 'published'
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                          : ep.status === 'scheduled'
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                          : 'bg-zinc-700/40 text-zinc-300 border-zinc-600'
                      }`}
                    >
                      {ep.status === 'published' ? 'منشور' : ep.status === 'scheduled' ? 'مجدول' : 'مسودة'}
                    </span>
                  </div>

                  <h4 className="font-bold text-white text-base line-clamp-1">{ep.title_ar}</h4>
                  <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                    {ep.short_description_ar || ep.content_ar}
                  </p>

                  <div className="flex items-center gap-3 text-[11px] text-zinc-500 pt-1 font-mono">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-400" />
                      <span>{ep.reading_time_minutes} دقائق</span>
                    </span>
                    {ep.publication_date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-[#087C7B]" />
                        <span>{new Date(ep.publication_date).toLocaleDateString('ar-EG')}</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-800 flex items-center justify-between gap-2">
                  <a
                    href={`/mystery/${ep.slug || ep.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#087C7B] hover:text-[#0AA3A2] font-semibold"
                  >
                    عرض الحلقة ↗
                  </a>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEdit(ep)}
                      className="px-2.5 py-1 rounded-lg bg-[#C5A15B]/15 hover:bg-[#C5A15B]/30 text-[#E1C58B] border border-[#C5A15B]/30 text-xs font-bold transition-all"
                    >
                      تعديل
                    </button>
                    <button
                      onClick={() => handleDelete(ep)}
                      className="px-2.5 py-1 rounded-lg bg-red-900/20 hover:bg-red-800/40 text-red-400 border border-red-500/30 text-xs font-bold transition-all"
                    >
                      حذف
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── CREATE EPISODE MODAL ── */}
      {showCreateModal && (
        <div className={modalCls}>
          <div className={modalBoxCls}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-[#162235] shrink-0">
              <h3 className="text-lg font-bold text-[#C5A15B] flex items-center gap-2">
                <span>🔍</span>
                <span>نشر حلقة لغز يومي جديدة</span>
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-zinc-400 hover:text-white text-xl leading-none"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreate} className="overflow-y-auto">
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className={labelCls}>عنوان الحلقة بالعربية *</label>
                  <input
                    required
                    className={inputCls}
                    value={form.title_ar}
                    onChange={(e) => setForm((f) => ({ ...f, title_ar: e.target.value }))}
                    placeholder="الحلقة الأولى: همسات من وراء المرآة العتيقة"
                  />
                </div>

                <div>
                  <label className={labelCls}>العنوان بالإنجليزية</label>
                  <input
                    className={inputCls}
                    value={form.title_en}
                    onChange={(e) => setForm((f) => ({ ...f, title_en: e.target.value }))}
                    dir="ltr"
                    placeholder="Episode 1: Whispers Behind the Mirror"
                  />
                </div>

                <div>
                  <label className={labelCls}>رقم الحلقة *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    className={inputCls}
                    value={form.episode_number}
                    onChange={(e) => setForm((f) => ({ ...f, episode_number: Number(e.target.value) }))}
                  />
                </div>

                <div>
                  <label className={labelCls}>حالة النشر والجدولة</label>
                  <select
                    className={inputCls}
                    value={form.status}
                    onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                  >
                    <option value="published">🟢 نشر فوري على الرئيسية والأرشيف</option>
                    <option value="scheduled">🟡 جدولة موعد للنشر الآلي (Scheduled)</option>
                    <option value="draft">⚪ حفظ كمسودة داخلية (Draft)</option>
                  </select>
                </div>

                <div>
                  <label className={labelCls}>تاريخ ووقت النشر</label>
                  <input
                    type="date"
                    className={inputCls}
                    value={form.publication_date}
                    onChange={(e) => setForm((f) => ({ ...f, publication_date: e.target.value }))}
                    dir="ltr"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className={labelCls}>الموجز والتشويقة (بدون حرق) *</label>
                  <textarea
                    rows={2}
                    required
                    className={inputCls}
                    value={form.short_description_ar}
                    onChange={(e) => setForm((f) => ({ ...f, short_description_ar: e.target.value }))}
                    placeholder="فقرة تشويقية تظهر في بطاقة البانر على الرئيسية تدفع القارئ لدخول الحلقة..."
                  />
                </div>

                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className={labelCls + ' mb-0'}>نص الرواية ومحتوى الحلقة الكامل *</label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const exportedText = typeof window !== 'undefined' ? localStorage.getItem('hekayaty_reader_exported_text') : null;
                          if (exportedText && exportedText.trim()) {
                            const words = exportedText.trim().split(/\s+/).length;
                            const mins = Math.max(1, Math.ceil(words / 160));
                            setForm((f) => ({ ...f, content_ar: exportedText, reading_time_minutes: mins }));
                            toast({ title: '✅ تم استيراد النص من القارئ الذكي!', description: `${words} كلمة — مدة قراءة ~${mins} دقيقة` });
                          } else {
                            toast({ title: 'لا يوجد نص محفوظ من القارئ', description: 'افتح القارئ الذكي، اكتب النص، ثم اضغط "اعتماد النص"', variant: 'destructive' });
                          }
                        }}
                        className="text-[11px] text-[#087C7B] hover:underline font-bold flex items-center gap-1"
                      >
                        ↓ استيراد من القارئ
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenInReader(form.title_ar, form.content_ar)}
                        className="text-[11px] text-[#C5A15B] hover:underline font-bold flex items-center gap-1"
                      >
                        📖 الكتابة في القارئ
                      </button>
                    </div>
                  </div>
                  <textarea
                    rows={8}
                    required
                    className={inputCls}
                    value={form.content_ar}
                    onChange={(e) => setForm((f) => ({ ...f, content_ar: e.target.value }))}
                    placeholder="اكتب سرد أحداث الحلقة، الحوارات، الألغاز، والقرائن المشوقة..."
                  />
                </div>

                <div>
                  <label className={labelCls}>مدة القراءة التقديرية (بالدقائق)</label>
                  <input
                    type="number"
                    min={1}
                    className={inputCls}
                    value={form.reading_time_minutes}
                    onChange={(e) => setForm((f) => ({ ...f, reading_time_minutes: Number(e.target.value) }))}
                  />
                </div>

                <div>
                  <label className={labelCls}>القرائن والمفاتيح (مفصولة بفاصلة)</label>
                  <input
                    className={inputCls}
                    value={form.clues}
                    onChange={(e) => setForm((f) => ({ ...f, clues: e.target.value }))}
                    placeholder="المرآة العتيقة, الريشة الزرقاء, المفتاح النحاسي"
                  />
                </div>

                <div className="sm:col-span-2">
                  <ImageUploadField
                    label="صورة غلاف الحلقة السينمائية (رفع من الجهاز)"
                    value={form.cover_image_url}
                    onChange={(url) => setForm((f) => ({ ...f, cover_image_url: url }))}
                    folder="mystery"
                    previewAspect="cover"
                  />
                </div>
              </div>

              <div className="px-6 py-4 border-t border-zinc-800 bg-[#162235] flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-semibold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-[#C5A15B] hover:bg-[#E5C77D] text-black text-sm font-extrabold shadow-lg disabled:opacity-50"
                >
                  {submitting ? '⏳ جاري الحفظ...' : '🚀 حفظ ونشر الحلقة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── EDIT EPISODE MODAL ── */}
      {showEditModal && (
        <div className={modalCls}>
          <div className={modalBoxCls}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-[#162235] shrink-0">
              <h3 className="text-lg font-bold text-[#C5A15B] flex items-center gap-2">
                <span>✏️</span>
                <span>تعديل حلقة اللغز: {editingEpisode?.title_ar}</span>
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-zinc-400 hover:text-white text-xl leading-none"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleUpdate} className="overflow-y-auto">
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className={labelCls}>عنوان الحلقة بالعربية *</label>
                  <input
                    required
                    className={inputCls}
                    value={form.title_ar}
                    onChange={(e) => setForm((f) => ({ ...f, title_ar: e.target.value }))}
                  />
                </div>

                <div>
                  <label className={labelCls}>العنوان بالإنجليزية</label>
                  <input
                    className={inputCls}
                    value={form.title_en}
                    onChange={(e) => setForm((f) => ({ ...f, title_en: e.target.value }))}
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className={labelCls}>رقم الحلقة *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    className={inputCls}
                    value={form.episode_number}
                    onChange={(e) => setForm((f) => ({ ...f, episode_number: Number(e.target.value) }))}
                  />
                </div>

                <div>
                  <label className={labelCls}>حالة النشر والجدولة</label>
                  <select
                    className={inputCls}
                    value={form.status}
                    onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                  >
                    <option value="published">🟢 منشور ومتاح للقراءة</option>
                    <option value="scheduled">🟡 مجدول للنشر التلقائي (Scheduled)</option>
                    <option value="draft">⚪ مسودة قيد التحضير (Draft)</option>
                  </select>
                </div>

                <div>
                  <label className={labelCls}>تاريخ ووقت النشر</label>
                  <input
                    type="date"
                    className={inputCls}
                    value={form.publication_date}
                    onChange={(e) => setForm((f) => ({ ...f, publication_date: e.target.value }))}
                    dir="ltr"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className={labelCls}>الموجز والتشويقة</label>
                  <textarea
                    rows={2}
                    className={inputCls}
                    value={form.short_description_ar}
                    onChange={(e) => setForm((f) => ({ ...f, short_description_ar: e.target.value }))}
                  />
                </div>

                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className={labelCls + ' mb-0'}>نص الرواية ومحتوى الحلقة الكامل *</label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleImportFromReader()}
                        className="text-[11px] text-[#087C7B] hover:underline font-bold"
                      >
                        ↓ استيراد من القارئ
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenInReader(form.title_ar, form.content_ar)}
                        className="text-[11px] text-[#C5A15B] hover:underline font-bold"
                      >
                        📖 الكتابة في القارئ
                      </button>
                    </div>
                  </div>
                  <textarea
                    rows={8}
                    required
                    className={inputCls}
                    value={form.content_ar}
                    onChange={(e) => setForm((f) => ({ ...f, content_ar: e.target.value }))}
                  />
                </div>

                <div>
                  <label className={labelCls}>مدة القراءة (بالدقائق)</label>
                  <input
                    type="number"
                    min={1}
                    className={inputCls}
                    value={form.reading_time_minutes}
                    onChange={(e) => setForm((f) => ({ ...f, reading_time_minutes: Number(e.target.value) }))}
                  />
                </div>

                <div>
                  <label className={labelCls}>القرائن والمفاتيح (مفصولة بفاصلة)</label>
                  <input
                    className={inputCls}
                    value={form.clues}
                    onChange={(e) => setForm((f) => ({ ...f, clues: e.target.value }))}
                  />
                </div>

                <div className="sm:col-span-2">
                  <ImageUploadField
                    label="صورة غلاف الحلقة السينمائية"
                    value={form.cover_image_url}
                    onChange={(url) => setForm((f) => ({ ...f, cover_image_url: url }))}
                    folder="mystery"
                    previewAspect="cover"
                  />
                </div>
              </div>

              <div className="px-6 py-4 border-t border-zinc-800 bg-[#162235] flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-semibold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-[#C5A15B] hover:bg-[#E5C77D] text-black text-sm font-extrabold shadow-lg disabled:opacity-50"
                >
                  {submitting ? '⏳ جاري الحفظ...' : '💾 حفظ التعديلات'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
