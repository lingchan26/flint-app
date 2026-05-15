-- ════════════════════════════════════════════════════════════════════════════
-- Stage 1 migration — Setup screen support
-- ════════════════════════════════════════════════════════════════════════════
-- Adds two JSONB columns to profiles so Setup's notification preferences and
-- Flint Brief section toggles persist properly. Both default to sensible empty
-- objects so existing rows keep working.
-- ════════════════════════════════════════════════════════════════════════════

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS notification_prefs JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS flint_brief_sections JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS flint_brief_timezone TEXT DEFAULT 'SGT';
