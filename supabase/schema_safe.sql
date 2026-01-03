-- ============================================
-- What They Meant - Supabase Database Schema
-- SAFE VERSION - Won't error if tables exist
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. USER PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================
-- 2. USER SETTINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  text_size TEXT DEFAULT 'Medium' CHECK (text_size IN ('Small', 'Medium', 'Large', 'ExtraLarge')),
  font_family TEXT DEFAULT 'Lexend' CHECK (font_family IN ('Lexend', 'OpenDyslexic', 'Comic', 'Sans')),
  voice_name TEXT DEFAULT '',
  analysis_detail TEXT DEFAULT 'STANDARD' CHECK (analysis_detail IN ('DETAILED', 'STANDARD', 'CONCISE')),
  audio_output BOOLEAN DEFAULT FALSE,
  audio_speed NUMERIC DEFAULT 1.0,
  default_mode TEXT DEFAULT 'WORK' CHECK (default_mode IN ('WORK', 'SCHOOL', 'SOCIAL')),
  dark_mode BOOLEAN DEFAULT FALSE,
  tier TEXT DEFAULT 'FREE' CHECK (tier IN ('FREE', 'PLUS', 'PRO')),
  analyses_count INTEGER DEFAULT 0,
  subscription_expiry TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first
DROP POLICY IF EXISTS "Users can view own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can update own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can insert own settings" ON public.user_settings;

-- RLS Policies for user_settings
CREATE POLICY "Users can view own settings"
  ON public.user_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
  ON public.user_settings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings"
  ON public.user_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 3. ANALYSES TABLE (History)
-- ============================================
CREATE TABLE IF NOT EXISTS public.analyses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  timestamp BIGINT NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('WORK', 'SCHOOL', 'SOCIAL')),
  original_message TEXT NOT NULL,
  what_was_said TEXT NOT NULL,
  what_is_expected JSONB DEFAULT '[]',
  what_is_optional JSONB DEFAULT '[]',
  what_carries_risk JSONB DEFAULT '[]',
  what_is_not_asking_for JSONB DEFAULT '[]',
  hidden_rules JSONB DEFAULT '[]',
  clarity_score JSONB NOT NULL,
  responses JSONB DEFAULT '[]',
  confidence_level TEXT CHECK (confidence_level IN ('High', 'Medium', 'Low')),
  has_image BOOLEAN DEFAULT FALSE,
  has_audio BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS analyses_user_id_idx ON public.analyses(user_id);
CREATE INDEX IF NOT EXISTS analyses_timestamp_idx ON public.analyses(timestamp DESC);

-- Enable Row Level Security
ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first
DROP POLICY IF EXISTS "Users can view own analyses" ON public.analyses;
DROP POLICY IF EXISTS "Users can insert own analyses" ON public.analyses;
DROP POLICY IF EXISTS "Users can update own analyses" ON public.analyses;
DROP POLICY IF EXISTS "Users can delete own analyses" ON public.analyses;

-- RLS Policies for analyses
CREATE POLICY "Users can view own analyses"
  ON public.analyses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analyses"
  ON public.analyses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own analyses"
  ON public.analyses FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own analyses"
  ON public.analyses FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 4. CUSTOM LIBRARY ITEMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.custom_library_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('url', 'file')),
  url TEXT,
  file_data TEXT,
  file_name TEXT,
  mime_type TEXT,
  icon TEXT NOT NULL CHECK (icon IN ('Brain', 'Briefcase', 'Book', 'MessageCircle')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index if it doesn't exist
CREATE INDEX IF NOT EXISTS custom_library_items_user_id_idx ON public.custom_library_items(user_id);

-- Enable Row Level Security
ALTER TABLE public.custom_library_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first
DROP POLICY IF EXISTS "Users can view own library items" ON public.custom_library_items;
DROP POLICY IF EXISTS "Users can insert own library items" ON public.custom_library_items;
DROP POLICY IF EXISTS "Users can update own library items" ON public.custom_library_items;
DROP POLICY IF EXISTS "Users can delete own library items" ON public.custom_library_items;

-- RLS Policies for custom_library_items
CREATE POLICY "Users can view own library items"
  ON public.custom_library_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own library items"
  ON public.custom_library_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own library items"
  ON public.custom_library_items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own library items"
  ON public.custom_library_items FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 5. QUEUED ANALYSES TABLE (Offline Queue)
-- ============================================
CREATE TABLE IF NOT EXISTS public.queued_analyses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  message TEXT NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('WORK', 'SCHOOL', 'SOCIAL')),
  detail_level TEXT NOT NULL CHECK (detail_level IN ('DETAILED', 'STANDARD', 'CONCISE')),
  image_data TEXT,
  image_mime_type TEXT,
  audio_data TEXT,
  audio_mime_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index if it doesn't exist
CREATE INDEX IF NOT EXISTS queued_analyses_user_id_idx ON public.queued_analyses(user_id);

-- Enable Row Level Security
ALTER TABLE public.queued_analyses ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first
DROP POLICY IF EXISTS "Users can view own queued analyses" ON public.queued_analyses;
DROP POLICY IF EXISTS "Users can insert own queued analyses" ON public.queued_analyses;
DROP POLICY IF EXISTS "Users can delete own queued analyses" ON public.queued_analyses;

-- RLS Policies for queued_analyses
CREATE POLICY "Users can view own queued analyses"
  ON public.queued_analyses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own queued analyses"
  ON public.queued_analyses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own queued analyses"
  ON public.queued_analyses FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 6. TRIGGERS FOR UPDATED_AT TIMESTAMPS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers first
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS update_user_settings_updated_at ON public.user_settings;

-- Trigger for profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for user_settings
CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 7. FUNCTION TO CREATE PROFILE ON SIGNUP
-- ============================================

-- Function to automatically create profile and settings on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Trigger to call function on new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 8. HELPFUL VIEWS (Optional)
-- ============================================

-- Drop existing view first
DROP VIEW IF EXISTS user_dashboard;

-- View to get user data with settings
CREATE VIEW user_dashboard AS
SELECT
  p.id,
  p.email,
  p.full_name,
  p.avatar_url,
  s.tier,
  s.analyses_count,
  s.subscription_expiry,
  s.dark_mode,
  COUNT(DISTINCT a.id) as total_analyses,
  COUNT(DISTINCT c.id) as custom_library_count
FROM profiles p
LEFT JOIN user_settings s ON p.id = s.user_id
LEFT JOIN analyses a ON p.id = a.user_id
LEFT JOIN custom_library_items c ON p.id = c.user_id
GROUP BY p.id, p.email, p.full_name, p.avatar_url, s.tier, s.analyses_count, s.subscription_expiry, s.dark_mode;

-- ============================================
-- SETUP COMPLETE
-- ============================================
