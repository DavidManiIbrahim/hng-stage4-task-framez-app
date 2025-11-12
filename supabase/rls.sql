-- Framez RLS policies
-- Run this in the Supabase SQL editor.

-- Enable RLS on posts
alter table public.posts enable row level security;

-- Reset existing policies for a clean state
drop policy if exists "Public read posts" on public.posts;
drop policy if exists "Authenticated insert posts" on public.posts;
drop policy if exists "Owner update posts" on public.posts;
drop policy if exists "Owner delete posts" on public.posts;

-- Public can read posts (feed is public)
create policy "Public read posts"
  on public.posts for select
  using (true);

-- Only authenticated users can insert their own posts
create policy "Authenticated insert posts"
  on public.posts for insert
  with check (auth.uid() = user_id);

-- Owners can update their posts
create policy "Owner update posts"
  on public.posts for update
  using (auth.uid() = user_id);

-- Owners can delete their posts
create policy "Owner delete posts"
  on public.posts for delete
  using (auth.uid() = user_id);

-- Storage bucket RLS for 'posts'
-- storage.objects has RLS enabled by default; define policies for bucket access
drop policy if exists "Public read posts bucket" on storage.objects;
drop policy if exists "Authenticated upload posts bucket" on storage.objects;
drop policy if exists "Owner update posts bucket" on storage.objects;
drop policy if exists "Owner delete posts bucket" on storage.objects;

-- Public read access limited to the 'posts' bucket
create policy "Public read posts bucket"
  on storage.objects for select
  using (bucket_id = 'posts');

-- Authenticated users can upload to 'posts' bucket
create policy "Authenticated upload posts bucket"
  on storage.objects for insert
  with check (
    bucket_id = 'posts'
    and auth.uid() is not null
    and left(name, length(auth.uid()::text) + 1) = auth.uid()::text || '/'
  );

-- Owners can update their own objects in 'posts' bucket
create policy "Owner update posts bucket"
  on storage.objects for update
  using (
    bucket_id = 'posts'
    and owner = auth.uid()
    and left(name, length(auth.uid()::text) + 1) = auth.uid()::text || '/'
  );

-- Storage bucket RLS for 'avatars'
drop policy if exists "Public read avatars bucket" on storage.objects;
drop policy if exists "Authenticated upload avatars bucket" on storage.objects;
drop policy if exists "Owner update avatars bucket" on storage.objects;
drop policy if exists "Owner delete avatars bucket" on storage.objects;

-- Public read access limited to the 'avatars' bucket
create policy "Public read avatars bucket"
  on storage.objects for select
  using (bucket_id = 'avatars');

-- Authenticated users can upload to 'avatars' bucket, only within their own UID path
create policy "Authenticated upload avatars bucket"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and auth.uid() is not null
    and left(name, length(auth.uid()::text) + 1) = auth.uid()::text || '/'
  );

-- Owners can update their own avatar objects within their UID path
create policy "Owner update avatars bucket"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and owner = auth.uid()
    and left(name, length(auth.uid()::text) + 1) = auth.uid()::text || '/'
  );

-- Owners can delete their own avatar objects within their UID path
create policy "Owner delete avatars bucket"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and owner = auth.uid()
    and left(name, length(auth.uid()::text) + 1) = auth.uid()::text || '/'
  );

-- Owners can delete their own objects in 'posts' bucket
create policy "Owner delete posts bucket"
  on storage.objects for delete
  using (
    bucket_id = 'posts'
    and owner = auth.uid()
    and left(name, length(auth.uid()::text) + 1) = auth.uid()::text || '/'
  );

