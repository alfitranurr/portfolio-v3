-- ====================================================
-- DATABASE INITIALIZATION SQL FOR DATA SCIENCE PORTFOLIO
-- Paste this script into your Supabase SQL Editor and run it.
-- ====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Define Custom Enum Types
CREATE TYPE project_category AS ENUM ('data', 'non-data');
CREATE TYPE certificate_category AS ENUM ('competition', 'seminar_workshop', 'license_certification', 'committee_organization');

-- 1. Profiles Table (For Home / Hero Data)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  headline VARCHAR(255) NOT NULL DEFAULT 'Data Scientist',
  about_me TEXT,
  avatar_url TEXT,
  resume_url TEXT,
  instagram_url TEXT DEFAULT 'https://www.instagram.com/rmdhani_ii',
  linkedin_url TEXT DEFAULT 'https://www.linkedin.com/in/al-fitra-nur-ramadhani/',
  github_url TEXT DEFAULT 'https://github.com/alfitranurr',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Projects Table
CREATE TABLE public.projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  content TEXT, -- Rich Markdown content for write-ups
  category project_category NOT NULL DEFAULT 'data',
  sub_category VARCHAR(100) NOT NULL, -- e.g., 'Data Visualization', 'Web Development'
  cover_image TEXT,
  github_url TEXT,
  demo_url TEXT,
  notebook_url TEXT, -- Link to Jupyter, Colab, or Kaggle
  embed_code TEXT, -- Iframe code for Tableau/Plotly
  is_featured BOOLEAN DEFAULT FALSE,
  pinned_order INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Experiences Table
CREATE TABLE public.experiences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  role VARCHAR(255) NOT NULL,
  company VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  start_date DATE NOT NULL,
  end_date DATE, -- NULL represents "Present"
  description TEXT[] NOT NULL DEFAULT '{}', -- Array of responsibilities/bullet points
  is_current BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. Education Table
CREATE TABLE public.education (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  institution VARCHAR(255) NOT NULL,
  degree VARCHAR(255) NOT NULL,
  field_of_study VARCHAR(255),
  location VARCHAR(255),
  start_date DATE NOT NULL,
  end_date DATE, -- NULL represents "Present" or ongoing
  gpa VARCHAR(50),
  description TEXT,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. Certificates Table
CREATE TABLE public.certificates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  issuer VARCHAR(255) NOT NULL,
  issue_date DATE NOT NULL,
  credential_url TEXT,
  credential_id VARCHAR(100),
  category certificate_category NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 6. Messages Table (for Contact Form)
CREATE TABLE public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  subject VARCHAR(255),
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.education ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Public read access to portfolio data
CREATE POLICY "Allow public select on profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Allow public select on projects" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Allow public select on experiences" ON public.experiences FOR SELECT USING (true);
CREATE POLICY "Allow public select on education" ON public.education FOR SELECT USING (true);
CREATE POLICY "Allow public select on certificates" ON public.certificates FOR SELECT USING (true);

-- Authenticated write access for admin (all tables except messages)
CREATE POLICY "Allow admin write on profiles" ON public.profiles FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow admin write on projects" ON public.projects FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow admin write on experiences" ON public.experiences FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow admin write on education" ON public.education FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow admin write on certificates" ON public.certificates FOR ALL USING (auth.role() = 'authenticated');

-- Messages access: anyone can insert, only admin can select/modify
CREATE POLICY "Allow public insert on messages" ON public.messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow admin handle messages" ON public.messages FOR ALL USING (auth.role() = 'authenticated');

-- First-signup database lock trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- If there is already at least one user in public.profiles, reject sign up
  IF (SELECT COUNT(*) FROM public.profiles) > 0 THEN
    RAISE EXCEPTION 'Registration is closed. Only one admin account is allowed.';
  END IF;

  INSERT INTO public.profiles (id, name, headline, about_me)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', 'Al Fitra Nur Ramadhani'),
    COALESCE(new.raw_user_meta_data->>'headline', 'Data Enthusiast'),
    'Welcome to my portfolio! Update this in your admin panel.'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ====================================================
-- 7. STORAGE SETUP & RLS POLICIES FOR PORTFOLIO-ASSETS
-- ====================================================

-- Create the bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('portfolio-assets', 'portfolio-assets', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Policy 1: Allow public read access to the portfolio-assets bucket
CREATE POLICY "Allow public read access to portfolio-assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'portfolio-assets');

-- Policy 2: Allow authenticated users (admin) to upload files
CREATE POLICY "Allow authenticated upload to portfolio-assets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'portfolio-assets');

-- Policy 3: Allow authenticated users (admin) to update files
CREATE POLICY "Allow authenticated update to portfolio-assets"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'portfolio-assets')
WITH CHECK (bucket_id = 'portfolio-assets');

-- Policy 4: Allow authenticated users (admin) to delete files
CREATE POLICY "Allow authenticated delete from portfolio-assets"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'portfolio-assets');

-- MIGRATION: RUN THIS IF TABLE ALREADY EXISTS
-- ALTER TABLE public.education ADD COLUMN logo_url TEXT;
-- ALTER TABLE public.projects ADD COLUMN slide_url TEXT;

-- ====================================================
-- 8. Skills Table (For Interactive Tech Stack)
-- ====================================================
CREATE TABLE public.skills (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  category VARCHAR(100) NOT NULL, -- e.g., 'Language', 'Database', 'BI / Viz', 'ML / AI', 'Framework', 'Backend', 'DevOps', 'Tool'
  level INT NOT NULL DEFAULT 50, -- Proficiency level (0-100)
  "desc" TEXT,
  svg_path TEXT, -- Stored SVG path for the logo (automatic or custom)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public select on skills" ON public.skills FOR SELECT USING (true);
CREATE POLICY "Allow admin write on skills" ON public.skills FOR ALL USING (auth.role() = 'authenticated');


-- ====================================================
-- 9. Page Views Table (For Visitor Analytics)
-- ====================================================
CREATE TABLE IF NOT EXISTS public.page_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  visitor_id UUID NOT NULL,
  page_path VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

-- Policies
-- Anyone can log a page view
CREATE POLICY "Allow public insert on page_views" ON public.page_views FOR INSERT WITH CHECK (true);
-- Only authenticated admins can fetch page views
CREATE POLICY "Allow admin select on page_views" ON public.page_views FOR SELECT USING (auth.role() = 'authenticated');


