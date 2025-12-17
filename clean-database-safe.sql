-- ============================================
-- SCRIPT DE LIMPEZA SEGURA DO BANCO DE DADOS
-- ============================================
-- 
-- ⚠️ ATENÇÃO: Este script remove dados, mas MANTÉM usuários!
-- 
-- O que será removido:
-- - Todos os dados das tabelas (clientes, tickets, técnicos, etc.)
-- - Logs do sistema
-- - Métricas de performance
-- - Artigos e categorias da base de conhecimento
-- - Assinaturas
-- 
-- O que será MANTIDO:
-- - Estrutura das tabelas
-- - Triggers
-- - Row Level Security (RLS) policies
-- - Funções
-- - Usuários do auth.users
-- - Profiles dos usuários (roles e configurações preservados)
-- 
-- ⚠️ IMPORTANTE:
-- 1. Faça BACKUP do banco antes de executar este script!
-- 2. Execute apenas no ambiente de PRODUÇÃO se tiver certeza
-- 3. Este script é IRREVERSÍVEL (a menos que tenha backup)
-- 
-- ============================================

BEGIN;

-- ============================================
-- LIMPEZA DE DADOS (ordem respeitando foreign keys)
-- ============================================

-- 1. Assinaturas da Base de Conhecimento
DELETE FROM kb_subscriptions;

-- 2. Artigos da Base de Conhecimento
DELETE FROM knowledge_articles;

-- 3. Categorias da Base de Conhecimento
DELETE FROM knowledge_categories;

-- 4. Tickets
DELETE FROM tickets;

-- 5. Clientes
DELETE FROM clients;

-- 6. Técnicos Parceiros
DELETE FROM technicians;

-- 7. Métricas de Performance
DELETE FROM performance_metrics;

-- 8. Logs do Sistema
DELETE FROM system_logs;

-- 9. Profiles - MANTIDOS (usuários preservados)
-- Se quiser remover também os profiles, descomente:
-- DELETE FROM profiles;

COMMIT;

-- ============================================
-- VERIFICAÇÃO
-- ============================================

-- Verificar se as tabelas estão vazias (exceto profiles)
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

