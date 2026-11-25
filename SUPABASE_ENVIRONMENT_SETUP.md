# HEKAYATY (حكاياتي) — SUPABASE ENVIRONMENT SETUP & CONFIGURATION GUIDE
## Configuration Specifications, Environment Variables & Credential Management

This document defines the configuration parameters for the Supabase hybrid backend.

---

## 1. Environment Variable Architecture

The platform architecture strictly segregates public frontend variables from privileged backend credentials.

### 1.1 Frontend Environment (`artifacts/hekayaty-world/.env`)
These variables are baked into client bundles by Vite and are publicly visible:

```env
# Supabase Public Parameters
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOi... # Standard Anon / Publishable Key

# Cloudinary Public Parameters (Media Delivery)
VITE_CLOUDINARY_CLOUD_NAME=hekayaty

# Base Configuration
PORT=3000
BASE_PATH=/
```

> [!CAUTION]
> NEVER include `SUPABASE_SECRET_KEY` or `CLOUDINARY_API_SECRET` in any file prefixed with `VITE_` or inside the `artifacts/hekayaty-world/` package!

---

### 1.2 Backend Environment (`artifacts/api-server/.env`)
These variables reside strictly in the Express server runtime environment:

```env
# Server Port
PORT=3001
NODE_ENV=development

# Supabase Authoritative Credentials
SUPABASE_URL=https://<your-project-ref>.supabase.co
SUPABASE_PUBLISHABLE_KEY=eyJhbGciOi... # For user-scoped clients
SUPABASE_SECRET_KEY=eyJhbGciOi...      # Service Role Key — strictly private

# Direct PostgreSQL Connection (Optional Drizzle Querying / Migrations)
DATABASE_URL=postgresql://postgres.<your-project-ref>:<db-password>@aws-0-<region>.pooler.supabase.com:6543/postgres?pgbouncer=true

# Cloudinary Privileged Credentials (Signed Uploads)
CLOUDINARY_CLOUD_NAME=hekayaty
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwx
```

---

## 2. Supabase Project Configuration (`supabase/config.toml`)

The Supabase project is configured with the following parameters:

```toml
project_id = "hekayaty-world"

[api]
enabled = true
port = 54321
schemas = ["public", "storage"]
extra_search_path = ["public", "extensions"]
max_rows = 1000

[db]
port = 54322
major_version = 16

[auth]
enabled = true
site_url = "http://localhost:3000"
additional_redirect_urls = ["http://localhost:3000/**"]
jwt_expiry = 3600
enable_signup = true

[auth.email]
enable_signup = true
double_confirm_changes = true
enable_confirmations = true

[storage]
enabled = false # Media handled by Cloudinary
```

---

## 3. How to Connect a Live Supabase Project

When Supabase project credentials become available:

1. **Step 1: Link the Project**:
   ```powershell
   supabase login
   supabase link --project-ref <your-project-ref>
   ```
2. **Step 2: Push Migrations**:
   ```powershell
   supabase db push
   ```
   This executes `20261121000001_initial_schema.sql`, `20261121000002_rls_policies.sql`, and `20261121000003_seed_data.sql` sequentially.
3. **Step 3: Update Server Environment**:
   Add `SUPABASE_URL` and `SUPABASE_SECRET_KEY` into `artifacts/api-server/.env`.
4. **Step 4: Verify Live Queries**:
   Run `pnpm --filter @workspace/scripts exec tsx ./src/test-database-foundation.ts`.
