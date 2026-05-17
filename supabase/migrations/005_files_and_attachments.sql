-- ════════════════════════════════════════════════════════════════════════════
-- Stage 4 migration — project_attachments + files tables
-- ════════════════════════════════════════════════════════════════════════════
-- Stores metadata about uploaded files. The actual files live in Supabase
-- Storage. The storage bucket must be created separately in the Supabase
-- dashboard (see instructions in the deploy checklist).
-- ════════════════════════════════════════════════════════════════════════════

-- ── Project attachments ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS project_attachments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  storage_path TEXT NOT NULL,       -- path inside the 'project-files' bucket
  filename TEXT NOT NULL,
  size_bytes BIGINT,
  mime_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE project_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own project attachments"
  ON project_attachments FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own project attachments"
  ON project_attachments FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own project attachments"
  ON project_attachments FOR DELETE USING (auth.uid() = user_id);


-- ── Files & Templates (the standalone "Files" section) ─────────────
CREATE TABLE IF NOT EXISTS user_files (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  storage_path TEXT NOT NULL,       -- path inside the 'user-files' bucket
  filename TEXT NOT NULL,
  size_bytes BIGINT,
  mime_type TEXT,
  category TEXT DEFAULT 'general',  -- 'template' | 'asset' | 'contract' | 'invoice' | 'general'
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own files"
  ON user_files FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own files"
  ON user_files FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own files"
  ON user_files FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own files"
  ON user_files FOR DELETE USING (auth.uid() = user_id);
