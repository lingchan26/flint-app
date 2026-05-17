-- ════════════════════════════════════════════════════════════════════════════
-- Stage 4 migration — form_templates table
-- ════════════════════════════════════════════════════════════════════════════
-- The Forms & Templates section lets users save reusable templates (briefs,
-- contracts, proposals, etc). lead_forms is for public lead capture; this
-- is for internal-use templates the user can later send/attach to projects.
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS form_templates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'brief',   -- 'brief' | 'proposal' | 'contract' | 'questionnaire' | 'other'
  description TEXT,
  fields JSONB DEFAULT '[]',
  active BOOLEAN DEFAULT TRUE,
  use_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE form_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own templates"
  ON form_templates FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own templates"
  ON form_templates FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own templates"
  ON form_templates FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own templates"
  ON form_templates FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER set_form_templates_updated_at
  BEFORE UPDATE ON form_templates
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();
