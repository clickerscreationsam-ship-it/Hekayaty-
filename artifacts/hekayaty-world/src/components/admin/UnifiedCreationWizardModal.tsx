import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { ModalPortal } from './ModalPortal';
import { ImageUploadField } from '@/components/common/ImageUploadField';
import {
  XCircle,
  BookOpen,
  Sparkles,
  Award,
  Globe,
  Upload,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Layers,
  Users,
  Clock,
  Shield,
  FileText,
  File,
  Library,
  Feather,
  Bookmark,
  Building,
  Info,
} from 'lucide-react';
import { api } from '@/lib/api';

export type PublicationType =
  | 'novel'
  | 'book'
  | 'comic'
  | 'comic_series'
  | 'comic_episode'
  | 'story';

interface UnifiedCreationWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  toast: any;
  worlds: any[];
  characters: any[];
  seriesList: any[];
  creatorsDirectory: {
    registeredAccounts: any[];
    standaloneCreators: any[];
    allWriters: any[];
    allPublishingHouses: any[];
  };
  onOpenChaptersStudio?: (story: { id: string; title: string }) => void;
  onOpenComicPagesStudio?: (comic: { id: string; title: string }) => void;
}

export function UnifiedCreationWizardModal({
  isOpen,
  onClose,
  onSuccess,
  toast,
  worlds,
  characters,
  seriesList,
  creatorsDirectory,
  onOpenChaptersStudio,
  onOpenComicPagesStudio,
}: UnifiedCreationWizardProps) {
  const [, navigate] = useLocation();
  const [createdRecordId, setCreatedRecordId] = useState<string | null>(null);
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [publicationType, setPublicationType] = useState<PublicationType>('novel');
  const [creationMethod, setCreationMethod] = useState<'chapters' | 'pdf' | 'pages' | 'single_text'>('chapters');
  const [isUploading, setIsUploading] = useState(false);
  const [isPdfUploading, setIsPdfUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title_ar: '',
    title_en: '',
    subtitle_ar: '',
    slug: '',
    synopsis: '',
    content: '',
    pdf_url: '',
    pdf_file_name: '',
    cover_image_url: '',
    banner_image_url: '',
    classification: 'original' as 'original' | 'hekayaty_selected',
    status: 'published',
    is_featured: false,
    rights_holder: 'Hekayaty Media Group LLC',
    exclusivity_status: 'worldwide_exclusive',
    selected_writer_id: '',
    author_manual: '',
    selected_publisher_id: '',
    publisher_manual: '',
    illustrator: '',
    translator: '',
    editor: '',
    isbn: '',
    language: 'ar',
    age_recommendation: 'all',
    world_id: '',
    series_id: '',
    selected_character_ids: [] as string[],
    reading_time_minutes: 15,
    issue_number: 1,
    genres_ar: ['فنتازيا ملحمية', 'أساطير عربية'] as string[],
  });

  if (!isOpen) return null;

  // Auto-slug generator
  const handleTitleChange = (val: string) => {
    setFormData((prev) => ({
      ...prev,
      title_ar: val,
      slug: prev.slug ? prev.slug : val.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^\w\u0621-\u064A-]/g, ''),
    }));
  };

  // Upload Cover Image via Cloudinary with automatic client-side compression
  const compressImageFile = (file: File, maxWidth = 1920, maxHeight = 1920, quality = 0.85): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (readerEvent) => {
        const image = new Image();
        image.onload = () => {
          let { width, height } = image;
          if (width > maxWidth || height > maxHeight) {
            if (width > height) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(readerEvent.target?.result as string);
            return;
          }
          ctx.drawImage(image, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        image.onerror = () => resolve(readerEvent.target?.result as string);
        image.src = readerEvent.target?.result as string;
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const base64 = await compressImageFile(file);
      const res = await api.uploadMedia(base64, 'covers');
      if (res && res.url) {
        setFormData((prev) => ({ ...prev, cover_image_url: res.url }));
        toast({ title: '✅ تم رفع صورة الغلاف بنجاح' });
      } else {
        toast({ title: 'فشل الرفع', description: 'تعذر رفع الصورة السحابية', variant: 'destructive' });
      }
    } catch (err: any) {
      toast({ title: 'خطأ في الرفع', description: err.message, variant: 'destructive' });
    } finally {
      setIsUploading(false);
    }
  };

  // Upload PDF Document via Cloudinary
  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      toast({ title: 'يرجى اختيار ملف PDF صالح', variant: 'destructive' });
      return;
    }
    setIsPdfUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        const res = await api.uploadMedia(base64, 'documents');
        if (res && res.url) {
          setFormData((prev) => ({ ...prev, pdf_url: res.url, pdf_file_name: file.name }));
          toast({ title: '📄 تم رفع ملف الـ PDF بنجاح وربطه بالعمل' });
        } else {
          toast({ title: 'فشل رفع المستند', variant: 'destructive' });
        }
        setIsPdfUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      toast({ title: 'خطأ في رفع الملف', description: err.message, variant: 'destructive' });
      setIsPdfUploading(false);
    }
  };

  const toggleCharacter = (charId: string) => {
    setFormData((prev) => {
      const exists = prev.selected_character_ids.includes(charId);
      return {
        ...prev,
        selected_character_ids: exists
          ? prev.selected_character_ids.filter((id) => id !== charId)
          : [...prev.selected_character_ids, charId],
      };
    });
  };

  const handleSubmit = async () => {
    const isComicType = publicationType === 'comic' || publicationType === 'comic_episode';
    const isSeriesType = publicationType === 'comic_series';
    const effectiveTitle = formData.title_ar.trim() || (isComicType ? 'عمل مصور جديد' : 'رواية أدبية جديدة');

    setIsSubmitting(true);
    try {
      if (isSeriesType) {
        let seriesId = createdRecordId;
        if (seriesId) {
          await api.updateAdminSeries(seriesId, {
            title_ar: effectiveTitle,
            title_en: formData.title_en || effectiveTitle,
            description_ar: formData.synopsis,
            world_id: formData.world_id || null,
            cover_image_url: formData.cover_image_url,
            classification: formData.classification,
          });
        } else {
          const res = await api.createAdminSeries({
            title_ar: effectiveTitle,
            title_en: formData.title_en || effectiveTitle,
            description_ar: formData.synopsis,
            world_id: formData.world_id || null,
            cover_image_url: formData.cover_image_url,
            classification: formData.classification,
            status: 'ongoing',
          });
          seriesId = res?.id || res?.series?.id;
          if (seriesId) setCreatedRecordId(seriesId);
        }
        toast({ title: '✨ تم حفظ مسودة السلسلة المصورة بنجاح!' });
        if (onSuccess) onSuccess();
        onClose();
        navigate('/publishing-studio?tab=comics');
      } else if (isComicType) {
        let comicId = createdRecordId;
        const selectedWriterObj = (creatorsDirectory?.allWriters || []).find((w: any) => w.id === formData.selected_writer_id);
        const resolvedWriter = formData.author_manual || selectedWriterObj?.name || selectedWriterObj?.display_name || 'حكاياتي';

        const comicPayload = {
          title: effectiveTitle,
          title_en: formData.title_en || effectiveTitle,
          slug: formData.slug || `comic-${Date.now()}`,
          synopsis: formData.synopsis,
          classification: formData.classification,
          status: 'draft', // Strictly draft until final publish inside content editor
          world_id: formData.world_id && formData.world_id.trim() ? formData.world_id.trim() : null,
          series_id: formData.series_id && formData.series_id.trim() ? formData.series_id.trim() : null,
          cover_image_url: formData.cover_image_url,
          is_featured: formData.is_featured,
          rights_holder: formData.rights_holder,
          exclusivity_status: formData.exclusivity_status,
          publisher_id: formData.selected_publisher_id && formData.selected_publisher_id.trim() ? formData.selected_publisher_id.trim() : null,
          character_ids: formData.selected_character_ids,
          genres_ar: formData.genres_ar,
          writer: resolvedWriter,
          artist: formData.illustrator || 'فريق رسامي حكاياتي',
        };

        if (comicId) {
          await api.updateAdminComic(comicId, comicPayload);
        } else {
          const createdComic = await api.createAdminComic(comicPayload);
          comicId = createdComic?.id;
          if (comicId) setCreatedRecordId(comicId);
        }

        toast({ title: '✨ تم حفظ المسودة بنجاح! جاري الانتقال لمحرر الصفحات...' });
        if (onSuccess) onSuccess();
        onClose();
        if (onOpenComicPagesStudio && comicId) {
          onOpenComicPagesStudio({ id: comicId, title: effectiveTitle });
        }
        navigate(`/publishing-studio?comicId=${comicId}&tab=comics`);
      } else {
        // Novel, Book, or Story with Chapters structure
        let storyId = createdRecordId;
        const initialChapters = [
          {
            id: `chap_${Date.now()}_1`,
            chapter_number: 1,
            title_ar: 'الفصل الأول: البدايات',
            title_en: 'Chapter 1: The Beginnings',
            subtitle: formData.subtitle_ar || '',
            content: formData.content || 'اكتب نص الفصل الأول هنا...',
            summary_ar: formData.synopsis || '',
            reading_time_minutes: formData.reading_time_minutes || 8,
            word_count: formData.content ? formData.content.trim().split(/\s+/).length : 50,
            status: 'draft',
            access_level: 'public',
            scheduled_at: null,
          },
        ];

        const structuredContent = JSON.stringify({
          type: publicationType,
          creation_method: creationMethod,
          pdf_url: formData.pdf_url || null,
          chapters: initialChapters,
          raw_text: creationMethod === 'single_text' ? formData.content : null,
          subtitle: formData.subtitle_ar,
          isbn: formData.isbn,
          language: formData.language,
          age_recommendation: formData.age_recommendation,
          illustrator: formData.illustrator,
          translator: formData.translator,
          editor: formData.editor,
        });

        const storyPayload = {
          title: effectiveTitle,
          title_en: formData.title_en || effectiveTitle,
          slug: formData.slug || `story-${Date.now()}`,
          synopsis: formData.synopsis,
          content: structuredContent,
          classification: formData.classification,
          status: 'draft', // Strictly draft until final publish inside content editor
          world_id: formData.world_id && formData.world_id.trim() ? formData.world_id.trim() : null,
          cover_image_url: formData.cover_image_url,
          reading_time_minutes: formData.reading_time_minutes || 8,
          is_featured: formData.is_featured,
          rights_holder: formData.rights_holder,
          exclusivity_status: formData.exclusivity_status,
          author_id: formData.selected_writer_id && formData.selected_writer_id.trim() ? formData.selected_writer_id.trim() : null,
          author_ar: formData.author_manual || 'فريق حكاياتي التحريري',
          publisher_id: formData.selected_publisher_id && formData.selected_publisher_id.trim() ? formData.selected_publisher_id.trim() : null,
          character_ids: formData.selected_character_ids,
          genres_ar: formData.genres_ar,
        };

        if (storyId) {
          await api.updateAdminStory(storyId, storyPayload);
        } else {
          const createdStory = await api.createAdminStory(storyPayload);
          storyId = createdStory?.id;
          if (storyId) setCreatedRecordId(storyId);
        }

        toast({ title: '✨ تم حفظ المسودة بنجاح! جاري الانتقال لمحرر الفصول...' });
        if (onSuccess) onSuccess();
        onClose();
        if (onOpenChaptersStudio && storyId) {
          onOpenChaptersStudio({ id: storyId, title: effectiveTitle });
        }
        navigate(`/publishing-studio?storyId=${storyId}&tab=${creationMethod === 'pdf' ? 'pdf' : 'novels'}`);
      }
    } catch (err: any) {
      toast({ title: 'فشل حفظ المسودة', description: err.message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const publicationTypesConfig = [
    {
      id: 'novel',
      title: 'رواية أدبية (Novel)',
      desc: 'سرد ملحمي متعدد الفصول، قراءات عميقة، وشخصيات مترابطة',
      icon: BookOpen,
      color: 'border-[#087C7B] text-[#087C7B]',
    },
    {
      id: 'book',
      title: 'كتاب فكري / موسوعي (Book)',
      desc: 'كتب معرفية، أبحاث تاريخية، ووثائق الأكوان الكوزمية',
      icon: Library,
      color: 'border-[#C5A15B] text-[#C5A15B]',
    },
    {
      id: 'comic',
      title: 'قصة مصورة فردية (Comic)',
      desc: 'إصدار مصور متكامل مستقل، صفحات عالية الدقة، ورسوم فنية',
      icon: Feather,
      color: 'border-teal-400 text-teal-400',
    },
    {
      id: 'comic_series',
      title: 'سلسلة مصورة (Series)',
      desc: 'تأسيس سلسلة رسومية متعددة الأعداد والمجلدات المترابطة',
      icon: Layers,
      color: 'border-purple-400 text-purple-400',
    },
    {
      id: 'comic_episode',
      title: 'حلقة كوميكس (Episode)',
      desc: 'عدد جديد أو فصل يتم إلحاقه بسلسلة مصورة قائمة',
      icon: FileText,
      color: 'border-blue-400 text-blue-400',
    },
    {
      id: 'story',
      title: 'مروية / قصة قصيرة (Story)',
      desc: 'نصوص سردية موجزة، يوميات أبطال، ومقتطفات سريعة',
      icon: Bookmark,
      color: 'border-amber-400 text-amber-400',
    },
  ];

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto font-arabic" dir="rtl">
        <div className="bg-[#0F172A] border border-[#2E3C51] rounded-3xl max-w-4xl w-full shadow-[0_25px_80px_rgba(0,0,0,0.95)] border-[#087C7B]/40 flex flex-col max-h-[92vh] overflow-hidden my-auto">
          {/* Modal Header */}
          <div className="px-6 py-4 bg-[#162238] border-b border-[#2E3C51] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#087C7B] to-[#C5A15B] flex items-center justify-center text-white shadow-md">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">استوديو النشر والتوثيق الإبداعي الشامل</h3>
                <p className="text-xs text-zinc-400">إدراج وإدارة الروايات، الكتب، القصص المصورة، والسلاسل باحترافية تامة</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition-colors"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>

          {/* 4-Step Progress Indicator */}
          <div className="px-6 py-3 bg-[#111A2C] border-b border-[#233147] shrink-0">
            <div className="grid grid-cols-4 gap-2 text-xs">
              {[
                { num: 1, title: 'نوع العمل والمعلومات' },
                { num: 2, title: 'الملكية والمؤلفون' },
                { num: 3, title: 'الروابط الكونية' },
                { num: 4, title: 'طريقة الإنتاج والنشر' },
              ].map((s) => (
                <button
                  key={s.num}
                  type="button"
                  onClick={() => setStep(s.num as any)}
                  className={`flex items-center gap-2 p-2 rounded-xl transition-all text-right ${
                    step === s.num
                      ? 'bg-[#087C7B] text-white font-bold shadow-md'
                      : step > s.num
                      ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                      : 'bg-zinc-900/50 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      step === s.num
                        ? 'bg-white text-[#087C7B]'
                        : step > s.num
                        ? 'bg-emerald-400 text-black'
                        : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {step > s.num ? '✓' : s.num}
                  </span>
                  <span className="hidden sm:inline truncate">{s.title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Scrollable Form Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm text-zinc-200">
            {/* STEP 1: Choose Type & Basic Info */}
            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-2">نوع المطبوعة / العمل الإبداعي *</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {publicationTypesConfig.map((t) => {
                      const Icon = t.icon;
                      const isSelected = publicationType === t.id;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => {
                            setPublicationType(t.id as any);
                            if (t.id === 'comic' || t.id === 'comic_episode') setCreationMethod('pages');
                            else setCreationMethod('chapters');
                          }}
                          className={`p-3.5 rounded-2xl border text-right transition-all flex flex-col justify-between ${
                            isSelected
                              ? 'bg-[#087C7B]/20 border-[#087C7B] text-white shadow-lg'
                              : 'bg-[#152033] border-[#2E3C51] text-zinc-400 hover:border-zinc-500'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Icon className={`w-4 h-4 ${isSelected ? 'text-[#087C7B]' : 'text-zinc-400'}`} />
                            <span className="font-bold text-xs text-white">{t.title}</span>
                          </div>
                          <p className="text-[11px] text-zinc-400 mt-2 leading-relaxed">{t.desc}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Series selector if Episode */}
                {publicationType === 'comic_episode' && (
                  <div>
                    <label className="block text-xs font-bold text-zinc-300 mb-1.5">السلسلة المصورة التابعة لها *</label>
                    <select
                      value={formData.series_id}
                      onChange={(e) => setFormData({ ...formData, series_id: e.target.value })}
                      className="w-full bg-[#152033] border border-[#2E3C51] focus:border-[#087C7B] rounded-xl px-4 py-2.5 text-white outline-none"
                    >
                      <option value="">اختر السلسلة المصورة</option>
                      {seriesList.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.title_ar || s.title}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Titles Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-300 mb-1.5">عنوان العمل (بالعربية) *</label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: ملحمة الأفق الذهبي"
                      value={formData.title_ar}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      className="w-full bg-[#152033] border border-[#2E3C51] focus:border-[#087C7B] rounded-xl px-4 py-2.5 text-white placeholder-zinc-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-300 mb-1.5">Title (English)</label>
                    <input
                      type="text"
                      placeholder="e.g. Saga of the Golden Horizon"
                      value={formData.title_en}
                      onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                      className="w-full bg-[#152033] border border-[#2E3C51] focus:border-[#087C7B] rounded-xl px-4 py-2.5 text-white placeholder-zinc-500 outline-none font-sans"
                    />
                  </div>
                </div>

                {/* Subtitle & Slug */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-300 mb-1.5">العنوان الفرعي (Subtitle)</label>
                    <input
                      type="text"
                      placeholder="مثال: الجزء الأول — انبعاث الحراس"
                      value={formData.subtitle_ar}
                      onChange={(e) => setFormData({ ...formData, subtitle_ar: e.target.value })}
                      className="w-full bg-[#152033] border border-[#2E3C51] rounded-xl px-4 py-2.5 text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-300 mb-1.5">المعرف اللطيف (Slug) *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. golden-horizon-saga"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      className="w-full bg-[#152033] border border-[#2E3C51] rounded-xl px-4 py-2.5 text-white font-mono text-xs outline-none"
                    />
                  </div>
                </div>

                {/* Synopsis */}
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5">الملخص والمدخل السردي</label>
                  <textarea
                    rows={3}
                    placeholder="نبذة مشوقة عن العمل لجذب القراء واستكشاف الأبعاد..."
                    value={formData.synopsis}
                    onChange={(e) => setFormData({ ...formData, synopsis: e.target.value })}
                    className="w-full bg-[#152033] border border-[#2E3C51] rounded-xl px-4 py-2.5 text-white placeholder-zinc-500 outline-none leading-relaxed"
                  />
                </div>

                {/* Cover Image Upload */}
                <div className="p-4 rounded-2xl bg-[#131C2E] border border-[#233147]">
                  <ImageUploadField
                    label="صورة غلاف العمل"
                    value={formData.cover_image_url}
                    onChange={(url) => setFormData({ ...formData, cover_image_url: url })}
                    folder="covers"
                    previewAspect="portrait"
                  />
                </div>
              </div>
            )}

            {/* STEP 2: Authorship, Contributors & Ownership */}
            {step === 2 && (
              <div className="space-y-5">
                {/* Editorial Classification */}
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-2">التصنيف الإلزامي للعمل *</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, classification: 'original' })}
                      className={`p-4 rounded-2xl border text-right transition-all flex items-start gap-3 ${
                        formData.classification === 'original'
                          ? 'bg-[#C5A15B]/15 border-[#C5A15B] text-white shadow-lg'
                          : 'bg-[#152033] border-[#2E3C51] text-zinc-400'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-sm text-white">حكاياتي الأصلية (HEKAYATY ORIGINALS)</div>
                        <p className="text-xs text-zinc-400 mt-1">إنتاج حصري ومملوك بالكامل لمنظومة حكاياتي الإعلامية.</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, classification: 'hekayaty_selected' })}
                      className={`p-4 rounded-2xl border text-right transition-all flex items-start gap-3 ${
                        formData.classification === 'hekayaty_selected'
                          ? 'bg-[#087C7B]/20 border-[#087C7B] text-white shadow-lg'
                          : 'bg-[#152033] border-[#2E3C51] text-zinc-400'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-sm text-white">حكاياتي المختارة (HEKAYATY SELECTED)</div>
                        <p className="text-xs text-zinc-400 mt-1">أعمال منتقاة تحريرياً لدور نشر أو مؤلفين مستقلين.</p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Author Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-300 mb-1.5 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-[#C5A15B]" />
                      <span>ربط حساب مؤلف معتمد بالمنصة</span>
                    </label>
                    <select
                      value={formData.selected_writer_id}
                      onChange={(e) => setFormData({ ...formData, selected_writer_id: e.target.value })}
                      className="w-full bg-[#152033] border border-[#2E3C51] rounded-xl px-4 py-2.5 text-white outline-none"
                    >
                      <option value="">بدون ربط (أو إدخال اسم يدوي أدناه)</option>
                      {creatorsDirectory.allWriters?.map((w: any) => (
                        <option key={w.id} value={w.id}>
                          {w.displayName || w.name_ar || w.email}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-300 mb-1.5">اسم المؤلف (يدوي / خارجي)</label>
                    <input
                      type="text"
                      placeholder="مثال: د. أحمد خالد توفيق"
                      value={formData.author_manual}
                      onChange={(e) => setFormData({ ...formData, author_manual: e.target.value })}
                      className="w-full bg-[#152033] border border-[#2E3C51] rounded-xl px-4 py-2.5 text-white outline-none"
                    />
                  </div>
                </div>

                {/* Publisher Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-300 mb-1.5 flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-[#087C7B]" />
                      <span>ربط حساب دار النشر المعتمدة</span>
                    </label>
                    <select
                      value={formData.selected_publisher_id}
                      onChange={(e) => setFormData({ ...formData, selected_publisher_id: e.target.value })}
                      className="w-full bg-[#152033] border border-[#2E3C51] rounded-xl px-4 py-2.5 text-white outline-none"
                    >
                      <option value="">بدون ربط (أو إدخال اسم دار النشر أدناه)</option>
                      {creatorsDirectory.allPublishingHouses?.map((p: any) => (
                        <option key={p.id} value={p.id}>
                          {p.displayName || p.name_ar || p.email}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-300 mb-1.5">دار النشر (يدوي / خارجي)</label>
                    <input
                      type="text"
                      placeholder="مثال: دار نهضة مصر للنشر"
                      value={formData.publisher_manual}
                      onChange={(e) => setFormData({ ...formData, publisher_manual: e.target.value })}
                      className="w-full bg-[#152033] border border-[#2E3C51] rounded-xl px-4 py-2.5 text-white outline-none"
                    />
                  </div>
                </div>

                {/* Additional Contributors */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-300 mb-1.5">الرسام / فنان الأغلفة</label>
                    <input
                      type="text"
                      placeholder="اسم الرسام..."
                      value={formData.illustrator}
                      onChange={(e) => setFormData({ ...formData, illustrator: e.target.value })}
                      className="w-full bg-[#152033] border border-[#2E3C51] rounded-xl px-3 py-2 text-white text-xs outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-300 mb-1.5">المترجم (إن وجد)</label>
                    <input
                      type="text"
                      placeholder="اسم المترجم..."
                      value={formData.translator}
                      onChange={(e) => setFormData({ ...formData, translator: e.target.value })}
                      className="w-full bg-[#152033] border border-[#2E3C51] rounded-xl px-3 py-2 text-white text-xs outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-300 mb-1.5">المحرر الأدبي</label>
                    <input
                      type="text"
                      placeholder="اسم المحرر..."
                      value={formData.editor}
                      onChange={(e) => setFormData({ ...formData, editor: e.target.value })}
                      className="w-full bg-[#152033] border border-[#2E3C51] rounded-xl px-3 py-2 text-white text-xs outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Universe, World & Characters Association */}
            {step === 3 && (
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5 flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-[#087C7B]" />
                    <span>العالم الكوني المرتبط بالعمل</span>
                  </label>
                  <select
                    value={formData.world_id}
                    onChange={(e) => setFormData({ ...formData, world_id: e.target.value })}
                    className="w-full bg-[#152033] border border-[#2E3C51] rounded-xl px-4 py-2.5 text-white outline-none"
                  >
                    <option value="">بدون ربط بعالم محدد (عمل كوني مستقل)</option>
                    {worlds.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name || w.name_ar} ({w.alignment || 'محايد'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-2">الأبطال والشخصيات المشاركة في العمل</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-48 overflow-y-auto p-2 bg-[#121B2B] rounded-2xl border border-[#26354B]">
                    {characters.map((ch) => {
                      const isSelected = formData.selected_character_ids.includes(ch.id);
                      return (
                        <button
                          key={ch.id}
                          type="button"
                          onClick={() => toggleCharacter(ch.id)}
                          className={`p-2 rounded-xl border text-right transition-all flex items-center gap-2 ${
                            isSelected
                              ? 'bg-[#087C7B]/25 border-[#087C7B] text-white shadow-sm'
                              : 'bg-[#152033] border-[#2E3C51] text-zinc-400 hover:border-zinc-500'
                          }`}
                        >
                          <div
                            className={`w-3.5 h-3.5 rounded flex items-center justify-center shrink-0 border ${
                              isSelected ? 'bg-[#087C7B] border-[#087C7B] text-white' : 'border-zinc-600'
                            }`}
                          >
                            {isSelected && <span className="text-[10px]">✓</span>}
                          </div>
                          <span className="truncate text-xs font-medium">{ch.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <input
                    type="checkbox"
                    id="featured_check"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    className="w-4 h-4 rounded text-[#087C7B] focus:ring-0 bg-[#152033] border-zinc-600"
                  />
                  <label htmlFor="featured_check" className="text-xs text-zinc-300 font-semibold cursor-pointer">
                    تثبيت العمل كعمل مميز في واجهة المنصة الرئيسية (Featured Carousel)
                  </label>
                </div>
              </div>
            )}

            {/* STEP 4: Content Creation Method & Final Review */}
            {step === 4 && (
              <div className="space-y-6">
                {/* Title Quick Edit & Confirmation */}
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5">عنوان العمل الإبداعي *</label>
                  <input
                    type="text"
                    value={formData.title_ar}
                    onChange={(e) => setFormData({ ...formData, title_ar: e.target.value })}
                    placeholder={publicationType === 'comic' || publicationType === 'comic_episode' ? 'مثال: ملحمة حارس المجرة' : 'مثال: أساطير الرمال الذهبية'}
                    className="w-full bg-[#152033] border border-[#2E3C51] rounded-xl px-4 py-2.5 text-white outline-none focus:border-[#087C7B] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-2">طريقة إنتاج وقراءة المحتوى *</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {publicationType === 'comic' || publicationType === 'comic_episode' ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setCreationMethod('pages')}
                          className={`p-3.5 rounded-2xl border text-right transition-all flex items-center gap-3 ${
                            creationMethod === 'pages'
                              ? 'bg-[#087C7B]/20 border-[#087C7B] text-white shadow-lg'
                              : 'bg-[#152033] border-[#2E3C51] text-zinc-400'
                          }`}
                        >
                          <Layers className="w-5 h-5 text-[#087C7B]" />
                          <div>
                            <div className="font-bold text-sm text-white">رفع صفحات ورسوم الكوميكس (Comic Pages)</div>
                            <div className="text-[11px] text-zinc-400">رفع صور فردية أو جماعية، ترتيب الصفحات، واتجاه القراءة</div>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setCreationMethod('pdf')}
                          className={`p-3.5 rounded-2xl border text-right transition-all flex items-center gap-3 ${
                            creationMethod === 'pdf'
                              ? 'bg-[#C5A15B]/20 border-[#C5A15B] text-white shadow-lg'
                              : 'bg-[#152033] border-[#2E3C51] text-zinc-400'
                          }`}
                        >
                          <File className="w-5 h-5 text-[#C5A15B]" />
                          <div>
                            <div className="font-bold text-sm text-white">رفع ملف PDF رقمي كامل</div>
                            <div className="text-[11px] text-zinc-400">قراءة الكوميكس مباشرة عبر القارئ الذكي السحابي</div>
                          </div>
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => setCreationMethod('chapters')}
                          className={`p-3.5 rounded-2xl border text-right transition-all flex items-center gap-3 ${
                            creationMethod === 'chapters'
                              ? 'bg-[#087C7B]/20 border-[#087C7B] text-white shadow-lg'
                              : 'bg-[#152033] border-[#2E3C51] text-zinc-400'
                          }`}
                        >
                          <BookOpen className="w-5 h-5 text-[#087C7B]" />
                          <div>
                            <div className="font-bold text-sm text-white">إدارة وكتابة الفصول (Chapters)</div>
                            <div className="text-[11px] text-zinc-400">فصول متسلسلة، فهارس تفاعلية، وتحكم بالمشتركين</div>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setCreationMethod('pdf')}
                          className={`p-3.5 rounded-2xl border text-right transition-all flex items-center gap-3 ${
                            creationMethod === 'pdf'
                              ? 'bg-[#C5A15B]/20 border-[#C5A15B] text-white shadow-lg'
                              : 'bg-[#152033] border-[#2E3C51] text-zinc-400'
                          }`}
                        >
                          <File className="w-5 h-5 text-[#C5A15B]" />
                          <div>
                            <div className="font-bold text-sm text-white">رفع ملف PDF رقمي كامل</div>
                            <div className="text-[11px] text-zinc-400">قراءة المستند مباشرة عبر القارئ الذكي السحابي</div>
                          </div>
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Quick Chapter 1 Paste box if chapters selected */}
                {creationMethod === 'chapters' && (
                  <div className="p-4 rounded-2xl bg-[#141F33] border border-[#2B3B52] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-[#C5A15B]" />
                        <span>الفصل الأول: كتابة أو لصق النص السريع</span>
                      </span>
                      <span className="text-[11px] text-zinc-400 font-mono">
                        {formData.content ? `${formData.content.trim().split(/\s+/).length} كلمة` : '0 كلمة'}
                      </span>
                    </div>
                    <textarea
                      rows={4}
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      placeholder="الصق أو اكتب نص الفصل الأول هنا مباشرة (يمكنك كتابة وتعديل باقي الفصول لاحقاً)..."
                      className="w-full bg-[#0F172A] border border-[#23334A] rounded-xl p-3 text-xs text-white leading-relaxed outline-none focus:border-[#087C7B]"
                    />
                    <p className="text-[11px] text-[#C5A15B]">
                      ✨ فور الضغط على اعتماد العمل، سيتم فتح محرر الفصول المتكامل لإضافة فصول جديدة ومعاينتها بالقارئ.
                    </p>
                  </div>
                )}

                {/* PDF Upload option if selected */}
                {creationMethod === 'pdf' && (
                  <div className="p-4 rounded-2xl bg-[#141F33] border border-[#2B3B52] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <File className="w-4 h-4 text-[#C5A15B]" />
                        <span>مستند الـ PDF المرفق</span>
                      </span>
                      <label className="cursor-pointer px-3 py-1.5 rounded-lg bg-[#087C7B] text-white text-xs font-bold flex items-center gap-1">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{isPdfUploading ? 'جاري رفع PDF...' : 'اختيار ملف PDF'}</span>
                        <input type="file" accept=".pdf" className="hidden" disabled={isPdfUploading} onChange={handlePdfUpload} />
                      </label>
                    </div>
                    {formData.pdf_file_name && (
                      <div className="text-xs text-emerald-400 font-mono flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>تم ربط: {formData.pdf_file_name}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Status Selector */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-300 mb-1.5">حالة النشر</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full bg-[#152033] border border-[#2E3C51] rounded-xl px-4 py-2.5 text-white outline-none"
                    >
                      <option value="published">منشور فوراً (Published)</option>
                      <option value="draft">مسودة داخلية (Draft)</option>
                      <option value="pending_review">قيد المراجعة التحريرية (Pending Review)</option>
                      <option value="scheduled">مجدول للنشر لاحقاً (Scheduled)</option>
                    </select>
                  </div>
                </div>

                {/* Preview Card */}
                <div className="p-4 rounded-2xl bg-[#131C2E] border border-[#2E3C51] flex gap-4 items-center">
                  {formData.cover_image_url ? (
                    <img src={formData.cover_image_url} alt="" className="w-16 h-24 object-cover rounded-xl border border-zinc-700 shadow" />
                  ) : (
                    <div className="w-16 h-24 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-500 text-xs">بدون غلاف</div>
                  )}
                  <div className="space-y-1 text-xs">
                    <div className="font-bold text-white text-base">{formData.title_ar || 'عمل إبداعي جديد'}</div>
                    <div className="text-zinc-400 font-mono">{formData.slug}</div>
                    <div className="flex gap-2 pt-1">
                      <span className="px-2 py-0.5 rounded-full bg-[#087C7B]/20 text-teal-300 text-[10px] font-bold">
                        {publicationType}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                        {formData.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Footer */}
          <div className="px-6 py-4 bg-[#162238] border-t border-[#2E3C51] flex items-center justify-between shrink-0">
            <div>
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep((prev) => (prev - 1) as any)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                  <span>الخطوة السابقة</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold"
              >
                إلغاء
              </button>

              {step < 4 ? (
                <button
                  type="button"
                  onClick={() => setStep((prev) => (prev + 1) as any)}
                  className="px-5 py-2 rounded-xl bg-[#087C7B] hover:bg-[#066160] text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-[#087C7B]/25"
                >
                  <span>الخطوة التالية</span>
                  <ChevronLeft className="w-4 h-4" />
                </button>
              ) : (
                <div className="flex flex-col items-end gap-1">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleSubmit}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#087C7B] to-[#0A9695] text-white text-xs font-bold flex items-center gap-2 shadow-xl shadow-[#087C7B]/30 hover:brightness-110"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{isSubmitting ? 'جاري تجهيز مسودة العمل...' : 'الانتقال إلى محرر المحتوى ←'}</span>
                  </button>
                  <span className="text-[11px] text-zinc-400">
                    تم الانتهاء من البيانات الأساسية. الخطوة التالية هي إضافة محتوى العمل ومراجعته قبل نشره.
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}
