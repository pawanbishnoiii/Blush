revoke all on function public.touch_updated_at() from anon, authenticated;
revoke all on function public.handle_new_user() from anon, authenticated;
revoke all on function public.reviews_set_verified() from anon, authenticated;
revoke all on function public.refresh_product_rating() from anon, authenticated;
revoke all on function public.has_purchased(uuid, uuid) from anon;
revoke all on function public.has_role(uuid, public.app_role) from anon;
revoke all on function public.is_admin() from anon;

grant execute on function public.has_role(uuid, public.app_role) to authenticated;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.has_purchased(uuid, uuid) to authenticated;