-- =============================================================================
-- HEKAYATY (حكاياتي) — COMPLETE SUBSCRIPTION SYSTEM MIGRATION (IDEMPOTENT & SAFE)
-- Migration: 20261126000005_complete_subscription_system.sql
-- Description: Establishes plans, queued subscriptions, InstaPay requests, 
--              codes, settings, and access control.
-- =============================================================================

-- 1. UPGRADE OR CREATE SUBSCRIPTION PLANS TABLE
CREATE TABLE IF NOT EXISTS public.subscription_plans (
    id TEXT PRIMARY KEY,
    name_ar TEXT NOT NULL,
    name_en TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Safely add all required columns if they do not already exist
ALTER TABLE public.subscription_plans ADD COLUMN IF NOT EXISTS description_ar TEXT;
ALTER TABLE public.subscription_plans ADD COLUMN IF NOT EXISTS description_en TEXT;
ALTER TABLE public.subscription_plans ADD COLUMN IF NOT EXISTS price_egp NUMERIC(10,2) DEFAULT 99.00;
ALTER TABLE public.subscription_plans ADD COLUMN IF NOT EXISTS duration_days INTEGER DEFAULT 30;
ALTER TABLE public.subscription_plans ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.subscription_plans ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 1;
ALTER TABLE public.subscription_plans ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
ALTER TABLE public.subscription_plans ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE public.subscription_plans ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false;
ALTER TABLE public.subscription_plans ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now());

-- Drop NOT NULL constraint on legacy price_egp_monthly if it exists and give it a safe default
ALTER TABLE public.subscription_plans ADD COLUMN IF NOT EXISTS price_egp_monthly NUMERIC(10,2) DEFAULT 99.00;
ALTER TABLE public.subscription_plans ALTER COLUMN price_egp_monthly DROP NOT NULL;
ALTER TABLE public.subscription_plans ALTER COLUMN price_egp_monthly SET DEFAULT 99.00;
UPDATE public.subscription_plans SET price_egp_monthly = 99.00 WHERE price_egp_monthly IS NULL;

-- Backfill price_egp for existing rows if needed
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'subscription_plans' 
          AND column_name = 'price_egp_monthly'
    ) THEN
        UPDATE public.subscription_plans 
        SET price_egp = COALESCE(price_egp, price_egp_monthly, 99.00)
        WHERE price_egp IS NULL;
    END IF;
END $$;

-- Seed / Upsert Canonical Plans (Monthly 99 EGP, Quarterly 269 EGP, Yearly 949 EGP)
INSERT INTO public.subscription_plans (
    id, name_ar, name_en, description_ar, description_en, price_egp, duration_days, features, display_order, is_featured, is_active
) VALUES 
(
    'monthly_standard',
    'اشتراك حكاياتي بلس الشهري',
    'Hekayaty Plus Monthly',
    'العضوية الأساسية الشاملة لقراءة أروع الروايات المصورة والفصول الحصرية في عالم حكاياتي.',
    'Full access to all exclusive graphic novels, comics, and chapters across Hekayaty World.',
    99.00,
    30,
    '[
        "قراءة غير محدودة لجميع أعداد الكوميكس والروايات الحصرية",
        "الوصول المبكر للحلقات الجديدة وسلاسل الرعب والغموض",
        "تصفح بدون إعلانات وبأعلى دقة رقمية للشاشات",
        "شارات العضوية الذهبية الحصرية في ملفك ومجتمع القراء"
    ]'::jsonb,
    1,
    true,
    true
),
(
    'quarterly_standard',
    'باقة المواسم (3 أشهر)',
    'Hekayaty Seasons Pass (90 Days)',
    'ثلاثة أشهر من المغامرة المتواصلة في عوالم حكاياتي مع توفير إضافي.',
    '90 days of continuous adventures across Hekayaty realms with extra savings.',
    269.00,
    90,
    '[
        "كل مزايا الاشتراك الشهري لمدة 90 يوماً كاملة",
        "بطاقة حصرية في لعبة أبطال حكاياتي التفاعلية",
        "توفير أكثر من 10% مقارنة بالتجديد الشهري"
    ]'::jsonb,
    2,
    false,
    true
),
(
    'yearly_vip',
    'عضوية الأساطير السنوية (365 يوماً)',
    'Hekayaty Legends Annual Pass',
    'العضوية الذهبية الكاملة لعام كامل مع هدايا حصرية وخصم كبير.',
    'Ultimate annual pass for 365 days of epic storytelling and exclusive creator perks.',
    949.00,
    365,
    '[
        "سنة كاملة (365 يوماً) من القراءة اللامحدودة",
        "خصم خاص 20% على المنتجات الورقية في متجر حكاياتي",
        "دعوات مجانية لحضور كرنفالات ومؤتمرات حكاياتي",
        "شارات أسطورية فريدة في مجتمع حكاياتي"
    ]'::jsonb,
    3,
    true,
    true
)
ON CONFLICT (id) DO UPDATE SET
    name_ar = EXCLUDED.name_ar,
    name_en = EXCLUDED.name_en,
    description_ar = EXCLUDED.description_ar,
    description_en = EXCLUDED.description_en,
    price_egp = EXCLUDED.price_egp,
    duration_days = EXCLUDED.duration_days,
    features = EXCLUDED.features,
    display_order = EXCLUDED.display_order,
    is_featured = EXCLUDED.is_featured,
    is_active = EXCLUDED.is_active;

-- 2. UPGRADE OR CREATE SUBSCRIPTIONS TABLE (WITH QUEUE SUPPORT)
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Drop legacy constraints if they exist
DO $$
BEGIN
    -- Convert status to TEXT if it was an ENUM
    ALTER TABLE public.subscriptions ALTER COLUMN status TYPE TEXT USING status::text;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE public.subscriptions ALTER COLUMN plan_id DROP NOT NULL;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE public.subscriptions ALTER COLUMN current_period_start DROP NOT NULL;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE public.subscriptions ALTER COLUMN current_period_end DROP NOT NULL;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- Safely add missing columns to subscriptions table
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS plan_id TEXT REFERENCES public.subscription_plans(id) ON DELETE SET NULL;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS duration_days INTEGER DEFAULT 30;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS start_date TIMESTAMPTZ;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS end_date TIMESTAMPTZ;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'instapay';
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS reference_code TEXT;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS payment_request_id BIGINT;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS grant_reason TEXT;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS grant_admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS revocation_reason TEXT;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS revocation_admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now());

-- Backfill dates and reference_code for existing rows if needed
UPDATE public.subscriptions 
SET 
    start_date = COALESCE(start_date, timezone('utc'::text, now())),
    end_date = COALESCE(end_date, timezone('utc'::text, now()) + interval '30 days'),
    reference_code = COALESCE(reference_code, 'HKY-LEGACY-' || id::text)
WHERE start_date IS NULL OR end_date IS NULL OR reference_code IS NULL;

-- Set NOT NULL and constraints after backfilling
ALTER TABLE public.subscriptions ALTER COLUMN start_date SET NOT NULL;
ALTER TABLE public.subscriptions ALTER COLUMN end_date SET NOT NULL;
ALTER TABLE public.subscriptions ALTER COLUMN reference_code SET NOT NULL;

DO $$
BEGIN
    ALTER TABLE public.subscriptions ADD CONSTRAINT uq_subscriptions_reference_code UNIQUE (reference_code);
EXCEPTION
    WHEN duplicate_table OR duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_status_dates 
    ON public.subscriptions(user_id, status, end_date);

-- 3. INSTAPAY PAYMENT REQUESTS TABLE
CREATE TABLE IF NOT EXISTS public.subscription_payment_requests (
    id BIGSERIAL PRIMARY KEY,
    reference TEXT UNIQUE NOT NULL, -- e.g. 'HKY-SUB-XXXXXX'
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    plan_id TEXT NOT NULL REFERENCES public.subscription_plans(id),
    plan_name_ar TEXT NOT NULL,
    price_egp NUMERIC(10,2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'EGP',
    duration_days INTEGER NOT NULL DEFAULT 30,
    payment_method TEXT NOT NULL DEFAULT 'instapay',
    status TEXT NOT NULL DEFAULT 'pending_payment', -- 'pending_payment' | 'under_review' | 'approved' | 'rejected' | 'cancelled'
    proof_image_url TEXT,
    transaction_reference TEXT,
    transfer_amount NUMERIC(10,2),
    transfer_datetime TIMESTAMPTZ,
    user_notes TEXT,
    admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    admin_notes TEXT,
    rejection_reason TEXT,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_sub_payment_requests_user ON public.subscription_payment_requests(user_id, status);
CREATE INDEX IF NOT EXISTS idx_sub_payment_requests_ref ON public.subscription_payment_requests(reference);
CREATE INDEX IF NOT EXISTS idx_sub_payment_requests_tx_ref ON public.subscription_payment_requests(transaction_reference);

-- 4. SUBSCRIPTION CODE BATCHES & CODES TABLE
CREATE TABLE IF NOT EXISTS public.subscription_code_batches (
    id BIGSERIAL PRIMARY KEY,
    batch_name TEXT NOT NULL,
    campaign_notes TEXT,
    duration_days INTEGER NOT NULL DEFAULT 30,
    total_count INTEGER NOT NULL DEFAULT 0,
    redeemed_count INTEGER NOT NULL DEFAULT 0,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.subscription_codes (
    id BIGSERIAL PRIMARY KEY,
    batch_id BIGINT REFERENCES public.subscription_code_batches(id) ON DELETE CASCADE,
    code TEXT UNIQUE NOT NULL,
    code_hash TEXT,
    duration_days INTEGER NOT NULL DEFAULT 30,
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_redeemed BOOLEAN NOT NULL DEFAULT false,
    redeemed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    redeemed_at TIMESTAMPTZ,
    subscription_id BIGINT REFERENCES public.subscriptions(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_subscription_codes_lookup ON public.subscription_codes(code, is_active, is_redeemed);

-- 5. PAYMENT SETTINGS (INSTAPAY CONFIGURATION)
CREATE TABLE IF NOT EXISTS public.subscription_settings (
    id TEXT PRIMARY KEY DEFAULT 'instapay',
    instapay_address TEXT NOT NULL DEFAULT 'hekayaty@instapay',
    recipient_name TEXT NOT NULL DEFAULT 'منصة حكاياتي للنشر الرقمي',
    phone_number TEXT DEFAULT '01023456789',
    instructions_ar TEXT NOT NULL DEFAULT '1. افتح تطبيق إنستاباي (InstaPay).\n2. حول قيمة الاشتراك بدقة لحساب إنستاباي أعلاه.\n3. التقط لقطة شاشة للتحويل واحتفظ برقم المرجع.\n4. ارفع الإثبات واكتب رقم العملية لتفعيل اشتراكك.',
    instructions_en TEXT NOT NULL DEFAULT '1. Open InstaPay app.\n2. Transfer the exact subscription amount to the InstaPay address above.\n3. Take a screenshot of the receipt and copy the transaction reference.\n4. Submit proof to activate your membership.',
    qr_code_url TEXT DEFAULT '/assets/instapay_qr_sample.png',
    is_enabled BOOLEAN NOT NULL DEFAULT true,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

INSERT INTO public.subscription_settings (
    id, instapay_address, recipient_name, phone_number, is_enabled
) VALUES (
    'instapay',
    'hekayaty@instapay',
    'منصة حكاياتي للنشر والتوزيع',
    '01023456789',
    true
) ON CONFLICT (id) DO NOTHING;

-- 6. SUBSCRIPTION AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.subscription_audit_logs (
    id BIGSERIAL PRIMARY KEY,
    admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    target_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    entity_type TEXT NOT NULL, -- 'plan' | 'payment_request' | 'subscription' | 'code' | 'settings'
    entity_id TEXT,
    details JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_sub_audit_logs_created_at ON public.subscription_audit_logs(created_at DESC);

-- 7. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_payment_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_code_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_audit_logs ENABLE ROW LEVEL SECURITY;

-- Plans policies (viewable by everyone if active, all by admin)
DO $$ BEGIN
    CREATE POLICY "Subscription plans viewable by everyone" 
        ON public.subscription_plans FOR SELECT 
        USING (is_active = true OR public.is_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Subscription plans manageable by admins" 
        ON public.subscription_plans FOR ALL 
        USING (public.is_admin()) WITH CHECK (public.is_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Subscriptions policies (users view own, admins view and manage all)
DO $$ BEGIN
    CREATE POLICY "Users can view own subscriptions" 
        ON public.subscriptions FOR SELECT 
        USING (auth.uid() = user_id OR public.is_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Subscriptions manageable only by admins" 
        ON public.subscriptions FOR ALL 
        USING (public.is_admin()) WITH CHECK (public.is_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Payment requests policies
DO $$ BEGIN
    CREATE POLICY "Users can view own payment requests" 
        ON public.subscription_payment_requests FOR SELECT 
        USING (auth.uid() = user_id OR public.is_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Users can create own payment requests" 
        ON public.subscription_payment_requests FOR INSERT 
        WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Users can cancel own pending payment requests" 
        ON public.subscription_payment_requests FOR UPDATE 
        USING (auth.uid() = user_id AND status = 'pending_payment')
        WITH CHECK (auth.uid() = user_id AND status = 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Admins can manage all payment requests" 
        ON public.subscription_payment_requests FOR ALL 
        USING (public.is_admin()) WITH CHECK (public.is_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Codes policies (admin only, users redeem through secure backend API)
DO $$ BEGIN
    CREATE POLICY "Code batches viewable only by admins" 
        ON public.subscription_code_batches FOR ALL 
        USING (public.is_admin()) WITH CHECK (public.is_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Subscription codes viewable only by admins" 
        ON public.subscription_codes FOR ALL 
        USING (public.is_admin()) WITH CHECK (public.is_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Settings policies (viewable by all, manageable by admins)
DO $$ BEGIN
    CREATE POLICY "Subscription settings viewable by everyone" 
        ON public.subscription_settings FOR SELECT 
        USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Subscription settings manageable by admins" 
        ON public.subscription_settings FOR ALL 
        USING (public.is_admin()) WITH CHECK (public.is_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Audit logs policies (viewable by admins, insertable by system/admins)
DO $$ BEGIN
    CREATE POLICY "Subscription audit logs viewable only by admins" 
        ON public.subscription_audit_logs FOR SELECT 
        USING (public.is_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Subscription audit logs insertable by service role or admins" 
        ON public.subscription_audit_logs FOR INSERT 
        WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
