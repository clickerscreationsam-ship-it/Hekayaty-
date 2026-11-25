import { Router, type IRouter } from 'express';
import { supabaseAdmin } from '../lib/supabase';

const router: IRouter = Router();

// ---------------------------------------------------------------------------
// GET /api/search?q=query  — searches all content tables in Supabase
// ---------------------------------------------------------------------------
router.get('/search', async (req, res) => {
  const query = String(req.query.q || '').trim();

  if (!query) {
    return res.json({
      characters: [],
      comics: [],
      worlds: [],
      stories: [],
      lore: [],
    });
  }

  try {
    const pattern = `%${query}%`;

    const [charRes, comicRes, worldRes, storyRes, loreRes] = await Promise.all([
      supabaseAdmin
        .from('characters')
        .select('*')
        .or(`name_ar.ilike.${pattern},name_en.ilike.${pattern},alias_ar.ilike.${pattern}`)
        .limit(5),
      supabaseAdmin
        .from('comics')
        .select('*')
        .or(`title_ar.ilike.${pattern},title_en.ilike.${pattern},synopsis_ar.ilike.${pattern}`)
        .limit(5),
      supabaseAdmin
        .from('worlds')
        .select('*')
        .or(`name_ar.ilike.${pattern},name_en.ilike.${pattern},ruler_ar.ilike.${pattern}`)
        .limit(5),
      supabaseAdmin
        .from('stories')
        .select('*')
        .or(`title_ar.ilike.${pattern},title_en.ilike.${pattern},author_ar.ilike.${pattern}`)
        .limit(5),
      supabaseAdmin
        .from('encyclopedia_entries')
        .select('*')
        .or(`title_ar.ilike.${pattern},title_en.ilike.${pattern}`)
        .limit(5),
    ]);

    const characters = (charRes.data || []).map((c: any) => ({
      ...c, nameAr: c.name_ar, nameEn: c.name_en, aliasAr: c.alias_ar,
      image: c.image_url, imageUrl: c.image_url, worldId: c.world_id,
    }));
    const comics = (comicRes.data || []).map((c: any) => ({
      ...c, titleAr: c.title_ar, titleEn: c.title_en, synopsisAr: c.synopsis_ar,
      coverImage: c.cover_image_url, imageUrl: c.cover_image_url, worldId: c.world_id,
    }));
    const worlds = (worldRes.data || []).map((w: any) => ({
      ...w, nameAr: w.name_ar, nameEn: w.name_en, rulerAr: w.ruler_ar,
      image: w.image_url, imageUrl: w.image_url,
    }));
    const stories = (storyRes.data || []).map((s: any) => ({
      ...s, titleAr: s.title_ar, titleEn: s.title_en, authorAr: s.author_ar,
      coverImage: s.cover_image_url, imageUrl: s.cover_image_url, worldId: s.world_id,
    }));
    const lore = (loreRes.data || []).map((e: any) => ({
      ...e, titleAr: e.title_ar, titleEn: e.title_en,
      descriptionAr: e.description_ar, image: e.image_url, imageUrl: e.image_url,
    }));

    return res.json({
      totalResults: characters.length + comics.length + worlds.length + stories.length + lore.length,
      characters,
      comics,
      worlds,
      stories,
      lore,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
