import { Router, type IRouter } from 'express';
import { requireAuth } from '../middlewares/auth';
import { engagementService } from '../services/engagementService';

const router: IRouter = Router();

// Middleware: Verify Admin Role
function requireAdmin(req: any, res: any, next: any) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'عذراً، الوصول إلى التحليلات الشاملة متاح للمشرفين فقط' });
  }
  next();
}

// ---------------------------------------------------------------------------
// ADMIN ANALYTICS
// ---------------------------------------------------------------------------

// GET /api/analytics/admin/overview — Global KPIs and chart data
router.get('/admin/overview', requireAuth, requireAdmin, async (req, res) => {
  try {
    const timeRange = String(req.query.timeRange || '30d');
    const overview = await engagementService.getAdminAnalyticsOverview(timeRange);
    return res.json({ success: true, ...overview });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'خطأ أثناء استخراج التحليلات' });
  }
});

// GET /api/analytics/admin/content — Top content ranking tables
router.get('/admin/content', requireAuth, requireAdmin, async (req, res) => {
  try {
    const contentType = req.query.contentType ? String(req.query.contentType) : undefined;
    const metric = String(req.query.metric || 'views');
    const limit = Math.min(Number(req.query.limit) || 10, 50);

    const items = await engagementService.getAdminTopContent(contentType, metric, limit);
    return res.json({ success: true, items });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'خطأ أثناء جلب تصنيف المحتوى' });
  }
});

// GET /api/analytics/admin/trends — Engagement trends over time
router.get('/admin/trends', requireAuth, requireAdmin, async (req, res) => {
  try {
    const timeRange = String(req.query.timeRange || '30d');
    const overview = await engagementService.getAdminAnalyticsOverview(timeRange);
    return res.json({ success: true, trends: overview.chartData });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// CREATOR & PUBLISHER ANALYTICS (Scoped Strictly to Authenticated User)
// ---------------------------------------------------------------------------

// GET /api/analytics/creator/overview — Creator's personal works performance
router.get('/creator/overview', requireAuth, async (req, res) => {
  try {
    const creatorUserId = req.user!.id;
    const timeRange = String(req.query.timeRange || '30d');

    const analytics = await engagementService.getCreatorAnalytics(creatorUserId, timeRange);
    return res.json({ success: true, ...analytics });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'خطأ أثناء تحميل تحليلات المبدع' });
  }
});

// GET /api/analytics/creator/content — Creator's content list with engagement
router.get('/creator/content', requireAuth, async (req, res) => {
  try {
    const creatorUserId = req.user!.id;
    const timeRange = String(req.query.timeRange || '30d');

    const analytics = await engagementService.getCreatorAnalytics(creatorUserId, timeRange);
    return res.json({ success: true, works: analytics.works });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
