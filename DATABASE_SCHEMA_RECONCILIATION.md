# HEKAYATY (حكاياتي) — DATABASE SCHEMA RECONCILIATION SPECIFICATION
## Drizzle Schema vs. Supabase PostgreSQL Reconciliation

This document audits the legacy Drizzle ORM definitions in `lib/db/src/schema/index.ts` against the authoritative Supabase SQL schema in `supabase/migrations/20261121000001_initial_schema.sql`.

---

## 1. Table Inventory & Reconciliation Audit

| # | Drizzle Table | Supabase SQL Table | Primary Key | Identity / Foreign Key Model | Status | Notes |
| :---: | :--- | :--- | :--- | :--- | :---: | :--- |
| 1 | `users` | `public.profiles` | `id UUID` | `REFERENCES auth.users(id)` | **RECONCILED** | Migrated from serial integer to Supabase `auth.users` UUID. |
| 2 | `sessions` | `auth.sessions` | Managed by Supabase | Handled natively by Supabase GoTrue Auth | **ADAPTED** | Supabase Auth natively issues & rotates JWTs; custom table deprecated. |
| 3 | `worlds` | `public.worlds` | `id TEXT` | Primary key e.g. `'w1'` | **VERIFIED** | Added `cloudinary_image_public_id` column. |
| 4 | `characters` | `public.characters` | `id TEXT` | `world_id -> worlds.id` | **VERIFIED** | Added `cloudinary_image_public_id` column. |
| 5 | `series` | `public.series` | `id TEXT` | `world_id`, `publisher_id -> profiles.id` | **VERIFIED** | Added `publisher_id` for multi-tenant publisher isolation. |
| 6 | `comics` | `public.comics` | `id TEXT` | `series_id`, `publisher_id -> profiles.id` | **VERIFIED** | Added `publisher_id` and Cloudinary cover public ID. |
| 7 | `comic_pages`| `public.comic_pages`| `id BIGSERIAL` | `comic_id -> comics.id` | **VERIFIED** | Added `is_preview BOOLEAN` and unique constraint on `(comic_id, page_number)`. |
| 8 | `stories` | `public.stories` | `id TEXT` | `world_id`, `author_id -> profiles.id` | **VERIFIED** | Added `author_id` foreign key. |
| 9 | `timeline_events`| `public.timeline_events`| `id TEXT` | Independent canonical ID | **VERIFIED** | Full preservation of multi-era categories. |
| 10| `encyclopedia_entries`| `public.encyclopedia_entries`| `id TEXT` | Independent canonical ID | **VERIFIED** | Full preservation of tags and cross-references. |
| 11| `news_articles`| `public.news_articles`| `id TEXT` | Independent canonical ID | **VERIFIED** | Added `cloudinary_image_public_id`. |
| 12| `events` | `public.events` | `id TEXT` | Independent canonical ID | **VERIFIED** | Added `cloudinary_image_public_id`. |
| 13| `card_game_cards`| `public.card_game_cards`| `id TEXT` | `character_id -> characters.id` | **VERIFIED** | Full preservation of card stats and abilities JSONB. |
| 14| `creators` | `public.creators` | `id TEXT` | `user_id -> profiles.id` | **VERIFIED** | Supports verified creator badges for authors & publishers. |
| 15| `reading_progress`| `public.reading_progress`| `id BIGSERIAL`| `user_id UUID -> profiles.id` | **RECONCILED** | `user_id` adapted to UUID; unique constraint on `(user_id, content_type, content_id)`. |
| 16| `favorites` | `public.favorites` | `id BIGSERIAL`| `user_id UUID -> profiles.id` | **RECONCILED** | `user_id` adapted to UUID; unique constraint on `(user_id, content_type, content_id)`. |
| 17| `collections`| `public.collections`| `id BIGSERIAL`| `user_id UUID -> profiles.id` | **RECONCILED** | Added `is_public BOOLEAN` for public showcase portfolios. |
| 18| `products` | `public.products` | `id BIGSERIAL`| `publisher_id UUID -> profiles.id` | **RECONCILED** | Added `publisher_id` to enforce writer vs. publisher physical products constraint. |
| 19| `orders` | `public.orders` | `id BIGSERIAL`| `user_id UUID -> profiles.id` | **RECONCILED** | `user_id` adapted to UUID. |
| 20| `order_items`| `public.order_items`| `id BIGSERIAL`| `order_id -> orders.id`, `product_id -> products.id` | **VERIFIED** | Strict cascade delete on order deletion. |
| 21| `entitlements`| `public.entitlements`| `id BIGSERIAL`| `user_id UUID -> profiles.id` | **RECONCILED** | Unique constraint on `(user_id, content_type, content_id)`. |
| 22| `subscription_plans`| `public.subscription_plans`| `id TEXT` | `'monthly' \| 'yearly'` | **VERIFIED** | Fixed plan IDs for stable application references. |
| 23| `subscriptions`| `public.subscriptions`| `id BIGSERIAL`| `user_id UUID -> profiles.id`, `plan_id -> subscription_plans.id` | **RECONCILED** | `user_id` adapted to UUID. |
| 24| `notifications`| `public.notifications`| `id BIGSERIAL`| `user_id UUID -> profiles.id` | **RECONCILED** | `user_id` adapted to UUID. |
| 25| `audit_logs` | `public.audit_logs` | `id BIGSERIAL`| `user_id UUID -> profiles.id` | **RECONCILED** | Append-only security log with IP address and JSON metadata. |

---

## 2. Structural Differences and Improvements

1. **User Identifier Type Transformation**:
   - **Legacy Drizzle**: `users.id` was defined as `serial` (integer).
   - **Supabase Standard**: `auth.users.id` is natively a `UUIDv4`. All tables referencing `user_id` (`reading_progress`, `favorites`, `orders`, `entitlements`, etc.) have been adapted to `UUID REFERENCES public.profiles(id)`.
2. **Media Decoupling (Cloudinary Preparation)**:
   - Added `cloudinary_*_public_id` columns to all media-bearing tables (`worlds`, `characters`, `series`, `comics`, `comic_pages`, `stories`, `products`).
   - Ensures binary media assets are never stored in PostgreSQL.
3. **Multi-Tenant Ownership Columns**:
   - Added `publisher_id UUID` to `series`, `comics`, and `products`.
   - Added `author_id UUID` to `stories`.
   - These columns enable deterministic Row-Level Security checks preventing one publisher from editing another publisher's catalog.
