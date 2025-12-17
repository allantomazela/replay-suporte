-- SCHEMA SQL PARA SUPABASE
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- Copie e cole APENAS o conteúdo abaixo (sem as aspas ou comentários de código)

-- TABELAS PRINCIPAIS
-- Profiles (Extensão da tabela auth.users)
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  avatar_url text,
  role text check (role in ('admin', 'coordinator', 'agent', 'client')) default 'agent',
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Tabela de Clientes
create table if not exists clients (
  id text primary key,
  name text not null,
  city text,
  phone text,
  "arenaCode" text,
  "arenaName" text,
  active boolean default true,
  "contractType" text,
  "technicalManager" text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Tabela de Tickets
create table if not exists tickets (
  id text primary key,
  "clientId" text references clients(id),
  "clientName" text,
  title text,
  description text,
  status text,
  "responsibleId" text,
  "responsibleName" text,
  "solutionSteps" text,
  attachments jsonb default '[]',
  "customData" jsonb default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Tabela de Logs do Sistema (Monitoring)
create table if not exists system_logs (
  id uuid default gen_random_uuid() primary key,
  severity text check (severity in ('info', 'warning', 'error', 'critical')),
  message text,
  source text,
  metadata jsonb default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Tabela de Métricas de Performance
create table if not exists performance_metrics (
  id uuid default gen_random_uuid() primary key,
  name text,
  value numeric,
  unit text,
  status text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Tabela de Categorias da KB
create table if not exists knowledge_categories (
  id text primary key,
  name text not null,
  description text
);

-- Tabela de Artigos da KB
create table if not exists knowledge_articles (
  id text primary key,
  title text not null,
  excerpt text,
  content text,
  "categoryId" text references knowledge_categories(id),
  "categoryName" text,
  author text,
  tags text[],
  views integer default 0,
  "helpfulCount" integer default 0,
  "isPublic" boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Tabela de Assinaturas
create table if not exists kb_subscriptions (
  id text primary key,
  "userId" uuid references auth.users(id),
  type text,
  "targetId" text,
  "targetName" text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Tabela de Técnicos Parceiros
create table if not exists technicians (
  id text primary key,
  name text not null,
  email text not null,
  phone text,
  specialties text[] default '{}',
  active boolean default true,
  service_radius numeric default 0,
  -- Dados pessoais adicionais
  cpf_cnpj text,
  birth_date date,
  -- Endereço
  cep text,
  state text,
  city text,
  neighborhood text,
  address text,
  address_number text,
  complement text,
  -- Dados profissionais
  experience_years integer,
  certifications text,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- ROW LEVEL SECURITY (RBAC)
alter table profiles enable row level security;
alter table clients enable row level security;
alter table tickets enable row level security;
alter table system_logs enable row level security;
alter table performance_metrics enable row level security;
alter table knowledge_categories enable row level security;
alter table knowledge_articles enable row level security;
alter table kb_subscriptions enable row level security;
alter table technicians enable row level security;

-- Policies for Profiles
drop policy if exists "Public profiles are viewable by everyone" on profiles;
create policy "Public profiles are viewable by everyone" on profiles for select using (true);

drop policy if exists "Users can update own profile" on profiles;
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- Policies for Clients
drop policy if exists "Admins and Coordinators can manage clients" on clients;
create policy "Admins and Coordinators can manage clients" on clients for all using (
  exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'coordinator'))
);

drop policy if exists "Agents can view clients" on clients;
create policy "Agents can view clients" on clients for select using (
  exists (select 1 from profiles where id = auth.uid() and role = 'agent')
);

-- Policies for Tickets
drop policy if exists "Admins have full access to tickets" on tickets;
create policy "Admins have full access to tickets" on tickets for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

drop policy if exists "Coordinators and Agents can view and edit tickets" on tickets;
create policy "Coordinators and Agents can view and edit tickets" on tickets for all using (
  exists (select 1 from profiles where id = auth.uid() and role in ('coordinator', 'agent'))
);

drop policy if exists "Clients can view own tickets" on tickets;
create policy "Clients can view own tickets" on tickets for select using (
  exists (select 1 from profiles where id = auth.uid() and role = 'client')
  -- Note: In a real scenario, we would link client users to client records via another table
);

-- Policies for Logs & Metrics
drop policy if exists "Only Admins can view logs" on system_logs;
create policy "Only Admins can view logs" on system_logs for select using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

drop policy if exists "System can insert logs" on system_logs;
create policy "System can insert logs" on system_logs for insert with check (true);

drop policy if exists "Only Admins can view metrics" on performance_metrics;
create policy "Only Admins can view metrics" on performance_metrics for select using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Policies for Technicians
drop policy if exists "Admins and Coordinators can manage technicians" on technicians;
create policy "Admins and Coordinators can manage technicians" on technicians for all using (
  exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'coordinator'))
);

drop policy if exists "Agents can view technicians" on technicians;
create policy "Agents can view technicians" on technicians for select using (
  exists (select 1 from profiles where id = auth.uid() and role = 'agent')
);

-- TRIGGER para atualizar updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language 'plpgsql';

drop trigger if exists update_profiles_updated_at on profiles;
create trigger update_profiles_updated_at before update on profiles for each row execute procedure update_updated_at_column();

drop trigger if exists update_tickets_updated_at on tickets;
create trigger update_tickets_updated_at before update on tickets for each row execute procedure update_updated_at_column();

drop trigger if exists update_knowledge_articles_updated_at on knowledge_articles;
create trigger update_knowledge_articles_updated_at before update on knowledge_articles for each row execute procedure update_updated_at_column();

drop trigger if exists update_technicians_updated_at on technicians;
create trigger update_technicians_updated_at before update on technicians for each row execute procedure update_updated_at_column();

-- Adicionar colunas se não existirem (para bancos já criados)
alter table technicians add column if not exists service_radius numeric default 0;
alter table technicians add column if not exists cpf_cnpj text;
alter table technicians add column if not exists birth_date date;
alter table technicians add column if not exists cep text;
alter table technicians add column if not exists state text;
alter table technicians add column if not exists city text;
alter table technicians add column if not exists neighborhood text;
alter table technicians add column if not exists address text;
alter table technicians add column if not exists address_number text;
alter table technicians add column if not exists complement text;
alter table technicians add column if not exists experience_years integer;
alter table technicians add column if not exists certifications text;
alter table technicians add column if not exists notes text;

-- TRIGGER para criar profile ao criar user
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url, role)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url', 'agent');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

