import React, { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { api } from '@/lib/api';

const STATUS_LABELS: Record<string, string> = {
  active: 'نشط',
  voting_open: 'التصويت مفتوح',
  scheduled: 'قادم قريباً',
  completed: 'منتهي',
  registration_open: 'التسجيل مفتوح',
  draft: 'مسودة',
  archived: 'مؤرشف',
  cancelled: 'ملغي',
};

const TYPE_LABELS: Record<string, string> = {
  carnival: 'كرنفال',
  festival: 'مهرجان',
  awards: 'جوائز',
  competition: 'مسابقة',
  reading_challenge: 'تحدي قراءة',
  community: 'فعالية',
};

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-500/20 text-green-400 border-green-500/40',
  voting_open: 'bg-purple-500/20 text-purple-400 border-purple-500/40',
  scheduled: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
  completed: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/40',
  registration_open: 'bg-teal-500/20 text-teal-400 border-teal-500/40',
};

export default function Events() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  useEffect(() => {
    api.getEvents().then(data => {
      setEvents(Array.isArray(data) ? data : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filtered = events.filter(e => {
    const statusOk = filter === 'all' || e.status === filter;
    const typeOk = typeFilter === 'all' || e.event_type === typeFilter;
    return statusOk && typeOk;
  });

  const featured = filtered.filter(e => e.status === 'active' || e.status === 'voting_open');
  const upcoming = filtered.filter(e => e.status === 'scheduled' || e.status === 'registration_open');
  const completed = filtered.filter(e => e.status === 'completed' || e.status === 'archived');

  return (
    <div className="min-h-screen bg-[#0E131F] text-white font-arabic" dir="rtl">
      {/* Cinematic Hero */}
      <div className="relative h-[420px] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1600&q=80')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-[#0E131F]" />
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4 gap-4">
          <div className="inline-flex items-center gap-2 bg-[#C5A15B]/20 border border-[#C5A15B]/40 rounded-full px-4 py-1 text-[#C5A15B] text-sm mb-2">
            🎪 فعاليات وكرنفالات حكاياتي الرسمية
          </div>
          <h1 className="text-4xl md:text-6xl font-bold drop-shadow-lg">
            مهرجان الفصول والممالك
          </h1>
          <p className="text-zinc-300 max-w-xl text-lg">
            مسابقات ضخمة، كرنفالات حيّة، تصويت جماهيري، وجوائز لأبرز المبدعين في عالم حكاياتي.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 py-6 flex flex-wrap gap-3 items-center">
        <span className="text-zinc-400 text-sm">تصفية:</span>
        {['all', 'active', 'voting_open', 'scheduled', 'completed'].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1 rounded-full border text-xs transition-all ${
              filter === s
                ? 'bg-[#087C7B] border-[#087C7B] text-white'
                : 'border-zinc-700 text-zinc-400 hover:border-zinc-500'
            }`}
          >
            {s === 'all' ? 'الكل' : STATUS_LABELS[s] || s}
          </button>
        ))}
        <span className="text-zinc-600">|</span>
        {['all', 'carnival', 'awards', 'competition', 'festival'].map(t => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            className={`px-3 py-1 rounded-full border text-xs transition-all ${
              typeFilter === t
                ? 'bg-[#C5A15B] border-[#C5A15B] text-black font-bold'
                : 'border-zinc-700 text-zinc-400 hover:border-zinc-500'
            }`}
          >
            {t === 'all' ? 'جميع الأنواع' : TYPE_LABELS[t] || t}
          </button>
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-16 space-y-14">
        {loading && (
          <div className="flex justify-center py-24">
            <div className="w-12 h-12 rounded-full border-4 border-[#087C7B]/30 border-t-[#087C7B] animate-spin" />
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-24 text-zinc-500">
            لا توجد فعاليات تطابق الفلتر المحدد
          </div>
        )}

        {/* Active / Voting Open */}
        {featured.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-[#C5A15B]">
              <span>🔥</span> الفعاليات النشطة والتصويت المفتوح
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map(event => <EventCard key={event.id} event={event} />)}
            </div>
          </section>
        )}

        {/* Upcoming */}
        {upcoming.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-[#087C7B]">
              <span>📅</span> الفعاليات القادمة
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcoming.map(event => <EventCard key={event.id} event={event} />)}
            </div>
          </section>
        )}

        {/* Completed */}
        {completed.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-zinc-400">
              <span>🏆</span> الفعاليات المنتهية والأرشيف
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {completed.map(event => <EventCard key={event.id} event={event} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function EventCard({ event }: { event: any }) {
  const slug = event.slug || event.id;
  const statusColor =
    STATUS_COLORS[event.status] || 'bg-zinc-700/40 text-zinc-400 border-zinc-600';

  return (
    <Link href={`/events/${slug}`}>
      <div className="group relative bg-zinc-900/60 border border-zinc-800 rounded-2xl overflow-hidden cursor-pointer hover:border-[#C5A15B]/50 hover:shadow-[0_0_30px_rgba(197,161,91,0.15)] transition-all duration-300">
        {/* Cover */}
        <div className="relative h-48 overflow-hidden">
          {event.image_url ? (
            <img
              src={event.image_url}
              alt={event.title_ar}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#087C7B]/30 to-[#C5A15B]/20 flex items-center justify-center">
              <span className="text-5xl">🎪</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent" />
          {/* Status badge */}
          <div className={`absolute top-3 right-3 border rounded-full px-2 py-0.5 text-xs font-bold ${statusColor}`}>
            {STATUS_LABELS[event.status] || event.status}
          </div>
          {/* Type badge */}
          {event.event_type && (
            <div className="absolute top-3 left-3 border border-zinc-600 bg-black/50 rounded-full px-2 py-0.5 text-xs text-zinc-300">
              {TYPE_LABELS[event.event_type] || event.event_type}
            </div>
          )}
        </div>

        {/* Body */}
        <div className="p-4 space-y-2">
          <h3 className="font-bold text-lg leading-tight line-clamp-2 group-hover:text-[#C5A15B] transition-colors">
            {event.title_ar}
          </h3>
          {event.description_ar && (
            <p className="text-zinc-400 text-sm line-clamp-2">{event.description_ar}</p>
          )}
          <div className="flex items-center justify-between pt-2">
            {event.location && (
              <span className="text-zinc-500 text-xs flex items-center gap-1">
                📍 {event.location}
              </span>
            )}
            {event.start_date && (
              <span className="text-zinc-500 text-xs">
                {new Date(event.start_date).toLocaleDateString('ar-EG')}
              </span>
            )}
          </div>
          {(event.status === 'voting_open' || event.status === 'active') && (
            <div className="pt-2">
              <span className="inline-block w-full text-center bg-[#087C7B]/20 border border-[#087C7B]/50 text-[#087C7B] rounded-lg py-1.5 text-sm font-bold group-hover:bg-[#087C7B] group-hover:text-white transition-all">
                {event.status === 'voting_open' ? '🗳️ شارك في التصويت' : '📌 عرض التفاصيل والتسجيل'}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
