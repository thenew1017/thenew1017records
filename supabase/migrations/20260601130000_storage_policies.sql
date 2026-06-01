-- Create storage buckets if they do not exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('artist-photos', 'artist-photos', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('artist-portfolios', 'artist-portfolios', true)
ON CONFLICT (id) DO NOTHING;

-- Drop old policies to avoid duplicate conflict errors
DROP POLICY IF EXISTS "public read artist photos" ON storage.objects;
DROP POLICY IF EXISTS "public read artist portfolios" ON storage.objects;
DROP POLICY IF EXISTS "public upload artist photos" ON storage.objects;
DROP POLICY IF EXISTS "public upload artist portfolios" ON storage.objects;
DROP POLICY IF EXISTS "public delete artist photos" ON storage.objects;
DROP POLICY IF EXISTS "public delete artist portfolios" ON storage.objects;

-- 1. Allow public select (read) access to artist-photos and artist-portfolios buckets
CREATE POLICY "public read artist photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'artist-photos');

CREATE POLICY "public read artist portfolios" ON storage.objects
  FOR SELECT USING (bucket_id = 'artist-portfolios');

-- 2. Allow public insert (upload) access to artist-photos and artist-portfolios buckets
CREATE POLICY "public upload artist photos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'artist-photos');

CREATE POLICY "public upload artist portfolios" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'artist-portfolios');

-- 3. Allow public delete access to artist-photos and artist-portfolios buckets
-- (This is required for admin deletes when using public keys in local dev mode)
CREATE POLICY "public delete artist photos" ON storage.objects
  FOR DELETE USING (bucket_id = 'artist-photos');

CREATE POLICY "public delete artist portfolios" ON storage.objects
  FOR DELETE USING (bucket_id = 'artist-portfolios');
