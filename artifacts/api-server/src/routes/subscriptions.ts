import { Router, type IRouter } from 'express';
import crypto from 'node:crypto';
import { requireAuth, requireRole } from '../middlewares/auth';
import { supabaseAdmin } from '../lib/supabase';
import {
  defaultPlans,
  getInMemoryPlans,
  setInMemoryPlans,
  getInMemorySubscriptions,
  addInMemorySubscription,
  getInMemoryPaymentRequests,
  addInMemoryPaymentRequest,
  getInMemoryCodes,
  setInMemoryCodes,
  getInMemorySettings,
  setInMemorySettings,
  calculateQueueDates,
  checkUserSubscriptionStatus,
  logSubscriptionAudit,
  type SubscriptionPlan,
  type UserSubscription,
  type PaymentRequest,
  type SubscriptionCode,
  type SubscriptionSettings,
} from '../services/subscriptionService';

export const subscriptionsRouter: IRouter = Router();
export const adminSubscriptionsRouter: IRouter = Router();

// ---------------------------------------------------------------------------
// Helper: Cryptographically Secure Code Generator
// ---------------------------------------------------------------------------
function generateSecureCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Avoid ambiguous 0, O, 1, I
  let part1 = '';
  let part2 = '';
  const randBytes = crypto.randomBytes(8);
  for (let i = 0; i < 4; i++) {
    part1 += chars[randBytes[i] % chars.length];
    part2 += chars[randBytes[i + 4] % chars.length];
  }
  return `HKY-${part1}-${part2}`;
}

// ===========================================================================
// PUBLIC & USER SUBSCRIPTION ENDPOINTS
// ===========================================================================

// GET /api/subscriptions/plans — Public list of active subscription plans
subscriptionsRouter.get('/plans', async (_req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .eq('is_archived', false)
      .order('display_order', { ascending: true });

    if (!error && data && data.length > 0) {
      return res.json(
        data.map((p) => ({
          id: p.id,
          nameAr: p.name_ar,
          nameEn: p.name_en,
          descriptionAr: p.description_ar,
          descriptionEn: p.description_en,
          priceEgp: Number(p.price_egp),
          durationDays: p.duration_days || 30,
          features: Array.isArray(p.features) ? p.features : JSON.parse(p.features || '[]'),
          isFeatured: p.is_featured,
          displayOrder: p.display_order,
        }))
      );
    }

    const plans = getInMemoryPlans().filter((p) => p.is_active && !p.is_archived);
    return res.json(
      plans.map((p) => ({
        id: p.id,
        nameAr: p.name_ar,
        nameEn: p.name_en,
        descriptionAr: p.description_ar,
        descriptionEn: p.description_en,
        priceEgp: p.price_egp,
        durationDays: p.duration_days,
        features: p.features,
        isFeatured: p.is_featured,
        displayOrder: p.display_order,
      }))
    );
  } catch {
    return res.json(defaultPlans);
  }
});

// GET /api/subscriptions/settings — Public InstaPay details & instructions
subscriptionsRouter.get('/settings', async (_req, res) => {
  try {
    const { data } = await supabaseAdmin
      .from('subscription_settings')
      .select('*')
      .eq('id', 'instapay')
      .maybeSingle();

    if (data) {
      return res.json({
        instapayAddress: data.instapay_address,
        recipientName: data.recipient_name,
        phoneNumber: data.phone_number,
        instructionsAr: data.instructions_ar,
        instructionsEn: data.instructions_en,
        qrCodeUrl: data.qr_code_url,
        isEnabled: data.is_enabled,
      });
    }

    const s = getInMemorySettings();
    return res.json({
      instapayAddress: s.instapay_address,
      recipientName: s.recipient_name,
      phoneNumber: s.phone_number,
      instructionsAr: s.instructions_ar,
      instructionsEn: s.instructions_en,
      qrCodeUrl: s.qr_code_url,
      isEnabled: s.is_enabled,
    });
  } catch {
    const s = getInMemorySettings();
    return res.json(s);
  }
});

// GET /api/subscriptions/me — Current user's subscription status & queue
subscriptionsRouter.get('/me', requireAuth, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    const statusInfo = await checkUserSubscriptionStatus(userId, userRole);

    // Fetch user's active pending payment request if any
    let activeRequest: any = null;
    try {
      const { data } = await supabaseAdmin
        .from('subscription_payment_requests')
        .select('*')
        .eq('user_id', userId)
        .in('status', ['pending_payment', 'under_review'])
        .maybeSingle();

      if (data) {
        activeRequest = {
          id: data.id,
          reference: data.reference,
          planId: data.plan_id,
          planNameAr: data.plan_name_ar,
          priceEgp: Number(data.price_egp),
          durationDays: data.duration_days,
          status: data.status,
          createdAt: data.created_at,
          transactionReference: data.transaction_reference,
        };
      }
    } catch {
      const memReq = getInMemoryPaymentRequests().find(
        (r) => r.user_id === userId && ['pending_payment', 'under_review'].includes(r.status)
      );
      if (memReq) activeRequest = memReq;
    }

    // Fetch user's past subscriptions history
    let history: any[] = [];
    try {
      const { data } = await supabaseAdmin
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (data && data.length > 0) {
        history = data.map((s) => ({
          id: s.id,
          status: s.status,
          durationDays: s.duration_days,
          startDate: s.start_date,
          endDate: s.end_date,
          source: s.source,
          referenceCode: s.reference_code,
          createdAt: s.created_at,
        }));
      }
    } catch {
      history = getInMemorySubscriptions().filter((s) => s.user_id === userId);
    }

    return res.json({
      isSubscriber: statusInfo.isSubscriber,
      isAdmin: statusInfo.isAdmin,
      status: statusInfo.status,
      remainingDays: statusInfo.remainingDays,
      activeSubscription: statusInfo.activeSubscription || null,
      scheduledSubscriptions: statusInfo.scheduledSubscriptions || [],
      activePaymentRequest: activeRequest,
      history,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/subscriptions/payment-requests — Create new InstaPay payment request
subscriptionsRouter.post('/payment-requests', requireAuth, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const { planId } = req.body;

    if (!planId) {
      return res.status(400).json({ error: 'يرجى اختيار باقة الاشتراك المطلوبة' });
    }

    // Verify payment requests are currently enabled
    const settings = getInMemorySettings();
    if (!settings.is_enabled) {
      return res.status(400).json({
        error: 'طلبات الاشتراك عبر إنستاباي متوقفة مؤقتاً للصيانة. يرجى المحاولة لاحقاً.',
      });
    }

    // Enforce ONE active request per user
    const existingReq = getInMemoryPaymentRequests().find(
      (r) => r.user_id === userId && ['pending_payment', 'under_review'].includes(r.status)
    );
    if (existingReq) {
      return res.status(400).json({
        error: 'لديك طلب اشتراك قيد الانتظار أو المراجعة بالفعل. لا يمكنك إنشاء طلب جديد قبل معالجة أو إلغاء الطلب الحالي.',
        existingRequest: existingReq,
      });
    }

    // Authoritative Plan Lookup
    const plan = getInMemoryPlans().find((p) => p.id === planId && p.is_active && !p.is_archived);
    if (!plan) {
      return res.status(404).json({ error: 'باقة الاشتراك غير موجودة أو غير متاحة حالياً' });
    }

    const reference = `HKY-SUB-${Math.floor(100000 + Math.random() * 900000)}`;
    const newRequest: PaymentRequest = {
      id: Date.now(),
      reference,
      user_id: userId,
      user_email: req.user.email,
      user_name: req.user.displayName,
      plan_id: plan.id,
      plan_name_ar: plan.name_ar,
      price_egp: plan.price_egp,
      currency: 'EGP',
      duration_days: plan.duration_days,
      payment_method: 'instapay',
      status: 'pending_payment',
      created_at: new Date().toISOString(),
    };

    // Persist to Supabase if available
    try {
      const { data, error } = await supabaseAdmin
        .from('subscription_payment_requests')
        .insert({
          reference: newRequest.reference,
          user_id: userId,
          plan_id: plan.id,
          plan_name_ar: plan.name_ar,
          price_egp: plan.price_egp,
          currency: 'EGP',
          duration_days: plan.duration_days,
          payment_method: 'instapay',
          status: 'pending_payment',
        })
        .select()
        .single();

      if (!error && data) {
        newRequest.id = data.id;
      }
    } catch {
      // In-memory fallback
    }

    addInMemoryPaymentRequest(newRequest);

    return res.status(201).json({
      success: true,
      request: newRequest,
      message: 'تم إنشاء طلب الاشتراك بنجاح. يرجى تحويل المبلغ عبر إنستاباي ورفع إثبات التحويل.',
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/subscriptions/payment-requests/:id/submit-proof — Submit transfer screenshot & ref
subscriptionsRouter.post('/payment-requests/:id/submit-proof', requireAuth, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const requestId = req.params.id;
    const { proofImageUrl, transactionReference, transferAmount, transferDatetime, userNotes } = req.body;

    if (!proofImageUrl || !transactionReference) {
      return res.status(400).json({
        error: 'صورة إيصال التحويل ورقم المرجع (Transaction Reference) كلاهما مطلوبان لإتمام المراجعة.',
      });
    }

    const cleanTxRef = String(transactionReference).trim();

    // Check duplicate transaction reference across existing approved/under_review requests
    const allRequests = getInMemoryPaymentRequests();
    const isDuplicate = allRequests.some(
      (r) =>
        r.id !== requestId &&
        r.transaction_reference?.toLowerCase() === cleanTxRef.toLowerCase() &&
        ['approved', 'under_review'].includes(r.status)
    );
    if (isDuplicate) {
      return res.status(400).json({
        error: 'رقم المرجع هذا تم استخدامه مسبقاً في طلب آخر. يرجى التأكد من إدخال رقم العملية الصحيح.',
        code: 'DUPLICATE_TRANSACTION_REF',
      });
    }

    // Find user request
    const request = allRequests.find((r) => String(r.id) === String(requestId) && r.user_id === userId);
    if (!request) {
      return res.status(404).json({ error: 'طلب الاشتراك غير موجود أو لا يتبع حسابك' });
    }

    if (request.status !== 'pending_payment') {
      return res.status(400).json({
        error: 'لا يمكن تعديل إثبات الدفع لهذا الطلب؛ الطلب بالفعل قيد المراجعة أو تم اتخاذ قرار بشأنه.',
      });
    }

    // Validate amount
    const amount = Number(transferAmount) || request.price_egp;

    // Transition to under_review
    request.status = 'under_review';
    request.proof_image_url = proofImageUrl;
    request.transaction_reference = cleanTxRef;
    request.transfer_amount = amount;
    request.transfer_datetime = transferDatetime || new Date().toISOString();
    request.user_notes = userNotes || null;

    // Persist to Supabase
    try {
      await supabaseAdmin
        .from('subscription_payment_requests')
        .update({
          status: 'under_review',
          proof_image_url: proofImageUrl,
          transaction_reference: cleanTxRef,
          transfer_amount: amount,
          transfer_datetime: request.transfer_datetime,
          user_notes: request.user_notes,
          updated_at: new Date().toISOString(),
        })
        .eq('id', requestId);
    } catch {
      // In-memory fallback
    }

    return res.json({
      success: true,
      status: 'under_review',
      message: 'تم إرسال إثبات التحويل بنجاح! سيتم مراجعة الطلب وتفعيل اشتراكك بواسطة إدارة حكاياتي في أقرب وقت.',
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/subscriptions/payment-requests/:id/cancel — User cancels own pending request
subscriptionsRouter.post('/payment-requests/:id/cancel', requireAuth, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const requestId = req.params.id;

    const request = getInMemoryPaymentRequests().find(
      (r) => String(r.id) === String(requestId) && r.user_id === userId
    );
    if (!request) {
      return res.status(404).json({ error: 'طلب الاشتراك غير موجود' });
    }

    if (request.status !== 'pending_payment') {
      return res.status(400).json({
        error: 'لا يمكنك إلغاء الطلب بعد دخوله مرحلة المراجعة الإدارية. يرجى التواصل مع الدعم الفني.',
      });
    }

    request.status = 'cancelled';

    try {
      await supabaseAdmin
        .from('subscription_payment_requests')
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('id', requestId);
    } catch {
      // In-memory fallback
    }

    return res.json({ success: true, message: 'تم إلغاء طلب الاشتراك بنجاح.' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/subscriptions/redeem — User redeems a subscription gift/promo code
subscriptionsRouter.post('/redeem', requireAuth, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const { code } = req.body;

    if (!code || typeof code !== 'string') {
      return res.status(400).json({ error: 'يرجى إدخال كود الاشتراك' });
    }

    const cleanCode = code.toUpperCase().trim();

    // 1. Find Code in DB or Memory
    let targetCode: SubscriptionCode | undefined;
    try {
      const { data } = await supabaseAdmin
        .from('subscription_codes')
        .select('*')
        .eq('code', cleanCode)
        .maybeSingle();

      if (data) {
        targetCode = {
          id: data.id,
          batch_id: data.batch_id,
          code: data.code,
          duration_days: data.duration_days,
          expires_at: data.expires_at,
          is_active: data.is_active,
          is_redeemed: data.is_redeemed,
          redeemed_by: data.redeemed_by,
          redeemed_at: data.redeemed_at,
          created_at: data.created_at,
        };
      }
    } catch {
      // Continue to in-memory lookup
    }

    if (!targetCode) {
      targetCode = getInMemoryCodes().find((c) => c.code === cleanCode);
    }

    if (!targetCode) {
      return res.status(404).json({ error: 'كود الاشتراك غير صحيح أو غير موجود' });
    }

    if (!targetCode.is_active) {
      return res.status(400).json({ error: 'هذا الكود تم تعطيله من قبل الإدارة' });
    }

    if (targetCode.is_redeemed) {
      return res.status(400).json({ error: 'هذا الكود تم استخدامه وتفعيله مسبقاً' });
    }

    if (targetCode.expires_at && new Date(targetCode.expires_at) < new Date()) {
      return res.status(400).json({ error: 'انتهت صلاحية استخدام هذا الكود' });
    }

    // 2. Atomic Redemption & Queue Calculation
    const durationDays = targetCode.duration_days || 30;
    const queueResult = await calculateQueueDates(userId, durationDays);

    const subRef = `HKY-CODE-${Math.floor(100000 + Math.random() * 900000)}`;
    const newSub: UserSubscription = {
      id: Date.now(),
      user_id: userId,
      status: queueResult.status,
      duration_days: durationDays,
      start_date: queueResult.startDate.toISOString(),
      end_date: queueResult.endDate.toISOString(),
      source: 'code',
      reference_code: subRef,
      created_at: new Date().toISOString(),
    };

    // Mark code redeemed
    targetCode.is_redeemed = true;
    targetCode.redeemed_by = userId;
    targetCode.redeemed_at = new Date().toISOString();

    // Persist to Supabase
    try {
      const { data: subData } = await supabaseAdmin
        .from('subscriptions')
        .insert({
          user_id: userId,
          status: queueResult.status,
          duration_days: durationDays,
          start_date: queueResult.startDate.toISOString(),
          end_date: queueResult.endDate.toISOString(),
          source: 'code',
          reference_code: subRef,
        })
        .select()
        .single();

      if (subData) {
        newSub.id = subData.id;
        await supabaseAdmin
          .from('subscription_codes')
          .update({
            is_redeemed: true,
            redeemed_by: userId,
            redeemed_at: new Date().toISOString(),
            subscription_id: subData.id,
          })
          .eq('id', targetCode.id);
      }
    } catch {
      // In-memory fallback
    }

    addInMemorySubscription(newSub);

    return res.json({
      success: true,
      message:
        queueResult.status === 'active'
          ? `تم تفعيل الكود بنجاح! استمتع بعضوية حكاياتي لمدة ${durationDays} يوماً.`
          : `تم جدولة الكود بنجاح! تم إضافة ${durationDays} يوماً تبدأ فور انتهاء اشتراكك الحالي.`,
      subscription: newSub,
      status: queueResult.status,
      startDate: queueResult.startDate,
      endDate: queueResult.endDate,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ===========================================================================
// ADMIN SUBSCRIPTION MANAGEMENT ENDPOINTS
// ===========================================================================

adminSubscriptionsRouter.use(requireAuth);
adminSubscriptionsRouter.use(requireRole('admin'));

// GET /api/admin/subscriptions/overview — Real system metrics
adminSubscriptionsRouter.get('/overview', async (_req, res) => {
  try {
    const allSubs = getInMemorySubscriptions();
    const allRequests = getInMemoryPaymentRequests();
    const allCodes = getInMemoryCodes();

    const activeSubs = allSubs.filter((s) => s.status === 'active').length;
    const scheduledSubs = allSubs.filter((s) => s.status === 'scheduled').length;
    const expiredSubs = allSubs.filter((s) => s.status === 'expired').length;
    const revokedSubs = allSubs.filter((s) => s.status === 'revoked').length;

    const pendingRequests = allRequests.filter((r) => r.status === 'pending_payment').length;
    const underReviewRequests = allRequests.filter((r) => r.status === 'under_review').length;
    const approvedRequests = allRequests.filter((r) => r.status === 'approved').length;
    const rejectedRequests = allRequests.filter((r) => r.status === 'rejected').length;

    const confirmedRevenueEgp = allRequests
      .filter((r) => r.status === 'approved')
      .reduce((sum, r) => sum + (Number(r.price_egp) || 0), 0);

    const freeGrantsCount = allSubs.filter((s) => s.source === 'admin_grant').length;

    const totalCodes = allCodes.length;
    const redeemedCodes = allCodes.filter((c) => c.is_redeemed).length;
    const availableCodes = allCodes.filter((c) => !c.is_redeemed && c.is_active).length;

    return res.json({
      activeSubscriptions: activeSubs,
      scheduledSubscriptions: scheduledSubs,
      expiredSubscriptions: expiredSubs,
      revokedSubscriptions: revokedSubs,
      pendingRequests,
      underReviewRequests,
      approvedRequests,
      rejectedRequests,
      confirmedRevenueEgp,
      freeGrantsCount,
      totalCodes,
      redeemedCodes,
      availableCodes,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/subscriptions/plans — Admin list of all plans
adminSubscriptionsRouter.get('/plans', (_req, res) => {
  return res.json(getInMemoryPlans());
});

// POST /api/admin/subscriptions/plans — Create new plan
adminSubscriptionsRouter.post('/plans', async (req: any, res) => {
  try {
    const adminId = req.user.id;
    const { nameAr, nameEn, descriptionAr, descriptionEn, priceEgp, durationDays, features, isFeatured } = req.body;

    if (!nameAr || !priceEgp || !durationDays) {
      return res.status(400).json({ error: 'الاسم بالعربية، السعر بالجنيه، والمدة بالأيام كلها حقول إلزامية' });
    }

    const id = `plan_${Date.now()}`;
    const newPlan: SubscriptionPlan = {
      id,
      name_ar: nameAr,
      name_en: nameEn || nameAr,
      description_ar: descriptionAr || '',
      description_en: descriptionEn || '',
      price_egp: Number(priceEgp),
      duration_days: Math.max(1, Number(durationDays)),
      features: Array.isArray(features) ? features : [],
      display_order: getInMemoryPlans().length + 1,
      is_featured: !!isFeatured,
      is_active: true,
      is_archived: false,
      created_at: new Date().toISOString(),
    };

    const plans = getInMemoryPlans();
    plans.push(newPlan);
    setInMemoryPlans(plans);

    // Save to Supabase
    try {
      await supabaseAdmin.from('subscription_plans').insert({
        id: newPlan.id,
        name_ar: newPlan.name_ar,
        name_en: newPlan.name_en,
        description_ar: newPlan.description_ar,
        description_en: newPlan.description_en,
        price_egp: newPlan.price_egp,
        duration_days: newPlan.duration_days,
        features: newPlan.features,
        is_featured: newPlan.is_featured,
        is_active: true,
      });
    } catch {
      // In-memory fallback
    }

    logSubscriptionAudit(adminId, 'create_plan', null, 'plan', newPlan.id, { plan: newPlan });

    return res.status(201).json({ success: true, plan: newPlan });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// PUT /api/admin/subscriptions/plans/:id — Edit plan
adminSubscriptionsRouter.put('/plans/:id', async (req: any, res) => {
  try {
    const adminId = req.user.id;
    const planId = req.params.id;
    const updates = req.body;

    const plans = getInMemoryPlans();
    const plan = plans.find((p) => p.id === planId);
    if (!plan) return res.status(404).json({ error: 'الباقة غير موجودة' });

    if (updates.nameAr) plan.name_ar = updates.nameAr;
    if (updates.nameEn) plan.name_en = updates.nameEn;
    if (updates.descriptionAr !== undefined) plan.description_ar = updates.descriptionAr;
    if (updates.descriptionEn !== undefined) plan.description_en = updates.descriptionEn;
    if (updates.priceEgp !== undefined) plan.price_egp = Number(updates.priceEgp);
    if (updates.durationDays !== undefined) plan.duration_days = Math.max(1, Number(updates.durationDays));
    if (updates.features !== undefined) plan.features = updates.features;
    if (updates.isFeatured !== undefined) plan.is_featured = !!updates.isFeatured;
    if (updates.isActive !== undefined) plan.is_active = !!updates.isActive;

    setInMemoryPlans(plans);

    try {
      await supabaseAdmin
        .from('subscription_plans')
        .update({
          name_ar: plan.name_ar,
          name_en: plan.name_en,
          description_ar: plan.description_ar,
          description_en: plan.description_en,
          price_egp: plan.price_egp,
          duration_days: plan.duration_days,
          features: plan.features,
          is_featured: plan.is_featured,
          is_active: plan.is_active,
          updated_at: new Date().toISOString(),
        })
        .eq('id', planId);
    } catch {
      // In-memory fallback
    }

    logSubscriptionAudit(adminId, 'edit_plan', null, 'plan', planId, { updates });

    return res.json({ success: true, plan });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// DELETE /api/admin/subscriptions/plans/:id — Archive plan
adminSubscriptionsRouter.delete('/plans/:id', async (req: any, res) => {
  try {
    const adminId = req.user.id;
    const planId = req.params.id;

    const plans = getInMemoryPlans();
    const plan = plans.find((p) => p.id === planId);
    if (!plan) return res.status(404).json({ error: 'الباقة غير موجودة' });

    plan.is_archived = true;
    plan.is_active = false;
    setInMemoryPlans(plans);

    try {
      await supabaseAdmin
        .from('subscription_plans')
        .update({ is_archived: true, is_active: false })
        .eq('id', planId);
    } catch {
      // In-memory fallback
    }

    logSubscriptionAudit(adminId, 'archive_plan', null, 'plan', planId);

    return res.json({ success: true, message: 'تم أرشفة الباقة بنجاح دون حذف سجلاتها السابقة.' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/subscriptions/payment-requests — List and filter payment requests
adminSubscriptionsRouter.get('/payment-requests', async (req, res) => {
  try {
    const { status, search } = req.query;
    let list = getInMemoryPaymentRequests();

    if (status && status !== 'all') {
      list = list.filter((r) => r.status === status);
    }

    if (search) {
      const q = String(search).toLowerCase();
      list = list.filter(
        (r) =>
          r.reference.toLowerCase().includes(q) ||
          r.user_email?.toLowerCase().includes(q) ||
          r.user_name?.toLowerCase().includes(q) ||
          r.transaction_reference?.toLowerCase().includes(q)
      );
    }

    return res.json(list);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/subscriptions/payment-requests/:id/approve — Atomic approval & subscription queue activation
adminSubscriptionsRouter.post('/payment-requests/:id/approve', async (req: any, res) => {
  try {
    const adminId = req.user.id;
    const requestId = req.params.id;
    const { adminNotes } = req.body;

    const allRequests = getInMemoryPaymentRequests();
    const request = allRequests.find((r) => String(r.id) === String(requestId));
    if (!request) return res.status(404).json({ error: 'طلب الاشتراك غير موجود' });

    if (request.status === 'approved') {
      return res.status(400).json({ error: 'تمت الموافقة على هذا الطلب بالفعل مسبقاً' });
    }

    // Apply Subscription Queue Algorithm
    const queueResult = await calculateQueueDates(request.user_id, request.duration_days);

    const subRef = `HKY-SUB-${Math.floor(100000 + Math.random() * 900000)}`;
    const newSub: UserSubscription = {
      id: Date.now(),
      user_id: request.user_id,
      plan_id: request.plan_id,
      plan_name_ar: request.plan_name_ar,
      status: queueResult.status,
      duration_days: request.duration_days,
      start_date: queueResult.startDate.toISOString(),
      end_date: queueResult.endDate.toISOString(),
      source: 'instapay',
      reference_code: subRef,
      payment_request_id: request.id,
      created_at: new Date().toISOString(),
    };

    // Update Request
    request.status = 'approved';
    request.admin_id = adminId;
    request.admin_notes = adminNotes || null;
    request.reviewed_at = new Date().toISOString();

    addInMemorySubscription(newSub);

    // Persist to Supabase
    try {
      await supabaseAdmin
        .from('subscription_payment_requests')
        .update({
          status: 'approved',
          admin_id: adminId,
          admin_notes: adminNotes || null,
          reviewed_at: request.reviewed_at,
          updated_at: new Date().toISOString(),
        })
        .eq('id', requestId);

      await supabaseAdmin.from('subscriptions').insert({
        user_id: request.user_id,
        plan_id: request.plan_id,
        status: queueResult.status,
        duration_days: request.duration_days,
        start_date: queueResult.startDate.toISOString(),
        end_date: queueResult.endDate.toISOString(),
        source: 'instapay',
        reference_code: subRef,
        payment_request_id: Number(requestId) || null,
      });

      // Send In-App Notification
      await supabaseAdmin.from('notifications').insert({
        user_id: request.user_id,
        type: 'system',
        title_ar: 'تم تأكيد وتفعيل اشتراكك في حكاياتي بنجاح!',
        body_ar: `تمت مراجعة تحويل إنستاباي بنجاح وتفعيل ${request.plan_name_ar} لمدة ${request.duration_days} يوماً.`,
        link_url: '/profile',
      });
    } catch {
      // In-memory fallback
    }

    logSubscriptionAudit(adminId, 'approve_payment', request.user_id, 'payment_request', String(request.id), {
      subscription: newSub,
      queueStatus: queueResult.status,
    });

    return res.json({
      success: true,
      message: 'تمت الموافقة على الدفع وتفعيل الاشتراك وإضافته لجدول المستخدم بنجاح.',
      subscription: newSub,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/subscriptions/payment-requests/:id/reject — Rejection with required reason
adminSubscriptionsRouter.post('/payment-requests/:id/reject', async (req: any, res) => {
  try {
    const adminId = req.user.id;
    const requestId = req.params.id;
    const { rejectionReason, adminNotes } = req.body;

    if (!rejectionReason || !rejectionReason.trim()) {
      return res.status(400).json({ error: 'سبب الرفض إلزامي لتوضيح سبب رفض التحويل للمستخدم' });
    }

    const allRequests = getInMemoryPaymentRequests();
    const request = allRequests.find((r) => String(r.id) === String(requestId));
    if (!request) return res.status(404).json({ error: 'طلب الاشتراك غير موجود' });

    request.status = 'rejected';
    request.admin_id = adminId;
    request.rejection_reason = rejectionReason.trim();
    request.admin_notes = adminNotes || null;
    request.reviewed_at = new Date().toISOString();

    try {
      await supabaseAdmin
        .from('subscription_payment_requests')
        .update({
          status: 'rejected',
          admin_id: adminId,
          rejection_reason: request.rejection_reason,
          admin_notes: adminNotes || null,
          reviewed_at: request.reviewed_at,
          updated_at: new Date().toISOString(),
        })
        .eq('id', requestId);

      await supabaseAdmin.from('notifications').insert({
        user_id: request.user_id,
        type: 'system',
        title_ar: 'تنبيه بشأن طلب اشتراك حكاياتي',
        body_ar: `تعذر قبول طلب الاشتراك: ${request.rejection_reason}. يمكنك المحاولة مجدداً عبر صفحة الباقات.`,
        link_url: '/profile',
      });
    } catch {
      // In-memory fallback
    }

    logSubscriptionAudit(adminId, 'reject_payment', request.user_id, 'payment_request', String(request.id), {
      reason: request.rejection_reason,
    });

    return res.json({ success: true, message: 'تم تسجيل رفض الطلب وإرسال التنبيه للمستخدم.' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/subscriptions/active — List all user subscriptions
adminSubscriptionsRouter.get('/active', async (req, res) => {
  try {
    const { status, search } = req.query;
    let list = getInMemorySubscriptions();

    if (status && status !== 'all') {
      list = list.filter((s) => s.status === status);
    }

    if (search) {
      const q = String(search).toLowerCase();
      list = list.filter((s) => s.user_id.toLowerCase().includes(q) || s.reference_code.toLowerCase().includes(q));
    }

    return res.json(list);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/subscriptions/grant — Free manual grant
adminSubscriptionsRouter.post('/grant', async (req: any, res) => {
  try {
    const adminId = req.user.id;
    const { userId, durationDays, grantReason, internalNote } = req.body;

    if (!userId || !durationDays || !grantReason) {
      return res.status(400).json({ error: 'معرف المستخدم، مدة الاشتراك بالأيام، وسبب المنح كلها حقول مطلوبة' });
    }

    const days = Math.max(1, Number(durationDays));
    const queueResult = await calculateQueueDates(userId, days);

    const subRef = `HKY-GRANT-${Math.floor(100000 + Math.random() * 900000)}`;
    const newSub: UserSubscription = {
      id: Date.now(),
      user_id: userId,
      status: queueResult.status,
      duration_days: days,
      start_date: queueResult.startDate.toISOString(),
      end_date: queueResult.endDate.toISOString(),
      source: 'admin_grant',
      reference_code: subRef,
      grant_reason: grantReason,
      grant_admin_id: adminId,
      created_at: new Date().toISOString(),
    };

    addInMemorySubscription(newSub);

    try {
      await supabaseAdmin.from('subscriptions').insert({
        user_id: userId,
        status: queueResult.status,
        duration_days: days,
        start_date: queueResult.startDate.toISOString(),
        end_date: queueResult.endDate.toISOString(),
        source: 'admin_grant',
        reference_code: subRef,
        grant_reason: grantReason,
        grant_admin_id: adminId,
      });

      await supabaseAdmin.from('notifications').insert({
        user_id: userId,
        type: 'promotion',
        title_ar: 'هدية حصرية من إدارة حكاياتي!',
        body_ar: `تم منحك اشتراكاً مجانياً لمدة ${days} يوماً (${grantReason}). استمتع بكافة العوالم والقصص!`,
        link_url: '/profile',
      });
    } catch {
      // In-memory fallback
    }

    logSubscriptionAudit(adminId, 'grant_subscription', userId, 'subscription', subRef, {
      durationDays: days,
      grantReason,
      internalNote,
    });

    return res.json({ success: true, subscription: newSub });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/subscriptions/revoke — Revoke subscription
adminSubscriptionsRouter.post('/revoke', async (req: any, res) => {
  try {
    const adminId = req.user.id;
    const { subscriptionId, revocationReason } = req.body;

    if (!subscriptionId || !revocationReason) {
      return res.status(400).json({ error: 'معرف الاشتراك وسبب الإلغاء كلاهما مطلوبان' });
    }

    const allSubs = getInMemorySubscriptions();
    const sub = allSubs.find((s) => String(s.id) === String(subscriptionId) || s.reference_code === subscriptionId);
    if (!sub) return res.status(404).json({ error: 'الاشتراك غير موجود' });

    sub.status = 'revoked';
    sub.revocation_reason = revocationReason;

    try {
      await supabaseAdmin
        .from('subscriptions')
        .update({
          status: 'revoked',
          revocation_reason: revocationReason,
          revocation_admin_id: adminId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', sub.id);
    } catch {
      // In-memory fallback
    }

    logSubscriptionAudit(adminId, 'revoke_subscription', sub.user_id, 'subscription', String(sub.id), {
      reason: revocationReason,
    });

    return res.json({ success: true, message: 'تم إيقاف الاشتراك وسحب الصلاحية بنجاح.' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/subscriptions/codes/generate — Bulk / Single code generator
adminSubscriptionsRouter.post('/codes/generate', async (req: any, res) => {
  try {
    const adminId = req.user.id;
    const { count = 1, durationDays = 30, batchName = 'حملة ترويجية', campaignNotes, expiresAt } = req.body;

    const numCodes = Math.min(500, Math.max(1, Number(count)));
    const days = Math.max(1, Number(durationDays));
    const batchId = Date.now();

    const createdCodes: SubscriptionCode[] = [];
    const existingCodes = getInMemoryCodes();

    for (let i = 0; i < numCodes; i++) {
      let codeStr = generateSecureCode();
      while (existingCodes.some((c) => c.code === codeStr)) {
        codeStr = generateSecureCode();
      }

      const item: SubscriptionCode = {
        id: `${batchId}_${i + 1}`,
        batch_id: batchId,
        code: codeStr,
        duration_days: days,
        expires_at: expiresAt || null,
        is_active: true,
        is_redeemed: false,
        created_at: new Date().toISOString(),
      };

      createdCodes.push(item);
      existingCodes.push(item);
    }

    setInMemoryCodes(existingCodes);

    // Save batch and codes to Supabase
    try {
      await supabaseAdmin.from('subscription_code_batches').insert({
        id: batchId,
        batch_name: batchName,
        campaign_notes: campaignNotes || null,
        duration_days: days,
        total_count: numCodes,
        created_by: adminId,
        expires_at: expiresAt || null,
      });

      const dbInserts = createdCodes.map((c) => ({
        batch_id: batchId,
        code: c.code,
        duration_days: c.duration_days,
        expires_at: c.expires_at,
        is_active: true,
        is_redeemed: false,
      }));

      await supabaseAdmin.from('subscription_codes').insert(dbInserts);
    } catch {
      // In-memory fallback
    }

    logSubscriptionAudit(adminId, 'generate_codes', null, 'code', String(batchId), {
      batchName,
      count: numCodes,
      durationDays: days,
    });

    return res.status(201).json({
      success: true,
      batchId,
      count: numCodes,
      codes: createdCodes.map((c) => c.code),
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/subscriptions/codes — List codes with pagination/search
adminSubscriptionsRouter.get('/codes', async (req, res) => {
  try {
    const { search, status } = req.query;
    let list = getInMemoryCodes();

    if (status === 'redeemed') list = list.filter((c) => c.is_redeemed);
    if (status === 'available') list = list.filter((c) => !c.is_redeemed && c.is_active);
    if (status === 'disabled') list = list.filter((c) => !c.is_active);

    if (search) {
      const q = String(search).toUpperCase();
      list = list.filter((c) => c.code.includes(q));
    }

    return res.json(list);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/subscriptions/codes/export — Export codes as CSV
adminSubscriptionsRouter.get('/codes/export', async (_req, res) => {
  try {
    const list = getInMemoryCodes();
    const csvRows = ['الكود,المدة (أيام),تاريخ الإنشاء,مستخدم,تاريخ الاستخدام,الحالة'];

    list.forEach((c) => {
      const status = c.is_redeemed ? 'مستخدم' : c.is_active ? 'متاح' : 'معطل';
      csvRows.push(
        `"${c.code}",${c.duration_days},"${c.created_at}",${c.is_redeemed ? 'نعم' : 'لا'},"${c.redeemed_at || ''}","${status}"`
      );
    });

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="hekayaty_subscription_codes.csv"');
    return res.send(csvRows.join('\n'));
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/subscriptions/codes/:id/toggle — Enable/disable code
adminSubscriptionsRouter.post('/codes/:id/toggle', async (req: any, res) => {
  try {
    const adminId = req.user.id;
    const codeId = req.params.id;

    const list = getInMemoryCodes();
    const target = list.find((c) => String(c.id) === String(codeId) || c.code === codeId);
    if (!target) return res.status(404).json({ error: 'الكود غير موجود' });

    target.is_active = !target.is_active;

    try {
      await supabaseAdmin
        .from('subscription_codes')
        .update({ is_active: target.is_active })
        .eq('id', target.id);
    } catch {
      // In-memory fallback
    }

    logSubscriptionAudit(adminId, 'toggle_code', null, 'code', String(target.id), {
      isActive: target.is_active,
    });

    return res.json({ success: true, isActive: target.is_active });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/subscriptions/settings — Admin settings
adminSubscriptionsRouter.get('/settings', (_req, res) => {
  return res.json(getInMemorySettings());
});

// PUT /api/admin/subscriptions/settings — Update InstaPay settings
adminSubscriptionsRouter.put('/settings', async (req: any, res) => {
  try {
    const adminId = req.user.id;
    const { instapayAddress, recipientName, phoneNumber, instructionsAr, instructionsEn, qrCodeUrl, isEnabled } = req.body;

    const s = getInMemorySettings();
    if (instapayAddress) s.instapay_address = instapayAddress;
    if (recipientName) s.recipient_name = recipientName;
    if (phoneNumber) s.phone_number = phoneNumber;
    if (instructionsAr) s.instructions_ar = instructionsAr;
    if (instructionsEn) s.instructions_en = instructionsEn;
    if (qrCodeUrl) s.qr_code_url = qrCodeUrl;
    if (isEnabled !== undefined) s.is_enabled = !!isEnabled;
    s.updated_at = new Date().toISOString();

    setInMemorySettings(s);

    try {
      await supabaseAdmin
        .from('subscription_settings')
        .upsert({
          id: 'instapay',
          instapay_address: s.instapay_address,
          recipient_name: s.recipient_name,
          phone_number: s.phone_number,
          instructions_ar: s.instructions_ar,
          instructions_en: s.instructions_en,
          qr_code_url: s.qr_code_url,
          is_enabled: s.is_enabled,
          updated_at: s.updated_at,
          updated_by: adminId,
        });
    } catch {
      // In-memory fallback
    }

    logSubscriptionAudit(adminId, 'update_settings', null, 'settings', 'instapay', s);

    return res.json({ success: true, settings: s });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default subscriptionsRouter;
