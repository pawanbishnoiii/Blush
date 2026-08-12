CREATE POLICY "Admins upload banner images" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'banners' AND public.is_admin());

CREATE POLICY "Admins update banner images" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'banners' AND public.is_admin())
  WITH CHECK (bucket_id = 'banners' AND public.is_admin());

CREATE POLICY "Admins delete banner images" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'banners' AND public.is_admin());

CREATE POLICY "Banner images are readable" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'banners');