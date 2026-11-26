import React, { useState } from 'react';
import {
  Share2,
  Copy,
  Check,
  X,
  Send,
  MessageCircle,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import {
  WhatsAppIcon,
  TelegramIcon,
  FacebookIcon,
  XTwitterIcon,
} from '@/components/common/BrandIcons';
import { motion, AnimatePresence } from 'framer-motion';

export interface SocialShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  url?: string;
  imageUrl?: string;
  contentType?: 'novel' | 'comic' | 'character' | 'world' | 'article' | 'general';
  contentId?: string;
}

export function SocialShareModal({
  isOpen,
  onClose,
  title,
  description = '',
  url,
  imageUrl,
  contentType = 'general',
  contentId,
}: SocialShareModalProps) {
  const [copied, setCopied] = useState(false);
  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : 'https://hekayaty.com');
  const encodedUrl = encodeURIComponent(shareUrl);
  const shareText = `${title} — حكاياتي | عوالم خيالية لا تنتهي`;
  const encodedText = encodeURIComponent(shareText);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
      trackShareEvent('copy_link');
    } catch {
      // Fallback
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description || shareText,
          url: shareUrl,
        });
        trackShareEvent('native_share');
      } catch {
        // User cancelled or not supported
      }
    }
  };

  const trackShareEvent = (platform: string) => {
    try {
      fetch('/api/events/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform,
          content_type: contentType,
          content_id: contentId || shareUrl,
          url: shareUrl,
          timestamp: new Date().toISOString(),
        }),
      }).catch(() => {});
    } catch {
      // Non-blocking
    }
  };

  const platforms = [
    {
      name: 'واتساب',
      en: 'WhatsApp',
      icon: <WhatsAppIcon className="w-5 h-5 text-[#25D366]" />,
      bgColor: 'bg-[#25D366]/15 hover:bg-[#25D366]/25 border-[#25D366]/40 text-[#25D366]',
      href: `https://api.whatsapp.com/send?text=${encodedText}%0A${encodedUrl}`,
      key: 'whatsapp',
    },
    {
      name: 'تيليجرام',
      en: 'Telegram',
      icon: <TelegramIcon className="w-5 h-5 text-[#0088CC]" />,
      bgColor: 'bg-[#0088CC]/15 hover:bg-[#0088CC]/25 border-[#0088CC]/40 text-[#0088CC]',
      href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
      key: 'telegram',
    },
    {
      name: 'فيسبوك',
      en: 'Facebook',
      icon: <FacebookIcon className="w-5 h-5 text-[#1877F2]" />,
      bgColor: 'bg-[#1877F2]/15 hover:bg-[#1877F2]/25 border-[#1877F2]/40 text-[#1877F2]',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      key: 'facebook',
    },
    {
      name: 'منصة X',
      en: 'X (Twitter)',
      icon: <XTwitterIcon className="w-4 h-4 text-white" />,
      bgColor: 'bg-zinc-800/60 hover:bg-zinc-700/60 border-zinc-600 text-white',
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}&via=hekayatyn6`,
      key: 'x_twitter',
    },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md" dir="rtl">
      <div className="relative w-full max-w-md bg-[#111C2B] border border-[#C5A15B]/30 rounded-3xl shadow-2xl overflow-hidden p-6 text-right font-arabic">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 right-1/4 w-40 h-40 bg-[#087C7B]/20 rounded-full blur-[60px] pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#087C7B] to-[#C5A15B] flex items-center justify-center text-white shadow-md">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">مشاركة العمل الإبداعي</h3>
              <p className="text-[11px] text-zinc-400">انشر الرابط مع الأصدقاء والمجتمع الأدبي</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Social Card Preview */}
        <div className="mb-5 p-3 rounded-2xl bg-black/40 border border-white/10 overflow-hidden flex gap-3 items-center">
          {imageUrl && (
            <img
              src={imageUrl}
              alt=""
              className="w-16 h-20 object-cover rounded-xl border border-zinc-700 shrink-0"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          )}
          <div className="flex-1 min-w-0">
            <span className="text-[10px] text-[#C5A15B] font-bold block mb-1">HEKAYATY • حكاياتي</span>
            <h4 className="text-xs font-bold text-white truncate mb-1">{title}</h4>
            <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
              {description || 'اكتشف هذا العمل المميز على منصة حكاياتي للأكوان القصصية.'}
            </p>
          </div>
        </div>

        {/* Social Buttons Grid */}
        <div className="grid grid-cols-2 gap-2.5 mb-5">
          {platforms.map((p) => (
            <a
              key={p.key}
              href={p.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackShareEvent(p.key)}
              className={`flex items-center gap-2.5 p-3 rounded-2xl border ${p.bgColor} transition-all duration-200 font-semibold text-xs`}
            >
              <span className="shrink-0 flex items-center justify-center">{p.icon}</span>
              <span className="text-zinc-100">{p.name}</span>
            </a>
          ))}
        </div>

        {/* Native Mobile Share Button */}
        {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
          <button
            onClick={handleNativeShare}
            className="w-full mb-3 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#087C7B] to-[#119B98] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#087C7B]/20 hover:brightness-110 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>مشاركة عبر تطبيقات الهاتف (إنستغرام، تيك توك، إلخ)</span>
          </button>
        )}

        {/* Copy Link Input Bar */}
        <div className="relative flex items-center">
          <input
            type="text"
            readOnly
            value={shareUrl}
            className="w-full bg-black/50 border border-white/15 rounded-xl pl-24 pr-3.5 py-2.5 text-xs text-zinc-300 font-mono focus:outline-none select-all"
            dir="ltr"
          />
          <button
            type="button"
            onClick={handleCopyLink}
            className={`absolute left-1.5 top-1.5 bottom-1.5 px-3 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              copied
                ? 'bg-emerald-600 text-white'
                : 'bg-[#C5A15B] hover:bg-[#D4B26C] text-[#0E131F]'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>تم النسخ!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>نسخ الرابط</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
