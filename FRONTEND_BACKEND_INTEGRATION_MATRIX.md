# HEKAYATY (حكاياتي) — FRONTEND-BACKEND INTEGRATION MATRIX
## Full Route Audit & Channel Classification (Supabase vs. Express vs. Cloudinary)

The existing application contains **24 core page modules** mapped across 96 individual feature states and routes. This matrix defines the authoritative data channel for every route.

---

## 1. Route Channel Mapping

| Route | Page Module | Authoritative Channel | Channel Rationale & Data Strategy |
| :--- | :--- | :--- | :--- |
| `/` | `Home.tsx` | **Supabase (Read) + Cloudinary** | Direct Supabase fetch for featured comics, characters, and news. Cloudinary CDN delivers optimized cover images. |
| `/discover` | `Discover.tsx` | **Supabase (Read) + Cloudinary** | Direct Supabase query with filtering on `is_featured = true`. |
| `/comics` | `Comics.tsx` | **Supabase (Read) + Cloudinary** | Direct Supabase query on `public.comics` and `public.series` filtered by `status = 'published'`. |
| `/comics/:id` | `ComicDetail.tsx` | **Supabase (Read) + Cloudinary** | Fetches comic issue metadata and public preview pages directly via Supabase client. |
| `/comics/:id/read` | `ComicReader.tsx` | **Express API** | **Protected Domain**: Calls `GET /api/comics/:id/pages`. Express checks issue entitlement/subscription before returning full pages. |
| `/series/:id` | `SeriesDetail.tsx` | **Supabase (Read) + Cloudinary** | Direct Supabase query joining series with related comic issues. |
| `/stories` | `Stories.tsx` | **Supabase (Read) + Cloudinary** | Direct Supabase query on `public.stories`. |
| `/stories/:id` | `StoryDetail.tsx` | **Supabase (Free) / Express (Paid)**| Free prose returned via Supabase; paid stories verified and delivered through Express. |
| `/characters` | `Characters.tsx` | **Supabase (Read) + Cloudinary** | Direct Supabase query on `public.characters` with alignment/world filtering. |
| `/characters/:id` | `CharacterDetail.tsx`| **Supabase (Read) + Cloudinary** | Direct Supabase query on single character with linked comics and timeline events. |
| `/worlds` | `Worlds.tsx` | **Supabase (Read) + Cloudinary** | Direct Supabase query on `public.worlds`. |
| `/worlds/:id` | `WorldDetail.tsx` | **Supabase (Read) + Cloudinary** | Direct Supabase query on world with locations, organizations, and linked characters. |
| `/timeline` | `Timeline.tsx` | **Supabase (Read) + Cloudinary** | Direct Supabase query on `public.timeline_events` ordered by era. |
| `/encyclopedia` | `Encyclopedia.tsx` | **Supabase (Read) + Cloudinary** | Direct Supabase query on `public.encyclopedia_entries` with category filter. |
| `/encyclopedia/:id` | `EncyclopediaDetail.tsx`| **Supabase (Read) + Cloudinary** | Direct Supabase query with related entry lookups. |
| `/selected` | `HekayatySelected.tsx` | **Supabase (Read) + Cloudinary** | Direct Supabase query where `classification = 'hekayaty_selected'`. |
| `/news` | `News.tsx` | **Supabase (Read) + Cloudinary** | Direct Supabase query on `public.news_articles` ordered by `published_at DESC`. |
| `/news/:id` | `NewsDetail.tsx` | **Supabase (Read) + Cloudinary** | Direct Supabase query for full editorial article content. |
| `/events` | `Events.tsx` | **Supabase (Read) + Cloudinary** | Direct Supabase query on `public.events`. |
| `/card-game` | `CardGame.tsx` | **Supabase (Read) + Cloudinary** | Direct Supabase query on `public.card_game_cards`. |
| `/community` | `Community.tsx` | **Supabase (Read) + Express (Posts)**| Community feed read via Supabase; submissions and moderation actions routed through Express. |
| `/profile` | `Profile.tsx` | **Supabase (Direct User RLS)** | User profile, reading progress, favorites, and collections read/updated directly via Supabase with RLS. |
| `/profile/:id` | `Profile.tsx` | **Supabase (Public RLS)** | Public author/creator profile dossier. |
| `/editorial` | `Editorial.tsx` | **Express API (RBAC Guarded)** | Admin and Publisher CMS dashboard: creating/editing issues, managing inventory. |
| *(Modal)* | `SearchOverlay.tsx` | **Supabase (Full-Text Search)** | Direct Supabase RPC using PostgreSQL `tsvector` or text search matching across all catalog entities. |
| *(Drawer)* | Notifications Drawer | **Supabase (Realtime/Read)** | Direct Supabase query on `public.notifications` where `user_id = auth.uid()`. |

---

## 2. Safe Transition from LocalStorage & Mock Data

1. **Phase A (Dual-Mode Layer)**:
   - Introduce `@/lib/supabaseClient.ts` configuring Supabase JS SDK.
   - When Supabase credentials (`VITE_SUPABASE_URL`) are present, components query Supabase.
   - If offline or credentials unset, fallback gracefully to `mockData.ts` to guarantee zero UI crashes during development.
2. **Phase B (State Migration)**:
   - Migrate Zustand store `useAppStore.ts`:
     - Keep `theme` ('dark' | 'light') and UI drawer toggles in `localStorage`.
     - Migrate `readingProgress`, `favorites`, and `collections` to Supabase table subscriptions with optimistic local UI updates.
3. **Phase C (Authoritative Cloud State)**:
   - Deprecate mock data in production builds. All business and lore data stream authoritatively from Supabase and Cloudinary.
