-- ════════════════════════════════════════════════════════════════════════════
-- Stage 2 migration — Tasks support for the Calendar's Tasks tab
-- ════════════════════════════════════════════════════════════════════════════
-- The Calendar component has a Tasks tab. Sessions/events already have a table
-- (calendar_events from schema.sql) but Tasks did not. This adds it.
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS tasks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  project TEXT,
  due_date DATE,
  due_time TIME,
  reminder TEXT DEFAULT 'At due time',
  done BOOLEAN DEFAULT FALSE,
  done_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own tasks"
  ON tasks FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tasks"
  ON tasks FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks"
  ON tasks FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks"
  ON tasks FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER set_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();
