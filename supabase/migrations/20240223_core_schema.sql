-- Categorías de transacciones
create table public.categories (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  icon text,
  color text,
  type text check (type in ('income', 'expense', 'both')),
  limit_amount decimal(12,2) default null,
  created_at timestamp with time zone default now()
);

-- Cuentas bancarias/efectivo
create table public.accounts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  balance decimal(12,2) default 0,
  currency text default 'USD',
  created_at timestamp with time zone default now()
);

-- Transacciones
create table public.transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  account_id uuid references public.accounts not null,
  category_id uuid references public.categories,
  amount decimal(12,2) not null,
  type text check (type in ('income', 'expense')),
  description text,
  date timestamp with time zone default now(),
  evidence_url text, -- Link a Supabase Storage
  created_at timestamp with time zone default now()
);

-- Metas de ahorro
create table public.goals (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  target_amount decimal(12,2) not null,
  current_amount decimal(12,2) default 0,
  deadline date,
  color text,
  created_at timestamp with time zone default now()
);

-- Alertas y Notificaciones
create table public.alerts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  message text,
  type text check (type in ('warning', 'info', 'success')),
  is_read boolean default false,
  created_at timestamp with time zone default now()
);

-- Consejos de IA (Audit/History)
create table public.advices (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  content text not null,
  score float, -- Utilidad del consejo
  created_at timestamp with time zone default now()
);

-- Predicciones
create table public.predictions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  target_date date not null,
  predicted_balance decimal(12,2),
  confidence_score float,
  created_at timestamp with time zone default now()
);

-- Habilitar RLS en todas las tablas
alter table public.categories enable row level security;
alter table public.accounts enable row level security;
alter table public.transactions enable row level security;
alter table public.goals enable row level security;
alter table public.alerts enable row level security;
alter table public.advices enable row level security;
alter table public.predictions enable row level security;

-- Políticas genéricas: Solo el dueño puede ver/editar sus datos
create policy "Users can manage their own categories" on public.categories for all using (auth.uid() = user_id);
create policy "Users can manage their own accounts" on public.accounts for all using (auth.uid() = user_id);
create policy "Users can manage their own transactions" on public.transactions for all using (auth.uid() = user_id);
create policy "Users can manage their own goals" on public.goals for all using (auth.uid() = user_id);
create policy "Users can manage their own alerts" on public.alerts for all using (auth.uid() = user_id);
create policy "Users can manage their own advices" on public.advices for all using (auth.uid() = user_id);
create policy "Users can manage their own predictions" on public.predictions for all using (auth.uid() = user_id);
