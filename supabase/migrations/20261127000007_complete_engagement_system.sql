-- =============================================================================
-- HEKAYATY (حكاياتي) — COMPLETE ENGAGEMENT, FOLLOWING, LIKES & ANALYTICS MIGRATION
-- Migration: 20261127000007_complete_engagement_system.sql
-- Description: Establishes complete persistent schema for Likes, Follows,
--              View Tracking Events with 24h deduplication, Daily Aggregated
--              Analytics, and Notification Preferences with RLS and Indexes.
-- =============================================================================

-- 1. CONTENT LIKES TABLE
CREATE TABLE IF NOT EXISTS public.content_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content_type TEXT NOT NULL CHECK (content_type IN ('novel', 'story', 'comic', 'series', 'episode', 'chapter', 'author', 'publisher')),
    content_id TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT content_likes_unique UNIQUE (user_id, content_type, content_id)
);

-- 2. CONTENT FOLLOWS TABLE
CREATE TABLE IF NOT EXISTS public.content_follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content_type TEXT NOT NULL CHECK (content_type IN ('novel', 'story', 'comic', 'series', 'episode', 'chapter', 'author', 'publisher')),
    content_id TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT content_follows_unique UNIQUE (user_id, content_type, content_id)
);

-- 3. CONTENT VIEW EVENTS TABLE (Detailed event log for deduplication & analytics)
CREATE TABLE IF NOT EXISTS public.content_view_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_type TEXT NOT NULL,
    content_id TEXT NOT NULL,
    viewer_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    anonymous_session_id TEXT,
    session_id TEXT,
    source TEXT DEFAULT 'direct',
    device_category TEXT DEFAULT 'desktop',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. USER NOTIFICATION PREFERENCES TABLE
CREATE TABLE IF NOT EXISTS public.user_notification_preferences (
    user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    notify_chapters BOOLEAN NOT NULL DEFAULT true,
    notify_episodes BOOLEAN NOT NULL DEFAULT true,
    notify_new_works BOOLEAN NOT NULL DEFAULT true,
    notify_author_updates BOOLEAN NOT NULL DEFAULT true,
    email_notifications BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. CONTENT ENGAGEMENT DAILY AGGREGATES TABLE (For high performance analytics)
CREATE TABLE IF NOT EXISTS public.content_engagement_daily (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_id TEXT NOT NULL,
    content_type TEXT NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    views INTEGER NOT NULL DEFAULT 0,
    unique_viewers INTEGER NOT NULL DEFAULT 0,
    likes_added INTEGER NOT NULL DEFAULT 0,
    follows_added INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT content_engagement_daily_unique UNIQUE (content_id, content_type, date)
);

-- =============================================================================
-- INDEXES FOR HIGH-TRAFFIC QUERY PERFORMANCE
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_content_likes_content ON public.content_likes (content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_content_likes_user ON public.content_likes (user_id);
CREATE INDEX IF NOT EXISTS idx_content_likes_created ON public.content_likes (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_content_follows_content ON public.content_follows (content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_content_follows_user ON public.content_follows (user_id);
CREATE INDEX IF NOT EXISTS idx_content_follows_created ON public.content_follows (created_at DESC);

-- View deduplication indexes: fast 24-hour lookups
CREATE INDEX IF NOT EXISTS idx_view_events_auth_dedup 
    ON public.content_view_events (content_type, content_id, viewer_user_id, created_at DESC)
    WHERE viewer_user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_view_events_anon_dedup 
    ON public.content_view_events (content_type, content_id, anonymous_session_id, created_at DESC)
    WHERE anonymous_session_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_view_events_analytics_date 
    ON public.content_view_events (created_at DESC, content_type);

CREATE INDEX IF NOT EXISTS idx_engagement_daily_lookup 
    ON public.content_engagement_daily (content_type, content_id, date DESC);

CREATE INDEX IF NOT EXISTS idx_engagement_daily_date 
    ON public.content_engagement_daily (date DESC);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================

ALTER TABLE public.content_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_view_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_engagement_daily ENABLE ROW LEVEL SECURITY;

-- LIKES POLICIES
DROP POLICY IF EXISTS "Public can view like counts and records" ON public.content_likes;
CREATE POLICY "Public can view like counts and records"
    ON public.content_likes FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert own likes" ON public.content_likes;
CREATE POLICY "Authenticated users can insert own likes"
    ON public.content_likes FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own likes" ON public.content_likes;
CREATE POLICY "Users can delete own likes"
    ON public.content_likes FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- FOLLOWS POLICIES
DROP POLICY IF EXISTS "Public can view follows" ON public.content_follows;
CREATE POLICY "Public can view follows"
    ON public.content_follows FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert own follows" ON public.content_follows;
CREATE POLICY "Authenticated users can insert own follows"
    ON public.content_follows FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own follows" ON public.content_follows;
CREATE POLICY "Users can delete own follows"
    ON public.content_follows FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- VIEW EVENTS POLICIES
DROP POLICY IF EXISTS "Anyone can record a view event" ON public.content_view_events;
CREATE POLICY "Anyone can record a view event"
    ON public.content_view_events FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view all view events" ON public.content_view_events;
CREATE POLICY "Admins can view all view events"
    ON public.content_view_events FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- NOTIFICATION PREFERENCES POLICIES
DROP POLICY IF EXISTS "Users can view and manage own notification preferences" ON public.user_notification_preferences;
CREATE POLICY "Users can view and manage own notification preferences"
    ON public.user_notification_preferences FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ENGAGEMENT DAILY AGGREGATES POLICIES
DROP POLICY IF EXISTS "Public can read daily aggregates" ON public.content_engagement_daily;
CREATE POLICY "Public can read daily aggregates"
    ON public.content_engagement_daily FOR SELECT
    USING (true);

-- GRANTS FOR SERVICE ROLE & PUBLIC ACCESS
GRANT ALL ON public.content_likes TO service_role;
GRANT ALL ON public.content_follows TO service_role;
GRANT ALL ON public.content_view_events TO service_role;
GRANT ALL ON public.user_notification_preferences TO service_role;
GRANT ALL ON public.content_engagement_daily TO service_role;

GRANT SELECT ON public.content_likes TO anon, authenticated;
GRANT SELECT ON public.content_follows TO anon, authenticated;
GRANT INSERT ON public.content_view_events TO anon, authenticated;
GRANT SELECT ON public.content_engagement_daily TO anon, authenticated;
