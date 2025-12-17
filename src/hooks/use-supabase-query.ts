import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Client, Ticket, KnowledgeArticle, KnowledgeCategory, Technician } from '@/types'

/**
 * Configuração padrão para retry com exponential backoff
 * Não retry para erros de rede HTTP2/connection (são geralmente temporários do lado do servidor)
 */
const defaultRetryConfig = {
  retry: (failureCount: number, error: any) => {
    // Não retry para erros de conexão HTTP2 (são geralmente problemas temporários do servidor)
    if (error?.message?.includes('ERR_HTTP2_PROTOCOL_ERROR') ||
        error?.message?.includes('ERR_CONNECTION_CLOSED') ||
        error?.message?.includes('ERR_CONNECTION_RESET')) {
      return false
    }
    // Retry até 2 vezes para outros erros (reduzido de 3 para evitar muitas tentativas)
    return failureCount < 2
  },
  retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 10000), // Max 10s (reduzido)
}

/**
 * Utilitário para invalidar cache de forma inteligente
 */
export function useCacheInvalidation() {
  const queryClient = useQueryClient()

  const invalidateClients = () => {
    queryClient.invalidateQueries({ queryKey: ['clients'] })
  }

  const invalidateTickets = () => {
    queryClient.invalidateQueries({ queryKey: ['tickets'] })
  }

  const invalidateKnowledge = () => {
    queryClient.invalidateQueries({ queryKey: ['knowledge_categories'] })
    queryClient.invalidateQueries({ queryKey: ['knowledge_articles'] })
  }

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['clients'] })
    queryClient.invalidateQueries({ queryKey: ['tickets'] })
    queryClient.invalidateQueries({ queryKey: ['knowledge_categories'] })
    queryClient.invalidateQueries({ queryKey: ['knowledge_articles'] })
  }

  return {
    invalidateClients,
    invalidateTickets,
    invalidateKnowledge,
    invalidateAll,
  }
}

/**
 * Hook para buscar clientes usando React Query
 */
export function useClients(options?: Partial<UseQueryOptions<Client[], Error>>) {
  return useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      if (!supabase) {
        throw new Error('Supabase não está configurado')
      }
      const { data, error } = await supabase
        .from('clients')
        .select('id, name, city, phone, arenaCode, arenaName, active, contractType, technicalManager, created_at')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return (data || []) as Client[]
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos (antigo cacheTime)
    enabled: !!supabase,
    ...defaultRetryConfig,
    ...options,
  })
}

/**
 * Hook para buscar tickets usando React Query
 */
export function useTickets(options?: Partial<UseQueryOptions<Ticket[], Error>>) {
  return useQuery({
    queryKey: ['tickets'],
    queryFn: async () => {
      if (!supabase) {
        throw new Error('Supabase não está configurado')
      }
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
      })) as Ticket[]
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: !!supabase,
    ...defaultRetryConfig,
    ...options,
  })
}

/**
 * Hook para buscar categorias da KB usando React Query
 */
export function useKnowledgeCategories(options?: Partial<UseQueryOptions<KnowledgeCategory[], Error>>) {
  return useQuery({
    queryKey: ['knowledge_categories'],
    queryFn: async () => {
      if (!supabase) {
        throw new Error('Supabase não está configurado')
      }
      const { data, error } = await supabase
        .from('knowledge_categories')
        .select('id, name, description')
        .order('name', { ascending: true })
      
      if (error) throw error
      return (data || []) as KnowledgeCategory[]
    },
    staleTime: 10 * 60 * 1000, // 10 minutos (categorias mudam menos)
    gcTime: 15 * 60 * 1000,
    enabled: !!supabase,
    ...defaultRetryConfig,
    ...options,
  })
}

/**
 * Hook para buscar artigos da KB usando React Query
 */
export function useKnowledgeArticles(options?: Partial<UseQueryOptions<KnowledgeArticle[], Error>>) {
  return useQuery({
    queryKey: ['knowledge_articles'],
    queryFn: async () => {
      if (!supabase) {
        throw new Error('Supabase não está configurado')
      }
      const { data, error } = await supabase
        .from('knowledge_articles')
        .select('id, title, excerpt, content, categoryId, categoryName, author, tags, views, helpfulCount, isPublic, created_at, updated_at')
        .order('updated_at', { ascending: false })
      
      if (error) throw error
      
      return (data || []).map((a) => ({
        ...a,
        createdAt: a.created_at,
        updatedAt: a.updated_at,
      })) as KnowledgeArticle[]
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: !!supabase,
    ...defaultRetryConfig,
    ...options,
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
      // Invalidação inteligente: apenas invalida se necessário
      queryClient.invalidateQueries({ 
        queryKey: ['clients'],
        refetchType: 'active', // Apenas refaz queries ativas
      })
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
    onSuccess: (data) => {
      // Atualização otimista: atualiza cache diretamente
      queryClient.setQueryData(['clients'], (old: Client[] | undefined) => {
        if (!old) return [data]
        return old.map((c) => (c.id === data.id ? data : c))
      })
      // Invalida apenas queries inativas para manter sincronização
      queryClient.invalidateQueries({ 
        queryKey: ['clients'],
        refetchType: 'none', // Não refaz queries ativas, apenas marca como stale
      })
    },
  })

  return { addClient, updateClient }
}

/**
 * Hook para buscar técnicos usando React Query
 */
export function useTechnicians(options?: Partial<UseQueryOptions<Technician[], Error>>) {
  return useQuery({
    queryKey: ['technicians'],
    queryFn: async () => {
      if (!supabase) {
        throw new Error('Supabase não está configurado')
      }
      const { data, error } = await supabase
        .from('technicians')
        .select('id, name, email, phone, specialties, active, service_radius, cpf_cnpj, birth_date, cep, state, city, neighborhood, address, address_number, complement, experience_years, certifications, notes, created_at, updated_at')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return (data || []).map((t: any) => ({
        ...t,
        serviceRadius: t.service_radius,
        cpfCnpj: t.cpf_cnpj,
        birthDate: t.birth_date,
        addressNumber: t.address_number,
        experienceYears: t.experience_years,
      })) as Technician[]
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: !!supabase,
    ...defaultRetryConfig,
    ...options,
  })
}

/**
 * Hook para mutação de técnicos
 */
export function useTechnicianMutations() {
  const queryClient = useQueryClient()

  const addTechnician = useMutation({
    mutationFn: async (technician: Omit<Technician, 'id'>) => {
      if (!supabase) throw new Error('Supabase not configured')
      const { data, error } = await supabase
        .from('technicians')
        .insert({
          id: `tech-${Date.now()}`,
          name: technician.name,
          email: technician.email,
          phone: technician.phone,
          specialties: technician.specialties,
          active: technician.active,
          service_radius: technician.serviceRadius ?? 0,
          cpf_cnpj: technician.cpfCnpj,
          birth_date: technician.birthDate,
          cep: technician.cep,
          state: technician.state,
          city: technician.city,
          neighborhood: technician.neighborhood,
          address: technician.address,
          address_number: technician.addressNumber,
          complement: technician.complement,
          experience_years: technician.experienceYears,
          certifications: technician.certifications,
          notes: technician.notes,
        })
        .select()
        .single()
      
      if (error) throw error
      const result = data as any
      return {
        ...result,
        serviceRadius: result.service_radius,
        cpfCnpj: result.cpf_cnpj,
        birthDate: result.birth_date,
        addressNumber: result.address_number,
        experienceYears: result.experience_years,
      } as Technician
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['technicians'],
        refetchType: 'active',
      })
    },
  })

  const updateTechnician = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Technician> }) => {
      if (!supabase) throw new Error('Supabase not configured')
      const updateData: any = { ...data }
      
      // Mapear campos camelCase para snake_case
      if (updateData.serviceRadius !== undefined) {
        updateData.service_radius = updateData.serviceRadius
        delete updateData.serviceRadius
      }
      if (updateData.cpfCnpj !== undefined) {
        updateData.cpf_cnpj = updateData.cpfCnpj
        delete updateData.cpfCnpj
      }
      if (updateData.birthDate !== undefined) {
        updateData.birth_date = updateData.birthDate
        delete updateData.birthDate
      }
      if (updateData.addressNumber !== undefined) {
        updateData.address_number = updateData.addressNumber
        delete updateData.addressNumber
      }
      if (updateData.experienceYears !== undefined) {
        updateData.experience_years = updateData.experienceYears
        delete updateData.experienceYears
      }
      
      const { data: updated, error } = await supabase
        .from('technicians')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      const result = updated as any
      return {
        ...result,
        serviceRadius: result.service_radius,
        cpfCnpj: result.cpf_cnpj,
        birthDate: result.birth_date,
        addressNumber: result.address_number,
        experienceYears: result.experience_years,
      } as Technician
    },
    onSuccess: (data) => {
      // Atualização otimista: atualiza cache diretamente
      queryClient.setQueryData(['technicians'], (old: Technician[] | undefined) => {
        if (!old) return [data]
        return old.map((t) => (t.id === data.id ? data : t))
      })
      queryClient.invalidateQueries({ 
        queryKey: ['technicians'],
        refetchType: 'none',
      })
    },
  })

  const toggleTechnicianStatus = useMutation({
    mutationFn: async (id: string) => {
      if (!supabase) throw new Error('Supabase not configured')
      // Primeiro buscar o técnico atual
      const { data: current, error: fetchError } = await supabase
        .from('technicians')
        .select('active')
        .eq('id', id)
        .single()
      
      if (fetchError) throw fetchError
      
      const { data, error } = await supabase
        .from('technicians')
        .update({ active: !current.active })
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      const result = data as any
      return {
        ...result,
        serviceRadius: result.service_radius,
        cpfCnpj: result.cpf_cnpj,
        birthDate: result.birth_date,
        addressNumber: result.address_number,
        experienceYears: result.experience_years,
      } as Technician
    },
    onSuccess: (data) => {
      // Atualização otimista
      queryClient.setQueryData(['technicians'], (old: Technician[] | undefined) => {
        if (!old) return [data]
        return old.map((t) => (t.id === data.id ? data : t))
      })
      queryClient.invalidateQueries({ 
        queryKey: ['technicians'],
        refetchType: 'none',
      })
    },
  })

  const deleteTechnician = useMutation({
    mutationFn: async (id: string) => {
      if (!supabase) throw new Error('Supabase not configured')
      const { error } = await supabase
        .from('technicians')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      return id
    },
    onSuccess: (id) => {
      // Remoção otimista
      queryClient.setQueryData(['technicians'], (old: Technician[] | undefined) => {
        if (!old) return []
        return old.filter((t) => t.id !== id)
      })
      queryClient.invalidateQueries({ 
        queryKey: ['technicians'],
        refetchType: 'none',
      })
    },
  })

  return { addTechnician, updateTechnician, toggleTechnicianStatus, deleteTechnician }
}

