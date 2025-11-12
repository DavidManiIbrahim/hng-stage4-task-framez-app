-- Framez Supabase schema
-- Run this in the Supabase SQL editor (Project > SQL).

-- Extensions
create extension if not exists pgcrypto;

-- Posts table: stores public feed entries
create table if not exists public.posts (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  author_name text not null,
  content_text text,
  image_url text,
  created_at timestamptz not null default now()
);

-- Index for fast chronological feed (newest first)
create index if not exists posts_created_at_idx on public.posts (created_at desc);

-- Row Level Security
alter table public.posts enable row level security;

-- Public can read posts (feed is public)
create policy if not exists "Public read posts"
  on public.posts for select
  using (true);

-- Only authenticated users can insert, and only for themselves
create policy if not exists "Authenticated insert posts"
  on public.posts for insert
  with check (auth.uid() = user_id);

-- Owners can update their posts
create policy if not exists "Owner update posts"
  on public.posts for update
  using (auth.uid() = user_id);

-- Owners can delete their posts
create policy if not exists "Owner delete posts"
  on public.posts for delete
  using (auth.uid() = user_id);

-- Enable Supabase Realtime for the posts table
alter publication supabase_realtime add table public.posts;

-- Create a public Storage bucket for post images
insert into storage.buckets (id, name, public)
values ('posts', 'posts', true)
on conflict (id) do nothing;

-- Create a public Storage bucket for avatars
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;
