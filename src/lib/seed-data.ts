import { supabase } from '@/lib/supabase'
import {
  MOCK_CLIENTS,
  MOCK_TICKETS,
  MOCK_KNOWLEDGE_CATEGORIES,
  MOCK_KNOWLEDGE_ARTICLES,
  MOCK_USER,
} from '@/lib/mock-data'

export const seedDatabase = async () => {
  if (!supabase) throw new Error('Supabase não configurado')

  // Seed Clients
  const { error: clientsError } = await supabase.from('clients').upsert(
    MOCK_CLIENTS.map((c) => ({
      id: c.id,
      name: c.name,
      city: c.city,
      phone: c.phone,
      arenaCode: c.arenaCode,
      arenaName: c.arenaName,
      active: c.active,
      contractType: c.contractType,
      technicalManager: c.technicalManager,
    })),
  )
  if (clientsError) console.error('Clients seed error:', clientsError)

  // Seed Tickets
  const { error: ticketsError } = await supabase.from('tickets').upsert(
    MOCK_TICKETS.map((t) => ({
      id: t.id,
      clientId: t.clientId,
      clientName: t.clientName,
      title: t.title,
      description: t.description,
      status: t.status,
      responsibleId: t.responsibleId,
      responsibleName: t.responsibleName,
      created_at: t.createdAt,
      updated_at: t.updatedAt,
      customData: t.customData,
      attachments: t.attachments,
    })),
  )
  if (ticketsError) console.error('Tickets seed error:', ticketsError)

  // Seed Categories
  const { error: catsError } = await supabase
    .from('knowledge_categories')
    .upsert(MOCK_KNOWLEDGE_CATEGORIES)
  if (catsError) console.error('Categories seed error:', catsError)

  // Seed Articles
  const { error: artsError } = await supabase.from('knowledge_articles').upsert(
    MOCK_KNOWLEDGE_ARTICLES.map((a) => ({
      id: a.id,
      title: a.title,
      excerpt: a.excerpt,
      content: a.content,
      categoryId: a.categoryId,
      categoryName: a.categoryName,
      author: a.author,
      tags: a.tags,
      views: a.views,
      helpfulCount: a.helpfulCount,
      isPublic: a.isPublic,
      created_at: a.createdAt,
      updated_at: a.updatedAt,
    })),
  )
  if (artsError) console.error('Articles seed error:', artsError)

  return true
}

export const SCHEMA_SQL = `
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

-- ROW LEVEL SECURITY (RBAC)
alter table profiles enable row level security;
alter table clients enable row level security;
alter table tickets enable row level security;
alter table system_logs enable row level security;
alter table performance_metrics enable row level security;
alter table knowledge_categories enable row level security;
alter table knowledge_articles enable row level security;
alter table kb_subscriptions enable row level security;

-- Policies for Profiles
create policy "Public profiles are viewable by everyone" on profiles for select using (true);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- Policies for Clients
create policy "Admins and Coordinators can manage clients" on clients for all using (
  exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'coordinator'))
);
create policy "Agents can view clients" on clients for select using (
  exists (select 1 from profiles where id = auth.uid() and role = 'agent')
);

-- Policies for Tickets
create policy "Admins have full access to tickets" on tickets for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
create policy "Coordinators and Agents can view and edit tickets" on tickets for all using (
  exists (select 1 from profiles where id = auth.uid() and role in ('coordinator', 'agent'))
);
create policy "Clients can view own tickets" on tickets for select using (
  exists (select 1 from profiles where id = auth.uid() and role = 'client')
  -- Note: In a real scenario, we would link client users to client records via another table
);

-- Policies for Logs & Metrics
create policy "Only Admins can view logs" on system_logs for select using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
create policy "System can insert logs" on system_logs for insert with check (true);

create policy "Only Admins can view metrics" on performance_metrics for select using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- TRIGGER para atualizar updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language 'plpgsql';

create trigger update_profiles_updated_at before update on profiles for each row execute procedure update_updated_at_column();
create trigger update_tickets_updated_at before update on tickets for each row execute procedure update_updated_at_column();
create trigger update_knowledge_articles_updated_at before update on knowledge_articles for each row execute procedure update_updated_at_column();

-- TRIGGER para criar profile ao criar user
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url, role)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url', 'agent');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
`
