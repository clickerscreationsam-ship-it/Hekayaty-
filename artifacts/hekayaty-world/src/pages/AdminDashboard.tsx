import React, { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import {
  Shield,
  Users,
  BookOpen,
  Sparkles,
  Globe,
  Coins,
  Search,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Calendar,
  Layers,
  Lock,
  Package,
  Activity,
  Award,
  DollarSign,
  TrendingUp,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  FileCheck,
  Building,
  UserCheck,
  UserX,
  Upload,
  Zap,
} from 'lucide-react';
import { Link } from 'wouter';
import { ImageUploadField } from '@/components/common/ImageUploadField';
import { UnifiedCreationWizardModal } from '@/components/admin/UnifiedCreationWizardModal';
import { ComicPagesStudioModal } from '@/components/admin/ComicPagesStudioModal';
import { PowersStudioModal } from '@/components/admin/PowersStudioModal';
import { TimelineStudioModal } from '@/components/admin/TimelineStudioModal';
import { CharacterCreationModal } from '@/components/admin/CharacterCreationModal';
import { NovelChapterEditorModal } from '@/components/admin/NovelChapterEditorModal';
import { ModalPortal } from '@/components/admin/ModalPortal';
import { SEOManagerSection } from '@/components/admin/SEOManagerSection';
import { MysteryMgmtPanel } from '@/components/admin/MysteryMgmtPanel';
import { SeriesPlatformMgmtPanel } from '@/components/admin/SeriesPlatformMgmtPanel';

type AdminTab =
  | 'overview'
  | 'content_mgmt'
  | 'series_platform'
  | 'characters_studio'
  | 'universe_studio'
  | 'ip_mgmt'
  | 'publishing_mgmt'
  | 'operations'
  | 'events_mgmt'
  | 'mystery_mgmt'
  | 'seo_mgmt';

type ContentSubTab = 'comics' | 'stories' | 'series' | 'classification';
type OperationsSubTab = 'financials' | 'users' | 'applications' | 'commerce' | 'audit';

// ─────────────────────────────────────────────────────────────────────────────
// EVENTS MANAGEMENT PANEL (self-contained component to avoid bloating Dashboard)
// ─────────────────────────────────────────────────────────────────────────────
function EventsMgmtPanel({ toast }: { toast: any }) {
  const [events, setEvents] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Modals state
  const [showCreateEvent, setShowCreateEvent] = React.useState(false);
  const [showEditEvent, setShowEditEvent] = React.useState(false);
  const [editingEvent, setEditingEvent] = React.useState<any | null>(null);
  const [showCreateComp, setShowCreateComp] = React.useState(false);
  const [showCreateVoting, setShowCreateVoting] = React.useState(false);
  const [showIssueAward, setShowIssueAward] = React.useState(false);

  const [selectedEventId, setSelectedEventId] = React.useState('');

  // Default Event Form State
  const defaultEventForm = {
    title_ar: '',
    title_en: '',
    slug: '',
    description_ar: '',
    event_type: 'carnival',
    status: 'active',
    theme: '',
    theme_color: '#C5A15B',
    start_date: '',
    end_date: '',
    location: 'منصة حكاياتي الرقمية',
    is_online: true,
    image_url: '',
    mobile_image_url: '',
    is_featured: true,
    banner_priority: 1,
    show_announcement_bar: true,
    countdown_enabled: true,
    custom_cta_label: 'استكشف الفعالية الآن',
    custom_cta_url: '',
  };

  const [eventForm, setEventForm] = React.useState(defaultEventForm);
  const [compForm, setCompForm] = React.useState({
    title_ar: '', description_ar: '', category: '', start_date: '', end_date: '', prizes: '',
  });
  const [votingForm, setVotingForm] = React.useState({
    title_ar: '', nominees: [{ name: '', description: '' }], visibility: 'live',
  });
  const [awardForm, setAwardForm] = React.useState({
    winner_name: '', award_title: '', rank: 'المركز الأول', category: '', work_title: '', notes: '',
  });

  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    api.adminListEvents().then(d => { setEvents(d || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const refreshEvents = () => {
    api.adminListEvents().then(d => setEvents(d || [])).catch(() => {});
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.adminCreateEvent(eventForm);
      toast({ title: '✅ تم إنشاء ونشر الكرنفال/الفعالية بنجاح!' });
      setShowCreateEvent(false);
      setEventForm(defaultEventForm);
      refreshEvents();
    } catch (err: any) {
      toast({ title: err.message || 'خطأ في إنشاء الفعالية', variant: 'destructive' });
    } finally { setSubmitting(false); }
  };

  const handleOpenEdit = (ev: any) => {
    setEditingEvent(ev);
    setEventForm({
      title_ar: ev.title_ar || '',
      title_en: ev.title_en || '',
      slug: ev.slug || ev.id || '',
      description_ar: ev.description_ar || '',
      event_type: ev.event_type || 'carnival',
      status: ev.status || 'active',
      theme: ev.theme || '',
      theme_color: ev.theme_color || '#C5A15B',
      start_date: ev.start_date ? ev.start_date.split('T')[0] : '',
      end_date: ev.end_date ? ev.end_date.split('T')[0] : '',
      location: ev.location || 'منصة حكاياتي الرقمية',
      is_online: ev.is_online !== false,
      image_url: ev.image_url || '',
      mobile_image_url: ev.mobile_image_url || ev.image_url || '',
      is_featured: ev.is_featured !== false,
      banner_priority: ev.banner_priority || 1,
      show_announcement_bar: ev.show_announcement_bar !== false,
      countdown_enabled: ev.countdown_enabled !== false,
      custom_cta_label: ev.custom_cta_label || 'استكشف الفعالية الآن',
      custom_cta_url: ev.custom_cta_url || `/events/${ev.slug || ev.id}`,
    });
    setShowEditEvent(true);
  };

  const handleUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;
    setSubmitting(true);
    try {
      await api.adminUpdateEvent(editingEvent.id || editingEvent.slug, eventForm);
      toast({ title: '✅ تم تعديل بيانات الكرنفال بنجاح!' });
      setShowEditEvent(false);
      setEditingEvent(null);
      setEventForm(defaultEventForm);
      refreshEvents();
    } catch (err: any) {
      toast({ title: err.message || 'خطأ في تعديل الفعالية', variant: 'destructive' });
    } finally { setSubmitting(false); }
  };

  const handleDeleteEvent = async (ev: any) => {
    const confirmDelete = window.confirm(`هل أنت متأكد من رغبتك في حذف الكرنفال/الفعالية "${ev.title_ar}" نهائياً؟`);
    if (!confirmDelete) return;

    try {
      await api.adminDeleteEvent(ev.id || ev.slug);
      toast({ title: '🗑️ تم حذف الكرنفال بنجاح!' });
      refreshEvents();
    } catch (err: any) {
      toast({ title: err.message || 'فشل في حذف الكرنفال', variant: 'destructive' });
    }
  };

  const handleCreateComp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEventId) { toast({ title: 'اختر الفعالية أولاً', variant: 'destructive' }); return; }
    setSubmitting(true);
    try {
      await api.adminCreateCompetition(selectedEventId, compForm);
      toast({ title: '✅ تم إنشاء المسابقة بنجاح!' });
      setShowCreateComp(false);
    } catch (err: any) {
      toast({ title: err.message || 'خطأ', variant: 'destructive' });
    } finally { setSubmitting(false); }
  };

  const handleCreateVoting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEventId) { toast({ title: 'اختر الفعالية أولاً', variant: 'destructive' }); return; }
    setSubmitting(true);
    try {
      await api.adminCreateVotingRound(selectedEventId, votingForm);
      toast({ title: '✅ تم فتح جولة التصويت!' });
      setShowCreateVoting(false);
    } catch (err: any) {
      toast({ title: err.message || 'خطأ', variant: 'destructive' });
    } finally { setSubmitting(false); }
  };

  const handleIssueAward = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEventId) { toast({ title: 'اختر الفعالية أولاً', variant: 'destructive' }); return; }
    setSubmitting(true);
    try {
      const result = await api.adminIssueAward(selectedEventId, awardForm);
      toast({ title: `✅ تم إصدار الشهادة! رقمها: ${result?.certId || ''}` });
      setShowIssueAward(false);
    } catch (err: any) {
      toast({ title: err.message || 'خطأ', variant: 'destructive' });
    } finally { setSubmitting(false); }
  };

  const inputCls = 'w-full bg-[#0B1320] border border-[#2B3B52] rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-[#C5A15B]';
  const labelCls = 'block text-zinc-300 text-sm mb-1.5 font-semibold';
  const modalCls = 'fixed inset-0 z-[9999] bg-black/85 backdrop-blur-md overflow-y-auto p-4 flex items-center justify-center';
  const modalBoxCls = 'bg-[#141E2E] border border-zinc-700/80 rounded-2xl max-w-2xl w-full shadow-[0_25px_80px_rgba(0,0,0,0.9)] flex flex-col max-h-[90vh] overflow-hidden my-auto';

  return (
    <div className="space-y-8 font-arabic" dir="rtl">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-[#C5A15B] flex items-center gap-2">
          <span>🎪</span> مركز إدارة وتفعيل الكرنفالات والاحتفالات
        </h2>
        <p className="text-zinc-400 text-sm mt-1">
          إنشاء، تعديل، حذف، وتفعيل الفعاليات الكبرى والكرنفالات الرسمية مع ربطها المباشر ببانر الصفحة الرئيسية وصفحات الهبوط التفاعلية.
        </p>
      </div>

      {/* Quick Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <button onClick={() => { setEventForm(defaultEventForm); setShowCreateEvent(true); }} className="px-5 py-2.5 bg-gradient-to-r from-[#C5A15B] to-[#E5C77D] text-black font-extrabold rounded-xl text-sm shadow-[0_0_20px_rgba(197,161,91,0.4)] hover:scale-105 transition-all flex items-center gap-2">
          <span>✨</span>
          <span>+ إنشاء كرنفال / فعالية جديدة</span>
        </button>
        <button onClick={() => setShowCreateComp(true)} className="px-4 py-2.5 bg-[#087C7B]/20 border border-[#087C7B]/50 text-[#087C7B] font-bold rounded-xl text-sm hover:bg-[#087C7B] hover:text-white transition-all">
          + إضافة مسابقة
        </button>
        <button onClick={() => setShowCreateVoting(true)} className="px-4 py-2.5 bg-purple-900/30 border border-purple-500/40 text-purple-300 font-bold rounded-xl text-sm hover:bg-purple-700 hover:text-white transition-all">
          + فتح جولة تصويت
        </button>
        <button onClick={() => setShowIssueAward(true)} className="px-4 py-2.5 bg-yellow-900/30 border border-yellow-500/40 text-yellow-300 font-bold rounded-xl text-sm hover:bg-yellow-700 hover:text-white transition-all">
          🏅 إصدار جائزة / شهادة
        </button>
      </div>

      {/* Events List */}
      <div>
        <h3 className="text-lg font-bold text-zinc-200 mb-4 flex items-center justify-between">
          <span>الكرنفالات والفعاليات المسجلة ({events.length})</span>
          <button onClick={refreshEvents} className="text-xs text-[#087C7B] hover:underline">تحديث القائمة ⟳</button>
        </h3>
        {loading && <div className="flex justify-center py-10"><div className="w-8 h-8 rounded-full border-4 border-[#C5A15B]/30 border-t-[#C5A15B] animate-spin" /></div>}
        {!loading && events.length === 0 && (
          <div className="text-center py-12 text-zinc-500 bg-[#101726] rounded-2xl border border-zinc-800">
            <p className="text-4xl mb-3">🎪</p>
            <p className="text-base text-zinc-300 font-bold">لا توجد فعاليات مسجلة حالياً</p>
            <p className="text-sm mt-1">اضغط على زر إنشاء فعالية لبدء أول كرنفال واحتفال في المنصة.</p>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {events.map(event => (
            <div key={event.id || event.slug} className="bg-[#121A2A] border border-[#223048] rounded-2xl p-4 space-y-3 hover:border-[#C5A15B]/50 transition-all shadow-lg flex flex-col justify-between">
              <div>
                <div className="relative">
                  <img
                    src={event.image_url || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80'}
                    alt={event.title_ar}
                    className="w-full h-36 object-cover rounded-xl mb-3 border border-white/5"
                  />
                  {event.is_featured && (
                    <span className="absolute top-2 right-2 bg-gradient-to-r from-amber-500 to-yellow-600 text-black text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow-md">
                      🌟 مميز في الرئيسية
                    </span>
                  )}
                  {event.event_type && (
                    <span className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm text-zinc-300 text-[10px] font-bold px-2 py-0.5 rounded-md border border-white/10">
                      {event.event_type}
                    </span>
                  )}
                </div>

                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-bold text-base text-white leading-snug line-clamp-2">{event.title_ar}</h4>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border shrink-0 ${
                    event.status === 'active' ? 'bg-green-500/20 border-green-500/40 text-green-400'
                    : event.status === 'voting_open' ? 'bg-purple-500/20 border-purple-500/40 text-purple-400'
                    : event.status === 'scheduled' ? 'bg-blue-500/20 border-blue-500/40 text-blue-400'
                    : event.status === 'completed' ? 'bg-zinc-700/40 border-zinc-600 text-zinc-400'
                    : 'bg-zinc-800 border-zinc-700 text-zinc-400'
                  }`}>{event.status}</span>
                </div>

                {event.theme && (
                  <p className="text-xs text-[#E1C58B] mt-1 font-semibold line-clamp-1">
                    🎨 الهوية: {event.theme}
                  </p>
                )}

                <p className="text-[11px] text-zinc-500 font-mono mt-1">
                  المعرف: {event.slug || event.id}
                </p>
              </div>

              {/* Action Buttons: Edit, Delete, View */}
              <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between gap-2">
                <a
                  href={`/events/${event.slug || event.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#087C7B] hover:text-[#0AA3A2] font-semibold flex items-center gap-1"
                >
                  <span>عرض الصفحة</span>
                  <span>↗</span>
                </a>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(event)}
                    className="px-3 py-1 rounded-lg bg-[#C5A15B]/15 hover:bg-[#C5A15B]/30 text-[#E1C58B] border border-[#C5A15B]/30 text-xs font-bold transition-all flex items-center gap-1"
                    title="تعديل بيانات الكرنفال"
                  >
                    <span>✏️</span>
                    <span>تعديل</span>
                  </button>

                  <button
                    onClick={() => handleDeleteEvent(event)}
                    className="px-3 py-1 rounded-lg bg-red-900/20 hover:bg-red-800/40 text-red-400 border border-red-500/30 text-xs font-bold transition-all flex items-center gap-1"
                    title="حذف الكرنفال نهائياً"
                  >
                    <span>🗑️</span>
                    <span>حذف</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── CREATE EVENT MODAL ── */}
      {showCreateEvent && (
        <div className={modalCls}>
          <div className={modalBoxCls}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-[#162235] shrink-0">
              <h3 className="text-lg font-bold text-[#C5A15B] flex items-center gap-2">
                <span>🎪</span>
                <span>إنشاء فعالية / كرنفال احتفالي جديد</span>
              </h3>
              <button onClick={() => setShowCreateEvent(false)} className="text-zinc-400 hover:text-white text-xl leading-none">×</button>
            </div>
            <form onSubmit={handleCreateEvent} className="overflow-y-auto">
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className={labelCls}>العنوان بالعربية *</label>
                  <input required className={inputCls} value={eventForm.title_ar} onChange={e => setEventForm(f => ({ ...f, title_ar: e.target.value }))} placeholder="كرنفال حكاياتي الكبير 2027 — صراع الفصول والممالك" />
                </div>
                <div>
                  <label className={labelCls}>العنوان بالإنجليزية</label>
                  <input className={inputCls} value={eventForm.title_en} onChange={e => setEventForm(f => ({ ...f, title_en: e.target.value }))} dir="ltr" placeholder="Hekayaty Grand Carnival 2027" />
                </div>
                <div>
                  <label className={labelCls}>المعرّف اللطيف (Slug) *</label>
                  <input required className={inputCls} value={eventForm.slug} onChange={e => setEventForm(f => ({ ...f, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') }))} dir="ltr" placeholder="hekayaty-carnival-2027" />
                </div>
                <div>
                  <label className={labelCls}>نوع الفعالية</label>
                  <select className={inputCls} value={eventForm.event_type} onChange={e => setEventForm(f => ({ ...f, event_type: e.target.value }))}>
                    <option value="carnival">كرنفال (Carnival)</option>
                    <option value="festival">مهرجان (Festival)</option>
                    <option value="awards">جوائز سنوية (Awards)</option>
                    <option value="competition">مسابقة كبرى (Competition)</option>
                    <option value="reading_challenge">تحدي قراءة (Reading Challenge)</option>
                    <option value="community">فعالية مجتمعية (Community Event)</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>حالة الفعالية والتفعيل</label>
                  <select className={inputCls} value={eventForm.status} onChange={e => setEventForm(f => ({ ...f, status: e.target.value }))}>
                    <option value="active">🟢 نشط ومفعّل في المنصة (Active)</option>
                    <option value="voting_open">🟣 التصويت مفتوح (Voting Open)</option>
                    <option value="registration_open">🔵 التسجيل مفتوح (Registration Open)</option>
                    <option value="scheduled">🟡 مجدول وقادم قريباً (Scheduled)</option>
                    <option value="draft">⚪ مسودة قيد التحضير (Draft)</option>
                    <option value="completed">⚫ منتهي ومكتمل (Completed)</option>
                    <option value="archived">📦 مؤرشف (Archived)</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className={labelCls}>الوصف الترويجي الشامل *</label>
                  <textarea rows={3} required className={inputCls} value={eventForm.description_ar} onChange={e => setEventForm(f => ({ ...f, description_ar: e.target.value }))} placeholder="تفاصيل الكرنفال، الأهداف، الفئات المستهدفة، وحجم الجوائز والمكافآت..." />
                </div>

                <div>
                  <label className={labelCls}>الثيم والهوية البصرية</label>
                  <input className={inputCls} value={eventForm.theme} onChange={e => setEventForm(f => ({ ...f, theme: e.target.value }))} placeholder="صراع الفصول والأبعاد الكونية" />
                </div>
                <div>
                  <label className={labelCls}>لون السمة الترويجي الرئيسي</label>
                  <div className="flex gap-2">
                    <input type="color" className="w-12 h-10 rounded-lg cursor-pointer bg-transparent border border-zinc-700" value={eventForm.theme_color} onChange={e => setEventForm(f => ({ ...f, theme_color: e.target.value }))} />
                    <input className={inputCls} value={eventForm.theme_color} onChange={e => setEventForm(f => ({ ...f, theme_color: e.target.value }))} dir="ltr" />
                  </div>
                </div>

                <div>
                  <label className={labelCls}>تاريخ الانطلاق (البداية)</label>
                  <input type="date" className={inputCls} value={eventForm.start_date} onChange={e => setEventForm(f => ({ ...f, start_date: e.target.value }))} dir="ltr" />
                </div>
                <div>
                  <label className={labelCls}>تاريخ الختام (النهاية)</label>
                  <input type="date" className={inputCls} value={eventForm.end_date} onChange={e => setEventForm(f => ({ ...f, end_date: e.target.value }))} dir="ltr" />
                </div>

                <div>
                  <label className={labelCls}>الموقع أو المكان</label>
                  <input className={inputCls} value={eventForm.location} onChange={e => setEventForm(f => ({ ...f, location: e.target.value }))} placeholder="منصة حكاياتي الرقمية / الرياض" />
                </div>
                <div>
                  <label className={labelCls}>نص زر الإجراء (CTA)</label>
                  <input className={inputCls} value={eventForm.custom_cta_label} onChange={e => setEventForm(f => ({ ...f, custom_cta_label: e.target.value }))} placeholder="استكشف الكرنفال وشارك الآن" />
                </div>

                {/* Banner & Placement Toggles */}
                <div className="sm:col-span-2 p-4 bg-[#0B1320] rounded-xl border border-zinc-800 space-y-3">
                  <h4 className="text-xs font-bold text-[#E1C58B]">خيارات الظهور والترويج الشامل</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                      <input type="checkbox" checked={eventForm.is_featured} onChange={e => setEventForm(f => ({ ...f, is_featured: e.target.checked }))} className="w-4 h-4 rounded text-[#C5A15B]" />
                      <span>عرض في بانر الرئيسية</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                      <input type="checkbox" checked={eventForm.show_announcement_bar} onChange={e => setEventForm(f => ({ ...f, show_announcement_bar: e.target.checked }))} className="w-4 h-4 rounded text-[#C5A15B]" />
                      <span>تفعيل شريط التنبيه العلوي</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                      <input type="checkbox" checked={eventForm.countdown_enabled} onChange={e => setEventForm(f => ({ ...f, countdown_enabled: e.target.checked }))} className="w-4 h-4 rounded text-[#C5A15B]" />
                      <span>تفعيل العداد التنازلي</span>
                    </label>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <ImageUploadField
                    label="صورة البانر السينمائي الرئيسية (سطح المكتب)"
                    value={eventForm.image_url}
                    onChange={(url) => setEventForm(f => ({ ...f, image_url: url }))}
                    folder="events"
                    previewAspect="cover"
                  />
                </div>

                <div className="sm:col-span-2">
                  <ImageUploadField
                    label="صورة البانر المخصصة للهواتف (Mobile Artwork)"
                    value={eventForm.mobile_image_url}
                    onChange={(url) => setEventForm(f => ({ ...f, mobile_image_url: url }))}
                    folder="events"
                    previewAspect="cover"
                  />
                </div>
              </div>

              <div className="px-6 py-4 border-t border-zinc-800 bg-[#162235] flex items-center justify-end gap-3 shrink-0">
                <button type="button" onClick={() => setShowCreateEvent(false)} className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-semibold">إلغاء</button>
                <button type="submit" disabled={submitting} className="px-6 py-2.5 rounded-xl bg-[#C5A15B] hover:bg-[#E5C77D] text-black text-sm font-extrabold shadow-lg disabled:opacity-50 transition-all">
                  {submitting ? '⏳ جاري التأسيس والتفعيل...' : '🚀 إنشاء وتفعيل الكرنفال'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── EDIT EVENT MODAL ── */}
      {showEditEvent && (
        <div className={modalCls}>
          <div className={modalBoxCls}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-[#162235] shrink-0">
              <h3 className="text-lg font-bold text-[#C5A15B] flex items-center gap-2">
                <span>✏️</span>
                <span>تعديل بيانات الكرنفال: {editingEvent?.title_ar}</span>
              </h3>
              <button onClick={() => setShowEditEvent(false)} className="text-zinc-400 hover:text-white text-xl leading-none">×</button>
            </div>
            <form onSubmit={handleUpdateEvent} className="overflow-y-auto">
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className={labelCls}>العنوان بالعربية *</label>
                  <input required className={inputCls} value={eventForm.title_ar} onChange={e => setEventForm(f => ({ ...f, title_ar: e.target.value }))} />
                </div>
                <div>
                  <label className={labelCls}>العنوان بالإنجليزية</label>
                  <input className={inputCls} value={eventForm.title_en} onChange={e => setEventForm(f => ({ ...f, title_en: e.target.value }))} dir="ltr" />
                </div>
                <div>
                  <label className={labelCls}>المعرّف (Slug)</label>
                  <input disabled className={inputCls + ' opacity-60 cursor-not-allowed'} value={eventForm.slug} dir="ltr" />
                </div>
                <div>
                  <label className={labelCls}>نوع الفعالية</label>
                  <select className={inputCls} value={eventForm.event_type} onChange={e => setEventForm(f => ({ ...f, event_type: e.target.value }))}>
                    <option value="carnival">كرنفال (Carnival)</option>
                    <option value="festival">مهرجان (Festival)</option>
                    <option value="awards">جوائز سنوية (Awards)</option>
                    <option value="competition">مسابقة كبرى (Competition)</option>
                    <option value="reading_challenge">تحدي قراءة (Reading Challenge)</option>
                    <option value="community">فعالية مجتمعية (Community Event)</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>حالة الفعالية والتفعيل</label>
                  <select className={inputCls} value={eventForm.status} onChange={e => setEventForm(f => ({ ...f, status: e.target.value }))}>
                    <option value="active">🟢 نشط ومفعّل في المنصة (Active)</option>
                    <option value="voting_open">🟣 التصويت مفتوح (Voting Open)</option>
                    <option value="registration_open">🔵 التسجيل مفتوح (Registration Open)</option>
                    <option value="scheduled">🟡 مجدول وقادم قريباً (Scheduled)</option>
                    <option value="draft">⚪ مسودة قيد التحضير (Draft)</option>
                    <option value="completed">⚫ منتهي ومكتمل (Completed)</option>
                    <option value="archived">📦 مؤرشف (Archived)</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className={labelCls}>الوصف الترويجي</label>
                  <textarea rows={3} className={inputCls} value={eventForm.description_ar} onChange={e => setEventForm(f => ({ ...f, description_ar: e.target.value }))} />
                </div>

                <div>
                  <label className={labelCls}>الثيم والهوية البصرية</label>
                  <input className={inputCls} value={eventForm.theme} onChange={e => setEventForm(f => ({ ...f, theme: e.target.value }))} />
                </div>
                <div>
                  <label className={labelCls}>لون السمة الترويجي الرئيسي</label>
                  <div className="flex gap-2">
                    <input type="color" className="w-12 h-10 rounded-lg cursor-pointer bg-transparent border border-zinc-700" value={eventForm.theme_color} onChange={e => setEventForm(f => ({ ...f, theme_color: e.target.value }))} />
                    <input className={inputCls} value={eventForm.theme_color} onChange={e => setEventForm(f => ({ ...f, theme_color: e.target.value }))} dir="ltr" />
                  </div>
                </div>

                <div>
                  <label className={labelCls}>تاريخ الانطلاق</label>
                  <input type="date" className={inputCls} value={eventForm.start_date} onChange={e => setEventForm(f => ({ ...f, start_date: e.target.value }))} dir="ltr" />
                </div>
                <div>
                  <label className={labelCls}>تاريخ الختام</label>
                  <input type="date" className={inputCls} value={eventForm.end_date} onChange={e => setEventForm(f => ({ ...f, end_date: e.target.value }))} dir="ltr" />
                </div>

                <div>
                  <label className={labelCls}>الموقع</label>
                  <input className={inputCls} value={eventForm.location} onChange={e => setEventForm(f => ({ ...f, location: e.target.value }))} />
                </div>
                <div>
                  <label className={labelCls}>نص زر الإجراء (CTA)</label>
                  <input className={inputCls} value={eventForm.custom_cta_label} onChange={e => setEventForm(f => ({ ...f, custom_cta_label: e.target.value }))} />
                </div>

                {/* Banner & Placement Toggles */}
                <div className="sm:col-span-2 p-4 bg-[#0B1320] rounded-xl border border-zinc-800 space-y-3">
                  <h4 className="text-xs font-bold text-[#E1C58B]">خيارات الظهور والترويج الشامل</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                      <input type="checkbox" checked={eventForm.is_featured} onChange={e => setEventForm(f => ({ ...f, is_featured: e.target.checked }))} className="w-4 h-4 rounded text-[#C5A15B]" />
                      <span>عرض في بانر الرئيسية</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                      <input type="checkbox" checked={eventForm.show_announcement_bar} onChange={e => setEventForm(f => ({ ...f, show_announcement_bar: e.target.checked }))} className="w-4 h-4 rounded text-[#C5A15B]" />
                      <span>شريط التنبيه العلوي</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                      <input type="checkbox" checked={eventForm.countdown_enabled} onChange={e => setEventForm(f => ({ ...f, countdown_enabled: e.target.checked }))} className="w-4 h-4 rounded text-[#C5A15B]" />
                      <span>العداد التنازلي</span>
                    </label>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <ImageUploadField
                    label="صورة البانر السينمائي الرئيسية (سطح المكتب)"
                    value={eventForm.image_url}
                    onChange={(url) => setEventForm(f => ({ ...f, image_url: url }))}
                    folder="events"
                    previewAspect="cover"
                  />
                </div>

                <div className="sm:col-span-2">
                  <ImageUploadField
                    label="صورة البانر المخصصة للهواتف (Mobile Artwork)"
                    value={eventForm.mobile_image_url}
                    onChange={(url) => setEventForm(f => ({ ...f, mobile_image_url: url }))}
                    folder="events"
                    previewAspect="cover"
                  />
                </div>
              </div>

              <div className="px-6 py-4 border-t border-zinc-800 bg-[#162235] flex items-center justify-end gap-3 shrink-0">
                <button type="button" onClick={() => setShowEditEvent(false)} className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-semibold">إلغاء</button>
                <button type="submit" disabled={submitting} className="px-6 py-2.5 rounded-xl bg-[#C5A15B] hover:bg-[#E5C77D] text-black text-sm font-extrabold shadow-lg disabled:opacity-50 transition-all">
                  {submitting ? '⏳ جاري الحفظ...' : '💾 حفظ التعديلات'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── CREATE COMPETITION MODAL ── */}
      {showCreateComp && (
        <div className={modalCls}>
          <div className={modalBoxCls}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-[#162235] shrink-0">
              <h3 className="text-lg font-bold text-[#087C7B]">🏆 إضافة مسابقة</h3>
              <button onClick={() => setShowCreateComp(false)} className="text-zinc-400 hover:text-white text-xl leading-none">×</button>
            </div>
            <form onSubmit={handleCreateComp} className="overflow-y-auto">
              <div className="p-6 space-y-4">
                <div><label className={labelCls}>الفعالية المرتبطة *</label>
                  <select className={inputCls} value={selectedEventId} onChange={e => setSelectedEventId(e.target.value)}>
                    <option value="">— اختر الفعالية —</option>
                    {events.map(ev => <option key={ev.id} value={ev.id}>{ev.title_ar}</option>)}
                  </select>
                </div>
                <div><label className={labelCls}>عنوان المسابقة بالعربية *</label><input required className={inputCls} value={compForm.title_ar} onChange={e => setCompForm(f => ({ ...f, title_ar: e.target.value }))} /></div>
                <div><label className={labelCls}>الوصف</label><textarea rows={3} className={inputCls} value={compForm.description_ar} onChange={e => setCompForm(f => ({ ...f, description_ar: e.target.value }))} /></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className={labelCls}>الفئة</label><input className={inputCls} value={compForm.category} onChange={e => setCompForm(f => ({ ...f, category: e.target.value }))} placeholder="رواية / كوميكس / رسم..." /></div>
                  <div><label className={labelCls}>الجوائز</label><input className={inputCls} value={compForm.prizes} onChange={e => setCompForm(f => ({ ...f, prizes: e.target.value }))} /></div>
                  <div><label className={labelCls}>بداية التقديم</label><input type="date" className={inputCls} value={compForm.start_date} onChange={e => setCompForm(f => ({ ...f, start_date: e.target.value }))} dir="ltr" /></div>
                  <div><label className={labelCls}>آخر موعد</label><input type="date" className={inputCls} value={compForm.end_date} onChange={e => setCompForm(f => ({ ...f, end_date: e.target.value }))} dir="ltr" /></div>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-zinc-800 bg-[#162235] flex items-center justify-end gap-3 shrink-0">
                <button type="button" onClick={() => setShowCreateComp(false)} className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-sm font-semibold">إلغاء</button>
                <button type="submit" disabled={submitting} className="px-6 py-2 rounded-xl bg-[#087C7B] text-white text-sm font-bold disabled:opacity-50">{submitting ? '⏳' : '✅ إنشاء المسابقة'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── CREATE VOTING MODAL ── */}
      {showCreateVoting && (
        <div className={modalCls}>
          <div className={modalBoxCls}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-[#162235] shrink-0">
              <h3 className="text-lg font-bold text-purple-300">🗳️ فتح جولة تصويت</h3>
              <button onClick={() => setShowCreateVoting(false)} className="text-zinc-400 hover:text-white text-xl leading-none">×</button>
            </div>
            <form onSubmit={handleCreateVoting} className="overflow-y-auto">
              <div className="p-6 space-y-4">
                <div><label className={labelCls}>الفعالية المرتبطة *</label>
                  <select className={inputCls} value={selectedEventId} onChange={e => setSelectedEventId(e.target.value)}>
                    <option value="">— اختر الفعالية —</option>
                    {events.map(ev => <option key={ev.id} value={ev.id}>{ev.title_ar}</option>)}
                  </select>
                </div>
                <div><label className={labelCls}>عنوان جولة التصويت *</label><input required className={inputCls} value={votingForm.title_ar} onChange={e => setVotingForm(f => ({ ...f, title_ar: e.target.value }))} /></div>
                <div>
                  <label className={labelCls}>المرشحون</label>
                  {votingForm.nominees.map((n, i) => (
                    <div key={i} className="flex gap-2 mb-2">
                      <input className={inputCls + ' flex-1'} value={n.name} onChange={e => setVotingForm(f => { const noms = [...f.nominees]; noms[i] = { ...noms[i], name: e.target.value }; return { ...f, nominees: noms }; })} placeholder={`المرشح ${i + 1}`} />
                      <button type="button" onClick={() => setVotingForm(f => ({ ...f, nominees: f.nominees.filter((_, j) => j !== i) }))} className="text-red-400 hover:text-red-300 text-lg px-2">×</button>
                    </div>
                  ))}
                  <button type="button" onClick={() => setVotingForm(f => ({ ...f, nominees: [...f.nominees, { name: '', description: '' }] }))} className="text-sm text-[#087C7B] underline mt-1">+ إضافة مرشح</button>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-zinc-800 bg-[#162235] flex items-center justify-end gap-3 shrink-0">
                <button type="button" onClick={() => setShowCreateVoting(false)} className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-sm font-semibold">إلغاء</button>
                <button type="submit" disabled={submitting} className="px-6 py-2 rounded-xl bg-purple-700 text-white text-sm font-bold disabled:opacity-50">{submitting ? '⏳' : '🗳️ فتح التصويت'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── ISSUE AWARD MODAL ── */}
      {showIssueAward && (
        <div className={modalCls}>
          <div className={modalBoxCls}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-[#162235] shrink-0">
              <h3 className="text-lg font-bold text-[#C5A15B]">🏅 إصدار جائزة وشهادة رسمية</h3>
              <button onClick={() => setShowIssueAward(false)} className="text-zinc-400 hover:text-white text-xl leading-none">×</button>
            </div>
            <form onSubmit={handleIssueAward} className="overflow-y-auto">
              <div className="p-6 space-y-4">
                <div><label className={labelCls}>الفعالية المرتبطة *</label>
                  <select className={inputCls} value={selectedEventId} onChange={e => setSelectedEventId(e.target.value)}>
                    <option value="">— اختر الفعالية —</option>
                    {events.map(ev => <option key={ev.id} value={ev.id}>{ev.title_ar}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className={labelCls}>اسم الفائز *</label><input required className={inputCls} value={awardForm.winner_name} onChange={e => setAwardForm(f => ({ ...f, winner_name: e.target.value }))} /></div>
                  <div><label className={labelCls}>مسمى الجائزة *</label><input required className={inputCls} value={awardForm.award_title} onChange={e => setAwardForm(f => ({ ...f, award_title: e.target.value }))} placeholder="جائزة أفضل كوميكس 2027" /></div>
                  <div><label className={labelCls}>المرتبة</label><input className={inputCls} value={awardForm.rank} onChange={e => setAwardForm(f => ({ ...f, rank: e.target.value }))} /></div>
                  <div><label className={labelCls}>الفئة</label><input className={inputCls} value={awardForm.category} onChange={e => setAwardForm(f => ({ ...f, category: e.target.value }))} /></div>
                  <div className="sm:col-span-2"><label className={labelCls}>عنوان العمل الفائز</label><input className={inputCls} value={awardForm.work_title} onChange={e => setAwardForm(f => ({ ...f, work_title: e.target.value }))} /></div>
                  <div className="sm:col-span-2"><label className={labelCls}>ملاحظات</label><textarea rows={2} className={inputCls} value={awardForm.notes} onChange={e => setAwardForm(f => ({ ...f, notes: e.target.value }))} /></div>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-zinc-800 bg-[#162235] flex items-center justify-end gap-3 shrink-0">
                <button type="button" onClick={() => setShowIssueAward(false)} className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-sm font-semibold">إلغاء</button>
                <button type="submit" disabled={submitting} className="px-6 py-2 rounded-xl bg-[#C5A15B] text-black text-sm font-bold disabled:opacity-50">{submitting ? '⏳' : '🏅 إصدار الشهادة'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [contentSubTab, setContentSubTab] = useState<ContentSubTab>('comics');
  const [dateRange, setDateRange] = useState<'today' | '7d' | '30d' | 'year'>('30d');
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    folder: string,
    onSuccess: (url: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        const res = await api.uploadMedia(base64, folder);
        if (res && res.url) {
          onSuccess(res.url);
          toast({
            title: 'تم الرفع إلى Cloudinary بنجاح',
            description: 'تم ربط ملف الوسائط المرفوع بالعمل.',
          });
        } else {
          toast({
            title: 'فشل الرفع',
            description: 'تعذر رفع الصورة إلى خادم التخزين السحابي.',
            variant: 'destructive',
          });
        }
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      toast({ title: 'خطأ', description: err.message, variant: 'destructive' });
      setIsUploading(false);
    }
  };

  // Global search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Overview Data
  const [overview, setOverview] = useState<any>(null);

  // Content Data
  const [worlds, setWorlds] = useState<any[]>([]);
  const [characters, setCharacters] = useState<any[]>([]);
  const [comics, setComics] = useState<any[]>([]);
  const [stories, setStories] = useState<any[]>([]);

  // IP & Legal Data
  const [ipRecords, setIpRecords] = useState<any[]>([]);

  // Users & Applications
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [creatorApps, setCreatorApps] = useState<any[]>([]);

  // Financials & Commerce
  const [financials, setFinancials] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);

  // Audit Logs
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  // Extended Datasets
  const [seriesList, setSeriesList] = useState<any[]>([]);
  const [creatorsDirectory, setCreatorsDirectory] = useState<{
    registeredAccounts: any[];
    standaloneCreators: any[];
    allWriters: any[];
    allPublishingHouses: any[];
  }>({
    registeredAccounts: [],
    standaloneCreators: [],
    allWriters: [],
    allPublishingHouses: [],
  });
  const [powersList, setPowersList] = useState<any[]>([]);
  const [timelineList, setTimelineList] = useState<any[]>([]);

  // Studio Modals visibility
  const [showCreationWizard, setShowCreationWizard] = useState(false);
  const [showComicPagesStudio, setShowComicPagesStudio] = useState(false);
  const [activeComicForPages, setActiveComicForPages] = useState<{ id: string; title: string }>({ id: '', title: '' });
  const [showChapterStudio, setShowChapterStudio] = useState(false);
  const [activeStoryForChapters, setActiveStoryForChapters] = useState<{ id: string; title: string }>({ id: '', title: '' });
  const [showPowersStudio, setShowPowersStudio] = useState(false);
  const [showTimelineStudio, setShowTimelineStudio] = useState(false);
  const [showCharStudioModal, setShowCharStudioModal] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<any | null>(null);
  const [showSeriesModal, setShowSeriesModal] = useState(false);

  // Subtabs & Filters
  const [operationsSubTab, setOperationsSubTab] = useState<OperationsSubTab>('financials');
  const [characterFilter, setCharacterFilter] = useState<'all' | 'hero' | 'villain' | 'antihero'>('all');
  const [publishingFilter, setPublishingFilter] = useState<'all' | 'published' | 'draft' | 'pending_review' | 'scheduled'>('all');

  // Modals visibility (legacy & dialogs)
  const [showComicModal, setShowComicModal] = useState(false);
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [showCharModal, setShowCharModal] = useState(false);
  const [showWorldModal, setShowWorldModal] = useState(false);
  const [showIpModal, setShowIpModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);

  // Series Form State
  const [newSeries, setNewSeries] = useState({
    title_ar: '',
    title_en: '',
    description_ar: '',
    world_id: '',
    classification: 'original',
    cover_image_url: '',
    status: 'ongoing',
  });

  // New item form states
  const [newComic, setNewComic] = useState({
    title: '',
    title_en: '',
    slug: '',
    synopsis: '',
    classification: 'original', // 'original' | 'hekayaty_selected'
    status: 'published',
    world_id: '',
    cover_image_url: '',
    is_featured: false,
    rights_holder: 'Hekayaty Media Group LLC',
    exclusivity_status: 'worldwide_exclusive',
    ip_license_doc: '',
    original_creator: '',
    publishing_agreement_doc: '',
  });

  const [newStory, setNewStory] = useState({
    title: '',
    title_en: '',
    slug: '',
    synopsis: '',
    content: '',
    classification: 'original',
    status: 'published',
    world_id: '',
    cover_image_url: '',
    reading_time_minutes: 15,
    is_featured: false,
    rights_holder: 'Hekayaty Media Group LLC',
    exclusivity_status: 'worldwide_exclusive',
    ip_license_doc: '',
    original_creator: '',
    publishing_agreement_doc: '',
  });

  const [editingCharId, setEditingCharId] = useState<string | null>(null);
  const [newChar, setNewChar] = useState({
    name: '',
    name_en: '',
    title: '',
    world_id: '',
    alignment: 'hero',
    role: 'hero',
    avatar_url: '',
    description: '',
  });

  const [newWorld, setNewWorld] = useState({
    name: '',
    name_en: '',
    slug: '',
    description: '',
    banner_url: '',
    alignment: 'harmony',
  });

  const [newIp, setNewIp] = useState({
    title: '',
    rights_holder: '',
    license_type: 'exclusive',
    valid_until: '',
    exclusivity_territory: 'MENA & Global Arabic Rights',
    notes: '',
  });

  const [newExpense, setNewExpense] = useState({
    category: 'creator_advance',
    amount: '',
    currency: 'SAR',
    description: '',
  });

  const [newProduct, setNewProduct] = useState({
    name: '',
    name_en: '',
    description: '',
    price_egp: '',
    stock_quantity: '50',
    category: 'collectible',
    image_url: '',
  });

  // Fetch all core admin datasets
  const fetchAllData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [
        overviewData,
        usersData,
        worldsData,
        charsData,
        comicsData,
        storiesData,
        ipData,
        appsData,
        finData,
        prodData,
        logsData,
        seriesData,
        creatorsDirData,
        powersData,
        timelineData,
      ] = await Promise.all([
        api.getAdminOverview(),
        api.getAdminUsers(),
        api.getAdminWorlds(),
        api.getAdminCharacters(),
        api.getAdminComics(),
        api.getAdminStories(),
        api.getAdminIpRecords(),
        api.getAdminCreatorApplications(),
        api.getAdminFinancials(),
        api.getAdminProducts(),
        api.getAdminAuditLogs(),
        api.getAdminSeries(),
        api.getAdminCreatorsDirectory(),
        api.getAdminPowers(),
        api.getAdminTimeline(),
      ]);

      if (overviewData) setOverview(overviewData);
      if (usersData) setAdminUsers(usersData);
      if (worldsData) setWorlds(worldsData);
      if (charsData) setCharacters(charsData);
      if (comicsData) setComics(comicsData);
      if (storiesData) setStories(storiesData);
      if (ipData) setIpRecords(ipData);
      if (appsData) setCreatorApps(appsData);
      if (finData) setFinancials(finData);
      if (prodData) setProducts(prodData);
      if (logsData) setAuditLogs(logsData);
      if (seriesData) setSeriesList(seriesData);
      if (creatorsDirData) setCreatorsDirectory(creatorsDirData);
      if (powersData) setPowersList(powersData);
      if (timelineData) setTimelineList(timelineData);
    } catch (err: any) {
      console.error('Failed to load admin data:', err);
      toast({
        title: 'تنبيه في مزامنة البيانات',
        description: 'حدث خطأ أثناء تحميل بيانات الإدارة المركزية.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Handle global search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await api.adminGlobalSearch(searchQuery.trim());
        setSearchResults(res);
      } catch (e) {
        console.error(e);
      } finally {
        setIsSearching(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Access check
  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center font-arabic">
        <div className="w-20 h-20 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-6 text-red-400">
          <Lock className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-3">منطقة محمية — صلاحيات الإدارة فقط</h1>
        <p className="text-zinc-400 max-w-md mb-6 leading-relaxed">
          هذه اللوحة مخصصة لإدارة العمليات، النشر، والتدقيق المالي والتحريري لشبكة حكاياتي. يرجى تسجيل الدخول بحساب يحمل صلاحية مدير النظام.
        </p>
        <Link
          href="/"
          className="px-6 py-3 rounded-xl bg-[#087C7B] hover:bg-[#066160] text-white font-medium transition-all shadow-lg shadow-[#087C7B]/20"
        >
          العودة للرئيسية
        </Link>
      </div>
    );
  }

  // Action handlers
  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await api.updateAdminUserStatus(userId, !currentStatus);
      toast({
        title: 'تم تحديث حالة المستخدم',
        description: !currentStatus ? 'تم تفعيل الحساب بنجاح.' : 'تم تعليق الحساب ومنعه من الوصول.',
      });
      setAdminUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, is_active: !currentStatus } : u))
      );
    } catch {
      toast({ title: 'خطأ', description: 'فشل تعديل حالة الحساب', variant: 'destructive' });
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await api.updateUserRole(userId, newRole);
      toast({
        title: 'تم تغيير الرتبة والصلاحيات',
        description: `تمت ترقية / تعديل حساب المستخدم إلى رتبة: ${newRole}`,
      });
      setAdminUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
    } catch {
      toast({ title: 'خطأ', description: 'تعذر تعديل الصلاحية', variant: 'destructive' });
    }
  };

  const handleResolveApp = async (userId: string, decision: 'approved' | 'rejected', requestedType: string) => {
    try {
      await api.resolveAdminCreatorApplication(userId, {
        decision,
        requestedType,
        feedbackNotes: decision === 'approved' ? 'مرحباً بك ضمن كتاب ومبدعي حكاياتي المعتمدين.' : 'شكراً لتقديمك، العمل يحتاج لتطوير إضافي في ملف الأعمال.',
      });
      toast({
        title: decision === 'approved' ? 'تم اعتماد المبدع' : 'تم الرفض مع الملاحظات',
        description: decision === 'approved' ? 'تمت ترقية الحساب وتوثيقه كصانع محتوى معتمد.' : 'تم إشعار المتقدم بقرار هيئة التحرير.',
      });
      setCreatorApps((prev) => prev.filter((a) => a.user_id !== userId));
      fetchAllData();
    } catch {
      toast({ title: 'خطأ', description: 'فشلت معالجة الطلب', variant: 'destructive' });
    }
  };

  const handleCreateComic = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createAdminComic(newComic);
      toast({ title: 'تم نشر/حفظ العمل المصور', description: 'تمت إضافة الكوميكس بنجاح إلى قاعدة البيانات.' });
      setShowComicModal(false);
      setNewComic({
        title: '',
        title_en: '',
        slug: '',
        synopsis: '',
        classification: 'original',
        status: 'published',
        world_id: '',
        cover_image_url: '',
        is_featured: false,
        rights_holder: 'Hekayaty Media Group LLC',
        exclusivity_status: 'worldwide_exclusive',
        ip_license_doc: '',
        original_creator: '',
        publishing_agreement_doc: '',
      });
      fetchAllData();
    } catch (err: any) {
      toast({ title: 'فشل الحفظ', description: err.message, variant: 'destructive' });
    }
  };

  const handleCreateStory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createAdminStory(newStory);
      toast({ title: 'تم نشر/حفظ الرواية', description: 'تمت إضافة الرواية/القصة بنجاح.' });
      setShowStoryModal(false);
      fetchAllData();
    } catch (err: any) {
      toast({ title: 'فشل الحفظ', description: err.message, variant: 'destructive' });
    }
  };

  const handleCreateSeries = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSeries.title_ar) {
      toast({ title: 'يرجى إدخال عنوان السلسلة', variant: 'destructive' });
      return;
    }
    try {
      await api.createAdminSeries({
        ...newSeries,
        world_id: newSeries.world_id || null,
      });
      toast({ title: '✅ تم إنشاء السلسلة المصورة بنجاح' });
      setShowSeriesModal(false);
      setNewSeries({
        title_ar: '',
        title_en: '',
        description_ar: '',
        world_id: '',
        classification: 'original',
        cover_image_url: '',
        status: 'ongoing',
      });
      fetchAllData();
    } catch (err: any) {
      toast({ title: 'فشل إنشاء السلسلة', description: err.message, variant: 'destructive' });
    }
  };

  const handleCreateChar = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createAdminCharacter({
        ...newChar,
        world_id: newChar.world_id && newChar.world_id.trim() ? newChar.world_id.trim() : null,
      });
      toast({ title: 'تم توثيق البطل/الشخصية', description: 'تم إدراج الشخصية في سجل الأبطال.' });
      setShowCharModal(false);
      fetchAllData();
    } catch (err: any) {
      toast({ title: 'فشل الحفظ', description: err.message, variant: 'destructive' });
    }
  };

  const handleCreateWorld = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createAdminWorld(newWorld);
      toast({ title: 'تم تأسيس العالم', description: 'تم إدراج البُعد الكوني في خارطة العوالم.' });
      setShowWorldModal(false);
      fetchAllData();
    } catch (err: any) {
      toast({ title: 'فشل الحفظ', description: err.message, variant: 'destructive' });
    }
  };

  const handleCreateIp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createAdminIpRecord(newIp);
      toast({ title: 'تم تسجيل ترخيص الملكية الفكرية', description: 'تم تقييد السجل في المنظومة القانونية.' });
      setShowIpModal(false);
      fetchAllData();
    } catch (err: any) {
      toast({ title: 'فشل الحفظ', description: err.message, variant: 'destructive' });
    }
  };

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createAdminExpense({
        ...newExpense,
        amount: parseFloat(newExpense.amount) || 0,
      });
      toast({ title: 'تم تقييد المصروف التشغيلي', description: 'تم تحديث الميزانية والأرباح الصافية.' });
      setShowExpenseModal(false);
      fetchAllData();
    } catch (err: any) {
      toast({ title: 'فشل الحفظ', description: err.message, variant: 'destructive' });
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createAdminProduct({
        ...newProduct,
        price_egp: parseFloat(newProduct.price_egp) || 0,
        stock_quantity: parseInt(newProduct.stock_quantity) || 0,
      });
      toast({ title: 'تمت إضافة المنتج', description: 'تم إدراج العنصر في متجر حكاياتي الرسمي.' });
      setShowProductModal(false);
      fetchAllData();
    } catch (err: any) {
      toast({ title: 'فشل الحفظ', description: err.message, variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen bg-[#0E131F] text-zinc-100 font-arabic pb-24" dir="rtl">
      {/* Top Operations Header */}
      <header className="sticky top-0 z-40 bg-[#0E131F]/90 backdrop-blur-md border-b border-zinc-800/80 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#087C7B] to-[#C5A15B] flex items-center justify-center text-white shadow-lg shadow-[#087C7B]/30">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white tracking-wide">
                  مركز القيادة والعمليات التحريرية والتجارية
                </h1>
                <span className="px-2 py-0.5 text-xs font-semibold rounded bg-[#C5A15B]/20 text-[#E5C17B] border border-[#C5A15B]/40">
                  مدير النظام الأعلى
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                منصة التحكم الموحدة لشبكة حكاياتي • قاعدة بيانات Supabase الحية
              </p>
            </div>
          </div>

          {/* Quick Actions & Date Range */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <div className="relative w-64">
              <Search className="w-4 h-4 text-zinc-400 absolute right-3 top-3 pointer-events-none" />
              <input
                type="text"
                placeholder="بحث شامل في النظام..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-900/90 border border-zinc-700/60 rounded-xl pr-9 pl-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#C5A15B]"
              />
              {/* Autocomplete dropdown */}
              {searchResults && (
                <div className="absolute top-11 right-0 w-80 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl p-3 z-50 max-h-96 overflow-y-auto space-y-2">
                  <div className="text-[11px] font-bold text-[#C5A15B] border-b border-zinc-800 pb-1">
                    نتائج البحث المباشر:
                  </div>
                  {searchResults.users?.length > 0 && (
                    <div>
                      <span className="text-[10px] text-zinc-400">المستخدمين:</span>
                      {searchResults.users.map((u: any) => (
                        <div key={u.id} className="text-xs py-1 hover:text-[#C5A15B] cursor-pointer flex justify-between">
                          <span>{u.display_name || u.email}</span>
                          <span className="text-[10px] text-zinc-500">{u.role}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {searchResults.comics?.length > 0 && (
                    <div>
                      <span className="text-[10px] text-zinc-400">القصص المصورة:</span>
                      {searchResults.comics.map((c: any) => (
                        <div key={c.id} className="text-xs py-1 hover:text-[#087C7B] cursor-pointer">
                          {c.title}
                        </div>
                      ))}
                    </div>
                  )}
                  {searchResults.stories?.length > 0 && (
                    <div>
                      <span className="text-[10px] text-zinc-400">الروايات:</span>
                      {searchResults.stories.map((s: any) => (
                        <div key={s.id} className="text-xs py-1 hover:text-[#087C7B] cursor-pointer">
                          {s.title}
                        </div>
                      ))}
                    </div>
                  )}
                  {searchResults.characters?.length > 0 && (
                    <div>
                      <span className="text-[10px] text-zinc-400">الأبطال:</span>
                      {searchResults.characters.map((ch: any) => (
                        <div key={ch.id} className="text-xs py-1 hover:text-[#087C7B] cursor-pointer">
                          {ch.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Date Range Picker */}
            <div className="flex bg-zinc-900 border border-zinc-800 rounded-xl p-0.5 text-xs">
              <button
                onClick={() => setDateRange('today')}
                className={`px-2.5 py-1.5 rounded-lg transition-colors ${dateRange === 'today' ? 'bg-[#087C7B] text-white font-medium' : 'text-zinc-400 hover:text-white'}`}
              >
                اليوم
              </button>
              <button
                onClick={() => setDateRange('7d')}
                className={`px-2.5 py-1.5 rounded-lg transition-colors ${dateRange === '7d' ? 'bg-[#087C7B] text-white font-medium' : 'text-zinc-400 hover:text-white'}`}
              >
                7 أيام
              </button>
              <button
                onClick={() => setDateRange('30d')}
                className={`px-2.5 py-1.5 rounded-lg transition-colors ${dateRange === '30d' ? 'bg-[#087C7B] text-white font-medium' : 'text-zinc-400 hover:text-white'}`}
              >
                30 يوم
              </button>
              <button
                onClick={() => setDateRange('year')}
                className={`px-2.5 py-1.5 rounded-lg transition-colors ${dateRange === 'year' ? 'bg-[#087C7B] text-white font-medium' : 'text-zinc-400 hover:text-white'}`}
              >
                العام
              </button>
            </div>

            <button
              onClick={fetchAllData}
              disabled={isLoading}
              className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-[#C5A15B] transition-all"
              title="تحديث البيانات فوراً"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#C5A15B]' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Command Center Body */}
      <div className="max-w-7xl mx-auto px-6 pt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-3 space-y-2">
          <nav className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-3 space-y-1.5 backdrop-blur-sm">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'overview'
                  ? 'bg-gradient-to-l from-[#087C7B] to-[#066160] text-white shadow-md'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Activity className="w-4 h-4 text-[#C5A15B]" />
                <span>مركز القيادة والمؤشرات</span>
              </div>
              <ChevronRight className="w-4 h-4 opacity-70" />
            </button>

            <button
              onClick={() => setActiveTab('content_mgmt')}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'content_mgmt'
                  ? 'bg-gradient-to-l from-[#087C7B] to-[#066160] text-white shadow-md'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <BookOpen className="w-4 h-4 text-[#C5A15B]" />
                <span>استوديو إدارة المحتوى</span>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300">
                {comics.length + stories.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('series_platform')}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'series_platform'
                  ? 'bg-gradient-to-l from-[#C5A15B] to-[#a8873a] text-black shadow-md font-bold'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-base">📚</span>
                <span>سلاسل حكاياتي والمواسم</span>
              </div>
              <ChevronRight className="w-4 h-4 opacity-70" />
            </button>

            <button
              onClick={() => setActiveTab('characters_studio')}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'characters_studio'
                  ? 'bg-gradient-to-l from-[#087C7B] to-[#066160] text-white shadow-md'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Shield className="w-4 h-4 text-[#C5A15B]" />
                <span>الأبطال والخوارق الكونية</span>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300">
                {characters.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('universe_studio')}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'universe_studio'
                  ? 'bg-gradient-to-l from-[#087C7B] to-[#066160] text-white shadow-md'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Globe className="w-4 h-4 text-[#C5A15B]" />
                <span>إدارة الأكوان والخط الزمني</span>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300">
                {worlds.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('ip_mgmt')}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'ip_mgmt'
                  ? 'bg-gradient-to-l from-[#087C7B] to-[#066160] text-white shadow-md'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Award className="w-4 h-4 text-[#C5A15B]" />
                <span>سجل الملكية وصناع المحتوى</span>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30">
                {ipRecords.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('publishing_mgmt')}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'publishing_mgmt'
                  ? 'bg-gradient-to-l from-[#087C7B] to-[#066160] text-white shadow-md'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <FileCheck className="w-4 h-4 text-[#C5A15B]" />
                <span>منظومة النشر والاعتماد</span>
              </div>
              <ChevronRight className="w-4 h-4 opacity-70" />
            </button>

            <button
              onClick={() => setActiveTab('operations')}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'operations'
                  ? 'bg-gradient-to-l from-[#087C7B] to-[#066160] text-white shadow-md'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Coins className="w-4 h-4 text-[#C5A15B]" />
                <span>العمليات والمالية والمتجر</span>
              </div>
              <ChevronRight className="w-4 h-4 opacity-70" />
            </button>

            <button
              onClick={() => setActiveTab('events_mgmt')}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'events_mgmt'
                  ? 'bg-gradient-to-l from-[#C5A15B] to-[#a8873a] text-black shadow-md'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-[#C5A15B]">🎪</span>
                <span>الكرنفالات والمسابقات</span>
              </div>
              <ChevronRight className="w-4 h-4 opacity-70" />
            </button>

            <button
              onClick={() => setActiveTab('mystery_mgmt')}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'mystery_mgmt'
                  ? 'bg-gradient-to-l from-[#C5A15B] to-[#a8873a] text-black shadow-md'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-[#C5A15B]">🔍</span>
                <span>لغز حكاياتي اليومي</span>
              </div>
              <ChevronRight className="w-4 h-4 opacity-70" />
            </button>

            <button
              onClick={() => setActiveTab('seo_mgmt')}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'seo_mgmt'
                  ? 'bg-gradient-to-l from-[#C5A15B] to-[#a8873a] text-black shadow-md'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Globe className="w-4 h-4 text-[#C5A15B]" />
                <span>إدارة السيو ومحركات البحث</span>
              </div>
              <ChevronRight className="w-4 h-4 opacity-70" />
            </button>
          </nav>

          {/* Quick System Status Card */}
          <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl p-4 text-xs space-y-3">
            <div className="font-semibold text-zinc-300 flex items-center justify-between">
              <span>حالة المنظومة</span>
              <span className="inline-flex items-center gap-1 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                متصل ومحمي
              </span>
            </div>
            <div className="space-y-1.5 text-zinc-400">
              <div className="flex justify-between">
                <span>توزيع الإنتاج الأصلي:</span>
                <span className="text-white font-mono">{overview?.content?.originalsCount || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>إنتاج حكاياتي المختارة:</span>
                <span className="text-white font-mono">{overview?.content?.selectedCount || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>الحسابات المعلقة:</span>
                <span className="text-amber-400 font-mono">{overview?.platform?.suspendedUsers || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Center Work Area */}
        <div className="lg:col-span-9 space-y-6">
          {/* ============================================================== */}
          {/* TAB 1: EXECUTIVE COMMAND CENTER OVERVIEW */}
          {/* ============================================================== */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Top KPIs Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-2xl p-5 relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-400">إجمالي المستخدمين</span>
                    <Users className="w-4 h-4 text-[#087C7B]" />
                  </div>
                  <div className="mt-3 text-3xl font-extrabold text-white font-mono">
                    {overview?.platform?.totalUsers || 0}
                  </div>
                  <div className="mt-2 text-xs text-zinc-400 flex items-center gap-2">
                    <span className="text-emerald-400 font-semibold">{overview?.platform?.activeUsers || 0} نشط</span>
                    <span>•</span>
                    <span>{overview?.platform?.writersCount || 0} مؤلف</span>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-2xl p-5 relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-400">إجمالي المنشورات والأعمال</span>
                    <BookOpen className="w-4 h-4 text-[#C5A15B]" />
                  </div>
                  <div className="mt-3 text-3xl font-extrabold text-white font-mono">
                    {overview?.content?.totalPublications || 0}
                  </div>
                  <div className="mt-2 text-xs text-zinc-400 flex items-center gap-2">
                    <span className="text-[#C5A15B] font-semibold">{overview?.content?.totalComics || 0} كوميكس</span>
                    <span>•</span>
                    <span>{overview?.content?.totalStories || 0} رواية</span>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-2xl p-5 relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-400">إجمالي المبيعات الإجمالية</span>
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="mt-3 text-3xl font-extrabold text-white font-mono">
                    {(overview?.financial?.grossSales || 0).toLocaleString()} <span className="text-sm font-normal text-zinc-400">ج.م</span>
                  </div>
                  <div className="mt-2 text-xs text-emerald-400 flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>مبيعات حقيقية موثقة</span>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-2xl p-5 relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-400">حقوق حكاياتي الأصلية</span>
                    <Sparkles className="w-4 h-4 text-[#C5A15B]" />
                  </div>
                  <div className="mt-3 text-3xl font-extrabold text-[#C5A15B] font-mono">
                    {overview?.content?.originalsCount || 0}
                  </div>
                  <div className="mt-2 text-xs text-zinc-400">
                    مقابل {overview?.content?.selectedCount || 0} حكاياتي المختارة
                  </div>
                </div>
              </div>

              {/* Operations & Content Studio Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Content Distribution Breakdown */}
                <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-white text-sm flex items-center gap-2">
                      <Layers className="w-4 h-4 text-[#087C7B]" />
                      تصنيف مكتبة الأعمال (Originals vs Selected)
                    </h3>
                  </div>
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800/80 flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="font-semibold text-sm text-[#C5A15B] flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4" />
                          حكاياتي الأصلية (HEKAYATY ORIGINALS)
                        </div>
                        <p className="text-xs text-zinc-400">
                          أعمال مملوكة بالكامل لشبكة حكاياتي ذات حقوق نشر حصرية وتراخيص عالمية.
                        </p>
                      </div>
                      <div className="text-2xl font-bold font-mono text-white">
                        {overview?.content?.originalsCount || 0}
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800/80 flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="font-semibold text-sm text-teal-400 flex items-center gap-1.5">
                          <Award className="w-4 h-4" />
                          حكاياتي المختارة (HEKAYATY SELECTED)
                        </div>
                        <p className="text-xs text-zinc-400">
                          أعمال مرخصة ومختارة من دور النشر والشركاء والمؤلفين المستقلين المعتمدين.
                        </p>
                      </div>
                      <div className="text-2xl font-bold font-mono text-white">
                        {overview?.content?.selectedCount || 0}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800">
                        <span className="text-xs text-zinc-400">العوالم المؤسسة:</span>
                        <div className="text-lg font-bold text-white font-mono mt-1">
                          {overview?.content?.totalWorlds || 0} عوالم
                        </div>
                      </div>
                      <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800">
                        <span className="text-xs text-zinc-400">سجل الأبطال والشخصيات:</span>
                        <div className="text-lg font-bold text-white font-mono mt-1">
                          {overview?.content?.totalCharacters || 0} شخصية
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Administrative Activity Log */}
                <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-white text-sm flex items-center gap-2">
                      <Lock className="w-4 h-4 text-[#C5A15B]" />
                      أحدث سجلات الرقابة الإدارية
                    </h3>
                    <button
                      onClick={() => { setActiveTab('operations'); setOperationsSubTab('audit'); }}
                      className="text-xs text-[#087C7B] hover:text-[#C5A15B] transition-colors"
                    >
                      عرض السجل الكامل
                    </button>
                  </div>
                  <div className="space-y-2.5 max-h-72 overflow-y-auto">
                    {auditLogs.slice(0, 5).map((log, idx) => (
                      <div
                        key={log.id || idx}
                        className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/60 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-medium text-white flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#C5A15B]" />
                            {log.action}
                          </div>
                          <span className="text-zinc-500 text-[10px]">{log.resource_type} • ID: {log.resource_id?.slice(0, 8)}</span>
                        </div>
                        <span className="text-zinc-400 text-[10px] font-mono">
                          {new Date(log.created_at).toLocaleTimeString('ar-EG')}
                        </span>
                      </div>
                    ))}
                    {auditLogs.length === 0 && (
                      <div className="text-center py-8 text-zinc-500 text-xs">
                        لا توجد سجلات بعد.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 2: UNIFIED CONTENT MANAGEMENT STUDIO                        */}
          {/* ============================================================== */}
          {activeTab === 'content_mgmt' && (
            <div className="space-y-6">
              {/* Studio Top Action Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900/60 p-3 sm:p-4 rounded-2xl border border-zinc-800">
                <div className="flex overflow-x-auto no-scrollbar max-w-full bg-zinc-950 rounded-xl p-1 border border-zinc-800 text-xs shrink-0">
                  <button
                    onClick={() => setContentSubTab('comics')}
                    className={`px-3 sm:px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all ${
                      contentSubTab === 'comics' ? 'bg-[#087C7B] text-white shadow' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    القصص المصورة ({comics.length})
                  </button>
                  <button
                    onClick={() => setContentSubTab('stories')}
                    className={`px-3 sm:px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all ${
                      contentSubTab === 'stories' ? 'bg-[#087C7B] text-white shadow' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    الروايات والقصص ({stories.length})
                  </button>
                  <button
                    onClick={() => setContentSubTab('series')}
                    className={`px-3 sm:px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all ${
                      contentSubTab === 'series' ? 'bg-[#087C7B] text-white shadow' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    السلاسل المصورة ({seriesList.length})
                  </button>
                  <button
                    onClick={() => setContentSubTab('classification')}
                    className={`px-3 sm:px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all ${
                      contentSubTab === 'classification' ? 'bg-[#087C7B] text-white shadow' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    الأصلية والمختارة
                  </button>
                </div>

                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                  {contentSubTab === 'series' && (
                    <button
                      onClick={() => setShowSeriesModal(true)}
                      className="px-3 sm:px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold flex items-center gap-1.5 border border-zinc-700"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      إضافة سلسلة
                    </button>
                  )}
                  <Link href="/publishing-studio">
                    <button
                      type="button"
                      className="w-full sm:w-auto justify-center px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#C5A15B] to-[#D4AF37] hover:brightness-110 text-midnight-navy text-xs font-bold flex items-center gap-2 shadow-lg shadow-[#C5A15B]/20"
                    >
                      <Sparkles className="w-4 h-4 text-midnight-navy" />
                      <span>استوديو النشر وإدارة الفصول الكامل</span>
                    </button>
                  </Link>
                  <button
                    onClick={() => setShowCreationWizard(true)}
                    className="w-full sm:w-auto justify-center px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#087C7B] to-[#0A9695] hover:brightness-110 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-[#087C7B]/20"
                  >
                    <Plus className="w-4 h-4" />
                    <span>إنشاء وتوثيق عمل إبداعي جديد</span>
                  </button>
                </div>
              </div>

              {/* Subtab 1: COMICS */}
              {contentSubTab === 'comics' && (
                <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-right text-xs">
                      <thead className="bg-zinc-950/80 text-zinc-400 font-semibold border-b border-zinc-800">
                        <tr>
                          <th className="p-4">العمل المصور</th>
                          <th className="p-4">التصنيف الإلزامي</th>
                          <th className="p-4">حقوق الملكية الفكرية</th>
                          <th className="p-4">الحالة</th>
                          <th className="p-4">الصفحات والرسوم</th>
                          <th className="p-4">الإجراءات</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800/60">
                        {comics.map((c) => (
                          <tr key={c.id} className="hover:bg-zinc-800/30 transition-colors">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                {c.cover_image_url && (
                                  <img
                                    src={c.cover_image_url}
                                    alt=""
                                    className="w-10 h-14 object-cover rounded-lg border border-zinc-700"
                                  />
                                )}
                                <div>
                                  <div className="font-bold text-white text-sm">{c.title}</div>
                                  <div className="text-zinc-500 text-[10px] font-mono">{c.slug || c.id}</div>
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              {c.classification === 'original' ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 font-medium">
                                  <Sparkles className="w-3 h-3" />
                                  حكاياتي الأصلية
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/30 font-medium">
                                  <Award className="w-3 h-3" />
                                  حكاياتي المختارة
                                </span>
                              )}
                            </td>
                            <td className="p-4 text-zinc-400">
                              <div>{c.rights_holder || 'مجموعة حكاياتي الإعلامية'}</div>
                              <span className="text-[10px] text-zinc-500">حصرية تامة</span>
                            </td>
                            <td className="p-4">
                              <span
                                className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                  c.status === 'published'
                                    ? 'bg-emerald-500/20 text-emerald-300'
                                    : c.status === 'in_progress'
                                    ? 'bg-blue-500/20 text-blue-300'
                                    : c.status === 'ready_to_publish'
                                    ? 'bg-purple-500/20 text-purple-300'
                                    : 'bg-amber-500/20 text-amber-300'
                                }`}
                              >
                                {c.status === 'published'
                                  ? 'منشور'
                                  : c.status === 'in_progress'
                                  ? 'قيد التحرير'
                                  : c.status === 'ready_to_publish'
                                  ? 'جاهز للنشر'
                                  : 'مسودة'}
                              </span>
                            </td>
                            <td className="p-4 flex items-center gap-1.5 flex-wrap">
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveComicForPages({ id: c.id, title: c.title });
                                  setShowComicPagesStudio(true);
                                }}
                                className="px-2.5 py-1.5 rounded-lg bg-[#087C7B]/20 hover:bg-[#087C7B] text-[#087C7B] hover:text-white border border-[#087C7B]/40 font-bold text-xs flex items-center gap-1 transition-all"
                              >
                                <Layers className="w-3.5 h-3.5" />
                                <span>إدارة الصفحات</span>
                              </button>
                              <Link
                                href={`/publishing-studio?comicId=${c.id}&tab=comics`}
                                className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-bold transition-all"
                              >
                                متابعة التحرير
                              </Link>
                              {c.status !== 'published' && (
                                <button
                                  type="button"
                                  onClick={async () => {
                                    if (window.confirm(`هل أنت متأكد من اعتماد ونشر الكوميكس "${c.title}" رسمياً؟`)) {
                                      try {
                                        await api.publishAdminPublication(c.id, 'comic');
                                        toast({ title: '🎉 تم نشر الكوميكس رسمياً بنجاح!' });
                                        fetchAllData();
                                      } catch (err: any) {
                                        toast({ title: 'فشل النشر', description: err.message, variant: 'destructive' });
                                      }
                                    }
                                  }}
                                  className="px-2.5 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-white border border-emerald-500/40 text-xs font-bold transition-all"
                                >
                                  نشر
                                </button>
                              )}
                            </td>
                            <td className="p-4 flex items-center gap-2">
                              <Link
                                href={`/reader?comicId=${c.id}`}
                                className="text-[#087C7B] hover:text-white flex items-center gap-1 font-semibold"
                              >
                                القارئ <ExternalLink className="w-3 h-3" />
                              </Link>
                              <button
                                type="button"
                                onClick={async () => {
                                  if (window.confirm(`هل أنت متأكد من حذف العمل المصور "${c.title}" نهائياً؟`)) {
                                    try {
                                      await api.deleteAdminComic(c.id);
                                      toast({ title: 'تم حذف العمل المصور بنجاح' });
                                      fetchAllData();
                                    } catch (err: any) {
                                      toast({ title: 'فشل حذف الكوميكس', description: err.message, variant: 'destructive' });
                                    }
                                  }
                                }}
                                className="p-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                                title="حذف الكوميكس"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Subtab 2: STORIES */}
              {contentSubTab === 'stories' && (
                <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-right text-xs">
                      <thead className="bg-zinc-950/80 text-zinc-400 font-semibold border-b border-zinc-800">
                        <tr>
                          <th className="p-4">عنوان الرواية / القصة</th>
                          <th className="p-4">التصنيف الإلزامي</th>
                          <th className="p-4">زمن القراءة</th>
                          <th className="p-4">الحالة</th>
                          <th className="p-4">الفصول والسرد</th>
                          <th className="p-4">الإجراءات</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800/60">
                        {stories.map((s) => (
                          <tr key={s.id} className="hover:bg-zinc-800/30 transition-colors">
                            <td className="p-4">
                              <div className="font-bold text-white text-sm">{s.title || s.title_ar}</div>
                              <div className="text-zinc-500 text-[10px] font-mono">{s.slug || s.id}</div>
                            </td>
                            <td className="p-4">
                              {s.classification === 'original' ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30">
                                  <Sparkles className="w-3 h-3" />
                                  حكاياتي الأصلية
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/30">
                                  <Award className="w-3 h-3" />
                                  حكاياتي المختارة
                                </span>
                              )}
                            </td>
                            <td className="p-4 text-zinc-400 font-mono">
                              {s.reading_time_minutes || s.read_time_minutes || 15} دقيقة
                            </td>
                            <td className="p-4">
                              <span
                                className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                  s.status === 'published'
                                    ? 'bg-emerald-500/20 text-emerald-300'
                                    : s.status === 'in_progress'
                                    ? 'bg-blue-500/20 text-blue-300'
                                    : s.status === 'ready_to_publish'
                                    ? 'bg-purple-500/20 text-purple-300'
                                    : 'bg-amber-500/20 text-amber-300'
                                }`}
                              >
                                {s.status === 'published'
                                  ? 'منشور'
                                  : s.status === 'in_progress'
                                  ? 'قيد التحرير'
                                  : s.status === 'ready_to_publish'
                                  ? 'جاهز للنشر'
                                  : 'مسودة'}
                              </span>
                            </td>
                            <td className="p-4 flex items-center gap-1.5 flex-wrap">
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveStoryForChapters({ id: s.id, title: s.title || s.title_ar || 'رواية' });
                                  setShowChapterStudio(true);
                                }}
                                className="px-2.5 py-1.5 rounded-lg bg-antique-gold/20 hover:bg-antique-gold text-antique-gold hover:text-midnight-navy border border-antique-gold/40 font-bold text-xs flex items-center gap-1 transition-all shadow-sm"
                              >
                                <BookOpen className="w-3.5 h-3.5" />
                                <span>إدارة الفصول</span>
                              </button>
                              <Link
                                href={`/publishing-studio?storyId=${s.id}&tab=novels`}
                                className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-bold transition-all"
                              >
                                متابعة التحرير
                              </Link>
                              {s.status !== 'published' && (
                                <button
                                  type="button"
                                  onClick={async () => {
                                    if (window.confirm(`هل أنت متأكد من اعتماد ونشر الرواية "${s.title || s.title_ar}" رسمياً؟`)) {
                                      try {
                                        await api.publishAdminPublication(s.id, 'story');
                                        toast({ title: '🎉 تم نشر الرواية رسمياً بنجاح!' });
                                        fetchAllData();
                                      } catch (err: any) {
                                        toast({ title: 'فشل النشر', description: err.message, variant: 'destructive' });
                                      }
                                    }
                                  }}
                                  className="px-2.5 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-white border border-emerald-500/40 text-xs font-bold transition-all"
                                >
                                  نشر
                                </button>
                              )}
                            </td>
                            <td className="p-4 flex items-center gap-2">
                              <Link
                                href={`/reader?storyId=${s.id}`}
                                className="text-[#087C7B] hover:text-white flex items-center gap-1 font-semibold"
                              >
                                القارئ <ExternalLink className="w-3 h-3" />
                              </Link>
                              <button
                                type="button"
                                onClick={async () => {
                                  if (window.confirm(`هل أنت متأكد من حذف الرواية "${s.title || s.title_ar}" نهائياً؟`)) {
                                    try {
                                      await api.deleteAdminStory(s.id);
                                      toast({ title: 'تم حذف الرواية بنجاح' });
                                      fetchAllData();
                                    } catch (err: any) {
                                      toast({ title: 'فشل حذف الرواية', description: err.message, variant: 'destructive' });
                                    }
                                  }
                                }}
                                className="p-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                                title="حذف الرواية"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Subtab 3: SERIES */}
              {contentSubTab === 'series' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {seriesList.map((ser) => (
                    <div
                      key={ser.id}
                      className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 flex gap-4 items-center"
                    >
                      {ser.cover_image_url ? (
                        <img
                          src={ser.cover_image_url}
                          alt=""
                          className="w-16 h-20 rounded-xl object-cover border border-zinc-700 shrink-0"
                        />
                      ) : (
                        <div className="w-16 h-20 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-500 shrink-0 text-xs">
                          سلسلة
                        </div>
                      )}
                      <div className="space-y-1">
                        <div className="font-bold text-white text-sm">{ser.title_ar || ser.title}</div>
                        <div className="text-[11px] text-zinc-400 line-clamp-2">{ser.description_ar}</div>
                        <div className="flex items-center gap-2 pt-1 text-[10px]">
                          <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300">
                            {ser.issue_count || 0} عدد
                          </span>
                          <span className="text-[#087C7B] font-bold">{ser.status}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {seriesList.length === 0 && (
                    <div className="col-span-full py-12 text-center text-zinc-500 text-xs">
                      لا توجد سلاسل مصورة مضافة بعد. انقر على زر "إضافة سلسلة جديدة" بالأعلى.
                    </div>
                  )}
                </div>
              )}

              {/* Subtab 4: CLASSIFICATION */}
              {contentSubTab === 'classification' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 rounded-2xl bg-[#C5A15B]/10 border border-[#C5A15B]/30 space-y-3">
                    <div className="flex items-center gap-2 text-[#C5A15B] font-bold text-base">
                      <Sparkles className="w-5 h-5" />
                      <span>حكاياتي الأصلية (HEKAYATY ORIGINALS)</span>
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      هذا التصنيف مخصص للأعمال التي يتم تطويرها وإنتاجها بإشراف مباشر من فريق حكاياتي، وتعود ملكيتها الفكرية الكاملة لمنظومة حكاياتي للإعلام.
                    </p>
                    <div className="pt-2 text-2xl font-bold font-mono text-white">
                      {overview?.content?.originalsCount || 0} عمل موثق
                    </div>
                  </div>

                  <div className="p-6 rounded-2xl bg-[#087C7B]/10 border border-[#087C7B]/30 space-y-3">
                    <div className="flex items-center gap-2 text-teal-400 font-bold text-base">
                      <Award className="w-5 h-5" />
                      <span>حكاياتي المختارة (HEKAYATY SELECTED)</span>
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      هذا التصنيف مخصص للأعمال المنتقاة بعناية فائقة والمقدمة من المبدعين المستقلين ودور النشر الشريكة مع حفظ كامل الحقوق للمؤلف والرسام الأصلي.
                    </p>
                    <div className="pt-2 text-2xl font-bold font-mono text-white">
                      {overview?.content?.selectedCount || 0} عمل موثق
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 3: CHARACTERS & SUPERPOWERS STUDIO                         */}
          {/* ============================================================== */}
          {activeTab === 'characters_studio' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 bg-zinc-900/60 p-4 rounded-2xl border border-zinc-800">
                <div className="flex bg-zinc-950 rounded-xl p-1 border border-zinc-800 text-xs">
                  {[
                    { key: 'all', label: 'الكل' },
                    { key: 'hero', label: 'أبطال (Heroes)' },
                    { key: 'villain', label: 'أشرار (Villains)' },
                    { key: 'antihero', label: 'غامضون (Antiheroes)' },
                  ].map((f) => (
                    <button
                      key={f.key}
                      onClick={() => setCharacterFilter(f.key as any)}
                      className={`px-3 py-1.5 rounded-lg transition-all ${
                        characterFilter === f.key ? 'bg-[#087C7B] text-white font-bold' : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowPowersStudio(true)}
                    className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold flex items-center gap-2 border border-zinc-700"
                  >
                    <Zap className="w-4 h-4 text-[#C5A15B]" />
                    <span>مكتبة الخوارق والقدرات ({powersList.length})</span>
                  </button>
                  <button
                    onClick={() => {
                      setEditingCharacter(null);
                      setShowCharStudioModal(true);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#087C7B] to-[#0A9695] text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-[#087C7B]/20"
                  >
                    <Plus className="w-4 h-4" />
                    <span>توثيق بطل جديد</span>
                  </button>
                </div>
              </div>

              {/* Characters Grid with Power Rating Badge */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {characters
                  .filter((ch) => {
                    const r = ch.alignment || ch.role || 'hero';
                    return characterFilter === 'all' || r === characterFilter;
                  })
                  .map((ch) => {
                    const heroImg = ch.image_url || ch.imageUrl || ch.avatar_url || ch.image;
                    const heroName = ch.name_ar || ch.nameAr || ch.name || 'بطل غير مسمى';
                    const heroAlias = ch.alias_ar || ch.aliasAr || ch.alias || ch.title || 'بطل أسطوري';
                    const heroBio = ch.bio_ar || ch.bioAr || ch.description || ch.bio_en || ch.bioEn || '';
                    const heroRole = ch.alignment || ch.role || 'hero';
                    const rating = ch.powerRating || ch.stats?.powerRating || 85;
                    const worldName = ch.worldName || (worlds.find((w: any) => w.id === (ch.world_id || ch.worldId))?.name_ar);
                    const powersList = Array.isArray(ch.powers_ar) && ch.powers_ar.length > 0 
                      ? ch.powers_ar 
                      : (Array.isArray(ch.powers) ? ch.powers : []);

                    return (
                      <div
                        key={ch.id}
                        className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 flex flex-col justify-between hover:border-[#087C7B]/60 transition-all shadow-lg hover:shadow-[#087C7B]/10 group"
                      >
                        <div className="space-y-3">
                          <div className="relative aspect-[4/5] rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800 shadow-inner">
                            {heroImg ? (
                              <img
                                src={heroImg}
                                alt={heroName}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = '/assets/generated_images/zayed.jpg';
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center text-zinc-600 bg-gradient-to-b from-zinc-900 to-zinc-950">
                                <Users className="w-12 h-12 text-zinc-700 mb-1" />
                                <span className="text-[10px] text-zinc-500">لا توجد صورة</span>
                              </div>
                            )}

                            {/* Power Rating Badge */}
                            <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-black/80 backdrop-blur-md border border-[#C5A15B]/50 text-white text-[11px] font-mono font-bold flex items-center gap-1 shadow-md">
                              <span className="text-amber-400">⚡</span>
                              <span>{rating}/100</span>
                            </div>

                            {/* Role / Alignment Badge */}
                            <div className={`absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full text-[10px] font-bold backdrop-blur-md shadow-md border ${
                              heroRole === 'hero' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' :
                              heroRole === 'villain' ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' :
                              heroRole === 'antihero' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                              'bg-zinc-800/80 text-zinc-300 border-zinc-700'
                            }`}>
                              {heroRole === 'hero' ? 'بطل خارق' : heroRole === 'villain' ? 'خصم شرير' : heroRole === 'antihero' ? 'بطل مناهض' : 'محايد/غامض'}
                            </div>

                            {/* World badge */}
                            {worldName && (
                              <div className="absolute bottom-2.5 right-2.5 left-2.5 px-2 py-1 rounded-lg bg-black/75 backdrop-blur-sm border border-white/10 text-zinc-300 text-[10px] font-medium truncate flex items-center gap-1">
                                <Globe className="w-3 h-3 text-[#C5A15B] shrink-0" />
                                <span className="truncate">{worldName}</span>
                              </div>
                            )}
                          </div>

                          <div>
                            <div className="flex items-center justify-between gap-1">
                              <h4 className="font-bold text-white text-base truncate font-arabic">{heroName}</h4>
                              <span className="px-2 py-0.5 rounded text-[9px] font-semibold bg-[#087C7B]/20 text-[#087C7B] border border-[#087C7B]/30 shrink-0">
                                {ch.classification === 'hekayaty_selected' ? 'مختارة' : 'أصلي'}
                              </span>
                            </div>
                            <div className="text-xs text-[#C5A15B] font-semibold mt-0.5 truncate">{heroAlias}</div>
                            {heroBio && (
                              <p className="text-[11px] text-zinc-400 line-clamp-2 mt-1 leading-relaxed">
                                {heroBio}
                              </p>
                            )}

                            {/* Powers Tags */}
                            {powersList.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {powersList.slice(0, 3).map((p: string, idx: number) => (
                                  <span key={idx} className="px-1.5 py-0.5 rounded text-[10px] bg-white/5 border border-white/10 text-zinc-300">
                                    {p}
                                  </span>
                                ))}
                                {powersList.length > 3 && (
                                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-white/5 text-zinc-500">
                                    +{powersList.length - 3}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="pt-3 border-t border-zinc-800/80 mt-3 flex items-center justify-between gap-2">
                          <Link
                            href={`/characters/${ch.id}`}
                            className="text-[11px] text-[#087C7B] hover:text-white font-bold flex items-center gap-1 transition-colors"
                          >
                            الملف الكامل <ExternalLink className="w-3 h-3" />
                          </Link>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingCharacter(ch);
                                setShowCharStudioModal(true);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-[#087C7B] text-zinc-300 hover:text-white text-[10px] font-bold transition-colors"
                              title="تعديل بيانات البطل"
                            >
                              تعديل
                            </button>
                            <button
                              type="button"
                              onClick={async () => {
                                if (window.confirm(`هل أنت متأكد من حذف البطل "${heroName}" نهائياً من سجل الأبطال؟`)) {
                                  try {
                                    await api.deleteAdminCharacter(ch.id);
                                    toast({ title: 'تم حذف البطل بنجاح' });
                                    fetchAllData();
                                  } catch (err: any) {
                                    toast({ title: 'فشل حذف البطل', description: err.message, variant: 'destructive' });
                                  }
                                }
                              }}
                              className="p-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[10px] transition-colors"
                              title="حذف البطل"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 4: UNIVERSE & TIMELINE STUDIO                              */}
          {/* ============================================================== */}
          {activeTab === 'universe_studio' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 bg-zinc-900/60 p-4 rounded-2xl border border-zinc-800">
                <div>
                  <h3 className="font-bold text-white text-base">إدارة العوالم الكونية والأبعاد الخمسة</h3>
                  <p className="text-xs text-zinc-400">توثيق الأكوان، العوالم، المناطق البارزة، والخط الزمني الكوني</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowTimelineStudio(true)}
                    className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold flex items-center gap-2 border border-zinc-700"
                  >
                    <Calendar className="w-4 h-4 text-[#C5A15B]" />
                    <span>الخط الزمني والأحداث ({timelineList.length})</span>
                  </button>
                  <button
                    onClick={() => setShowWorldModal(true)}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#087C7B] to-[#0A9695] text-white text-xs font-bold flex items-center gap-2 shadow-lg"
                  >
                    <Plus className="w-4 h-4" />
                    <span>تأسيس عالم جديد</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {worlds.map((w) => (
                  <div
                    key={w.id}
                    className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 space-y-3 relative overflow-hidden"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <Globe className="w-5 h-5 text-[#087C7B]" />
                        <h4 className="font-bold text-white text-base">{w.name}</h4>
                      </div>
                      <span className="text-xs text-zinc-400 font-mono">{w.slug}</span>
                    </div>
                    <p className="text-xs text-zinc-400 line-clamp-3 leading-relaxed">
                      {w.description || 'بُعد ملحمي في منظومة عوالم حكاياتي المتداخلة.'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 5: IP & CREATOR MANAGEMENT                                 */}
          {/* ============================================================== */}
          {activeTab === 'ip_mgmt' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between bg-zinc-900/60 p-4 rounded-2xl border border-zinc-800">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Award className="w-5 h-5 text-[#C5A15B]" />
                    <span>سجل الملكية الفكرية وتراخيص النشر وصناع المحتوى</span>
                  </h2>
                  <p className="text-xs text-zinc-400">
                    توثيق العقود القانونية، وحسابات المؤلفين ودور النشر المسجلة في النظام
                  </p>
                </div>
                <button
                  onClick={() => setShowIpModal(true)}
                  className="px-4 py-2 rounded-xl bg-[#087C7B] hover:bg-[#066160] text-white text-xs font-semibold flex items-center gap-2 shadow-lg"
                >
                  <Plus className="w-4 h-4" />
                  تسجيل ترخيص IP جديد
                </button>
              </div>

              {/* Creators Directory Card */}
              <div className="p-5 rounded-2xl bg-[#141E2E] border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-[#C5A15B] flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>دليل الحسابات المعتمدة (المؤلفين ودور النشر المسجلة في النظام)</span>
                  </h4>
                  <span className="text-xs text-zinc-400 font-mono">
                    {creatorsDirectory.allWriters?.length || 0} مؤلف • {creatorsDirectory.allPublishingHouses?.length || 0} دار نشر
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
                  {creatorsDirectory.registeredAccounts?.map((acc: any) => (
                    <div key={acc.id} className="p-3 rounded-xl bg-[#0F172A] border border-zinc-800 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-[#087C7B]/20 text-[#087C7B] flex items-center justify-center font-bold text-sm">
                        {acc.role === 'writer' ? '✍️' : '🏛️'}
                      </div>
                      <div className="truncate">
                        <div className="font-bold text-white text-xs truncate">{acc.displayName || acc.email}</div>
                        <div className="text-[10px] text-zinc-500 font-mono">{acc.role}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-zinc-950/80 text-zinc-400 font-semibold border-b border-zinc-800">
                      <tr>
                        <th className="p-4">اسم العمل / الملكية</th>
                        <th className="p-4">مالك الحقوق القانوني</th>
                        <th className="p-4">نوع الترخيص</th>
                        <th className="p-4">النطاق الجغرافي</th>
                        <th className="p-4">تاريخ الانتهاء</th>
                        <th className="p-4">الحالة القانونية</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60">
                      {ipRecords.map((ip) => (
                        <tr key={ip.id} className="hover:bg-zinc-800/30 transition-colors">
                          <td className="p-4 font-bold text-white">{ip.title}</td>
                          <td className="p-4 text-zinc-300">{ip.rights_holder}</td>
                          <td className="p-4 font-mono text-[#C5A15B]">{ip.license_type}</td>
                          <td className="p-4 text-zinc-400">{ip.exclusivity_territory}</td>
                          <td className="p-4 text-zinc-400 font-mono">
                            {ip.valid_until ? new Date(ip.valid_until).toLocaleDateString('ar-EG') : 'دائم / غير محدد'}
                          </td>
                          <td className="p-4">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[11px]">
                              <CheckCircle2 className="w-3 h-3" />
                              ساري ومعتمد
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 6: PUBLISHING & WORKFLOW MANAGEMENT                        */}
          {/* ============================================================== */}
          {activeTab === 'publishing_mgmt' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 bg-zinc-900/60 p-4 rounded-2xl border border-zinc-800">
                <div>
                  <h3 className="font-bold text-white text-base">منظومة النشر واعتماد المسودات</h3>
                  <p className="text-xs text-zinc-400">متابعة وتدقيق مراحل النشر: المسودات، قيد المراجعة، المنشور، والمجدول</p>
                </div>
                <div className="flex bg-zinc-950 rounded-xl p-1 border border-zinc-800 text-xs">
                  {[
                    { key: 'all', label: 'الكل' },
                    { key: 'published', label: 'المنشور' },
                    { key: 'draft', label: 'المسودات' },
                    { key: 'pending_review', label: 'قيد المراجعة' },
                    { key: 'scheduled', label: 'المجدول' },
                  ].map((f) => (
                    <button
                      key={f.key}
                      onClick={() => setPublishingFilter(f.key as any)}
                      className={`px-3 py-1.5 rounded-lg transition-all ${
                        publishingFilter === f.key ? 'bg-[#087C7B] text-white font-bold' : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Unified Table of Comics and Stories filtered by status */}
              <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-zinc-950/80 text-zinc-400 font-semibold border-b border-zinc-800">
                      <tr>
                        <th className="p-4">عنوان العمل</th>
                        <th className="p-4">النوع</th>
                        <th className="p-4">التصنيف</th>
                        <th className="p-4">حالة النشر</th>
                        <th className="p-4">الإجراء الإداري</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60">
                      {[...comics.map((c) => ({ ...c, kind: 'comic' })), ...stories.map((s) => ({ ...s, kind: 'story' }))]
                        .filter((item) => publishingFilter === 'all' || item.status === publishingFilter)
                        .map((item) => (
                          <tr key={item.id} className="hover:bg-zinc-800/30">
                            <td className="p-4 font-bold text-white">{item.title}</td>
                            <td className="p-4 font-semibold text-zinc-400">
                              {item.kind === 'comic' ? 'قصة مصورة' : 'رواية أدبية'}
                            </td>
                            <td className="p-4">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  item.classification === 'original'
                                    ? 'bg-[#C5A15B]/20 text-[#C5A15B]'
                                    : 'bg-[#087C7B]/20 text-teal-300'
                                }`}
                              >
                                {item.classification === 'original' ? 'أصلي' : 'مختار'}
                              </span>
                            </td>
                            <td className="p-4">
                              <span
                                className={`px-2.5 py-0.5 rounded text-[11px] font-bold font-mono ${
                                  (item.status || 'published') === 'published'
                                    ? 'bg-emerald-500/20 text-emerald-300'
                                    : (item.status || 'published') === 'draft'
                                    ? 'bg-zinc-700/40 text-zinc-300'
                                    : (item.status || 'published') === 'pending_review'
                                    ? 'bg-amber-500/20 text-amber-300'
                                    : (item.status || 'published') === 'scheduled'
                                    ? 'bg-sky-500/20 text-sky-300'
                                    : 'bg-red-500/20 text-red-300'
                                }`}
                              >
                                {(item.status || 'published') === 'published'
                                  ? 'منشور'
                                  : (item.status || 'published') === 'draft'
                                  ? 'مسودة'
                                  : (item.status || 'published') === 'pending_review'
                                  ? 'قيد المراجعة'
                                  : (item.status || 'published') === 'scheduled'
                                  ? 'مجدول'
                                  : 'مؤرشف'}
                              </span>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-1.5">
                                {(item.status || 'published') !== 'published' && (
                                  <button
                                    type="button"
                                    onClick={async () => {
                                      try {
                                        if (item.kind === 'comic') {
                                          await api.updateAdminComicStatus(item.id, 'published');
                                          setComics((prev) => prev.map((c) => (c.id === item.id ? { ...c, status: 'published' } : c)));
                                        } else {
                                          await api.updateAdminStoryStatus(item.id, 'published');
                                          setStories((prev) => prev.map((s) => (s.id === item.id ? { ...s, status: 'published' } : s)));
                                        }
                                        toast({ title: '✅ تم اعتماد ونشر العمل بنجاح', description: item.title });
                                      } catch (err: any) {
                                        toast({ title: 'فشل النشر', description: err.message, variant: 'destructive' });
                                      }
                                    }}
                                    className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500 text-emerald-400 hover:text-white font-bold text-[11px] transition-colors"
                                  >
                                    اعتماد ونشر
                                  </button>
                                )}
                                {(item.status || 'published') === 'published' && (
                                  <button
                                    type="button"
                                    onClick={async () => {
                                      try {
                                        if (item.kind === 'comic') {
                                          await api.updateAdminComicStatus(item.id, 'draft');
                                          setComics((prev) => prev.map((c) => (c.id === item.id ? { ...c, status: 'draft' } : c)));
                                        } else {
                                          await api.updateAdminStoryStatus(item.id, 'draft');
                                          setStories((prev) => prev.map((s) => (s.id === item.id ? { ...s, status: 'draft' } : s)));
                                        }
                                        toast({ title: 'تم تحويل العمل لمسودة', description: item.title });
                                      } catch (err: any) {
                                        toast({ title: 'فشل العملية', description: err.message, variant: 'destructive' });
                                      }
                                    }}
                                    className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-[11px] transition-colors"
                                  >
                                    تحويل لمسودة
                                  </button>
                                )}
                                {(item.status || 'published') !== 'archived' && (
                                  <button
                                    type="button"
                                    onClick={async () => {
                                      try {
                                        if (item.kind === 'comic') {
                                          await api.updateAdminComicStatus(item.id, 'archived');
                                          setComics((prev) => prev.map((c) => (c.id === item.id ? { ...c, status: 'archived' } : c)));
                                        } else {
                                          await api.updateAdminStoryStatus(item.id, 'archived');
                                          setStories((prev) => prev.map((s) => (s.id === item.id ? { ...s, status: 'archived' } : s)));
                                        }
                                        toast({ title: 'تمت أرشفة العمل', description: item.title });
                                      } catch (err: any) {
                                        toast({ title: 'فشل الأرشفة', description: err.message, variant: 'destructive' });
                                      }
                                    }}
                                    className="px-2 py-1 rounded-lg hover:bg-red-500/20 text-zinc-500 hover:text-red-400 font-semibold text-[11px] transition-colors"
                                  >
                                    أرشفة
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 7: OPERATIONS, USERS, COMMERCE & AUDIT                     */}
          {/* ============================================================== */}
          {activeTab === 'operations' && (
            <div className="space-y-6">
              {/* Operations Sub-navigation */}
              <div className="flex bg-zinc-900 rounded-xl p-1 border border-zinc-800 text-xs">
                <button
                  onClick={() => setOperationsSubTab('financials')}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    operationsSubTab === 'financials' ? 'bg-[#087C7B] text-white shadow' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  المالية والمصاريف
                </button>
                <button
                  onClick={() => setOperationsSubTab('users')}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    operationsSubTab === 'users' ? 'bg-[#087C7B] text-white shadow' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  المستخدمين والصلاحيات ({adminUsers.length})
                </button>
                <button
                  onClick={() => setOperationsSubTab('applications')}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    operationsSubTab === 'applications' ? 'bg-[#087C7B] text-white shadow' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  طلبات المبدعين ({creatorApps.length})
                </button>
                <button
                  onClick={() => setOperationsSubTab('commerce')}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    operationsSubTab === 'commerce' ? 'bg-[#087C7B] text-white shadow' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  المتجر والمخزون ({products.length})
                </button>
                <button
                  onClick={() => setOperationsSubTab('audit')}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    operationsSubTab === 'audit' ? 'bg-[#087C7B] text-white shadow' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  سجل الرقابة
                </button>
              </div>

              {/* Operations: Financials */}
              {operationsSubTab === 'financials' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-bold text-white flex items-center gap-2">
                        <Coins className="w-5 h-5 text-emerald-400" />
                        العمليات المالية وحساب الأرباح والمصاريف
                      </h2>
                    </div>
                    <button
                      onClick={() => setShowExpenseModal(true)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-2 shadow-lg"
                    >
                      <Plus className="w-4 h-4" />
                      قيد مصروف تشغيلي جديد
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2">
                      <span className="text-xs text-zinc-400 font-semibold">إجمالي المبيعات (Gross Sales)</span>
                      <div className="text-2xl font-bold font-mono text-white">
                        {(financials?.grossSales || overview?.financial?.grossSales || 0).toLocaleString()} ج.م
                      </div>
                      <span className="text-[11px] text-emerald-400 font-semibold">كل الطلبات المكتملة</span>
                    </div>

                    <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2">
                      <span className="text-xs text-zinc-400 font-semibold">عوائد المؤلفين المعتمدة (50%)</span>
                      <div className="text-2xl font-bold font-mono text-amber-400">
                        {(financials?.writerRoyalties || 0).toLocaleString()} ج.م
                      </div>
                      <span className="text-[11px] text-zinc-400">مستحقات الكتّاب وصناع المحتوى</span>
                    </div>

                    <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2">
                      <span className="text-xs text-zinc-400 font-semibold">صافي أرباح المنصة</span>
                      <div className="text-2xl font-bold font-mono text-emerald-400">
                        {(financials?.platformShare || overview?.financial?.netSales || 0).toLocaleString()} ج.م
                      </div>
                      <span className="text-[11px] text-zinc-400">بعد خصم حصص الشركاء</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Operations: Users */}
              {operationsSubTab === 'users' && (
                <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-right text-xs">
                      <thead className="bg-zinc-950/80 text-zinc-400 font-semibold border-b border-zinc-800">
                        <tr>
                          <th className="p-4">المستخدم</th>
                          <th className="p-4">البريد الإلكتروني</th>
                          <th className="p-4">الدور / الصلاحية</th>
                          <th className="p-4">الحالة</th>
                          <th className="p-4">التحكم في الحساب</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800/60">
                        {adminUsers.map((u) => (
                          <tr key={u.id} className="hover:bg-zinc-800/30">
                            <td className="p-4 font-bold text-white">{u.display_name || 'مستخدم حكاياتي'}</td>
                            <td className="p-4 text-zinc-300 font-mono">{u.email}</td>
                            <td className="p-4">
                              <select
                                value={u.role || 'reader'}
                                onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                className="bg-zinc-950 border border-zinc-700 rounded-lg px-2 py-1 text-xs text-white"
                              >
                                <option value="reader">قارئ</option>
                                <option value="writer">مؤلف</option>
                                <option value="publishing_house">دار نشر</option>
                                <option value="admin">مدير نظام</option>
                              </select>
                            </td>
                            <td className="p-4">
                              {u.is_active ? (
                                <span className="text-emerald-400 font-bold">نشط</span>
                              ) : (
                                <span className="text-red-400 font-bold">معلق</span>
                              )}
                            </td>
                            <td className="p-4">
                              <button
                                onClick={() => handleToggleUserStatus(u.id, u.is_active)}
                                className="px-3 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300"
                              >
                                {u.is_active ? 'تعليق' : 'تفعيل'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Operations: Applications */}
              {operationsSubTab === 'applications' && (
                <div className="space-y-4">
                  {creatorApps.map((app) => (
                    <div key={app.id || app.user_id} className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex justify-between items-center">
                      <div>
                        <div className="font-bold text-white text-sm">{app.profiles?.display_name || app.name_ar || app.email}</div>
                        <div className="text-xs text-zinc-400 mt-1">النوع المطلوب: {app.metadata?.requested_role || app.type}</div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleResolveApp(app.user_id, 'approved', app.metadata?.requested_role || app.type)}
                          className="px-4 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs"
                        >
                          اعتماد وترقية
                        </button>
                        <button
                          onClick={() => handleResolveApp(app.user_id, 'rejected', app.metadata?.requested_role || app.type)}
                          className="px-4 py-1.5 rounded-xl bg-red-600 text-white font-bold text-xs"
                        >
                          رفض
                        </button>
                      </div>
                    </div>
                  ))}
                  {creatorApps.length === 0 && (
                    <div className="py-12 text-center text-zinc-500 text-xs">لا توجد طلبات معلقة حالياً.</div>
                  )}
                </div>
              )}

              {/* Operations: Commerce */}
              {operationsSubTab === 'commerce' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-bold text-white">منتجات المتجر والمخزون</h4>
                    <button
                      onClick={() => setShowProductModal(true)}
                      className="px-4 py-2 rounded-xl bg-[#087C7B] text-white text-xs font-bold"
                    >
                      إضافة منتج جديد
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {products.map((p) => (
                      <div key={p.id} className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2">
                        <div className="font-bold text-white">{p.name}</div>
                        <div className="text-xs text-emerald-400 font-mono font-bold">{p.price_egp} ج.م</div>
                        <div className="text-xs text-zinc-400">المخزون: {p.stock_quantity} قطعة</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Operations: Audit Logs */}
              {operationsSubTab === 'audit' && (
                <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-right text-xs">
                      <thead className="bg-zinc-950/80 text-zinc-400 font-semibold border-b border-zinc-800">
                        <tr>
                          <th className="p-4">الإجراء</th>
                          <th className="p-4">النوع</th>
                          <th className="p-4">المعرف</th>
                          <th className="p-4">التاريخ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800/60">
                        {auditLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-zinc-800/30">
                            <td className="p-4 font-bold text-white">{log.action}</td>
                            <td className="p-4 text-zinc-400 font-mono">{log.resource_type}</td>
                            <td className="p-4 text-zinc-500 font-mono text-[11px]">{log.resource_id}</td>
                            <td className="p-4 text-zinc-400 font-mono">
                              {new Date(log.created_at).toLocaleString('ar-EG')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════ */}
          {/* SERIES PLATFORM (NOVELS & COMICS SEASONS/EPISODES)                 */}
          {/* ══════════════════════════════════════════════════════════════════ */}
          {activeTab === 'series_platform' && (
            <SeriesPlatformMgmtPanel toast={toast} />
          )}

          {/* ══════════════════════════════════════════════════════════════════ */}
          {/* EVENTS & CARNIVALS MANAGEMENT TAB                                  */}
          {/* ══════════════════════════════════════════════════════════════════ */}
          {activeTab === 'events_mgmt' && (
            <EventsMgmtPanel toast={toast} />
          )}

          {/* ══════════════════════════════════════════════════════════════════ */}
          {/* DAILY MYSTERY MANAGEMENT TAB                                       */}
          {/* ══════════════════════════════════════════════════════════════════ */}
          {activeTab === 'mystery_mgmt' && (
            <MysteryMgmtPanel toast={toast} />
          )}

          {/* SEO & SOCIAL SHARING MANAGEMENT TAB */}
          {activeTab === 'seo_mgmt' && (
            <SEOManagerSection />
          )}
        </div>
      </div>

      {/* ============================================================== */}
      {/* NEW STUDIO MODALS — Mounted here, triggered from the tabs above  */}
      {/* ============================================================== */}

      {/* Unified 4-Step Creation Wizard (Comics & Novels) */}
      <UnifiedCreationWizardModal
        isOpen={showCreationWizard}
        onClose={() => setShowCreationWizard(false)}
        onSuccess={fetchAllData}
        toast={toast}
        worlds={worlds}
        characters={characters}
        seriesList={seriesList}
        creatorsDirectory={creatorsDirectory}
        onOpenChaptersStudio={(story) => {
          setActiveStoryForChapters({ id: story.id, title: story.title });
          setShowChapterStudio(true);
        }}
        onOpenComicPagesStudio={(comic) => {
          setActiveComicForPages({ id: comic.id, title: comic.title });
          setShowComicPagesStudio(true);
        }}
      />

      {/* Comic Pages Studio */}
      <ComicPagesStudioModal
        isOpen={showComicPagesStudio}
        onClose={() => setShowComicPagesStudio(false)}
        comicId={activeComicForPages.id}
        comicTitle={activeComicForPages.title}
        toast={toast}
        onSuccess={fetchAllData}
      />

      {/* Novel & Book Chapters Studio */}
      <NovelChapterEditorModal
        isOpen={showChapterStudio}
        onClose={() => setShowChapterStudio(false)}
        storyId={activeStoryForChapters.id}
        storyTitle={activeStoryForChapters.title}
        toast={toast}
        onSuccess={fetchAllData}
      />

      {/* Powers & Abilities Library */}
      <PowersStudioModal
        isOpen={showPowersStudio}
        onClose={() => setShowPowersStudio(false)}
        toast={toast}
      />

      {/* Cosmic Timeline Studio */}
      <TimelineStudioModal
        isOpen={showTimelineStudio}
        onClose={() => setShowTimelineStudio(false)}
        toast={toast}
        worlds={worlds}
      />

      {/* Advanced Character Creation with Power Rating */}
      <CharacterCreationModal
        isOpen={showCharStudioModal}
        onClose={() => {
          setShowCharStudioModal(false);
          setEditingCharacter(null);
        }}
        onSuccess={fetchAllData}
        toast={toast}
        worlds={worlds}
        powersLibrary={powersList}
        characterToEdit={editingCharacter}
      />

      {/* Quick Series Creation Modal */}
      {showSeriesModal && (
        <ModalPortal>
          <div className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-md overflow-y-auto p-4 flex items-center justify-center">
            <div className="bg-[#141E2E] border border-zinc-700/80 rounded-2xl max-w-lg w-full shadow-[0_25px_80px_rgba(0,0,0,0.9)] border-[#087C7B]/40 flex flex-col max-h-[85vh] overflow-hidden my-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-[#162235] shrink-0">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#087C7B]" />
                إنشاء سلسلة مصورة جديدة
              </h3>
              <button onClick={() => setShowSeriesModal(false)} className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                await api.createAdminSeries(newSeries);
                setShowSeriesModal(false);
                fetchAllData();
                toast({ title: 'تم إنشاء السلسلة', description: `السلسلة "${newSeries.title_ar}" جاهزة.` });
                setNewSeries({ title_ar: '', title_en: '', description_ar: '', world_id: '', classification: 'original', cover_image_url: '', status: 'ongoing' });
              } catch (err: any) {
                toast({ title: 'خطأ', description: err.message, variant: 'destructive' });
              }
            }} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 space-y-4 overflow-y-auto text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-zinc-200 mb-1.5 font-semibold">عنوان السلسلة (عربي) *</label>
                    <input
                      type="text" required
                      placeholder="مثال: سلسلة أبطال الأفق"
                      value={newSeries.title_ar}
                      onChange={(e) => setNewSeries({ ...newSeries, title_ar: e.target.value })}
                      className="w-full bg-[#0B1320] border border-[#2B3B52] rounded-xl px-3.5 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-[#087C7B]"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-200 mb-1.5 font-semibold">Title (English)</label>
                    <input
                      type="text"
                      placeholder="e.g. Heroes of the Horizon Series"
                      value={newSeries.title_en}
                      onChange={(e) => setNewSeries({ ...newSeries, title_en: e.target.value })}
                      className="w-full bg-[#0B1320] border border-[#2B3B52] rounded-xl px-3.5 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-[#087C7B]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-zinc-200 mb-1.5 font-semibold">وصف السلسلة</label>
                  <textarea
                    rows={3}
                    placeholder="نبذة عن السلسلة وأحداثها..."
                    value={newSeries.description_ar}
                    onChange={(e) => setNewSeries({ ...newSeries, description_ar: e.target.value })}
                    className="w-full bg-[#0B1320] border border-[#2B3B52] rounded-xl px-3.5 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-[#087C7B]"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-zinc-200 mb-1.5 font-semibold">التصنيف</label>
                    <select
                      value={newSeries.classification}
                      onChange={(e) => setNewSeries({ ...newSeries, classification: e.target.value })}
                      className="w-full bg-[#0B1320] border border-[#2B3B52] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#087C7B]"
                    >
                      <option value="original">حكاياتي الأصلية</option>
                      <option value="hekayaty_selected">حكاياتي المختارة</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-zinc-200 mb-1.5 font-semibold">الحالة</label>
                    <select
                      value={newSeries.status}
                      onChange={(e) => setNewSeries({ ...newSeries, status: e.target.value })}
                      className="w-full bg-[#0B1320] border border-[#2B3B52] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#087C7B]"
                    >
                      <option value="ongoing">مستمرة</option>
                      <option value="completed">مكتملة</option>
                      <option value="hiatus">متوقفة مؤقتاً</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-zinc-200 mb-1.5 font-semibold">العالم المرتبط</label>
                  <select
                    value={newSeries.world_id}
                    onChange={(e) => setNewSeries({ ...newSeries, world_id: e.target.value })}
                    className="w-full bg-[#0B1320] border border-[#2B3B52] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#087C7B]"
                  >
                    <option value="">بدون عالم محدد</option>
                    {worlds.map((w) => (
                      <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <ImageUploadField
                    label="صورة الغلاف"
                    value={newSeries.cover_image_url}
                    onChange={(url) => setNewSeries({ ...newSeries, cover_image_url: url })}
                    folder="series"
                    previewAspect="portrait"
                  />
                </div>
              </div>
              <div className="px-6 py-4 border-t border-zinc-800 bg-[#162235] flex items-center justify-end gap-3 shrink-0">
                <button type="button" onClick={() => setShowSeriesModal(false)} className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold">
                  إلغاء
                </button>
                <button type="submit" className="px-6 py-2 rounded-xl bg-[#087C7B] hover:bg-[#066160] text-white text-xs font-semibold shadow-lg shadow-[#087C7B]/20">
                  إنشاء السلسلة
                </button>
              </div>
            </form>
          </div>
        </div>
        </ModalPortal>
      )}

      {/* ============================================================== */}
      {/* MODAL 1: CREATE COMIC (Legacy — kept for compatibility) */}
      {/* ============================================================== */}
      {showComicModal && (
        <ModalPortal>
          <div className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-md overflow-y-auto p-4 sm:p-6 flex items-center justify-center">
            <div className="bg-[#141E2E] border border-zinc-700/80 rounded-2xl max-w-2xl w-full shadow-[0_25px_80px_rgba(0,0,0,0.9)] border-[#087C7B]/40 flex flex-col max-h-[85vh] overflow-hidden my-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-[#162235] shrink-0">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#087C7B]" />
                إدراج قصة مصورة جديدة مع توثيق الملكية الفكرية
              </h3>
              <button
                type="button"
                onClick={() => setShowComicModal(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <form onSubmit={handleCreateComic} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 space-y-4 overflow-y-auto text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-zinc-200 mb-1.5 font-semibold">عنوان الكوميكس (بالعربية) *</label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: ملحمة الأفق الذهبي"
                      value={newComic.title}
                      onChange={(e) => setNewComic({ ...newComic, title: e.target.value })}
                      className="w-full bg-[#0B1320] border border-[#2B3B52] rounded-xl px-3.5 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-[#087C7B] focus:ring-1 focus:ring-[#087C7B]"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-200 mb-1.5 font-semibold">Title (English)</label>
                    <input
                      type="text"
                      placeholder="e.g. Dawn of the Golden Horizon"
                      value={newComic.title_en}
                      onChange={(e) => setNewComic({ ...newComic, title_en: e.target.value })}
                      className="w-full bg-[#0B1320] border border-[#2B3B52] rounded-xl px-3.5 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-[#087C7B] focus:ring-1 focus:ring-[#087C7B]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-200 mb-1.5 font-semibold">المعرف اللطيف (Slug) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. golden-horizon-epic"
                    value={newComic.slug}
                    onChange={(e) => setNewComic({ ...newComic, slug: e.target.value })}
                    className="w-full bg-[#0B1320] border border-[#2B3B52] rounded-xl px-3.5 py-2.5 text-white font-mono placeholder-zinc-500 focus:outline-none focus:border-[#087C7B] focus:ring-1 focus:ring-[#087C7B]"
                  />
                </div>

                {/* MANDATORY CLASSIFICATION SELECTOR */}
                <div className="p-4 rounded-xl bg-[#0B1320] border border-[#C5A15B]/50 space-y-3 shadow-inner">
                  <div className="flex items-center justify-between">
                    <label className="text-[#C5A15B] font-bold text-xs flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4" />
                      التصنيف المؤسسي الإلزامي (Classification) *
                    </label>
                    <span className="text-[11px] text-zinc-400">حدد نوع التعاقد والملكية</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setNewComic({ ...newComic, classification: 'original' })}
                      className={`text-right p-3 rounded-xl border transition-all flex items-start gap-3 ${
                        newComic.classification === 'original'
                          ? 'bg-[#C5A15B]/15 border-[#C5A15B] text-white shadow-md'
                          : 'bg-[#141E2E] border-zinc-800 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full mt-0.5 border flex items-center justify-center shrink-0 ${
                        newComic.classification === 'original' ? 'border-[#C5A15B]' : 'border-zinc-600'
                      }`}>
                        {newComic.classification === 'original' && <div className="w-2 h-2 rounded-full bg-[#C5A15B]" />}
                      </div>
                      <div>
                        <div className="font-bold text-white text-xs">حكاياتي الأصلية</div>
                        <div className="text-[10px] text-[#C5A15B] font-mono mt-0.5">HEKAYATY ORIGINALS</div>
                        <p className="text-[10px] text-zinc-400 mt-1 leading-snug">
                          ملكية حصرية تامة لشبكة حكاياتي مع كامل حقوق الاستغلال التجاري.
                        </p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setNewComic({ ...newComic, classification: 'hekayaty_selected' })}
                      className={`text-right p-3 rounded-xl border transition-all flex items-start gap-3 ${
                        newComic.classification === 'hekayaty_selected'
                          ? 'bg-[#087C7B]/20 border-[#087C7B] text-white shadow-md'
                          : 'bg-[#141E2E] border-zinc-800 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full mt-0.5 border flex items-center justify-center shrink-0 ${
                        newComic.classification === 'hekayaty_selected' ? 'border-[#087C7B]' : 'border-zinc-600'
                      }`}>
                        {newComic.classification === 'hekayaty_selected' && <div className="w-2 h-2 rounded-full bg-[#087C7B]" />}
                      </div>
                      <div>
                        <div className="font-bold text-white text-xs">حكاياتي المختارة</div>
                        <div className="text-[10px] text-teal-400 font-mono mt-0.5">HEKAYATY SELECTED</div>
                        <p className="text-[10px] text-zinc-400 mt-1 leading-snug">
                          أعمال مرخصة ومختارة من دور النشر أو المبدعين المستقلين.
                        </p>
                      </div>
                    </button>
                  </div>

                  {newComic.classification === 'original' ? (
                    <div className="space-y-1.5 pt-2 border-t border-zinc-800/80">
                      <label className="block text-zinc-200 font-semibold">الجهة المالكة للحقوق (Rights Holder) *</label>
                      <input
                        type="text"
                        value={newComic.rights_holder}
                        onChange={(e) => setNewComic({ ...newComic, rights_holder: e.target.value })}
                        className="w-full bg-[#141E2E] border border-[#2B3B52] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#C5A15B]"
                      />
                    </div>
                  ) : (
                    <div className="space-y-1.5 pt-2 border-t border-zinc-800/80">
                      <label className="block text-zinc-200 font-semibold">المؤلف / دار النشر الأصلية المرخِّصة *</label>
                      <input
                        type="text"
                        placeholder="اسم المبدع الأصلي أو دار النشر الشريكة"
                        value={newComic.original_creator}
                        onChange={(e) => setNewComic({ ...newComic, original_creator: e.target.value })}
                        className="w-full bg-[#141E2E] border border-[#2B3B52] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#087C7B]"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-zinc-200 mb-1.5 font-semibold">الملخص السردي (Synopsis)</label>
                  <textarea
                    rows={3}
                    placeholder="نبذة تشويقية عن القصة المصورة وأحداثها..."
                    value={newComic.synopsis}
                    onChange={(e) => setNewComic({ ...newComic, synopsis: e.target.value })}
                    className="w-full bg-[#0B1320] border border-[#2B3B52] rounded-xl px-3.5 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-[#087C7B]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <ImageUploadField
                      label="صورة الغلاف"
                      value={newComic.cover_image_url}
                      onChange={(url) => setNewComic({ ...newComic, cover_image_url: url })}
                      folder="comics"
                      previewAspect="portrait"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-200 mb-1.5 font-semibold">العالم المرتبط</label>
                    <select
                      value={newComic.world_id}
                      onChange={(e) => setNewComic({ ...newComic, world_id: e.target.value })}
                      className="w-full bg-[#0B1320] border border-[#2B3B52] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#087C7B]"
                    >
                      <option value="">بدون عالم محدد</option>
                      {worlds.map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 pt-2">
                  <input
                    type="checkbox"
                    id="featured_comic"
                    checked={newComic.is_featured}
                    onChange={(e) => setNewComic({ ...newComic, is_featured: e.target.checked })}
                    className="w-4 h-4 rounded text-[#087C7B] focus:ring-0 bg-[#0B1320] border-zinc-700"
                  />
                  <label htmlFor="featured_comic" className="text-zinc-300 font-medium cursor-pointer">
                    تثبيت العمل كعمل مميز في الصفحة الرئيسية
                  </label>
                </div>
              </div>

              {/* Modal Sticky Footer */}
              <div className="px-6 py-4 border-t border-zinc-800 bg-[#162235] flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowComicModal(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-[#087C7B] hover:bg-[#066160] text-white text-xs font-semibold shadow-lg shadow-[#087C7B]/20 transition-all"
                >
                  اعتماد ونشر العمل المصور
                </button>
              </div>
            </form>
          </div>
        </div>
        </ModalPortal>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: CREATE STORY / NOVEL */}
      {/* ============================================================== */}
      {showStoryModal && (
        <ModalPortal>
          <div className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-md overflow-y-auto p-4 sm:p-6 flex items-center justify-center">
            <div className="bg-[#141E2E] border border-zinc-700/80 rounded-2xl max-w-2xl w-full shadow-[0_25px_80px_rgba(0,0,0,0.9)] border-[#087C7B]/40 flex flex-col max-h-[85vh] overflow-hidden my-auto">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-[#162235] shrink-0">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#087C7B]" />
                إدراج رواية / قصة جديدة في المنظومة
              </h3>
              <button
                type="button"
                onClick={() => setShowStoryModal(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStory} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 space-y-4 overflow-y-auto text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-zinc-200 mb-1.5 font-semibold">عنوان الرواية *</label>
                    <input
                      type="text"
                      required
                      placeholder="عنوان الرواية أو القصة"
                      value={newStory.title}
                      onChange={(e) => setNewStory({ ...newStory, title: e.target.value })}
                      className="w-full bg-[#0B1320] border border-[#2B3B52] rounded-xl px-3.5 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-[#087C7B]"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-200 mb-1.5 font-semibold">المعرف اللطيف (Slug) *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. whispers-of-the-desert"
                      value={newStory.slug}
                      onChange={(e) => setNewStory({ ...newStory, slug: e.target.value })}
                      className="w-full bg-[#0B1320] border border-[#2B3B52] rounded-xl px-3.5 py-2.5 text-white font-mono placeholder-zinc-500 focus:outline-none focus:border-[#087C7B]"
                    />
                  </div>
                </div>

                {/* Classification */}
                <div className="p-4 rounded-xl bg-[#0B1320] border border-[#C5A15B]/50 space-y-3 shadow-inner">
                  <div className="flex items-center justify-between">
                    <label className="text-[#C5A15B] font-bold text-xs flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4" />
                      التصنيف المؤسسي الإلزامي (Classification) *
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setNewStory({ ...newStory, classification: 'original' })}
                      className={`text-right p-3 rounded-xl border transition-all flex items-start gap-3 ${
                        newStory.classification === 'original'
                          ? 'bg-[#C5A15B]/15 border-[#C5A15B] text-white shadow-md'
                          : 'bg-[#141E2E] border-zinc-800 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full mt-0.5 border flex items-center justify-center shrink-0 ${
                        newStory.classification === 'original' ? 'border-[#C5A15B]' : 'border-zinc-600'
                      }`}>
                        {newStory.classification === 'original' && <div className="w-2 h-2 rounded-full bg-[#C5A15B]" />}
                      </div>
                      <div>
                        <div className="font-bold text-white text-xs">حكاياتي الأصلية</div>
                        <div className="text-[10px] text-[#C5A15B] font-mono mt-0.5">HEKAYATY ORIGINALS</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setNewStory({ ...newStory, classification: 'hekayaty_selected' })}
                      className={`text-right p-3 rounded-xl border transition-all flex items-start gap-3 ${
                        newStory.classification === 'hekayaty_selected'
                          ? 'bg-[#087C7B]/20 border-[#087C7B] text-white shadow-md'
                          : 'bg-[#141E2E] border-zinc-800 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full mt-0.5 border flex items-center justify-center shrink-0 ${
                        newStory.classification === 'hekayaty_selected' ? 'border-[#087C7B]' : 'border-zinc-600'
                      }`}>
                        {newStory.classification === 'hekayaty_selected' && <div className="w-2 h-2 rounded-full bg-[#087C7B]" />}
                      </div>
                      <div>
                        <div className="font-bold text-white text-xs">حكاياتي المختارة</div>
                        <div className="text-[10px] text-teal-400 font-mono mt-0.5">HEKAYATY SELECTED</div>
                      </div>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-200 mb-1.5 font-semibold">الملخص والمدخل السردي</label>
                  <textarea
                    rows={2}
                    placeholder="نبذة سريعة عن حبكة الرواية..."
                    value={newStory.synopsis}
                    onChange={(e) => setNewStory({ ...newStory, synopsis: e.target.value })}
                    className="w-full bg-[#0B1320] border border-[#2B3B52] rounded-xl px-3.5 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-[#087C7B]"
                  />
                </div>

                <div>
                  <label className="block text-zinc-200 mb-1.5 font-semibold">نص القصة / الفصل الأول الكامل *</label>
                  <textarea
                    rows={6}
                    required
                    value={newStory.content}
                    onChange={(e) => setNewStory({ ...newStory, content: e.target.value })}
                    placeholder="اكتب أو الصق نص الرواية الكامل هنا..."
                    className="w-full bg-[#0B1320] border border-[#2B3B52] rounded-xl px-3.5 py-2.5 text-white font-arabic leading-relaxed placeholder-zinc-500 focus:outline-none focus:border-[#087C7B]"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-zinc-800 bg-[#162235] flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowStoryModal(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-[#087C7B] hover:bg-[#066160] text-white text-xs font-semibold shadow-lg shadow-[#087C7B]/20"
                >
                  حفظ ونشر الرواية
                </button>
              </div>
            </form>
          </div>
        </div>
        </ModalPortal>
      )}

      {/* ============================================================== */}
      {/* MODAL 3: CREATE CHARACTER */}
      {/* ============================================================== */}
      {showCharModal && (
        <ModalPortal>
          <div className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-md overflow-y-auto p-4 sm:p-6 flex items-center justify-center">
            <div className="bg-[#141E2E] border border-zinc-700/80 rounded-2xl max-w-lg w-full shadow-[0_25px_80px_rgba(0,0,0,0.9)] border-[#087C7B]/40 flex flex-col max-h-[85vh] overflow-hidden my-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-[#162235] shrink-0">
              <h3 className="font-bold text-white text-base">توثيق بطل جديد في سجل الشخصيات</h3>
              <button onClick={() => setShowCharModal(false)} className="text-zinc-400 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateChar} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 space-y-4 overflow-y-auto text-xs">
                <div>
                  <label className="block text-zinc-200 mb-1.5 font-semibold">اسم الشخصية *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: البطل راكان"
                    value={newChar.name}
                    onChange={(e) => setNewChar({ ...newChar, name: e.target.value })}
                    className="w-full bg-[#0B1320] border border-[#2B3B52] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#087C7B]"
                  />
                </div>
                <div>
                  <label className="block text-zinc-200 mb-1.5 font-semibold">اللقب / التوصيف السردي</label>
                  <input
                    type="text"
                    placeholder="مثال: حارس الأفق الذهبي"
                    value={newChar.title}
                    onChange={(e) => setNewChar({ ...newChar, title: e.target.value })}
                    className="w-full bg-[#0B1320] border border-[#2B3B52] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#087C7B]"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-zinc-200 mb-1.5 font-semibold">الانتماء السردي (Alignment)</label>
                    <select
                      value={newChar.alignment}
                      onChange={(e) => setNewChar({ ...newChar, alignment: e.target.value })}
                      className="w-full bg-[#0B1320] border border-[#2B3B52] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#087C7B]"
                    >
                      <option value="protagonist">بطل / نصير النور (Protagonist)</option>
                      <option value="antagonist">خصم / قوى الظلال (Antagonist)</option>
                      <option value="neutral">محايد / حكيم غامض (Neutral)</option>
                    </select>
                  </div>
                  <div>
                    <ImageUploadField
                      label="أفاتار البطل"
                      value={newChar.avatar_url}
                      onChange={(url) => setNewChar({ ...newChar, avatar_url: url })}
                      folder="characters"
                      previewAspect="square"
                    />
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-zinc-800 bg-[#162235] flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowCharModal(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-[#087C7B] hover:bg-[#066160] text-white text-xs font-semibold shadow-lg shadow-[#087C7B]/20"
                >
                  توثيق البطل
                </button>
              </div>
            </form>
          </div>
        </div>
        </ModalPortal>
      )}

      {/* ============================================================== */}
      {/* MODAL 4: CREATE WORLD */}
      {/* ============================================================== */}
      {showWorldModal && (
        <ModalPortal>
          <div className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-md overflow-y-auto p-4 sm:p-6 flex items-center justify-center">
            <div className="bg-[#141E2E] border border-zinc-700/80 rounded-2xl max-w-lg w-full shadow-[0_25px_80px_rgba(0,0,0,0.9)] border-[#087C7B]/40 flex flex-col max-h-[85vh] overflow-hidden my-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-[#162235] shrink-0">
              <h3 className="font-bold text-white text-base">تأسيس بعد كوني وعالم جديد</h3>
              <button onClick={() => setShowWorldModal(false)} className="text-zinc-400 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateWorld} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 space-y-4 overflow-y-auto text-xs">
                <div>
                  <label className="block text-zinc-200 mb-1.5 font-semibold">اسم العالم *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: عالم الأطلال العتيقة"
                    value={newWorld.name}
                    onChange={(e) => setNewWorld({ ...newWorld, name: e.target.value })}
                    className="w-full bg-[#0B1320] border border-[#2B3B52] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#087C7B]"
                  />
                </div>
                <div>
                  <label className="block text-zinc-200 mb-1.5 font-semibold">المعرف اللطيف (Slug) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ancient-ruins-realm"
                    value={newWorld.slug}
                    onChange={(e) => setNewWorld({ ...newWorld, slug: e.target.value })}
                    className="w-full bg-[#0B1320] border border-[#2B3B52] rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-[#087C7B]"
                  />
                </div>
                <div>
                  <label className="block text-zinc-200 mb-1.5 font-semibold">وصف العالم وتاريخه الكوني</label>
                  <textarea
                    rows={3}
                    placeholder="تاريخ نشأة هذا البعد الكوني وتفاصيل قواه..."
                    value={newWorld.description}
                    onChange={(e) => setNewWorld({ ...newWorld, description: e.target.value })}
                    className="w-full bg-[#0B1320] border border-[#2B3B52] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#087C7B]"
                  />
                </div>
              </div>
              <div className="px-6 py-4 border-t border-zinc-800 bg-[#162235] flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowWorldModal(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-[#087C7B] hover:bg-[#066160] text-white text-xs font-semibold shadow-lg shadow-[#087C7B]/20"
                >
                  تأسيس العالم
                </button>
              </div>
            </form>
          </div>
        </div>
        </ModalPortal>
      )}

      {/* ============================================================== */}
      {/* MODAL 5: CREATE IP RECORD */}
      {/* ============================================================== */}
      {showIpModal && (
        <ModalPortal>
          <div className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-md overflow-y-auto p-4 sm:p-6 flex items-center justify-center">
            <div className="bg-[#141E2E] border border-zinc-700/80 rounded-2xl max-w-lg w-full shadow-[0_25px_80px_rgba(0,0,0,0.9)] border-[#087C7B]/40 flex flex-col max-h-[85vh] overflow-hidden my-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-[#162235] shrink-0">
              <h3 className="font-bold text-white text-base">تسجيل عقد ملكية فكرية وترخيص</h3>
              <button onClick={() => setShowIpModal(false)} className="text-zinc-400 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateIp} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 space-y-4 overflow-y-auto text-xs">
                <div>
                  <label className="block text-zinc-200 mb-1.5 font-semibold">عنوان العمل / الملكية *</label>
                  <input
                    type="text"
                    required
                    placeholder="اسم العمل أو الملكية الفكرية"
                    value={newIp.title}
                    onChange={(e) => setNewIp({ ...newIp, title: e.target.value })}
                    className="w-full bg-[#0B1320] border border-[#2B3B52] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#087C7B]"
                  />
                </div>
                <div>
                  <label className="block text-zinc-200 mb-1.5 font-semibold">الجهة المالكة للحقوق *</label>
                  <input
                    type="text"
                    required
                    placeholder="مجموعة حكاياتي الإعلامية أو دار النشر"
                    value={newIp.rights_holder}
                    onChange={(e) => setNewIp({ ...newIp, rights_holder: e.target.value })}
                    className="w-full bg-[#0B1320] border border-[#2B3B52] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#087C7B]"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-zinc-200 mb-1.5 font-semibold">نوع الترخيص</label>
                    <select
                      value={newIp.license_type}
                      onChange={(e) => setNewIp({ ...newIp, license_type: e.target.value })}
                      className="w-full bg-[#0B1320] border border-[#2B3B52] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#087C7B]"
                    >
                      <option value="exclusive">حصري كامل (Exclusive)</option>
                      <option value="non_exclusive">غير حصري (Non-Exclusive)</option>
                      <option value="first_option">حق الأولوية (First Option)</option>
                      <option value="translation_only">حقوق الترجمة والنشر (Translation)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-zinc-200 mb-1.5 font-semibold">تاريخ انتهاء الترخيص</label>
                    <input
                      type="date"
                      value={newIp.valid_until}
                      onChange={(e) => setNewIp({ ...newIp, valid_until: e.target.value })}
                      className="w-full bg-[#0B1320] border border-[#2B3B52] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#087C7B]"
                    />
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-zinc-800 bg-[#162235] flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowIpModal(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-[#087C7B] hover:bg-[#066160] text-white text-xs font-semibold shadow-lg shadow-[#087C7B]/20"
                >
                  توثيق الترخيص
                </button>
              </div>
            </form>
          </div>
        </div>
        </ModalPortal>
      )}

      {/* ============================================================== */}
      {/* MODAL 6: CREATE EXPENSE */}
      {/* ============================================================== */}
      {showExpenseModal && (
        <ModalPortal>
          <div className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-md overflow-y-auto p-4 sm:p-6 flex items-center justify-center">
            <div className="bg-[#141E2E] border border-zinc-700/80 rounded-2xl max-w-lg w-full shadow-[0_25px_80px_rgba(0,0,0,0.9)] border-[#087C7B]/40 flex flex-col max-h-[85vh] overflow-hidden my-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-[#162235] shrink-0">
              <h3 className="font-bold text-white text-base">قيد مصروف تشغيلي / سلفة للمؤلفين</h3>
              <button onClick={() => setShowExpenseModal(false)} className="text-zinc-400 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateExpense} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 space-y-4 overflow-y-auto text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-zinc-200 mb-1.5 font-semibold">المبلغ *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="0.00"
                      value={newExpense.amount}
                      onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                      className="w-full bg-[#0B1320] border border-[#2B3B52] rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-[#087C7B]"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-200 mb-1.5 font-semibold">العملة</label>
                    <select
                      value={newExpense.currency}
                      onChange={(e) => setNewExpense({ ...newExpense, currency: e.target.value })}
                      className="w-full bg-[#0B1320] border border-[#2B3B52] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#087C7B]"
                    >
                      <option value="EGP">جنيه مصري (EGP)</option>
                      <option value="SAR">ريال سعودي (SAR)</option>
                      <option value="USD">دولار أمريكي (USD)</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-zinc-200 mb-1.5 font-semibold">فئة المصروف</label>
                  <select
                    value={newExpense.category}
                    onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                    className="w-full bg-[#0B1320] border border-[#2B3B52] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#087C7B]"
                  >
                    <option value="creator_advance">دفعة تعاقدية / سلفة مؤلف (Creator Advance)</option>
                    <option value="marketing">تسويق وحملات ترويجية (Marketing)</option>
                    <option value="infrastructure">خوادم وبنية تحتية (Cloud & Servers)</option>
                    <option value="legal_fees">أتعاب وتوثيقات قانونية (Legal)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-200 mb-1.5 font-semibold">بيان المصروف وتفاصيله *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. دفعة تعاقدية لكوميكس ملحمة الأفق الذهبي"
                    value={newExpense.description}
                    onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                    className="w-full bg-[#0B1320] border border-[#2B3B52] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#087C7B]"
                  />
                </div>
              </div>
              <div className="px-6 py-4 border-t border-zinc-800 bg-[#162235] flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowExpenseModal(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-[#087C7B] hover:bg-[#066160] text-white text-xs font-semibold shadow-lg shadow-[#087C7B]/20"
                >
                  قيد المصروف
                </button>
              </div>
            </form>
          </div>
        </div>
        </ModalPortal>
      )}

      {/* ============================================================== */}
      {/* MODAL 7: CREATE PRODUCT */}
      {/* ============================================================== */}
      {showProductModal && (
        <ModalPortal>
          <div className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-md overflow-y-auto p-4 sm:p-6 flex items-center justify-center">
            <div className="bg-[#141E2E] border border-zinc-700/80 rounded-2xl max-w-lg w-full shadow-[0_25px_80px_rgba(0,0,0,0.9)] border-[#087C7B]/40 flex flex-col max-h-[85vh] overflow-hidden my-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-[#162235] shrink-0">
              <h3 className="font-bold text-white text-base">إضافة منتج لمتجر حكاياتي الرسمي</h3>
              <button onClick={() => setShowProductModal(false)} className="text-zinc-400 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateProduct} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 space-y-4 overflow-y-auto text-xs">
                <div>
                  <label className="block text-zinc-200 mb-1.5 font-semibold">اسم المنتج *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: مجسم بطل الأفق الذهبي"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    className="w-full bg-[#0B1320] border border-[#2B3B52] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#087C7B]"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-zinc-200 mb-1.5 font-semibold">السعر (ج.م) *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="250.00"
                      value={newProduct.price_egp}
                      onChange={(e) => setNewProduct({ ...newProduct, price_egp: e.target.value })}
                      className="w-full bg-[#0B1320] border border-[#2B3B52] rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-[#087C7B]"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-200 mb-1.5 font-semibold">كمية المخزون المتاح *</label>
                    <input
                      type="number"
                      required
                      placeholder="50"
                      value={newProduct.stock_quantity}
                      onChange={(e) => setNewProduct({ ...newProduct, stock_quantity: e.target.value })}
                      className="w-full bg-[#0B1320] border border-[#2B3B52] rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-[#087C7B]"
                    />
                  </div>
                </div>
                <div>
                  <ImageUploadField
                    label="صورة المنتج"
                    value={newProduct.image_url}
                    onChange={(url) => setNewProduct({ ...newProduct, image_url: url })}
                    folder="products"
                    previewAspect="square"
                  />
                </div>
              </div>
              <div className="px-6 py-4 border-t border-zinc-800 bg-[#162235] flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-[#087C7B] hover:bg-[#066160] text-white text-xs font-semibold shadow-lg shadow-[#087C7B]/20"
                >
                  إدراج المنتج في المتجر
                </button>
              </div>
            </form>
          </div>
        </div>
        </ModalPortal>
      )}
    </div>
  );
}
