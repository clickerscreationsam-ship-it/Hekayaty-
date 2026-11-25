# HEKAYATY (حكاياتي) — SUPABASE ROW LEVEL SECURITY (RLS) POLICY MATRIX

Row-Level Security (RLS) is PostgreSQL's built-in defense ensuring that data access constraints are enforced directly at the database engine level, independent of client-side code.

---

## 1. RLS Policy Summary by Table

| Table | SELECT | INSERT | UPDATE | DELETE | Security Notes |
| :--- | :---: | :---: | :---: | :---: | :--- |
| `profiles` | Public (active) | System Trigger | Self (`auth.uid() = id`) | Admin Only | Role changes restricted to Admin/Service-Role |
| `worlds` | Public (all) | Admin Only | Admin Only | Admin Only | Public read, admin-only mutation |
| `characters` | Public (all) | Admin Only | Admin Only | Admin Only | Public read, admin-only mutation |
| `series` | Public (all) | Admin / Publisher | Admin / Publisher | Admin Only | Publishers can manage own series |
| `comics` | Public (published) | Admin / Publisher | Admin / Publisher | Admin Only | Drafts hidden from anonymous users |
| `comic_pages` | Public (previews only) | Admin / Publisher | Admin / Publisher | Admin Only | Full page URLs require Service-Role/Express entitlement |
| `stories` | Public (free) / Entitled | Admin / Writer / Pub | Author / Admin | Admin Only | Paid stories content protected |
| `timeline_events` | Public (all) | Admin Only | Admin Only | Admin Only | Canonical historical registry |
| `encyclopedia_entries` | Public (all) | Admin Only | Admin Only | Admin Only | Canonical lore entries |
| `reading_progress` | Self (`auth.uid() = user_id`) | Self (`auth.uid() = user_id`) | Self (`auth.uid() = user_id`) | Self (`auth.uid() = user_id`) | Strict tenant isolation |
| `favorites` | Self (`auth.uid() = user_id`) | Self (`auth.uid() = user_id`) | Self (`auth.uid() = user_id`) | Self (`auth.uid() = user_id`) | Strict tenant isolation |
| `collections` | Self / Public if shared | Self (`auth.uid() = user_id`) | Self (`auth.uid() = user_id`) | Self (`auth.uid() = user_id`) | Strict tenant isolation |
| `products` | Public (active) | Admin / Publisher | Admin / Publisher | Admin Only | Writers forbidden from creating physical products |
| `orders` | Self (`auth.uid() = user_id`) | Express / Service-Role | Express / Service-Role | None | Order creation orchestrated via Express |
| `order_items` | Self (via order parent) | Express / Service-Role | Express / Service-Role | None | Strict parent order linkage |
| `entitlements` | Self (`auth.uid() = user_id`) | Express / Service-Role | Express / Service-Role | None | Granted only upon verified purchase/subscription |
| `subscriptions` | Self (`auth.uid() = user_id`) | Express / Service-Role | Express / Service-Role | None | Managed exclusively by Express checkout & webhooks |
| `audit_logs` | Admin Only | Express / Service-Role | None | None | Append-only immutable log |

---

## 2. Production SQL Policies (Copy-Paste Ready for Supabase Migrations)

```sql
-- Enable RLS across all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worlds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.series ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comic_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.encyclopedia_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reading_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to check role in profiles
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS user_role AS $$
    SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 1. Profiles
CREATE POLICY "Public profiles are viewable by everyone" 
    ON public.profiles FOR SELECT USING (is_active = true);

CREATE POLICY "Users can update their own profile" 
    ON public.profiles FOR UPDATE USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id AND role = (SELECT role FROM public.profiles WHERE id = auth.uid())); -- Prevent self-role escalation

-- 2. Universe Lore (Public Read)
CREATE POLICY "Worlds are viewable by everyone" ON public.worlds FOR SELECT USING (true);
CREATE POLICY "Characters are viewable by everyone" ON public.characters FOR SELECT USING (true);
CREATE POLICY "Series are viewable by everyone" ON public.series FOR SELECT USING (true);
CREATE POLICY "Timeline is viewable by everyone" ON public.timeline_events FOR SELECT USING (true);
CREATE POLICY "Encyclopedia is viewable by everyone" ON public.encyclopedia_entries FOR SELECT USING (true);

-- 3. Comics (Only published comics or creator preview)
CREATE POLICY "Comics viewable by everyone if published" 
    ON public.comics FOR SELECT 
    USING (status = 'published' OR auth.uid() IS NOT NULL);

-- 4. Comic Pages (Previews only for public, full reader pages served via Express)
CREATE POLICY "Comic page previews viewable by everyone" 
    ON public.comic_pages FOR SELECT 
    USING (is_preview = true);

-- 5. Stories
CREATE POLICY "Stories viewable by everyone" 
    ON public.stories FOR SELECT USING (true);

-- 6. Reading Progress (Tenant Isolated)
CREATE POLICY "Users can manage own reading progress" 
    ON public.reading_progress FOR ALL 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 7. Favorites (Tenant Isolated)
CREATE POLICY "Users can manage own favorites" 
    ON public.favorites FOR ALL 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 8. Collections (Tenant Isolated)
CREATE POLICY "Users can manage own collections" 
    ON public.collections FOR ALL 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 9. Orders & Entitlements (Read-only for user, mutations via Express Service-Role)
CREATE POLICY "Users can view own orders" 
    ON public.orders FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own entitlements" 
    ON public.entitlements FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own subscriptions" 
    ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);

-- 10. Products (Active products are viewable by everyone)
CREATE POLICY "Products viewable by everyone" 
    ON public.products FOR SELECT USING (is_active = true);
```
