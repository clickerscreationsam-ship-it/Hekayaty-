-- =============================================================================
-- HEKAYATY (حكاياتي) — SERIES PLATFORM PERSISTENCE MIGRATION
-- Migration: 20261126000006_series_platform_persistence.sql
-- Description: Establishes persistent storage for Hekayaty Series Platform,
--              seasons, and episodes with real database CRUD and cascading deletes.
-- =============================================================================

-- 1. SERIES PLATFORM TABLE
CREATE TABLE IF NOT EXISTS public.series_platform (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    title_ar TEXT NOT NULL,
    title_en TEXT NOT NULL,
    short_description_ar TEXT,
    description_ar TEXT,
    cover_image_url TEXT,
    banner_image_url TEXT,
    thumbnail_url TEXT,
    format TEXT NOT NULL DEFAULT 'hybrid', -- 'novel' | 'comic' | 'hybrid'
    status TEXT NOT NULL DEFAULT 'ongoing', -- 'ongoing' | 'completed' | 'hiatus' | 'upcoming' | 'draft'
    genre TEXT NOT NULL DEFAULT 'خيال علمي أسطوري',
    subgenres JSONB DEFAULT '[]'::jsonb,
    tags JSONB DEFAULT '[]'::jsonb,
    language TEXT NOT NULL DEFAULT 'ar',
    age_rating TEXT NOT NULL DEFAULT '13+',
    world_id TEXT,
    world_name_ar TEXT,
    is_original BOOLEAN NOT NULL DEFAULT true,
    classification TEXT NOT NULL DEFAULT 'original',
    publisher_name TEXT DEFAULT 'دار حكاياتي للنشر الرقمي',
    author_name TEXT,
    artist_name TEXT,
    editor_name TEXT,
    structure_type TEXT NOT NULL DEFAULT 'season_episode', -- 'season_episode' | 'volume_chapter'
    structure_label TEXT NOT NULL DEFAULT 'الموسم',
    release_schedule TEXT NOT NULL DEFAULT 'weekly',
    release_day_time TEXT,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    banner_priority INTEGER NOT NULL DEFAULT 1,
    views_count INTEGER NOT NULL DEFAULT 0,
    followers_count INTEGER NOT NULL DEFAULT 0,
    rating NUMERIC(3,2) NOT NULL DEFAULT 5.0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. SEASONS / VOLUMES TABLE
CREATE TABLE IF NOT EXISTS public.series_seasons (
    id TEXT PRIMARY KEY,
    series_id TEXT NOT NULL REFERENCES public.series_platform(id) ON DELETE CASCADE,
    number INTEGER NOT NULL DEFAULT 1,
    title_ar TEXT NOT NULL,
    title_en TEXT,
    description_ar TEXT,
    cover_image_url TEXT,
    status TEXT NOT NULL DEFAULT 'published',
    release_date TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. EPISODES / CHAPTERS TABLE
CREATE TABLE IF NOT EXISTS public.series_episodes (
    id TEXT PRIMARY KEY,
    series_id TEXT NOT NULL REFERENCES public.series_platform(id) ON DELETE CASCADE,
    season_id TEXT REFERENCES public.series_seasons(id) ON DELETE CASCADE,
    episode_number INTEGER NOT NULL DEFAULT 1,
    title_ar TEXT NOT NULL,
    title_en TEXT,
    short_description_ar TEXT,
    content_type TEXT NOT NULL DEFAULT 'novel', -- 'novel' | 'comic'
    content_ar TEXT,
    pdf_url TEXT,
    comic_pages JSONB DEFAULT '[]'::jsonb,
    cover_image_url TEXT,
    reading_time_minutes INTEGER NOT NULL DEFAULT 5,
    word_count INTEGER NOT NULL DEFAULT 0,
    author_notes TEXT,
    access_level TEXT NOT NULL DEFAULT 'free', -- 'free' | 'subscribers_only' | 'paid'
    is_free BOOLEAN NOT NULL DEFAULT true,
    status TEXT NOT NULL DEFAULT 'published', -- 'published' | 'scheduled' | 'draft' | 'archived'
    scheduled_at TIMESTAMPTZ,
    publication_date TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    views_count INTEGER NOT NULL DEFAULT 0,
    likes_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- INDEXES FOR FAST LOOKUP
CREATE INDEX IF NOT EXISTS idx_series_platform_slug ON public.series_platform(slug);
CREATE INDEX IF NOT EXISTS idx_series_platform_status ON public.series_platform(status);
CREATE INDEX IF NOT EXISTS idx_series_seasons_series_id ON public.series_seasons(series_id);
CREATE INDEX IF NOT EXISTS idx_series_episodes_series_id ON public.series_episodes(series_id);
CREATE INDEX IF NOT EXISTS idx_series_episodes_season_id ON public.series_episodes(season_id);

-- ROW LEVEL SECURITY (RLS)
ALTER TABLE public.series_platform ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.series_seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.series_episodes ENABLE ROW LEVEL SECURITY;

-- Public can read published series, seasons, and episodes
DROP POLICY IF EXISTS "Public can view published series platform" ON public.series_platform;
CREATE POLICY "Public can view published series platform"
    ON public.series_platform FOR SELECT
    USING (status != 'draft' OR (auth.jwt() ->> 'role') = 'service_role' OR EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

DROP POLICY IF EXISTS "Public can view published seasons" ON public.series_seasons;
CREATE POLICY "Public can view published seasons"
    ON public.series_seasons FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Public can view published episodes" ON public.series_episodes;
CREATE POLICY "Public can view published episodes"
    ON public.series_episodes FOR SELECT
    USING (true);

-- Admins and Service Role have full CRUD
DROP POLICY IF EXISTS "Admins have full CRUD on series_platform" ON public.series_platform;
CREATE POLICY "Admins have full CRUD on series_platform"
    ON public.series_platform FOR ALL
    USING (
        (auth.jwt() ->> 'role') = 'service_role' OR 
        EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
    )
    WITH CHECK (
        (auth.jwt() ->> 'role') = 'service_role' OR 
        EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
    );

DROP POLICY IF EXISTS "Admins have full CRUD on series_seasons" ON public.series_seasons;
CREATE POLICY "Admins have full CRUD on series_seasons"
    ON public.series_seasons FOR ALL
    USING (
        (auth.jwt() ->> 'role') = 'service_role' OR 
        EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
    )
    WITH CHECK (
        (auth.jwt() ->> 'role') = 'service_role' OR 
        EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
    );

DROP POLICY IF EXISTS "Admins have full CRUD on series_episodes" ON public.series_episodes;
CREATE POLICY "Admins have full CRUD on series_episodes"
    ON public.series_episodes FOR ALL
    USING (
        (auth.jwt() ->> 'role') = 'service_role' OR 
        EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
    )
    WITH CHECK (
        (auth.jwt() ->> 'role') = 'service_role' OR 
        EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
    );
