-- ====================================================
-- Migration: ai_chat_logs.cached_tokens
-- Date: 2026-10-22
--
-- Why: Gemini automatically serves the repeated system prompt from its implicit
-- cache; those prompt tokens bill at ~10% of the input rate. Recording them lets
-- the admin AI panel estimate cost accurately (measured: up to ~6x overestimate
-- without it).
-- Until applied, /api/chat keeps logging without this column (see logAIChat).
--
-- How to apply: Supabase Dashboard -> SQL Editor -> paste this file -> Run.
-- Safe to re-run (idempotent).
-- ====================================================

ALTER TABLE public.ai_chat_logs ADD COLUMN IF NOT EXISTS cached_tokens INT DEFAULT 0;

NOTIFY pgrst, 'reload schema';
