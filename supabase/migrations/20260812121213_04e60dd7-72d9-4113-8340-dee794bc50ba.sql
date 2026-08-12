CREATE TABLE public.review_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id uuid NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (review_id, user_id)
);

GRANT SELECT, INSERT, DELETE ON public.review_votes TO authenticated;
GRANT ALL ON public.review_votes TO service_role;

ALTER TABLE public.review_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "review_votes_own_read" ON public.review_votes
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "review_votes_own_insert" ON public.review_votes
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "review_votes_own_delete" ON public.review_votes
  FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE POLICY "review_votes_admin_read" ON public.review_votes
  FOR SELECT TO authenticated USING (public.is_admin());

CREATE OR REPLACE FUNCTION public.refresh_review_helpful()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  rid uuid := coalesce(new.review_id, old.review_id);
BEGIN
  UPDATE public.reviews
  SET helpful_count = (SELECT count(*) FROM public.review_votes WHERE review_id = rid)
  WHERE id = rid;
  RETURN NULL;
END;
$$;

CREATE TRIGGER review_votes_refresh
AFTER INSERT OR DELETE ON public.review_votes
FOR EACH ROW EXECUTE FUNCTION public.refresh_review_helpful();

ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tracking_events;