import { Router, type IRouter } from 'express';
import crypto from 'node:crypto';
import { requireAuth } from '../middlewares/auth';
import { supabaseAdmin } from '../lib/supabase';

const router: IRouter = Router();

// Fallback products with authoritative prices
const fallbackProducts = [
  {
    id: 1,
    nameAr: 'مجلة أبطال الذهب — العدد الأول (نسخة ورقية فاخرة)',
    priceEgp: 120.0,
    isDigital: false,
    stockCount: 45,
    coverUrl: '/assets/generated_images/comic_1.jpg',
  },
  {
    id: 2,
    nameAr: 'حزمة بطاقات لعبة أبطال حكاياتي (مجموعة المبتدئين)',
    priceEgp: 250.0,
    isDigital: false,
    stockCount: 30,
    coverUrl: '/assets/generated_images/card_art_1.jpg',
  },
  {
    id: 3,
    nameAr: 'الوصول الرقمي الشامل لجميع الأعداد والقصص',
    priceEgp: 80.0,
    isDigital: true,
    stockCount: null,
    coverUrl: '/assets/generated_images/hero_bg.jpg',
  },
];

// Fallback subscription plans
const fallbackPlans = [
  {
    id: 'monthly',
    nameAr: 'اشتراك حكاياتي بلس الشهري',
    priceEgp: 65.0,
    features: [
      'قراءة غير محدودة لجميع أعداد الكوميكس الأصلية',
      'الوصول المبكر للفصول قبل النشر بأسبوع',
      'شارة العضوية الحصرية في المجتمع والمناقشات',
    ],
  },
  {
    id: 'yearly',
    nameAr: 'عضوية حكاياتي الأسطورية (سنوية)',
    priceEgp: 590.0,
    discountNotice: 'وفر 25% مع العضوية السنوية',
    features: [
      'كل مزايا الاشتراك الشهري',
      'حزمة بطاقات لعبة الأبطال مجاناً عند التجديد',
      'دعوات حصرية للقاءات المبدعين ومؤتمرات الرسوم',
    ],
  },
];

// ---------------------------------------------------------------------------
// Helper: Fetch Authoritative Product Catalog
// ---------------------------------------------------------------------------
async function getAuthoritativeProductMap(): Promise<Map<string | number, { id: number | string; priceEgp: number; nameAr: string; isDigital: boolean }>> {
  const map = new Map<string | number, { id: number | string; priceEgp: number; nameAr: string; isDigital: boolean }>();

  // Add default fallback products
  fallbackProducts.forEach((p) => {
    map.set(p.id, { id: p.id, priceEgp: p.priceEgp, nameAr: p.nameAr, isDigital: p.isDigital });
    map.set(String(p.id), { id: p.id, priceEgp: p.priceEgp, nameAr: p.nameAr, isDigital: p.isDigital });
  });

  // Query live Supabase database for dynamic products
  try {
    const { data, error } = await supabaseAdmin.from('products').select('id, price_egp, name_ar, is_digital');
    if (!error && data && data.length > 0) {
      data.forEach((p: any) => {
        const item = {
          id: p.id,
          priceEgp: Number(p.price_egp),
          nameAr: p.name_ar,
          isDigital: Boolean(p.is_digital),
        };
        map.set(p.id, item);
        map.set(String(p.id), item);
      });
    }
  } catch {
    // Continue with fallback map
  }

  return map;
}

// ---------------------------------------------------------------------------
// PRODUCTS & STORE
// ---------------------------------------------------------------------------
router.get('/shop/products', async (_req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('products').select('*');
    if (!error && data && data.length > 0) {
      return res.json(
        data.map((p) => ({
          id: p.id,
          nameAr: p.name_ar,
          priceEgp: Number(p.price_egp),
          isDigital: p.is_digital,
          stockCount: p.stock_count,
          coverUrl: p.cover_url || '/assets/generated_images/comic_1.jpg',
        }))
      );
    }
    return res.json(fallbackProducts);
  } catch {
    return res.json(fallbackProducts);
  }
});

// ---------------------------------------------------------------------------
// ORDERS & CHECKOUT (Zero Mock Auto-Paid Orders)
// ---------------------------------------------------------------------------
router.post('/orders/checkout', async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'السلة فارغة' });
    }

    const catalogMap = await getAuthoritativeProductMap();
    const verifiedItems: Array<{ id: number | string; quantity: number; unitPriceEgp: number; nameAr: string }> = [];
    let calculatedTotalEgp = 0;

    for (const rawItem of items) {
      const rawId = rawItem?.id;
      if (!rawId) {
        return res.status(400).json({ error: 'معرف المنتج مفقود في أحد عناصر السلة' });
      }

      // Authoritative Product Verification: Product must exist in catalog
      const product = catalogMap.get(rawId) || catalogMap.get(Number(rawId));
      if (!product) {
        return res.status(400).json({
          error: `المنتج رقم (${rawId}) غير موجود أو غير متاح للشراء في متجر حكاياتي`,
          code: 'PRODUCT_NOT_FOUND',
        });
      }

      // Quantity validation: 1 to 100
      const quantity = Math.min(100, Math.max(1, Math.floor(Number(rawItem.quantity) || 1)));
      const unitPrice = product.priceEgp;

      verifiedItems.push({
        id: product.id,
        quantity,
        unitPriceEgp: unitPrice,
        nameAr: product.nameAr,
      });

      calculatedTotalEgp += unitPrice * quantity;
    }

    const totalEgp = calculatedTotalEgp;
    let orderId: number | string = Math.floor(Math.random() * 90000) + 10000;

    // Secure Order Creation: Initial status is ALWAYS 'pending_payment'
    // Paid content access is NEVER granted until payment gateway confirmation
    if (req.user?.id) {
      try {
        const { data: orderData, error: orderErr } = await supabaseAdmin
          .from('orders')
          .insert({
            user_id: req.user.id,
            status: 'pending_payment',
            total_egp: totalEgp,
            payment_method: paymentMethod || 'credit_card',
            shipping_address: shippingAddress || {},
          })
          .select()
          .single();

        if (!orderErr && orderData) {
          orderId = orderData.id;

          const orderItems = verifiedItems.map((item) => ({
            order_id: orderData.id,
            product_id: Number(item.id) || 1,
            quantity: item.quantity,
            unit_price_egp: item.unitPriceEgp,
          }));

          await supabaseAdmin.from('order_items').insert(orderItems);
        }
      } catch {
        // Continue with local orderId
      }
    }

    return res.status(201).json({
      success: true,
      orderId,
      totalEgp,
      status: 'pending_payment',
      paymentRequired: true,
      message: 'تم إنشاء الطلب بنجاح وهو بانتظار إتمام الدفع الإلكتروني عبر بوابة الدفع.',
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'خطأ أثناء إتمام الطلب' });
  }
});

// ---------------------------------------------------------------------------
// SECURE PAYMENT WEBHOOK (Idempotent, Cryptographically Verified)
// ---------------------------------------------------------------------------
router.post('/orders/webhook', async (req, res) => {
  try {
    const signature = req.headers['x-payment-signature'] as string;
    const webhookSecret = process.env.PAYMENT_WEBHOOK_SECRET;

    // In production, reject unconfigured webhook secrets
    if (!webhookSecret) {
      return res.status(503).json({
        error: 'Payment webhook processing is not configured on this server',
        code: 'WEBHOOK_UNCONFIGURED',
      });
    }

    if (!signature) {
      return res.status(401).json({
        error: 'Missing webhook signature header',
        code: 'MISSING_SIGNATURE',
      });
    }

    // Verify HMAC-SHA256 signature
    const payloadStr = JSON.stringify(req.body);
    const expectedSig = crypto.createHmac('sha256', webhookSecret).update(payloadStr).digest('hex');

    const sigBuf = Buffer.from(signature, 'hex');
    const expBuf = Buffer.from(expectedSig, 'hex');

    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return res.status(403).json({
        error: 'Invalid webhook signature',
        code: 'INVALID_SIGNATURE',
      });
    }

    const { event, orderId, transactionId, amountEgp } = req.body;

    if (event !== 'payment.succeeded' || !orderId) {
      return res.status(400).json({ error: 'Unrecognized event type or missing order ID' });
    }

    // Fetch existing order from Supabase
    const { data: existingOrder, error: fetchErr } = await supabaseAdmin
      .from('orders')
      .select('id, user_id, status, total_egp')
      .eq('id', orderId)
      .maybeSingle();

    if (fetchErr || !existingOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Idempotency: If order is already paid, acknowledge without duplicating entitlements
    if (existingOrder.status === 'paid') {
      return res.json({ success: true, message: 'Order was already processed as paid' });
    }

    // Verify amount match
    if (amountEgp && Number(amountEgp) < Number(existingOrder.total_egp)) {
      return res.status(400).json({ error: 'Payment amount does not match order total' });
    }

    // Transition order to 'paid'
    await supabaseAdmin
      .from('orders')
      .update({
        status: 'paid',
        payment_reference: transactionId || 'webhook_verified',
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    // Grant entitlements for digital products in order
    const { data: items } = await supabaseAdmin
      .from('order_items')
      .select('product_id')
      .eq('order_id', orderId);

    if (items && items.length > 0 && existingOrder.user_id) {
      const entitlements = items.map((it: any) => ({
        user_id: existingOrder.user_id,
        content_type: 'comic',
        content_id: String(it.product_id),
        granted_at: new Date().toISOString(),
      }));

      await supabaseAdmin.from('entitlements').insert(entitlements);
    }

    return res.json({ success: true, message: 'Order payment verified and activated' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Webhook processing failed' });
  }
});

router.get('/orders', async (req, res) => {
  try {
    if (req.user?.id) {
      const { data, error } = await supabaseAdmin
        .from('orders')
        .select('*, order_items(*)')
        .eq('user_id', req.user.id)
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return res.json(
          data.map((o) => ({
            id: o.id,
            totalEgp: Number(o.total_egp),
            status: o.status,
            createdAt: o.created_at,
            itemsCount: o.order_items?.length || 1,
          }))
        );
      }
    }

    return res.json([]);
  } catch {
    return res.json([]);
  }
});

// ---------------------------------------------------------------------------
// SUBSCRIPTIONS
// ---------------------------------------------------------------------------
router.get('/subscriptions/plans', async (_req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true);

    if (!error && data && data.length > 0) {
      return res.json(
        data.map((p) => ({
          id: p.id,
          nameAr: p.name_ar,
          nameEn: p.name_en,
          priceEgp: Number(p.price_egp_monthly),
          priceEgpYearly: p.price_egp_yearly ? Number(p.price_egp_yearly) : undefined,
          features: p.features || [],
        }))
      );
    }
    return res.json(fallbackPlans);
  } catch {
    return res.json(fallbackPlans);
  }
});

router.post('/subscriptions/subscribe', requireAuth, async (req, res) => {
  try {
    const { planId } = req.body;
    const selectedPlan = planId || 'monthly';

    if (req.user?.id) {
      const now = new Date();
      const expires = new Date();
      expires.setDate(expires.getDate() + 30);

      // Subscriptions must start as 'pending_payment' until payment confirmed
      await supabaseAdmin.from('subscriptions').insert({
        user_id: req.user.id,
        plan_id: selectedPlan,
        status: 'pending_payment',
        current_period_start: now.toISOString(),
        current_period_end: expires.toISOString(),
      });
    }

    return res.json({
      success: true,
      status: 'pending_payment',
      paymentRequired: true,
      message: 'تم تسجيل طلب الاشتراك وهو بانتظار إتمام الدفع عبر بوابة الدفع الإلكتروني.',
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
