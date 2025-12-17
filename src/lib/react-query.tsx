import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'

// Configuração do React Query para cache e sincronização
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache por 5 minutos
      staleTime: 5 * 60 * 1000,
      // Cache por 10 minutos
      gcTime: 10 * 60 * 1000,
      // Retry com exponential backoff
      retry: (failureCount, error) => {
        // Não retry para erros 4xx (client errors)
        if (error && typeof error === 'object' && 'status' in error) {
          const status = error.status as number
          if (status >= 400 && status < 500) {
            return false
          }
        }
        // Não retry para erros de conexão HTTP2 (problemas temporários do servidor)
        const errorMessage = error?.message || String(error || '')
        if (errorMessage.includes('ERR_HTTP2_PROTOCOL_ERROR') ||
            errorMessage.includes('ERR_CONNECTION_CLOSED') ||
            errorMessage.includes('ERR_CONNECTION_RESET') ||
            errorMessage.includes('Failed to fetch')) {
          // Retry apenas 1 vez para erros de rede
          return failureCount < 1
        }
        // Retry até 2 vezes para outros erros (reduzido para evitar muitas tentativas)
        return failureCount < 2
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000), // Max 10s (reduzido)
      // Refetch quando a janela ganha foco
      refetchOnWindowFocus: true,
      // Refetch quando reconecta
      refetchOnReconnect: true,
      // Tratamento de erro global
      onError: (error) => {
        if (import.meta.env.DEV) {
          console.error('[React Query Error]', error)
        }
      },
    },
    mutations: {
      // Retry para mutations também
      retry: 1,
      retryDelay: 1000,
      onError: (error) => {
        if (import.meta.env.DEV) {
          console.error('[React Query Mutation Error]', error)
        }
      },
    },
  },
})

export function ReactQueryProvider({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

/**
 * Limpa todo o cache do React Query
 * Útil após limpeza do banco de dados ou quando precisa forçar refresh completo
 */
export function clearAllCache() {
  queryClient.clear()
  if (import.meta.env.DEV) {
    console.log('[React Query] Cache limpo completamente')
  }
}

/**
 * Invalida todas as queries ativas
 * Útil para forçar refetch de todos os dados
 */
export function invalidateAllQueries() {
  queryClient.invalidateQueries()
  if (import.meta.env.DEV) {
    console.log('[React Query] Todas as queries invalidadas')
  }
}

export { queryClient }

