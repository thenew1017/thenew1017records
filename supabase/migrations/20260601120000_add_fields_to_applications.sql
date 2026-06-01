-- Add premium media package fields to public.artist_applications table
ALTER TABLE public.artist_applications 
ADD COLUMN IF NOT EXISTS artist_photo_url TEXT,
ADD COLUMN IF NOT EXISTS epk_url TEXT,
ADD COLUMN IF NOT EXISTS submission_status TEXT DEFAULT 'Pending',
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

-- Notify PostgREST to reload its schema cache instantly
NOTIFY pgrst, 'reload schema';
