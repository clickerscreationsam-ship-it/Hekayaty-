import { Router, type IRouter } from 'express';
import { requireAuth, requireRole } from '../middlewares/auth';
import { supabaseAdmin } from '../lib/supabase';

export const mysteryRouter: IRouter = Router();
export const adminMysteryRouter: IRouter = Router();

// ---------------------------------------------------------------------------
// DEFAULT SEED EPISODES (Initial Canon Episodes for Hekayaty Daily Mystery)
// ---------------------------------------------------------------------------
const SEED_EPISODES = [
  {
    id: 'ep-001',
    slug: 'episode-001',
    episode_number: 1,
    series_title_ar: 'لغز حكاياتي: أسرار المخطوطة الغارقة',
    series_title_en: 'Mystery of Hekayaty: Secrets of the Sunken Manuscript',
    title_ar: 'الحلقة الأولى: همسات من وراء المرآة العتيقة',
    title_en: 'Episode 1: Whispers Behind the Ancient Mirror',
    short_description_ar: 'في ليلة مقمرة عند منتصف الليل، استيقظ حارس المكتبة الملكية على صوت نبضات خافتة تنبعث من المرآة السحرية المكسورة... رسالة غامضة محفورة بدماء ضوئية بدأت تتشكل على الزجاج.',
    content_ar: `في ليلة مقمرة عند منتصف الليل، استيقظ حارس المكتبة الملكية الأثرية على صوت نبضات خافتة تنبعث من القاعة المحرمة.

لم يكن الصوت مجرد صرير خشب قديم، بل كان يشبه دقات قلب كائن عملاق محبوس في جدران القلعة. تقدم الحارس بخطوات بطيئة وحذرة، حاملاً قنديل الزيت النحاسي الذي كان نوره يرتعش مع كل خطوة.

عندما وصل إلى نهاية الرواق الشرقي، توقف مذهولاً:
المرآة العتيقة — التي أمر الإمبراطور بحجبها بستار أسود ثقيل منذ قرن مضى — كانت تتوهج بهالة كهرمانية غريبة.

اقترب الحارس وأزاح الستار ببطء... ليجد أن انعكاسه ليس موجوداً في المرآة!
بدلاً من وجهه الشاحب، رأى غرفة مظلمة غارقة في الضباب، وشخصاً يرتدي عباءة داكنة يقف وظهره للمرآة، ممسكاً بيده ريشة تفيض نوراً أزرق وهاجاً.

فجأة، استدار الكيان نحوه... ونقش على صفحة الزجاج بأصابع من نار باردة:
"البوابة السابعة فتحت... وابحث عن البطل الذي فقد ظله قبل شروق الشمس."

تحطمت شظية صغيرة من أسفل المرآة وسقطت على الأرضية الرخامية، تاركة وراءها رماداً متلألئاً وخريطة مصغرة تشير إلى برج الفلكيين...`,
    cover_image_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
    publication_date: '2026-11-25T00:00:00.000Z',
    status: 'published',
    reading_time_minutes: 3,
    author_name: 'هيئة التحرير وسرد الألغاز',
    views_count: 1420,
    likes_count: 312,
    clues: ['المرآة العتيقة', 'الريشة الزرقاء', 'البطل بلا ظل'],
  },
  {
    id: 'ep-002',
    slug: 'episode-002',
    episode_number: 2,
    series_title_ar: 'لغز حكاياتي: أسرار المخطوطة الغارقة',
    series_title_en: 'Mystery of Hekayaty: Secrets of the Sunken Manuscript',
    title_ar: 'الحلقة الثانية: برج الفلكيين والمفتاح النحاسي',
    title_en: 'Episode 2: The Astronomers Tower and the Brass Key',
    short_description_ar: 'تتبع الحارس أثر الرماد المتلألئ حتى وصل إلى أعلى شرفة في برج الفلكيين المهجور... وهناك وجد اسطرلاباً يدور بمفرده ومفتاحاً معلقاً بخيط من حرير فضي.',
    content_ar: `صعد الحارس درجات السلم الحلزوني لبرج الفلكيين، بينما كانت الرياح تعصف بالنوافذ الحجرية العارية.

كان البرج مهجوراً منذ عهد السلالة القديمة، لكن الاسطرلاب النحاسي الضخم في منتصف القاعة كان يدور بسرعة متزايدة وبصوت يشبه عقارب ساعة عملاقة تقترب من الصفر.

في مركز الاسطرلاب، كانت تشير الإبرة نحو كوكب غير مدرج في أي خريطة سماء معروفة لعوالم حكاياتي.
وتحت القرص المتحرك، برزت فجوة صغيرة يتدلى منها مفتاح نحاسي منقوش عليه رمز طائر الفينيق.

عندما مد يده ليمسك بالمفتاح، دوى صوت خطوات ثقيلة خلفه...
التفت بسرعة، فلم يجد أحداً، لكنه وجد ظله على الحائط يبتسم له بحركة لم يفعلها هو بنفسه!

أدرك الحارس الحقيقة المرعبة:
الكيان الذي رآه في المرآة لم يكن كائناً غريباً... بل كان ظله الذي انسلخ عنه وبدأ يكتب قصة أخرى موازية.`,
    cover_image_url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80',
    publication_date: '2026-11-26T00:00:00.000Z',
    status: 'published',
    reading_time_minutes: 4,
    author_name: 'هيئة التحرير وسرد الألغاز',
    views_count: 980,
    likes_count: 245,
    clues: ['الاسطرلاب الذاتي', 'مفتاح الفينيق', 'الظل المنفصل'],
  },
];

// Helper to log mystery action into Supabase audit_logs
async function logMysteryAction(
  userId: string | null,
  action: string,
  resourceId: string,
  metadata: any = {}
) {
  try {
    await supabaseAdmin.from('audit_logs').insert({
      user_id: userId,
      action,
      resource_type: 'mystery_episode',
      resource_id: resourceId,
      metadata,
    });
  } catch (err) {
    console.error('Failed to log mystery action:', err);
  }
}

// Helper: Get all episodes merged with audit_logs & automated schedule resolution
async function getAllEpisodesHydrated() {
  const { data: logs } = await supabaseAdmin
    .from('audit_logs')
    .select('*')
    .eq('resource_type', 'mystery_episode')
    .order('created_at', { ascending: false });

  const deletedIds = new Set<string>();
  const customEpisodesMap = new Map<string, any>();

  (logs || []).forEach((l) => {
    if (l.action === 'delete_episode') {
      deletedIds.add(l.resource_id);
    } else if (l.action === 'create_episode' || l.action === 'update_episode') {
      if (!customEpisodesMap.has(l.resource_id) && !deletedIds.has(l.resource_id)) {
        customEpisodesMap.set(l.resource_id, l.metadata);
      }
    }
  });

  const now = new Date();
  const list: any[] = [];

  // Add custom episodes
  customEpisodesMap.forEach((meta, id) => {
    if (deletedIds.has(id)) return;
    let episode = { ...meta, id };

    // Automatic server-side scheduling transition:
    // If status is 'scheduled' and publication_date <= now, auto-publish!
    if (episode.status === 'scheduled' && episode.publication_date) {
      if (new Date(episode.publication_date) <= now) {
        episode.status = 'published';
      }
    }

    list.push(episode);
  });

  // Merge seed episodes unless overridden or deleted
  SEED_EPISODES.forEach((seed) => {
    if (!deletedIds.has(seed.id) && !customEpisodesMap.has(seed.id)) {
      list.push(seed);
    }
  });

  // Sort descending by episode_number or publication_date
  list.sort((a, b) => (Number(b.episode_number) || 0) - (Number(a.episode_number) || 0));

  return list;
}

// ---------------------------------------------------------------------------
// 1. PUBLIC ENDPOINTS
// ---------------------------------------------------------------------------

// GET /api/mystery/overview — Homepage and main section summary
mysteryRouter.get('/overview', async (req, res) => {
  try {
    const all = await getAllEpisodesHydrated();

    // Published episodes
    const published = all.filter((ep) => ep.status === 'published');
    const latest = published[0] || null;

    // Next scheduled episode
    const now = new Date();
    const scheduled = all
      .filter((ep) => ep.status === 'scheduled' && new Date(ep.publication_date) > now)
      .sort((a, b) => new Date(a.publication_date).getTime() - new Date(b.publication_date).getTime());

    const nextEpisode = scheduled[0] || null;

    return res.json({
      latestEpisode: latest,
      nextScheduledEpisode: nextEpisode ? {
        id: nextEpisode.id,
        episode_number: nextEpisode.episode_number,
        title_ar: nextEpisode.title_ar,
        publication_date: nextEpisode.publication_date,
      } : null,
      totalPublishedEpisodes: published.length,
      recentEpisodes: published.slice(1, 7), // next 6 previous episodes
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/mystery/episodes — Public list of published episodes
mysteryRouter.get('/episodes', async (req, res) => {
  try {
    const all = await getAllEpisodesHydrated();
    const published = all.filter((ep) => ep.status === 'published');
    return res.json(published);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/mystery/episodes/:idOrSlug — Read specific episode
mysteryRouter.get('/episodes/:idOrSlug', async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    const all = await getAllEpisodesHydrated();

    const episode = all.find(
      (ep) => ep.id === idOrSlug || ep.slug === idOrSlug || `episode-${String(ep.episode_number).padStart(3, '0')}` === idOrSlug
    );

    if (!episode) {
      return res.status(404).json({ error: 'الحلقة غير موجودة أو لم تنشر بعد.' });
    }

    // Only allow published episodes for public view
    if (episode.status !== 'published') {
      return res.status(403).json({ error: 'هذه الحلقة مجدولة أو قيد التجهيز ولم تُتح للقراءة العامة بعد.' });
    }

    // Increment views counter asynchronously in background
    logMysteryAction(null, 'view_episode', episode.id, { viewedAt: new Date().toISOString() });

    // Find previous and next published episodes for reader navigation
    const published = all.filter((ep) => ep.status === 'published').sort((a, b) => (a.episode_number || 0) - (b.episode_number || 0));
    const currentIndex = published.findIndex((ep) => ep.id === episode.id);

    const prevEpisode = currentIndex > 0 ? {
      id: published[currentIndex - 1].id,
      slug: published[currentIndex - 1].slug || published[currentIndex - 1].id,
      title_ar: published[currentIndex - 1].title_ar,
      episode_number: published[currentIndex - 1].episode_number,
    } : null;

    const nextEpisode = currentIndex < published.length - 1 ? {
      id: published[currentIndex + 1].id,
      slug: published[currentIndex + 1].slug || published[currentIndex + 1].id,
      title_ar: published[currentIndex + 1].title_ar,
      episode_number: published[currentIndex + 1].episode_number,
    } : null;

    return res.json({
      ...episode,
      prevEpisode,
      nextEpisode,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/mystery/episodes/:id/like — Like an episode
mysteryRouter.post('/episodes/:id/like', async (req, res) => {
  try {
    const { id } = req.params;
    await logMysteryAction(null, 'like_episode', id, { likedAt: new Date().toISOString() });
    return res.json({ success: true, message: 'تم تسجيل إعجابك بالحلقة!' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// 2. ADMIN MYSTERY MANAGEMENT STUDIO
// ---------------------------------------------------------------------------
adminMysteryRouter.use(requireAuth);
adminMysteryRouter.use(requireRole('admin'));

// GET /api/admin/mystery/episodes — All episodes including drafts and scheduled
adminMysteryRouter.get('/episodes', async (req, res) => {
  try {
    const all = await getAllEpisodesHydrated();
    return res.json(all);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/mystery/episodes — Create new daily episode
adminMysteryRouter.post('/episodes', async (req: any, res) => {
  try {
    const userId = req.user.id;
    const {
      title_ar,
      title_en,
      episode_number,
      series_title_ar,
      series_title_en,
      short_description_ar,
      content_ar,
      cover_image_url,
      publication_date,
      status,
      reading_time_minutes,
      author_name,
      clues,
    } = req.body;

    if (!title_ar || !content_ar) {
      return res.status(400).json({ error: 'عنوان الحلقة ومحتواها الروائي مطلوبان.' });
    }

    const num = Number(episode_number) || 1;
    const episodeId = `ep-${String(num).padStart(3, '0')}-${Date.now().toString(36)}`;
    const slug = `episode-${String(num).padStart(3, '0')}`;

    const metadata = {
      id: episodeId,
      slug,
      episode_number: num,
      series_title_ar: series_title_ar || 'لغز حكاياتي اليومي',
      series_title_en: series_title_en || 'Mystery of Hekayaty',
      title_ar,
      title_en: title_en || '',
      short_description_ar: short_description_ar || '',
      content_ar,
      cover_image_url: cover_image_url || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
      publication_date: publication_date || new Date().toISOString(),
      status: status || 'published',
      reading_time_minutes: Number(reading_time_minutes) || 3,
      author_name: author_name || 'هيئة التحرير وسرد الألغاز',
      clues: Array.isArray(clues) ? clues : [],
      views_count: 0,
      likes_count: 0,
      createdAt: new Date().toISOString(),
    };

    await logMysteryAction(userId, 'create_episode', episodeId, metadata);

    return res.json({
      success: true,
      episode: metadata,
      message: 'تم إنشاء وحفظ الحلقة بنجاح!',
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// PUT /api/admin/mystery/episodes/:id — Update existing episode
adminMysteryRouter.put('/episodes/:id', async (req: any, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const {
      title_ar,
      title_en,
      episode_number,
      series_title_ar,
      series_title_en,
      short_description_ar,
      content_ar,
      cover_image_url,
      publication_date,
      status,
      reading_time_minutes,
      author_name,
      clues,
    } = req.body;

    const num = Number(episode_number) || 1;
    const slug = `episode-${String(num).padStart(3, '0')}`;

    const metadata = {
      id,
      slug,
      episode_number: num,
      series_title_ar: series_title_ar || 'لغز حكاياتي اليومي',
      series_title_en: series_title_en || 'Mystery of Hekayaty',
      title_ar,
      title_en: title_en || '',
      short_description_ar: short_description_ar || '',
      content_ar,
      cover_image_url,
      publication_date,
      status: status || 'published',
      reading_time_minutes: Number(reading_time_minutes) || 3,
      author_name,
      clues: Array.isArray(clues) ? clues : [],
      updatedAt: new Date().toISOString(),
    };

    await logMysteryAction(userId, 'update_episode', id, metadata);

    return res.json({
      success: true,
      episode: metadata,
      message: 'تم تحديث الحلقة بنجاح!',
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// DELETE /api/admin/mystery/episodes/:id — Delete episode
adminMysteryRouter.delete('/episodes/:id', async (req: any, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    await logMysteryAction(userId, 'delete_episode', id, {
      deletedAt: new Date().toISOString(),
      deletedBy: userId,
    });

    return res.json({
      success: true,
      message: 'تم حذف الحلقة نهائياً بنجاح!',
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default mysteryRouter;
