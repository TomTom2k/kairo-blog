create table posts (
  id uuid primary key default gen_random_uuid(),

  title text not null,
  slug text unique not null,

  excerpt text,                 -- mô tả ngắn / SEO description
  content text not null,
  thumbnail text,               -- link ảnh đại diện (optional)

  published boolean default false,
  published_at timestamp,       -- thời gian public thật sự

  created_at timestamp default now(),
  updated_at timestamp default now()
);

create table tags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique
);

create table post_tags (
  post_id uuid references posts(id) on delete cascade,
  tag_id uuid references tags(id) on delete cascade,
  primary key (post_id, tag_id)
);

create table comments (
  id uuid primary key default gen_random_uuid(),

  post_id uuid references posts(id) on delete cascade,

  author_name text,         -- null = ẩn danh
  content text not null,

  created_at timestamp default now(),
  approved boolean default true
);


-- function to update the updated_at column for the posts table
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trigger_posts_updated_at
before update on posts
for each row
execute function update_updated_at();


-- indexes 
create index idx_posts_published on posts(published);
create index idx_posts_slug on posts(slug);
create index idx_comments_post_id on comments(post_id);

