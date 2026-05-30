
-- 1. Contractors: license number, public slug, address
ALTER TABLE public.contractors
  ADD COLUMN IF NOT EXISTS license_number text,
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS business_address text;

-- Backfill slug from business_name for existing rows
UPDATE public.contractors
SET slug = regexp_replace(lower(coalesce(business_name, 'contractor')), '[^a-z0-9]+', '-', 'g') || '-' || substr(id::text, 1, 6)
WHERE slug IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS contractors_slug_unique ON public.contractors (slug) WHERE slug IS NOT NULL;

-- 2. Proposals: expiration + photos
ALTER TABLE public.proposals
  ADD COLUMN IF NOT EXISTS expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS photos jsonb NOT NULL DEFAULT '[]'::jsonb;

-- 3. Follow-up tracking table
CREATE TABLE IF NOT EXISTS public.proposal_followups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id uuid NOT NULL REFERENCES public.proposals(id) ON DELETE CASCADE,
  step text NOT NULL CHECK (step IN ('24h','72h','7d')),
  channels text NOT NULL CHECK (channels IN ('email','sms','both')),
  scheduled_at timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','sent','cancelled','failed')),
  sent_at timestamptz,
  error text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS proposal_followups_due_idx
  ON public.proposal_followups (scheduled_at) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS proposal_followups_proposal_idx
  ON public.proposal_followups (proposal_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.proposal_followups TO authenticated;
GRANT ALL ON public.proposal_followups TO service_role;

ALTER TABLE public.proposal_followups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "followups_select_own" ON public.proposal_followups
  FOR SELECT TO authenticated USING (
    proposal_id IN (
      SELECT p.id FROM public.proposals p
      JOIN public.contractors c ON c.id = p.contractor_id
      WHERE c.user_id = auth.uid()
    )
  );

-- 4. Storage bucket for job-site photos (public read so PDFs/proposals can display)
INSERT INTO storage.buckets (id, name, public)
VALUES ('job-photos', 'job-photos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "job_photos_public_read"
  ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'job-photos');

CREATE POLICY "job_photos_authenticated_insert"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'job-photos');

CREATE POLICY "job_photos_authenticated_delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'job-photos' AND owner = auth.uid());
