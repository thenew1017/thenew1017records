-- Create public.media_gallery table referencing public.artists
CREATE TABLE IF NOT EXISTS public.media_gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID NOT NULL REFERENCES public.artists(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  credit TEXT,
  category TEXT DEFAULT 'Press Photo', -- Press Photo / Performance / Studio Session / Behind The Scenes / Lifestyle
  sort_order INT DEFAULT 0,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.media_gallery ENABLE ROW LEVEL SECURITY;

-- Allow public read access to media gallery images
CREATE POLICY "Allow public select on media_gallery" ON public.media_gallery
  FOR SELECT USING (true);

-- Allow authenticated admin users full control on media gallery images
CREATE POLICY "Allow all actions on media_gallery for authenticated admin users" ON public.media_gallery
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
