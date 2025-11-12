-- Framez schema derived from app code usage
-- Run in Supabase SQL editor. Creates the posts table used by the app,
-- enables Realtime, adds RLS policies, and ensures the public storage bucket.

-- Table: public.posts
create table if not exists public.posts (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  author_name text not null,
  content_text text,
  image_url text,
  created_at timestamptz not null default now()
);

-- Index for chronological feed (newest first)
create index if not exists posts_created_at_idx on public.posts (created_at desc);

-- Enable Supabase Realtime for posts
alter publication supabase_realtime add table public.posts;

-- RLS policies
alter table public.posts enable row level security;
drop policy if exists "Public read posts" on public.posts;
drop policy if exists "Authenticated insert posts" on public.posts;
drop policy if exists "Owner update posts" on public.posts;
drop policy if exists "Owner delete posts" on public.posts;

create policy "Public read posts"
  on public.posts for select
  using (true);

create policy "Authenticated insert posts"
  on public.posts for insert
  with check (auth.uid() = user_id);

create policy "Owner update posts"
  on public.posts for update
  using (auth.uid() = user_id);

create policy "Owner delete posts"
  on public.posts for delete
  using (auth.uid() = user_id);

-- Storage: public bucket for images
insert into storage.buckets (id, name, public)
values ('posts', 'posts', true)
on conflict (id) do nothing;

-- Storage: public bucket for avatars
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Storage RLS for objects in 'posts' bucket
drop policy if exists "Public read posts bucket" on storage.objects;
drop policy if exists "Authenticated upload posts bucket" on storage.objects;
drop policy if exists "Owner update posts bucket" on storage.objects;
drop policy if exists "Owner delete posts bucket" on storage.objects;

create policy "Public read posts bucket"
  on storage.objects for select
  using (bucket_id = 'posts');

create policy "Authenticated upload posts bucket"
  on storage.objects for insert
  with check (bucket_id = 'posts' and auth.uid() is not null);

create policy "Owner update posts bucket"
  on storage.objects for update
  using (bucket_id = 'posts' and owner = auth.uid());

create policy "Owner delete posts bucket"
  on storage.objects for delete
  using (bucket_id = 'posts' and owner = auth.uid());

-- Storage RLS for objects in 'avatars' bucket
drop policy if exists "Public read avatars bucket" on storage.objects;
drop policy if exists "Authenticated upload avatars bucket" on storage.objects;
drop policy if exists "Owner update avatars bucket" on storage.objects;
drop policy if exists "Owner delete avatars bucket" on storage.objects;

create policy "Public read avatars bucket"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Authenticated upload avatars bucket"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.uid() is not null);

create policy "Owner update avatars bucket"
  on storage.objects for update
  using (bucket_id = 'avatars' and owner = auth.uid());

create policy "Owner delete avatars bucket"
  on storage.objects for delete
  using (bucket_id = 'avatars' and owner = auth.uid());
