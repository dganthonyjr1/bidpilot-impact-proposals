
CREATE TABLE public.estimates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  estimate_number text NOT NULL,
  contractor_id uuid,
  status text NOT NULL DEFAULT 'draft',
  client_name text NOT NULL,
  client_phone text,
  client_email text,
  job_address text,
  job_state text,
  trade_type text,
  scope_summary text,
  material_low numeric,
  material_high numeric,
  labor_low numeric,
  labor_high numeric,
  total_low numeric,
  total_high numeric,
  timeline_text text,
  valid_through date,
  source text DEFAULT 'manual',
  raw_input jsonb,
  upgraded_to_proposal_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.estimates TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.estimates TO authenticated;
GRANT ALL ON public.estimates TO service_role;

ALTER TABLE public.estimates ENABLE ROW LEVEL SECURITY;

CREATE POLICY estimates_public_read ON public.estimates FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY estimates_insert_own ON public.estimates FOR INSERT TO authenticated
  WITH CHECK (contractor_id IN (SELECT id FROM contractors WHERE user_id = auth.uid()));
CREATE POLICY estimates_update_own ON public.estimates FOR UPDATE TO authenticated
  USING (contractor_id IN (SELECT id FROM contractors WHERE user_id = auth.uid()));
CREATE POLICY estimates_delete_own ON public.estimates FOR DELETE TO authenticated
  USING (contractor_id IN (SELECT id FROM contractors WHERE user_id = auth.uid()));

CREATE TABLE public.estimate_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  estimate_id uuid NOT NULL,
  ip_address text,
  user_agent text,
  viewed_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.estimate_views TO anon, authenticated;
GRANT ALL ON public.estimate_views TO service_role;

ALTER TABLE public.estimate_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY estimate_views_public_insert ON public.estimate_views FOR INSERT TO anon, authenticated
  WITH CHECK (estimate_id IN (SELECT id FROM estimates));
CREATE POLICY estimate_views_select_own ON public.estimate_views FOR SELECT TO authenticated
  USING (estimate_id IN (SELECT id FROM estimates WHERE contractor_id IN
    (SELECT id FROM contractors WHERE user_id = auth.uid())));
