-- Create Artist Applications table safely if not exists
CREATE TABLE IF NOT EXISTS public.artist_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  artist_name TEXT NOT NULL,
  spotify_link TEXT,
  campaign_details TEXT,
  status TEXT NOT NULL DEFAULT 'Pending',
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.artist_applications ENABLE ROW LEVEL SECURITY;

-- Drop old policies to avoid duplicate conflicts
DROP POLICY IF EXISTS "public insert applications" ON public.artist_applications;
DROP POLICY IF EXISTS "admins manage applications" ON public.artist_applications;

-- Create RLS Policies
CREATE POLICY "public insert applications" ON public.artist_applications FOR INSERT WITH CHECK (true);
CREATE POLICY "admins manage applications" ON public.artist_applications FOR ALL USING (true) WITH CHECK (true);

-- Force PostgREST to reload its schema cache instantly
NOTIFY pgrst, 'reload schema';
