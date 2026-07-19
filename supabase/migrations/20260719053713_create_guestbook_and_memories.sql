/*
# Guestbook and Memory Wall for pregnancy journal

## Summary
Adds two shared (no-auth, single-tenant) tables to support a guestbook where
family and friends can leave messages, and a photo/memory wall where anyone can
upload an image with an optional caption. The app has no sign-in screen, so
policies are intentionally open to the anon + authenticated roles.

## New Tables

1. `guestbook_entries`
   - `id` (uuid, primary key)
   - `author_name` (text, not null) — who left the message
   - `message` (text, not null) — the message body
   - `relationship` (text, nullable) — optional free-text relationship tag ("Auntie", "Friend")
   - `created_at` (timestamptz, default now()) — when the entry was posted

2. `memory_photos`
   - `id` (uuid, primary key)
   - `author_name` (text, not null) — who posted the photo
   - `caption` (text, nullable) — optional caption
   - `storage_path` (text, not null) — path within the `memories` storage bucket
   - `created_at` (timestamptz, default now()) — when the photo was posted

## Storage
- Creates a public storage bucket `memories` for photo uploads.

## Security (RLS)
- Both tables have RLS ENABLED.
- Four CRUD policies each, scoped to `TO anon, authenticated` with `USING (true)`
  / `WITH CHECK (true)` because the data is intentionally public/shared across all
  visitors (no sign-in in this app). The bucket is public-read for the same reason.
- No `user_id` columns and no `auth.uid()` checks because there is no auth flow.

## Notes
1. The frontend uploads images directly to the `memories` bucket and stores the
   resulting path in `memory_photos.storage_path`.
2. Anyone can read, post, and delete entries — appropriate for a shared family
   journal with no accounts.
*/

CREATE TABLE IF NOT EXISTS guestbook_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_name text NOT NULL,
  message text NOT NULL,
  relationship text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE guestbook_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_guestbook" ON guestbook_entries;
CREATE POLICY "anon_select_guestbook" ON guestbook_entries
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_guestbook" ON guestbook_entries;
CREATE POLICY "anon_insert_guestbook" ON guestbook_entries
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_guestbook" ON guestbook_entries;
CREATE POLICY "anon_update_guestbook" ON guestbook_entries
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_guestbook" ON guestbook_entries;
CREATE POLICY "anon_delete_guestbook" ON guestbook_entries
  FOR DELETE TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS memory_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_name text NOT NULL,
  caption text,
  storage_path text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE memory_photos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_memories" ON memory_photos;
CREATE POLICY "anon_select_memories" ON memory_photos
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_memories" ON memory_photos;
CREATE POLICY "anon_insert_memories" ON memory_photos
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_memories" ON memory_photos;
CREATE POLICY "anon_update_memories" ON memory_photos
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_memories" ON memory_photos;
CREATE POLICY "anon_delete_memories" ON memory_photos
  FOR DELETE TO anon, authenticated USING (true);

INSERT INTO storage.buckets (id, name, public)
VALUES ('memories', 'memories', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "anon_select_memories_bucket" ON storage.objects;
CREATE POLICY "anon_select_memories_bucket" ON storage.objects
  FOR SELECT TO anon, authenticated USING (bucket_id = 'memories');

DROP POLICY IF EXISTS "anon_insert_memories_bucket" ON storage.objects;
CREATE POLICY "anon_insert_memories_bucket" ON storage.objects
  FOR INSERT TO anon, authenticated WITH CHECK (bucket_id = 'memories');

DROP POLICY IF EXISTS "anon_update_memories_bucket" ON storage.objects;
CREATE POLICY "anon_update_memories_bucket" ON storage.objects
  FOR UPDATE TO anon, authenticated USING (bucket_id = 'memories') WITH CHECK (bucket_id = 'memories');

DROP POLICY IF EXISTS "anon_delete_memories_bucket" ON storage.objects;
CREATE POLICY "anon_delete_memories_bucket" ON storage.objects
  FOR DELETE TO anon, authenticated USING (bucket_id = 'memories');
