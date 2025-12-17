-- ============================================
-- SCRIPT DE LIMPEZA COMPLETA DO BANCO DE DADOS
-- ============================================
-- 
-- ⚠️ ATENÇÃO: Este script remove TODOS os dados do banco!
-- 
-- O que será removido:
-- - Todos os dados das tabelas (clientes, tickets, técnicos, etc.)
-- - Logs do sistema
-- - Métricas de performance
-- - Artigos e categorias da base de conhecimento
-- - Assinaturas
-- - Profiles (usuários precisarão se recadastrar)
-- 
-- O que será MANTIDO:
-- - Estrutura das tabelas
-- - Triggers
-- - Row Level Security (RLS) policies
-- - Funções
-- - Usuários do auth.users (não serão deletados)
-- 
-- ⚠️ IMPORTANTE:
-- 1. Faça BACKUP do banco antes de executar este script!
-- 2. Execute apenas no ambiente de PRODUÇÃO se tiver certeza
-- 3. Este script é IRREVERSÍVEL (a menos que tenha backup)
-- 
-- ============================================

BEGIN;

-- Desabilitar temporariamente triggers para melhor performance
SET session_replication_role = 'replica';

-- ============================================
-- LIMPEZA DE DADOS (ordem respeitando foreign keys)
-- ============================================

-- 1. Assinaturas da Base de Conhecimento
TRUNCATE TABLE kb_subscriptions CASCADE;

-- 2. Artigos da Base de Conhecimento
TRUNCATE TABLE knowledge_articles CASCADE;

-- 3. Categorias da Base de Conhecimento
TRUNCATE TABLE knowledge_categories CASCADE;

-- 4. Tickets
TRUNCATE TABLE tickets CASCADE;

-- 5. Clientes
TRUNCATE TABLE clients CASCADE;

-- 6. Técnicos Parceiros
TRUNCATE TABLE technicians CASCADE;

-- 7. Métricas de Performance
TRUNCATE TABLE performance_metrics CASCADE;

-- 8. Logs do Sistema
TRUNCATE TABLE system_logs CASCADE;

-- 9. Profiles (usuários precisarão se recadastrar)
TRUNCATE TABLE profiles CASCADE;

-- Reabilitar triggers
SET session_replication_role = 'origin';

COMMIT;

-- ============================================
-- VERIFICAÇÃO
-- ============================================

-- Verificar se as tabelas estão vazias
SELECT 
  'clients' as tabela, COUNT(*) as registros FROM clients
UNION ALL
SELECT 'tickets', COUNT(*) FROM tickets
UNION ALL
SELECT 'technicians', COUNT(*) FROM technicians
UNION ALL
SELECT 'knowledge_articles', COUNT(*) FROM knowledge_articles
UNION ALL
SELECT 'knowledge_categories', COUNT(*) FROM knowledge_categories
UNION ALL
SELECT 'kb_subscriptions', COUNT(*) FROM kb_subscriptions
UNION ALL
SELECT 'system_logs', COUNT(*) FROM system_logs
UNION ALL
SELECT 'performance_metrics', COUNT(*) FROM performance_metrics
UNION ALL
SELECT 'profiles', COUNT(*) FROM profiles;

