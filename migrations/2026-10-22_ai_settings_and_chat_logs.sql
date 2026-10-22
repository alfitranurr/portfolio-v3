-- ====================================================
-- Migration: AI settings + AI chat logs tables
-- Date: 2026-10-22
--
-- Why: these tables are defined in schema.sql (sections 10 & 11) but were never
-- created on the live Supabase project (PostgREST returns PGRST205 for both).
-- Effect until applied: admin AI settings are ignored (chat always uses the
-- defaults in src/lib/ai-service.ts) and token usage logs are silently dropped.
--
-- How to apply: Supabase Dashboard -> SQL Editor -> paste this file -> Run.
-- Safe to re-run (idempotent).
-- ====================================================

-- 1. AI Chat Settings (single row, read by /api/chat, edited from the admin panel)
CREATE TABLE IF NOT EXISTS public.ai_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  model_name VARCHAR(100) NOT NULL DEFAULT 'gemini-2.5-flash',
  search_grounding BOOLEAN NOT NULL DEFAULT TRUE,
  temperature NUMERIC(3,2) NOT NULL DEFAULT 0.7,
  max_history INT NOT NULL DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.ai_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public select on ai_settings" ON public.ai_settings;
DROP POLICY IF EXISTS "Allow admin write on ai_settings" ON public.ai_settings;
CREATE POLICY "Allow public select on ai_settings" ON public.ai_settings FOR SELECT USING (true);
CREATE POLICY "Allow admin write on ai_settings" ON public.ai_settings FOR ALL USING (auth.role() = 'authenticated');

-- Seed the default row (same values as DEFAULT_AI_SETTINGS) only when the table is empty
INSERT INTO public.ai_settings (model_name, search_grounding, temperature, max_history)
SELECT 'gemini-2.5-flash', TRUE, 0.7, 10
WHERE NOT EXISTS (SELECT 1 FROM public.ai_settings);


-- 2. AI Chat Logs (token auditing; id is app-generated "log-<ts>-<rand>", hence VARCHAR)
CREATE TABLE IF NOT EXISTS public.ai_chat_logs (
  id VARCHAR(255) PRIMARY KEY,
  prompt_preview TEXT,
  prompt_tokens INT DEFAULT 0,
  completion_tokens INT DEFAULT 0,
  total_tokens INT DEFAULT 0,
  model_name VARCHAR(100) NOT NULL DEFAULT 'gemini-2.5-flash',
  search_grounding BOOLEAN NOT NULL DEFAULT TRUE,
  user_ip VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Admin dashboard lists logs newest-first
CREATE INDEX IF NOT EXISTS ai_chat_logs_created_at_idx ON public.ai_chat_logs (created_at DESC);

ALTER TABLE public.ai_chat_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public insert on ai_chat_logs" ON public.ai_chat_logs;
DROP POLICY IF EXISTS "Allow admin select on ai_chat_logs" ON public.ai_chat_logs;
DROP POLICY IF EXISTS "Allow admin delete on ai_chat_logs" ON public.ai_chat_logs;
CREATE POLICY "Allow public insert on ai_chat_logs" ON public.ai_chat_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow admin select on ai_chat_logs" ON public.ai_chat_logs FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow admin delete on ai_chat_logs" ON public.ai_chat_logs FOR DELETE USING (auth.role() = 'authenticated');


-- 3. Make PostgREST (the Supabase REST API) see the new tables immediately
NOTIFY pgrst, 'reload schema';
