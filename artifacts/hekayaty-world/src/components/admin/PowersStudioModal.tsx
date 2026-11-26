import React, { useState, useEffect } from 'react';
import { ModalPortal } from './ModalPortal';
import { XCircle, Zap, Plus, Sparkles, Shield, AlertTriangle } from 'lucide-react';
import { api } from '@/lib/api';

interface PowersStudioProps {
  isOpen: boolean;
  onClose: () => void;
  toast: any;
}

export function PowersStudioModal({ isOpen, onClose, toast }: PowersStudioProps) {
  const [powers, setPowers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form for new power
  const [newPower, setNewPower] = useState({
    name_ar: '',
    name_en: '',
    category_ar: 'طاقة خارقة',
    level: 80,
    icon: '⚡',
    description_ar: '',
    weaknesses_ar: '',
  });

  const loadPowers = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminPowers();
      setPowers(res || []);
    } catch {
      toast({ title: 'تعذر تحميل مكتبة القدرات', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadPowers();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCreatePower = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPower.name_ar) {
      toast({ title: 'يرجى إدخال اسم القدرة بالعربية', variant: 'destructive' });
      return;
    }
    setIsSubmitting(true);
    try {
      await api.createAdminPower({
        ...newPower,
        weaknesses_ar: newPower.weaknesses_ar
          ? newPower.weaknesses_ar.split(',').map((w) => w.trim())
          : [],
      });
      toast({ title: '✅ تمت إضافة القدرة الخارقة إلى المكتبة الكونية' });
      setNewPower({
        name_ar: '',
        name_en: '',
        category_ar: 'طاقة خارقة',
        level: 80,
        icon: '⚡',
        description_ar: '',
        weaknesses_ar: '',
      });
      loadPowers();
    } catch (err: any) {
      toast({ title: 'فشل حفظ القدرة', description: err.message, variant: 'destructive' });
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
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">مكتبة القدرات والخوارق الكونية</h3>
              <p className="text-xs text-zinc-400">سجل القدرات الموحد لربطه بأبطال وشخصيات حكاياتي</p>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white p-1 rounded-lg">
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Create Power Form */}
          <form onSubmit={handleCreatePower} className="p-4 rounded-2xl bg-[#131C2E] border border-[#233147] space-y-4">
            <div className="text-xs font-bold text-[#C5A15B] flex items-center gap-1.5">
              <Plus className="w-4 h-4" />
              <span>تسجيل قدرة خارقة جديدة</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-zinc-300 mb-1">اسم القدرة (بالعربية) *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: التحكم بالجاذبية الفلكية"
                  value={newPower.name_ar}
                  onChange={(e) => setNewPower({ ...newPower, name_ar: e.target.value })}
                  className="w-full bg-[#152033] border border-[#2E3C51] focus:border-[#087C7B] rounded-xl px-3 py-2 text-white text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-300 mb-1">تصنيف الطاقة</label>
                <select
                  value={newPower.category_ar}
                  onChange={(e) => setNewPower({ ...newPower, category_ar: e.target.value })}
                  className="w-full bg-[#152033] border border-[#2E3C51] focus:border-[#087C7B] rounded-xl px-3 py-2 text-white text-xs outline-none"
                >
                  <option value="طاقة خارقة">طاقة خارقة (Cosmic)</option>
                  <option value="عنصري وطبيعي">عنصري وطبيعي (Elemental)</option>
                  <option value="ذهني ونفسي">ذهني ونفسي (Psionic)</option>
                  <option value="فيزيائي وجسدي">فيزيائي وجسدي (Physical)</option>
                  <option value="سحر وأساطير">سحر وأساطير (Mystic)</option>
                  <option value="تكنولوجي متقدم">تكنولوجي متقدم (Cybernetic)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-300 mb-1">
                  مستوى القوة والتدمير ({newPower.level}/100)
                </label>
                <input
                  type="range"
                  min={10}
                  max={100}
                  value={newPower.level}
                  onChange={(e) => setNewPower({ ...newPower, level: parseInt(e.target.value) || 80 })}
                  className="w-full accent-[#087C7B] mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-zinc-300 mb-1">الوصف والتأثير القتالي</label>
                <input
                  type="text"
                  placeholder="تفاصيل التفعيل والأضرار..."
                  value={newPower.description_ar}
                  onChange={(e) => setNewPower({ ...newPower, description_ar: e.target.value })}
                  className="w-full bg-[#152033] border border-[#2E3C51] focus:border-[#087C7B] rounded-xl px-3 py-2 text-white text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-300 mb-1">نقاط الضعف الموازنة (مفصولة بفواصل)</label>
                <input
                  type="text"
                  placeholder="مثال: استنزاف الطاقة الحيوية، التعرض للضوء الساطع"
                  value={newPower.weaknesses_ar}
                  onChange={(e) => setNewPower({ ...newPower, weaknesses_ar: e.target.value })}
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
                <span>{isSubmitting ? 'جاري الحفظ...' : 'حفظ القدرة في الأرشيف'}</span>
              </button>
            </div>
          </form>

          {/* Powers Catalog Grid */}
          <div>
            <h4 className="text-xs font-bold text-zinc-300 mb-3 flex items-center justify-between">
              <span>القدرات المسجلة حالياً في المنظومة:</span>
              <span className="text-zinc-500 font-mono text-[11px]">{powers.length} قدرة موثقة</span>
            </h4>

            {loading ? (
              <div className="text-center py-12 text-zinc-500 text-xs">جاري تحميل القدرات...</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {powers.map((p, idx) => (
                  <div
                    key={p.id || idx}
                    className="p-3.5 rounded-2xl bg-[#152033] border border-[#233147] space-y-2 hover:border-[#087C7B]/50 transition-colors shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{p.icon || '⚡'}</span>
                        <div className="font-bold text-white text-xs">{p.name_ar}</div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-[#087C7B]/20 text-teal-300 font-mono text-[10px] font-bold">
                        {p.level || 75}/100
                      </span>
                    </div>
                    <div className="text-[10px] text-[#C5A15B] font-semibold">{p.category_ar}</div>
                    <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                      {p.description_ar}
                    </p>
                    {p.weaknesses_ar?.length > 0 && (
                      <div className="flex items-center gap-1 text-[10px] text-red-400 pt-1 border-t border-zinc-800">
                        <AlertTriangle className="w-3 h-3 shrink-0" />
                        <span className="truncate">نقطة ضعف: {p.weaknesses_ar.join('، ')}</span>
                      </div>
                    )}
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
