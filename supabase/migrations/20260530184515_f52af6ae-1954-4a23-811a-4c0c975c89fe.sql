ALTER TABLE public.contractors
  ADD COLUMN IF NOT EXISTS subscription_tier text NOT NULL DEFAULT 'apprentice',
  ADD COLUMN IF NOT EXISTS subscription_status text NOT NULL DEFAULT 'trial',
  ADD COLUMN IF NOT EXISTS billing_email text,
  ADD COLUMN IF NOT EXISTS last_payment_at timestamptz;