
-- Sessions: one row per anonymous browser session
CREATE TABLE public.artist_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL UNIQUE,
  first_seen TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen TIMESTAMPTZ NOT NULL DEFAULT now(),
  view_count INTEGER NOT NULL DEFAULT 0,
  click_count INTEGER NOT NULL DEFAULT 0,
  hover_count INTEGER NOT NULL DEFAULT 0,
  user_agent TEXT,
  referrer TEXT
);

CREATE INDEX idx_artist_sessions_last_seen ON public.artist_sessions(last_seen DESC);

-- Views: append-only
CREATE TABLE public.artist_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID NOT NULL REFERENCES public.artists(id) ON DELETE CASCADE,
  session_id TEXT,
  source TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_artist_views_artist_created ON public.artist_views(artist_id, created_at DESC);
CREATE INDEX idx_artist_views_created ON public.artist_views(created_at DESC);

-- Clicks: append-only
CREATE TABLE public.artist_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID NOT NULL REFERENCES public.artists(id) ON DELETE CASCADE,
  session_id TEXT,
  link_type TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_artist_clicks_artist_created ON public.artist_clicks(artist_id, created_at DESC);
CREATE INDEX idx_artist_clicks_created ON public.artist_clicks(created_at DESC);

-- Enable RLS
ALTER TABLE public.artist_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artist_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artist_clicks ENABLE ROW LEVEL SECURITY;

-- Public can INSERT tracking events
CREATE POLICY "public insert sessions" ON public.artist_sessions
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "public update sessions" ON public.artist_sessions
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "public insert views" ON public.artist_views
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "public insert clicks" ON public.artist_clicks
  FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Admins can read all analytics
CREATE POLICY "admins read sessions" ON public.artist_sessions
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "admins read views" ON public.artist_views
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "admins read clicks" ON public.artist_clicks
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete (cleanup)
CREATE POLICY "admins delete sessions" ON public.artist_sessions
  FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "admins delete views" ON public.artist_views
  FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "admins delete clicks" ON public.artist_clicks
  FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
