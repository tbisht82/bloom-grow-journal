/*
# Create settings table to persist the due date

## Why
The due date was previously stored only in the browser's localStorage, so
changing it in one browser did not affect what other visitors saw. Moving it
into the database makes it a single shared value for everyone.

## What changes
- New table `app_settings`:
  - `key` (text, primary key) — a stable name for the setting, e.g. "due_date".
  - `value` (text, not null) — the setting value (ISO date string for due_date).
  - `updated_at` (timestamptz, default now()) — last modification time.
- A single seed row is inserted for `due_date` with the existing default
  (2026-08-06) so the app has a value to read before any admin edits it.

## Security
- RLS enabled on `app_settings`.
- SELECT is public (TO anon, authenticated USING (true)) — the due date is
  shared content every visitor needs to render the journal.
- INSERT / UPDATE / DELETE are admin-only, gated by the allow-listed email
  check already used across the other tables:
    auth.jwt() ->> 'email' IN ('tbisht82@gmail.com','soa4991@gmail.com')
  Only the two parents can change the due date.

## Important notes
1. No user_id column — this is a two-person shared journal; access is decided
   purely by the signed-in user's email claim, not per-row ownership.
2. SELECT uses USING (true) intentionally — the due date is shared public
   content for all visitors.
3. The seed row is inserted with ON CONFLICT DO NOTHING so re-running the
   migration is safe and will never overwrite an admin's edit.
*/

CREATE TABLE IF NOT EXISTS app_settings (
  key text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_settings" ON app_settings;
CREATE POLICY "public_read_settings" ON app_settings FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_settings" ON app_settings;
CREATE POLICY "admin_insert_settings" ON app_settings FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt() ->> 'email' IN ('tbisht82@gmail.com','soa4991@gmail.com'));

DROP POLICY IF EXISTS "admin_update_settings" ON app_settings;
CREATE POLICY "admin_update_settings" ON app_settings FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'email' IN ('tbisht82@gmail.com','soa4991@gmail.com'))
  WITH CHECK (auth.jwt() ->> 'email' IN ('tbisht82@gmail.com','soa4991@gmail.com'));

DROP POLICY IF EXISTS "admin_delete_settings" ON app_settings;
CREATE POLICY "admin_delete_settings" ON app_settings FOR DELETE
  TO authenticated
  USING (auth.jwt() ->> 'email' IN ('tbisht82@gmail.com','soa4991@gmail.com'));

-- Seed the due_date row with the existing default. ON CONFLICT DO NOTHING
-- keeps any value an admin has already set when the migration is re-run.
INSERT INTO app_settings (key, value)
VALUES ('due_date', '2026-08-06')
ON CONFLICT (key) DO NOTHING;
