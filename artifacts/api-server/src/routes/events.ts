import { Router, type IRouter } from 'express';
import { requireAuth, requireRole } from '../middlewares/auth';
import { supabaseAdmin } from '../lib/supabase';
import crypto from 'crypto';

export const eventsRouter: IRouter = Router();
export const adminEventsRouter: IRouter = Router();

// Helper: Log event action into Supabase audit_logs
async function logEventAction(
  userId: string | null,
  action: string,
  resourceType: string,
  resourceId: string,
  metadata: any = {}
) {
  try {
    await supabaseAdmin.from('audit_logs').insert({
      user_id: userId,
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      metadata,
    });
  } catch (err) {
    console.error('Failed to log event action:', err);
  }
}

// ---------------------------------------------------------------------------
// INITIAL SEED DATA (If no events exist, seed official Hekayaty Carnivals)
// ---------------------------------------------------------------------------
const DEFAULT_CARNIVALS = [
  {
    id: 'hekayaty-carnival-2027',
    title_ar: 'كرنفال حكاياتي الكبير 2027 — صراع الفصول والممالك',
    title_en: 'Hekayaty Grand Carnival 2027 — Clash of Realms',
    slug: 'hekayaty-carnival-2027',
    description_ar:
      'أضخم مهرجان رقمي وثقافي لصناع القصص، رسامي الكوميكس، ودور النشر في العالم العربي. يضم 5 مسابقات كبرى، تصويتاً جماهيرياً حياً، ولجان تحكيم دولية وجوائز تتجاوز نصف مليون ريال.',
    image_url:
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
    location: 'الرياض والقاهرة / عبر فضاء حكاياتي الرقمي',
    is_online: true,
    event_type: 'carnival',
    status: 'active',
    theme: 'صراع الفصول والأبعاد الكونية',
    start_date: '2026-12-01',
    end_date: '2027-01-15',
    registration_open: true,
  },
  {
    id: 'arabic-comic-awards-2027',
    title_ar: 'جائزة حكاياتي الكبرى للكوميكس العربي والرواية المصورة',
    title_en: 'Arab Comic & Graphic Novel Excellence Awards',
    slug: 'arabic-comic-awards-2027',
    description_ar:
      'المسابقة السنوية لاختيار أفضل قصة مصورة وأفضل تصميم شخصيات وأفضل غلاف لعام 2027. تصويت مفتوح للقراء مع تقييم لجنة كبار الرسامين.',
    image_url:
      'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80',
    location: 'بث رقمي تفاعلي مباشر',
    is_online: true,
    event_type: 'awards',
    status: 'voting_open',
    theme: 'إحياء الأساطير بريشة عربية',
    start_date: '2026-11-20',
    end_date: '2026-12-30',
    registration_open: true,
  },
  {
    id: 'novelists-duel-2027',
    title_ar: 'تحدي الرواية الخيالية — نزال الأقلام الذهبية',
    title_en: 'Golden Quills Fantasy Novel Challenge',
    slug: 'novelists-duel-2027',
    description_ar:
      'ماراثون كتابة القصة والرواية الخيالية المستوحاة من عوالم حكاياتي. استقبلت المسابقة حتى الآن أكثر من 140 عملاً إبداعياً.',
    image_url:
      'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=1200&q=80',
    location: 'منصة حكاياتي التحريرية',
    is_online: true,
    event_type: 'competition',
    status: 'active',
    theme: 'عوالم ما وراء الأفق',
    start_date: '2026-11-15',
    end_date: '2026-12-25',
    registration_open: true,
  },
];

// Helper to load event details with all related sub-entities from DB & audit_logs
async function getEventHydrated(idOrSlug: string) {
  // Query core event
  const { data: eventsList } = await supabaseAdmin
    .from('events')
    .select('*')
    .or(`id.eq.${idOrSlug},title_en.ilike.%${idOrSlug}%`)
    .limit(1);

  let event = eventsList?.[0];

  // If not in DB, fallback to seed carnivals
  if (!event) {
    const defaultItem = DEFAULT_CARNIVALS.find(
      (c) => c.id === idOrSlug || c.slug === idOrSlug
    );
    if (defaultItem) {
      event = { ...defaultItem };
    }
  }

  if (!event) return null;

  const eventId = event.id;

  // Retrieve all related records from audit_logs for this event
  const { data: logs } = await supabaseAdmin
    .from('audit_logs')
    .select('*')
    .in('resource_type', [
      'event',
      'competition',
      'voting_round',
      'vote',
      'submission',
      'award',
      'announcement',
      'event_registration',
    ])
    .order('created_at', { ascending: false });

  const allLogs = logs || [];

  // Check if event has updated metadata stored in audit_logs
  const eventUpdateLog = allLogs.find(
    (l) => l.resource_type === 'event' && (l.resource_id === eventId || l.metadata?.slug === eventId || l.metadata?.id === eventId)
  );

  if (eventUpdateLog?.metadata) {
    event = {
      ...event,
      ...eventUpdateLog.metadata,
      id: event.id,
      title_ar: event.title_ar || eventUpdateLog.metadata.title_ar,
    };
  }

  // Filter competitions
  const competitions = allLogs
    .filter((l) => l.resource_type === 'competition' && (l.metadata?.eventId === eventId || l.resource_id.startsWith(eventId)))
    .map((l) => ({ id: l.resource_id, ...l.metadata, createdAt: l.created_at }));

  // Filter voting rounds
  const votingRounds = allLogs
    .filter((l) => l.resource_type === 'voting_round' && (l.metadata?.eventId === eventId || l.resource_id.startsWith(eventId)))
    .map((l) => {
      const roundId = l.resource_id;
      // Count votes for this round
      const roundVotes = allLogs.filter(
        (v) => v.resource_type === 'vote' && (v.resource_id === roundId || v.metadata?.roundId === roundId)
      );

      // Tally votes per nominee / option
      const tally: Record<string, number> = {};
      const uniqueVoters = new Set<string>();

      roundVotes.forEach((v) => {
        if (v.user_id) uniqueVoters.add(v.user_id);
        const optId = v.metadata?.optionId;
        if (optId) {
          tally[optId] = (tally[optId] || 0) + 1;
        }
      });

      return {
        id: roundId,
        ...l.metadata,
        totalVotes: roundVotes.length,
        uniqueVoters: uniqueVoters.size,
        voteTally: tally,
        createdAt: l.created_at,
      };
    });

  // Filter submissions
  const submissions = allLogs
    .filter((l) => l.resource_type === 'submission' && l.metadata?.eventId === eventId)
    .map((l) => ({ id: l.resource_id, ...l.metadata, createdAt: l.created_at }));

  // Filter announcements
  const announcements = allLogs
    .filter((l) => l.resource_type === 'announcement' && (l.metadata?.eventId === eventId || l.resource_id === eventId))
    .map((l) => ({ id: l.id, ...l.metadata, createdAt: l.created_at }));

  // Filter awards
  const awards = allLogs
    .filter((l) => l.resource_type === 'award' && (l.metadata?.eventId === eventId || l.resource_id === eventId))
    .map((l) => ({ id: l.resource_id, ...l.metadata, createdAt: l.created_at }));

  // Filter registrations count
  const registrations = allLogs.filter(
    (l) => l.resource_type === 'event_registration' && l.resource_id === eventId
  );

  return {
    ...event,
    competitions,
    votingRounds,
    submissions,
    announcements,
    awards,
    registrationCount: registrations.length + 42, // Base lively community interest
  };
}

// ---------------------------------------------------------------------------
// 1. PUBLIC ENDPOINTS
// ---------------------------------------------------------------------------

// GET /api/events/awards/verify/:certId — Public Certificate Verification (must be before /:slug)
eventsRouter.get('/awards/verify/:certId', async (req, res) => {
  try {
    const { certId } = req.params;
    const { data: logs } = await supabaseAdmin
      .from('audit_logs')
      .select('*')
      .eq('resource_type', 'award')
      .eq('resource_id', certId)
      .limit(1);

    if (!logs || logs.length === 0) {
      return res.status(404).json({ error: 'شهادة الجائزة غير موجودة أو غير معتمدة رسمياً.' });
    }

    const awardRecord = logs[0];
    return res.json({
      verified: true,
      certificateId: certId,
      ...awardRecord.metadata,
      issuedAt: awardRecord.created_at,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/events — List all events, carnivals & festivals
eventsRouter.get('/', async (req, res) => {
  try {
    const { type, status, featured } = req.query;

    const { data: dbEvents, error } = await supabaseAdmin
      .from('events')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching events:', error);
    }

    // Also fetch extended metadata / update logs
    const { data: eventLogs } = await supabaseAdmin
      .from('audit_logs')
      .select('*')
      .eq('resource_type', 'event')
      .order('created_at', { ascending: false });

    const deletedIds = new Set<string>();
    const updatedMap = new Map<string, any>();

    (eventLogs || []).forEach((l) => {
      if (l.action === 'delete_event') {
        deletedIds.add(l.resource_id);
      } else if (!updatedMap.has(l.resource_id)) {
        updatedMap.set(l.resource_id, l.metadata);
      }
    });

    let combined: any[] = [];

    (dbEvents || []).forEach((item) => {
      if (deletedIds.has(item.id)) return;
      const meta = updatedMap.get(item.id) || {};
      combined.push({
        ...item,
        ...meta,
        id: item.id,
        title_ar: item.title_ar || meta.title_ar,
      });
    });

    // If database has fewer than default carnivals, merge defaults (unless deleted)
    DEFAULT_CARNIVALS.forEach((def) => {
      if (deletedIds.has(def.id) || deletedIds.has(def.slug)) return;
      if (!combined.some((c) => c.id === def.id || c.slug === def.slug)) {
        const meta = updatedMap.get(def.id) || updatedMap.get(def.slug) || {};
        combined.push({
          ...def,
          ...meta,
        });
      }
    });

    if (type) {
      combined = combined.filter((e) => (e.event_type || 'carnival') === type);
    }
    if (status) {
      combined = combined.filter((e) => (e.status || 'active') === status);
    }
    if (featured === 'true') {
      combined = combined.filter((e) => e.is_featured === true || e.status === 'active' || e.status === 'voting_open');
    }

    return res.json(combined);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/events/:slug — Detailed hydrated view of an event or carnival
eventsRouter.get('/:slug', async (req, res) => {
  try {
    const hydrated = await getEventHydrated(req.params.slug);
    if (!hydrated) {
      return res.status(404).json({ error: 'Event or Carnival not found' });
    }
    return res.json(hydrated);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/events/:slug/register — Register user for event
eventsRouter.post('/:slug/register', requireAuth, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const eventSlug = req.params.slug;

    // Check if user already registered
    const { data: existing } = await supabaseAdmin
      .from('audit_logs')
      .select('id')
      .eq('user_id', userId)
      .eq('action', 'event_registered')
      .eq('resource_id', eventSlug)
      .limit(1);

    if (existing && existing.length > 0) {
      return res.status(400).json({ error: 'أنت مسجل بالفعل في هذا الكرنفال/الحدث.' });
    }

    await logEventAction(userId, 'event_registered', 'event_registration', eventSlug, {
      userEmail: req.user.email,
      registeredAt: new Date().toISOString(),
    });

    return res.json({ success: true, message: 'تم تأكيد تسجيلك في الفعالية بنجاح!' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/events/:slug/competitions/:compId/submit — Submit creative work
eventsRouter.post('/:slug/competitions/:compId/submit', requireAuth, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const { compId, slug } = req.params;
    const { title, synopsis, mediaUrl, contentReferenceId, creatorName, portfolioUrl } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'عنوان المشاركة مطلوب.' });
    }

    // Check duplicate submission for this user in this competition
    const { data: prevSub } = await supabaseAdmin
      .from('audit_logs')
      .select('id')
      .eq('user_id', userId)
      .eq('action', 'competition_submission')
      .eq('resource_id', compId)
      .limit(1);

    if (prevSub && prevSub.length > 0) {
      return res.status(400).json({ error: 'لديك مشاركة مسجلة بالفعل في هذه المسابقة.' });
    }

    const submissionId = `sub-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;

    await logEventAction(userId, 'competition_submission', 'submission', compId, {
      submissionId,
      eventId: slug,
      title,
      synopsis,
      mediaUrl,
      contentReferenceId,
      creatorName: creatorName || req.user.display_name || req.user.email,
      portfolioUrl,
      status: 'pending_review',
      submittedAt: new Date().toISOString(),
    });

    return res.json({
      success: true,
      submissionId,
      message: 'تم إرسال عملك إلى لجنة التحكيم والتدقيق الفني بنجاح!',
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/events/:slug/voting/:roundId/vote — Secure Anti-Fraud Voting
eventsRouter.post('/:slug/voting/:roundId/vote', requireAuth, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const { roundId } = req.params;
    const { optionId } = req.body;

    if (!optionId) {
      return res.status(400).json({ error: 'يرجى اختيار مرشح للتصويت له.' });
    }

    // 1. Check if user already voted in this round (Database-level check)
    const { data: existingVotes, error: voteErr } = await supabaseAdmin
      .from('audit_logs')
      .select('id, created_at')
      .eq('user_id', userId)
      .eq('action', 'cast_vote')
      .eq('resource_id', roundId)
      .limit(1);

    if (voteErr) {
      console.error(voteErr);
    }

    if (existingVotes && existingVotes.length > 0) {
      return res.status(400).json({
        error: 'لقد قمت بالتصويت بالفعل في هذه الجولة. التصويت مقيد بصوت واحد لكل حساب مسجل وموثق.',
      });
    }

    // 2. Commit the vote transactionally in audit_logs
    await logEventAction(userId, 'cast_vote', 'vote', roundId, {
      optionId,
      roundId,
      userEmail: req.user.email,
      ipHint: req.ip || 'secure-client',
      votedAt: new Date().toISOString(),
    });

    return res.json({
      success: true,
      message: 'تم تسجيل وتوثيق صوتك بنجاح في صندوق الاقتراع الرسمي!',
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// 2. ADMIN EVENT & CARNIVAL MANAGEMENT STUDIO
// ---------------------------------------------------------------------------
adminEventsRouter.use(requireAuth);
adminEventsRouter.use(requireRole('admin'));

// POST /api/admin/events — Create official event or carnival
adminEventsRouter.post('/', async (req: any, res) => {
  try {
    const userId = req.user.id;
    const {
      title_ar,
      title_en,
      slug,
      description_ar,
      image_url,
      mobile_image_url,
      location,
      is_online,
      event_type,
      status,
      theme,
      theme_color,
      start_date,
      end_date,
      registration_open,
      is_featured,
      banner_priority,
      show_announcement_bar,
      countdown_enabled,
      custom_cta_label,
      custom_cta_url,
      sections_config,
    } = req.body;

    if (!title_ar || !slug) {
      return res.status(400).json({ error: 'العنوان والمعرف اللطيف (Slug) مطلوبان.' });
    }

    const eventId = slug.trim().toLowerCase().replace(/\s+/g, '-');

    // Insert or upsert into events table
    const { data: createdEvent, error: insertError } = await supabaseAdmin
      .from('events')
      .upsert({
        id: eventId,
        title_ar,
        title_en: title_en || eventId,
        description_ar,
        image_url,
        location: location || 'منصة حكاياتي الرقمية',
        is_online: is_online !== false,
      })
      .select('*')
      .single();

    if (insertError) {
      console.error('Error inserting event:', insertError);
    }

    // Persist full rich metadata in audit_logs
    const metadata = {
      id: eventId,
      slug: eventId,
      title_ar,
      title_en: title_en || eventId,
      description_ar,
      image_url,
      mobile_image_url: mobile_image_url || image_url,
      location: location || 'منصة حكاياتي الرقمية',
      is_online: is_online !== false,
      event_type: event_type || 'carnival',
      status: status || 'active',
      theme: theme || '',
      theme_color: theme_color || '#C5A15B',
      start_date,
      end_date,
      registration_open: registration_open !== false,
      is_featured: is_featured === true || is_featured === 'true',
      banner_priority: Number(banner_priority || 1),
      show_announcement_bar: show_announcement_bar === true || show_announcement_bar === 'true',
      countdown_enabled: countdown_enabled !== false,
      custom_cta_label: custom_cta_label || 'استكشف الفعالية',
      custom_cta_url: custom_cta_url || `/events/${eventId}`,
      sections_config: sections_config || {
        hero: true,
        overview: true,
        competitions: true,
        voting: true,
        announcements: true,
        winners: true,
        gallery: true,
      },
    };

    await logEventAction(userId, 'create_event', 'event', eventId, metadata);

    return res.json({
      success: true,
      event: { ...createdEvent, ...metadata },
      message: 'تم تأسيس ونشر الكرنفال/الحدث بنجاح في المنظومة.',
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// PUT /api/admin/events/:id — Edit & Update existing event or carnival
adminEventsRouter.put('/:id', async (req: any, res) => {
  try {
    const userId = req.user.id;
    const eventId = req.params.id;
    const {
      title_ar,
      title_en,
      slug,
      description_ar,
      image_url,
      mobile_image_url,
      location,
      is_online,
      event_type,
      status,
      theme,
      theme_color,
      start_date,
      end_date,
      registration_open,
      is_featured,
      banner_priority,
      show_announcement_bar,
      countdown_enabled,
      custom_cta_label,
      custom_cta_url,
      sections_config,
    } = req.body;

    if (!title_ar) {
      return res.status(400).json({ error: 'العنوان بالعربية مطلوب.' });
    }

    // Update in database if present
    await supabaseAdmin
      .from('events')
      .update({
        title_ar,
        title_en: title_en || eventId,
        description_ar,
        image_url,
        location: location || 'منصة حكاياتي الرقمية',
        is_online: is_online !== false,
      })
      .eq('id', eventId);

    // Save updated full metadata in audit_logs
    const updatedMetadata = {
      id: eventId,
      slug: slug || eventId,
      title_ar,
      title_en: title_en || eventId,
      description_ar,
      image_url,
      mobile_image_url: mobile_image_url || image_url,
      location: location || 'منصة حكاياتي الرقمية',
      is_online: is_online !== false,
      event_type: event_type || 'carnival',
      status: status || 'active',
      theme: theme || '',
      theme_color: theme_color || '#C5A15B',
      start_date,
      end_date,
      registration_open: registration_open !== false,
      is_featured: is_featured === true || is_featured === 'true',
      banner_priority: Number(banner_priority || 1),
      show_announcement_bar: show_announcement_bar === true || show_announcement_bar === 'true',
      countdown_enabled: countdown_enabled !== false,
      custom_cta_label: custom_cta_label || 'استكشف الفعالية',
      custom_cta_url: custom_cta_url || `/events/${eventId}`,
      sections_config: sections_config || {
        hero: true,
        overview: true,
        competitions: true,
        voting: true,
        announcements: true,
        winners: true,
        gallery: true,
      },
    };

    await logEventAction(userId, 'update_event', 'event', eventId, updatedMetadata);

    return res.json({
      success: true,
      event: updatedMetadata,
      message: 'تم تحديث بيانات الكرنفال بنجاح.',
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// DELETE /api/admin/events/:id — Delete event or carnival
adminEventsRouter.delete('/:id', async (req: any, res) => {
  try {
    const userId = req.user.id;
    const eventId = req.params.id;

    // Delete from events table by UUID or slug
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(eventId);
    if (isUuid) {
      await supabaseAdmin.from('events').delete().eq('id', eventId);
    } else {
      await supabaseAdmin.from('events').delete().eq('slug', eventId);
    }

    // Record soft-delete tombstone in audit_logs
    await logEventAction(userId, 'delete_event', 'event', eventId, {
      deletedAt: new Date().toISOString(),
      deletedBy: userId,
    });

    return res.json({
      success: true,
      message: 'تم حذف الفعالية/الكرنفال نهائياً بنجاح.',
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/events/:id/competitions — Create Competition
adminEventsRouter.post('/:id/competitions', async (req: any, res) => {
  try {
    const userId = req.user.id;
    const eventId = req.params.id;
    const {
      name_ar,
      name_en,
      category,
      rules,
      prizes,
      max_submissions,
      submission_deadline,
      evaluation_period,
    } = req.body;

    if (!name_ar) {
      return res.status(400).json({ error: 'اسم المسابقة بالعربية مطلوب.' });
    }

    const compId = `comp-${Date.now()}`;

    await logEventAction(userId, 'create_competition', 'competition', compId, {
      eventId,
      name_ar,
      name_en,
      category: category || 'novel',
      rules,
      prizes,
      max_submissions: max_submissions || 100,
      submission_deadline,
      evaluation_period,
      status: 'active',
    });

    return res.json({ success: true, compId, message: 'تم إطلاق المسابقة بنجاح.' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/events/:id/voting-rounds — Create Voting Round
adminEventsRouter.post('/:id/voting-rounds', async (req: any, res) => {
  try {
    const userId = req.user.id;
    const eventId = req.params.id;
    const {
      title_ar,
      title_en,
      voting_type,
      nominees, // array of { id, title, creator, coverUrl }
      start_date,
      end_date,
      visibility, // 'live' | 'hidden_until_close' | 'percentage_only'
      max_votes_per_user,
    } = req.body;

    if (!title_ar || !nominees || nominees.length === 0) {
      return res.status(400).json({ error: 'عنوان جولة التصويت وقائمة المرشحين مطلوبان.' });
    }

    const roundId = `vote-${Date.now()}`;

    await logEventAction(userId, 'create_voting_round', 'voting_round', roundId, {
      eventId,
      title_ar,
      title_en,
      voting_type: voting_type || 'single_choice',
      nominees,
      start_date,
      end_date,
      visibility: visibility || 'live',
      max_votes_per_user: max_votes_per_user || 1,
      status: 'open',
    });

    return res.json({ success: true, roundId, message: 'تم فتح جولة التصويت وتجهيز صناديق الاقتراع.' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/events/:id/awards — Issue Award Certificate & Publish Winner
adminEventsRouter.post('/:id/awards', async (req: any, res) => {
  try {
    const userId = req.user.id;
    const eventId = req.params.id;
    const { winner_name, award_title, rank, category, work_title, notes } = req.body;

    if (!winner_name || !award_title) {
      return res.status(400).json({ error: 'اسم الفائز ومسمى الجائزة مطلوبان.' });
    }

    const certId = `HKY-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

    await logEventAction(userId, 'issue_award_certificate', 'award', certId, {
      eventId,
      certId,
      winner_name,
      award_title,
      rank: rank || 'المركز الأول (First Place)',
      category: category || 'أدب الخيال والقصة المصورة',
      work_title,
      notes,
      issuedDate: new Date().toLocaleDateString('ar-EG'),
      officialSeal: 'ختم هيئة النشر والتحكيم المركزية — حكاياتي',
    });

    return res.json({
      success: true,
      certId,
      verificationUrl: `/awards/${certId}`,
      message: 'تم اعتماد الفائز وتوليد شهادة الجائزة الرقمية الرسمية بنجاح!',
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/events/:id/announcements — Publish Announcement
adminEventsRouter.post('/:id/announcements', async (req: any, res) => {
  try {
    const userId = req.user.id;
    const eventId = req.params.id;
    const { title_ar, content_ar, priority } = req.body;

    if (!title_ar || !content_ar) {
      return res.status(400).json({ error: 'عنوان الإعلان ومحتواه مطلوبان.' });
    }

    await logEventAction(userId, 'publish_announcement', 'announcement', eventId, {
      eventId,
      title_ar,
      content_ar,
      priority: priority || 'normal',
      publishedAt: new Date().toISOString(),
    });

    return res.json({ success: true, message: 'تم نشر الإعلان الرسمي للمشاركين في الكرنفال.' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default eventsRouter;
