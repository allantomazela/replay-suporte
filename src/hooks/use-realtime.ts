import { useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { RealtimeChannel } from '@supabase/supabase-js'
import { AppNotification } from '@/types'

interface RealtimeNotification {
  type: 'ticket' | 'client' | 'article'
  action: 'created' | 'updated' | 'deleted'
  id: string
  title: string
  message: string
  userId?: string
}

interface UseRealtimeOptions {
  userId?: string
  onNotification?: (notification: AppNotification) => void
  enabled?: boolean
}

/**
 * Hook para gerenciar notificações em tempo real de forma segura
 * 
 * @param options - Opções de configuração
 * @returns Objeto com status da conexão
 */
export function useRealtime({
  userId,
  onNotification,
  enabled = true,
}: UseRealtimeOptions) {
  const channelRef = useRef<RealtimeChannel | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttemptsRef = useRef(0)
  const maxReconnectAttempts = 5
  const baseDelay = 1000 // 1 segundo

  const cleanup = () => {
    if (channelRef.current && supabase) {
      supabase.removeChannel(channelRef.current)
      channelRef.current = null
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
  }

  const connect = () => {
    if (!enabled || !supabase || !userId || !onNotification) {
      return
    }

    // Limpar conexão anterior se existir
    cleanup()

    try {
      const channel = supabase
        .channel(`notifications-${userId}`, {
          config: {
            presence: {
              key: userId,
            },
          },
        })
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'tickets',
          },
          (payload) => {
            const notification: AppNotification = {
              id: `notif_${Date.now()}_${Math.random()}`,
              userId: userId,
              title: 'Novo Ticket',
              message: `Ticket "${payload.new.title}" foi criado`,
              link: `/tickets/${payload.new.id}`,
              read: false,
              createdAt: new Date().toISOString(),
            }
            onNotification(notification)
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'tickets',
            filter: `responsibleId=eq.${userId}`,
          },
          (payload) => {
            const notification: AppNotification = {
              id: `notif_${Date.now()}_${Math.random()}`,
              userId: userId,
              title: 'Ticket Atualizado',
              message: `Ticket "${payload.new.title}" foi atualizado`,
              link: `/tickets/${payload.new.id}`,
              read: false,
              createdAt: new Date().toISOString(),
            }
            onNotification(notification)
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'clients',
          },
          (payload) => {
            const notification: AppNotification = {
              id: `notif_${Date.now()}_${Math.random()}`,
              userId: userId,
              title: 'Novo Cliente',
              message: `Cliente "${payload.new.name}" foi cadastrado`,
              link: `/clients/${payload.new.id}`,
              read: false,
              createdAt: new Date().toISOString(),
            }
            onNotification(notification)
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            reconnectAttemptsRef.current = 0
            console.log('[useRealtime] Connected successfully')
          } else if (status === 'CHANNEL_ERROR') {
            console.error('[useRealtime] Channel error, attempting reconnect...')
            scheduleReconnect()
          } else if (status === 'TIMED_OUT') {
            console.warn('[useRealtime] Connection timed out, attempting reconnect...')
            scheduleReconnect()
          }
        })

      channelRef.current = channel
    } catch (error) {
      console.error('[useRealtime] Failed to setup realtime:', error)
      scheduleReconnect()
    }
  }

  const scheduleReconnect = () => {
    if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
      console.error('[useRealtime] Max reconnect attempts reached, giving up')
      return
    }

    const delay = baseDelay * Math.pow(2, reconnectAttemptsRef.current) // Backoff exponencial
    reconnectAttemptsRef.current++

    reconnectTimeoutRef.current = setTimeout(() => {
      console.log(`[useRealtime] Reconnecting (attempt ${reconnectAttemptsRef.current})...`)
      connect()
    }, delay)
  }

  useEffect(() => {
    if (!enabled || !userId || !onNotification) {
      cleanup()
      return
    }

    // Delay inicial para evitar conexões muito rápidas
    const initialDelay = setTimeout(() => {
      connect()
    }, 500)

    return () => {
      clearTimeout(initialDelay)
      cleanup()
    }
  }, [enabled, userId, onNotification])

  return {
    isConnected: channelRef.current !== null,
    reconnect: connect,
    disconnect: cleanup,
  }
}

