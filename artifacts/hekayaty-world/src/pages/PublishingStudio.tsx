import React, { useState, useEffect, useRef } from 'react';
import { useLocation, Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  FileText,
  Upload,
  Plus,
  Trash2,
  Copy,
  Save,
  CheckCircle2,
  Clock,
  Sparkles,
  Lock,
  Unlock,
  Eye,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Layers,
  ArrowRight,
  ArrowLeft,
  XCircle,
  AlertCircle,
  Bold,
  Italic,
  Underline,
  Quote,
  List,
  Divide,
  Image as ImageIcon,
  FileUp,
  ExternalLink,
  Library,
  BookMarked,
  LayoutGrid,
  Check,
  Send,
  PartyPopper,
  Compass,
  SlidersHorizontal,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export default function PublishingStudio() {
  const [location, navigate] = useLocation();
  const { toast } = useToast();

  // Search parameters for initial selection
  const searchParams = new URLSearchParams(window.location.search);
  const initialStoryId = searchParams.get('storyId');
  const initialComicId = searchParams.get('comicId');
  const initialTab = searchParams.get('tab') || (initialComicId ? 'comics' : 'novels');

  // Main Tab: 'novels' (Chapters & Text) | 'comics' (Pages & Artwork) | 'pdf' (Documents)
  const [activeTab, setActiveTab] = useState<'novels' | 'comics' | 'pdf'>(initialTab as any);

  // ─────────────────────────────────────────────────────────────
  // NOVELS & CHAPTERS STATE
  // ─────────────────────────────────────────────────────────────
  const [stories, setStories] = useState<any[]>([]);
  const [selectedStoryId, setSelectedStoryId] = useState<string | null>(initialStoryId);
  const [selectedStory, setSelectedStory] = useState<any | null>(null);
  const [storyTitle, setStoryTitle] = useState('');
  const [chapters, setChapters] = useState<any[]>([]);
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const [activeChapter, setActiveChapter] = useState<any | null>(null);
  const [isSavingChapters, setIsSavingChapters] = useState(false);
  const [isCreatingNewNovel, setIsCreatingNewNovel] = useState(false);
  const [newNovelTitle, setNewNovelTitle] = useState('');
  const [showPasteModal, setShowPasteModal] = useState(false);
  const [pastedText, setPastedText] = useState('');

  // ─────────────────────────────────────────────────────────────
  // COMICS & PAGES STATE
  // ─────────────────────────────────────────────────────────────
  const [comics, setComics] = useState<any[]>([]);
  const [selectedComicId, setSelectedComicId] = useState<string | null>(initialComicId);
  const [selectedComic, setSelectedComic] = useState<any | null>(null);
  const [comicTitle, setComicTitle] = useState('');
  const [comicPages, setComicPages] = useState<any[]>([]);
  const [isUploadingPages, setIsUploadingPages] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [readingDirection, setReadingDirection] = useState<'rtl' | 'ltr'>('rtl');
  const [isCreatingNewComic, setIsCreatingNewComic] = useState(false);
  const [newComicTitle, setNewComicTitle] = useState('');

  // ─────────────────────────────────────────────────────────────
  // PDF STATE
  // ─────────────────────────────────────────────────────────────
  const [pdfUrl, setPdfUrl] = useState('');
  const [pdfFileName, setPdfFileName] = useState('');
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);

  // ─────────────────────────────────────────────────────────────
  // PUBLISHING WORKFLOW & PANEL STATE
  // ─────────────────────────────────────────────────────────────
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [hasPreviewed, setHasPreviewed] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishedItem, setPublishedItem] = useState<{ id: string; title: string; type: 'story' | 'comic' } | null>(null);
  const [showPublishingDrawer, setShowPublishingDrawer] = useState(true);

  // Loading states
  const [loading, setLoading] = useState(true);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const bulkFileInputRef = useRef<HTMLInputElement>(null);

  // Fetch initial lists
  const fetchAllWorks = async () => {
    setLoading(true);
    try {
      const [storyList, comicList] = await Promise.all([
        api.getAdminStories().catch(() => []),
        api.getAdminComics().catch(() => []),
      ]);
      setStories(storyList || []);
      setComics(comicList || []);

      // If initial story requested, select it
      if (initialStoryId && storyList) {
        const found = storyList.find((s: any) => s.id === initialStoryId);
        if (found) {
          setSelectedStoryId(found.id);
          setSelectedStory(found);
          setStoryTitle(found.title_ar || found.title || '');
          loadStoryChapters(found.id);
        }
      } else if (storyList && storyList.length > 0 && !selectedStoryId) {
        setSelectedStoryId(storyList[0].id);
        setSelectedStory(storyList[0]);
        setStoryTitle(storyList[0].title_ar || storyList[0].title || '');
        loadStoryChapters(storyList[0].id);
      }

      // If initial comic requested, select it
      if (initialComicId && comicList) {
        const found = comicList.find((c: any) => c.id === initialComicId);
        if (found) {
          setSelectedComicId(found.id);
          setSelectedComic(found);
          setComicTitle(found.title_ar || found.title || '');
          loadComicPages(found.id);
        }
      } else if (comicList && comicList.length > 0 && !selectedComicId) {
        setSelectedComicId(comicList[0].id);
        setSelectedComic(comicList[0]);
        setComicTitle(comicList[0].title_ar || comicList[0].title || '');
        loadComicPages(comicList[0].id);
      }
    } catch {
      toast({ title: 'تعذر تحميل بيانات الأعمال', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllWorks();
  }, []);

  // ─────────────────────────────────────────────────────────────
  // CHAPTERS MANAGEMENT LOGIC
  // ─────────────────────────────────────────────────────────────
  const loadStoryChapters = async (sId: string) => {
    try {
      const res = await api.getAdminChapters(sId);
      const chs = res?.chapters || [];
      setChapters(chs);
      if (chs.length > 0) {
        setSelectedChapterId(chs[0].id);
        setActiveChapter({ ...chs[0] });
      } else {
        const defaultCh = {
          id: `chap_${Date.now()}_1`,
          chapter_number: 1,
          title_ar: 'الفصل الأول: البدايات',
          title_en: 'Chapter 1: The Beginnings',
          subtitle: '',
          content: 'اكتب نص الفصل الأول هنا...',
          summary_ar: '',
          reading_time_minutes: 8,
          word_count: 50,
          status: 'draft',
          access_level: 'public',
        };
        setChapters([defaultCh]);
        setSelectedChapterId(defaultCh.id);
        setActiveChapter(defaultCh);
      }
    } catch {
      toast({ title: 'فشل تحميل فصول الرواية', variant: 'destructive' });
    }
  };

  const handleSelectStory = (sId: string) => {
    setSelectedStoryId(sId);
    const s = stories.find((item) => item.id === sId);
    if (s) {
      setSelectedStory(s);
      setStoryTitle(s.title_ar || s.title || '');
    }
    setHasPreviewed(false);
    loadStoryChapters(sId);
  };

  const handleAddChapter = () => {
    const nextNum = chapters.length + 1;
    const newCh = {
      id: `chap_${Date.now()}_${nextNum}`,
      chapter_number: nextNum,
      title_ar: `الفصل ${nextNum}: عنوان الفصل الجديد`,
      title_en: `Chapter ${nextNum}`,
      subtitle: '',
      content: 'اكتب أحداث هذا الفصل الجديد هنا...',
      summary_ar: '',
      reading_time_minutes: 5,
      word_count: 20,
      status: 'draft',
      access_level: 'public',
    };
    const updated = [...chapters, newCh];
    setChapters(updated);
    setSelectedChapterId(newCh.id);
    setActiveChapter({ ...newCh });
    toast({ title: `تمت إضافة الفصل ${nextNum} بنجاح ✨` });
  };

  const handleDuplicateChapter = (chId: string) => {
    const target = chapters.find((c) => c.id === chId);
    if (!target) return;
    const nextNum = chapters.length + 1;
    const duplicate = {
      ...target,
      id: `chap_${Date.now()}_dup`,
      chapter_number: nextNum,
      title_ar: `${target.title_ar} (نسخة مكررة)`,
      status: 'draft',
    };
    const updated = [...chapters, duplicate];
    setChapters(updated);
    setSelectedChapterId(duplicate.id);
    setActiveChapter({ ...duplicate });
    toast({ title: 'تم تكرار الفصل بنجاح' });
  };

  const handleDeleteChapter = (chId: string) => {
    if (chapters.length <= 1) {
      toast({ title: 'يجب الإبقاء على فصل واحد على الأقل', variant: 'destructive' });
      return;
    }
    if (!confirm('هل أنت متأكد من حذف هذا الفصل نهائياً؟')) return;

    const filtered = chapters
      .filter((c) => c.id !== chId)
      .map((c, idx) => ({ ...c, chapter_number: idx + 1 }));
    setChapters(filtered);
    const nextSelected = filtered[0];
    setSelectedChapterId(nextSelected.id);
    setActiveChapter({ ...nextSelected });
    toast({ title: 'تم حذف الفصل وإعادة ترتيب الفهارس' });
  };

  const handleMoveChapter = (idx: number, dir: 'up' | 'down') => {
    const targetIdx = dir === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= chapters.length) return;
    const reordered = [...chapters];
    const temp = reordered[idx];
    reordered[idx] = reordered[targetIdx];
    reordered[targetIdx] = temp;

    const updated = reordered.map((c, i) => ({ ...c, chapter_number: i + 1 }));
    setChapters(updated);
  };

  const handleContentChange = (val: string) => {
    if (!activeChapter) return;
    const words = val.trim() ? val.trim().split(/\s+/).length : 0;
    const minutes = Math.max(1, Math.ceil(words / 180));
    const updated = {
      ...activeChapter,
      content: val,
      word_count: words,
      reading_time_minutes: minutes,
    };
    setActiveChapter(updated);
    setChapters((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  };

  const insertFormatting = (prefix: string, suffix: string = '') => {
    const textarea = editorRef.current;
    if (!textarea || !activeChapter) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = activeChapter.content;
    const selected = text.substring(start, end);
    const replacement = `${prefix}${selected || 'نص مميز'}${suffix}`;
    const newContent = text.substring(0, start) + replacement + text.substring(end);
    handleContentChange(newContent);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + (selected.length || 8));
    }, 50);
  };

  const handleApplyPasteText = () => {
    if (!pastedText.trim() || !activeChapter) return;
    handleContentChange(pastedText);
    setPastedText('');
    setShowPasteModal(false);
    toast({ title: 'تم لصق المحتوى وتحديث الفصل بنجاح ✨' });
  };

  // Save Draft for chapters
  const handleSaveDraftChapters = async () => {
    if (!selectedStoryId || !activeChapter) return;
    setIsSavingChapters(true);
    try {
      const currentList = chapters.map((c) => (c.id === activeChapter.id ? { ...activeChapter } : c));
      const totalWords = currentList.reduce((s, c) => s + (c.word_count || 0), 0);
      const totalTime = currentList.reduce((s, c) => s + (c.reading_time_minutes || 0), 0);

      // Status becomes in_progress if currently draft, or stays published
      const newStatus = selectedStory?.status === 'published' ? 'published' : 'in_progress';

      await api.updateAdminStory(selectedStoryId, {
        content: JSON.stringify({
          chapters: currentList,
          last_modified: new Date().toISOString(),
        }),
        word_count: totalWords,
        read_time_minutes: totalTime,
        status: newStatus,
      });

      setChapters(currentList);
      if (selectedStory) {
        setSelectedStory({ ...selectedStory, status: newStatus });
      }
      const timeStr = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
      setLastSavedTime(timeStr);
      toast({ title: '💾 تم حفظ مسودة الفصول بنجاح!' });
    } catch (err: any) {
      toast({ title: 'فشل حفظ المسودة', description: err.message, variant: 'destructive' });
    } finally {
      setIsSavingChapters(false);
    }
  };

  const handleCreateNewNovel = async () => {
    if (!newNovelTitle.trim()) {
      toast({ title: 'يرجى كتابة عنوان الرواية', variant: 'destructive' });
      return;
    }
    try {
      const initialChap = {
        id: `chap_${Date.now()}_1`,
        chapter_number: 1,
        title_ar: 'الفصل الأول: البدايات',
        title_en: 'Chapter 1',
        content: 'اكتب بداية أحداث الرواية هنا...',
        word_count: 10,
        reading_time_minutes: 5,
        status: 'draft',
        access_level: 'public',
      };

      const res = await api.createAdminStory({
        title: newNovelTitle.trim(),
        slug: `novel-${Date.now()}`,
        synopsis: 'رواية جديدة مسودة في استوديو النشر',
        content: JSON.stringify({
          type: 'novel',
          creation_method: 'chapters',
          chapters: [initialChap],
        }),
        classification: 'original',
        status: 'draft', // Strictly draft initially!
        genres_ar: ['دراما', 'خيال'],
      });

      toast({ title: '🎉 تم إنشاء مسودة الرواية! يمكنك الآن كتابة الفصول ومراجعتها قبل النشر.' });
      setIsCreatingNewNovel(false);
      setNewNovelTitle('');
      await fetchAllWorks();
      if (res && res.id) {
        setSelectedStoryId(res.id);
        setSelectedStory(res);
        setStoryTitle(res.title || newNovelTitle);
        loadStoryChapters(res.id);
      }
    } catch (err: any) {
      toast({ title: 'تعذر إنشاء الرواية', description: err.message, variant: 'destructive' });
    }
  };

  // ─────────────────────────────────────────────────────────────
  // COMICS & PAGES MANAGEMENT LOGIC
  // ─────────────────────────────────────────────────────────────
  const loadComicPages = async (cId: string) => {
    try {
      const pages = await api.getAdminComicPages(cId);
      setComicPages(pages || []);
    } catch {
      toast({ title: 'فشل تحميل صفحات الكوميكس', variant: 'destructive' });
    }
  };

  const handleSelectComic = (cId: string) => {
    setSelectedComicId(cId);
    const c = comics.find((item) => item.id === cId);
    if (c) {
      setSelectedComic(c);
      setComicTitle(c.title_ar || c.title || '');
    }
    setHasPreviewed(false);
    loadComicPages(cId);
  };

  const handleBulkUploadPages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedComicId) {
      toast({ title: 'يرجى اختيار عمل مصور أولاً', variant: 'destructive' });
      return;
    }
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingPages(true);
    const fileList = Array.from(files);
    let count = 0;
    const uploadedRows: any[] = [];

    try {
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        setUploadProgress(`جاري رفع الصورة ${i + 1} من ${fileList.length}...`);

        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        const res = await api.uploadMedia(base64, 'comic_pages');
        if (res && res.url) {
          uploadedRows.push({
            page_number: comicPages.length + i + 1,
            image_url: res.url,
            is_preview: comicPages.length + i === 0,
          });
          count++;
        }
      }

      if (uploadedRows.length > 0) {
        await api.createAdminComicPages(selectedComicId, { pages: uploadedRows });
      }

      // Update comic status to in_progress if currently draft
      if (selectedComic?.status === 'draft') {
        await api.updateAdminComic(selectedComicId, { status: 'in_progress' });
        setSelectedComic({ ...selectedComic, status: 'in_progress' });
      }

      const timeStr = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
      setLastSavedTime(timeStr);
      toast({ title: `🎉 تم رفع وتوثيق ${count} صفحة مصورة بنجاح!` });
      loadComicPages(selectedComicId);
    } catch (err: any) {
      toast({ title: 'خطأ أثناء رفع الصفحات', description: err.message, variant: 'destructive' });
    } finally {
      setIsUploadingPages(false);
      setUploadProgress('');
      if (bulkFileInputRef.current) bulkFileInputRef.current.value = '';
    }
  };

  const handleDeleteComicPage = async (pageId: string, pageNum: number) => {
    if (!selectedComicId) return;
    if (!confirm(`هل أنت متأكد من حذف الصفحة رقم ${pageNum}؟`)) return;
    try {
      await api.deleteAdminComicPage(selectedComicId, pageId);
      toast({ title: `تم حذف الصفحة ${pageNum}` });
      loadComicPages(selectedComicId);
    } catch {
      toast({ title: 'فشل حذف الصفحة', variant: 'destructive' });
    }
  };

  const handleMoveComicPage = async (index: number, dir: 'prev' | 'next') => {
    if (!selectedComicId) return;
    const targetIdx = dir === 'prev' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= comicPages.length) return;

    const updated = [...comicPages];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;

    const pageOrders = updated.map((p, idx) => ({
      id: p.id,
      page_number: idx + 1,
    }));
    setComicPages(updated.map((p, idx) => ({ ...p, page_number: idx + 1 })));

    try {
      await api.reorderAdminComicPages(selectedComicId, pageOrders);
      toast({ title: 'تم حفظ ترتيب الصفحات' });
    } catch {
      toast({ title: 'فشل حفظ الترتيب', variant: 'destructive' });
    }
  };

  const handleCreateNewComic = async () => {
    if (!newComicTitle.trim()) {
      toast({ title: 'يرجى كتابة عنوان العمل المصور', variant: 'destructive' });
      return;
    }
    try {
      const res = await api.createAdminComic({
        title: newComicTitle.trim(),
        slug: `comic-${Date.now()}`,
        synopsis: 'قصة مصورة مسودة في استوديو النشر',
        classification: 'original',
        status: 'draft', // Strictly draft initially!
        genres_ar: ['أكشن', 'خيال علمي'],
      });
      toast({ title: '🎉 تم إنشاء مسودة العمل المصور! يمكنك الآن رفع الصفحات ومراجعتها قبل النشر.' });
      setIsCreatingNewComic(false);
      setNewComicTitle('');
      await fetchAllWorks();
      if (res && res.id) {
        setSelectedComicId(res.id);
        setSelectedComic(res);
        setComicTitle(res.title || newComicTitle);
        loadComicPages(res.id);
      }
    } catch (err: any) {
      toast({ title: 'تعذر إنشاء الكوميكس', description: err.message, variant: 'destructive' });
    }
  };

  // ─────────────────────────────────────────────────────────────
  // PDF UPLOAD LOGIC
  // ─────────────────────────────────────────────────────────────
  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingPdf(true);
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const res = await api.uploadMedia(base64, 'documents');
      if (res && res.url) {
        setPdfUrl(res.url);
        setPdfFileName(file.name);
        const timeStr = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
        setLastSavedTime(timeStr);
        toast({ title: '🎉 تم رفع ملف الـ PDF بنجاح!' });
      } else {
        toast({ title: 'فشل رفع ملف الـ PDF', variant: 'destructive' });
      }
    } catch (err: any) {
      toast({ title: 'خطأ في الرفع', description: err.message, variant: 'destructive' });
    } finally {
      setIsUploadingPdf(false);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // SMART COMPLETION CHECKLIST EVALUATION
  // ─────────────────────────────────────────────────────────────
  // Novel checklist
  const novelChecklist = {
    hasBasicInfo: Boolean(selectedStory?.title_ar || storyTitle),
    hasCover: Boolean(selectedStory?.cover_image_url),
    hasChapters: chapters.length >= 1,
    hasContent: chapters.some((c) => c.content && c.content.trim().length > 20),
    hasOrder: chapters.length >= 1,
    hasPreview: hasPreviewed,
  };
  const isNovelReadyToPublish =
    novelChecklist.hasBasicInfo &&
    novelChecklist.hasChapters &&
    novelChecklist.hasContent;

  // Comic checklist
  const comicChecklist = {
    hasBasicInfo: Boolean(selectedComic?.title_ar || comicTitle),
    hasCover: Boolean(selectedComic?.cover_image_url),
    hasPages: comicPages.length >= 1,
    hasOrder: comicPages.length >= 1,
    hasDirection: Boolean(readingDirection),
    hasPreview: hasPreviewed,
  };
  const isComicReadyToPublish =
    comicChecklist.hasBasicInfo &&
    comicChecklist.hasPages;

  // PDF checklist
  const pdfChecklist = {
    hasBasicInfo: Boolean(selectedStoryId || selectedComicId || pdfFileName),
    hasPdf: Boolean(pdfUrl),
    hasProcessing: Boolean(pdfUrl),
    hasPreview: hasPreviewed,
  };
  const isPdfReadyToPublish = pdfChecklist.hasPdf;

  // ─────────────────────────────────────────────────────────────
  // FINAL PUBLISH ACTION HANDLER
  // ─────────────────────────────────────────────────────────────
  const handleFinalPublish = async () => {
    const isNovel = activeTab === 'novels';
    const isComic = activeTab === 'comics';
    const targetId = isNovel ? selectedStoryId : selectedComicId;
    const targetType = isNovel ? 'story' : 'comic';
    const title = isNovel ? storyTitle : comicTitle;

    if (!targetId) {
      toast({ title: 'يرجى اختيار عمل لنشره', variant: 'destructive' });
      return;
    }

    setIsPublishing(true);
    try {
      // 1. Ensure latest draft state is saved first
      if (isNovel) {
        await handleSaveDraftChapters();
      }

      // 2. Call authorized backend publishing workflow
      await api.publishAdminPublication(targetId, targetType);

      // 3. Update local state
      if (isNovel && selectedStory) {
        setSelectedStory({ ...selectedStory, status: 'published' });
      } else if (isComic && selectedComic) {
        setSelectedComic({ ...selectedComic, status: 'published' });
      }

      setShowPublishModal(false);
      setPublishedItem({ id: targetId, title, type: targetType });
      setShowSuccessModal(true);

      // Refresh list
      fetchAllWorks();
    } catch (err: any) {
      toast({ title: 'فشل النشر النهائي', description: err.message, variant: 'destructive' });
    } finally {
      setIsPublishing(false);
    }
  };

  const currentStatus =
    activeTab === 'novels'
      ? selectedStory?.status || 'draft'
      : activeTab === 'comics'
      ? selectedComic?.status || 'draft'
      : 'draft';

  return (
    <div className="min-h-screen bg-[#0A0F1D] text-white font-arabic selection:bg-[#087C7B] selection:text-white" dir="rtl">
      {/* Top Global Command Bar */}
      <header className="sticky top-0 z-40 bg-[#0E1526]/95 backdrop-blur-md border-b border-[#1E2B42] px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin">
            <button className="flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-white bg-zinc-800/60 hover:bg-zinc-800 px-3 py-1.5 rounded-xl transition-colors">
              <ArrowRight className="w-3.5 h-3.5" />
              <span>العودة للوحة التحكم</span>
            </button>
          </Link>

          <div className="h-5 w-[1px] bg-zinc-700 hidden sm:block" />

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#087C7B] to-[#C5A15B] flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white flex items-center gap-2">
                <span>استوديو كتابة وإدارة المحتوى</span>
                <span className="px-2 py-0.5 rounded-full bg-[#087C7B]/20 text-[#087C7B] text-[10px] font-bold border border-[#087C7B]/30">
                  Publishing Studio
                </span>
              </h1>
              <p className="text-[11px] text-zinc-400">تحرير الفصول، رفع الصفحات، المعاينة، والنشر النهائي المعتمد</p>
            </div>
          </div>
        </div>

        {/* Global Action Tools */}
        <div className="flex items-center gap-3">
          {/* Main Tab Switchers */}
          <div className="bg-[#141E33] p-1 rounded-xl border border-[#24334A] flex items-center gap-1 text-xs font-bold">
            <button
              onClick={() => {
                setActiveTab('novels');
                setHasPreviewed(false);
              }}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                activeTab === 'novels' ? 'bg-[#087C7B] text-white shadow-md' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>الروايات والكتب ({stories.length})</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('comics');
                setHasPreviewed(false);
              }}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                activeTab === 'comics' ? 'bg-[#087C7B] text-white shadow-md' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>القصص المصورة والصفحات ({comics.length})</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('pdf');
                setHasPreviewed(false);
              }}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                activeTab === 'pdf' ? 'bg-[#087C7B] text-white shadow-md' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <FileUp className="w-3.5 h-3.5" />
              <span>مستندات PDF</span>
            </button>
          </div>

          {/* Toggle Publishing Panel Button */}
          <button
            type="button"
            onClick={() => setShowPublishingDrawer(!showPublishingDrawer)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all ${
              showPublishingDrawer
                ? 'bg-[#087C7B]/20 border-[#087C7B] text-white'
                : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#C5A15B]" />
            <span>لوحة النشر والاعتماد</span>
          </button>
        </div>
      </header>

      {/* Main Workspace with 3 columns (Works List, Editor, Publishing Panel) */}
      <div className="flex h-[calc(100vh-61px)] overflow-hidden">
        {/* ─────────────────────────────────────────────────────────────
            TAB 1: NOVELS & CHAPTERS STUDIO
        ───────────────────────────────────────────────────────────── */}
        {activeTab === 'novels' && (
          <div className="flex flex-1 overflow-hidden">
            {/* Column 1: Novel Selector Sidebar */}
            <div className="w-64 bg-[#0C1220] border-l border-[#1E2B42] flex flex-col shrink-0">
              <div className="p-3.5 border-b border-[#1E2B42] flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                  <Library className="w-3.5 h-3.5 text-[#C5A15B]" />
                  <span>اختر الرواية</span>
                </span>
                <button
                  type="button"
                  onClick={() => setIsCreatingNewNovel(true)}
                  className="px-2.5 py-1 rounded-lg bg-[#087C7B] hover:bg-[#066160] text-white text-[11px] font-bold flex items-center gap-1 shadow-sm transition-all"
                >
                  <Plus className="w-3 h-3" />
                  <span>عمل جديد</span>
                </button>
              </div>

              {/* Quick Novel Creator inline */}
              {isCreatingNewNovel && (
                <div className="p-3 bg-[#152033] border-b border-[#24334A] space-y-2">
                  <input
                    type="text"
                    placeholder="عنوان الرواية أو الكتاب..."
                    value={newNovelTitle}
                    onChange={(e) => setNewNovelTitle(e.target.value)}
                    className="w-full bg-[#0C1220] border border-[#2B3B52] rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-[#087C7B]"
                    autoFocus
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCreateNewNovel}
                      className="flex-1 py-1 rounded-lg bg-[#087C7B] text-white text-xs font-bold"
                    >
                      إنشاء مسودة
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsCreatingNewNovel(false)}
                      className="px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-400 text-xs"
                    >
                      إلغاء
                    </button>
                  </div>
                </div>
              )}

              {/* Stories list */}
              <div className="flex-1 overflow-y-auto divide-y divide-[#1A253A] p-2 space-y-1">
                {stories.length === 0 ? (
                  <div className="p-6 text-center text-xs text-zinc-500">لا توجد روايات مسجلة بعد</div>
                ) : (
                  stories.map((s) => {
                    const isSelected = s.id === selectedStoryId;
                    const statusLabel =
                      s.status === 'published'
                        ? 'منشور'
                        : s.status === 'in_progress'
                        ? 'قيد التحرير'
                        : 'مسودة';
                    const statusColor =
                      s.status === 'published'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : s.status === 'in_progress'
                        ? 'bg-blue-500/20 text-blue-300'
                        : 'bg-amber-500/20 text-amber-300';

                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => handleSelectStory(s.id)}
                        className={`w-full p-2.5 rounded-xl text-right transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-[#087C7B]/20 border border-[#087C7B] text-white shadow-md'
                            : 'hover:bg-[#141E33] text-zinc-300'
                        }`}
                      >
                        <div className="truncate max-w-[170px]">
                          <div className="font-bold text-xs truncate">{s.title_ar || s.title || 'رواية بدون عنوان'}</div>
                          <div className="flex items-center gap-1 mt-1">
                            <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${statusColor}`}>
                              {statusLabel}
                            </span>
                            <span className="text-[10px] text-zinc-400 font-mono">
                              {s.classification === 'original' ? 'أصلي' : 'مختارة'}
                            </span>
                          </div>
                        </div>
                        <ChevronLeft className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Column 2: Chapters Table of Contents (TOC) */}
            <div className="w-72 bg-[#0E1526] border-l border-[#1E2B42] flex flex-col shrink-0">
              <div className="p-3.5 border-b border-[#1E2B42] flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-[#C5A15B]" />
                    <span>فهرس الفصول ({chapters.length})</span>
                  </span>
                  <p className="text-[10px] text-zinc-400 truncate max-w-[150px] mt-0.5">{storyTitle}</p>
                </div>
                <button
                  type="button"
                  onClick={handleAddChapter}
                  className="px-2.5 py-1.5 rounded-lg bg-[#087C7B] hover:bg-[#066160] text-white text-[11px] font-bold flex items-center gap-1 shadow-sm transition-all"
                >
                  <Plus className="w-3 h-3" />
                  <span>إضافة فصل</span>
                </button>
              </div>

              {/* Chapters list */}
              <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
                {chapters.map((ch, idx) => {
                  const isSelected = ch.id === selectedChapterId;
                  return (
                    <div
                      key={ch.id}
                      onClick={() => {
                        setSelectedChapterId(ch.id);
                        setActiveChapter({ ...ch });
                      }}
                      className={`p-2.5 rounded-xl border text-right cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-[#18263E] border-[#087C7B] shadow-md ring-1 ring-[#087C7B]/30'
                          : 'bg-[#101726] border-[#1E2B42] hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold text-[#C5A15B] font-mono">#{ch.chapter_number}</span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveChapter(idx, 'up');
                            }}
                            disabled={idx === 0}
                            className="p-1 hover:bg-zinc-800 rounded text-zinc-400 disabled:opacity-30"
                            title="تحريك لأعلى"
                          >
                            <ChevronUp className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveChapter(idx, 'down');
                            }}
                            disabled={idx === chapters.length - 1}
                            className="p-1 hover:bg-zinc-800 rounded text-zinc-400 disabled:opacity-30"
                            title="تحريك لأسفل"
                          >
                            <ChevronDown className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDuplicateChapter(ch.id);
                            }}
                            className="p-1 hover:bg-zinc-800 rounded text-zinc-400"
                            title="تكرار الفصل"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteChapter(ch.id);
                            }}
                            className="p-1 hover:bg-red-500/20 text-red-400 rounded"
                            title="حذف الفصل"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <div className="font-bold text-xs text-white truncate">{ch.title_ar}</div>
                      <div className="flex items-center justify-between text-[10px] text-zinc-400 mt-1 font-mono">
                        <span>{ch.word_count || 0} كلمة</span>
                        <span>{ch.reading_time_minutes || 5} دقيقة</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Column 3: Full Distraction-Free Chapter Editor */}
            <div className="flex-1 flex flex-col bg-[#080D1A] overflow-hidden">
              {activeChapter ? (
                <>
                  {/* Chapter Meta Bar */}
                  <div className="px-6 py-3 bg-[#0F1628] border-b border-[#1E2B42] flex flex-wrap items-center justify-between gap-4">
                    <div className="flex-1 min-w-[280px]">
                      <input
                        type="text"
                        value={activeChapter.title_ar}
                        onChange={(e) => {
                          const updated = { ...activeChapter, title_ar: e.target.value };
                          setActiveChapter(updated);
                          setChapters((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
                        }}
                        className="bg-transparent text-white font-bold text-base outline-none w-full border-b border-transparent focus:border-[#087C7B] pb-0.5"
                        placeholder="عنوان الفصل..."
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Access Level */}
                      <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                        <Lock className="w-3.5 h-3.5 text-[#C5A15B]" />
                        <select
                          value={activeChapter.access_level}
                          onChange={(e) => {
                            const updated = { ...activeChapter, access_level: e.target.value };
                            setActiveChapter(updated);
                            setChapters((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
                          }}
                          className="bg-[#141F33] border border-[#2B3B52] rounded-lg px-2.5 py-1 text-xs text-white outline-none"
                        >
                          <option value="public">متاح للجميع (Public)</option>
                          <option value="free_preview">معاينة مجانية (Free Preview)</option>
                          <option value="subscriber_only">حصري للمشتركين (Subscribers)</option>
                          <option value="premium">بريميوم فائق (Premium)</option>
                        </select>
                      </div>

                      {/* Word Counter */}
                      <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono bg-[#141F33] px-3 py-1 rounded-lg border border-[#2B3B52]">
                        <span>{activeChapter.word_count || 0} كلمة</span>
                        <span>•</span>
                        <span>{activeChapter.reading_time_minutes || 1} دقيقة</span>
                      </div>

                      {/* Quick Paste Button */}
                      <button
                        type="button"
                        onClick={() => setShowPasteModal(true)}
                        className="px-3 py-1.5 rounded-lg bg-[#C5A15B]/20 hover:bg-[#C5A15B] text-antique-gold hover:text-midnight-navy font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>لصق نص الفصل</span>
                      </button>

                      {/* Save Draft Button */}
                      <button
                        type="button"
                        onClick={handleSaveDraftChapters}
                        disabled={isSavingChapters}
                        className="px-4 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold flex items-center gap-1.5 border border-zinc-700 transition-all"
                      >
                        <Save className="w-3.5 h-3.5 text-[#087C7B]" />
                        <span>{isSavingChapters ? 'جاري الحفظ...' : 'حفظ كمسودة (Save Draft)'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Formatting Toolbar */}
                  <div className="px-6 py-2 bg-[#0C1222] border-b border-[#1A2538] flex items-center gap-1 text-zinc-300">
                    <button
                      type="button"
                      onClick={() => insertFormatting('**', '**')}
                      className="p-1.5 hover:bg-zinc-800 rounded text-xs font-bold"
                      title="خط عريض (Bold)"
                    >
                      <Bold className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatting('*', '*')}
                      className="p-1.5 hover:bg-zinc-800 rounded text-xs font-bold"
                      title="خط مائل (Italic)"
                    >
                      <Italic className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatting('<u>', '</u>')}
                      className="p-1.5 hover:bg-zinc-800 rounded text-xs font-bold"
                      title="تسطير (Underline)"
                    >
                      <Underline className="w-4 h-4" />
                    </button>
                    <div className="h-4 w-[1px] bg-zinc-700 mx-1" />
                    <button
                      type="button"
                      onClick={() => insertFormatting('\n## ', '\n')}
                      className="px-2 py-1 hover:bg-zinc-800 rounded text-xs font-bold"
                      title="عنوان فرعي (H2)"
                    >
                      H2
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatting('\n### ', '\n')}
                      className="px-2 py-1 hover:bg-zinc-800 rounded text-xs font-bold"
                      title="عنوان فرعي (H3)"
                    >
                      H3
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatting('\n> ', '\n')}
                      className="p-1.5 hover:bg-zinc-800 rounded text-xs font-bold"
                      title="اقتباس (Quote)"
                    >
                      <Quote className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatting('\n* ', '\n')}
                      className="p-1.5 hover:bg-zinc-800 rounded text-xs font-bold"
                      title="قائمة نقطية"
                    >
                      <List className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatting('\n\n* * *\n\n')}
                      className="px-2 py-1 hover:bg-zinc-800 rounded text-xs font-bold text-[#C5A15B]"
                      title="فاصل مشاهد سردية"
                    >
                      * * *
                    </button>
                  </div>

                  {/* Main Text Writing Area */}
                  <div className="flex-1 p-6 sm:p-10 overflow-y-auto flex justify-center">
                    <div className="max-w-4xl w-full">
                      <textarea
                        ref={editorRef}
                        value={activeChapter.content}
                        onChange={(e) => handleContentChange(e.target.value)}
                        placeholder="ابدأ صياغة وسرد أحداث هذا الفصل هنا، أو استخدم زر (لصق نص الفصل) لاستيراد النص المكتوب مسبقاً..."
                        className="w-full h-full min-h-[550px] bg-transparent text-[#E2E8F0] font-arabic text-base sm:text-lg leading-loose outline-none resize-none placeholder:text-zinc-600"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-zinc-500">
                  <BookOpen className="w-12 h-12 mb-3 text-zinc-700" />
                  <p>اختر فصلاً من القائمة الجانبية للبدء في كتابته وتعديله</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            TAB 2: COMICS & PAGES STUDIO
        ───────────────────────────────────────────────────────────── */}
        {activeTab === 'comics' && (
          <div className="flex flex-1 overflow-hidden">
            {/* Column 1: Comics Sidebar */}
            <div className="w-64 bg-[#0C1220] border-l border-[#1E2B42] flex flex-col shrink-0">
              <div className="p-3.5 border-b border-[#1E2B42] flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#C5A15B]" />
                  <span>اختر الكوميكس</span>
                </span>
                <button
                  type="button"
                  onClick={() => setIsCreatingNewComic(true)}
                  className="px-2.5 py-1 rounded-lg bg-[#087C7B] hover:bg-[#066160] text-white text-[11px] font-bold flex items-center gap-1 shadow-sm transition-all"
                >
                  <Plus className="w-3 h-3" />
                  <span>عمل جديد</span>
                </button>
              </div>

              {/* Quick Comic Creator inline */}
              {isCreatingNewComic && (
                <div className="p-3 bg-[#152033] border-b border-[#24334A] space-y-2">
                  <input
                    type="text"
                    placeholder="عنوان القصة المصورة..."
                    value={newComicTitle}
                    onChange={(e) => setNewComicTitle(e.target.value)}
                    className="w-full bg-[#0C1220] border border-[#2B3B52] rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-[#087C7B]"
                    autoFocus
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCreateNewComic}
                      className="flex-1 py-1 rounded-lg bg-[#087C7B] text-white text-xs font-bold"
                    >
                      إنشاء مسودة
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsCreatingNewComic(false)}
                      className="px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-400 text-xs"
                    >
                      إلغاء
                    </button>
                  </div>
                </div>
              )}

              {/* Comics list */}
              <div className="flex-1 overflow-y-auto divide-y divide-[#1A253A] p-2 space-y-1">
                {comics.length === 0 ? (
                  <div className="p-6 text-center text-xs text-zinc-500">لا توجد أعمال مصورة بعد</div>
                ) : (
                  comics.map((c) => {
                    const isSelected = c.id === selectedComicId;
                    const statusLabel =
                      c.status === 'published'
                        ? 'منشور'
                        : c.status === 'in_progress'
                        ? 'قيد التحرير'
                        : 'مسودة';
                    const statusColor =
                      c.status === 'published'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : c.status === 'in_progress'
                        ? 'bg-blue-500/20 text-blue-300'
                        : 'bg-amber-500/20 text-amber-300';

                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => handleSelectComic(c.id)}
                        className={`w-full p-2.5 rounded-xl text-right transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-[#087C7B]/20 border border-[#087C7B] text-white shadow-md'
                            : 'hover:bg-[#141E33] text-zinc-300'
                        }`}
                      >
                        <div className="truncate max-w-[170px]">
                          <div className="font-bold text-xs truncate">{c.title_ar || c.title || 'كوميكس بدون عنوان'}</div>
                          <div className="flex items-center gap-1 mt-1">
                            <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${statusColor}`}>
                              {statusLabel}
                            </span>
                            <span className="text-[10px] text-zinc-400 font-mono">العدد #{c.issue_number || 1}</span>
                          </div>
                        </div>
                        <ChevronLeft className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Column 2: Visual Comic Pages Gallery & Upload Studio */}
            <div className="flex-1 flex flex-col bg-[#080D1A] overflow-hidden">
              {/* Comic Header Bar */}
              <div className="px-6 py-3.5 bg-[#0F1628] border-b border-[#1E2B42] flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white text-sm flex items-center gap-2">
                    <span>{comicTitle || 'العمل المصور'}</span>
                    <span className="px-2 py-0.5 rounded-full bg-[#087C7B]/20 text-[#087C7B] text-[10px] font-bold">
                      {comicPages.length} صفحات
                    </span>
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">رفع صور صفحات الكوميكس، إعادة الترتيب، وتحديد اتجاه القراءة</p>
                </div>

                <div className="flex items-center gap-3">
                  {/* Reading Direction */}
                  <div className="flex items-center bg-[#141F33] p-1 rounded-xl border border-[#2B3B52] text-xs">
                    <button
                      type="button"
                      onClick={() => setReadingDirection('rtl')}
                      className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1 ${
                        readingDirection === 'rtl' ? 'bg-[#087C7B] text-white' : 'text-zinc-400'
                      }`}
                    >
                      <ArrowRight className="w-3 h-3" />
                      <span>يمين لليسار (RTL)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setReadingDirection('ltr')}
                      className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1 ${
                        readingDirection === 'ltr' ? 'bg-[#087C7B] text-white' : 'text-zinc-400'
                      }`}
                    >
                      <ArrowLeft className="w-3 h-3" />
                      <span>يسار لليمين (LTR)</span>
                    </button>
                  </div>

                  {/* Bulk Upload Button */}
                  <label className="cursor-pointer px-4 py-2 rounded-xl bg-gradient-to-r from-[#087C7B] to-[#0A9695] text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-[#087C7B]/25 hover:brightness-110 transition-all">
                    <Upload className="w-4 h-4" />
                    <span>{isUploadingPages ? uploadProgress || 'جاري الرفع...' : 'رفع صفحات مجمعة (Bulk Upload)'}</span>
                    <input
                      ref={bulkFileInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      disabled={isUploadingPages}
                      onChange={handleBulkUploadPages}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Pages Grid */}
              <div className="flex-1 p-6 overflow-y-auto">
                {comicPages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-[#1E2B42] rounded-3xl p-12 text-center">
                    <ImageIcon className="w-16 h-16 text-zinc-700 mb-4" />
                    <h4 className="text-base font-bold text-white mb-2">لا توجد صفحات مرفوعة لهذا العمل بعد</h4>
                    <p className="text-xs text-zinc-400 max-w-md mb-6">
                      قم برفع صور صفحات الكوميكس دفعة واحدة ليتم فهرستها وترتيبها تلقائياً لتكون جاهزة للمطالعة في القارئ
                    </p>
                    <label className="cursor-pointer px-6 py-2.5 rounded-xl bg-[#087C7B] hover:bg-[#066160] text-white text-xs font-bold flex items-center gap-2 shadow-lg transition-all">
                      <Upload className="w-4 h-4" />
                      <span>اختر صور الصفحات الآن</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        disabled={isUploadingPages}
                        onChange={handleBulkUploadPages}
                        className="hidden"
                      />
                    </label>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {comicPages.map((page, idx) => (
                      <div
                        key={page.id}
                        className="bg-[#121A2C] border border-[#213047] hover:border-[#087C7B] rounded-2xl overflow-hidden shadow-lg transition-all flex flex-col group relative"
                      >
                        {/* Image Thumbnail */}
                        <div className="aspect-[2/3] bg-zinc-900 relative overflow-hidden">
                          <img
                            src={page.image_url}
                            alt={`Page ${page.page_number}`}
                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                            loading="lazy"
                          />
                          <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/80 text-white font-mono text-[11px] font-bold">
                            #{page.page_number}
                          </span>
                        </div>

                        {/* Controls Footer */}
                        <div className="p-2 bg-[#0F1626] border-t border-[#1E2B42] flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleMoveComicPage(idx, 'prev')}
                              disabled={idx === 0}
                              className="p-1 hover:bg-zinc-800 rounded text-zinc-400 disabled:opacity-30"
                              title="تحريك للخلف"
                            >
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveComicPage(idx, 'next')}
                              disabled={idx === comicPages.length - 1}
                              className="p-1 hover:bg-zinc-800 rounded text-zinc-400 disabled:opacity-30"
                              title="تحريك للأمام"
                            >
                              <ChevronLeft className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleDeleteComicPage(page.id, page.page_number)}
                            className="p-1 hover:bg-red-500/20 text-red-400 rounded transition-colors"
                            title="حذف الصفحة"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            TAB 3: PDF DOCUMENTS STUDIO
        ───────────────────────────────────────────────────────────── */}
        {activeTab === 'pdf' && (
          <div className="flex-1 p-8 max-w-4xl mx-auto space-y-6 overflow-y-auto">
            <div className="bg-[#121A2C] border border-[#213047] rounded-3xl p-8 space-y-6 text-center">
              <FileUp className="w-16 h-16 text-[#C5A15B] mx-auto" />
              <div>
                <h3 className="text-xl font-bold text-white mb-2">استوديو مستندات الـ PDF والكتب الرقمية</h3>
                <p className="text-xs text-zinc-400 max-w-md mx-auto">
                  قم برفع أي كتاب أو رواية أو مجلة بصيغة PDF ليتم دمجها وقراءتها بسلاسة عبر القارئ التفاعلي المتقدم
                </p>
              </div>

              <label className="cursor-pointer inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-[#087C7B] to-[#0A9695] text-white text-sm font-bold shadow-xl shadow-[#087C7B]/30 hover:brightness-110 transition-all">
                <Upload className="w-5 h-5" />
                <span>{isUploadingPdf ? 'جاري رفع ملف الـ PDF سحابياً...' : 'رفع ملف PDF جديد'}</span>
                <input type="file" accept=".pdf" disabled={isUploadingPdf} onChange={handlePdfUpload} className="hidden" />
              </label>

              {pdfUrl && (
                <div className="p-4 rounded-2xl bg-[#16233B] border border-[#283A57] flex items-center justify-between text-right">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    <div>
                      <div className="font-bold text-xs text-white">{pdfFileName || 'مستند PDF رقمي'}</div>
                      <div className="text-[11px] text-zinc-400 font-mono truncate max-w-md">{pdfUrl}</div>
                    </div>
                  </div>

                  <a
                    href={`/reader?pdf=${encodeURIComponent(pdfUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setHasPreviewed(true)}
                    className="px-4 py-2 rounded-xl bg-[#C5A15B] text-midnight-navy font-bold text-xs flex items-center gap-1.5 shadow-md hover:brightness-110"
                  >
                    <Eye className="w-4 h-4" />
                    <span>معاينة في القارئ</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            COLUMN 4: PERSISTENT PUBLISHING & COMPLETION PANEL
        ───────────────────────────────────────────────────────────── */}
        {showPublishingDrawer && (
          <div className="w-80 bg-[#0F1628] border-r border-[#1E2B42] flex flex-col shrink-0 overflow-y-auto">
            {/* Panel Header */}
            <div className="p-4 border-b border-[#1E2B42] flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <SlidersHorizontal className="w-4 h-4 text-[#C5A15B]" />
                <span>لوحة الاعتماد والنشر النهائي</span>
              </span>
              <button
                type="button"
                onClick={() => setShowPublishingDrawer(false)}
                className="text-zinc-500 hover:text-white p-1 rounded-lg"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-6">
              {/* Publication Status Card */}
              <div className="p-3.5 rounded-2xl bg-[#141E33] border border-[#24334A] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-zinc-400">حالة العمل الحالية:</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      currentStatus === 'published'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : currentStatus === 'in_progress'
                        ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    }`}
                  >
                    {currentStatus === 'published'
                      ? 'منشور رسمياً للجمهور'
                      : currentStatus === 'in_progress'
                      ? 'قيد التحرير والمراجعة'
                      : 'مسودة أولية (Draft)'}
                  </span>
                </div>

                <div className="text-xs font-bold text-white truncate">
                  {activeTab === 'novels' ? storyTitle || 'رواية جديدة' : comicTitle || 'كوميكس جديد'}
                </div>

                <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono pt-1 border-t border-[#1E2B42]">
                  <span>
                    {activeTab === 'novels' ? `${chapters.length} فصول` : `${comicPages.length} صفحات`}
                  </span>
                  <span>{lastSavedTime ? `آخر حفظ: ${lastSavedTime}` : 'لم يتم الحفظ بعد'}</span>
                </div>
              </div>

              {/* Smart Checklist for Current Work */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-zinc-300 flex items-center justify-between">
                  <span>قائمة استيفاء شروط النشر</span>
                  <span className="text-[10px] font-mono text-[#C5A15B]">
                    {activeTab === 'novels'
                      ? `${Object.values(novelChecklist).filter(Boolean).length}/6`
                      : `${Object.values(comicChecklist).filter(Boolean).length}/6`}
                  </span>
                </h4>

                <div className="space-y-2 text-xs">
                  {activeTab === 'novels' && (
                    <>
                      <ChecklistItem label="المعلومات الأساسية والعنوان" isDone={novelChecklist.hasBasicInfo} />
                      <ChecklistItem label="الغلاف الفني للرواية" isDone={novelChecklist.hasCover} />
                      <ChecklistItem label="إنشاء فصل واحد على الأقل" isDone={novelChecklist.hasChapters} />
                      <ChecklistItem label="إضافة محتوى نصي للفصل (>20 كلمة)" isDone={novelChecklist.hasContent} />
                      <ChecklistItem label="التحقق من ترتيب الفصول" isDone={novelChecklist.hasOrder} />
                      <ChecklistItem
                        label="معاينة العمل في القارئ التفاعلي"
                        isDone={novelChecklist.hasPreview}
                        note={!novelChecklist.hasPreview ? 'اضغط زر المعاينة أدناه للتحقق' : undefined}
                      />
                    </>
                  )}

                  {activeTab === 'comics' && (
                    <>
                      <ChecklistItem label="المعلومات الأساسية والعنوان" isDone={comicChecklist.hasBasicInfo} />
                      <ChecklistItem label="الغلاف الفني للكوميكس" isDone={comicChecklist.hasCover} />
                      <ChecklistItem label="رفع صفحات الكوميكس (صفحة على الأقل)" isDone={comicChecklist.hasPages} />
                      <ChecklistItem label="التحقق من تسلسل وترتيب الصفحات" isDone={comicChecklist.hasOrder} />
                      <ChecklistItem label="تحديد اتجاه القراءة (RTL / LTR)" isDone={comicChecklist.hasDirection} />
                      <ChecklistItem
                        label="معاينة الكوميكس في قارئ الصفحات"
                        isDone={comicChecklist.hasPreview}
                        note={!comicChecklist.hasPreview ? 'اضغط زر المعاينة أدناه للتحقق' : undefined}
                      />
                    </>
                  )}

                  {activeTab === 'pdf' && (
                    <>
                      <ChecklistItem label="المعلومات الأساسية للعمل" isDone={pdfChecklist.hasBasicInfo} />
                      <ChecklistItem label="رفع وتوثيق ملف الـ PDF السحابي" isDone={pdfChecklist.hasPdf} />
                      <ChecklistItem label="معالجة الملف وصلاحية القراءة" isDone={pdfChecklist.hasProcessing} />
                      <ChecklistItem label="معاينة المستند عبر القارئ" isDone={pdfChecklist.hasPreview} />
                    </>
                  )}
                </div>
              </div>

              {/* 3 Main Actions */}
              <div className="space-y-2.5 pt-2 border-t border-[#1E2B42]">
                {/* 1. Save Draft Action */}
                <button
                  type="button"
                  onClick={activeTab === 'novels' ? handleSaveDraftChapters : undefined}
                  className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs flex items-center justify-center gap-2 border border-zinc-700 transition-all"
                >
                  <Save className="w-3.5 h-3.5 text-[#087C7B]" />
                  <span>حفظ التعديلات كمسودة (Save Draft)</span>
                </button>

                {/* 2. Preview Action */}
                {activeTab === 'novels' && selectedStoryId && (
                  <a
                    href={`/reader?storyId=${selectedStoryId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setHasPreviewed(true)}
                    className="w-full py-2.5 rounded-xl bg-[#C5A15B]/20 hover:bg-[#C5A15B] text-antique-gold hover:text-midnight-navy font-bold text-xs flex items-center justify-center gap-2 border border-[#C5A15B]/40 transition-all shadow-sm"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>معاينة في القارئ الغامر (Preview)</span>
                  </a>
                )}

                {activeTab === 'comics' && selectedComicId && (
                  <a
                    href={`/reader?comicId=${selectedComicId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setHasPreviewed(true)}
                    className="w-full py-2.5 rounded-xl bg-[#C5A15B]/20 hover:bg-[#C5A15B] text-antique-gold hover:text-midnight-navy font-bold text-xs flex items-center justify-center gap-2 border border-[#C5A15B]/40 transition-all shadow-sm"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>معاينة في قارئ الكوميكس (Preview)</span>
                  </a>
                )}

                {/* 3. Final Publish Action (The ONLY action that publishes!) */}
                <button
                  type="button"
                  disabled={
                    activeTab === 'novels'
                      ? !isNovelReadyToPublish
                      : activeTab === 'comics'
                      ? !isComicReadyToPublish
                      : !isPdfReadyToPublish
                  }
                  onClick={() => setShowPublishModal(true)}
                  className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg ${
                    (activeTab === 'novels' ? isNovelReadyToPublish : isComicReadyToPublish)
                      ? 'bg-gradient-to-r from-[#087C7B] to-[#0A9695] hover:brightness-110 text-white shadow-[#087C7B]/30'
                      : 'bg-zinc-800 text-zinc-500 border border-zinc-700/50 cursor-not-allowed'
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>اعتماد ونشر العمل نهائياً (Publish)</span>
                </button>

                {!(activeTab === 'novels' ? isNovelReadyToPublish : isComicReadyToPublish) && (
                  <p className="text-[10px] text-amber-400 text-center leading-relaxed">
                    ⚠️ زر النشر النهائي غير مفعل حتى يتم استيفاء شروط المحتوى في القائمة أعلاه.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          CONFIRMATION PUBLISH MODAL
      ───────────────────────────────────────────────────────────── */}
      {showPublishModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121A2C] border border-[#2B3B52] rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#087C7B] to-[#C5A15B] flex items-center justify-center text-white shadow-lg">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">تأكيد النشر الرسمي في المنظومة</h3>
                <p className="text-xs text-zinc-400">سيتم إتاحة العمل رسمياً لكافة قراء شبكة حكاياتي</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#090E1A] border border-[#1E2B42] space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-400">اسم العمل:</span>
                <span className="text-white font-bold">{activeTab === 'novels' ? storyTitle : comicTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">نوع العمل:</span>
                <span className="text-[#C5A15B] font-bold">
                  {activeTab === 'novels' ? 'رواية / كتاب أدبي' : 'قصة مصورة (Comic)'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">إجمالي المحتوى:</span>
                <span className="text-white font-mono">
                  {activeTab === 'novels' ? `${chapters.length} فصول` : `${comicPages.length} صفحات مصورة`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">إجراء النشر:</span>
                <span className="text-emerald-400 font-bold">تحديث الحالة إلى منشور (Published) وتوثيق سجل الرقابة</span>
              </div>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              هل أنت متأكد من اكتمال كافة الفصول والصفحات ومراجعتها في القارئ، وترغب في نشر العمل رسمياً الآن؟
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowPublishModal(false)}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold"
              >
                العودة للمحرر
              </button>
              <button
                type="button"
                disabled={isPublishing}
                onClick={handleFinalPublish}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#087C7B] to-[#0A9695] text-white text-xs font-bold flex items-center gap-2 shadow-xl shadow-[#087C7B]/30 hover:brightness-110"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isPublishing ? 'جاري الاعتماد والنشر...' : 'نعم، انشر العمل رسمياً الآن'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          CELEBRATION SUCCESS MODAL
      ───────────────────────────────────────────────────────────── */}
      {showSuccessModal && publishedItem && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#121A2C] border border-[#087C7B]/50 rounded-3xl max-w-lg w-full p-8 space-y-6 shadow-[0_25px_80px_rgba(8,124,123,0.3)] text-center">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#087C7B] to-[#C5A15B] flex items-center justify-center text-white shadow-2xl mx-auto animate-bounce">
              <PartyPopper className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white">🎉 مبارك! تم نشر العمل رسمياً بنجاح!</h3>
              <p className="text-xs text-zinc-300 max-w-sm mx-auto">
                تم اعتماد العمل وتحديث حالته إلى <span className="text-emerald-400 font-bold">منشور (Published)</span> وأصبح متاحاً للجمهور في منصة حكاياتي.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#090E1A] border border-[#1E2B42] text-xs space-y-1">
              <div className="text-white font-bold text-sm">{publishedItem.title}</div>
              <div className="text-[#C5A15B]">متاح الآن للقراءة والمطالعة في شبكة العوالم والأكوان</div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <a
                href={
                  publishedItem.type === 'story'
                    ? `/stories/${publishedItem.id}`
                    : `/comics/${publishedItem.id}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>عرض صفحة العمل العامة</span>
              </a>

              <a
                href={
                  publishedItem.type === 'story'
                    ? `/reader?storyId=${publishedItem.id}`
                    : `/reader?comicId=${publishedItem.id}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#C5A15B] to-[#D4AF37] text-midnight-navy font-bold text-xs flex items-center justify-center gap-2 shadow-lg"
              >
                <Eye className="w-4 h-4 text-midnight-navy" />
                <span>فتح القارئ التفاعلي المباشر</span>
              </a>
            </div>

            <button
              type="button"
              onClick={() => setShowSuccessModal(false)}
              className="text-xs text-zinc-500 hover:text-zinc-300 underline"
            >
              متابعة العمل في الاستوديو
            </button>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          QUICK PASTE MODAL
      ───────────────────────────────────────────────────────────── */}
      {showPasteModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121A2C] border border-[#213047] rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#C5A15B]" />
                <span>لصق نص الفصل المكتوب مسبقاً</span>
              </h4>
              <button onClick={() => setShowPasteModal(false)} className="text-zinc-400 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-zinc-400">
              قم بلصق محتوى الفصل هنا، وسيتم استبدال نص الفصل الحالي وحساب عدد الكلمات ووقت القراءة تلقائياً:
            </p>

            <textarea
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder="الصق النص هنا..."
              className="w-full h-64 bg-[#090E1A] border border-[#23334A] rounded-2xl p-4 text-white text-sm leading-relaxed outline-none focus:border-[#087C7B]"
            />

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowPasteModal(false)}
                className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-semibold"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleApplyPasteText}
                className="px-5 py-2 rounded-xl bg-[#087C7B] text-white text-xs font-bold shadow-md hover:bg-[#066160]"
              >
                اعتماد النص للفصل الحالي
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ChecklistItem({ label, isDone, note }: { label: string; isDone: boolean; note?: string }) {
  return (
    <div className="flex items-start justify-between gap-2 p-2 rounded-xl bg-[#0C1220] border border-[#1A2538]">
      <div className="flex items-center gap-2">
        <div
          className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
            isDone ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-zinc-500'
          }`}
        >
          {isDone ? <Check className="w-2.5 h-2.5" /> : <div className="w-1.5 h-1.5 rounded-full bg-zinc-600" />}
        </div>
        <div>
          <span className={`text-[11px] font-semibold ${isDone ? 'text-zinc-200' : 'text-zinc-400'}`}>{label}</span>
          {note && <div className="text-[10px] text-amber-400 mt-0.5">{note}</div>}
        </div>
      </div>
      <span className={`text-[10px] font-bold font-mono ${isDone ? 'text-emerald-400' : 'text-zinc-500'}`}>
        {isDone ? 'مكتمل' : 'قيد الإجراء'}
      </span>
    </div>
  );
}
