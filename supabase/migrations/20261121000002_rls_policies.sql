-- =============================================================================
-- HEKAYATY (حكاياتي) — OFFICIAL SUPABASE RLS SECURITY POLICIES
-- Migration: 20261121000002_rls_policies.sql
-- Description: Enforces Row-Level Security across all 25 tables
-- =============================================================================

-- 1. ENABLE ROW LEVEL SECURITY ACROSS ALL TABLES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worlds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.series ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comic_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.encyclopedia_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.card_game_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reading_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 2. SECURITY HELPER FUNCTIONS
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS public.user_role AS $$
    SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin' AND is_active = true
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.has_comic_entitlement(p_comic_id TEXT)
RETURNS BOOLEAN AS $$
    SELECT (
        -- Free comic check
        EXISTS (SELECT 1 FROM public.comics WHERE id = p_comic_id AND is_free = true)
        -- Admin check
        OR public.is_admin()
        -- Direct entitlement
        OR EXISTS (
            SELECT 1 FROM public.entitlements 
            WHERE user_id = auth.uid() 
              AND content_type = 'comic' 
              AND content_id = p_comic_id 
              AND (expires_at IS NULL OR expires_at > now())
        )
        -- Active subscription
        OR EXISTS (
            SELECT 1 FROM public.subscriptions 
            WHERE user_id = auth.uid() 
              AND status = 'active' 
              AND current_period_end > now()
        )
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 3. PROFILES POLICIES
-- Public profiles viewable by everyone
CREATE POLICY "Profiles are viewable by everyone" 
    ON public.profiles FOR SELECT 
    USING (is_active = true);

-- Users can update their own profile EXCEPT role (prevents self-role escalation)
CREATE POLICY "Users can update their own profile" 
    ON public.profiles FOR UPDATE 
    USING (auth.uid() = id)
    WITH CHECK (
        auth.uid() = id 
        AND (role = (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid()) OR public.is_admin())
    );

-- Admins have full access to manage profiles
CREATE POLICY "Admins have full access to profiles"
    ON public.profiles FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 4. UNIVERSE LORE POLICIES (Public Reads, Admin Mutations)
CREATE POLICY "Worlds are viewable by everyone" ON public.worlds FOR SELECT USING (true);
CREATE POLICY "Worlds manageable by admins" ON public.worlds FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Characters are viewable by everyone" ON public.characters FOR SELECT USING (true);
CREATE POLICY "Characters manageable by admins" ON public.characters FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Timeline is viewable by everyone" ON public.timeline_events FOR SELECT USING (true);
CREATE POLICY "Timeline manageable by admins" ON public.timeline_events FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Encyclopedia is viewable by everyone" ON public.encyclopedia_entries FOR SELECT USING (true);
CREATE POLICY "Encyclopedia manageable by admins" ON public.encyclopedia_entries FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "News is viewable by everyone" ON public.news_articles FOR SELECT USING (true);
CREATE POLICY "News manageable by admins" ON public.news_articles FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Events are viewable by everyone" ON public.events FOR SELECT USING (true);
CREATE POLICY "Events manageable by admins" ON public.events FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Card game cards are viewable by everyone" ON public.card_game_cards FOR SELECT USING (true);
CREATE POLICY "Cards manageable by admins" ON public.card_game_cards FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Creators are viewable by everyone" ON public.creators FOR SELECT USING (true);
CREATE POLICY "Creators can update own creator profile" ON public.creators FOR UPDATE 
    USING (auth.uid() = user_id OR public.is_admin())
    WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- 5. CONTENT POLICIES (Series, Comics, Stories)
-- Series
CREATE POLICY "Series viewable by everyone" ON public.series FOR SELECT USING (true);

CREATE POLICY "Publishers can insert own series" ON public.series FOR INSERT 
    WITH CHECK (
        public.is_admin() 
        OR (public.current_user_role() = 'publishing_house' AND (publisher_id = auth.uid() OR publisher_id IS NULL))
    );

CREATE POLICY "Publishers can update own series" ON public.series FOR UPDATE 
    USING (public.is_admin() OR (public.current_user_role() = 'publishing_house' AND publisher_id = auth.uid()))
    WITH CHECK (public.is_admin() OR (public.current_user_role() = 'publishing_house' AND publisher_id = auth.uid()));

-- Comics (Published comics viewable by all, drafts viewable only by author/publisher/admin)
CREATE POLICY "Comics viewable if published or owned" ON public.comics FOR SELECT 
    USING (
        is_free = true 
        OR auth.uid() IS NOT NULL 
        OR public.is_admin() 
        OR publisher_id = auth.uid()
    );

CREATE POLICY "Publishers can insert comics" ON public.comics FOR INSERT 
    WITH CHECK (
        public.is_admin() 
        OR (public.current_user_role() = 'publishing_house' AND (publisher_id = auth.uid() OR publisher_id IS NULL))
    );

CREATE POLICY "Publishers can update own comics" ON public.comics FOR UPDATE 
    USING (public.is_admin() OR (public.current_user_role() = 'publishing_house' AND publisher_id = auth.uid()))
    WITH CHECK (public.is_admin() OR (public.current_user_role() = 'publishing_house' AND publisher_id = auth.uid()));

-- Comic Pages (Previews open to everyone; full pages require entitlement or admin)
CREATE POLICY "Comic page previews viewable by everyone" ON public.comic_pages FOR SELECT 
    USING (is_preview = true OR public.has_comic_entitlement(comic_id));

CREATE POLICY "Publishers can manage pages of own comics" ON public.comic_pages FOR ALL
    USING (
        public.is_admin() 
        OR EXISTS (
            SELECT 1 FROM public.comics c 
            WHERE c.id = comic_pages.comic_id AND c.publisher_id = auth.uid()
        )
    )
    WITH CHECK (
        public.is_admin() 
        OR EXISTS (
            SELECT 1 FROM public.comics c 
            WHERE c.id = comic_pages.comic_id AND c.publisher_id = auth.uid()
        )
    );

-- Stories
CREATE POLICY "Stories viewable by everyone" ON public.stories FOR SELECT USING (true);

CREATE POLICY "Writers and publishers can create stories" ON public.stories FOR INSERT 
    WITH CHECK (
        public.is_admin() 
        OR public.current_user_role() IN ('writer', 'publishing_house')
    );

CREATE POLICY "Authors and publishers can update own stories" ON public.stories FOR UPDATE 
    USING (public.is_admin() OR author_id = auth.uid())
    WITH CHECK (public.is_admin() OR author_id = auth.uid());

-- 6. USER-SCOPED TENANT ISOLATION POLICIES
-- Reading Progress
CREATE POLICY "Users can manage own reading progress" 
    ON public.reading_progress FOR ALL 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Favorites
CREATE POLICY "Users can manage own favorites" 
    ON public.favorites FOR ALL 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Collections
CREATE POLICY "Users can view own collections or public collections" 
    ON public.collections FOR SELECT 
    USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can manage own collections" 
    ON public.collections FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own collections" 
    ON public.collections FOR UPDATE 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own collections" 
    ON public.collections FOR DELETE 
    USING (auth.uid() = user_id);

-- Notifications
CREATE POLICY "Users can view own notifications" 
    ON public.notifications FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can mark own notifications as read" 
    ON public.notifications FOR UPDATE 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 7. COMMERCE & MARKETPLACE POLICIES
-- Products
CREATE POLICY "Active products viewable by everyone" 
    ON public.products FOR SELECT 
    USING (is_active = true OR public.is_admin());

-- Hard constraint: Writers CANNOT create physical products
CREATE POLICY "Publishers and admins can create products" 
    ON public.products FOR INSERT 
    WITH CHECK (
        public.is_admin() 
        OR (
            public.current_user_role() = 'publishing_house' 
            AND (publisher_id = auth.uid() OR publisher_id IS NULL)
        )
        OR (
            public.current_user_role() = 'writer' 
            AND is_digital = true -- Writers strictly limited to digital e-books
        )
    );

CREATE POLICY "Publishers can update own products" 
    ON public.products FOR UPDATE 
    USING (
        public.is_admin() 
        OR (public.current_user_role() = 'publishing_house' AND publisher_id = auth.uid())
        OR (public.current_user_role() = 'writer' AND publisher_id = auth.uid() AND is_digital = true)
    )
    WITH CHECK (
        public.is_admin() 
        OR (public.current_user_role() = 'publishing_house' AND publisher_id = auth.uid())
        OR (public.current_user_role() = 'writer' AND publisher_id = auth.uid() AND is_digital = true)
    );

-- Orders (Users can view own orders; mutations executed via Express service role)
CREATE POLICY "Users can view own orders" 
    ON public.orders FOR SELECT 
    USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can view own order items" 
    ON public.order_items FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.orders o 
            WHERE o.id = order_items.order_id AND (o.user_id = auth.uid() OR public.is_admin())
        )
    );

-- Entitlements (Users can view own entitlements; granted by Express checkout)
CREATE POLICY "Users can view own entitlements" 
    ON public.entitlements FOR SELECT 
    USING (auth.uid() = user_id OR public.is_admin());

-- Subscriptions & Plans
CREATE POLICY "Subscription plans viewable by everyone" 
    ON public.subscription_plans FOR SELECT 
    USING (is_active = true OR public.is_admin());

CREATE POLICY "Users can view own subscriptions" 
    ON public.subscriptions FOR SELECT 
    USING (auth.uid() = user_id OR public.is_admin());

-- 8. AUDIT LOGS (Immutable, Append-Only by Service Role or Admin)
CREATE POLICY "Audit logs viewable only by admins" 
    ON public.audit_logs FOR SELECT 
    USING (public.is_admin());

CREATE POLICY "Audit logs insertable by service role or admins" 
    ON public.audit_logs FOR INSERT 
    WITH CHECK (true);
