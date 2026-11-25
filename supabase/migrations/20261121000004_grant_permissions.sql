-- =============================================================================
-- HEKAYATY (حكاياتي) — SUPABASE POSTGREST ROLE PERMISSIONS
-- Migration: 20261121000004_grant_permissions.sql
-- Description: Grants table, sequence and routine access to PostgREST roles
-- =============================================================================

-- 1. GRANT USAGE ON SCHEMA
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- 2. GRANT PERMISSIONS ON ALL EXISTING TABLES, SEQUENCES, ROUTINES
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

-- 3. ENSURE FUTURE OBJECTS IN SCHEMA PUBLIC INHERIT PERMISSIONS AUTOMATICALLY
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO anon, authenticated, service_role;
