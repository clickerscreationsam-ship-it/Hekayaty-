import { Router, type IRouter } from 'express';
import { requireAuth, requireRole } from '../middlewares/auth';
import { supabaseAdmin } from '../lib/supabase';
import { getPublicationStatus, setPublicationStatus, isDraft, isPublished } from '../lib/publicationStatus';

function toValidUuidOrNull(val: any): string | null {
  if (!val || typeof val !== 'string') return null;
  const trimmed = val.trim();
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(trimmed) ? trimmed : null;
}

const router: IRouter = Router();

// Protect ALL admin routes with requireAuth and requireRole('admin')
router.use(requireAuth);
router.use(requireRole('admin'));

// Helper: Log administrative action in Supabase audit_logs
async function logAdminAction(userId: string, action: string, resourceType: string, resourceId: string, metadata: any = {}) {
  try {
    await supabaseAdmin.from('audit_logs').insert({
      user_id: userId,
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      metadata,
    });
  } catch (err) {
    console.error('Audit log failed:', err);
  }
}

// ---------------------------------------------------------------------------
// 1. EXECUTIVE COMMAND CENTER OVERVIEW STATS
// ---------------------------------------------------------------------------
router.get('/overview', async (_req, res) => {
  try {
    // Run real database queries in parallel
    const [
      usersRes,
      worldsRes,
      charactersRes,
      comicsRes,
      storiesRes,
      ordersRes,
      subsRes,
      appsRes,
      logsRes,
    ] = await Promise.all([
      supabaseAdmin.from('profiles').select('id, role, is_active, created_at'),
      supabaseAdmin.from('worlds').select('id, alignment', { count: 'exact' }),
      supabaseAdmin.from('characters').select('id, classification', { count: 'exact' }),
      supabaseAdmin.from('comics').select('id, classification, is_featured', { count: 'exact' }),
      supabaseAdmin.from('stories').select('id, classification, is_featured', { count: 'exact' }),
      supabaseAdmin.from('orders').select('id, total_amount_egp, status, created_at'),
      supabaseAdmin.from('subscriptions').select('id, status', { count: 'exact' }),
      supabaseAdmin.from('audit_logs').select('id').eq('action', 'creator_application_submitted'),
      supabaseAdmin.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(10),
    ]);

    const users = usersRes.data || [];
    const totalUsers = users.length;
    const activeUsers = users.filter((u) => u.is_active).length;
    const suspendedUsers = totalUsers - activeUsers;
    const readersCount = users.filter((u) => u.role === 'reader').length;
    const writersCount = users.filter((u) => u.role === 'writer').length;
    const publishersCount = users.filter((u) => u.role === 'publishing_house').length;
    const adminsCount = users.filter((u) => u.role === 'admin').length;

    const orders = ordersRes.data || [];
    const grossSales = orders.reduce((sum, o) => sum + (Number(o.total_amount_egp) || 0), 0);
    const completedOrders = orders.filter((o) => o.status === 'paid' || o.status === 'delivered').length;

    const characters = charactersRes.data || [];
    const comics = comicsRes.data || [];
    const stories = storiesRes.data || [];

    const originalsCount =
      comics.filter((c) => c.classification === 'original').length +
      stories.filter((s) => s.classification === 'original').length;

    const selectedCount =
      comics.filter((c) => c.classification === 'hekayaty_selected').length +
      stories.filter((s) => s.classification === 'hekayaty_selected').length;

    return res.json({
      platform: {
        totalUsers,
        activeUsers,
        suspendedUsers,
        readersCount,
        writersCount,
        publishersCount,
        adminsCount,
        pendingApplications: appsRes.data?.length || 0,
      },
      content: {
        totalWorlds: worldsRes.count || 0,
        totalCharacters: charactersRes.count || 0,
        totalComics: comicsRes.count || 0,
        totalStories: storiesRes.count || 0,
        originalsCount,
        selectedCount,
        totalPublications: (comicsRes.count || 0) + (storiesRes.count || 0),
      },
      financial: {
        grossSales,
        netSales: grossSales * 0.85, // Platform commission split
        platformRevenue: grossSales * 0.15,
        writerRoyalties: grossSales * 0.85,
        totalOrders: orders.length,
        completedOrders,
        activeSubscriptions: subsRes.count || 0,
      },
      recentActivity: (logsRes.data || []).map((l) => ({
        id: l.id,
        action: l.action,
        resourceType: l.resource_type,
        resourceId: l.resource_id,
        metadata: l.metadata,
        createdAt: l.created_at,
      })),
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'خطأ أثناء استرجاع إحصائيات الإدارة' });
  }
});

// ---------------------------------------------------------------------------
// 2. CONTENT CRUD: WORLDS
// ---------------------------------------------------------------------------
router.get('/worlds', async (_req, res) => {
  const { data, error } = await supabaseAdmin.from('worlds').select('*').order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data || []);
});

router.post('/worlds', async (req, res) => {
  try {
    const { id, nameAr, nameEn, descriptionAr, descriptionEn, rulerAr, alignment, climateAr, historyAr, imageUrl } = req.body;
    if (!nameAr) return res.status(400).json({ error: 'اسم العالم بالعربية مطلوب' });

    const worldId = id || `w_${Date.now()}`;
    const payload = {
      id: worldId,
      name_ar: nameAr.trim(),
      name_en: nameEn?.trim() || nameAr.trim(),
      description_ar: descriptionAr || '',
      description_en: descriptionEn || '',
      ruler_ar: rulerAr || '',
      alignment: ['light', 'dark', 'neutral'].includes(alignment) ? alignment : 'neutral',
      climate_ar: climateAr || '',
      history_ar: historyAr || '',
      image_url: imageUrl || '/assets/generated_images/hero_bg.jpg',
    };

    const { data, error } = await supabaseAdmin.from('worlds').insert(payload).select().single();
    if (error) return res.status(400).json({ error: error.message });

    await logAdminAction(req.user!.id, 'world_created', 'world', worldId, { nameAr });
    return res.status(201).json({ success: true, world: data });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.put('/worlds/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nameAr, nameEn, descriptionAr, descriptionEn, rulerAr, alignment, climateAr, historyAr, imageUrl } = req.body;

    const updates: any = {};
    if (nameAr) updates.name_ar = nameAr.trim();
    if (nameEn) updates.name_en = nameEn.trim();
    if (descriptionAr !== undefined) updates.description_ar = descriptionAr;
    if (descriptionEn !== undefined) updates.description_en = descriptionEn;
    if (rulerAr !== undefined) updates.ruler_ar = rulerAr;
    if (alignment) updates.alignment = alignment;
    if (climateAr !== undefined) updates.climate_ar = climateAr;
    if (historyAr !== undefined) updates.history_ar = historyAr;
    if (imageUrl !== undefined) updates.image_url = imageUrl;

    const { data, error } = await supabaseAdmin.from('worlds').update(updates).eq('id', id).select().single();
    if (error) return res.status(400).json({ error: error.message });

    await logAdminAction(req.user!.id, 'world_updated', 'world', id, updates);
    return res.json({ success: true, world: data });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.delete('/worlds/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabaseAdmin.from('worlds').delete().eq('id', id);
    if (error) return res.status(400).json({ error: error.message });

    await logAdminAction(req.user!.id, 'world_deleted', 'world', id);
    return res.json({ success: true, message: 'تم حذف العالم بنجاح' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// 3. CONTENT CRUD: CHARACTERS STUDIO
// ---------------------------------------------------------------------------
router.get('/characters', async (_req, res) => {
  const { data, error } = await supabaseAdmin.from('characters').select('*, worlds(name_ar)').order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  const mapped = (data || []).map((c: any) => ({
    ...c,
    name: c.name_ar,
    nameAr: c.name_ar,
    nameEn: c.name_en,
    title: c.alias_ar || c.alias,
    aliasAr: c.alias_ar,
    alias: c.alias_ar || c.alias,
    imageUrl: c.image_url,
    avatar_url: c.image_url,
    image: c.image_url,
    description: c.bio_ar,
    bioAr: c.bio_ar,
    role: c.alignment,
    powerRating: c.stats?.powerRating || 85,
    worldName: c.worlds?.name_ar || null,
  }));
  return res.json(mapped);
});

router.post('/characters', async (req, res) => {
  try {
    const {
      id,
      nameAr,
      name,
      nameEn,
      name_en,
      aliasAr,
      title,
      alias,
      worldId,
      world_id,
      alignment,
      bioAr,
      description,
      originAr,
      powers,
      powersAr,
      weaknesses,
      weaknessesAr,
      affiliations,
      affiliationsAr,
      classification,
      imageUrl,
      avatar_url,
      image_url,
      stats,
      powerRating,
      role,
    } = req.body;

    const finalNameAr = nameAr || name;
    if (!finalNameAr) return res.status(400).json({ error: 'اسم الشخصية بالعربية مطلوب' });

    const charId = id || `char_${Date.now()}`;
    const calculatedRating = Number(powerRating) || 80;
    const finalStats = {
      strength: 60, speed: 60, durability: 60, intelligence: 60, magic: 50, combat: 60,
      ...(stats || {}),
      powerRating: calculatedRating,
    };

    const payload = {
      id: charId,
      name_ar: finalNameAr.trim(),
      name_en: (nameEn || name_en)?.trim() || finalNameAr.trim(),
      alias_ar: aliasAr || title || alias || '',
      world_id: (worldId || world_id) && String(worldId || world_id).trim() ? String(worldId || world_id).trim() : null,
      alignment: ['hero', 'villain', 'antihero', 'neutral'].includes(alignment) ? alignment : 'hero',
      bio_ar: bioAr || description || '',
      origin_ar: originAr || '',
      powers: Array.isArray(powers) ? powers : (Array.isArray(powersAr) ? powersAr : []),
      powers_ar: Array.isArray(powersAr) ? powersAr : (Array.isArray(powers) ? powers : []),
      weaknesses_ar: Array.isArray(weaknessesAr) ? weaknessesAr : (Array.isArray(weaknesses) ? weaknesses : []),
      affiliations_ar: Array.isArray(affiliationsAr) ? affiliationsAr : (Array.isArray(affiliations) ? affiliations : []),
      classification: ['original', 'hekayaty_selected', 'official_collaboration'].includes(classification)
        ? classification
        : 'original',
      image_url: imageUrl || avatar_url || image_url || '/assets/generated_images/zayed.jpg',
      stats: finalStats,
    };

    const { data, error } = await supabaseAdmin.from('characters').insert(payload).select().single();
    if (error) {
      console.error('Supabase characters insert error:', error);
      return res.status(400).json({ error: error.message, details: error.details, hint: error.hint });
    }

    await logAdminAction(req.user!.id, 'character_created', 'character', charId, { nameAr: finalNameAr, classification: payload.classification });
    return res.status(201).json({ success: true, character: data });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.put('/characters/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nameAr, name,
      nameEn, name_en,
      aliasAr, title, alias,
      worldId, world_id,
      alignment,
      bioAr, description,
      originAr, origin,
      powers, powersAr,
      weaknesses, weaknessesAr,
      affiliations, affiliationsAr,
      classification,
      imageUrl, avatar_url,
      stats, powerRating
    } = req.body;

    const updates: any = {};
    const finalName = nameAr || name;
    if (finalName) updates.name_ar = finalName.trim();
    const finalNameEn = nameEn || name_en;
    if (finalNameEn) updates.name_en = finalNameEn.trim();
    const finalAlias = aliasAr ?? title ?? alias;
    if (finalAlias !== undefined) updates.alias_ar = finalAlias;
    const finalWorld = worldId ?? world_id;
    if (finalWorld !== undefined) updates.world_id = finalWorld || null;
    if (alignment) updates.alignment = alignment;
    const finalBio = bioAr ?? description;
    if (finalBio !== undefined) updates.bio_ar = finalBio;
    const finalOrigin = originAr ?? origin;
    if (finalOrigin !== undefined) updates.origin_ar = finalOrigin;
    if (powers !== undefined) updates.powers = powers;
    if (powersAr) updates.powers_ar = powersAr;
    const finalWeaknesses = weaknessesAr ?? weaknesses;
    if (finalWeaknesses) updates.weaknesses_ar = finalWeaknesses;
    const finalAffiliations = affiliationsAr ?? affiliations;
    if (finalAffiliations) updates.affiliations_ar = finalAffiliations;
    if (classification) updates.classification = classification;
    const finalImg = imageUrl ?? avatar_url;
    if (finalImg !== undefined) updates.image_url = finalImg;
    if (stats || powerRating !== undefined) {
      updates.stats = {
        ...(stats || {}),
        ...(powerRating !== undefined ? { powerRating: Number(powerRating) } : {}),
      };
    }

    const { data, error } = await supabaseAdmin.from('characters').update(updates).eq('id', id).select().single();
    if (error) return res.status(400).json({ error: error.message });

    await logAdminAction(req.user!.id, 'character_updated', 'character', id, updates);
    return res.json({ success: true, character: data });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.delete('/characters/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabaseAdmin.from('characters').delete().eq('id', id);
    if (error) return res.status(400).json({ error: error.message });

    await logAdminAction(req.user!.id, 'character_deleted', 'character', id);
    return res.json({ success: true, message: 'تم حذف الشخصية بنجاح' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// 4. CONTENT CRUD: COMICS & SERIES STUDIO
// ---------------------------------------------------------------------------
router.get('/comics', async (_req, res) => {
  const { data, error } = await supabaseAdmin.from('comics').select('*, series(title_ar)').order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  const mapped = (data || []).map((c: any) => ({
    ...c,
    status: getPublicationStatus(c.id),
  }));
  return res.json(mapped);
});

router.post('/comics', async (req, res) => {
  try {
    const {
      id,
      seriesId,
      series_id,
      worldId,
      world_id,
      publisherId,
      publisher_id,
      titleAr,
      title,
      titleEn,
      title_en,
      issueNumber,
      issue_number,
      synopsisAr,
      synopsis,
      writer,
      artist,
      classification,
      coverImageUrl,
      cover_image_url,
      characterIds,
      character_ids,
      isFeatured,
      is_featured,
      isFree,
      is_free,
      pagesCount,
      pages_count,
      genresAr,
      genres_ar,
      status,
    } = req.body;

    const finalTitleAr = titleAr || title;
    if (!finalTitleAr) return res.status(400).json({ error: 'عنوان الكوميكس بالعربية مطلوب' });
    if (!classification) return res.status(400).json({ error: 'تصنيف العمل مطلوب إلزاميًا (Originals أو Selected)' });

    const comicId = id || `comic_${Date.now()}`;
    const payload = {
      id: comicId,
      series_id: (seriesId || series_id) && String(seriesId || series_id).trim() ? String(seriesId || series_id).trim() : null,
      world_id: (worldId || world_id) && String(worldId || world_id).trim() ? String(worldId || world_id).trim() : null,
      publisher_id: toValidUuidOrNull(publisherId || publisher_id),
      title_ar: finalTitleAr.trim(),
      title_en: (titleEn || title_en)?.trim() || finalTitleAr.trim(),
      issue_number: Number(issueNumber || issue_number) || 1,
      synopsis_ar: synopsisAr || synopsis || '',
      writer: writer || 'فريق حكاياتي',
      artist: artist || '',
      classification: ['original', 'hekayaty_selected', 'official_collaboration'].includes(classification)
        ? classification
        : 'original',
      cover_image_url: coverImageUrl || cover_image_url || '/assets/generated_images/comic_1.jpg',
      character_ids: Array.isArray(characterIds || character_ids) ? (characterIds || character_ids) : [],
      is_featured: !!(isFeatured ?? is_featured),
      is_free: !!(isFree ?? is_free),
      page_count: Number(pagesCount || pages_count || req.body.page_count) || 24,
      genres_ar: Array.isArray(genresAr || genres_ar) ? (genresAr || genres_ar) : ['خيال علمي', 'مغامرات'],
    };

    const { data, error } = await supabaseAdmin.from('comics').insert(payload).select().single();
    if (error) {
      console.error('Supabase comics insert error:', error);
      return res.status(400).json({ error: error.message, details: error.details, hint: error.hint });
    }

    setPublicationStatus(comicId, 'comic', status || 'draft');
    await logAdminAction(req.user!.id, 'comic_created', 'comic', comicId, { titleAr: finalTitleAr, classification, status: status || 'draft' });
    return res.status(201).json({ success: true, comic: { ...data, status: getPublicationStatus(comicId) } });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.put('/comics/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      titleAr,
      titleEn,
      title_ar,
      title_en,
      slug,
      seriesId,
      series_id,
      worldId,
      world_id,
      publisherId,
      publisher_id,
      issueNumber,
      issue_number,
      synopsis,
      synopsisAr,
      synopsis_ar,
      writer,
      artist,
      classification,
      coverImageUrl,
      coverImage,
      cover_image_url,
      imageUrl,
      characterIds,
      character_ids,
      isFeatured,
      is_featured,
      isFree,
      is_free,
      pagesCount,
      pageCount,
      page_count,
      genres,
      genresAr,
      genres_ar,
      status,
    } = req.body;

    const updates: any = {};
    const finalTitleAr = titleAr || title_ar || title;
    if (finalTitleAr) updates.title_ar = String(finalTitleAr).trim();

    const finalTitleEn = titleEn || title_en;
    if (finalTitleEn) updates.title_en = String(finalTitleEn).trim();

    if (slug) updates.slug = String(slug).trim();

    const finalSeriesId = seriesId ?? series_id;
    if (finalSeriesId !== undefined) updates.series_id = finalSeriesId && String(finalSeriesId).trim() ? String(finalSeriesId).trim() : null;

    const finalWorldId = worldId ?? world_id;
    if (finalWorldId !== undefined) updates.world_id = finalWorldId && String(finalWorldId).trim() ? String(finalWorldId).trim() : null;

    const finalPubId = publisherId ?? publisher_id;
    if (finalPubId !== undefined) updates.publisher_id = toValidUuidOrNull(finalPubId);

    const finalIssue = issueNumber ?? issue_number;
    if (finalIssue !== undefined) updates.issue_number = Number(finalIssue);

    const finalSynopsis = synopsisAr !== undefined ? synopsisAr : (synopsis_ar !== undefined ? synopsis_ar : synopsis);
    if (finalSynopsis !== undefined) updates.synopsis_ar = finalSynopsis;

    if (writer !== undefined) updates.writer = writer;
    if (artist !== undefined) updates.artist = artist;

    if (classification) {
      updates.classification = ['original', 'hekayaty_selected', 'official_collaboration'].includes(classification)
        ? classification
        : (classification === 'selected' ? 'hekayaty_selected' : 'original');
    }

    const finalCover = coverImageUrl || cover_image_url || coverImage || imageUrl;
    if (finalCover !== undefined) updates.cover_image_url = finalCover;

    const finalChars = characterIds ?? character_ids;
    if (finalChars !== undefined) updates.character_ids = finalChars;

    if (isFeatured !== undefined || is_featured !== undefined) updates.is_featured = !!(isFeatured ?? is_featured);
    if (isFree !== undefined || is_free !== undefined) updates.is_free = !!(isFree ?? is_free);

    const finalPages = pagesCount ?? pageCount ?? page_count;
    if (finalPages !== undefined) updates.page_count = Number(finalPages);

    const finalGenres = genresAr || genres_ar || genres;
    if (finalGenres) updates.genres_ar = Array.isArray(finalGenres) ? finalGenres : [finalGenres];

    if (status) {
      setPublicationStatus(id, 'comic', status);
    }

    let updatedComic = null;
    if (Object.keys(updates).length > 0) {
      const { data, error } = await supabaseAdmin.from('comics').update(updates).eq('id', id).select().single();
      if (error) {
        console.warn('[Admin Update Comic DB Warning]', error.message);
      }
      updatedComic = data;
    }

    if (!updatedComic) {
      const { data } = await supabaseAdmin.from('comics').select('*').eq('id', id).maybeSingle();
      updatedComic = data || { id, ...updates };
    }

    await logAdminAction(req.user!.id, 'comic_updated', 'comic', id, { ...updates, status: getPublicationStatus(id) });
    return res.json({ success: true, comic: { ...updatedComic, status: getPublicationStatus(id) } });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.delete('/comics/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabaseAdmin.from('comics').delete().eq('id', id);
    if (error) return res.status(400).json({ error: error.message });

    await logAdminAction(req.user!.id, 'comic_deleted', 'comic', id);
    return res.json({ success: true, message: 'تم حذف الكوميكس بنجاح' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// 5. CONTENT CRUD: STORIES & NOVELS
// ---------------------------------------------------------------------------
router.get('/stories', async (_req, res) => {
  const { data, error } = await supabaseAdmin.from('stories').select('*, worlds(name_ar)').order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  const mapped = (data || []).map((s: any) => ({
    ...s,
    status: getPublicationStatus(s.id),
  }));
  return res.json(mapped);
});

router.post('/stories', async (req, res) => {
  try {
    const {
      id,
      worldId,
      world_id,
      authorId,
      author_id,
      titleAr,
      title,
      titleEn,
      title_en,
      excerptAr,
      synopsis,
      synopsisAr,
      contentAr,
      content,
      authorAr,
      readTimeMinutes,
      reading_time_minutes,
      classification,
      coverImageUrl,
      cover_image_url,
      characterIds,
      character_ids,
      isFeatured,
      is_featured,
      genresAr,
      genres_ar,
      status,
    } = req.body;

    const finalTitleAr = titleAr || title;
    if (!finalTitleAr) return res.status(400).json({ error: 'عنوان القصة بالعربية مطلوب' });
    if (!classification) return res.status(400).json({ error: 'تصنيف العمل مطلوب إلزاميًا (Originals أو Selected)' });

    const storyId = id || `story_${Date.now()}`;
    const payload = {
      id: storyId,
      world_id: (worldId || world_id) && String(worldId || world_id).trim() ? String(worldId || world_id).trim() : null,
      author_id: toValidUuidOrNull(authorId || author_id),
      title_ar: finalTitleAr.trim(),
      title_en: (titleEn || title_en)?.trim() || finalTitleAr.trim(),
      synopsis_ar: synopsisAr || synopsis || excerptAr || '',
      content: contentAr || content || '',
      author_ar: authorAr || 'فريق حكاياتي',
      read_time_minutes: Number(readTimeMinutes || reading_time_minutes) || 10,
      classification: ['original', 'hekayaty_selected', 'official_collaboration'].includes(classification)
        ? classification
        : 'original',
      cover_image_url: coverImageUrl || cover_image_url || '/assets/generated_images/hero_bg.jpg',
      character_ids: Array.isArray(characterIds || character_ids) ? (characterIds || character_ids) : [],
      is_featured: !!(isFeatured ?? is_featured),
      genres_ar: Array.isArray(genresAr || genres_ar) ? (genresAr || genres_ar) : ['رواية ملحمية'],
    };

    const { data, error } = await supabaseAdmin.from('stories').insert(payload).select().single();
    if (error) return res.status(400).json({ error: error.message });

    setPublicationStatus(storyId, 'story', status || 'draft');
    await logAdminAction(req.user!.id, 'story_created', 'story', storyId, { titleAr: finalTitleAr, classification, status: status || 'draft' });
    return res.status(201).json({ success: true, story: { ...data, status: getPublicationStatus(storyId) } });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.put('/stories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      worldId,
      authorId,
      title,
      titleAr,
      titleEn,
      title_ar,
      title_en,
      slug,
      excerptAr,
      synopsis,
      synopsisAr,
      synopsis_ar,
      content,
      contentAr,
      author,
      authorAr,
      author_ar,
      rightsHolder,
      rights_holder,
      readTimeMinutes,
      readingTimeMinutes,
      read_time_minutes,
      classification,
      coverImageUrl,
      coverImage,
      cover_image_url,
      imageUrl,
      characterIds,
      isFeatured,
      is_featured,
      genres,
      genresAr,
      genres_ar,
      status,
    } = req.body;

    const updates: any = {};
    const finalTitleAr = titleAr || title_ar || title;
    if (finalTitleAr) updates.title_ar = String(finalTitleAr).trim();

    const finalTitleEn = titleEn || title_en;
    if (finalTitleEn) updates.title_en = String(finalTitleEn).trim();

    if (slug) updates.slug = String(slug).trim();

    if (worldId !== undefined) updates.world_id = worldId && String(worldId).trim() ? String(worldId).trim() : null;
    if (authorId !== undefined) updates.author_id = toValidUuidOrNull(authorId);

    const finalSynopsis = synopsisAr !== undefined ? synopsisAr : (synopsis_ar !== undefined ? synopsis_ar : (synopsis !== undefined ? synopsis : excerptAr));
    if (finalSynopsis !== undefined) updates.synopsis_ar = finalSynopsis;

    const finalContent = contentAr !== undefined ? contentAr : content;
    if (finalContent !== undefined) updates.content = finalContent;

    const finalAuthor = authorAr || author_ar || author;
    if (finalAuthor !== undefined) updates.author_ar = finalAuthor;

    const finalRightsHolder = rightsHolder || rights_holder;
    if (finalRightsHolder !== undefined) updates.rights_holder = finalRightsHolder;

    const finalReadTime = readTimeMinutes ?? readingTimeMinutes ?? read_time_minutes;
    if (finalReadTime !== undefined) updates.read_time_minutes = Number(finalReadTime);

    if (classification) {
      updates.classification = ['original', 'hekayaty_selected', 'official_collaboration'].includes(classification)
        ? classification
        : (classification === 'selected' ? 'hekayaty_selected' : 'original');
    }

    const finalCover = coverImageUrl || cover_image_url || coverImage || imageUrl;
    if (finalCover !== undefined) updates.cover_image_url = finalCover;

    if (characterIds !== undefined) updates.character_ids = characterIds;
    if (isFeatured !== undefined || is_featured !== undefined) updates.is_featured = !!(isFeatured ?? is_featured);

    const finalGenres = genresAr || genres_ar || genres;
    if (finalGenres) updates.genres_ar = Array.isArray(finalGenres) ? finalGenres : [finalGenres];

    if (status) {
      setPublicationStatus(id, 'story', status);
    }

    let updatedStory = null;
    if (Object.keys(updates).length > 0) {
      const { data, error } = await supabaseAdmin.from('stories').update(updates).eq('id', id).select().single();
      if (error) {
        console.warn('[Admin Update Story DB Warning]', error.message);
      }
      updatedStory = data;
    }

    if (!updatedStory) {
      const { data } = await supabaseAdmin.from('stories').select('*').eq('id', id).maybeSingle();
      updatedStory = data || { id, ...updates };
    }

    await logAdminAction(req.user!.id, 'story_updated', 'story', id, { ...updates, status: getPublicationStatus(id) });
    return res.json({ success: true, story: { ...updatedStory, status: getPublicationStatus(id) } });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.delete('/stories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabaseAdmin.from('stories').delete().eq('id', id);
    if (error) return res.status(400).json({ error: error.message });

    await logAdminAction(req.user!.id, 'story_deleted', 'story', id);
    return res.json({ success: true, message: 'تم حذف الرواية بنجاح' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// 5B. CHAPTERS MANAGEMENT FOR NOVELS & STORIES
// ---------------------------------------------------------------------------
router.get('/stories/:id/chapters', async (req, res) => {
  try {
    const { id } = req.params;
    const { data: story, error } = await supabaseAdmin.from('stories').select('*').eq('id', id).maybeSingle();
    if (error || !story) return res.status(404).json({ error: 'العمل غير موجود' });

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
          title_ar: story.title_ar ? `الفصل الأول — ${story.title_ar}` : 'الفصل الأول',
          title_en: 'Chapter 1',
          subtitle: '',
          content: story.content,
          summary_ar: story.synopsis_ar || '',
          reading_time_minutes: story.read_time_minutes || 10,
          word_count: story.word_count || ((story.content || '').split(/\s+/).filter(Boolean).length || 500),
          status: 'published',
          access_level: 'public',
          scheduled_at: null,
          created_at: story.created_at,
          updated_at: story.updated_at,
        },
      ];
    }

    return res.json({
      storyId: story.id,
      titleAr: story.title_ar,
      totalChapters: chapters.length,
      chapters,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.post('/stories/:id/chapters', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      titleAr, title,
      titleEn, title_en,
      subtitle,
      content,
      summaryAr, summary,
      readingTimeMinutes, reading_time_minutes,
      status = 'published',
      accessLevel = 'public',
      scheduledAt = null,
      coverImageUrl,
    } = req.body;

    const { data: story, error } = await supabaseAdmin.from('stories').select('*').eq('id', id).maybeSingle();
    if (error || !story) return res.status(404).json({ error: 'العمل غير موجود' });

    let parsedMeta: any = {};
    let chapters: any[] = [];
    try {
      if (story.content && story.content.trim().startsWith('{')) {
        parsedMeta = JSON.parse(story.content);
        if (Array.isArray(parsedMeta.chapters)) chapters = parsedMeta.chapters;
      }
    } catch {}

    const nextNumber = chapters.length + 1;
    const wordCount = (content || '').trim().split(/\s+/).filter(Boolean).length;
    const readTime = Number(readingTimeMinutes || reading_time_minutes) || Math.max(1, Math.ceil(wordCount / 180));

    const newChapter = {
      id: `chap_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      chapter_number: nextNumber,
      title_ar: titleAr || title || `الفصل ${nextNumber}`,
      title_en: titleEn || title_en || `Chapter ${nextNumber}`,
      subtitle: subtitle || '',
      cover_image_url: coverImageUrl || '',
      content: content || '',
      summary_ar: summaryAr || summary || '',
      reading_time_minutes: readTime,
      word_count: wordCount,
      status, // 'draft' | 'published' | 'scheduled' | 'archived'
      access_level: accessLevel, // 'public' | 'free_preview' | 'subscriber_only' | 'premium'
      scheduled_at: scheduledAt,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    chapters.push(newChapter);
    parsedMeta.chapters = chapters;
    parsedMeta.last_modified = new Date().toISOString();

    const totalWordCount = chapters.reduce((sum, ch) => sum + (ch.word_count || 0), 0);
    const totalReadTime = chapters.reduce((sum, ch) => sum + (ch.reading_time_minutes || 0), 0);

    const { error: updateErr } = await supabaseAdmin
      .from('stories')
      .update({
        content: JSON.stringify(parsedMeta),
        word_count: totalWordCount,
        read_time_minutes: totalReadTime,
      })
      .eq('id', id);

    if (updateErr) return res.status(400).json({ error: updateErr.message });

    await logAdminAction(req.user!.id, 'chapter_created', 'chapter', newChapter.id, { storyId: id, titleAr: newChapter.title_ar });
    return res.status(201).json({ success: true, chapter: newChapter, totalChapters: chapters.length });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.put('/stories/:id/chapters/:chapterId', async (req, res) => {
  try {
    const { id, chapterId } = req.params;
    const {
      titleAr, title,
      titleEn, title_en,
      subtitle,
      content,
      summaryAr, summary,
      readingTimeMinutes, reading_time_minutes,
      status,
      accessLevel,
      scheduledAt,
      coverImageUrl,
    } = req.body;

    const { data: story, error } = await supabaseAdmin.from('stories').select('*').eq('id', id).maybeSingle();
    if (error || !story) return res.status(404).json({ error: 'العمل غير موجود' });

    let parsedMeta: any = {};
    let chapters: any[] = [];
    try {
      if (story.content && story.content.trim().startsWith('{')) {
        parsedMeta = JSON.parse(story.content);
        if (Array.isArray(parsedMeta.chapters)) chapters = parsedMeta.chapters;
      }
    } catch {}

    const idx = chapters.findIndex((c) => c.id === chapterId);
    if (idx === -1) return res.status(404).json({ error: 'الفصل غير موجود' });

    const existing = chapters[idx];
    const newContent = content !== undefined ? content : existing.content;
    const wordCount = (newContent || '').trim().split(/\s+/).filter(Boolean).length;
    const readTime = Number(readingTimeMinutes || reading_time_minutes) || Math.max(1, Math.ceil(wordCount / 180));

    chapters[idx] = {
      ...existing,
      title_ar: titleAr ?? title ?? existing.title_ar,
      title_en: titleEn ?? title_en ?? existing.title_en,
      subtitle: subtitle ?? existing.subtitle,
      cover_image_url: coverImageUrl ?? existing.cover_image_url,
      content: newContent,
      summary_ar: summaryAr ?? summary ?? existing.summary_ar,
      reading_time_minutes: readTime,
      word_count: wordCount,
      status: status ?? existing.status,
      access_level: accessLevel ?? existing.access_level,
      scheduled_at: scheduledAt ?? existing.scheduled_at,
      updated_at: new Date().toISOString(),
    };

    parsedMeta.chapters = chapters;
    const totalWordCount = chapters.reduce((sum, ch) => sum + (ch.word_count || 0), 0);
    const totalReadTime = chapters.reduce((sum, ch) => sum + (ch.reading_time_minutes || 0), 0);

    const { error: updateErr } = await supabaseAdmin
      .from('stories')
      .update({
        content: JSON.stringify(parsedMeta),
        word_count: totalWordCount,
        read_time_minutes: totalReadTime,
      })
      .eq('id', id);

    if (updateErr) return res.status(400).json({ error: updateErr.message });

    await logAdminAction(req.user!.id, 'chapter_updated', 'chapter', chapterId, { storyId: id });
    return res.json({ success: true, chapter: chapters[idx] });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.delete('/stories/:id/chapters/:chapterId', async (req, res) => {
  try {
    const { id, chapterId } = req.params;
    const { data: story, error } = await supabaseAdmin.from('stories').select('*').eq('id', id).maybeSingle();
    if (error || !story) return res.status(404).json({ error: 'العمل غير موجود' });

    let parsedMeta: any = {};
    let chapters: any[] = [];
    try {
      if (story.content && story.content.trim().startsWith('{')) {
        parsedMeta = JSON.parse(story.content);
        if (Array.isArray(parsedMeta.chapters)) chapters = parsedMeta.chapters;
      }
    } catch {}

    chapters = chapters.filter((c) => c.id !== chapterId);
    chapters.forEach((c, index) => {
      c.chapter_number = index + 1;
    });

    parsedMeta.chapters = chapters;
    const totalWordCount = chapters.reduce((sum, ch) => sum + (ch.word_count || 0), 0);
    const totalReadTime = chapters.reduce((sum, ch) => sum + (ch.reading_time_minutes || 0), 0);

    await supabaseAdmin
      .from('stories')
      .update({
        content: JSON.stringify(parsedMeta),
        word_count: totalWordCount,
        read_time_minutes: totalReadTime,
      })
      .eq('id', id);

    await logAdminAction(req.user!.id, 'chapter_deleted', 'chapter', chapterId, { storyId: id });
    return res.json({ success: true, message: 'تم حذف الفصل بنجاح', remainingCount: chapters.length });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.put('/stories/:id/chapters/reorder', async (req, res) => {
  try {
    const { id } = req.params;
    const { orderedChapterIds } = req.body;
    if (!Array.isArray(orderedChapterIds)) {
      return res.status(400).json({ error: 'قائمة ترتيب الفصول مطلوبة' });
    }

    const { data: story, error } = await supabaseAdmin.from('stories').select('*').eq('id', id).maybeSingle();
    if (error || !story) return res.status(404).json({ error: 'العمل غير موجود' });

    let parsedMeta: any = {};
    let chapters: any[] = [];
    try {
      if (story.content && story.content.trim().startsWith('{')) {
        parsedMeta = JSON.parse(story.content);
        if (Array.isArray(parsedMeta.chapters)) chapters = parsedMeta.chapters;
      }
    } catch {}

    const chapterMap = new Map(chapters.map((c) => [c.id, c]));
    const reordered: any[] = [];
    orderedChapterIds.forEach((chapId, idx) => {
      const ch = chapterMap.get(chapId);
      if (ch) {
        ch.chapter_number = idx + 1;
        reordered.push(ch);
      }
    });

    chapters.forEach((c) => {
      if (!orderedChapterIds.includes(c.id)) {
        c.chapter_number = reordered.length + 1;
        reordered.push(c);
      }
    });

    parsedMeta.chapters = reordered;
    await supabaseAdmin.from('stories').update({ content: JSON.stringify(parsedMeta) }).eq('id', id);

    return res.json({ success: true, message: 'تم إعادة ترتيب الفصول بنجاح', chapters: reordered });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// 6. ORIGINALS & SELECTED IP MANAGEMENT
// ---------------------------------------------------------------------------
router.get('/ip-records', async (_req, res) => {
  try {
    const { data: logs } = await supabaseAdmin
      .from('audit_logs')
      .select('*')
      .eq('resource_type', 'ip_record')
      .order('created_at', { ascending: false });

    const records = (logs || []).map((l) => ({
      id: l.resource_id,
      ...(l.metadata || {}),
      createdAt: l.created_at,
    }));

    return res.json(records);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.post('/ip-records', async (req, res) => {
  try {
    const { ipName, classification, owner, rightsHolder, licenseDocRef, licenseStartDate, licenseEndDate, exclusivity, commercialTerms } = req.body;

    if (!ipName || !classification) {
      return res.status(400).json({ error: 'اسم الملكية الفكرية ونوع التصنيف مطلوبان' });
    }

    const recordId = `ip_${Date.now()}`;
    const ipData = {
      id: recordId,
      ipName: ipName.trim(),
      classification, // 'original' | 'hekayaty_selected'
      owner: owner || 'شركة حكاياتي للنشر والإنتاج الرقمي',
      rightsHolder: rightsHolder || 'حكاياتي',
      licenseDocRef: licenseDocRef || 'HKY-LIC-2026-OFFICIAL',
      licenseStartDate: licenseStartDate || new Date().toISOString().split('T')[0],
      licenseEndDate: licenseEndDate || null,
      exclusivity: exclusivity ?? true,
      commercialTerms: commercialTerms || 'حقوق نشر وتوزيع حصرية تشمل الكوميكس والروايات والألعاب التكتيكية',
    };

    await logAdminAction(req.user!.id, 'ip_record_registered', 'ip_record', recordId, ipData);
    return res.status(201).json({ success: true, ipRecord: ipData });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// 7. USER MANAGEMENT (SUSPEND, ACTIVATE, ROLES)
// ---------------------------------------------------------------------------
router.put('/users/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({ is_active: !!isActive, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });

    await logAdminAction(req.user!.id, isActive ? 'user_reactivated' : 'user_suspended', 'user', id);
    return res.json({ success: true, message: `تم تحديث حالة المستخدم بنجاح`, user: data });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// 8. CREATOR & PUBLISHING HOUSE APPLICATIONS
// ---------------------------------------------------------------------------
router.get('/creator-applications', async (_req, res) => {
  try {
    const { data: logs, error } = await supabaseAdmin
      .from('audit_logs')
      .select('*')
      .eq('action', 'creator_application_submitted')
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });

    return res.json(
      (logs || []).map((l) => ({
        id: l.id,
        userId: l.user_id,
        ...(l.metadata || {}),
        createdAt: l.created_at,
      }))
    );
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.put('/creator-applications/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { decision, requestedType, feedbackNotes } = req.body;

    if (decision === 'approved') {
      const assignedRole = requestedType === 'publishing_house' ? 'publishing_house' : 'writer';
      await supabaseAdmin.from('profiles').update({ role: assignedRole }).eq('id', userId);
    }

    await logAdminAction(req.user!.id, `creator_application_${decision}`, 'creator_application', userId, {
      decision,
      feedbackNotes,
    });

    return res.json({ success: true, message: `تم اتخاذ القرار (${decision}) بنجاح.` });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// 9. FINANCIAL OPERATIONS & EXPENSES
// ---------------------------------------------------------------------------
router.get('/financials/overview', async (_req, res) => {
  try {
    const [ordersRes, expensesRes] = await Promise.all([
      supabaseAdmin.from('orders').select('*'),
      supabaseAdmin.from('audit_logs').select('*').eq('resource_type', 'expense'),
    ]);

    const orders = ordersRes.data || [];
    const expenses = (expensesRes.data || []).map((e) => e.metadata || {});

    const grossRevenue = orders.reduce((acc, o) => acc + (Number(o.total_amount_egp) || 0), 0);
    const totalExpenses = expenses.reduce((acc, e) => acc + (Number(e.amount) || 0), 0);
    const platformCommission = grossRevenue * 0.15;
    const writerRoyalties = grossRevenue * 0.85;

    return res.json({
      grossRevenue,
      platformCommission,
      writerRoyalties,
      totalExpenses,
      netProfit: platformCommission - totalExpenses,
      recentTransactions: orders.slice(0, 15),
      expenses: expenses.slice(0, 15),
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.post('/financials/expenses', async (req, res) => {
  try {
    const { title, category, amount, currency, notes, vendor } = req.body;
    if (!title || !amount) return res.status(400).json({ error: 'عنوان المصروف والقيمة مطلوبان' });

    const expenseId = `exp_${Date.now()}`;
    const payload = {
      id: expenseId,
      title: title.trim(),
      category: category || 'operational',
      amount: Number(amount),
      currency: currency || 'EGP',
      vendor: vendor || '',
      notes: notes || '',
      date: new Date().toISOString(),
      recordedBy: req.user!.displayName,
    };

    await logAdminAction(req.user!.id, 'expense_recorded', 'expense', expenseId, payload);
    return res.status(201).json({ success: true, expense: payload });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// 10. COMMERCE: PRODUCTS & INVENTORY
// ---------------------------------------------------------------------------
router.get('/products', async (_req, res) => {
  const { data, error } = await supabaseAdmin.from('products').select('*').order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data || []);
});

router.post('/products', async (req, res) => {
  try {
    const { nameAr, nameEn, descriptionAr, priceEgp, isDigital, contentType, stockCount, coverUrl } = req.body;
    if (!nameAr || priceEgp === undefined) return res.status(400).json({ error: 'اسم المنتج والسعر مطلوبان' });

    const payload = {
      name_ar: nameAr.trim(),
      name_en: nameEn?.trim() || nameAr.trim(),
      description_ar: descriptionAr || '',
      price_egp: Number(priceEgp),
      is_digital: !!isDigital,
      content_type: contentType || 'comic',
      stock_count: isDigital ? null : Number(stockCount) || 50,
      cover_url: coverUrl || '/assets/generated_images/comic_1.jpg',
    };

    const { data, error } = await supabaseAdmin.from('products').insert(payload).select().single();
    if (error) return res.status(400).json({ error: error.message });

    await logAdminAction(req.user!.id, 'product_created', 'product', String(data.id), { nameAr, priceEgp });
    return res.status(201).json({ success: true, product: data });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.put('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nameAr, nameEn, descriptionAr, priceEgp, isDigital, contentType, stockCount, coverUrl } = req.body;

    const updates: any = {};
    if (nameAr) updates.name_ar = nameAr.trim();
    if (nameEn) updates.name_en = nameEn.trim();
    if (descriptionAr !== undefined) updates.description_ar = descriptionAr;
    if (priceEgp !== undefined) updates.price_egp = Number(priceEgp);
    if (isDigital !== undefined) updates.is_digital = !!isDigital;
    if (contentType !== undefined) updates.content_type = contentType;
    if (stockCount !== undefined) updates.stock_count = isDigital ? null : Number(stockCount);
    if (coverUrl !== undefined) updates.cover_url = coverUrl;

    const { data, error } = await supabaseAdmin.from('products').update(updates).eq('id', id).select().single();
    if (error) return res.status(400).json({ error: error.message });

    await logAdminAction(req.user!.id, 'product_updated', 'product', String(id), updates);
    return res.json({ success: true, product: data });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.delete('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabaseAdmin.from('products').delete().eq('id', id);
    if (error) return res.status(400).json({ error: error.message });

    await logAdminAction(req.user!.id, 'product_deleted', 'product', String(id));
    return res.json({ success: true, message: 'تم حذف المنتج بنجاح' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// 11. AUDIT LOGS SEARCH
// ---------------------------------------------------------------------------
router.get('/audit-logs', async (_req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('audit_logs')
      .select('*, profiles(email, display_name)')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) return res.status(500).json({ error: error.message });
    return res.json(data || []);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// 12. GLOBAL ADMINISTRATIVE SEARCH
// ---------------------------------------------------------------------------
router.get('/search', async (req, res) => {
  try {
    const query = String(req.query.q || '').trim();
    if (!query) return res.json({ users: [], comics: [], stories: [], characters: [], worlds: [] });

    const [uRes, cRes, sRes, chRes, wRes] = await Promise.all([
      supabaseAdmin.from('profiles').select('id, email, display_name, role').ilike('display_name', `%${query}%`).limit(5),
      supabaseAdmin.from('comics').select('id, title_ar, classification').ilike('title_ar', `%${query}%`).limit(5),
      supabaseAdmin.from('stories').select('id, title_ar, classification').ilike('title_ar', `%${query}%`).limit(5),
      supabaseAdmin.from('characters').select('id, name_ar, alignment').ilike('name_ar', `%${query}%`).limit(5),
      supabaseAdmin.from('worlds').select('id, name_ar').ilike('name_ar', `%${query}%`).limit(5),
    ]);

    return res.json({
      users: uRes.data || [],
      comics: cRes.data || [],
      stories: sRes.data || [],
      characters: chRes.data || [],
      worlds: wRes.data || [],
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// 13. COMIC SERIES MANAGEMENT
// ---------------------------------------------------------------------------
router.get('/series', async (_req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('series')
      .select('*, worlds(name_ar)')
      .order('created_at', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data || []);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.post('/series', async (req, res) => {
  try {
    const { id, titleAr, titleEn, descriptionAr, coverImageUrl, worldId, publisherId, classification, genresAr } = req.body;
    if (!titleAr) return res.status(400).json({ error: 'عنوان السلسلة بالعربية مطلوب' });

    const seriesId = id || `series_${Date.now()}`;
    const payload = {
      id: seriesId,
      title_ar: titleAr.trim(),
      title_en: titleEn?.trim() || titleAr.trim(),
      description_ar: descriptionAr || '',
      cover_image_url: coverImageUrl || '',
      world_id: worldId || null,
      publisher_id: publisherId || null,
      classification: ['original', 'hekayaty_selected', 'official_collaboration'].includes(classification)
        ? classification
        : 'original',
      genres_ar: Array.isArray(genresAr) ? genresAr : [],
      status: 'ongoing',
      issue_count: 0,
    };

    const { data, error } = await supabaseAdmin.from('series').insert(payload).select().single();
    if (error) return res.status(400).json({ error: error.message });

    await logAdminAction(req.user!.id, 'series_created', 'series', seriesId, { titleAr });
    return res.status(201).json({ success: true, series: data });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.put('/series/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { titleAr, titleEn, descriptionAr, coverImageUrl, worldId, publisherId, classification, genresAr, status, issueCount } = req.body;

    const updates: any = {};
    if (titleAr) updates.title_ar = titleAr.trim();
    if (titleEn) updates.title_en = titleEn.trim();
    if (descriptionAr !== undefined) updates.description_ar = descriptionAr;
    if (coverImageUrl !== undefined) updates.cover_image_url = coverImageUrl;
    if (worldId !== undefined) updates.world_id = worldId || null;
    if (publisherId !== undefined) updates.publisher_id = publisherId || null;
    if (classification) updates.classification = classification;
    if (genresAr) updates.genres_ar = genresAr;
    if (status) updates.status = status;
    if (issueCount !== undefined) updates.issue_count = Number(issueCount);

    const { data, error } = await supabaseAdmin.from('series').update(updates).eq('id', id).select().single();
    if (error) return res.status(400).json({ error: error.message });

    await logAdminAction(req.user!.id, 'series_updated', 'series', id, updates);
    return res.json({ success: true, series: data });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.delete('/series/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabaseAdmin.from('series').delete().eq('id', id);
    if (error) return res.status(400).json({ error: error.message });

    await logAdminAction(req.user!.id, 'series_deleted', 'series', id);
    return res.json({ success: true, message: 'تم حذف السلسلة بنجاح' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// 14. COMIC PAGES MANAGEMENT STUDIO
// ---------------------------------------------------------------------------
router.get('/comics/:id/pages', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabaseAdmin
      .from('comic_pages')
      .select('*')
      .eq('comic_id', id)
      .order('page_number', { ascending: true });

    if (error) return res.status(500).json({ error: error.message });
    return res.json(data || []);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.post('/comics/:id/pages', async (req, res) => {
  try {
    const { id } = req.params;
    const { pages, pageNumber, imageUrl, cloudinaryPagePublicId, isPreview } = req.body;

    let insertedCount = 0;

    if (Array.isArray(pages) && pages.length > 0) {
      // Bulk insert/replace pages
      const rows = pages.map((p, index) => ({
        comic_id: id,
        page_number: p.pageNumber || index + 1,
        image_url: p.imageUrl,
        cloudinary_page_public_id: p.cloudinaryPagePublicId || null,
        is_preview: !!p.isPreview,
      }));

      // Delete existing pages if replace mode requested
      if (req.body.replace) {
        await supabaseAdmin.from('comic_pages').delete().eq('comic_id', id);
      }

      const { data, error } = await supabaseAdmin.from('comic_pages').upsert(rows, { onConflict: 'comic_id,page_number' }).select();
      if (error) return res.status(400).json({ error: error.message });
      insertedCount = data?.length || rows.length;
    } else if (imageUrl) {
      // Single page
      const pNum = Number(pageNumber) || 1;
      const row = {
        comic_id: id,
        page_number: pNum,
        image_url: imageUrl,
        cloudinary_page_public_id: cloudinaryPagePublicId || null,
        is_preview: !!isPreview,
      };

      const { error } = await supabaseAdmin.from('comic_pages').upsert(row, { onConflict: 'comic_id,page_number' });
      if (error) return res.status(400).json({ error: error.message });
      insertedCount = 1;
    } else {
      return res.status(400).json({ error: 'يجب توفير روابط الصفحات المرفوعة' });
    }

    // Update total page count on comics table
    const { count } = await supabaseAdmin.from('comic_pages').select('*', { count: 'exact', head: true }).eq('comic_id', id);
    if (count !== null) {
      await supabaseAdmin.from('comics').update({ page_count: count }).eq('id', id);
    }

    await logAdminAction(req.user!.id, 'comic_pages_uploaded', 'comic', id, { count: insertedCount });
    return res.status(201).json({ success: true, message: `تم حفظ ${insertedCount} صفحة كوميكس بنجاح!` });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.delete('/comics/:id/pages/:pageId', async (req, res) => {
  try {
    const { id, pageId } = req.params;
    const { error } = await supabaseAdmin.from('comic_pages').delete().eq('id', pageId).eq('comic_id', id);
    if (error) return res.status(400).json({ error: error.message });

    const { count } = await supabaseAdmin.from('comic_pages').select('*', { count: 'exact', head: true }).eq('comic_id', id);
    if (count !== null) {
      await supabaseAdmin.from('comics').update({ page_count: count }).eq('id', id);
    }

    await logAdminAction(req.user!.id, 'comic_page_deleted', 'comic', id, { pageId });
    return res.json({ success: true, message: 'تم حذف الصفحة بنجاح' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.put('/comics/:id/pages/reorder', async (req, res) => {
  try {
    const { id } = req.params;
    const { pageOrders } = req.body; // array of { id, page_number }
    if (!Array.isArray(pageOrders)) {
      return res.status(400).json({ error: 'بيانات ترتيب الصفحات مطلوبة' });
    }

    for (const p of pageOrders) {
      await supabaseAdmin
        .from('comic_pages')
        .update({ page_number: p.page_number })
        .eq('id', p.id)
        .eq('comic_id', id);
    }

    await logAdminAction(req.user!.id, 'comic_pages_reordered', 'comic', id, { count: pageOrders.length });
    return res.json({ success: true, message: 'تم إعادة ترتيب صفحات الكوميكس بنجاح' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.post('/publications/bulk-status', async (req, res) => {
  try {
    const { ids, status, type } = req.body;
    if (!Array.isArray(ids) || ids.length === 0 || !status) {
      return res.status(400).json({ error: 'معرفات المنشورات والحالة مطلوبة' });
    }

    const itemType = (type === 'comic' ? 'comic' : 'story') as 'comic' | 'story';
    for (const pubId of ids) {
      setPublicationStatus(pubId, itemType, status);
    }

    await logAdminAction(req.user!.id, 'bulk_status_updated', type || 'publication', ids.join(','), { status, count: ids.length });
    return res.json({ success: true, message: `تم تحديث حالة ${ids.length} عمل بنجاح إلى: ${status}` });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Final Publication Publishing Endpoint with Validation & Audit Log
router.post('/publications/:id/publish', async (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.body; // 'story' | 'comic'
    const adminId = req.user?.id || 'admin_user';

    if (type === 'comic') {
      const { data: comic, error: fetchErr } = await supabaseAdmin.from('comics').select('*').eq('id', id).maybeSingle();
      if (fetchErr || !comic) return res.status(404).json({ error: 'العمل المصور غير موجود' });

      // Validation: comic must have at least 1 page or a PDF document
      const { data: pages } = await supabaseAdmin.from('comic_pages').select('id').eq('comic_id', id);
      const hasPages = pages && pages.length > 0;
      let hasPdf = false;
      try {
        if (comic.synopsis_ar && comic.synopsis_ar.includes('pdf_url')) hasPdf = true;
      } catch {}

      if (!hasPages && !hasPdf) {
        return res.status(400).json({ error: 'لا يمكن نشر الكوميكس قبل رفع صفحات العمل أو ربط ملف PDF تفاعلي' });
      }

      const publishedAt = new Date().toISOString();
      setPublicationStatus(id, 'comic', 'published', { publishedAt, publishedBy: adminId });

      await logAdminAction(adminId, 'publication_published', 'comic', id, {
        title: comic.title_ar || comic.title_en,
        publishedAt,
      });

      return res.json({
        success: true,
        message: '🎉 تم نشر القصة المصورة بنجاح وإتاحتها لجمهور حكاياتي!',
        status: 'published',
        publishedAt,
        publication: { ...comic, status: 'published' },
      });
    } else {
      // Story / Novel
      const { data: story, error: fetchErr } = await supabaseAdmin.from('stories').select('*').eq('id', id).maybeSingle();
      if (fetchErr || !story) return res.status(404).json({ error: 'الرواية/القصة غير موجودة' });

      // Check chapters or content
      let hasContent = false;
      try {
        if (story.content && story.content.trim().startsWith('{')) {
          const parsed = JSON.parse(story.content);
          if (Array.isArray(parsed.chapters) && parsed.chapters.length > 0) {
            const validChap = parsed.chapters.some((c: any) => c.content && c.content.trim().length > 10);
            if (validChap || parsed.pdf_url) hasContent = true;
          }
        } else if (story.content && story.content.trim().length > 10) {
          hasContent = true;
        }
      } catch {}

      if (!hasContent) {
        return res.status(400).json({ error: 'لا يمكن نشر الرواية قبل كتابة وإضافة محتوى فصل واحد على الأقل أو رفع ملف PDF' });
      }

      const publishedAt = new Date().toISOString();
      setPublicationStatus(id, 'story', 'published', { publishedAt, publishedBy: adminId });

      await logAdminAction(adminId, 'publication_published', 'story', id, {
        title: story.title_ar || story.title_en,
        publishedAt,
      });

      return res.json({
        success: true,
        message: '🎉 تم اعتماد ونشر الرواية بنجاح وإتاحتها للجمهور!',
        status: 'published',
        publishedAt,
        publication: { ...story, status: 'published' },
      });
    }
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// 15. REUSABLE POWERS & ABILITIES LIBRARY
// ---------------------------------------------------------------------------
const DEFAULT_POWERS = [
  { id: 'p_super_strength', nameAr: 'القوة الخارقة', nameEn: 'Super Strength', category: 'جسدي', descriptionAr: 'قدرة فائقة على تحطيم المعادن ورفع أطنان هائلة تفوق قدرة البشر.', icon: '💪', level: 90, weaknesses: 'المجالات المضادة للجاذبية' },
  { id: 'p_light_speed', nameAr: 'سرعة البرق', nameEn: 'Light Speed', category: 'حركي', descriptionAr: 'التنقل بسرعة تفوق الصوت مع ردود أفعال لحظية متناهية الدقة.', icon: '⚡', level: 85, weaknesses: 'الاحتكاك الشديد والمستنقعات الكثيفة' },
  { id: 'p_cosmic_fire', nameAr: 'اللهب الأسطوري', nameEn: 'Cosmic Fire', category: 'عنصري', descriptionAr: 'إطلاق ألسنة لهب أرجوانية تحرق الطاقة السحرية والكيانات الأثيرية.', icon: '🔥', level: 95, weaknesses: 'الماء الميتافيزيقي والجليد الأزلي' },
  { id: 'p_telepathy', nameAr: 'التخاطر العقلي', nameEn: 'Telepathy', category: 'ذهني', descriptionAr: 'قراءة أفكار الخصوم والتواصل الذهني وتثبيط العقول المعادية.', icon: '🧠', level: 80, weaknesses: 'الدروع الفكرية والخوذات المعزولة' },
  { id: 'p_shadow_walk', nameAr: 'التحكم بالظلال', nameEn: 'Shadow Manipulation', category: 'أثيري', descriptionAr: 'الانتقال عبر الأبعاد المظلمة وتشكيل أسلحة ودروع من العتمة الخالصة.', icon: '🌑', level: 88, weaknesses: 'الضوء الأسطوري الشديد' },
  { id: 'p_healing_factor', nameAr: 'التجدد الذاتي', nameEn: 'Regeneration Factor', category: 'جسدي', descriptionAr: 'التئام فوري للجروح والكسور ومقاومة السموم والأوبئة الفتاكة.', icon: '✨', level: 85, weaknesses: 'حروق البلازما المستمرة' },
  { id: 'p_reality_warp', nameAr: 'طمس الواقع', nameEn: 'Reality Warping', category: 'خارق', descriptionAr: 'إعادة تشكيل المادة والزمكان على نطاق موضعي بحسب الإرادة.', icon: '🌌', level: 99, weaknesses: 'استنزاف الطاقة الروحية الهائل' },
  { id: 'p_combat_mastery', nameAr: 'سيد الفنون القتالية', nameEn: 'Combat Mastery', category: 'مهاري', descriptionAr: 'إتقان تام لكافة أساليب القتال بالسلاح والالتحام الجسدي المباشر.', icon: '⚔️', level: 75, weaknesses: 'الهجمات بعيدة المدى' },
];

router.get('/powers', async (_req, res) => {
  try {
    const { data: customLogs } = await supabaseAdmin
      .from('audit_logs')
      .select('*')
      .eq('resource_type', 'power')
      .order('created_at', { ascending: false });

    const customPowers = (customLogs || []).map((l) => ({
      id: l.resource_id,
      ...l.metadata,
      createdAt: l.created_at,
    }));

    const allPowers = [...DEFAULT_POWERS];
    customPowers.forEach((cp) => {
      if (!allPowers.some((p) => p.id === cp.id)) {
        allPowers.push(cp);
      }
    });

    return res.json(allPowers);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.post('/powers', async (req, res) => {
  try {
    const { nameAr, nameEn, category, descriptionAr, icon, level, weaknesses } = req.body;
    if (!nameAr) return res.status(400).json({ error: 'اسم القدرة بالعربية مطلوب' });

    const powerId = `p_${Date.now()}`;
    const payload = {
      id: powerId,
      nameAr: nameAr.trim(),
      nameEn: nameEn?.trim() || nameAr.trim(),
      category: category || 'عام',
      descriptionAr: descriptionAr || '',
      icon: icon || '✨',
      level: Number(level) || 75,
      weaknesses: weaknesses || '',
    };

    await logAdminAction(req.user!.id, 'create_power', 'power', powerId, payload);
    return res.status(201).json({ success: true, power: payload, message: 'تم حفظ القدرة بنجاح في المكتبة العامة!' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// 16. TIMELINE EVENTS STUDIO
// ---------------------------------------------------------------------------
router.get('/timeline', async (_req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('timeline_events')
      .select('*')
      .order('year', { ascending: true });
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data || []);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.post('/timeline', async (req, res) => {
  try {
    const { id, titleAr, titleEn, year, era, descriptionAr, category, impact, characterIds, worldIds, imageUrl } = req.body;
    if (!titleAr || !year) return res.status(400).json({ error: 'عنوان الحدث والسنة مطلوبان' });

    const eventId = id || `t_${Date.now()}`;
    const payload = {
      id: eventId,
      title_ar: titleAr.trim(),
      title_en: titleEn?.trim() || titleAr.trim(),
      year: String(year),
      era: ['ancient', 'classical', 'modern', 'future'].includes(era) ? era : 'classical',
      description_ar: descriptionAr || '',
      category: ['catastrophe', 'creation', 'conflict', 'political', 'discovery', 'resurgence', 'expansion'].includes(category) ? category : 'conflict',
      impact: ['minor', 'major', 'legendary'].includes(impact) ? impact : 'major',
      character_ids: Array.isArray(characterIds) ? characterIds : [],
      world_ids: Array.isArray(worldIds) ? worldIds : [],
      image_url: imageUrl || '',
    };

    const { data, error } = await supabaseAdmin.from('timeline_events').insert(payload).select().single();
    if (error) return res.status(400).json({ error: error.message });

    await logAdminAction(req.user!.id, 'timeline_created', 'timeline_event', eventId, { titleAr });
    return res.status(201).json({ success: true, event: data });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.put('/timeline/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { titleAr, titleEn, year, era, descriptionAr, category, impact, characterIds, worldIds, imageUrl } = req.body;

    const updates: any = {};
    if (titleAr) updates.title_ar = titleAr.trim();
    if (titleEn) updates.title_en = titleEn.trim();
    if (year) updates.year = String(year);
    if (era) updates.era = era;
    if (descriptionAr !== undefined) updates.description_ar = descriptionAr;
    if (category) updates.category = category;
    if (impact) updates.impact = impact;
    if (characterIds) updates.character_ids = characterIds;
    if (worldIds) updates.world_ids = worldIds;
    if (imageUrl !== undefined) updates.image_url = imageUrl;

    const { data, error } = await supabaseAdmin.from('timeline_events').update(updates).eq('id', id).select().single();
    if (error) return res.status(400).json({ error: error.message });

    await logAdminAction(req.user!.id, 'timeline_updated', 'timeline_event', id, updates);
    return res.json({ success: true, event: data });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.delete('/timeline/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabaseAdmin.from('timeline_events').delete().eq('id', id);
    if (error) return res.status(400).json({ error: error.message });

    await logAdminAction(req.user!.id, 'timeline_deleted', 'timeline_event', id);
    return res.json({ success: true, message: 'تم حذف الحدث الزمني بنجاح' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// 17. CREATORS & LINKED ACCOUNTS DIRECTORY
// ---------------------------------------------------------------------------
router.get('/creators-directory', async (_req, res) => {
  try {
    const [profilesRes, creatorsRes] = await Promise.all([
      supabaseAdmin
        .from('profiles')
        .select('id, display_name, email, role, avatar_url, bio, is_active')
        .in('role', ['writer', 'publishing_house']),
      supabaseAdmin
        .from('creators')
        .select('*'),
    ]);

    const registeredAccounts = (profilesRes.data || []).map((p) => ({
      id: p.id,
      name: p.display_name,
      email: p.email,
      role: p.role,
      avatarUrl: p.avatar_url,
      bio: p.bio,
      isRegisteredUser: true,
    }));

    const standaloneCreators = (creatorsRes.data || []).map((c) => ({
      id: c.id,
      name: c.name_ar,
      nameEn: c.name_en,
      role: c.type,
      avatarUrl: c.avatar_url,
      bio: c.bio,
      isRegisteredUser: !!c.user_id,
      userId: c.user_id,
    }));

    return res.json({
      registeredAccounts,
      standaloneCreators,
      allWriters: registeredAccounts.filter((a) => a.role === 'writer'),
      allPublishingHouses: registeredAccounts.filter((a) => a.role === 'publishing_house'),
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
