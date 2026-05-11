-- ============================================================
-- FLINT — Full Database Schema
-- Run this in Supabase SQL Editor (Project → SQL Editor → New query)
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── PROFILES ─────────────────────────────────────────────────
-- Extends Supabase auth.users with business info
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  business_name TEXT,
  logo_url TEXT,
  timezone TEXT DEFAULT 'Asia/Singapore',
  currency TEXT DEFAULT 'SGD',
  monthly_revenue_target NUMERIC DEFAULT 120000,
  email_notifications BOOLEAN DEFAULT TRUE,
  flint_brief_enabled BOOLEAN DEFAULT TRUE,
  flint_brief_time TIME DEFAULT '07:00',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── PROJECTS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  client TEXT,
  service_type TEXT,
  stage TEXT DEFAULT 'New',
  tags TEXT[] DEFAULT '{}',
  start_date DATE,
  end_date DATE,
  timezone TEXT DEFAULT 'Asia/Singapore',
  lead_source TEXT,
  value NUMERIC DEFAULT 0,
  hours_sold NUMERIC DEFAULT 0,
  description TEXT,
  notes TEXT,
  archived BOOLEAN DEFAULT FALSE,
  risk_level INTEGER DEFAULT 10 CHECK (risk_level IN (10, 30, 50, 70, 90, 100)),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── CONTACTS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS contacts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  job_title TEXT,
  website TEXT,
  status TEXT DEFAULT 'Follow Up',
  relationship INTEGER DEFAULT 3 CHECK (relationship BETWEEN 1 AND 5),
  last_interaction DATE,
  last_project TEXT,
  last_project_date TEXT,
  ltv NUMERIC DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── CLIENTS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS clients (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  company TEXT,
  email TEXT,
  phone TEXT,
  industry TEXT,
  status TEXT DEFAULT 'Active',
  project_count INTEGER DEFAULT 0,
  total_value NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── INVOICES ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS invoices (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  invoice_number TEXT NOT NULL,
  client TEXT NOT NULL,
  project TEXT,
  amount NUMERIC NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'SGD',
  due_date DATE,
  status TEXT DEFAULT 'Upcoming',
  month TEXT,
  service_type TEXT,
  chase_active BOOLEAN DEFAULT FALSE,
  chase_reminders JSONB DEFAULT '[]',
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── EXPENSES ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS expenses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  merchant TEXT NOT NULL,
  date DATE NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'SGD',
  client TEXT DEFAULT 'Internal',
  category TEXT,
  recurring BOOLEAN DEFAULT FALSE,
  recurrence TEXT,
  next_due DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── SERVICES ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS services (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  category TEXT,
  rate NUMERIC DEFAULT 0,
  unit TEXT DEFAULT 'project',
  qty INTEGER DEFAULT 1,
  description TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── CALENDAR EVENTS ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS calendar_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  session_name TEXT NOT NULL,
  session_type TEXT DEFAULT 'Video call',
  timezone TEXT DEFAULT 'Asia/Singapore',
  duration TEXT,
  event_date DATE NOT NULL,
  color TEXT DEFAULT '#f59e0b',
  notes TEXT,
  email_client BOOLEAN DEFAULT FALSE,
  event_category TEXT DEFAULT 'Meeting',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── NOTIFICATIONS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  read BOOLEAN DEFAULT FALSE,
  color TEXT DEFAULT '#f59e0b',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── LEAD FORMS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS lead_forms (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  fields JSONB DEFAULT '[]',
  active BOOLEAN DEFAULT TRUE,
  auto_create_project BOOLEAN DEFAULT TRUE,
  auto_create_contact BOOLEAN DEFAULT TRUE,
  send_notification BOOLEAN DEFAULT TRUE,
  auto_followup BOOLEAN DEFAULT FALSE,
  followup_email TEXT,
  submissions_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── LEAD SUBMISSIONS ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS lead_submissions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  form_id UUID REFERENCES lead_forms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── PORTFOLIO ITEMS ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS portfolio_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  category TEXT,
  description TEXT,
  image_url TEXT,
  video_url TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── AUTOPILOT PLAYBOOKS ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS playbooks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  trigger TEXT NOT NULL,
  actions JSONB DEFAULT '[]',
  active BOOLEAN DEFAULT FALSE,
  runs_this_month INTEGER DEFAULT 0,
  last_run TIMESTAMPTZ,
  color TEXT DEFAULT '#f59e0b',
  is_custom BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── AUTOMATION LOGS ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS automation_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  playbook_id UUID REFERENCES playbooks(id) ON DELETE SET NULL,
  playbook_name TEXT,
  action TEXT NOT NULL,
  detail TEXT,
  color TEXT DEFAULT '#f59e0b',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY — Each user only sees their own data
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE playbooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_logs ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Users manage own profile" ON profiles FOR ALL USING (auth.uid() = id);

-- Projects
CREATE POLICY "Users manage own projects" ON projects FOR ALL USING (auth.uid() = user_id);

-- Contacts
CREATE POLICY "Users manage own contacts" ON contacts FOR ALL USING (auth.uid() = user_id);

-- Clients
CREATE POLICY "Users manage own clients" ON clients FOR ALL USING (auth.uid() = user_id);

-- Invoices
CREATE POLICY "Users manage own invoices" ON invoices FOR ALL USING (auth.uid() = user_id);

-- Expenses
CREATE POLICY "Users manage own expenses" ON expenses FOR ALL USING (auth.uid() = user_id);

-- Services
CREATE POLICY "Users manage own services" ON services FOR ALL USING (auth.uid() = user_id);

-- Calendar events
CREATE POLICY "Users manage own calendar" ON calendar_events FOR ALL USING (auth.uid() = user_id);

-- Notifications
CREATE POLICY "Users manage own notifications" ON notifications FOR ALL USING (auth.uid() = user_id);

-- Lead forms
CREATE POLICY "Users manage own lead forms" ON lead_forms FOR ALL USING (auth.uid() = user_id);

-- Lead submissions
CREATE POLICY "Users manage own submissions" ON lead_submissions FOR ALL USING (auth.uid() = user_id);

-- Portfolio
CREATE POLICY "Users manage own portfolio" ON portfolio_items FOR ALL USING (auth.uid() = user_id);

-- Playbooks
CREATE POLICY "Users manage own playbooks" ON playbooks FOR ALL USING (auth.uid() = user_id);

-- Automation logs
CREATE POLICY "Users manage own logs" ON automation_logs FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- Automatically creates a profile row when a user signs up
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- UPDATED_AT TRIGGER — Auto-updates the updated_at column
-- ============================================================

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_projects BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_updated_at_contacts BEFORE UPDATE ON contacts FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_updated_at_clients BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_updated_at_invoices BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_updated_at_expenses BEFORE UPDATE ON expenses FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_updated_at_services BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_updated_at_calendar BEFORE UPDATE ON calendar_events FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_updated_at_lead_forms BEFORE UPDATE ON lead_forms FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_updated_at_portfolio BEFORE UPDATE ON portfolio_items FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_updated_at_playbooks BEFORE UPDATE ON playbooks FOR EACH ROW EXECUTE FUNCTION set_updated_at();
