-- Framez minimal Supabase setup
-- Run this in Supabase SQL editor.

-- Create posts table
create table if not exists public.posts (
  id bigint generated always as identity primary key,
  user_id uuid not null,
  author_name text not null,
  content_text text,
  image_url text,
  created_at timestamptz not null default now()
);

-- Index for chronological feed
create index if not exists posts_created_at_idx on public.posts (created_at desc);

-- Enable realtime for posts
alter publication supabase_realtime add table public.posts;

-- Create public storage bucket for images
insert into storage.buckets (id, name, public)
values ('posts', 'posts', true)
on conflict (id) do nothing;

-- Create public storage bucket for avatars
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;
