/*
# Trackers persistence (kicks, weight) + month photos/videos

## Summary
Adds persistent storage for the journal's trackers and the month-card photo/video
icons. The app has no sign-in screen, so all tables are single-tenant with
intentionally open `anon, authenticated` policies. Also adds a public storage
bucket `month_media` for photos/videos attached to month entries.

## New Tables

1. `kick_sessions`
   - `id` (uuid, primary key)
   - `kicks` (integer, not null, default 0) — count of kicks in this session
   - `started_at` (timestamptz, default now()) — when the session began
   - `ended_at` (timestamptz, nullable) — when the session was ended (still running until set)

2. `weight_logs`
   - `id` (uuid, primary key)
   - `kind` (text, not null) — 'mom' or 'baby'
   - `value_kg` (numeric, not null) — weight in kilograms
   - `logged_at` (date, not null, default now()) — day the weight was recorded
   - `note` (text, nullable) — optional note
   - Unique on (kind, logged_at) so one entry per day per kind (mom can update today's)

3. `month_media`
   - `id` (uuid, primary key)
   - `month` (integer, not null) — which month card (1–9)
   - `slot` (integer, not null) — slot index 0–2 on the card
   - `kind` (text, not null) — 'photo' or 'video'
   - `storage_path` (text, not null) — path in the `month_media` storage bucket
   - `created_at` (timestamptz, default now())
   - Unique on (month, slot) so each slot holds one media item

## Storage
- Creates a public storage bucket `month_media` for month-card uploads.

## Security (RLS)
- All tables have RLS ENABLED with four `anon, authenticated` CRUD policies each
  (`USING (true)` / `WITH CHECK (true)`) — the data is intentionally shared across
  all visitors because the app has no accounts.
- `month_media` bucket has anon read/insert/update/delete policies scoped to that
  bucket only.

## Notes
1. Kick sessions are rows: a new session is an insert; adding a kick is an
   increment; ending is setting `ended_at`; "reset all" deletes all rows.
2. Weight logs are unique per (kind, day): logging today's weight upserts the
   existing row for today + that kind, so the chart updates in place.
3. Month card slots are unique per (month, slot); re-uploading replaces the
   existing file in storage and updates the row's path.
*/

CREATE TABLE IF NOT EXISTS kick_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kicks integer NOT NULL DEFAULT 0,
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz
);

ALTER TABLE kick_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_kicks" ON kick_sessions;
CREATE POLICY "anon_select_kicks" ON kick_sessions
  FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_kicks" ON kick_sessions;
CREATE POLICY "anon_insert_kicks" ON kick_sessions
  FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_kicks" ON kick_sessions;
CREATE POLICY "anon_update_kicks" ON kick_sessions
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_kicks" ON kick_sessions;
CREATE POLICY "anon_delete_kicks" ON kick_sessions
  FOR DELETE TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS weight_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL CHECK (kind IN ('mom','baby')),
  value_kg numeric NOT NULL,
  logged_at date NOT NULL DEFAULT now(),
  note text,
  UNIQUE (kind, logged_at)
);

ALTER TABLE weight_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_weights" ON weight_logs;
CREATE POLICY "anon_select_weights" ON weight_logs
  FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_weights" ON weight_logs;
CREATE POLICY "anon_insert_weights" ON weight_logs
  FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_weights" ON weight_logs;
CREATE POLICY "anon_update_weights" ON weight_logs
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_weights" ON weight_logs;
CREATE POLICY "anon_delete_weights" ON weight_logs
  FOR DELETE TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS month_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  month integer NOT NULL,
  slot integer NOT NULL,
  kind text NOT NULL CHECK (kind IN ('photo','video')),
  storage_path text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (month, slot)
);

ALTER TABLE month_media ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_month_media" ON month_media;
CREATE POLICY "anon_select_month_media" ON month_media
  FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_month_media" ON month_media;
CREATE POLICY "anon_insert_month_media" ON month_media
  FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_month_media" ON month_media;
CREATE POLICY "anon_update_month_media" ON month_media
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_month_media" ON month_media;
CREATE POLICY "anon_delete_month_media" ON month_media
  FOR DELETE TO anon, authenticated USING (true);

INSERT INTO storage.buckets (id, name, public)
VALUES ('month_media', 'month_media', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "anon_select_month_media_bucket" ON storage.objects;
CREATE POLICY "anon_select_month_media_bucket" ON storage.objects
  FOR SELECT TO anon, authenticated USING (bucket_id = 'month_media');
DROP POLICY IF EXISTS "anon_insert_month_media_bucket" ON storage.objects;
CREATE POLICY "anon_insert_month_media_bucket" ON storage.objects
  FOR INSERT TO anon, authenticated WITH CHECK (bucket_id = 'month_media');
DROP POLICY IF EXISTS "anon_update_month_media_bucket" ON storage.objects;
CREATE POLICY "anon_update_month_media_bucket" ON storage.objects
  FOR UPDATE TO anon, authenticated USING (bucket_id = 'month_media') WITH CHECK (bucket_id = 'month_media');
DROP POLICY IF EXISTS "anon_delete_month_media_bucket" ON storage.objects;
CREATE POLICY "anon_delete_month_media_bucket" ON storage.objects
  FOR DELETE TO anon, authenticated USING (bucket_id = 'month_media');
