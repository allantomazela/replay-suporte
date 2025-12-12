import { supabase } from '@/lib/supabase'
import {
  MOCK_CLIENTS,
  MOCK_TICKETS,
  MOCK_KNOWLEDGE_CATEGORIES,
  MOCK_KNOWLEDGE_ARTICLES,
} from '@/lib/mock-data'

export const seedDatabase = async () => {
  if (!supabase) throw new Error('Supabase não configurado')

  const results = {
    clients: { success: 0, error: 0 },
    tickets: { success: 0, error: 0 },
    categories: { success: 0, error: 0 },
    articles: { success: 0, error: 0 },
  }

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
-- Execute este SQL no Editor do Supabase para criar as tabelas

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
  "userId" text,
  type text,
  "targetId" text,
  "targetName" text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Políticas de Segurança (RLS) - Permite tudo para teste/demo
alter table clients enable row level security;
alter table tickets enable row level security;
alter table knowledge_categories enable row level security;
alter table knowledge_articles enable row level security;
alter table kb_subscriptions enable row level security;

create policy "Allow all clients" on clients for all using (true);
create policy "Allow all tickets" on tickets for all using (true);
create policy "Allow all categories" on knowledge_categories for all using (true);
create policy "Allow all articles" on knowledge_articles for all using (true);
create policy "Allow all subs" on kb_subscriptions for all using (true);
`
