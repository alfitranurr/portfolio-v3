/**
 * Gemini API paid-tier (Standard) prices in USD per 1M tokens.
 * Source: https://ai.google.dev/gemini-api/docs/pricing (page updated 2026-10-19).
 * Output prices include thinking tokens, which /api/chat logs as completion tokens.
 * `cached` is the implicit-cache read price: Gemini automatically reuses the repeated
 * system prompt prefix, and those prompt tokens bill at ~10% of the input price.
 * Google Search grounding is free for the first 1,500 grounded prompts/day on 2.5
 * models, so it is not part of the estimate.
 */
export interface ModelPricing {
  label: string
  input: number
  cached: number
  output: number
}

export const GEMINI_PRICING: Record<string, ModelPricing> = {
  'gemini-2.5-flash': { label: 'Gemini 2.5 Flash', input: 0.3, cached: 0.03, output: 2.5 },
  'gemini-2.5-pro': { label: 'Gemini 2.5 Pro', input: 1.25, cached: 0.125, output: 10 }, // prompts <= 200k tokens
  'gemini-2.5-flash-lite': { label: 'Gemini 2.5 Flash-Lite', input: 0.1, cached: 0.01, output: 0.4 },
}

/** Approximate rate used only to show a rough Rupiah figure next to the USD estimate. */
export const USD_TO_IDR = 16_500

/** Pricing for a logged model name; unknown/legacy names fall back by family. */
export function getModelPricing(modelName: string): ModelPricing {
  const exact = GEMINI_PRICING[modelName]
  if (exact) return exact
  if (modelName.includes('pro')) return GEMINI_PRICING['gemini-2.5-pro']
  if (modelName.includes('lite')) return GEMINI_PRICING['gemini-2.5-flash-lite']
  return GEMINI_PRICING['gemini-2.5-flash']
}

export function estimateChatCost(log: {
  model_name: string
  prompt_tokens: number
  completion_tokens: number
  cached_tokens?: number | null
}): number {
  const rate = getModelPricing(log.model_name)
  const prompt = log.prompt_tokens || 0
  // cached_tokens is a subset of prompt_tokens (older logs have none recorded)
  const cached = Math.min(log.cached_tokens || 0, prompt)
  return ((prompt - cached) * rate.input + cached * rate.cached + (log.completion_tokens || 0) * rate.output) / 1_000_000
}

export function formatUSD(value: number): string {
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 })}`
}

export function formatIDR(usd: number): string {
  return `Rp ${Math.round(usd * USD_TO_IDR).toLocaleString('id-ID')}`
}
