-- Xerox and printing orders. Apply after migrations 001-005.
create table if not exists public.xerox_pricing (
  id boolean primary key default true check (id),
  a4_bw numeric(10,2) not null default 2,
  a4_colour numeric(10,2) not null default 10,
  a3_bw numeric(10,2) not null default 5,
  a3_colour numeric(10,2) not null default 20,
  single_side numeric(10,2) not null default 0,
  double_side numeric(10,2) not null default 0,
  spiral_binding numeric(10,2) not null default 30,
  updated_at timestamptz not null default now()
);
insert into public.xerox_pricing(id) values (true) on conflict (id) do nothing;

create table if not exists public.xerox_orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null,
  customer_id uuid references auth.users(id) on delete set null,
  customer_name text not null,
  phone text not null,
  email text not null,
  document_path text not null,
  file_name text not null,
  pages integer not null check (pages > 0),
  copies integer not null check (copies > 0),
  print_type text not null check (print_type in ('B&W','Colour')),
  paper_size text not null check (paper_size in ('A4','A3')),
  print_side text not null check (print_side in ('Single Side','Double Side')),
  binding text not null default 'None' check (binding in ('None','Spiral Binding')),
  notes text not null default '',
  estimated_price numeric(10,2) not null check (estimated_price >= 0),
  final_price numeric(10,2),
  status text not null default 'Pending' check (status in ('Pending','Accepted','Printing','Ready','Completed','Cancelled')),
  admin_notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.xerox_orders enable row level security;
alter table public.xerox_pricing enable row level security;
drop policy if exists "Public can read xerox pricing" on public.xerox_pricing;
create policy "Public can read xerox pricing" on public.xerox_pricing for select using (true);
drop policy if exists "Customers read own xerox orders" on public.xerox_orders;
create policy "Customers read own xerox orders" on public.xerox_orders for select to authenticated using (auth.uid() = customer_id);
insert into storage.buckets(id,name,public) values ('xerox-documents','xerox-documents',false) on conflict (id) do nothing;
