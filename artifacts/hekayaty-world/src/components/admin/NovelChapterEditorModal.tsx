import React, { useState, useEffect, useRef } from 'react';
import { ModalPortal } from './ModalPortal';
import {
  XCircle,
  BookOpen,
  Plus,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  Save,
  CheckCircle2,
  Clock,
  Sparkles,
  Lock,
  Unlock,
  Eye,
  Maximize2,
  Minimize2,
  FileText,
  AlignRight,
  AlignCenter,
  AlignLeft,
  Bold,
  Italic,
  Underline,
  Quote,
  List,
  Divide,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { api } from '@/lib/api';

export interface NovelChapter {
  id: string;
  chapter_number: number;
  title_ar: string;
  title_en?: string;
  subtitle?: string;
  content: string;
  summary_ar?: string;
  reading_time_minutes: number;
  word_count: number;
  status: 'draft' | 'published' | 'scheduled' | 'archived';
  access_level: 'public' | 'free_preview' | 'subscriber_only' | 'premium';
  scheduled_at?: string | null;
  cover_image_url?: string;
  updated_at?: string;
}

interface NovelChapterEditorModalProps {
  storyId: string;
  storyTitle: string;
  isOpen: boolean;
  onClose: () => void;
  toast: any;
  onSuccess?: () => void;
}

export function NovelChapterEditorModal({
  storyId,
  storyTitle,
  isOpen,
  onClose,
  toast,
  onSuccess,
}: NovelChapterEditorModalProps) {
  const [chapters, setChapters] = useState<NovelChapter[]>([]);
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  // Active Chapter form fields
  const [activeChapter, setActiveChapter] = useState<NovelChapter | null>(null);

  const editorRef = useRef<HTMLTextAreaElement>(null);

  const loadChapters = async () => {
    if (!storyId) return;
    setLoading(true);
    try {
      const res = await api.getAdminChapters(storyId);
      const chs: NovelChapter[] = res?.chapters || [];
      setChapters(chs);
      if (chs.length > 0) {
        // Select first or retain selection
        const target = selectedChapterId ? chs.find((c) => c.id === selectedChapterId) || chs[0] : chs[0];
        setSelectedChapterId(target.id);
        setActiveChapter({ ...target });
      } else {
        // Prepare template Chapter 1
        const initialChap: NovelChapter = {
          id: `chap_${Date.now()}`,
          chapter_number: 1,
          title_ar: 'الفصل الأول: البدايات المنسية',
          title_en: 'Chapter 1',
          subtitle: '',
          content: 'اكتب بداية أحداث الرواية والفصل الأول هنا...',
          summary_ar: '',
          reading_time_minutes: 5,
          word_count: 50,
          status: 'published',
          access_level: 'public',
        };
        setChapters([initialChap]);
        setSelectedChapterId(initialChap.id);
        setActiveChapter(initialChap);
      }
    } catch {
      toast({ title: 'تعذر تحميل فصول العمل', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && storyId) {
      loadChapters();
    }
  }, [isOpen, storyId]);

  if (!isOpen) return null;

  // Word count & reading time calculation
  const handleContentChange = (content: string) => {
    if (!activeChapter) return;
    const words = content.trim().split(/\s+/).filter(Boolean).length;
    const readTime = Math.max(1, Math.ceil(words / 180));
    setActiveChapter((prev) => (prev ? { ...prev, content, word_count: words, reading_time_minutes: readTime } : null));
    setHasUnsavedChanges(true);
  };

  // Add new Chapter
  const handleAddChapter = () => {
    const nextNum = chapters.length + 1;
    const newChap: NovelChapter = {
      id: `chap_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      chapter_number: nextNum,
      title_ar: `الفصل ${nextNum}: عنوان الفصل الجديد`,
      title_en: `Chapter ${nextNum}`,
      subtitle: '',
      content: '',
      summary_ar: '',
      reading_time_minutes: 3,
      word_count: 0,
      status: 'draft',
      access_level: nextNum > 2 ? 'subscriber_only' : 'public',
    };
    const updated = [...chapters, newChap];
    setChapters(updated);
    setSelectedChapterId(newChap.id);
    setActiveChapter({ ...newChap });
    setHasUnsavedChanges(true);
    toast({ title: `✨ تم فتح مسودة ${newChap.title_ar}` });
  };

  // Duplicate Chapter
  const handleDuplicateChapter = (ch: NovelChapter) => {
    const nextNum = chapters.length + 1;
    const dup: NovelChapter = {
      ...ch,
      id: `chap_${Date.now()}_dup`,
      chapter_number: nextNum,
      title_ar: `${ch.title_ar} (نسخة مكررة)`,
      status: 'draft',
    };
    const updated = [...chapters, dup];
    setChapters(updated);
    setSelectedChapterId(dup.id);
    setActiveChapter({ ...dup });
    setHasUnsavedChanges(true);
    toast({ title: 'تم تكرار الفصل بنجاح' });
  };

  // Delete Chapter
  const handleDeleteChapter = (chId: string, title: string) => {
    if (chapters.length <= 1) {
      toast({ title: 'لا يمكن حذف الفصل الوحيد المتبقي للرواية', variant: 'destructive' });
      return;
    }
    if (!window.confirm(`هل أنت متأكد من حذف "${title}"؟`)) return;

    const filtered = chapters.filter((c) => c.id !== chId);
    filtered.forEach((c, idx) => {
      c.chapter_number = idx + 1;
    });
    setChapters(filtered);
    const nextSelected = filtered[0];
    setSelectedChapterId(nextSelected.id);
    setActiveChapter({ ...nextSelected });
    setHasUnsavedChanges(true);
    toast({ title: 'تم حذف الفصل وإعادة ترقيم الفصول المتبقية' });
  };

  // Move Chapter Up/Down
  const handleMoveChapter = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= chapters.length) return;

    const updated = [...chapters];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;

    updated.forEach((c, i) => {
      c.chapter_number = i + 1;
    });

    setChapters(updated);
    setHasUnsavedChanges(true);
  };

  // Switch Selected Chapter
  const handleSelectChapter = (ch: NovelChapter) => {
    // If unsaved changes in current active chapter, save them to in-memory list first
    if (activeChapter) {
      setChapters((prev) => prev.map((c) => (c.id === activeChapter.id ? { ...activeChapter } : c)));
    }
    setSelectedChapterId(ch.id);
    setActiveChapter({ ...ch });
  };

  // Format Helper Buttons for Textarea
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

  // Save all chapters to backend
  const handleSaveAll = async () => {
    if (!activeChapter) return;
    setIsSaving(true);
    try {
      // Merge latest activeChapter into chapters array
      const currentList = chapters.map((c) => (c.id === activeChapter.id ? { ...activeChapter } : c));

      // Update story with structured chapters JSON
      const totalWords = currentList.reduce((s, c) => s + (c.word_count || 0), 0);
      const totalTime = currentList.reduce((s, c) => s + (c.reading_time_minutes || 0), 0);

      await api.updateAdminStory(storyId, {
        content: JSON.stringify({
          chapters: currentList,
          last_modified: new Date().toISOString(),
        }),
        word_count: totalWords,
        read_time_minutes: totalTime,
      });

      setChapters(currentList);
      setHasUnsavedChanges(false);
      toast({ title: '🎉 تم حفظ كافة الفصول وتحديث الرواية بنجاح!' });
      if (onSuccess) onSuccess();
    } catch (err: any) {
      toast({ title: 'فشل حفظ الفصول', description: err.message, variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!chapters || chapters.length === 0) {
      toast({ title: 'يرجى إضافة فصل واحد على الأقل قبل النشر', variant: 'destructive' });
      return;
    }
    const hasContent = chapters.some((c) => c.content && c.content.trim().length > 20);
    if (!hasContent) {
      toast({ title: 'يرجى كتابة محتوى الفصل قبل النشر النهائي', variant: 'destructive' });
      return;
    }
    if (!confirm('هل أنت متأكد من اعتماد ونشر هذه الرواية رسمياً وإتاحتها للجمهور؟')) return;

    setIsPublishing(true);
    try {
      await handleSaveAll();
      await api.publishAdminPublication(storyId, 'story');
      toast({ title: '🎉 تم اعتماد ونشر الرواية رسمياً بنجاح!' });
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
        className={`fixed inset-0 z-[9999] bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 font-arabic ${
          isFullscreen ? 'p-0' : ''
        }`}
        dir="rtl"
      >
        <div
          className={`bg-[#0F1626] border border-[#2B3B52] shadow-[0_25px_80px_rgba(0,0,0,0.95)] flex flex-col overflow-hidden transition-all ${
            isFullscreen ? 'w-full h-full rounded-none' : 'max-w-7xl w-full h-[92vh] rounded-3xl'
          }`}
        >
          {/* Top Bar Header */}
          <div className="px-6 py-3.5 bg-[#141E33] border-b border-[#24334A] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#087C7B] to-[#C5A15B] flex items-center justify-center text-white shadow-md">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-white text-sm">استوديو كتابة وإدارة الفصول الروائية</h3>
                  <span className="px-2 py-0.5 rounded-full bg-[#087C7B]/20 text-[#087C7B] text-[10px] font-bold border border-[#087C7B]/30">
                    {chapters.length} فصول
                  </span>
                  {hasUnsavedChanges && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      تعديلات غير محفوظة
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-400 mt-0.5 truncate max-w-md">{storyTitle}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={`/reader?storyId=${storyId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-xl bg-[#C5A15B]/20 hover:bg-[#C5A15B] text-antique-gold hover:text-midnight-navy font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
                title="معاينة الفصول في القارئ التفاعلي"
              >
                <Eye className="w-4 h-4" />
                <span>معاينة في القارئ</span>
              </a>

              <a
                href={`/publishing-studio?storyId=${storyId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs flex items-center gap-1.5 transition-all"
                title="الانتقال إلى استوديو النشر الكامل"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">الاستوديو الكامل</span>
              </a>

              <button
                type="button"
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2 rounded-xl bg-[#1B273F] hover:bg-[#253555] text-zinc-300 hover:text-white transition-colors"
                title={isFullscreen ? 'تصغير النافذة' : 'وضع ملء الشاشة للتركيز'}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={handleSaveAll}
                disabled={isSaving || isPublishing}
                className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold flex items-center gap-1.5 border border-zinc-700 transition-all"
              >
                <Save className="w-4 h-4 text-[#087C7B]" />
                <span>{isSaving ? 'جاري الحفظ...' : 'حفظ كمسودة (Save)'}</span>
              </button>

              <button
                type="button"
                onClick={handlePublish}
                disabled={isSaving || isPublishing}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#087C7B] to-[#0A9695] text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-[#087C7B]/25 hover:brightness-110 transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isPublishing ? 'جاري النشر...' : 'نشر العمل نهائياً (Publish)'}</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="text-zinc-400 hover:text-white p-1.5 rounded-xl hover:bg-zinc-800 transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Main 2-Column Body */}
          <div className="flex-1 flex overflow-hidden">
            {/* Sidebar: Table of Contents & Chapter Navigator */}
            <div className="w-80 border-l border-[#24334A] bg-[#0C1220] flex flex-col shrink-0">
              <div className="p-3 border-b border-[#24334A] flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#C5A15B]" />
                  <span>فهرس الفصول (TOC)</span>
                </span>
                <button
                  type="button"
                  onClick={handleAddChapter}
                  className="px-2.5 py-1.5 rounded-lg bg-[#087C7B] hover:bg-[#066160] text-white text-[11px] font-bold flex items-center gap-1 shadow-sm transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>إضافة فصل</span>
                </button>
              </div>

              {/* Chapter list */}
              <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
                {chapters.map((ch, idx) => {
                  const isSelected = ch.id === selectedChapterId;
                  return (
                    <div
                      key={ch.id}
                      onClick={() => handleSelectChapter(ch)}
                      className={`p-2.5 rounded-xl border text-right transition-all cursor-pointer flex items-center justify-between group ${
                        isSelected
                          ? 'bg-[#18253D] border-[#087C7B] text-white shadow-md'
                          : 'bg-[#11192A] border-transparent hover:border-[#24334A] text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold ${
                              isSelected ? 'bg-[#087C7B] text-white' : 'bg-zinc-800 text-zinc-400'
                            }`}
                          >
                            #{ch.chapter_number}
                          </span>
                          <span className="font-semibold text-xs truncate text-white">{ch.title_ar}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-zinc-500">
                          <span>{ch.word_count || 0} كلمة</span>
                          <span>•</span>
                          <span>{ch.reading_time_minutes || 1} د قراءة</span>
                          <span>•</span>
                          <span
                            className={
                              ch.access_level === 'public'
                                ? 'text-teal-400'
                                : ch.access_level === 'free_preview'
                                ? 'text-amber-400'
                                : 'text-purple-400 font-bold'
                            }
                          >
                            {ch.access_level === 'public'
                              ? 'عام'
                              : ch.access_level === 'free_preview'
                              ? 'معاينة'
                              : 'مشتركين'}
                          </span>
                        </div>
                      </div>

                      {/* Move & Actions */}
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveChapter(idx, 'up');
                          }}
                          disabled={idx === 0}
                          className="p-1 text-zinc-400 hover:text-white disabled:opacity-30"
                          title="تحريك لأعلى"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveChapter(idx, 'down');
                          }}
                          disabled={idx === chapters.length - 1}
                          className="p-1 text-zinc-400 hover:text-white disabled:opacity-30"
                          title="تحريك لأسفل"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDuplicateChapter(ch);
                          }}
                          className="p-1 text-zinc-400 hover:text-[#C5A15B]"
                          title="تكرار الفصل"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteChapter(ch.id, ch.title_ar);
                          }}
                          className="p-1 text-zinc-400 hover:text-red-400"
                          title="حذف الفصل"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Active Chapter Editor Area */}
            {activeChapter ? (
              <div className="flex-1 flex flex-col overflow-hidden bg-[#0F1626]">
                {/* Meta Controls Ribbon */}
                <div className="p-4 bg-[#121B2F] border-b border-[#24334A] grid grid-cols-1 sm:grid-cols-12 gap-3 shrink-0">
                  <div className="sm:col-span-6">
                    <label className="block text-[11px] font-bold text-zinc-400 mb-1">عنوان الفصل *</label>
                    <input
                      type="text"
                      value={activeChapter.title_ar}
                      onChange={(e) => {
                        setActiveChapter({ ...activeChapter, title_ar: e.target.value });
                        setHasUnsavedChanges(true);
                      }}
                      className="w-full bg-[#0C1220] border border-[#24334A] rounded-xl px-3 py-1.5 text-xs text-white outline-none focus:border-[#087C7B]"
                      placeholder="مثال: الفصل الثالث: بوابة الزمن"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-[11px] font-bold text-zinc-400 mb-1">مستوى الوصول (Access Level)</label>
                    <select
                      value={activeChapter.access_level}
                      onChange={(e) => {
                        setActiveChapter({ ...activeChapter, access_level: e.target.value as any });
                        setHasUnsavedChanges(true);
                      }}
                      className="w-full bg-[#0C1220] border border-[#24334A] rounded-xl px-3 py-1.5 text-xs text-white outline-none focus:border-[#087C7B]"
                    >
                      <option value="public">عام ومجاني (Public Free)</option>
                      <option value="free_preview">معاينة تمهيدية مجانية</option>
                      <option value="subscriber_only">حصري للمشتركين (Subscriber Only)</option>
                      <option value="premium">مدفوع / VIP Premium</option>
                    </select>
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-[11px] font-bold text-zinc-400 mb-1">حالة الفصل (Status)</label>
                    <select
                      value={activeChapter.status}
                      onChange={(e) => {
                        setActiveChapter({ ...activeChapter, status: e.target.value as any });
                        setHasUnsavedChanges(true);
                      }}
                      className="w-full bg-[#0C1220] border border-[#24334A] rounded-xl px-3 py-1.5 text-xs text-white outline-none focus:border-[#087C7B]"
                    >
                      <option value="published">منشور فوراً (Published)</option>
                      <option value="draft">مسودة قيد الكتابة (Draft)</option>
                      <option value="scheduled">مجدول للنشر (Scheduled)</option>
                    </select>
                  </div>
                </div>

                {/* Rich Formatting Toolbar */}
                <div className="px-4 py-2 bg-[#10182A] border-b border-[#24334A] flex flex-wrap items-center justify-between gap-2 shrink-0">
                  <div className="flex items-center gap-1 text-zinc-300">
                    <button
                      type="button"
                      onClick={() => insertFormatting('**', '**')}
                      className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white"
                      title="خط عريض (Bold)"
                    >
                      <Bold className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatting('*', '*')}
                      className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white"
                      title="مائل (Italic)"
                    >
                      <Italic className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatting('<u>', '</u>')}
                      className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white"
                      title="تحته خط"
                    >
                      <Underline className="w-4 h-4" />
                    </button>
                    <span className="w-px h-4 bg-zinc-700 mx-1" />
                    <button
                      type="button"
                      onClick={() => insertFormatting('\n## ')}
                      className="px-2 py-1 rounded-lg hover:bg-zinc-800 text-xs font-bold text-zinc-300"
                      title="عنوان فرعي H2"
                    >
                      H2
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatting('\n### ')}
                      className="px-2 py-1 rounded-lg hover:bg-zinc-800 text-xs font-bold text-zinc-300"
                      title="عنوان فرعي H3"
                    >
                      H3
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatting('\n> ')}
                      className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white"
                      title="اقتباس سردي"
                    >
                      <Quote className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatting('\n- ')}
                      className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white"
                      title="قائمة نقطية"
                    >
                      <List className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatting('\n\n* * *\n\n')}
                      className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white"
                      title="فاصل مشاهد سردية"
                    >
                      <Divide className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-zinc-400">
                    <span className="flex items-center gap-1 font-mono">
                      <span>{activeChapter.word_count || 0}</span> كلمة
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-zinc-500" />
                      <span>{activeChapter.reading_time_minutes || 1} دقيقة قراءة</span>
                    </span>
                  </div>
                </div>

                {/* Writing Canvas / Textarea */}
                <div className="flex-1 p-6 overflow-y-auto flex justify-center">
                  <textarea
                    ref={editorRef}
                    value={activeChapter.content}
                    onChange={(e) => handleContentChange(e.target.value)}
                    placeholder="اكتب فصول ومجريات هذا الفصل بحرية وسلاسة تامة باللغة العربية أو الإنجليزية..."
                    className="w-full max-w-4xl h-full bg-transparent text-zinc-100 placeholder-zinc-600 outline-none resize-none leading-relaxed text-base font-arabic select-text"
                    style={{ minHeight: '400px' }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-zinc-500">
                <BookOpen className="w-12 h-12 mb-3 text-zinc-600" />
                <p>اختر فصلاً من القائمة الجانبية للبدء في كتابته وتعديله</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}
