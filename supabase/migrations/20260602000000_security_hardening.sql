-- Create Security Audit Logs Table
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on activity_logs
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Allow only admins to read logs
DROP POLICY IF EXISTS "admins view logs" ON public.activity_logs;
CREATE POLICY "admins view logs" ON public.activity_logs
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Harden artist_applications policies
DROP POLICY IF EXISTS "admins manage applications" ON public.artist_applications;
CREATE POLICY "admins manage applications" ON public.artist_applications
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Harden storage policies
-- Drop old delete policies that allowed anonymous deletes
DROP POLICY IF EXISTS "public delete artist photos" ON storage.objects;
DROP POLICY IF EXISTS "public delete artist portfolios" ON storage.objects;

-- Create secure delete policies requiring admin role
CREATE POLICY "admins delete artist photos" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'artist-photos' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admins delete artist portfolios" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'artist-portfolios' AND public.has_role(auth.uid(), 'admin'));

-- Drop old upload policies
DROP POLICY IF EXISTS "public upload artist photos" ON storage.objects;
DROP POLICY IF EXISTS "public upload artist portfolios" ON storage.objects;

-- Re-create upload policies with strict file extension validations at database level
CREATE POLICY "public upload artist photos" ON storage.objects
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    bucket_id = 'artist-photos' 
    AND (LOWER(storage.extension(name)) IN ('jpg', 'jpeg', 'png', 'webp'))
    AND (metadata->>'mimetype' IN ('image/jpeg', 'image/png', 'image/webp'))
  );

CREATE POLICY "public upload artist portfolios" ON storage.objects
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    bucket_id = 'artist-portfolios' 
    AND (LOWER(storage.extension(name)) = 'pdf')
    AND (metadata->>'mimetype' = 'application/pdf')
  );

-- Force PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
