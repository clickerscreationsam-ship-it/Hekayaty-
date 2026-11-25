import { Router, type IRouter } from 'express';
import { requireAuth, requireRole } from '../middlewares/auth';
import { supabaseAdmin } from '../lib/supabase';

const router: IRouter = Router();

// In-memory cache synced with audit_logs for active submission lifecycle
interface SubmissionRecord {
  id: string;
  title: string;
  author: string;
  authorId: string;
  type: 'comic' | 'story';
  submittedDate: string;
  status: 'under_review' | 'approved' | 'revision_requested';
  synopsis: string;
  feedback?: string;
}

const fallbackSubmissions: SubmissionRecord[] = [];

// ---------------------------------------------------------------------------
// GET /api/editorial/submissions
// Readers/Writers see their own; Admins see all
// ---------------------------------------------------------------------------
router.get('/editorial/submissions', requireAuth, async (req, res) => {
  try {
    const user = req.user!;

    // Query audit_logs from Supabase for all submissions
    const { data: logs, error } = await supabaseAdmin
      .from('audit_logs')
      .select('*')
      .eq('entity_type', 'submission')
      .order('created_at', { ascending: false });

    let submissionsMap = new Map<string, SubmissionRecord>();

    if (!error && logs && logs.length > 0) {
      for (const log of logs) {
        if (log.action === 'submission_created' && log.new_data) {
          const item = log.new_data as SubmissionRecord;
          if (!submissionsMap.has(item.id)) {
            submissionsMap.set(item.id, item);
          }
        } else if (log.action === 'submission_status_updated' && log.new_data) {
          const update = log.new_data as any;
          if (submissionsMap.has(update.id)) {
            const existing = submissionsMap.get(update.id)!;
            existing.status = update.status || existing.status;
            existing.feedback = update.feedback || existing.feedback;
          }
        }
      }
    }

    // Merge with in-memory store
    for (const sub of fallbackSubmissions) {
      if (!submissionsMap.has(sub.id)) {
        submissionsMap.set(sub.id, sub);
      }
    }

    const all = Array.from(submissionsMap.values());

    // RBAC Filtering: If not admin, return only own submissions
    if (user.role === 'admin') {
      return res.json(all);
    } else {
      const own = all.filter((s) => s.authorId === user.id);
      return res.json(own);
    }
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'خطأ أثناء استرجاع التقديمات' });
  }
});

// ---------------------------------------------------------------------------
// POST /api/editorial/submissions
// Writer / Publisher / Creator submit new work
// ---------------------------------------------------------------------------
router.post('/editorial/submissions', requireAuth, async (req, res) => {
  try {
    const user = req.user!;
    const { title, type, synopsis } = req.body;

    if (!title || !type || !synopsis) {
      return res.status(400).json({ error: 'العنوان، النوع، والملخص هي حقول إلزامية' });
    }

    const submissionId = `sub_${Date.now()}`;
    const newSubmission: SubmissionRecord = {
      id: submissionId,
      title: title.trim(),
      author: user.displayName,
      authorId: user.id,
      type: type === 'story' ? 'story' : 'comic',
      submittedDate: new Date().toISOString().split('T')[0],
      status: 'under_review',
      synopsis: synopsis.trim(),
    };

    fallbackSubmissions.unshift(newSubmission);

    // Persist to Supabase audit_logs
    try {
      await supabaseAdmin.from('audit_logs').insert({
        user_id: user.id,
        action: 'submission_created',
        entity_type: 'submission',
        entity_id: submissionId,
        new_data: newSubmission,
      });
    } catch {
      // Non-blocking log persistence
    }

    return res.status(201).json({
      success: true,
      submission: newSubmission,
      message: 'تم إرسال العمل بنجاح إلى هيئة التحرير والتدقيق الفني في حكاياتي!',
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'خطأ أثناء حفظ التقديم' });
  }
});

// ---------------------------------------------------------------------------
// PUT /api/editorial/submissions/:id/status
// Admin status update & editorial feedback
// ---------------------------------------------------------------------------
router.put('/editorial/submissions/:id/status', requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { status, feedback } = req.body;

    if (!['under_review', 'approved', 'revision_requested'].includes(status)) {
      return res.status(400).json({ error: 'الحالة المحددة غير صالحة' });
    }

    const sub = fallbackSubmissions.find((s) => s.id === id);
    if (sub) {
      sub.status = status;
      if (feedback) sub.feedback = feedback;
    }

    // Record decision in Supabase
    try {
      await supabaseAdmin.from('audit_logs').insert({
        user_id: req.user!.id,
        action: 'submission_status_updated',
        entity_type: 'submission',
        entity_id: id,
        new_data: { id, status, feedback, updatedAt: new Date().toISOString() },
      });
    } catch {
      // Non-blocking
    }

    return res.json({
      success: true,
      message: 'تم تحديث حالة التقديم وإشعار الكاتب بالقرار التحريري.',
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'خطأ أثناء تحديث حالة التقديم' });
  }
});

// ---------------------------------------------------------------------------
// ADMIN USERS MANAGEMENT
// ---------------------------------------------------------------------------
router.get('/admin/users', requireRole('admin'), async (_req, res) => {
  try {
    const { data: profiles, error } = await supabaseAdmin
      .from('profiles')
      .select('id, email, display_name, role, is_active, created_at, last_login_at')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.json(
      (profiles || []).map((p) => ({
        id: p.id,
        email: p.email,
        displayName: p.display_name,
        role: p.role,
        isActive: p.is_active,
        createdAt: p.created_at,
        lastLoginAt: p.last_login_at,
      }))
    );
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'خطأ أثناء استرجاع المستخدمين' });
  }
});

router.put('/admin/users/:id/role', requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['reader', 'writer', 'publishing_house', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'الرتبة المحددة غير صالحة' });
    }

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({ role, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json({
      success: true,
      message: `تم تحديث رتبة المستخدم إلى: ${role}`,
      user: data,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'خطأ أثناء تحديث الصلاحية' });
  }
});

// ---------------------------------------------------------------------------
// CREATOR APPLICATION (Reader applying for Writer/Publisher)
// ---------------------------------------------------------------------------
router.post('/creators/apply', requireAuth, async (req, res) => {
  try {
    const user = req.user!;
    const { type, portfolioUrl, bio } = req.body;

    const requestedType = type === 'publishing_house' ? 'publishing_house' : 'writer';

    // Persist application in audit_logs
    await supabaseAdmin.from('audit_logs').insert({
      user_id: user.id,
      action: 'creator_application_submitted',
      entity_type: 'creator_application',
      entity_id: user.id,
      new_data: {
        userId: user.id,
        displayName: user.displayName,
        email: user.email,
        requestedType,
        portfolioUrl: portfolioUrl || '',
        bio: bio || '',
        appliedAt: new Date().toISOString(),
        status: 'pending_review',
      },
    });

    return res.status(201).json({
      success: true,
      message: 'تم استلام طلب انضمامك إلى مبدعي حكاياتي بنجاح! سيقوم فريق التحرير بمراجعة ملفك والتواصل معك.',
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'خطأ أثناء إرسال طلب الانضمام' });
  }
});

export default router;
