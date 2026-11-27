import React, { useState, useEffect } from 'react';
import { ModalPortal } from './ModalPortal';
import { ImageUploadField } from '@/components/common/ImageUploadField';
import {
  XCircle,
  BookOpen,
  Sparkles,
  Award,
  Clock,
  Layers,
  Save,
  CheckCircle2,
  Trash2,
  Globe,
  Upload,
  User,
  Shield,
  FileText,
  Eye,
  Tag,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { api } from '@/lib/api';

export interface EditPublicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  toast: any;
  publication: any | null; // story or comic object
  type: 'story' | 'comic';
}

const PRESET_GENRES = [
  'خيال وفانتازيا',
  'مغامرات وأساطير',
  'خيال علمي وسبرانية',
  'رعب وغموض ما ورائي',
  'ملحمي تاريخي',
  'أكشن وإثارة خارقة',
  'دراما وتشويق',
  'عوالم متوازية',
];

export function EditPublicationModal({
  isOpen,
  onClose,
  onSuccess,
  toast,
  publication,
  type,
}: EditPublicationModalProps) {
  if (!isOpen || !publication) return null;

  const isStory = type === 'story';

  // Form State
  const [formData, setFormData] = useState({
    titleAr: '',
    titleEn: '',
    slug: '',
    classification: 'original' as 'original' | 'hekayaty_selected' | 'official_collaboration',
    status: 'published' as 'published' | 'ready_to_publish' | 'in_progress' | 'draft',
    readTimeMinutes: 15,
    pageCount: 24,
    issueNumber: 1,
    coverImageUrl: '',
    synopsisAr: '',
    authorAr: '',
    artist: '',
    rightsHolder: 'مجموعة حكاياتي الإعلامية',
    genresAr: [] as string[],
    isFeatured: false,
    isFree: false,
    content: '',
  });

  const [saving, setSaving] = useState(false);
  const [newGenreInput, setNewGenreInput] = useState('');

  // Prepopulate form when publication prop changes
  useEffect(() => {
    if (publication) {
      const p = publication;
      const titleAr = p.title_ar || p.title || '';
      const titleEn = p.title_en || '';
      const slug = p.slug || p.id || '';
      const classification =
        p.classification === 'selected' || p.classification === 'hekayaty_selected'
          ? 'hekayaty_selected'
          : p.classification || 'original';
      const status = p.status || 'published';
      const readTimeMinutes = Number(p.read_time_minutes || p.reading_time_minutes || 15);
      const pageCount = Number(p.page_count || p.pages_count || 24);
      const issueNumber = Number(p.issue_number || 1);
      const coverImageUrl =
        p.cover_image_url || p.coverImage || p.imageUrl || p.image_url || '';
      const synopsisAr = p.synopsis_ar || p.synopsis || p.excerptAr || p.description || '';
      const authorAr = p.author_ar || p.author || p.writer || '';
      const artist = p.artist || '';
      const rightsHolder = p.rights_holder || p.rightsHolder || 'مجموعة حكاياتي الإعلامية';
      const genresAr = Array.isArray(p.genres_ar)
        ? p.genres_ar
        : Array.isArray(p.genres)
        ? p.genres
        : ['خيال وفانتازيا'];
      const isFeatured = !!(p.is_featured ?? p.isFeatured);
      const isFree = !!(p.is_free ?? p.isFree);
      const content = p.content || '';

      setFormData({
        titleAr,
        titleEn,
        slug,
        classification,
        status,
        readTimeMinutes,
        pageCount,
        issueNumber,
        coverImageUrl,
        synopsisAr,
        authorAr,
        artist,
        rightsHolder,
        genresAr,
        isFeatured,
        isFree,
        content,
      });
    }
  }, [publication, type]);

  const toggleGenre = (genre: string) => {
    setFormData((prev) => {
      const exists = prev.genresAr.includes(genre);
      return {
        ...prev,
        genresAr: exists ? prev.genresAr.filter((g) => g !== genre) : [...prev.genresAr, genre],
      };
    });
  };

  const handleAddCustomGenre = () => {
    const trimmed = newGenreInput.trim();
    if (trimmed && !formData.genresAr.includes(trimmed)) {
      setFormData((prev) => ({ ...prev, genresAr: [...prev.genresAr, trimmed] }));
      setNewGenreInput('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.titleAr.trim()) {
      toast({ title: 'خطأ', description: 'يرجى كتابة عنوان العمل بالعربية', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      if (isStory) {
        await api.updateAdminStory(publication.id, {
          titleAr: formData.titleAr.trim(),
          titleEn: formData.titleEn.trim(),
          slug: formData.slug.trim(),
          classification: formData.classification,
          status: formData.status,
          readTimeMinutes: Number(formData.readTimeMinutes),
          coverImageUrl: formData.coverImageUrl,
          synopsisAr: formData.synopsisAr,
          authorAr: formData.authorAr,
          rightsHolder: formData.rightsHolder,
          genresAr: formData.genresAr,
          isFeatured: formData.isFeatured,
          content: formData.content,
        });
      } else {
        await api.updateAdminComic(publication.id, {
          titleAr: formData.titleAr.trim(),
          titleEn: formData.titleEn.trim(),
          slug: formData.slug.trim(),
          classification: formData.classification,
          status: formData.status,
          issueNumber: Number(formData.issueNumber),
          pagesCount: Number(formData.pageCount),
          coverImageUrl: formData.coverImageUrl,
          synopsisAr: formData.synopsisAr,
          writer: formData.authorAr,
          artist: formData.artist,
          rightsHolder: formData.rightsHolder,
          genresAr: formData.genresAr,
          isFeatured: formData.isFeatured,
          isFree: formData.isFree,
        });
      }

      toast({
        title: '🎉 تم تحديث بيانات العمل بنجاح!',
        description: `تم حفظ جميع التعديلات على "${formData.titleAr}" وتحديث حالة النشر.`,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      toast({
        title: 'فشل حفظ التعديلات',
        description: err.message || 'حدث خطأ أثناء الاتصال بالخادم',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-md overflow-y-auto p-4 sm:p-6 flex items-center justify-center">
        <div className="bg-[#141E2E] border border-zinc-700/80 rounded-2xl max-w-3xl w-full shadow-[0_25px_80px_rgba(0,0,0,0.9)] border-[#087C7B]/50 flex flex-col max-h-[90vh] overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
          {/* Modal Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-[#162235] shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#087C7B]/20 border border-[#087C7B]/40 flex items-center justify-center text-[#087C7B]">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-white text-base">
                    تعديل بيانات {isStory ? 'الرواية / القصة' : 'القصة المصورة (الكوميكس)'}
                  </h3>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      formData.status === 'published'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {formData.status === 'published' ? 'منشور رسمياً' : 'مسودة'}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 font-mono mt-0.5">
                  ID: {publication.id} {formData.slug ? `• /${formData.slug}` : ''}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body Form */}
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
            <div className="p-6 space-y-6 overflow-y-auto text-xs text-right custom-scrollbar">
              {/* SECTION 1: Titles & Slug */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-[#C5A15B] flex items-center gap-2 border-b border-zinc-800/80 pb-2">
                  <Sparkles className="w-4 h-4" />
                  <span>البيانات الأساسية والعناوين</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-zinc-200 mb-1.5 font-semibold">
                      العنوان باللغة العربية *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.titleAr}
                      onChange={(e) => setFormData({ ...formData, titleAr: e.target.value })}
                      placeholder="عنوان العمل الأدبي بالعربية"
                      className="w-full bg-[#0B1320] border border-[#2B3B52] rounded-xl px-3.5 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-[#087C7B]"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-200 mb-1.5 font-semibold">
                      العنوان بالإنجليزية (English Title)
                    </label>
                    <input
                      type="text"
                      value={formData.titleEn}
                      onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                      placeholder="Optional English Title"
                      className="w-full bg-[#0B1320] border border-[#2B3B52] rounded-xl px-3.5 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-[#087C7B]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-zinc-200 mb-1.5 font-semibold">
                      المعرف الدائم اللطيف (Slug)
                    </label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      placeholder="e.g. whispers-of-the-desert"
                      className="w-full bg-[#0B1320] border border-[#2B3B52] rounded-xl px-3.5 py-2.5 text-white font-mono placeholder-zinc-500 focus:outline-none focus:border-[#087C7B]"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-200 mb-1.5 font-semibold">
                      حالة النشر الرسمية (Publication Status)
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      className="w-full bg-[#0B1320] border border-[#2B3B52] rounded-xl px-3.5 py-2.5 text-white font-semibold focus:outline-none focus:border-[#087C7B]"
                    >
                      <option value="published">منشور رسمياً للجمهور (Published)</option>
                      <option value="ready_to_publish">جاهز للنشر المعتمد (Ready)</option>
                      <option value="in_progress">قيد التحرير والمراجعة (In Progress)</option>
                      <option value="draft">مسودة خاصة (Draft)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION 2: Classification */}
              <div className="p-4 rounded-xl bg-[#0B1320] border border-[#C5A15B]/40 space-y-3">
                <label className="text-[#C5A15B] font-bold text-xs flex items-center gap-1.5">
                  <Award className="w-4 h-4" />
                  <span>التصنيف المؤسسي الإلزامي للعمل</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, classification: 'original' })}
                    className={`text-right p-3 rounded-xl border transition-all flex items-start gap-3 ${
                      formData.classification === 'original'
                        ? 'bg-[#C5A15B]/15 border-[#C5A15B] text-white shadow-md'
                        : 'bg-[#141E2E] border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full mt-0.5 border flex items-center justify-center shrink-0 ${
                        formData.classification === 'original' ? 'border-[#C5A15B]' : 'border-zinc-600'
                      }`}
                    >
                      {formData.classification === 'original' && (
                        <div className="w-2 h-2 rounded-full bg-[#C5A15B]" />
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-white text-xs">حكاياتي الأصلية (ORIGINALS)</div>
                      <div className="text-[10px] text-[#C5A15B] font-mono mt-0.5">
                        إنتاج وتطوير استوديوهات حكاياتي الحصرية
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, classification: 'hekayaty_selected' })}
                    className={`text-right p-3 rounded-xl border transition-all flex items-start gap-3 ${
                      formData.classification === 'hekayaty_selected'
                        ? 'bg-[#087C7B]/20 border-[#087C7B] text-white shadow-md'
                        : 'bg-[#141E2E] border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full mt-0.5 border flex items-center justify-center shrink-0 ${
                        formData.classification === 'hekayaty_selected'
                          ? 'border-[#087C7B]'
                          : 'border-zinc-600'
                      }`}
                    >
                      {formData.classification === 'hekayaty_selected' && (
                        <div className="w-2 h-2 rounded-full bg-[#087C7B]" />
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-white text-xs">حكاياتي المختارة (SELECTED)</div>
                      <div className="text-[10px] text-teal-400 font-mono mt-0.5">
                        روائع مختارة تخضع لمعايير الجودة والتدقيق التحريري
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* SECTION 3: Cover Art */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-[#C5A15B] flex items-center gap-2 border-b border-zinc-800/80 pb-2">
                  <Layers className="w-4 h-4" />
                  <span>الغلاف والواجهة البصرية</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
                  <div className="sm:col-span-2 space-y-2">
                    <label className="block text-zinc-200 font-semibold">رابط صورة الغلاف</label>
                    <input
                      type="url"
                      value={formData.coverImageUrl}
                      onChange={(e) => setFormData({ ...formData, coverImageUrl: e.target.value })}
                      placeholder="https://images.unsplash.com/... أو مسار سحابي"
                      className="w-full bg-[#0B1320] border border-[#2B3B52] rounded-xl px-3.5 py-2.5 text-white placeholder-zinc-500 font-mono text-xs focus:outline-none focus:border-[#087C7B]"
                    />
                    <div className="pt-2">
                      <ImageUploadField
                        value={formData.coverImageUrl}
                        onChange={(url) => setFormData({ ...formData, coverImageUrl: url })}
                        label="رفع صورة غلاف جديدة سحابياً"
                        folder="covers"
                        previewAspect="portrait"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#0B1320] border border-zinc-800">
                    <span className="text-[10px] text-zinc-400 mb-2">معاينة الغلاف</span>
                    {formData.coverImageUrl ? (
                      <img
                        src={formData.coverImageUrl}
                        alt="Cover Preview"
                        className="w-24 h-36 object-cover rounded-xl border border-zinc-700 shadow-md"
                        onError={(e: any) => {
                          e.target.src =
                            'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80';
                        }}
                      />
                    ) : (
                      <div className="w-24 h-36 rounded-xl bg-zinc-800 border border-zinc-700 flex flex-col items-center justify-center text-zinc-500 text-[10px] text-center p-2">
                        <BookOpen className="w-6 h-6 mb-1 opacity-50" />
                        <span>لا يوجد غلاف</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* SECTION 4: Production & Reading Specs */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-[#C5A15B] flex items-center gap-2 border-b border-zinc-800/80 pb-2">
                  <Shield className="w-4 h-4" />
                  <span>المواصفات الإنتاجية وحقوق الملكية</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-zinc-200 mb-1.5 font-semibold">
                      {isStory ? 'اسم المؤلف / الكاتب' : 'الكاتب (Writer)'}
                    </label>
                    <input
                      type="text"
                      value={formData.authorAr}
                      onChange={(e) => setFormData({ ...formData, authorAr: e.target.value })}
                      placeholder="اسم الكاتب"
                      className="w-full bg-[#0B1320] border border-[#2B3B52] rounded-xl px-3.5 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-[#087C7B]"
                    />
                  </div>

                  {!isStory && (
                    <div>
                      <label className="block text-zinc-200 mb-1.5 font-semibold">
                        الرسام (Artist)
                      </label>
                      <input
                        type="text"
                        value={formData.artist}
                        onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
                        placeholder="اسم فنان الكوميكس"
                        className="w-full bg-[#0B1320] border border-[#2B3B52] rounded-xl px-3.5 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-[#087C7B]"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-zinc-200 mb-1.5 font-semibold">جهة الحقوق والملكية</label>
                    <input
                      type="text"
                      value={formData.rightsHolder}
                      onChange={(e) => setFormData({ ...formData, rightsHolder: e.target.value })}
                      placeholder="مجموعة حكاياتي الإعلامية"
                      className="w-full bg-[#0B1320] border border-[#2B3B52] rounded-xl px-3.5 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-[#087C7B]"
                    />
                  </div>

                  {isStory ? (
                    <div>
                      <label className="block text-zinc-200 mb-1.5 font-semibold">
                        زمن القراءة التقديري (بالدقائق)
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={formData.readTimeMinutes}
                        onChange={(e) =>
                          setFormData({ ...formData, readTimeMinutes: Number(e.target.value) })
                        }
                        className="w-full bg-[#0B1320] border border-[#2B3B52] rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-[#087C7B]"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-zinc-200 mb-1.5 font-semibold">
                        عدد الصفحات الإجمالي
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={formData.pageCount}
                        onChange={(e) =>
                          setFormData({ ...formData, pageCount: Number(e.target.value) })
                        }
                        className="w-full bg-[#0B1320] border border-[#2B3B52] rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-[#087C7B]"
                      />
                    </div>
                  )}
                </div>

                {/* Badges / Flags */}
                <div className="flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-zinc-300 hover:text-white">
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                      className="w-4 h-4 rounded border-zinc-700 text-[#087C7B] focus:ring-0"
                    />
                    <span className="font-semibold">تمييز العمل في الصفحة الرئيسية (Featured)</span>
                  </label>

                  {!isStory && (
                    <label className="flex items-center gap-2 cursor-pointer text-zinc-300 hover:text-white">
                      <input
                        type="checkbox"
                        checked={formData.isFree}
                        onChange={(e) => setFormData({ ...formData, isFree: e.target.checked })}
                        className="w-4 h-4 rounded border-zinc-700 text-amber-500 focus:ring-0"
                      />
                      <span className="font-semibold">متاح مجاناً للجميع بدون اشتراك (Free Issue)</span>
                    </label>
                  )}
                </div>
              </div>

              {/* SECTION 5: Genres */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-[#C5A15B] flex items-center gap-2 border-b border-zinc-800/80 pb-2">
                  <Tag className="w-4 h-4" />
                  <span>التصنيفات والأنواع الأدبية (Genres)</span>
                </h4>

                <div className="flex flex-wrap gap-2">
                  {PRESET_GENRES.map((g) => {
                    const selected = formData.genresAr.includes(g);
                    return (
                      <button
                        key={g}
                        type="button"
                        onClick={() => toggleGenre(g)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                          selected
                            ? 'bg-[#087C7B] text-white border-[#087C7B] shadow'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        {g} {selected && '✓'}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2 max-w-sm pt-1">
                  <input
                    type="text"
                    value={newGenreInput}
                    onChange={(e) => setNewGenreInput(e.target.value)}
                    placeholder="إضافة تصنيف مخصص..."
                    className="flex-1 bg-[#0B1320] border border-[#2B3B52] rounded-xl px-3 py-1.5 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-[#087C7B]"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomGenre();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomGenre}
                    className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs"
                  >
                    إضافة
                  </button>
                </div>
              </div>

              {/* SECTION 6: Synopsis & Excerpt */}
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-[#C5A15B] flex items-center gap-2 border-b border-zinc-800/80 pb-2">
                  <FileText className="w-4 h-4" />
                  <span>الملخص والمدخل السردي (Synopsis)</span>
                </h4>
                <textarea
                  rows={3}
                  value={formData.synopsisAr}
                  onChange={(e) => setFormData({ ...formData, synopsisAr: e.target.value })}
                  placeholder="نبذة تشويقية تظهر في بطاقة العمل وصفحة التفاصيل..."
                  className="w-full bg-[#0B1320] border border-[#2B3B52] rounded-xl px-3.5 py-2.5 text-white placeholder-zinc-500 leading-relaxed focus:outline-none focus:border-[#087C7B]"
                />
              </div>

              {/* SECTION 7: Novel Content / First Chapter (Only for stories) */}
              {isStory && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
                    <h4 className="text-sm font-bold text-[#C5A15B] flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      <span>نص العمل / الفصل الأساسي الكامل</span>
                    </h4>
                    <span className="text-[11px] text-zinc-400 font-mono">
                      {formData.content ? `${formData.content.split(/\s+/).filter(Boolean).length} كلمة` : '0 كلمة'}
                    </span>
                  </div>
                  <textarea
                    rows={8}
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="الصق أو عدل نص الرواية الكامل هنا..."
                    className="w-full bg-[#0B1320] border border-[#2B3B52] rounded-xl px-3.5 py-2.5 text-white font-arabic leading-relaxed placeholder-zinc-500 focus:outline-none focus:border-[#087C7B]"
                  />
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-zinc-800 bg-[#162235] flex items-center justify-between shrink-0">
              <a
                href={isStory ? `/reader?storyId=${publication.id}` : `/reader?comicId=${publication.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#087C7B] hover:text-teal-300 flex items-center gap-1 font-semibold"
              >
                <span>معاينة في القارئ المباشر</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={saving}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold transition-colors"
                >
                  إلغاء
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-[#087C7B] to-[#066160] hover:brightness-110 text-white text-xs font-bold shadow-lg shadow-[#087C7B]/20 flex items-center gap-2 transition-all"
                >
                  {saving ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>جارٍ الحفظ...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>حفظ التعديلات على العمل</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </ModalPortal>
  );
}
