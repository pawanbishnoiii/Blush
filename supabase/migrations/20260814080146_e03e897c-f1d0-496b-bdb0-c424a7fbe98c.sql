ALTER TABLE public.banners
  ADD COLUMN IF NOT EXISTS media_type text NOT NULL DEFAULT 'image',
  ADD COLUMN IF NOT EXISTS video_url text;

ALTER TABLE public.banners DROP CONSTRAINT IF EXISTS banners_media_type_check;
ALTER TABLE public.banners ADD CONSTRAINT banners_media_type_check CHECK (media_type IN ('image','video'));