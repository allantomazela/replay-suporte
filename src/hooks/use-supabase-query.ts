import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

/**
 * Hook para buscar clientes usando React Query
 */
export function useClients() {
  return useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      if (!supabase) return []
      const { data, error } = await supabase
        .from('clients')
        .select('id, name, city, phone, arenaCode, arenaName, active, contractType, technicalManager, created_at')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data || []
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    enabled: !!supabase,
  })
}

/**
 * Hook para buscar tickets usando React Query
 */
export function useTickets() {
  return useQuery({
    queryKey: ['tickets'],
    queryFn: async () => {
      if (!supabase) return []
      const { data, error } = await supabase
        .from('tickets')
        .select('id, clientId, clientName, title, description, status, responsibleId, responsibleName, solutionSteps, attachments, customData, created_at, updated_at')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      // Mapear campos do Supabase para o formato da aplicação
      return (data || []).map((t) => ({
        ...t,
        createdAt: t.created_at,
        updatedAt: t.updated_at,
      }))
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!supabase,
  })
}

/**
 * Hook para buscar categorias da KB usando React Query
 */
export function useKnowledgeCategories() {
  return useQuery({
    queryKey: ['knowledge_categories'],
    queryFn: async () => {
      if (!supabase) return []
      const { data, error } = await supabase
        .from('knowledge_categories')
        .select('id, name, description')
        .order('name', { ascending: true })
      
      if (error) throw error
      return data || []
    },
    staleTime: 10 * 60 * 1000, // 10 minutos (categorias mudam menos)
    enabled: !!supabase,
  })
}

/**
 * Hook para buscar artigos da KB usando React Query
 */
export function useKnowledgeArticles() {
  return useQuery({
    queryKey: ['knowledge_articles'],
    queryFn: async () => {
      if (!supabase) return []
      const { data, error } = await supabase
        .from('knowledge_articles')
        .select('id, title, excerpt, content, categoryId, categoryName, author, tags, views, helpfulCount, isPublic, created_at, updated_at')
        .order('updated_at', { ascending: false })
      
      if (error) throw error
      
      return (data || []).map((a) => ({
        ...a,
        createdAt: a.created_at,
        updatedAt: a.updated_at,
      }))
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!supabase,
  })
}

/**
 * Hook para mutação de clientes
 */
export function useClientMutations() {
  const queryClient = useQueryClient()

  const addClient = useMutation({
    mutationFn: async (client: any) => {
      if (!supabase) throw new Error('Supabase not configured')
      const { data, error } = await supabase
        .from('clients')
        .insert(client)
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
    },
  })

  const updateClient = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      if (!supabase) throw new Error('Supabase not configured')
      const { data: updated, error } = await supabase
        .from('clients')
        .update(data)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return updated
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
    },
  })

  return { addClient, updateClient }
}

