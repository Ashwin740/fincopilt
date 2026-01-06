-- 1. Enable RLS on question_cache table
-- Even though the data is public, Supabase requires RLS for best practice.
-- We will allow public read access (SELECT) but no direct public write access.
ALTER TABLE question_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read-only access to question cache"
ON question_cache
FOR SELECT
USING (true);

-- 2. Fix SECURITY DEFINER function search_path warning
-- This prevents search_path hijacking by explicitly setting it to the required schema.
ALTER FUNCTION link_guest_history(VARCHAR, UUID) 
SET search_path = public;

-- 3. Note on the 'vector' extension warning:
-- Moving the extension schema is a high-level architectural change.
-- It is usually safer to keep it in 'public' unless you have a multi-tenant setup.
-- We will skip moving it to avoid breaking current code references.
