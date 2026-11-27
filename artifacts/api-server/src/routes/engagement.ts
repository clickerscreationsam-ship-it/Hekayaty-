import { Router, type IRouter } from 'express';
import { requireAuth, authMiddleware } from '../middlewares/auth';
import { engagementService, type ContentType } from '../services/engagementService';

const router: IRouter = Router();

// Automatically parse optional auth headers on all engagement routes
router.use(authMiddleware);

// Valid content types
const VALID_CONTENT_TYPES: Set<ContentType> = new Set([
  'novel',
  'story',
  'comic',
  'series',
  'episode',
  'chapter',
  'author',
  'publisher',
]);

function normalizeContentType(type: string): ContentType {
  const lower = String(type || '').toLowerCase();
  if (lower === 'novel') return 'story';
  if (VALID_CONTENT_TYPES.has(lower as ContentType)) return lower as ContentType;
  return 'story';
}

// ---------------------------------------------------------------------------
// 1. LIKES ENDPOINTS
// ---------------------------------------------------------------------------

// POST /api/engagement/likes — Toggle or add like (Protected)
router.post('/likes', requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    const { contentType, contentId } = req.body;

    if (!contentType || !contentId) {
      return res.status(400).json({ error: 'contentType and contentId are required' });
    }

    const normalizedType = normalizeContentType(contentType);
    const result = await engagementService.toggleLike(userId, normalizedType, String(contentId));

    return res.json({
      success: true,
      liked: result.liked,
      likesCount: result.count,
      message: result.liked ? 'تم تسجيل الإعجاب بنجاح' : 'تم إلغاء الإعجاب',
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'خطأ أثناء تسجيل الإعجاب' });
  }
});

// DELETE /api/engagement/likes — Explicit unlike (Protected)
router.delete('/likes', requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    const { contentType, contentId } = req.body;

    if (!contentType || !contentId) {
      return res.status(400).json({ error: 'contentType and contentId are required' });
    }

    const normalizedType = normalizeContentType(contentType);
    const current = await engagementService.getLikeStatus(userId, normalizedType, String(contentId));

    if (current.liked) {
      const result = await engagementService.toggleLike(userId, normalizedType, String(contentId));
      return res.json({ success: true, liked: false, likesCount: result.count });
    }

    return res.json({ success: true, liked: false, likesCount: current.count });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'خطأ أثناء إلغاء الإعجاب' });
  }
});

// GET /api/engagement/likes/status — Check if user liked + get like count (Public/Optional Auth)
router.get('/likes/status', async (req, res) => {
  try {
    const userId = req.user?.id;
    const { contentType, contentId } = req.query;

    if (!contentType || !contentId) {
      return res.status(400).json({ error: 'contentType and contentId query params are required' });
    }

    const normalizedType = normalizeContentType(String(contentType));
    const status = await engagementService.getLikeStatus(userId, normalizedType, String(contentId));

    return res.json({
      liked: status.liked,
      likesCount: status.count,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/engagement/likes/count — Public like count
router.get('/likes/count', async (req, res) => {
  try {
    const { contentType, contentId } = req.query;
    if (!contentType || !contentId) {
      return res.status(400).json({ error: 'contentType and contentId query params are required' });
    }
    const normalizedType = normalizeContentType(String(contentType));
    const status = await engagementService.getLikeStatus(null, normalizedType, String(contentId));
    return res.json({ likesCount: status.count });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/engagement/users/me/likes — Get items liked by current user (Protected)
router.get('/users/me/likes', requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    const { contentType } = req.query;
    const normalizedType = contentType ? normalizeContentType(String(contentType)) : undefined;

    const likes = await engagementService.getUserLikes(userId, normalizedType);
    return res.json({ success: true, likes });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// 2. FOLLOWS ENDPOINTS
// ---------------------------------------------------------------------------

// POST /api/engagement/follows — Toggle or add follow (Protected)
router.post('/follows', requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    const { contentType, contentId } = req.body;

    if (!contentType || !contentId) {
      return res.status(400).json({ error: 'contentType and contentId are required' });
    }

    const normalizedType = normalizeContentType(contentType);
    const result = await engagementService.toggleFollow(userId, normalizedType, String(contentId));

    return res.json({
      success: true,
      following: result.following,
      followersCount: result.count,
      message: result.following ? 'تمت المتابعة بنجاح' : 'تم إلغاء المتابعة',
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'خطأ أثناء تحديث المتابعة' });
  }
});

// DELETE /api/engagement/follows — Explicit unfollow (Protected)
router.delete('/follows', requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    const { contentType, contentId } = req.body;

    if (!contentType || !contentId) {
      return res.status(400).json({ error: 'contentType and contentId are required' });
    }

    const normalizedType = normalizeContentType(contentType);
    const current = await engagementService.getFollowStatus(userId, normalizedType, String(contentId));

    if (current.following) {
      const result = await engagementService.toggleFollow(userId, normalizedType, String(contentId));
      return res.json({ success: true, following: false, followersCount: result.count });
    }

    return res.json({ success: true, following: false, followersCount: current.count });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'خطأ أثناء إلغاء المتابعة' });
  }
});

// GET /api/engagement/follows/status — Check if user follows + follower count
router.get('/follows/status', async (req, res) => {
  try {
    const userId = req.user?.id;
    const { contentType, contentId } = req.query;

    if (!contentType || !contentId) {
      return res.status(400).json({ error: 'contentType and contentId query params are required' });
    }

    const normalizedType = normalizeContentType(String(contentType));
    const status = await engagementService.getFollowStatus(userId, normalizedType, String(contentId));

    return res.json({
      following: status.following,
      followersCount: status.count,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/engagement/follows/count — Public followers count
router.get('/follows/count', async (req, res) => {
  try {
    const { contentType, contentId } = req.query;
    if (!contentType || !contentId) {
      return res.status(400).json({ error: 'contentType and contentId query params are required' });
    }
    const normalizedType = normalizeContentType(String(contentType));
    const status = await engagementService.getFollowStatus(null, normalizedType, String(contentId));
    return res.json({ followersCount: status.count });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/engagement/users/me/following — Get user's followed items (Protected)
router.get('/users/me/following', requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    const { contentType } = req.query;
    const normalizedType = contentType ? normalizeContentType(String(contentType)) : undefined;

    const following = await engagementService.getUserFollowing(userId, normalizedType);
    return res.json({ success: true, following });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// 3. VIEWS & DEDUPLICATION (24-Hour Policy)
// ---------------------------------------------------------------------------

// POST /api/engagement/views — Record content view
router.post('/views', async (req, res) => {
  try {
    const { contentType, contentId, anonymousSessionId, sessionId, source, deviceCategory } = req.body;

    if (!contentType || !contentId) {
      return res.status(400).json({ error: 'contentType and contentId are required' });
    }

    const normalizedType = normalizeContentType(contentType);
    const viewerUserId = req.user?.id || null;

    const result = await engagementService.recordView({
      contentType: normalizedType,
      contentId: String(contentId),
      viewerUserId,
      anonymousSessionId: anonymousSessionId ? String(anonymousSessionId) : null,
      sessionId: sessionId ? String(sessionId) : null,
      source: source ? String(source) : 'direct',
      deviceCategory: deviceCategory ? String(deviceCategory) : 'desktop',
    });

    return res.json({
      success: true,
      recorded: result.recorded,
      deduplicated: result.deduplicated,
      totalViews: result.totalViews,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'خطأ أثناء تسجيل المشاهدة' });
  }
});

// GET /api/engagement/stats/:contentType/:contentId — Combined engagement stats
router.get('/stats/:contentType/:contentId', async (req, res) => {
  try {
    const { contentType, contentId } = req.params;
    const normalizedType = normalizeContentType(contentType);
    const stats = await engagementService.getEngagementStats(normalizedType, contentId);
    return res.json(stats);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// 4. NOTIFICATION PREFERENCES
// ---------------------------------------------------------------------------

// GET /api/engagement/preferences/notifications — Get user preferences
router.get('/preferences/notifications', requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    const prefs = await engagementService.getNotificationPreferences(userId);
    return res.json({ success: true, preferences: prefs });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// PUT /api/engagement/preferences/notifications — Update preferences
router.put('/preferences/notifications', requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    const { notifyChapters, notifyEpisodes, notifyNewWorks, notifyAuthorUpdates, emailNotifications } = req.body;

    const updated = await engagementService.updateNotificationPreferences(userId, {
      notifyChapters: typeof notifyChapters === 'boolean' ? notifyChapters : undefined,
      notifyEpisodes: typeof notifyEpisodes === 'boolean' ? notifyEpisodes : undefined,
      notifyNewWorks: typeof notifyNewWorks === 'boolean' ? notifyNewWorks : undefined,
      notifyAuthorUpdates: typeof notifyAuthorUpdates === 'boolean' ? notifyAuthorUpdates : undefined,
      emailNotifications: typeof emailNotifications === 'boolean' ? emailNotifications : undefined,
    });

    return res.json({ success: true, preferences: updated });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// 5. FAN-OUT NOTIFICATIONS (Creator / Admin Trigger)
// ---------------------------------------------------------------------------

router.post('/fan-out-notification', requireAuth, async (req, res) => {
  try {
    const userRole = req.user?.role;
    if (userRole !== 'admin' && userRole !== 'writer' && userRole !== 'publishing_house') {
      return res.status(403).json({ error: 'غير مصرح لك بنشر إشعارات المتابعين' });
    }

    const { contentType, contentId, titleAr, bodyAr, linkUrl, triggerType } = req.body;

    if (!contentType || !contentId || !titleAr || !bodyAr || !linkUrl) {
      return res.status(400).json({ error: 'Missing required notification parameters' });
    }

    const normalizedType = normalizeContentType(contentType);
    const result = await engagementService.fanOutNotification({
      contentType: normalizedType,
      contentId: String(contentId),
      titleAr: String(titleAr),
      bodyAr: String(bodyAr),
      linkUrl: String(linkUrl),
      triggerType: triggerType || 'new_chapter',
    });

    return res.json({ success: true, notifiedCount: result.notifiedCount });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
