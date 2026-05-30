
DROP POLICY IF EXISTS "acceptances_public_insert" ON public.proposal_acceptances;
CREATE POLICY "acceptances_public_insert" ON public.proposal_acceptances FOR INSERT TO anon, authenticated
  WITH CHECK (proposal_id IN (SELECT id FROM public.proposals));

DROP POLICY IF EXISTS "orders_public_insert" ON public.materials_orders;
CREATE POLICY "orders_public_insert" ON public.materials_orders FOR INSERT TO anon, authenticated
  WITH CHECK (proposal_id IS NULL OR proposal_id IN (SELECT id FROM public.proposals));

DROP POLICY IF EXISTS "views_public_insert" ON public.proposal_views;
CREATE POLICY "views_public_insert" ON public.proposal_views FOR INSERT TO anon, authenticated
  WITH CHECK (proposal_id IN (SELECT id FROM public.proposals));
