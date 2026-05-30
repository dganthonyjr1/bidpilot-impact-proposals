
-- ============ CONTRACTORS ============
CREATE TABLE public.contractors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name text NOT NULL DEFAULT 'My Contracting Co',
  logo_url text,
  primary_color text DEFAULT '#FF6B00',
  phone text,
  email text,
  license_number text,
  trade_type text,
  service_states text[] DEFAULT '{}',
  anthropic_api_key text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contractors TO authenticated;
GRANT SELECT ON public.contractors TO anon;
GRANT ALL ON public.contractors TO service_role;
ALTER TABLE public.contractors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "contractors_select_own" ON public.contractors FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "contractors_public_select" ON public.contractors FOR SELECT TO anon USING (true);
CREATE POLICY "contractors_insert_own" ON public.contractors FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "contractors_update_own" ON public.contractors FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Auto-create contractor record on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.contractors (user_id, email, business_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'business_name', 'My Contracting Co'));
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ MATERIALS CATALOG ============
CREATE TABLE public.materials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  name text NOT NULL,
  description text,
  unit text NOT NULL DEFAULT 'ea',
  sia_price numeric(12,2),
  retail_price numeric(12,2) NOT NULL,
  sia_price_label text,
  restricted_states text[] DEFAULT '{}',
  notes text,
  sort_order int DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.materials TO anon, authenticated;
GRANT ALL ON public.materials TO service_role;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "materials_public_read" ON public.materials FOR SELECT TO anon, authenticated USING (true);

-- ============ PROPOSALS ============
CREATE TABLE public.proposals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contractor_id uuid REFERENCES public.contractors(id) ON DELETE SET NULL,
  proposal_number text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'draft', -- draft, sent, viewed, accepted
  client_name text NOT NULL,
  client_email text,
  client_phone text,
  job_address text,
  job_state text,
  job_description text,
  trade_type text,
  scope_of_work text,
  materials jsonb DEFAULT '[]'::jsonb,
  labor jsonb DEFAULT '[]'::jsonb,
  tiers jsonb DEFAULT '{}'::jsonb, -- { good: {multiplier, label, description}, better: {...}, best: {...} }
  selected_tier text DEFAULT 'better',
  timeline text,
  warranty text,
  payment_terms text DEFAULT '50% deposit, 50% on completion',
  exclusions jsonb DEFAULT '[]'::jsonb,
  tax_rate numeric(5,4) DEFAULT 0.07,
  valid_through date,
  source text DEFAULT 'manual', -- manual, retell, ghl
  raw_input jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.proposals TO authenticated;
GRANT SELECT ON public.proposals TO anon;
GRANT ALL ON public.proposals TO service_role;
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;
-- Public read: anyone with the URL can view (client-facing)
CREATE POLICY "proposals_public_read" ON public.proposals FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "proposals_insert_own" ON public.proposals FOR INSERT TO authenticated
  WITH CHECK (contractor_id IN (SELECT id FROM public.contractors WHERE user_id = auth.uid()));
CREATE POLICY "proposals_update_own" ON public.proposals FOR UPDATE TO authenticated
  USING (contractor_id IN (SELECT id FROM public.contractors WHERE user_id = auth.uid()));
CREATE POLICY "proposals_delete_own" ON public.proposals FOR DELETE TO authenticated
  USING (contractor_id IN (SELECT id FROM public.contractors WHERE user_id = auth.uid()));

CREATE INDEX idx_proposals_contractor ON public.proposals(contractor_id);
CREATE INDEX idx_proposals_number ON public.proposals(proposal_number);

-- ============ ACCEPTANCES ============
CREATE TABLE public.proposal_acceptances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id uuid NOT NULL REFERENCES public.proposals(id) ON DELETE CASCADE,
  signature_name text NOT NULL,
  signature_email text,
  accepted_tier text NOT NULL,
  total_amount numeric(12,2),
  ip_address text,
  accepted_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.proposal_acceptances TO anon, authenticated;
GRANT ALL ON public.proposal_acceptances TO service_role;
ALTER TABLE public.proposal_acceptances ENABLE ROW LEVEL SECURITY;
CREATE POLICY "acceptances_public_insert" ON public.proposal_acceptances FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "acceptances_public_select" ON public.proposal_acceptances FOR SELECT TO anon, authenticated USING (true);

-- ============ MATERIALS ORDERS ============
CREATE TABLE public.materials_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id uuid REFERENCES public.proposals(id) ON DELETE SET NULL,
  contractor_id uuid REFERENCES public.contractors(id) ON DELETE SET NULL,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  total_sia numeric(12,2),
  total_retail numeric(12,2),
  status text NOT NULL DEFAULT 'pending',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.materials_orders TO anon, authenticated;
GRANT SELECT, UPDATE ON public.materials_orders TO authenticated;
GRANT ALL ON public.materials_orders TO service_role;
ALTER TABLE public.materials_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "orders_public_insert" ON public.materials_orders FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "orders_select_own" ON public.materials_orders FOR SELECT TO authenticated
  USING (contractor_id IN (SELECT id FROM public.contractors WHERE user_id = auth.uid()));

-- ============ VIEWS / ANALYTICS ============
CREATE TABLE public.proposal_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id uuid NOT NULL REFERENCES public.proposals(id) ON DELETE CASCADE,
  viewed_at timestamptz NOT NULL DEFAULT now(),
  user_agent text,
  ip_address text
);
GRANT SELECT, INSERT ON public.proposal_views TO anon, authenticated;
GRANT ALL ON public.proposal_views TO service_role;
ALTER TABLE public.proposal_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "views_public_insert" ON public.proposal_views FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "views_select_own_proposals" ON public.proposal_views FOR SELECT TO authenticated
  USING (proposal_id IN (SELECT id FROM public.proposals WHERE contractor_id IN (SELECT id FROM public.contractors WHERE user_id = auth.uid())));
