-- Create and secure the 'avatars' storage bucket for Framez
-- Run this in your Supabase project's SQL editor.

-- 1) Create a public storage bucket named 'avatars'
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- 2) Storage RLS policies on storage.objects scoped to the 'avatars' bucket
-- Drop existing policies if they exist to avoid duplicates
drop policy if exists "Public read avatars bucket" on storage.objects;
drop policy if exists "Authenticated upload avatars bucket" on storage.objects;
drop policy if exists "Owner update avatars bucket" on storage.objects;
drop policy if exists "Owner delete avatars bucket" on storage.objects;

-- Allow anyone to read objects from the 'avatars' bucket
create policy "Public read avatars bucket"
on storage.objects for select
using (bucket_id = 'avatars');

-- Allow authenticated users to upload only into their own UID-prefixed folder
-- The storage API sets owner = auth.uid() automatically on upload
create policy "Authenticated upload avatars bucket"
on storage.objects for insert
with check (
  bucket_id = 'avatars'
  and auth.uid() is not null
  and name like auth.uid()::text || '/%'
);

-- Allow owners to update their own objects in the 'avatars' bucket
create policy "Owner update avatars bucket"
on storage.objects for update
using (
  bucket_id = 'avatars' and owner = auth.uid()
);

-- Allow owners to delete their own objects in the 'avatars' bucket
create policy "Owner delete avatars bucket"
on storage.objects for delete
using (
  bucket_id = 'avatars' and owner = auth.uid()
);

-- Notes:
-- - The app expects `EXPO_PUBLIC_AVATARS_BUCKET=avatars`.
-- - Upload paths should be `auth.uid()/avatar_<timestamp>.<ext>` as implemented in the app.
-- - Public read is required because the app uses public URLs to display avatars.
