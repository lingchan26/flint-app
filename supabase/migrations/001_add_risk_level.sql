-- ============================================================
-- Migration: Add risk_level to projects table
-- Run in Supabase SQL Editor if your database already exists
-- ============================================================

ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS risk_level INTEGER DEFAULT 10;

-- Add constraint to ensure only valid probability values are stored
ALTER TABLE projects
  DROP CONSTRAINT IF EXISTS projects_risk_level_check;

ALTER TABLE projects
  ADD CONSTRAINT projects_risk_level_check
  CHECK (risk_level IN (10, 30, 50, 70, 90, 100));

-- Backfill existing rows
UPDATE projects SET risk_level = 10 WHERE risk_level IS NULL;
