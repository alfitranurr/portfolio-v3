# Implementation Plan - Data Science Portfolio Website

Build a modern, high-converting, and dynamic Full-Stack Portfolio website using Next.js (App Router), Supabase (Database, Auth, Storage), Tailwind CSS, and Framer Motion. 

This website features a public side for showcasing projects, certifications, experiences, and education, and a secured admin dashboard with full CRUD capabilities.

---

## User Review Required

Please review the proposed tech stack choices and security implementation details:
> [!IMPORTANT]
> **Admin Signup Security (First-Come Lock)**: We will implement a PostgreSQL trigger on `auth.users` insert. It checks if a record already exists in the `public.profiles` table. If it does, registration is blocked. This allows you to sign up your admin account first, after which signup is completely locked down.
>
> **Themes & styling**: Glassmorphism is styled using Tailwind CSS classes (`backdrop-blur-md bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10`) coupled with custom HSL values in `tailwind.config.ts`.
>
> **Asset Storage**: We will define a `portfolio-assets` bucket in Supabase Storage with public read access and write permissions limited to authenticated users. This is used for your profile avatar image and Resume (CV) PDF.

---

## Open Questions

There are no major open questions, as we aligned on:
- TypeScript + npm
- shadcn/ui as primitive components
- Dynamic storage in Supabase for the Resume/Avatar
- First-come registration for security
- Markdown support for project write-ups
- Saving contact form entries in Supabase

---

## Proposed Changes

### Database Setup & Schema

We will initialize the Supabase database with the following SQL schema:

```sql
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
  gpa NUMERIC(3, 2),
  description TEXT,
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

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

---

### Project File Structure (Next.js App Router)

We will initialize and set up the Next.js app in the current workspace. The key directories and files will be:

```
src/
├── app/
│   ├── layout.tsx                 # Base App configuration + theme providers
│   ├── page.tsx                   # HOME Page (Hero + Featured Projects + Tech Stack)
│   ├── education/
│   │   └── page.tsx               # EDUCATION timeline page
│   ├── experience/
│   │   └── page.tsx               # EXPERIENCE timeline page
│   ├── projects/
│   │   ├── page.tsx               # PROJECTS listing page (filter by category and sub_category)
│   │   └── [id]/
│   │       └── page.tsx           # Rich Markdown details for projects (with embeds & notebooks)
│   ├── certificates/
│   │   └── page.tsx               # CERTIFICATES listing page (filter by sub-category)
│   ├── login/
│   │   └── page.tsx               # Login page for Supabase authentication
│   ├── admin/
│   │   ├── layout.tsx             # Protected Admin Shell layout (Sidebar, top nav, guard check)
│   │   ├── page.tsx               # Admin Dashboard (stats, message management)
│   │   ├── profile/
│   │   │   └── page.tsx           # Edit Home Profile (Name, headline, links, Resume, Avatar)
│   │   ├── projects/
│   │   │   └── page.tsx           # CRUD interface for Projects (with Markdown editor)
│   │   ├── education/
│   │   │   └── page.tsx           # CRUD interface for Education
│   │   ├── experience/
│   │   │   └── page.tsx           # CRUD interface for Experience
│   │   └── certificates/
│   │       └── page.tsx           # CRUD interface for Certificates
│   └── globals.css                # Base Tailwind + Custom Glassmorphism styling tokens
├── components/
│   ├── sidebar.tsx                # Public-facing glassmorphism navigation sidebar (collapsible)
│   ├── admin-sidebar.tsx          # Admin panel sidebar (collapsible, sign out)
│   ├── theme-provider.tsx         # Dark & light theme controller
│   ├── theme-toggle.tsx           # Interactive theme switch button
│   └── ui/                        # shadcn/ui components (dialog, button, input, tabs, etc.)
└── lib/
    ├── supabase/
    │   ├── client.ts              # Supabase Client Component initialization
    │   ├── server.ts              # Supabase Server Component client helper (using cookies)
    │   └── middleware.ts          # Authentication middleware to guard '/admin*' paths
    └── utils.ts                   # Formatting & styling helper functions (cn class merger)
```

---

### UI/UX Design System (Gen-Z Glassmorphism)

#### 1. Color Palette Configuration (`src/app/globals.css` / `tailwind.config.ts`)
- **Theme**: Light & Dark modes supported.
- **Dark Theme Backgrounds**: Deep navy and dark blue gradients.
  - Primary Background: `#030712` (zinc-950) transitioning to `#070a13` & `#0f172a` (slate-900).
  - Accent Color: Cyan, teal, or violet glows.
- **Glassmorphism Base Classes**:
  - CSS custom classes combining `backdrop-blur-md`, transparent background borders, and subtle shadow reflections.
  - A responsive layout with a beautiful fixed or floating sidebar depending on screen width.

---

## Verification Plan

### Automated Verification
- **ESLint & TypeScript compilations**: Build checking using `npm run build` to verify typings and import paths.
- **Page checks**: Launching a local development server using `npm run dev` and verifying standard navigation.

### Manual Verification
1. **First-Signup Security**: Test registering the first user via `/login` and confirm that attempts to register a second user fail.
2. **Dynamic Dashboard (CRUD)**: Validate adding, updating, and deleting items (Projects, Certificates, Experiences, Education).
3. **Storage Uploads**: Verify that the profile picture and CV pdf files are correctly uploaded to the Supabase Storage bucket and successfully render/download.
4. **Theme Toggling**: Ensure transition from Dark to Light modes operates smoothly, checking visual readability of glassmorphic layers in both settings.
5. **Contact Form**: Test submitting contact form and ensure it populates in the `messages` table and appears in the admin panel.
