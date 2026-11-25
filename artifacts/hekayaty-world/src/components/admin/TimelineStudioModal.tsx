import React, { useState, useEffect } from 'react';
import { ModalPortal } from './ModalPortal';
import { XCircle, Calendar, Plus, Clock, Globe, Sparkles } from 'lucide-react';
import { api } from '@/lib/api';

interface TimelineStudioProps {
  isOpen: boolean;
  onClose: () => void;
  toast: any;
  worlds: any[];
}

export function TimelineStudioModal({ isOpen, onClose, toast, worlds }: TimelineStudioProps) {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newEvent, setNewEvent] = useState({
    title_ar: '',
    title_en: '',
    year: 1420,
    era_ar: 'عصر الفجر الكوني',
    description_ar: '',
    world_id: '',
  });

  const loadTimeline = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminTimeline();
      setEvents(res || []);
    } catch {
      toast({ title: 'تعذر تحميل الخط الزمني', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadTimeline();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.title_ar) {
      toast({ title: 'يرجى إدخال عنوان الحدث التاريخي', variant: 'destructive' });
      return;
    }
    setIsSubmitting(true);
    try {
      await api.createAdminTimeline({
        ...newEvent,
        year: parseInt(String(newEvent.year)) || 1400,
        world_id: newEvent.world_id || null,
      });
      toast({ title: '✅ تم توثيق الحدث التاريخي في الخط الزمني الكوني' });
      setNewEvent({
        title_ar: '',
        title_en: '',
        year: 1420,
        era_ar: 'عصر الفجر الكوني',
        description_ar: '',
        world_id: '',
      });
      loadTimeline();
    } catch (err: any) {
      toast({ title: 'فشل حفظ الحدث', description: err.message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto font-arabic" dir="rtl">
        <div className="bg-[#0F172A] border border-[#2E3C51] rounded-3xl max-w-4xl w-full shadow-[0_25px_80px_rgba(0,0,0,0.9)] border-[#087C7B]/40 flex flex-col max-h-[90vh] overflow-hidden my-auto">
        {/* Header */}
        <div className="px-6 py-4 bg-[#162238] border-b border-[#2E3C51] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#087C7B] to-[#C5A15B] flex items-center justify-center text-white">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">استوديو الخط الزمني والأحداث الكونية</h3>
              <p className="text-xs text-zinc-400">توثيق الحقب التاريخية والحروب الكبرى والأحداث المحورية في تاريخ عوالم حكاياتي</p>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white p-1 rounded-lg">
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Create Form */}
          <form onSubmit={handleCreateEvent} className="p-4 rounded-2xl bg-[#131C2E] border border-[#233147] space-y-4">
            <div className="text-xs font-bold text-[#C5A15B] flex items-center gap-1.5">
              <Plus className="w-4 h-4" />
              <span>توثيق حدث تاريخي جديد</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-zinc-300 mb-1">عنوان الحدث (بالعربية) *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: معركة الأفق العظيم وانفتاح البوابات"
                  value={newEvent.title_ar}
                  onChange={(e) => setNewEvent({ ...newEvent, title_ar: e.target.value })}
                  className="w-full bg-[#152033] border border-[#2E3C51] focus:border-[#087C7B] rounded-xl px-3 py-2 text-white text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-300 mb-1">السنة الكونية / التاريخ</label>
                <input
                  type="number"
                  required
                  value={newEvent.year}
                  onChange={(e) => setNewEvent({ ...newEvent, year: parseInt(e.target.value) || 0 })}
                  className="w-full bg-[#152033] border border-[#2E3C51] focus:border-[#087C7B] rounded-xl px-3 py-2 text-white font-mono text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-300 mb-1">الحقبة الزمنية (Era)</label>
                <select
                  value={newEvent.era_ar}
                  onChange={(e) => setNewEvent({ ...newEvent, era_ar: e.target.value })}
                  className="w-full bg-[#152033] border border-[#2E3C51] focus:border-[#087C7B] rounded-xl px-3 py-2 text-white text-xs outline-none"
                >
                  <option value="عصر الفجر الكوني">عصر الفجر الكوني (Primordial Dawn)</option>
                  <option value="عصر ازدهار العوالم">عصر ازدهار العوالم (Age of Expansion)</option>
                  <option value="عصر انكسار التوازن">عصر انكسار التوازن (The Great Fracture)</option>
                  <option value="العصر الحديث للأبطال">العصر الحديث للأبطال (Modern Heroic Era)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-zinc-300 mb-1">العالم الكوني المرتبط</label>
                <select
                  value={newEvent.world_id}
                  onChange={(e) => setNewEvent({ ...newEvent, world_id: e.target.value })}
                  className="w-full bg-[#152033] border border-[#2E3C51] focus:border-[#087C7B] rounded-xl px-3 py-2 text-white text-xs outline-none"
                >
                  <option value="">حدث متعدد الأبعاد (Multiversal)</option>
                  {worlds.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-300 mb-1">تفاصيل الحدث ونتائجه السردية</label>
                <input
                  type="text"
                  placeholder="وصف مختصر لما وقع وتأثيره على الأبطال..."
                  value={newEvent.description_ar}
                  onChange={(e) => setNewEvent({ ...newEvent, description_ar: e.target.value })}
                  className="w-full bg-[#152033] border border-[#2E3C51] focus:border-[#087C7B] rounded-xl px-3 py-2 text-white text-xs outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-[#087C7B] hover:bg-[#066160] text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'جاري الحفظ...' : 'توثيق في الخط الزمني'}</span>
              </button>
            </div>
          </form>

          {/* Timeline Events List */}
          <div>
            <h4 className="text-xs font-bold text-zinc-300 mb-3 flex items-center justify-between">
              <span>الأحداث الموثقة في السجل الزمني:</span>
              <span className="text-zinc-500 font-mono text-[11px]">{events.length} حدث كوني</span>
            </h4>

            {loading ? (
              <div className="text-center py-12 text-zinc-500 text-xs">جاري تحميل الخط الزمني...</div>
            ) : events.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 text-xs bg-zinc-900/30 rounded-2xl border border-zinc-800">
                لا توجد أحداث زمنية مسجلة بعد. استخدم النموذج أعلاه لتوثيق تاريخ الأكوان.
              </div>
            ) : (
              <div className="space-y-3">
                {events.map((ev) => (
                  <div
                    key={ev.id}
                    className="p-4 rounded-2xl bg-[#152033] border border-[#233147] flex items-center justify-between gap-4 hover:border-[#087C7B]/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-[#087C7B]/15 border border-[#087C7B]/30 flex flex-col items-center justify-center text-[#087C7B] shrink-0 font-mono">
                        <span className="text-[10px] text-zinc-400">سنة</span>
                        <span className="font-bold text-sm text-[#C5A15B]">{ev.year}</span>
                      </div>
                      <div>
                        <div className="font-bold text-white text-sm">{ev.title_ar}</div>
                        <div className="text-[11px] text-[#087C7B] font-semibold mt-0.5">{ev.era_ar}</div>
                        <p className="text-xs text-zinc-400 mt-1 line-clamp-1">{ev.description_ar}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#162238] border-t border-[#2E3C51] flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
    </ModalPortal>
  );
}
