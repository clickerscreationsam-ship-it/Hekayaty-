import { Router, type IRouter } from 'express';
import { supabaseAdmin } from '../lib/supabase';
import { getPublicationStatus, isDraft } from '../lib/publicationStatus';
import { checkUserSubscriptionStatus } from '../services/subscriptionService';

const router: IRouter = Router();

// ---------------------------------------------------------------------------
// Helpers for normalizing Supabase snake_case to frontend camelCase
// ---------------------------------------------------------------------------
function mapWorld(w: any) {
  if (!w) return null;
  return {
    ...w,
    id: w.id,
    nameAr: w.name_ar,
    nameEn: w.name_en,
    descriptionAr: w.description_ar,
    descriptionEn: w.description_en,
    ruler: w.ruler,
    rulerAr: w.ruler_ar,
    alignment: w.alignment,
    climate: w.climate,
    climateAr: w.climate_ar,
    history: w.history,
    historyAr: w.history_ar,
    image: w.image_url,
    imageUrl: w.image_url,
    notableLocations: w.notable_locations || [],
    organizations: w.organizations || [],
  };
}

function mapCharacter(c: any) {
  if (!c) return null;
  return {
    ...c,
    id: c.id,
    worldId: c.world_id,
    nameAr: c.name_ar,
    nameEn: c.name_en,
    alias: c.alias,
    aliasAr: c.alias_ar,
    alignment: c.alignment,
    bioAr: c.bio_ar,
    bioEn: c.bio_en,
    originAr: c.origin_ar,
    originEn: c.origin_en,
    powers: c.powers || [],
    powersAr: c.powers_ar || [],
    weaknesses: c.weaknesses || [],
    weaknessesAr: c.weaknesses_ar || [],
    affiliations: c.affiliations || [],
    affiliationsAr: c.affiliations_ar || [],
    relatedCharacterIds: c.related_character_ids || [],
    stats: c.stats || {},
    image: c.image_url,
    imageUrl: c.image_url,
    classification: c.classification,
    createdBy: c.created_by,
    firstAppearance: c.first_appearance,
  };
}

function mapSeries(s: any) {
  if (!s) return null;
  return {
    ...s,
    id: s.id,
    worldId: s.world_id,
    titleAr: s.title_ar,
    titleEn: s.title_en,
    descriptionAr: s.description_ar,
    coverImage: s.cover_image_url,
    imageUrl: s.cover_image_url,
    classification: s.classification,
    createdBy: s.created_by,
    status: s.status,
    issueCount: s.issue_count || 1,
    genres: s.genres || [],
    genresAr: s.genres_ar || [],
  };
}

function mapComic(c: any) {
  if (!c) return null;
  return {
    ...c,
    id: c.id,
    seriesId: c.series_id,
    worldId: c.world_id,
    titleAr: c.title_ar,
    titleEn: c.title_en,
    issueNumber: c.issue_number,
    synopsisAr: c.synopsis_ar,
    synopsisEn: c.synopsis_en,
    writer: c.writer,
    artist: c.artist,
    year: c.year,
    month: c.month,
    genres: c.genres || [],
    genresAr: c.genres_ar || [],
    coverImage: c.cover_image_url,
    imageUrl: c.cover_image_url,
    characterIds: c.character_ids || [],
    rating: Number(c.rating) || 5.0,
    pageCount: c.page_count || 24,
    classification: c.classification,
    createdBy: c.created_by,
    isFeatured: !!c.is_featured,
    isNew: !!c.is_new,
    isFree: c.is_free !== false,
    status: getPublicationStatus(c.id),
  };
}

function mapStory(s: any) {
  if (!s) return null;
  return {
    ...s,
    id: s.id,
    worldId: s.world_id,
    titleAr: s.title_ar,
    titleEn: s.title_en,
    author: s.author,
    authorAr: s.author_ar,
    synopsisAr: s.synopsis_ar,
    content: s.content,
    coverImage: s.cover_image_url,
    imageUrl: s.cover_image_url,
    genres: s.genres || [],
    genresAr: s.genres_ar || [],
    classification: s.classification,
    characterIds: s.character_ids || [],
    wordCount: s.word_count || 0,
    readTimeMinutes: s.read_time_minutes || 5,
    year: s.year,
    isFeatured: !!s.is_featured,
    isNew: !!s.is_new,
    status: getPublicationStatus(s.id),
  };
}

function mapCreator(cr: any) {
  if (!cr) return null;
  return {
    ...cr,
    id: cr.id,
    nameAr: cr.name_ar,
    nameEn: cr.name_en,
    bio: cr.bio,
    bioAr: cr.bio,
    avatar: cr.avatar_url,
    type: cr.type,
    isVerified: cr.is_verified,
    speciality: cr.speciality || [],
    works: cr.works || [],
  };
}

// ---------------------------------------------------------------------------
// WORLDS
// ---------------------------------------------------------------------------
router.get('/worlds', async (_req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('worlds').select('*');
    if (error) return res.status(500).json({ error: error.message });
    return res.json((data || []).map(mapWorld));
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.get('/worlds/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabaseAdmin
      .from('worlds')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) return res.status(500).json({ error: error.message });
    if (!data) return res.status(404).json({ error: 'العالم غير موجود' });
    return res.json(mapWorld(data));
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// CHARACTERS
// ---------------------------------------------------------------------------
router.get('/characters', async (req, res) => {
  try {
    const { worldId, alignment, classification } = req.query;
    let query = supabaseAdmin.from('characters').select('*');

    if (worldId) query = query.eq('world_id', String(worldId));
    if (alignment) query = query.eq('alignment', String(alignment));
    if (classification) query = query.eq('classification', String(classification));

    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });
    return res.json((data || []).map(mapCharacter));
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.get('/characters/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabaseAdmin
      .from('characters')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) return res.status(500).json({ error: error.message });
    if (!data) return res.status(404).json({ error: 'الشخصية غير موجودة' });
    return res.json(mapCharacter(data));
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// SERIES & COMICS
// ---------------------------------------------------------------------------
router.get('/series', async (_req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('series').select('*');
    if (error) return res.status(500).json({ error: error.message });
    return res.json((data || []).map(mapSeries));
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.get('/series/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabaseAdmin
      .from('series')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) return res.status(500).json({ error: error.message });
    if (!data) return res.status(404).json({ error: 'السلسلة غير موجودة' });
    return res.json(mapSeries(data));
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

async function checkIsAdmin(req: any): Promise<boolean> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return false;
  try {
    const token = authHeader.split(' ')[1];
    const { data: { user } } = await supabaseAdmin.auth.getUser(token);
    if (!user) return false;
    const { data: profile } = await supabaseAdmin.from('users').select('role').eq('id', user.id).maybeSingle();
    return profile?.role === 'admin' || profile?.role === 'editor';
  } catch {
    return false;
  }
}

router.get('/comics', async (req, res) => {
  try {
    const { seriesId, worldId, classification, featured } = req.query;
    let query = supabaseAdmin.from('comics').select('*');

    if (seriesId) query = query.eq('series_id', String(seriesId));
    if (worldId) query = query.eq('world_id', String(worldId));
    if (classification) query = query.eq('classification', String(classification));
    if (featured === 'true') query = query.eq('is_featured', true);

    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });
    
    const isAdmin = await checkIsAdmin(req);
    let items = (data || []).map(mapComic);
    if (!isAdmin) {
      items = items.filter((c: any) => !isDraft(c.id));
    }
    return res.json(items);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.get('/comics/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabaseAdmin
      .from('comics')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) return res.status(500).json({ error: error.message });
    if (!data) return res.status(404).json({ error: 'الكوميكس غير موجود' });

    const isAdmin = await checkIsAdmin(req);
    if (isDraft(data.id) && !isAdmin) {
      return res.status(404).json({ error: 'الكوميكس غير منشور حالياً أو قيد المراجعة' });
    }

    return res.json(mapComic(data));
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Protected Comic Reader Pages with Entitlement Guard
router.get('/comics/:id/pages', async (req, res) => {
  try {
    const { id } = req.params;
    const { data } = await supabaseAdmin.from('comics').select('*').eq('id', id).maybeSingle();
    const comic = data ? mapComic(data) : null;

    if (!comic) return res.status(404).json({ error: 'الكوميكس غير موجود' });

    const isAdmin = await checkIsAdmin(req);
    if (isDraft(comic.id) && !isAdmin) {
      return res.status(404).json({ error: 'صفحات الكوميكس غير منشورة للجمهور بعد' });
    }

    // Subscription Entitlement Check
    const isSubscribedOrAdmin = comic.isFree || (await checkUserSubscriptionStatus((req as any).user?.id, (req as any).user?.role)).isSubscriber;

    // Query real pages from comic_pages table
    const { data: dbPages } = await supabaseAdmin
      .from('comic_pages')
      .select('*')
      .eq('comic_id', id)
      .order('page_number', { ascending: true });

    let pages: any[] = [];
    if (dbPages && dbPages.length > 0) {
      pages = dbPages.map((p) => {
        const canView = isSubscribedOrAdmin || p.is_preview || p.page_number === 1;
        return {
          id: p.id,
          pageNumber: p.page_number,
          imageUrl: canView ? p.image_url : '/assets/generated_images/locked_page_placeholder.png',
          title: `الصفحة ${p.page_number} — ${comic.titleAr}`,
          isPreview: p.is_preview,
          isLocked: !canView,
        };
      });
    } else {
      const totalPages = comic.pageCount || 24;
      pages = Array.from({ length: totalPages }, (_, i) => {
        const canView = isSubscribedOrAdmin || i === 0;
        return {
          pageNumber: i + 1,
          imageUrl: canView ? (comic.coverImage || comic.imageUrl) : '/assets/generated_images/locked_page_placeholder.png',
          title: `الصفحة ${i + 1} — ${comic.titleAr}`,
          isLocked: !canView,
        };
      });
    }

    return res.json({
      comicId: comic.id,
      titleAr: comic.titleAr,
      totalPages: pages.length,
      isLocked: !isSubscribedOrAdmin,
      requiresSubscription: !isSubscribedOrAdmin,
      pages,
    });
  } catch {
    return res.status(500).json({ error: 'خطأ أثناء تحميل صفحات القراءة' });
  }
});

// ---------------------------------------------------------------------------
// STORIES (Illustrated Prose)
// ---------------------------------------------------------------------------
router.get('/stories', async (req, res) => {
  try {
    const { worldId, classification, featured } = req.query;
    let query = supabaseAdmin.from('stories').select('*');

    if (worldId) query = query.eq('world_id', String(worldId));
    if (classification) query = query.eq('classification', String(classification));
    if (featured === 'true') query = query.eq('is_featured', true);

    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });
    
    const isAdmin = await checkIsAdmin(req);
    let items = (data || []).map(mapStory);
    if (!isAdmin) {
      items = items.filter((s: any) => !isDraft(s.id));
    }
    return res.json(items);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.get('/stories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabaseAdmin
      .from('stories')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) return res.status(500).json({ error: error.message });
    if (!data) return res.status(404).json({ error: 'القصة غير موجودة' });

    const isAdmin = await checkIsAdmin(req);
    if (isDraft(data.id) && !isAdmin) {
      return res.status(404).json({ error: 'القصة/الرواية غير منشورة حالياً أو قيد الإعداد' });
    }

    return res.json(mapStory(data));
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Protected Story/Novel Chapters Endpoint with Server-Side Entitlement Guard
router.get('/stories/:id/chapters', async (req, res) => {
  try {
    const { id } = req.params;
    const { data: story, error } = await supabaseAdmin
      .from('stories')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !story) return res.status(404).json({ error: 'القصة/الرواية غير موجودة' });

    const isAdminCheck = await checkIsAdmin(req);
    if (isDraft(story.id) && !isAdminCheck) {
      return res.status(404).json({ error: 'فصول الرواية غير منشورة للجمهور بعد' });
    }

    let chapters: any[] = [];
    try {
      if (story.content && story.content.trim().startsWith('{')) {
        const parsed = JSON.parse(story.content);
        if (Array.isArray(parsed.chapters)) chapters = parsed.chapters;
      }
    } catch {}

    if (chapters.length === 0 && story.content) {
      chapters = [
        {
          id: `chap_${story.id}_1`,
          chapter_number: 1,
          title_ar: story.title_ar,
          title_en: story.title_en || 'Chapter 1',
          content: story.content,
          word_count: story.word_count || 500,
          reading_time_minutes: story.read_time_minutes || 5,
          access_level: 'public',
          status: 'published',
        },
      ];
    }

    // Check reader entitlements if user token is provided
    let isSubscriber = false;
    let isAdmin = false;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const { data: { user } } = await supabaseAdmin.auth.getUser(token);
        if (user) {
          const { data: profile } = await supabaseAdmin.from('profiles').select('role').eq('id', user.id).maybeSingle();
          if (profile?.role === 'admin') isAdmin = true;

          const { data: sub } = await supabaseAdmin
            .from('subscriptions')
            .select('id, status')
            .eq('user_id', user.id)
            .eq('status', 'active')
            .maybeSingle();
          if (sub) isSubscriber = true;
        }
      } catch {}
    }

    // Server-side sanitize: NEVER send locked chapter content to unauthorized readers
    const sanitizedChapters = chapters.map((ch) => {
      const isLocked = ch.access_level && ch.access_level !== 'public' && !isSubscriber && !isAdmin;
      let finalContent = ch.content || '';
      if (isLocked) {
        const words = (ch.content || '').split(/\s+/).filter(Boolean);
        finalContent = words.slice(0, 80).join(' ') + '... [هذا الفصل مقفل ومتاح حصرياً للمشتركين]';
      }

      return {
        id: ch.id,
        chapterNumber: ch.chapter_number,
        titleAr: ch.title_ar,
        titleEn: ch.title_en,
        subtitle: ch.subtitle || '',
        summaryAr: ch.summary_ar || '',
        coverImageUrl: ch.cover_image_url || '',
        readingTimeMinutes: ch.reading_time_minutes || 5,
        wordCount: ch.word_count || 0,
        accessLevel: ch.access_level || 'public',
        status: ch.status || 'published',
        isLocked,
        content: finalContent,
      };
    });

    return res.json({
      storyId: story.id,
      titleAr: story.title_ar,
      titleEn: story.title_en,
      authorAr: story.author_ar,
      coverImageUrl: story.cover_image_url,
      totalChapters: sanitizedChapters.length,
      chapters: sanitizedChapters,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// TIMELINE & ENCYCLOPEDIA & LORE
// ---------------------------------------------------------------------------
router.get('/timeline', async (req, res) => {
  try {
    const { era, category } = req.query;
    let query = supabaseAdmin.from('timeline_events').select('*');
    if (era) query = query.eq('era', String(era));
    if (category) query = query.eq('category', String(category));

    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });
    return res.json(
      (data || []).map((t) => ({
        ...t,
        id: t.id,
        titleAr: t.title_ar,
        titleEn: t.title_en,
        descriptionAr: t.description_ar,
        descriptionEn: t.description_en,
        image: t.image_url,
        imageUrl: t.image_url,
      }))
    );
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.get('/encyclopedia', async (req, res) => {
  try {
    const { category } = req.query;
    let query = supabaseAdmin.from('encyclopedia_entries').select('*');
    if (category) query = query.eq('category', String(category));

    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });
    return res.json(
      (data || []).map((e) => ({
        ...e,
        id: e.id,
        titleAr: e.title_ar,
        titleEn: e.title_en,
        descriptionAr: e.description_ar,
        descriptionEn: e.description_en,
        image: e.image_url,
        imageUrl: e.image_url,
      }))
    );
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.get('/encyclopedia/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabaseAdmin
      .from('encyclopedia_entries')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) return res.status(500).json({ error: error.message });
    if (!data) return res.status(404).json({ error: 'المدخل الموسوعي غير موجود' });
    return res.json({
      ...data,
      id: data.id,
      titleAr: data.title_ar,
      titleEn: data.title_en,
      descriptionAr: data.description_ar,
      descriptionEn: data.description_en,
      image: data.image_url,
      imageUrl: data.image_url,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.get('/news', async (_req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('news_articles')
      .select('*')
      .order('published_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    return res.json(
      (data || []).map((n) => ({
        ...n,
        id: n.id,
        titleAr: n.title_ar,
        titleEn: n.title_en,
        summaryAr: n.summary_ar,
        contentAr: n.content_ar,
        imageUrl: n.image_url,
        image: n.image_url,
        publishedAt: n.published_at,
        isFeatured: n.is_featured,
      }))
    );
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Note: /events is handled by dedicated eventsRouter in events.ts


router.get('/cards', async (_req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('card_game_cards').select('*');
    if (error) return res.status(500).json({ error: error.message });
    return res.json(
      (data || []).map((c) => ({
        ...c,
        id: c.id,
        nameAr: c.name_ar,
        nameEn: c.name_en,
        imageUrl: c.image_url,
        stats: c.stats || {},
        abilities: c.abilities || [],
      }))
    );
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// CREATORS
// ---------------------------------------------------------------------------
router.get('/creators', async (_req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('creators').select('*');
    if (error) return res.status(500).json({ error: error.message });
    return res.json((data || []).map(mapCreator));
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
