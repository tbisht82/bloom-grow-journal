-- Drop redundant admin-only insert policy; public_insert_guestbook now covers all inserts
DROP POLICY IF EXISTS "admin_insert_guestbook" ON guestbook_entries;
