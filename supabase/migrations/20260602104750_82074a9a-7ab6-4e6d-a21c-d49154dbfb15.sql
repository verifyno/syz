
CREATE TABLE public.short_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  target_url text NOT NULL,
  clicks integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX short_links_slug_idx ON public.short_links(slug);

GRANT SELECT, INSERT ON public.short_links TO anon, authenticated;
GRANT ALL ON public.short_links TO service_role;

ALTER TABLE public.short_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read short links"
  ON public.short_links FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can create short links"
  ON public.short_links FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    length(slug) BETWEEN 1 AND 64
    AND slug ~ '^[a-zA-Z0-9_-]+$'
    AND length(target_url) BETWEEN 1 AND 2048
    AND target_url ~* '^https?://'
  );

CREATE OR REPLACE FUNCTION public.increment_link_clicks(p_slug text)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.short_links SET clicks = clicks + 1 WHERE slug = p_slug;
$$;

GRANT EXECUTE ON FUNCTION public.increment_link_clicks(text) TO anon, authenticated;
