
DROP FUNCTION IF EXISTS public.increment_link_clicks(text);

GRANT UPDATE (clicks) ON public.short_links TO anon, authenticated;

CREATE POLICY "Anyone can increment clicks"
  ON public.short_links FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);
