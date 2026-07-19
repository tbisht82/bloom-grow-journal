-- Allow anyone (anon or authenticated) to insert into guestbook_entries
DROP POLICY IF EXISTS "insert_own_guestbook" ON guestbook_entries;

CREATE POLICY "public_insert_guestbook" ON guestbook_entries
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);
