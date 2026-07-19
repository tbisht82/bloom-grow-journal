/*
# Add muted flag to month_media for audio toggle on video uploads

## Why
Admins want the option to upload a video without audio (e.g. a silent bump
clip). A toggle at upload time lets them choose; the choice is persisted
on the row so playback respects it everywhere.

## What changes
- New column `month_media.muted` (boolean, NOT NULL, default false).
  - false = keep audio (default, existing behavior)
  - true = no audio (video plays muted)

## Security
- No policy changes. Existing admin-only write / public read RLS on
  month_media already covers the new column.

## Important notes
1. Default false preserves existing behavior for any rows already present.
2. ADD COLUMN IF NOT EXISTS makes re-running safe.
*/

ALTER TABLE month_media
  ADD COLUMN IF NOT EXISTS muted boolean NOT NULL DEFAULT false;
