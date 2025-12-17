import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

/**
 * Hook para fazer prefetch de dados baseado na rota atual
 * Melhora a experiência do usuário ao pré-carregar dados antes de navegar
 * Inclui proteção contra múltiplas requisições simultâneas
 */
export function usePrefetch() {
  const queryClient = useQueryClient()
  const location = useLocation()
  const prefetchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastPathRef = useRef<string>('')

  useEffect(() => {
    if (!supabase) return

    // Evitar prefetch duplicado na mesma rota
    if (lastPathRef.current === location.pathname) return
    lastPathRef.current = location.pathname

    // Limpar timeout anterior se existir
    if (prefetchTimeoutRef.current) {
      clearTimeout(prefetchTimeoutRef.current)
    }

    // Debounce do prefetch para evitar muitas requisições
    prefetchTimeoutRef.current = setTimeout(() => {
      const path = location.pathname

      // Verificar se já existe dados em cache antes de fazer prefetch
      const checkAndPrefetch = async (
        queryKey: string[],
        queryFn: () => Promise<any>,
        staleTime: number
      ) => {
        const queryState = queryClient.getQueryState(queryKey)
        // Só fazer prefetch se não houver dados ou se estiverem stale
        if (!queryState?.data || queryState.isStale) {
          try {
            await queryClient.prefetchQuery({
              queryKey,
              queryFn,
              staleTime,
            })
          } catch (error) {
            // Silenciosamente ignorar erros de prefetch (não crítico)
            if (import.meta.env.DEV) {
              console.debug('[Prefetch] Error (non-critical):', error)
            }
          }
        }
      }

      // Prefetch de clientes se estiver em rotas relacionadas
      if (path.includes('/clients') || path === '/dashboard') {
        checkAndPrefetch(
          ['clients'],
          async () => {
            const { data, error } = await supabase
              .from('clients')
              .select('id, name, city, phone, arenaCode, arenaName, active, contractType, technicalManager, created_at')
              .order('created_at', { ascending: false })
              .limit(50)
            
            if (error) throw error
            return data || []
          },
          5 * 60 * 1000
        )
      }

      // Prefetch de tickets se estiver em rotas relacionadas
      if (path.includes('/tickets') || path === '/dashboard') {
        checkAndPrefetch(
          ['tickets'],
          async () => {
            const { data, error } = await supabase
              .from('tickets')
              .select('id, clientId, clientName, title, description, status, responsibleId, responsibleName, solutionSteps, attachments, customData, created_at, updated_at')
              .order('created_at', { ascending: false })
              .limit(50)
            
            if (error) throw error
            return (data || []).map((t) => ({
              ...t,
              createdAt: t.created_at,
              updatedAt: t.updated_at,
            }))
          },
          5 * 60 * 1000
        )
      }

      // Prefetch de knowledge base se estiver em rotas relacionadas
      if (path.includes('/knowledge-base')) {
        checkAndPrefetch(
          ['knowledge_categories'],
          async () => {
            const { data, error } = await supabase
              .from('knowledge_categories')
              .select('id, name, description')
              .order('name', { ascending: true })
            
            if (error) throw error
            return data || []
          },
          10 * 60 * 1000
        )

        checkAndPrefetch(
          ['knowledge_articles'],
          async () => {
            const { data, error } = await supabase
              .from('knowledge_articles')
              .select('id, title, excerpt, content, categoryId, categoryName, author, tags, views, helpfulCount, isPublic, created_at, updated_at')
              .order('updated_at', { ascending: false })
              .limit(20)
            
            if (error) throw error
            return (data || []).map((a) => ({
              ...a,
              createdAt: a.created_at,
              updatedAt: a.updated_at,
            }))
          },
          5 * 60 * 1000
        )
      }
    }, 300) // Debounce de 300ms

    return () => {
      if (prefetchTimeoutRef.current) {
        clearTimeout(prefetchTimeoutRef.current)
      }
    }
  }, [location.pathname, queryClient])
}

/**
 * Hook para prefetch ao passar o mouse sobre links
 * Usado para pré-carregar dados quando o usuário está prestes a navegar
 * Inclui proteção contra múltiplas requisições e verificação de cache
 */
export function useLinkPrefetch() {
  const queryClient = useQueryClient()
  const prefetchTimeoutRef = useRef<{ clients?: NodeJS.Timeout; tickets?: NodeJS.Timeout }>({})

  const prefetchClients = () => {
    if (!supabase) return

    // Throttle: evitar múltiplas requisições em pouco tempo
    if (prefetchTimeoutRef.current.clients) return

    // Verificar se já existe dados em cache
    const queryState = queryClient.getQueryState(['clients'])
    if (queryState?.data && !queryState.isStale) return

    prefetchTimeoutRef.current.clients = setTimeout(() => {
      queryClient.prefetchQuery({
        queryKey: ['clients'],
        queryFn: async () => {
          const { data, error } = await supabase
            .from('clients')
            .select('id, name, city, phone, arenaCode, arenaName, active, contractType, technicalManager, created_at')
            .order('created_at', { ascending: false })
            .limit(50)
          
          if (error) throw error
          return data || []
        },
      }).catch(() => {
        // Silenciosamente ignorar erros de prefetch
      })
      prefetchTimeoutRef.current.clients = undefined
    }, 200) // Throttle de 200ms
  }

  const prefetchTickets = () => {
    if (!supabase) return

    // Throttle: evitar múltiplas requisições em pouco tempo
    if (prefetchTimeoutRef.current.tickets) return

    // Verificar se já existe dados em cache
    const queryState = queryClient.getQueryState(['tickets'])
    if (queryState?.data && !queryState.isStale) return

    prefetchTimeoutRef.current.tickets = setTimeout(() => {
      queryClient.prefetchQuery({
        queryKey: ['tickets'],
        queryFn: async () => {
          const { data, error } = await supabase
            .from('tickets')
            .select('id, clientId, clientName, title, description, status, responsibleId, responsibleName, solutionSteps, attachments, customData, created_at, updated_at')
            .order('created_at', { ascending: false })
            .limit(50)
          
          if (error) throw error
          return (data || []).map((t) => ({
            ...t,
            createdAt: t.created_at,
            updatedAt: t.updated_at,
          }))
        },
      }).catch(() => {
        // Silenciosamente ignorar erros de prefetch
      })
      prefetchTimeoutRef.current.tickets = undefined
    }, 200) // Throttle de 200ms
  }

  return { prefetchClients, prefetchTickets }
}

