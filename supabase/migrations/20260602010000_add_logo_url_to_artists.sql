-- Add logo_url column to public.artists table safely if not exists
ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- Notify PostgREST to reload its schema cache instantly
NOTIFY pgrst, 'reload schema';
