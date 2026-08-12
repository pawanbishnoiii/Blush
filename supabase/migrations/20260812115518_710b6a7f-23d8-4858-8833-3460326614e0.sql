create policy "review_photos_read" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'review-photos');

create policy "review_photos_own_insert" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'review-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "review_photos_own_update" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'review-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'review-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "review_photos_own_delete" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'review-photos'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or public.is_admin()
    )
  );