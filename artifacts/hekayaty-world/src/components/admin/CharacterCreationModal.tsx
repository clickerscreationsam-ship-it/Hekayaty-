import React, { useState, useEffect } from 'react';
import { ModalPortal } from './ModalPortal';
import {
  XCircle,
  Shield,
  Zap,
  Sparkles,
  Users,
  CheckCircle2,
  Sword,
  Activity,
  Brain,
  Wind,
} from 'lucide-react';
import { api } from '@/lib/api';
import { ImageUploadField } from '@/components/common/ImageUploadField';

interface CharacterCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  toast: any;
  worlds: any[];
  powersLibrary: any[];
  characterToEdit?: any;
}

export function CharacterCreationModal({
  isOpen,
  onClose,
  onSuccess,
  toast,
  worlds,
  powersLibrary,
  characterToEdit,
}: CharacterCreationModalProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [charData, setCharData] = useState({
    name: '',
    name_en: '',
    title: '',
    world_id: '',
    alignment: 'protagonist' as 'protagonist' | 'antagonist' | 'neutral',
    role: 'hero' as 'hero' | 'villain' | 'antihero' | 'neutral',
    avatar_url: '',
    description: '',
    origin: '',
    powerRating: 85,
    stats: {
      strength: 80,
      speed: 75,
      durability: 85,
      intelligence: 70,
      magic: 90,
      combat: 85,
    },
    powers: ['تحكم بالطاقة السحرية', 'طيران أسرع من الصوت'] as string[],
    weaknesses: ['المعادن المعتمة', 'الاستنزاف الروحي'] as string[],
  });

  useEffect(() => {
    if (characterToEdit) {
      setCharData({
        name: characterToEdit.name || characterToEdit.name_ar || characterToEdit.nameAr || '',
        name_en: characterToEdit.name_en || characterToEdit.nameEn || '',
        title: characterToEdit.title || characterToEdit.alias_ar || characterToEdit.aliasAr || characterToEdit.alias || '',
        world_id: characterToEdit.world_id || characterToEdit.worldId || '',
        alignment: (characterToEdit.alignment === 'hero' ? 'protagonist' : characterToEdit.alignment === 'villain' ? 'antagonist' : characterToEdit.alignment || 'protagonist') as any,
        role: (characterToEdit.role || characterToEdit.alignment || 'hero') as any,
        avatar_url: characterToEdit.avatar_url || characterToEdit.image_url || characterToEdit.imageUrl || characterToEdit.image || '',
        description: characterToEdit.description || characterToEdit.bio_ar || characterToEdit.bioAr || '',
        origin: characterToEdit.origin || characterToEdit.origin_ar || characterToEdit.originAr || '',
        powerRating: characterToEdit.powerRating || characterToEdit.stats?.powerRating || 85,
        stats: characterToEdit.stats || {
          strength: 80,
          speed: 75,
          durability: 85,
          intelligence: 70,
          magic: 90,
          combat: 85,
        },
        powers: characterToEdit.powers || characterToEdit.powers_ar || ['تحكم بالطاقة السحرية', 'طيران أسرع من الصوت'],
        weaknesses: characterToEdit.weaknesses || characterToEdit.weaknesses_ar || ['المعادن المعتمة', 'الاستنزاف الروحي'],
      });
    } else {
      setCharData({
        name: '',
        name_en: '',
        title: '',
        world_id: '',
        alignment: 'protagonist',
        role: 'hero',
        avatar_url: '',
        description: '',
        origin: '',
        powerRating: 85,
        stats: {
          strength: 80,
          speed: 75,
          durability: 85,
          intelligence: 70,
          magic: 90,
          combat: 85,
        },
        powers: ['تحكم بالطاقة السحرية', 'طيران أسرع من الصوت'],
        weaknesses: ['المعادن المعتمة', 'الاستنزاف الروحي'],
      });
    }
  }, [characterToEdit, isOpen]);

  if (!isOpen) return null;

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
      const res = await api.uploadMedia(base64, 'characters');
      if (res && res.url) {
        setCharData((prev) => ({ ...prev, avatar_url: res.url }));
        toast({ title: '✅ تم رفع صورة البطل إلى Cloudinary بنجاح' });
      } else {
        toast({ title: 'فشل الرفع', description: 'تعذر رفع الصورة السحابية', variant: 'destructive' });
      }
    } catch (err: any) {
      toast({ title: 'خطأ في الرفع', description: err.message, variant: 'destructive' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleStatChange = (key: keyof typeof charData.stats, val: number) => {
    setCharData((prev) => {
      const newStats = { ...prev.stats, [key]: val };
      // Auto-compute average powerRating from stats
      const avg = Math.round(
        (newStats.strength +
          newStats.speed +
          newStats.durability +
          newStats.intelligence +
          newStats.magic +
          newStats.combat) /
          6
      );
      return { ...prev, stats: newStats, powerRating: avg };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!charData.name) {
      toast({ title: 'يرجى إدخال اسم الشخصية', variant: 'destructive' });
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        name: charData.name,
        nameAr: charData.name,
        name_ar: charData.name,
        name_en: charData.name_en,
        nameEn: charData.name_en,
        title: charData.title,
        aliasAr: charData.title,
        alias_ar: charData.title,
        world_id: charData.world_id && charData.world_id.trim() ? charData.world_id.trim() : null,
        alignment: charData.alignment === 'protagonist' ? 'hero' : charData.alignment === 'antagonist' ? 'villain' : (charData.alignment || 'hero'),
        role: charData.role,
        avatar_url: charData.avatar_url,
        imageUrl: charData.avatar_url,
        image_url: charData.avatar_url,
        description: charData.description,
        bioAr: charData.description,
        bio_ar: charData.description,
        origin: charData.origin,
        originAr: charData.origin,
        origin_ar: charData.origin,
        powerRating: charData.powerRating,
        stats: {
          ...charData.stats,
          powerRating: charData.powerRating,
        },
        powers: charData.powers,
        powersAr: charData.powers,
        powers_ar: charData.powers,
        weaknesses: charData.weaknesses,
        weaknessesAr: charData.weaknesses,
        weaknesses_ar: charData.weaknesses,
      };

      if (characterToEdit && characterToEdit.id) {
        await api.updateAdminCharacter(characterToEdit.id, payload);
        toast({ title: '🎉 تم تحديث بيانات البطل بنجاح في سجل الأبطال!' });
      } else {
        await api.createAdminCharacter(payload);
        toast({ title: '🎉 تم توثيق البطل/الشخصية بنجاح في سجل الأبطال!' });
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      toast({ title: 'فشل حفظ الشخصية', description: err.message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto font-arabic" dir="rtl">
        <div className="bg-[#0F172A] border border-[#2E3C51] rounded-3xl max-w-5xl w-full shadow-[0_25px_80px_rgba(0,0,0,0.9)] border-[#087C7B]/40 flex flex-col max-h-[90vh] overflow-hidden my-auto">
        {/* Header */}
        <div className="px-6 py-4 bg-[#162238] border-b border-[#2E3C51] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#087C7B] to-[#C5A15B] flex items-center justify-center text-white">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">
                {characterToEdit ? 'تعديل بيانات البطل والشخصية الخارقة' : 'استوديو توثيق الأبطال والشخصيات الخارقة'}
              </h3>
              <p className="text-xs text-zinc-400">
                {characterToEdit
                  ? `تعديل بطاقة وسجلات ${characterToEdit.name || 'البطل'} وتحديث مؤشرات القوة والقدرات`
                  : 'إدراج بطل أو شرير، وتعيين مؤشرات القوة (Power Rating 0-100) والقدرات'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white p-1 rounded-lg">
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        {/* 2-Column Responsive Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs text-zinc-200">
          {/* Left Column: Form Controls (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Role & Alignment Selector */}
            <div>
              <label className="block text-[11px] font-bold text-zinc-300 mb-1.5">التصنيف السردي (Hero vs Villain) *</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { role: 'hero', align: 'protagonist', label: 'بطل خارق (Hero)', color: 'text-teal-400 border-[#087C7B]' },
                  { role: 'villain', align: 'antagonist', label: 'شرير خارق (Villain)', color: 'text-red-400 border-red-500' },
                  { role: 'antihero', align: 'neutral', label: 'بطل غامض (Antihero)', color: 'text-purple-400 border-purple-500' },
                ].map((item) => (
                  <button
                    key={item.role}
                    type="button"
                    onClick={() => setCharData({ ...charData, role: item.role as any, alignment: item.align as any })}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      charData.role === item.role
                        ? `bg-zinc-800 ${item.color} font-bold shadow-md`
                        : 'bg-[#152033] border-[#2E3C51] text-zinc-400 hover:border-zinc-500'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Names */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-zinc-300 mb-1">اسم الشخصية *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: البطل راكان"
                  value={charData.name}
                  onChange={(e) => setCharData({ ...charData, name: e.target.value })}
                  className="w-full bg-[#152033] border border-[#2E3C51] focus:border-[#087C7B] rounded-xl px-3.5 py-2 text-white outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-zinc-300 mb-1">الاسم بالإنجليزية (Name in English)</label>
                <input
                  type="text"
                  placeholder="e.g. Rakan the Sunbearer"
                  value={charData.name_en}
                  onChange={(e) => setCharData({ ...charData, name_en: e.target.value })}
                  className="w-full bg-[#152033] border border-[#2E3C51] focus:border-[#087C7B] rounded-xl px-3.5 py-2 text-white outline-none font-sans"
                />
              </div>
            </div>

            {/* Title & World */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-zinc-300 mb-1">اللقب / التوصيف السردي</label>
                <input
                  type="text"
                  placeholder="مثال: حارس شمس الأفق الذهبي"
                  value={charData.title}
                  onChange={(e) => setCharData({ ...charData, title: e.target.value })}
                  className="w-full bg-[#152033] border border-[#2E3C51] focus:border-[#087C7B] rounded-xl px-3.5 py-2 text-white outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-zinc-300 mb-1">العالم الكوني المرتبط</label>
                <select
                  value={charData.world_id}
                  onChange={(e) => setCharData({ ...charData, world_id: e.target.value })}
                  className="w-full bg-[#152033] border border-[#2E3C51] focus:border-[#087C7B] rounded-xl px-3.5 py-2 text-white outline-none"
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

            {/* Avatar Upload */}
            <div className="p-3.5 rounded-2xl bg-[#131C2E] border border-[#233147] space-y-2">
              <ImageUploadField
                label="أفاتار البطل"
                value={charData.avatar_url}
                onChange={(url) => setCharData({ ...charData, avatar_url: url })}
                folder="characters"
                previewAspect="square"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-[11px] font-bold text-zinc-300 mb-1">السيرة والوصف السردي</label>
              <textarea
                rows={3}
                placeholder="تاريخ نشأة الشخصية ودورها في الصراع الكوني..."
                value={charData.description}
                onChange={(e) => setCharData({ ...charData, description: e.target.value })}
                className="w-full bg-[#152033] border border-[#2E3C51] focus:border-[#087C7B] rounded-xl px-3.5 py-2 text-white outline-none leading-relaxed"
              />
            </div>

            {/* 6 Attributes Sliders */}
            <div className="p-4 rounded-2xl bg-[#131C2E] border border-[#233147] space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-[#C5A15B] flex items-center gap-1.5">
                  <Activity className="w-4 h-4" />
                  <span>توزيع مؤشرات القدرات القتالية (0 - 100)</span>
                </span>
                <span className="font-mono text-xs font-bold text-teal-400">
                  المعدل الكلي: {charData.powerRating}/100
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: 'strength', label: 'القوة الجسدية', icon: '💪' },
                  { key: 'speed', label: 'السرعة والمناورة', icon: '⚡' },
                  { key: 'durability', label: 'الصلابة والتحمل', icon: '🛡️' },
                  { key: 'intelligence', label: 'الذكاء والتكتيك', icon: '🧠' },
                  { key: 'magic', label: 'السحر والطاقة', icon: '✨' },
                  { key: 'combat', label: 'مهارة القتال', icon: '⚔️' },
                ].map((stat) => (
                  <div key={stat.key} className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-zinc-400">
                        {stat.icon} {stat.label}
                      </span>
                      <span className="font-mono font-bold text-white">
                        {(charData.stats as any)[stat.key]}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={100}
                      value={(charData.stats as any)[stat.key]}
                      onChange={(e) =>
                        handleStatChange(stat.key as any, parseInt(e.target.value) || 50)
                      }
                      className="w-full accent-[#087C7B]"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Live Character Card Preview (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="text-xs font-bold text-[#C5A15B] flex items-center gap-1.5 mb-1">
              <Sparkles className="w-4 h-4" />
              <span>المعاينة الحية لبطاقة البطل (Live Card Preview)</span>
            </div>

            {/* Cinematic Character Card */}
            <div className="rounded-3xl overflow-hidden border border-[#C5A15B]/30 bg-gradient-to-b from-[#18253B] to-[#0E1626] shadow-2xl p-4 space-y-4 relative">
              {/* Power Badge */}
              <div className="absolute top-6 left-6 z-10 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-[#C5A15B]/50 flex items-center gap-1.5">
                <span className="text-amber-400">⚡</span>
                <span className="font-mono font-bold text-white text-xs">{charData.powerRating}</span>
                <span className="text-[10px] text-zinc-400">/ 100</span>
              </div>

              {/* Avatar Portrait */}
              <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-700">
                {charData.avatar_url ? (
                  <img
                    src={charData.avatar_url}
                    alt={charData.name}
                    className="w-full h-full object-cover object-top"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-zinc-600 gap-2">
                    <Users className="w-12 h-12" />
                    <span className="text-[11px]">ارفع صورة للبطل</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0E1626] via-transparent to-transparent opacity-90" />

                <div className="absolute bottom-3 right-3 left-3 flex justify-between items-end">
                  <div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        charData.role === 'hero'
                          ? 'bg-[#087C7B] text-white'
                          : charData.role === 'villain'
                          ? 'bg-red-500 text-white'
                          : 'bg-purple-500 text-white'
                      }`}
                    >
                      {charData.role === 'hero' ? 'بطل' : charData.role === 'villain' ? 'شرير' : 'غامض'}
                    </span>
                    <h4 className="font-bold text-white text-lg mt-1">{charData.name || 'اسم البطل'}</h4>
                    <p className="text-xs text-[#C5A15B] font-semibold">{charData.title || 'اللقب السردي'}</p>
                  </div>
                </div>
              </div>

              {/* Stats Bar Mini Breakdown */}
              <div className="space-y-1.5 p-3 rounded-2xl bg-[#111A2C] border border-[#233147]">
                <div className="flex justify-between text-[11px] font-semibold">
                  <span className="text-zinc-400">مؤشر القوة التقديري (Power Meter)</span>
                  <span className="text-teal-400 font-mono font-bold">{charData.powerRating}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-l from-[#087C7B] to-[#C5A15B] rounded-full transition-all duration-300"
                    style={{ width: `${charData.powerRating}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Modal Submit Actions */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#087C7B] to-[#0A9695] hover:brightness-110 text-white text-xs font-bold shadow-lg shadow-[#087C7B]/25 flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>
                  {isSubmitting
                    ? characterToEdit
                      ? 'جاري حفظ التعديلات...'
                      : 'جاري التوثيق...'
                    : characterToEdit
                    ? 'حفظ تعديلات البطل'
                    : 'توثيق البطل في المنظومة'}
                </span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
    </ModalPortal>
  );
}
