-- Stripe integration schema updates
-- Created: 2025-08-26

-- 1) Add columns to user_profiles for trial and Stripe linkage
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS draft_picks_used INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS draft_picks_limit INTEGER DEFAULT 3,
  ADD COLUMN IF NOT EXISTS trial_started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;

-- 2) Extend payment_history with Stripe references
ALTER TABLE public.payment_history
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_invoice_id TEXT;

-- 3) Helpful indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_stripe_customer
  ON public.user_profiles(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_user_created
  ON public.payment_history(user_id, created_at);
