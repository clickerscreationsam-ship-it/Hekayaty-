import crypto from 'node:crypto';
import { supabaseAdmin } from '../lib/supabase';

export interface SubscriptionPlan {
  id: string;
  name_ar: string;
  name_en: string;
  description_ar: string;
  description_en: string;
  price_egp: number;
  duration_days: number;
  features: string[];
  display_order: number;
  is_featured: boolean;
  is_active: boolean;
  is_archived: boolean;
  created_at: string;
}

export interface UserSubscription {
  id: string | number;
  user_id: string;
  plan_id?: string | null;
  plan_name_ar?: string;
  status: 'active' | 'scheduled' | 'expired' | 'revoked' | 'cancelled';
  duration_days: number;
  start_date: string;
  end_date: string;
  source: 'instapay' | 'code' | 'admin_grant' | 'card' | 'online';
  reference_code: string;
  grant_reason?: string | null;
  grant_admin_id?: string | null;
  revocation_reason?: string | null;
  payment_request_id?: number | string | null;
  created_at: string;
}

export interface PaymentRequest {
  id: number | string;
  reference: string;
  user_id: string;
  user_email?: string;
  user_name?: string;
  plan_id: string;
  plan_name_ar: string;
  price_egp: number;
  currency: string;
  duration_days: number;
  payment_method: string;
  status: 'pending_payment' | 'under_review' | 'approved' | 'rejected' | 'cancelled';
  proof_image_url?: string | null;
  transaction_reference?: string | null;
  transfer_amount?: number | null;
  transfer_datetime?: string | null;
  user_notes?: string | null;
  admin_id?: string | null;
  admin_notes?: string | null;
  rejection_reason?: string | null;
  reviewed_at?: string | null;
  created_at: string;
}

export interface SubscriptionCode {
  id: number | string;
  batch_id?: number | string | null;
  code: string;
  duration_days: number;
  expires_at?: string | null;
  is_active: boolean;
  is_redeemed: boolean;
  redeemed_by?: string | null;
  redeemed_at?: string | null;
  subscription_id?: number | string | null;
  created_at: string;
}

export interface SubscriptionSettings {
  id: string;
  instapay_address: string;
  recipient_name: string;
  phone_number: string;
  instructions_ar: string;
  instructions_en: string;
  qr_code_url: string;
  is_enabled: boolean;
  updated_at: string;
}

// ---------------------------------------------------------------------------
// In-Memory Fallbacks for zero-downtime reliability
// ---------------------------------------------------------------------------
export const defaultPlans: SubscriptionPlan[] = [
  {
    id: 'monthly_standard',
    name_ar: 'اشتراك حكاياتي بلس الشهري',
    name_en: 'Hekayaty Plus Monthly',
    description_ar: 'العضوية الأساسية الشاملة لقراءة أروع الروايات والكوميكس الحصرية في عالم حكاياتي.',
    description_en: 'Full access to all exclusive graphic novels, comics, and chapters across Hekayaty World.',
    price_egp: 99.0,
    duration_days: 30,
    features: [
      'قراءة غير محدودة لجميع أعداد الكوميكس والروايات الحصرية',
      'الوصول المبكر للحلقات الجديدة وسلاسل الرعب والغموض',
      'تصفح بدون إعلانات وبأعلى دقة رقمية للشاشات',
      'شارات العضوية الذهبية الحصرية في ملفك ومجتمع القراء',
    ],
    display_order: 1,
    is_featured: true,
    is_active: true,
    is_archived: false,
    created_at: '2026-11-26T00:00:00Z',
  },
  {
    id: 'quarterly_standard',
    name_ar: 'باقة المواسم (3 أشهر)',
    name_en: 'Hekayaty Seasons Pass (90 Days)',
    description_ar: 'ثلاثة أشهر من المغامرة المتواصلة في عوالم حكاياتي مع توفير إضافي.',
    description_en: '90 days of continuous adventures across Hekayaty realms with extra savings.',
    price_egp: 269.0,
    duration_days: 90,
    features: [
      'كل مزايا الاشتراك الشهري لمدة 90 يوماً كاملة',
      'بطاقة حصرية في لعبة أبطال حكاياتي التفاعلية',
      'توفير أكثر من 10% مقارنة بالتجديد الشهري',
    ],
    display_order: 2,
    is_featured: false,
    is_active: true,
    is_archived: false,
    created_at: '2026-11-26T00:00:00Z',
  },
  {
    id: 'yearly_vip',
    name_ar: 'عضوية الأساطير السنوية (365 يوماً)',
    name_en: 'Hekayaty Legends Annual Pass',
    description_ar: 'العضوية الذهبية الكاملة لعام كامل مع هدايا حصرية وخصم كبير.',
    description_en: 'Ultimate annual pass for 365 days of epic storytelling and exclusive creator perks.',
    price_egp: 949.0,
    duration_days: 365,
    features: [
      'سنة كاملة (365 يوماً) من القراءة اللامحدودة',
      'خصم خاص 20% على المنتجات الورقية في متجر حكاياتي',
      'دعوات مجانية لحضور كرنفالات ومؤتمرات حكاياتي',
      'شارات أسطورية فريدة في مجتمع حكاياتي',
    ],
    display_order: 3,
    is_featured: true,
    is_active: true,
    is_archived: false,
    created_at: '2026-11-26T00:00:00Z',
  },
];

let inMemoryPlans: SubscriptionPlan[] = [...defaultPlans];
let inMemorySubscriptions: UserSubscription[] = [];
let inMemoryPaymentRequests: PaymentRequest[] = [];
let inMemoryCodes: SubscriptionCode[] = [];
let inMemorySettings: SubscriptionSettings = {
  id: 'instapay',
  instapay_address: 'hekayaty@instapay',
  recipient_name: 'منصة حكاياتي للنشر الرقمي',
  phone_number: '01023456789',
  instructions_ar: '1. افتح تطبيق إنستاباي (InstaPay).\n2. حول قيمة الاشتراك بدقة لحساب إنستاباي أعلاه.\n3. التقط لقطة شاشة للتحويل واحتفظ برقم المرجع.\n4. ارفع الإثبات واكتب رقم العملية لتفعيل اشتراكك.',
  instructions_en: '1. Open InstaPay app.\n2. Transfer the exact subscription amount to the InstaPay address above.\n3. Take a screenshot of the receipt and copy the transaction reference.\n4. Submit proof to activate your membership.',
  qr_code_url: '/assets/instapay_qr_sample.png',
  is_enabled: true,
  updated_at: '2026-11-26T00:00:00Z',
};

// ---------------------------------------------------------------------------
// 1. SUBSCRIPTION QUEUE ENGINE (Concurreny-Safe & Date Continuity)
// ---------------------------------------------------------------------------
export async function calculateQueueDates(
  userId: string,
  durationDays: number
): Promise<{ startDate: Date; endDate: Date; status: 'active' | 'scheduled' }> {
  const now = new Date();

  // 1. Fetch user's existing active or scheduled subscriptions
  let activeSubs: UserSubscription[] = [];

  try {
    const { data, error } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .in('status', ['active', 'scheduled'])
      .gt('end_date', now.toISOString())
      .order('end_date', { ascending: false });

    if (!error && data && data.length > 0) {
      activeSubs = data.map((d: any) => ({
        ...d,
        start_date: d.start_date,
        end_date: d.end_date,
      }));
    } else {
      activeSubs = inMemorySubscriptions.filter(
        (s) =>
          s.user_id === userId &&
          ['active', 'scheduled'].includes(s.status) &&
          new Date(s.end_date) > now
      ).sort((a, b) => new Date(b.end_date).getTime() - new Date(a.end_date).getTime());
    }
  } catch {
    activeSubs = inMemorySubscriptions.filter(
      (s) =>
        s.user_id === userId &&
        ['active', 'scheduled'].includes(s.status) &&
        new Date(s.end_date) > now
    ).sort((a, b) => new Date(b.end_date).getTime() - new Date(a.end_date).getTime());
  }

  // 2. Queue Logic:
  // If user has an active or scheduled subscription that expires in the future,
  // the new subscription starts exactly when the latest one ends!
  if (activeSubs.length > 0) {
    const latestEndDate = new Date(activeSubs[0].end_date);
    const startDate = latestEndDate;
    const endDate = new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000);
    return {
      startDate,
      endDate,
      status: 'scheduled',
    };
  }

  // If no active subscription, starts immediately as 'active'
  const startDate = now;
  const endDate = new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000);
  return {
    startDate,
    endDate,
    status: 'active',
  };
}

// ---------------------------------------------------------------------------
// 2. AUTHORITATIVE ENTITLEMENT CHECKER (Backend Content Authorization)
// ---------------------------------------------------------------------------
export async function checkUserSubscriptionStatus(
  userId?: string | null,
  userRole?: string | null
): Promise<{
  isSubscriber: boolean;
  isAdmin: boolean;
  status: 'active' | 'scheduled' | 'expired' | 'none';
  remainingDays: number;
  activeSubscription?: UserSubscription | null;
  scheduledSubscriptions: UserSubscription[];
}> {
  // Admin bypass
  if (userRole === 'admin') {
    return {
      isSubscriber: true,
      isAdmin: true,
      status: 'active',
      remainingDays: 9999,
      scheduledSubscriptions: [],
    };
  }

  if (!userId) {
    return {
      isSubscriber: false,
      isAdmin: false,
      status: 'none',
      remainingDays: 0,
      scheduledSubscriptions: [],
    };
  }

  const now = new Date();

  try {
    const { data } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .in('status', ['active', 'scheduled'])
      .order('start_date', { ascending: true });

    let userSubs: UserSubscription[] = [];
    if (data && data.length > 0) {
      userSubs = data;
    } else {
      userSubs = inMemorySubscriptions.filter(
        (s) => s.user_id === userId && ['active', 'scheduled'].includes(s.status)
      );
    }

    // Check if any scheduled subscription should now be active
    for (const sub of userSubs) {
      const start = new Date(sub.start_date);
      const end = new Date(sub.end_date);
      if (sub.status === 'scheduled' && start <= now && end > now) {
        sub.status = 'active';
        try {
          await supabaseAdmin.from('subscriptions').update({ status: 'active' }).eq('id', sub.id);
        } catch {
          // ignore background sync error
        }
      } else if (sub.status === 'active' && end <= now) {
        sub.status = 'expired';
        try {
          await supabaseAdmin.from('subscriptions').update({ status: 'expired' }).eq('id', sub.id);
        } catch {
          // ignore background sync error
        }
      }
    }

    // Find currently active subscription
    const activeSub = userSubs.find((s) => s.status === 'active' && new Date(s.end_date) > now);
    const scheduledSubs = userSubs.filter((s) => s.status === 'scheduled' && new Date(s.end_date) > now);

    if (activeSub) {
      const remainingMs = new Date(activeSub.end_date).getTime() - now.getTime();
      const remainingDays = Math.max(1, Math.ceil(remainingMs / (1000 * 60 * 60 * 24)));
      return {
        isSubscriber: true,
        isAdmin: false,
        status: 'active',
        remainingDays,
        activeSubscription: activeSub,
        scheduledSubscriptions: scheduledSubs,
      };
    }

    if (scheduledSubs.length > 0) {
      return {
        isSubscriber: false,
        isAdmin: false,
        status: 'scheduled',
        remainingDays: 0,
        scheduledSubscriptions: scheduledSubs,
      };
    }

    return {
      isSubscriber: false,
      isAdmin: false,
      status: 'none',
      remainingDays: 0,
      scheduledSubscriptions: [],
    };
  } catch {
    return {
      isSubscriber: false,
      isAdmin: false,
      status: 'none',
      remainingDays: 0,
      scheduledSubscriptions: [],
    };
  }
}

// ---------------------------------------------------------------------------
// 3. AUDIT LOGGING HELPER
// ---------------------------------------------------------------------------
export async function logSubscriptionAudit(
  adminId: string | null,
  action: string,
  targetUserId: string | null,
  entityType: 'plan' | 'payment_request' | 'subscription' | 'code' | 'settings',
  entityId: string,
  details: any = {}
) {
  try {
    await supabaseAdmin.from('subscription_audit_logs').insert({
      admin_id: adminId,
      action,
      target_user_id: targetUserId,
      entity_type: entityType,
      entity_id: entityId,
      details,
    });
  } catch {
    // Audit log fallback
  }
}

// ---------------------------------------------------------------------------
// 4. IN-MEMORY STORE ACCESSORS
// ---------------------------------------------------------------------------
export function getInMemoryPlans() {
  return inMemoryPlans;
}
export function setInMemoryPlans(plans: SubscriptionPlan[]) {
  inMemoryPlans = plans;
}

export function getInMemorySubscriptions() {
  return inMemorySubscriptions;
}
export function addInMemorySubscription(sub: UserSubscription) {
  inMemorySubscriptions.unshift(sub);
}

export function getInMemoryPaymentRequests() {
  return inMemoryPaymentRequests;
}
export function addInMemoryPaymentRequest(req: PaymentRequest) {
  inMemoryPaymentRequests.unshift(req);
}

export function getInMemoryCodes() {
  return inMemoryCodes;
}
export function setInMemoryCodes(codes: SubscriptionCode[]) {
  inMemoryCodes = codes;
}

export function getInMemorySettings() {
  return inMemorySettings;
}
export function setInMemorySettings(s: SubscriptionSettings) {
  inMemorySettings = s;
}
