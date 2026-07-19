/*
# Lock all writes to two authorized emails; keep reads public

## Why
The pregnancy journal is a shared, public site: anyone who visits should be able
to SEE the content (kicks, weights, month media, memory photos, guestbook).
However, only the two parents (tbisht82@gmail.com and soa4991@gmail.com) should
be able to ADD, EDIT, or DELETE data. This migration flips the RLS policies so
that reads stay open to everyone but every write operation requires an
authenticated session whose email is on the allow-list.

## What changes
For each of the 5 public tables (kick_sessions, weight_logs, month_media,
memory_photos, guestbook_entries):
  - DROP the existing anon-read-and-write policies (select/insert/update/delete).
  - Recreate SELECT policy as public read: TO anon, authenticated USING (true).
    This is intentional — the data is shared content for all visitors.
  - Recreate INSERT / UPDATE / DELETE policies as admin-only: TO authenticated,
    gated by the allow-listed email check
      auth.jwt() ->> 'email' IN ('tbisht82@gmail.com','soa4991@gmail.com')
    (with matching WITH CHECK on insert/update).

## Security
- RLS stays enabled on every table.
- Reads: public (anon + authenticated) — the site still renders for visitors.
- Writes: restricted to the two allow-listed emails via JWT email claim.
  Anonymous visitors cannot write. Authenticated users with any other email
  cannot write either — the policy fails closed for non-allow-listed accounts.

## Important notes
1. The frontend must ship sign-in UI for the two admin emails in the SAME
   release; otherwise writes silently fail (the anon-key client has no JWT,
   so insert/update/delete are rejected by RLS).
2. We do NOT add user_id columns. The tables stay schemaless w.r.t. ownership;
   access is decided purely by the signed-in user's email claim, not by a
   per-row owner. This is correct for a two-person shared journal.
3. SELECT uses USING (true) intentionally — this is the documented public-data
   case, not an ownership shortcut.
*/

-- helper: allow-list predicate repeated per table for clarity
-- auth.jwt() ->> 'email' returns the signed-in user's email (null when anon)

-- =========================== kick_sessions ===========================
DROP POLICY IF EXISTS "anon_select_kicks" ON kick_sessions;
DROP POLICY IF EXISTS "anon_insert_kicks" ON kick_sessions;
DROP POLICY IF EXISTS "anon_update_kicks" ON kick_sessions;
DROP POLICY IF EXISTS "anon_delete_kicks" ON kick_sessions;

CREATE POLICY "public_read_kicks" ON kick_sessions FOR SELECT
  TO anon, authenticated USING (true);

CREATE POLICY "admin_insert_kicks" ON kick_sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt() ->> 'email' IN ('tbisht82@gmail.com','soa4991@gmail.com'));

CREATE POLICY "admin_update_kicks" ON kick_sessions FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'email' IN ('tbisht82@gmail.com','soa4991@gmail.com'))
  WITH CHECK (auth.jwt() ->> 'email' IN ('tbisht82@gmail.com','soa4991@gmail.com'));

CREATE POLICY "admin_delete_kicks" ON kick_sessions FOR DELETE
  TO authenticated
  USING (auth.jwt() ->> 'email' IN ('tbisht82@gmail.com','soa4991@gmail.com'));

-- =========================== weight_logs ===========================
DROP POLICY IF EXISTS "anon_select_weights" ON weight_logs;
DROP POLICY IF EXISTS "anon_insert_weights" ON weight_logs;
DROP POLICY IF EXISTS "anon_update_weights" ON weight_logs;
DROP POLICY IF EXISTS "anon_delete_weights" ON weight_logs;

CREATE POLICY "public_read_weights" ON weight_logs FOR SELECT
  TO anon, authenticated USING (true);

CREATE POLICY "admin_insert_weights" ON weight_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt() ->> 'email' IN ('tbisht82@gmail.com','soa4991@gmail.com'));

CREATE POLICY "admin_update_weights" ON weight_logs FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'email' IN ('tbisht82@gmail.com','soa4991@gmail.com'))
  WITH CHECK (auth.jwt() ->> 'email' IN ('tbisht82@gmail.com','soa4991@gmail.com'));

CREATE POLICY "admin_delete_weights" ON weight_logs FOR DELETE
  TO authenticated
  USING (auth.jwt() ->> 'email' IN ('tbisht82@gmail.com','soa4991@gmail.com'));

-- =========================== month_media ===========================
DROP POLICY IF EXISTS "anon_select_month_media" ON month_media;
DROP POLICY IF EXISTS "anon_insert_month_media" ON month_media;
DROP POLICY IF EXISTS "anon_update_month_media" ON month_media;
DROP POLICY IF EXISTS "anon_delete_month_media" ON month_media;

CREATE POLICY "public_read_month_media" ON month_media FOR SELECT
  TO anon, authenticated USING (true);

CREATE POLICY "admin_insert_month_media" ON month_media FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt() ->> 'email' IN ('tbisht82@gmail.com','soa4991@gmail.com'));

CREATE POLICY "admin_update_month_media" ON month_media FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'email' IN ('tbisht82@gmail.com','soa4991@gmail.com'))
  WITH CHECK (auth.jwt() ->> 'email' IN ('tbisht82@gmail.com','soa4991@gmail.com'));

CREATE POLICY "admin_delete_month_media" ON month_media FOR DELETE
  TO authenticated
  USING (auth.jwt() ->> 'email' IN ('tbisht82@gmail.com','soa4991@gmail.com'));

-- =========================== memory_photos ===========================
DROP POLICY IF EXISTS "anon_select_memories" ON memory_photos;
DROP POLICY IF EXISTS "anon_insert_memories" ON memory_photos;
DROP POLICY IF EXISTS "anon_update_memories" ON memory_photos;
DROP POLICY IF EXISTS "anon_delete_memories" ON memory_photos;

CREATE POLICY "public_read_memories" ON memory_photos FOR SELECT
  TO anon, authenticated USING (true);

CREATE POLICY "admin_insert_memories" ON memory_photos FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt() ->> 'email' IN ('tbisht82@gmail.com','soa4991@gmail.com'));

CREATE POLICY "admin_update_memories" ON memory_photos FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'email' IN ('tbisht82@gmail.com','soa4991@gmail.com'))
  WITH CHECK (auth.jwt() ->> 'email' IN ('tbisht82@gmail.com','soa4991@gmail.com'));

CREATE POLICY "admin_delete_memories" ON memory_photos FOR DELETE
  TO authenticated
  USING (auth.jwt() ->> 'email' IN ('tbisht82@gmail.com','soa4991@gmail.com'));

-- =========================== guestbook_entries ===========================
DROP POLICY IF EXISTS "anon_select_guestbook" ON guestbook_entries;
DROP POLICY IF EXISTS "anon_insert_guestbook" ON guestbook_entries;
DROP POLICY IF EXISTS "anon_update_guestbook" ON guestbook_entries;
DROP POLICY IF EXISTS "anon_delete_guestbook" ON guestbook_entries;

CREATE POLICY "public_read_guestbook" ON guestbook_entries FOR SELECT
  TO anon, authenticated USING (true);

CREATE POLICY "admin_insert_guestbook" ON guestbook_entries FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt() ->> 'email' IN ('tbisht82@gmail.com','soa4991@gmail.com'));

CREATE POLICY "admin_update_guestbook" ON guestbook_entries FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'email' IN ('tbisht82@gmail.com','soa4991@gmail.com'))
  WITH CHECK (auth.jwt() ->> 'email' IN ('tbisht82@gmail.com','soa4991@gmail.com'));

CREATE POLICY "admin_delete_guestbook" ON guestbook_entries FOR DELETE
  TO authenticated
  USING (auth.jwt() ->> 'email' IN ('tbisht82@gmail.com','soa4991@gmail.com'));
