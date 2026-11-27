import React, { useState, useEffect } from 'react';
import { Eye, Heart, Bookmark, Star, BookOpen } from 'lucide-react';
import { api } from '@/lib/api';

interface EngagementStatsProps {
  contentType: 'novel' | 'story' | 'comic' | 'series' | 'episode' | 'chapter';
  contentId: string;
  initialViews?: number;
  initialLikes?: number;
  initialFollowers?: number;
  rating?: number;
  chaptersCount?: number;
  className?: string;
  variant?: 'compact' | 'detailed' | 'minimal';
}

function formatNumber(num: number): string {
  if (!num || num <= 0) return '0';
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toLocaleString('ar-EG');
}

export function EngagementStats({
  contentType,
  contentId,
  initialViews = 0,
  initialLikes = 0,
  initialFollowers = 0,
  rating,
  chaptersCount,
  className = '',
  variant = 'detailed',
}: EngagementStatsProps) {
  const [stats, setStats] = useState({
    views: initialViews,
    likes: initialLikes,
    followers: initialFollowers,
  });

  useEffect(() => {
    let mounted = true;
    api.getEngagementStats(contentType, contentId).then((res) => {
      if (mounted) {
        setStats({
          views: res.views || initialViews,
          likes: res.likes || initialLikes,
          followers: res.followers || initialFollowers,
        });
      }
    }).catch(() => {});

    return () => {
      mounted = false;
    };
  }, [contentType, contentId]);

  if (variant === 'minimal') {
    return (
      <div className={`inline-flex items-center gap-3 text-xs text-zinc-400 font-mono ${className}`}>
        <span className="flex items-center gap-1">
          <Eye className="w-3.5 h-3.5 text-zinc-500" />
          <span>{formatNumber(stats.views)}</span>
        </span>
        <span className="flex items-center gap-1">
          <Heart className="w-3.5 h-3.5 text-rose-500/70" />
          <span>{formatNumber(stats.likes)}</span>
        </span>
        <span className="flex items-center gap-1">
          <Bookmark className="w-3.5 h-3.5 text-[#C5A15B]/70" />
          <span>{formatNumber(stats.followers)}</span>
        </span>
      </div>
    );
  }

  return (
    <div className={`flex flex-wrap items-center gap-2 text-xs select-none ${className}`}>
      {/* Views Badge */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/5 border border-white/8 text-zinc-300">
        <Eye className="w-3.5 h-3.5 text-teal-400" />
        <span className="font-mono font-bold text-white">{formatNumber(stats.views)}</span>
        <span className="text-[11px] text-zinc-400">مشاهدة</span>
      </div>

      {/* Likes Badge */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300">
        <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400/40" />
        <span className="font-mono font-bold text-rose-200">{formatNumber(stats.likes)}</span>
        <span className="text-[11px] text-rose-300/80">إعجاب</span>
      </div>

      {/* Followers Badge */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#C5A15B]/10 border border-[#C5A15B]/20 text-[#E1C58B]">
        <Bookmark className="w-3.5 h-3.5 text-[#C5A15B]" />
        <span className="font-mono font-bold text-amber-200">{formatNumber(stats.followers)}</span>
        <span className="text-[11px] text-amber-300/80">متابع</span>
      </div>

      {/* Rating if present */}
      {typeof rating === 'number' && rating > 0 && (
        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-300 font-mono font-bold">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span>{rating.toFixed(1)}</span>
        </div>
      )}

      {/* Chapters count if present */}
      {typeof chaptersCount === 'number' && chaptersCount > 0 && (
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-zinc-800/60 border border-white/5 text-zinc-300">
          <BookOpen className="w-3.5 h-3.5 text-zinc-400" />
          <span className="font-mono">{chaptersCount}</span>
          <span className="text-[11px] text-zinc-400">فصل / حلقة</span>
        </div>
      )}
    </div>
  );
}
