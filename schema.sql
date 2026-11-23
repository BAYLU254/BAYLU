-- BAYLU: pegar completo en Supabase > SQL Editor > Run
create table categories(id uuid primary key default gen_random_uuid(), name text not null unique, slug text not null unique);
create table products(
  id uuid primary key default gen_random_uuid(), slug text not null unique, name text not null,
  description text default '', price numeric not null check (price>=0), old_price numeric,
  images text[] default '{}', category_id uuid references categories(id) on delete set null,
  stock int not null default 0, variants jsonb not null default '[]',
  published boolean not null default false, tags text[] not null default '{}',
  created_at timestamptz not null default now());
create table admins(user_id uuid primary key references auth.users(id) on delete cascade);

create function public.is_admin() returns boolean language sql security definer stable set search_path=public as
$$ select exists(select 1 from public.admins where user_id=auth.uid()) $$;

alter table categories enable row level security;
alter table products enable row level security;
alter table admins enable row level security; -- sin políticas: nadie la lee desde el navegador

create policy "ver categorias" on categories for select using (true);
create policy "admin categorias" on categories for all using (is_admin()) with check (is_admin());
create policy "ver publicados" on products for select using (published or is_admin());
create policy "admin productos" on products for all using (is_admin()) with check (is_admin());

insert into storage.buckets(id,name,public) values('products','products',true) on conflict do nothing;
create policy "ver imagenes" on storage.objects for select using (bucket_id='products');
create policy "admin sube imagenes" on storage.objects for insert with check (bucket_id='products' and is_admin());
create policy "admin edita imagenes" on storage.objects for update using (bucket_id='products' and is_admin());
create policy "admin borra imagenes" on storage.objects for delete using (bucket_id='products' and is_admin());

-- Validación de datos en la base (corré esto UNA vez en SQL Editor si ya ejecutaste schema.sql antes)
alter table products add constraint products_name_len check (char_length(trim(name)) between 2 and 120);
alter table products add constraint products_stock_ok check (stock >= 0);
alter table products add constraint products_old_price_ok check (old_price is null or old_price > price);
alter table products add constraint products_tags_ok check (tags <@ array['viral','nuevo','mas_vendido','oferta','destacado']);
alter table products add constraint products_images_max check (cardinality(images) <= 8);
