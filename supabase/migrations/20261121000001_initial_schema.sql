-- =============================================================================
-- HEKAYATY (حكاياتي) — OFFICIAL SUPABASE INITIAL MIGRATION
-- Migration: 20261121000001_initial_schema.sql
-- Description: Establishes the complete 25-table relational schema for Hekayaty
-- =============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS
CREATE TYPE public.user_role AS ENUM (
    'reader',
    'writer',
    'publishing_house',
    'admin'
);

CREATE TYPE public.content_classification AS ENUM (
    'original',
    'hekayaty_selected',
    'official_collaboration'
);

CREATE TYPE public.alignment AS ENUM (
    'hero',
    'villain',
    'antihero',
    'neutral'
);

CREATE TYPE public.world_alignment AS ENUM (
    'light',
    'dark',
    'neutral'
);

CREATE TYPE public.comic_status AS ENUM (
    'ongoing',
    'completed',
    'hiatus'
);

CREATE TYPE public.order_status AS ENUM (
    'pending',
    'paid',
    'processing',
    'shipped',
    'delivered',
    'cancelled',
    'refunded'
);

CREATE TYPE public.subscription_status AS ENUM (
    'active',
    'cancelled',
    'expired',
    'trial'
);

CREATE TYPE public.timeline_era AS ENUM (
    'ancient',
    'classical',
    'modern',
    'future'
);

CREATE TYPE public.timeline_category AS ENUM (
    'catastrophe',
    'creation',
    'conflict',
    'political',
    'discovery',
    'resurgence',
    'expansion'
);

CREATE TYPE public.timeline_impact AS ENUM (
    'minor',
    'major',
    'legendary'
);

CREATE TYPE public.encyclopedia_category AS ENUM (
    'artifact',
    'technology',
    'organization',
    'creature',
    'location'
);

CREATE TYPE public.notification_type AS ENUM (
    'new_chapter',
    'new_comic',
    'new_story',
    'system',
    'promotion'
);

-- 3. PROFILES TABLE (Linked 1:1 with auth.users)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    avatar_url TEXT,
    cloudinary_avatar_public_id TEXT,
    bio TEXT,
    role public.user_role NOT NULL DEFAULT 'reader',
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Automatic Profile Creation Trigger on Supabase Auth Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, display_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
        COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'reader'::public.user_role)
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        display_name = COALESCE(EXCLUDED.display_name, public.profiles.display_name);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Automatic updated_at timestamp function
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 4. UNIVERSE LORE — WORLDS
CREATE TABLE public.worlds (
    id TEXT PRIMARY KEY, -- e.g. 'w1'
    name_ar TEXT NOT NULL,
    name_en TEXT NOT NULL,
    description_ar TEXT NOT NULL,
    description_en TEXT NOT NULL,
    ruler TEXT,
    ruler_ar TEXT,
    alignment public.world_alignment NOT NULL DEFAULT 'neutral',
    climate TEXT,
    climate_ar TEXT,
    history TEXT,
    history_ar TEXT,
    image_url TEXT,
    cloudinary_image_public_id TEXT,
    notable_locations JSONB DEFAULT '[]'::jsonb,
    organizations JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TRIGGER trigger_worlds_updated_at
    BEFORE UPDATE ON public.worlds
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 5. UNIVERSE LORE — CHARACTERS
CREATE TABLE public.characters (
    id TEXT PRIMARY KEY, -- e.g. 'c1'
    world_id TEXT REFERENCES public.worlds(id) ON DELETE SET NULL,
    name_ar TEXT NOT NULL,
    name_en TEXT NOT NULL,
    alias TEXT,
    alias_ar TEXT,
    alignment public.alignment NOT NULL DEFAULT 'hero',
    bio_ar TEXT,
    bio_en TEXT,
    origin_ar TEXT,
    origin_en TEXT,
    powers JSONB DEFAULT '[]'::jsonb,
    powers_ar JSONB DEFAULT '[]'::jsonb,
    weaknesses JSONB DEFAULT '[]'::jsonb,
    weaknesses_ar JSONB DEFAULT '[]'::jsonb,
    affiliations JSONB DEFAULT '[]'::jsonb,
    affiliations_ar JSONB DEFAULT '[]'::jsonb,
    related_character_ids JSONB DEFAULT '[]'::jsonb,
    stats JSONB DEFAULT '{"strength":50,"speed":50,"durability":50,"intelligence":50,"magic":50,"combat":50}'::jsonb,
    image_url TEXT,
    cloudinary_image_public_id TEXT,
    classification public.content_classification NOT NULL DEFAULT 'original',
    created_by TEXT,
    first_appearance TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX idx_characters_world_id ON public.characters(world_id);
CREATE INDEX idx_characters_alignment ON public.characters(alignment);

CREATE TRIGGER trigger_characters_updated_at
    BEFORE UPDATE ON public.characters
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 6. CONTENT — SERIES
CREATE TABLE public.series (
    id TEXT PRIMARY KEY, -- e.g. 's1'
    world_id TEXT REFERENCES public.worlds(id) ON DELETE SET NULL,
    publisher_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    title_ar TEXT NOT NULL,
    title_en TEXT NOT NULL,
    description_ar TEXT,
    cover_image_url TEXT,
    cloudinary_cover_public_id TEXT,
    classification public.content_classification NOT NULL DEFAULT 'original',
    created_by TEXT,
    genres JSONB DEFAULT '[]'::jsonb,
    genres_ar JSONB DEFAULT '[]'::jsonb,
    status public.comic_status NOT NULL DEFAULT 'ongoing',
    issue_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX idx_series_world_id ON public.series(world_id);
CREATE INDEX idx_series_publisher_id ON public.series(publisher_id);

CREATE TRIGGER trigger_series_updated_at
    BEFORE UPDATE ON public.series
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 7. CONTENT — COMICS
CREATE TABLE public.comics (
    id TEXT PRIMARY KEY, -- e.g. 'comic_1'
    series_id TEXT REFERENCES public.series(id) ON DELETE CASCADE,
    world_id TEXT REFERENCES public.worlds(id) ON DELETE SET NULL,
    publisher_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    title_ar TEXT NOT NULL,
    title_en TEXT NOT NULL,
    issue_number INTEGER NOT NULL DEFAULT 1,
    synopsis_ar TEXT,
    synopsis_en TEXT,
    writer TEXT,
    artist TEXT,
    year INTEGER,
    month INTEGER,
    genres JSONB DEFAULT '[]'::jsonb,
    genres_ar JSONB DEFAULT '[]'::jsonb,
    cover_image_url TEXT,
    cloudinary_cover_public_id TEXT,
    character_ids JSONB DEFAULT '[]'::jsonb,
    rating NUMERIC(3,2) DEFAULT 5.00,
    page_count INTEGER NOT NULL DEFAULT 0,
    classification public.content_classification NOT NULL DEFAULT 'original',
    created_by TEXT,
    previous_issue_id TEXT,
    next_issue_id TEXT,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    is_new BOOLEAN NOT NULL DEFAULT false,
    is_free BOOLEAN NOT NULL DEFAULT true,
    price_egp NUMERIC(10,2) DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX idx_comics_series_id ON public.comics(series_id);
CREATE INDEX idx_comics_world_id ON public.comics(world_id);
CREATE INDEX idx_comics_publisher_id ON public.comics(publisher_id);

CREATE TRIGGER trigger_comics_updated_at
    BEFORE UPDATE ON public.comics
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 8. CONTENT — COMIC PAGES
CREATE TABLE public.comic_pages (
    id BIGSERIAL PRIMARY KEY,
    comic_id TEXT NOT NULL REFERENCES public.comics(id) ON DELETE CASCADE,
    page_number INTEGER NOT NULL,
    image_url TEXT NOT NULL,
    cloudinary_page_public_id TEXT,
    is_preview BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_comic_page_number UNIQUE (comic_id, page_number)
);

CREATE INDEX idx_comic_pages_comic_id ON public.comic_pages(comic_id);

-- 9. CONTENT — STORIES (Illustrated Prose)
CREATE TABLE public.stories (
    id TEXT PRIMARY KEY, -- e.g. 'story_1'
    world_id TEXT REFERENCES public.worlds(id) ON DELETE SET NULL,
    author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    title_ar TEXT NOT NULL,
    title_en TEXT NOT NULL,
    author TEXT,
    author_ar TEXT,
    synopsis_ar TEXT,
    cover_image_url TEXT,
    cloudinary_cover_public_id TEXT,
    genres JSONB DEFAULT '[]'::jsonb,
    genres_ar JSONB DEFAULT '[]'::jsonb,
    classification public.content_classification NOT NULL DEFAULT 'original',
    character_ids JSONB DEFAULT '[]'::jsonb,
    word_count INTEGER DEFAULT 0,
    read_time_minutes INTEGER DEFAULT 5,
    year INTEGER,
    content TEXT,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    is_new BOOLEAN NOT NULL DEFAULT false,
    is_free BOOLEAN NOT NULL DEFAULT true,
    price_egp NUMERIC(10,2) DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX idx_stories_world_id ON public.stories(world_id);
CREATE INDEX idx_stories_author_id ON public.stories(author_id);

CREATE TRIGGER trigger_stories_updated_at
    BEFORE UPDATE ON public.stories
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 10. UNIVERSE LORE — TIMELINE EVENTS
CREATE TABLE public.timeline_events (
    id TEXT PRIMARY KEY, -- e.g. 't1'
    title_ar TEXT NOT NULL,
    title_en TEXT NOT NULL,
    year TEXT NOT NULL,
    era public.timeline_era NOT NULL,
    description_ar TEXT,
    description_en TEXT,
    category public.timeline_category NOT NULL,
    character_ids JSONB DEFAULT '[]'::jsonb,
    world_ids JSONB DEFAULT '[]'::jsonb,
    comic_ids JSONB DEFAULT '[]'::jsonb,
    image_url TEXT,
    cloudinary_image_public_id TEXT,
    impact public.timeline_impact NOT NULL DEFAULT 'minor',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX idx_timeline_era ON public.timeline_events(era);
CREATE INDEX idx_timeline_category ON public.timeline_events(category);

-- 11. UNIVERSE LORE — ENCYCLOPEDIA ENTRIES
CREATE TABLE public.encyclopedia_entries (
    id TEXT PRIMARY KEY, -- e.g. 'enc_1'
    title_ar TEXT NOT NULL,
    title_en TEXT NOT NULL,
    category public.encyclopedia_category NOT NULL,
    description_ar TEXT,
    description_en TEXT,
    tags JSONB DEFAULT '[]'::jsonb,
    related_entry_ids JSONB DEFAULT '[]'::jsonb,
    related_character_ids JSONB DEFAULT '[]'::jsonb,
    related_world_ids JSONB DEFAULT '[]'::jsonb,
    image_url TEXT,
    cloudinary_image_public_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX idx_encyclopedia_category ON public.encyclopedia_entries(category);

CREATE TRIGGER trigger_encyclopedia_updated_at
    BEFORE UPDATE ON public.encyclopedia_entries
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 12. EDITORIAL & NEWS
CREATE TABLE public.news_articles (
    id TEXT PRIMARY KEY, -- e.g. 'news_1'
    title_ar TEXT NOT NULL,
    title_en TEXT,
    summary_ar TEXT,
    content_ar TEXT,
    image_url TEXT,
    cloudinary_image_public_id TEXT,
    tags JSONB DEFAULT '[]'::jsonb,
    published_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    is_featured BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 13. EVENTS & CONVENTIONS
CREATE TABLE public.events (
    id TEXT PRIMARY KEY, -- e.g. 'ev_1'
    title_ar TEXT NOT NULL,
    title_en TEXT,
    description_ar TEXT,
    image_url TEXT,
    cloudinary_image_public_id TEXT,
    event_date TIMESTAMPTZ,
    location TEXT,
    registration_url TEXT,
    is_online BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 14. CARD GAME CARDS
CREATE TABLE public.card_game_cards (
    id TEXT PRIMARY KEY, -- e.g. 'card_1'
    name_ar TEXT NOT NULL,
    name_en TEXT NOT NULL,
    type TEXT NOT NULL, -- hero, villain, spell, artifact
    rarity TEXT NOT NULL, -- common, rare, epic, legendary
    character_id TEXT REFERENCES public.characters(id) ON DELETE SET NULL,
    image_url TEXT,
    cloudinary_image_public_id TEXT,
    stats JSONB DEFAULT '{}'::jsonb,
    abilities JSONB DEFAULT '[]'::jsonb,
    flavor_text_ar TEXT,
    price_egp NUMERIC(10,2) DEFAULT 0.00,
    stock_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX idx_cards_character_id ON public.card_game_cards(character_id);

-- 15. CREATORS (Writers / Studios / Publishing Houses)
CREATE TABLE public.creators (
    id TEXT PRIMARY KEY, -- e.g. 'cr_1'
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    name_ar TEXT NOT NULL,
    name_en TEXT NOT NULL,
    type TEXT NOT NULL, -- 'writer' | 'publishing_house'
    bio TEXT,
    avatar_url TEXT,
    cloudinary_avatar_public_id TEXT,
    is_verified BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX idx_creators_user_id ON public.creators(user_id);

-- 16. USER ENGAGEMENT — READING PROGRESS
CREATE TABLE public.reading_progress (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content_type TEXT NOT NULL, -- 'comic' | 'story'
    content_id TEXT NOT NULL,
    progress INTEGER NOT NULL DEFAULT 0,
    is_completed BOOLEAN NOT NULL DEFAULT false,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_user_reading_progress UNIQUE (user_id, content_type, content_id)
);

CREATE INDEX idx_reading_progress_user_id ON public.reading_progress(user_id);

-- 17. USER ENGAGEMENT — FAVORITES
CREATE TABLE public.favorites (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content_type TEXT NOT NULL, -- 'character' | 'comic' | 'world' | 'story'
    content_id TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_user_favorites UNIQUE (user_id, content_type, content_id)
);

CREATE INDEX idx_favorites_user_id ON public.favorites(user_id);

-- 18. USER ENGAGEMENT — COLLECTIONS
CREATE TABLE public.collections (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name_ar TEXT NOT NULL,
    content_ids JSONB DEFAULT '[]'::jsonb,
    is_public BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX idx_collections_user_id ON public.collections(user_id);

CREATE TRIGGER trigger_collections_updated_at
    BEFORE UPDATE ON public.collections
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 19. COMMERCE — PRODUCTS
CREATE TABLE public.products (
    id BIGSERIAL PRIMARY KEY,
    publisher_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    content_type TEXT NOT NULL, -- 'comic' | 'story' | 'card' | 'subscription_plan' | 'merch'
    content_id TEXT,
    name_ar TEXT NOT NULL,
    name_en TEXT,
    description_ar TEXT,
    price_egp NUMERIC(10,2) NOT NULL,
    is_digital BOOLEAN NOT NULL DEFAULT true,
    stock_count INTEGER, -- NULL = unlimited digital
    cover_image_url TEXT,
    cloudinary_cover_public_id TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX idx_products_publisher_id ON public.products(publisher_id);

CREATE TRIGGER trigger_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 20. COMMERCE — ORDERS
CREATE TABLE public.orders (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    status public.order_status NOT NULL DEFAULT 'pending',
    total_egp NUMERIC(10,2) NOT NULL,
    payment_method TEXT,
    payment_ref TEXT,
    shipping_address JSONB DEFAULT '{}'::jsonb,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_status ON public.orders(status);

CREATE TRIGGER trigger_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 21. COMMERCE — ORDER ITEMS
CREATE TABLE public.order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id BIGINT NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price_egp NUMERIC(10,2) NOT NULL
);

CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);

-- 22. ACCESS RIGHTS — ENTITLEMENTS
CREATE TABLE public.entitlements (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content_type TEXT NOT NULL, -- 'comic' | 'story'
    content_id TEXT NOT NULL,
    source TEXT NOT NULL, -- 'purchase' | 'subscription' | 'free' | 'admin_grant'
    expires_at TIMESTAMPTZ, -- NULL = permanent
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_user_content_entitlement UNIQUE (user_id, content_type, content_id)
);

CREATE INDEX idx_entitlements_user_id ON public.entitlements(user_id);

-- 23. SUBSCRIPTIONS — PLANS
CREATE TABLE public.subscription_plans (
    id TEXT PRIMARY KEY, -- 'monthly' | 'yearly'
    name_ar TEXT NOT NULL,
    name_en TEXT NOT NULL,
    price_egp_monthly NUMERIC(10,2) NOT NULL,
    price_egp_yearly NUMERIC(10,2),
    features JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 24. SUBSCRIPTIONS — USER SUBSCRIPTIONS
CREATE TABLE public.subscriptions (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    plan_id TEXT NOT NULL REFERENCES public.subscription_plans(id),
    status public.subscription_status NOT NULL DEFAULT 'active',
    current_period_start TIMESTAMPTZ NOT NULL,
    current_period_end TIMESTAMPTZ NOT NULL,
    cancelled_at TIMESTAMPTZ,
    payment_ref TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);

CREATE TRIGGER trigger_subscriptions_updated_at
    BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 25. NOTIFICATIONS
CREATE TABLE public.notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type public.notification_type NOT NULL,
    title_ar TEXT NOT NULL,
    body_ar TEXT,
    link_url TEXT,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX idx_notifications_user_id_read ON public.notifications(user_id, is_read);

-- 26. AUDIT LOGS (Immutable Platform Audit)
CREATE TABLE public.audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at);
