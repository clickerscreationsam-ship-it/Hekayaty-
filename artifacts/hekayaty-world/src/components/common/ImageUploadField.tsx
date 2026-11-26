import React, { useRef, useState } from 'react';
import { Upload, X, ImageIcon, Loader2, Link2 } from 'lucide-react';
import { api } from '@/lib/api';

export interface ImageUploadFieldProps {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
  placeholder?: string;
  className?: string;
  previewAspect?: 'square' | 'cover' | 'portrait';
}

export function ImageUploadField({
  value,
  onChange,
  folder = 'hekayaty',
  label,
  placeholder = 'الصق رابط صورة أو ارفع من جهازك',
  className = '',
  previewAspect = 'cover',
}: ImageUploadFieldProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [urlMode, setUrlMode] = useState(false);
  const [urlInput, setUrlInput] = useState(value || '');

  const aspectMap = {
    square: 'aspect-square',
    cover: 'aspect-video',
    portrait: 'aspect-[2/3]',
  };

  const handleFile = async (file: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('الملف المحدد ليس صورة، يُرجى اختيار ملف صورة بامتداد JPG أو PNG أو WEBP.');
      return;
    }

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        const res = await api.uploadMedia(base64, folder);
        if (res?.url) {
          onChange(res.url);
          setUrlInput(res.url);
        } else {
          alert('تعذر رفع الصورة. يُرجى المحاولة مرة أخرى.');
        }
        setUploading(false);
      };
      reader.onerror = () => {
        alert('تعذر قراءة الملف. يُرجى المحاولة مرة أخرى.');
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch {
      alert('حدث خطأ أثناء الرفع. يُرجى المحاولة مرة أخرى.');
      setUploading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) handleFile(files[0]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleUrlConfirm = () => {
    onChange(urlInput.trim());
    setUrlMode(false);
  };

  const handleClear = () => {
    onChange('');
    setUrlInput('');
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`} dir="rtl">
      {label && (
        <label className="text-xs font-bold text-zinc-300">{label}</label>
      )}

      {/* Preview area */}
      <div
        className={`relative w-full ${aspectMap[previewAspect]} rounded-2xl border-2 ${
          dragOver
            ? 'border-[#087C7B] bg-[#087C7B]/10'
            : value
            ? 'border-[#087C7B]/40 bg-black/20'
            : 'border-dashed border-zinc-600 bg-[#0B1320]/60'
        } overflow-hidden transition-all duration-200 group`}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
      >
        {value ? (
          <>
            <img
              src={value}
              alt="معاينة الصورة"
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="px-3 py-1.5 rounded-xl bg-[#087C7B] text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-[#066160] transition-colors"
                disabled={uploading}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>تغيير</span>
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="px-3 py-1.5 rounded-xl bg-red-600/80 text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-red-600 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                <span>حذف</span>
              </button>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3 p-4 cursor-pointer" onClick={() => fileRef.current?.click()}>
            {uploading ? (
              <>
                <Loader2 className="w-8 h-8 text-[#087C7B] animate-spin" />
                <span className="text-xs text-zinc-400">جاري الرفع إلى السحابة...</span>
              </>
            ) : dragOver ? (
              <>
                <Upload className="w-8 h-8 text-[#087C7B]" />
                <span className="text-xs text-[#087C7B] font-semibold">أفلت الصورة هنا</span>
              </>
            ) : (
              <>
                <div className="w-14 h-14 rounded-2xl bg-[#087C7B]/15 border border-[#087C7B]/30 flex items-center justify-center">
                  <ImageIcon className="w-7 h-7 text-[#087C7B]" />
                </div>
                <div className="text-center">
                  <p className="text-xs font-semibold text-zinc-300">اسحب وأفلت الصورة هنا</p>
                  <p className="text-[11px] text-zinc-500 mt-0.5">أو انقر لاختيار ملف من جهازك</p>
                  <p className="text-[10px] text-zinc-600 mt-1">JPG • PNG • WEBP • GIF (حتى 10MB)</p>
                </div>
              </>
            )}
          </div>
        )}

        {/* Upload spinner overlay when uploading with existing image */}
        {uploading && value && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-[#C5A15B] animate-spin" />
          </div>
        )}
      </div>

      {/* Action buttons row */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-[#087C7B]/15 hover:bg-[#087C7B]/30 border border-[#087C7B]/40 text-[#087C7B] text-xs font-semibold transition-all disabled:opacity-50"
        >
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          <span>{uploading ? 'جاري الرفع...' : 'رفع من الجهاز'}</span>
        </button>

        <button
          type="button"
          onClick={() => setUrlMode((v) => !v)}
          className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 text-zinc-300 text-xs font-semibold transition-all"
          title="إدخال رابط URL مباشرة"
        >
          <Link2 className="w-3.5 h-3.5" />
          <span>URL</span>
        </button>
      </div>

      {/* URL input (expandable) */}
      {urlMode && (
        <div className="flex gap-2 items-center animate-in fade-in slide-in-from-top-2 duration-200">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleUrlConfirm()}
            placeholder="https://res.cloudinary.com/..."
            dir="ltr"
            className="flex-1 bg-[#0B1320] border border-[#2B3B52] rounded-xl px-3 py-2 text-white text-xs font-mono placeholder-zinc-600 focus:outline-none focus:border-[#087C7B]"
          />
          <button
            type="button"
            onClick={handleUrlConfirm}
            className="px-3 py-2 rounded-xl bg-[#087C7B] text-white text-xs font-semibold hover:bg-[#066160] transition-colors"
          >
            تطبيق
          </button>
          <button
            type="button"
            onClick={() => setUrlMode(false)}
            className="px-3 py-2 rounded-xl bg-zinc-800 text-zinc-400 text-xs hover:bg-zinc-700 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleInputChange}
      />
    </div>
  );
}
