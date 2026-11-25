import React, { useState, useEffect } from 'react';
import { ModalPortal } from './ModalPortal';
import {
  XCircle,
  Upload,
  Plus,
  Trash2,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Layers,
  Eye,
  RotateCw,
  SlidersHorizontal,
  Compass,
  ExternalLink,
} from 'lucide-react';
import { api } from '@/lib/api';

interface ComicPagesStudioProps {
  comicId: string;
  comicTitle: string;
  isOpen: boolean;
  onClose: () => void;
  toast: any;
  onSuccess?: () => void;
}

export function ComicPagesStudioModal({
  comicId,
  comicTitle,
  isOpen,
  onClose,
  toast,
  onSuccess,
}: ComicPagesStudioProps) {
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [isAdding, setIsAdding] = useState(false);
  const [isReordering, setIsReordering] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  // Comic Direction & Spread Preferences
  const [readingDirection, setReadingDirection] = useState<'rtl' | 'ltr'>('rtl');
  const [spreadMode, setSpreadMode] = useState<'single' | 'double'>('single');

  // Single page form
  const [newPage, setNewPage] = useState({
    page_number: 1,
    image_url: '',
    is_preview: false,
    description_ar: '',
  });

  const loadPages = async () => {
    if (!comicId) return;
    setLoading(true);
    try {
      const res = await api.getAdminComicPages(comicId);
      setPages(res || []);
      setNewPage((prev) => ({
        ...prev,
        page_number: (res?.length || 0) + 1,
      }));
    } catch {
      toast({ title: 'تعذر تحميل صفحات الكوميكس', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && comicId) {
      loadPages();
    }
  }, [isOpen, comicId]);

  if (!isOpen) return null;

  // Single file upload
  const handleSingleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        const res = await api.uploadMedia(base64, 'comic_pages');
        if (res && res.url) {
          setNewPage((prev) => ({ ...prev, image_url: res.url }));
          toast({ title: '✅ تم رفع صفحة الكوميكس بنجاح' });
        } else {
          toast({ title: 'فشل الرفع', description: 'تعذر رفع الصفحة إلى السحابة', variant: 'destructive' });
        }
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      toast({ title: 'خطأ في الرفع', description: err.message, variant: 'destructive' });
      setIsUploading(false);
    }
  };

  // Bulk multiple pages upload
  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const fileList = Array.from(files);
    let uploadedCount = 0;
    const uploadedRows: any[] = [];

    try {
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        setUploadProgress(`جاري رفع الصفحة ${i + 1} من ${fileList.length}...`);

        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        const res = await api.uploadMedia(base64, 'comic_pages');
        if (res && res.url) {
          uploadedRows.push({
            page_number: pages.length + i + 1,
            image_url: res.url,
            is_preview: pages.length + i === 0, // 1st page preview by default
          });
          uploadedCount++;
        }
      }

      if (uploadedRows.length > 0) {
        await api.createAdminComicPages(comicId, { pages: uploadedRows });
        toast({ title: `🎉 تم رفع وحفظ ${uploadedCount} صفحات دفعة واحدة بنجاح!` });
        loadPages();
        if (onSuccess) onSuccess();
      }
    } catch (err: any) {
      toast({ title: 'حدث خطأ أثناء الرفع الجماعي', description: err.message, variant: 'destructive' });
    } finally {
      setIsUploading(false);
      setUploadProgress('');
    }
  };

  // Add single page
  const handleAddPage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPage.image_url) {
      toast({ title: 'يرجى إرفاق رابط أو رفع صورة الصفحة', variant: 'destructive' });
      return;
    }
    setIsAdding(true);
    try {
      await api.createAdminComicPages(comicId, {
        pages: [
          {
            page_number: newPage.page_number,
            image_url: newPage.image_url,
            is_preview: newPage.is_preview,
          },
        ],
      });
      toast({ title: `✅ تمت إضافة الصفحة رقم ${newPage.page_number} بنجاح` });
      setNewPage({
        page_number: pages.length + 2,
        image_url: '',
        is_preview: false,
        description_ar: '',
      });
      loadPages();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      toast({ title: 'فشل حفظ الصفحة', description: err.message, variant: 'destructive' });
    } finally {
      setIsAdding(false);
    }
  };

  // Delete page
  const handleDeletePage = async (pageId: string, pageNum: number) => {
    if (!confirm(`هل أنت متأكد من حذف الصفحة رقم ${pageNum}؟`)) return;
    try {
      await api.deleteAdminComicPage(comicId, pageId);
      toast({ title: `تم حذف الصفحة ${pageNum}` });
      loadPages();
      if (onSuccess) onSuccess();
    } catch {
      toast({ title: 'فشل حذف الصفحة', variant: 'destructive' });
    }
  };

  // Move page up or down
  const handleMovePage = async (index: number, direction: 'prev' | 'next') => {
    const targetIdx = direction === 'prev' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= pages.length) return;

    const updated = [...pages];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;

    // Re-index page numbers
    const pageOrders = updated.map((p, idx) => ({
      id: p.id,
      page_number: idx + 1,
    }));

    setPages(updated.map((p, idx) => ({ ...p, page_number: idx + 1 })));
    setIsReordering(true);

    try {
      await api.reorderAdminComicPages(comicId, pageOrders);
      toast({ title: 'تم حفظ ترتيب الصفحات الجديد' });
      if (onSuccess) onSuccess();
    } catch {
      toast({ title: 'فشل حفظ الترتيب', variant: 'destructive' });
    } finally {
      setIsReordering(false);
    }
  };

  const handlePublish = async () => {
    if (!pages || pages.length === 0) {
      toast({ title: 'يرجى رفع صفحة واحدة على الأقل قبل النشر النهائي', variant: 'destructive' });
      return;
    }
    if (!confirm('هل أنت متأكد من اعتماد ونشر هذه القصة المصورة رسمياً وإتاحتها للجمهور؟')) return;

    setIsPublishing(true);
    try {
      await api.publishAdminPublication(comicId, 'comic');
      toast({ title: '🎉 تم اعتماد ونشر القصة المصورة رسمياً بنجاح!' });
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      toast({ title: 'فشل النشر', description: err.message, variant: 'destructive' });
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <ModalPortal>
      <div
        className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto font-arabic"
        dir="rtl"
      >
        <div className="bg-[#0F172A] border border-[#2E3C51] rounded-3xl max-w-5xl w-full shadow-[0_25px_80px_rgba(0,0,0,0.95)] border-[#087C7B]/40 flex flex-col max-h-[92vh] overflow-hidden my-auto">
          {/* Header */}
          <div className="px-6 py-4 bg-[#162238] border-b border-[#2E3C51] flex items-center justify-between shrink-0">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#087C7B] animate-pulse" />
                <h3 className="font-bold text-white text-base">استوديو إدارة صفحات الكوميكس والرسوم</h3>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                العمل: <span className="text-[#C5A15B] font-semibold">{comicTitle}</span> • إجمالي الصفحات: ({pages.length})
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* Reading Direction Selector */}
              <div className="hidden sm:flex items-center bg-[#10192A] border border-[#26354B] rounded-xl p-1 text-xs">
                <button
                  type="button"
                  onClick={() => setReadingDirection('rtl')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                    readingDirection === 'rtl' ? 'bg-[#087C7B] text-white' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <ArrowRight className="w-3 h-3" />
                  <span>يمين لليسار (RTL)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setReadingDirection('ltr')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                    readingDirection === 'ltr' ? 'bg-[#087C7B] text-white' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <ArrowLeft className="w-3 h-3" />
                  <span>يسار لليمين (LTR)</span>
                </button>
              </div>

              {/* Preview in Reader */}
              <a
                href={`/reader?comicId=${comicId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-xl bg-[#C5A15B]/20 hover:bg-[#C5A15B] text-antique-gold hover:text-midnight-navy font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
                title="معاينة صفحات الكوميكس في القارئ التفاعلي"
              >
                <Eye className="w-4 h-4" />
                <span>معاينة في القارئ</span>
              </a>

              {/* Open in Full Publishing Studio */}
              <a
                href={`/publishing-studio?comicId=${comicId}&tab=comics`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs flex items-center gap-1.5 transition-all"
                title="الانتقال إلى استوديو النشر الكامل"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">الاستوديو الكامل</span>
              </a>

              {/* Final Publish Button */}
              <button
                type="button"
                onClick={handlePublish}
                disabled={isPublishing || isUploading}
                className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#087C7B] to-[#0A9695] text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-[#087C7B]/25 hover:brightness-110 transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isPublishing ? 'جاري النشر...' : 'نشر العمل نهائياً (Publish)'}</span>
              </button>

              <button onClick={onClose} className="text-zinc-400 hover:text-white p-1 rounded-lg">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Quick Upload Action Bar */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              {/* Bulk upload dropzone */}
              <div className="md:col-span-6 p-4 rounded-2xl bg-[#141F33] border-2 border-dashed border-[#2B3B52] hover:border-[#087C7B] transition-colors flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#C5A15B]" />
                    <span>رفع صفحات متعددة دفعة واحدة (Bulk Upload)</span>
                  </h4>
                  <p className="text-[11px] text-zinc-400 mt-1">
                    {uploadProgress || 'اختر ملفات صور (JPEG, PNG, WebP) ليتم ترقيمها ورفعها تلقائياً'}
                  </p>
                </div>
                <label className="cursor-pointer px-4 py-2 rounded-xl bg-[#087C7B] hover:bg-[#066160] text-white text-xs font-bold flex items-center gap-1.5 shrink-0 shadow-md transition-all">
                  <Upload className="w-4 h-4" />
                  <span>{isUploading ? 'جاري الرفع...' : 'رفع دفعة'}</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    disabled={isUploading}
                    onChange={handleBulkUpload}
                  />
                </label>
              </div>

              {/* Add Single Page Form */}
              <form onSubmit={handleAddPage} className="md:col-span-6 p-4 rounded-2xl bg-[#141F33] border border-[#2B3B52] space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-zinc-300">
                  <span className="flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5 text-[#087C7B]" />
                    <span>إدراج صفحة مفردة برقم محدد</span>
                  </span>
                  <label className="cursor-pointer text-[10px] text-[#087C7B] hover:text-[#C5A15B] font-bold flex items-center gap-1">
                    <Upload className="w-3 h-3" />
                    <span>رفع ملف</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={isUploading}
                      onChange={handleSingleFileUpload}
                    />
                  </label>
                </div>

                <div className="grid grid-cols-12 gap-2">
                  <div className="col-span-3">
                    <input
                      type="number"
                      min={1}
                      required
                      value={newPage.page_number}
                      onChange={(e) => setNewPage({ ...newPage, page_number: parseInt(e.target.value) || 1 })}
                      className="w-full bg-[#0C1220] border border-[#2B3B52] rounded-xl px-2.5 py-1.5 text-white font-mono text-center text-xs outline-none"
                      placeholder="رقم"
                    />
                  </div>
                  <div className="col-span-6">
                    <input
                      type="url"
                      required
                      placeholder="رابط الصورة..."
                      value={newPage.image_url}
                      onChange={(e) => setNewPage({ ...newPage, image_url: e.target.value })}
                      className="w-full bg-[#0C1220] border border-[#2B3B52] rounded-xl px-3 py-1.5 text-white font-mono text-xs outline-none"
                    />
                  </div>
                  <div className="col-span-3">
                    <button
                      type="submit"
                      disabled={isAdding || isUploading}
                      className="w-full py-1.5 rounded-xl bg-gradient-to-r from-[#087C7B] to-[#0A9695] text-white text-xs font-bold flex items-center justify-center gap-1 shadow-md transition-all"
                    >
                      <Plus className="w-3 h-3" />
                      <span>{isAdding ? 'حفظ...' : 'إدراج'}</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Pages Grid with Thumbnails and Reorder Buttons */}
            <div>
              <div className="flex items-center justify-between mb-3 text-xs">
                <h4 className="font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#C5A15B]" />
                  <span>المتسلسلة البصرية للصفحات (مرتبة حسب تسلسل القراءة):</span>
                </h4>
                <div className="text-zinc-400 font-mono text-[11px] flex items-center gap-2">
                  {isReordering && <span className="text-teal-400 animate-pulse font-sans">جاري حفظ الترتيب...</span>}
                  <span>{pages.length} صفحات معتمدة</span>
                </div>
              </div>

              {loading ? (
                <div className="text-center py-12 text-zinc-500 text-xs">جاري تحميل الصفحات...</div>
              ) : pages.length === 0 ? (
                <div className="p-12 rounded-3xl bg-[#141F33]/50 border border-[#2B3B52] text-center text-zinc-500 text-xs">
                  لا توجد صفحات مضافة لهذا العمل حتى الآن. يمكنك سحب الصور ورفعها دفعة واحدة من المربع أعلاه.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {pages.map((p, idx) => (
                    <div
                      key={p.id}
                      className="group relative rounded-2xl overflow-hidden border border-[#28374D] bg-[#121B2B] aspect-[2/3] flex flex-col justify-between shadow-lg hover:border-[#087C7B] transition-all"
                    >
                      <img
                        src={p.image_url}
                        alt={`صفحة ${p.page_number}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/40 p-2 flex flex-col justify-between">
                        {/* Top: page badge & delete */}
                        <div className="flex justify-between items-center">
                          <span className="px-2 py-0.5 rounded-full bg-[#087C7B] text-white text-[10px] font-mono font-bold shadow">
                            ص {p.page_number}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDeletePage(p.id, p.page_number)}
                            className="p-1 rounded-lg bg-red-500/80 hover:bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                            title="حذف هذه الصفحة"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Bottom: Reorder controls */}
                        <div className="flex items-center justify-between pt-1">
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => handleMovePage(idx, 'prev')}
                              className="p-1 rounded-lg bg-black/75 hover:bg-[#087C7B] text-white text-[10px] disabled:opacity-30"
                              title="تقديم الصفحة"
                            >
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={idx === pages.length - 1}
                              onClick={() => handleMovePage(idx, 'next')}
                              className="p-1 rounded-lg bg-black/75 hover:bg-[#087C7B] text-white text-[10px] disabled:opacity-30"
                              title="تأخير الصفحة"
                            >
                              <ChevronLeft className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {p.is_preview && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-amber-500/90 text-black font-bold">
                              معاينة
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-[#162238] border-t border-[#2E3C51] flex justify-between items-center shrink-0">
            <div className="text-xs text-zinc-400">
              يمكنك معاينة تسلسل القراءة مباشرة داخل <span className="text-[#C5A15B] font-semibold">القارئ الرقمي</span>.
            </div>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold"
            >
              إغلاق الاستوديو
            </button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}
