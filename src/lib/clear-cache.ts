/**
 * Utilitário para limpar cache e dados do sistema
 * Útil após limpeza do banco de dados
 */

import { clearAllCache, invalidateAllQueries } from './react-query'

/**
 * Limpa todo o cache do sistema:
 * - Cache do React Query
 * - LocalStorage (dados mock salvos)
 * - SessionStorage
 */
export function clearSystemCache() {
  // Limpar cache do React Query
  clearAllCache()
  invalidateAllQueries()

  // Limpar localStorage (dados mock salvos)
  const keysToRemove: string[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key) {
      // Remover apenas chaves relacionadas ao app
      if (
        key.startsWith('mock-') ||
        key.startsWith('kb-') ||
        key.startsWith('replay-') ||
        key.includes('client') ||
        key.includes('ticket') ||
        key.includes('technician')
      ) {
        keysToRemove.push(key)
      }
    }
  }
  keysToRemove.forEach((key) => localStorage.removeItem(key))

  // Limpar sessionStorage
  sessionStorage.clear()

  if (import.meta.env.DEV) {
    console.log('[clearSystemCache] Cache limpo completamente')
    console.log(`[clearSystemCache] ${keysToRemove.length} chaves removidas do localStorage`)
  }

  return {
    cleared: true,
    localStorageKeysRemoved: keysToRemove.length,
  }
}

/**
 * Função global para ser chamada no console do navegador
 * Uso: window.clearReplayCache()
 */
if (typeof window !== 'undefined') {
  ;(window as any).clearReplayCache = clearSystemCache
  if (import.meta.env.DEV) {
    console.log(
      '%c[Replay Suporte] Função de limpeza disponível: window.clearReplayCache()',
      'color: #10b981; font-weight: bold',
    )
  }
}

