-- Create Founder Spotlight table
CREATE TABLE IF NOT EXISTS public.founder_spotlight (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  founder_name TEXT NOT NULL DEFAULT 'Gucci Mane',
  founder_title TEXT NOT NULL DEFAULT 'Founder & A&R Chief',
  founder_badge TEXT NOT NULL DEFAULT '1017 FOUNDER // A&R CHIEF',
  founder_description TEXT NOT NULL DEFAULT 'Gucci Mane is the visionary architect of modern trap music. By establishing 1017 Records, he built an elite talent incubator that pioneered soundwaves and launched global careers. With deep instinctual expertise, he continues to identify, sign, and launch independent artists onto the world stage, making the 1017 Records network the ultimate launchpad.',
  stat_1_label TEXT NOT NULL DEFAULT 'Signed Alumni',
  stat_1_value TEXT NOT NULL DEFAULT '12+',
  stat_2_label TEXT NOT NULL DEFAULT 'Streams Built',
  stat_2_value TEXT NOT NULL DEFAULT '5B+',
  stat_3_label TEXT NOT NULL DEFAULT 'Careers Run',
  stat_3_value TEXT NOT NULL DEFAULT 'PLATINUM',
  founder_image_url TEXT DEFAULT 'https://vveslmalxlprmlfcdjae.supabase.co/storage/v1/object/public/media/founder/spotlight-1780301297380.jpg',
  founder_image_alt TEXT NOT NULL DEFAULT 'Gucci Mane Founder Showcase',
  is_visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.founder_spotlight ENABLE ROW LEVEL SECURITY;

-- Drop old policies to avoid duplicate conflicts
DROP POLICY IF EXISTS "public read founder spotlight" ON public.founder_spotlight;
DROP POLICY IF EXISTS "admins manage founder spotlight" ON public.founder_spotlight;

-- Create RLS Policies
CREATE POLICY "public read founder spotlight" ON public.founder_spotlight FOR SELECT USING (true);
CREATE POLICY "admins manage founder spotlight" ON public.founder_spotlight FOR ALL USING (true) WITH CHECK (true);

-- Insert default row if not exists
INSERT INTO public.founder_spotlight (id, founder_name, founder_title, founder_badge, founder_description, stat_1_label, stat_1_value, stat_2_label, stat_2_value, stat_3_label, stat_3_value, founder_image_url, founder_image_alt, is_visible)
VALUES (
  'd18d4d9b-d805-4c07-b0b2-0be724c9657b',
  'Gucci Mane',
  'Gucci Mane',
  '1017 FOUNDER // A&R CHIEF',
  'Gucci Mane is the visionary architect of modern trap music. By establishing 1017 Records, he built an elite talent incubator that pioneered soundwaves and launched global careers. With deep instinctual expertise, he continues to identify, sign, and launch independent artists onto the world stage, making the 1017 Records network the ultimate launchpad.',
  'Signed Alumni',
  '12+',
  'Streams Built',
  '5B+',
  'Careers Run',
  'PLATINUM',
  'https://vveslmalxlprmlfcdjae.supabase.co/storage/v1/object/public/media/founder/spotlight-1780301297380.jpg',
  'Gucci Mane Founder Showcase',
  true
)
ON CONFLICT (id) DO NOTHING;

-- Force PostgREST to reload its schema cache instantly
NOTIFY pgrst, 'reload schema';
