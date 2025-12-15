import { supabase } from './supabase'
import { RealtimeChannel } from '@supabase/supabase-js'

export interface RealtimeNotification {
  type: 'ticket' | 'client' | 'article'
  action: 'created' | 'updated' | 'deleted'
  id: string
  title: string
  message: string
  userId?: string
}

type NotificationCallback = (notification: RealtimeNotification) => void

/**
 * Configura listener para notificações em tempo real
 */
export function setupRealtimeNotifications(
  callback: NotificationCallback
): RealtimeChannel | null {
  if (!supabase) return null

  const channel = supabase
    .channel('notifications')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'tickets',
      },
      (payload) => {
        callback({
          type: 'ticket',
          action: 'created',
          id: payload.new.id,
          title: 'Novo Ticket',
          message: `Ticket "${payload.new.title}" foi criado`,
          userId: payload.new.responsibleId,
        })
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'tickets',
      },
      (payload) => {
        callback({
          type: 'ticket',
          action: 'updated',
          id: payload.new.id,
          title: 'Ticket Atualizado',
          message: `Ticket "${payload.new.title}" foi atualizado`,
          userId: payload.new.responsibleId,
        })
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
        callback({
          type: 'client',
          action: 'created',
          id: payload.new.id,
          title: 'Novo Cliente',
          message: `Cliente "${payload.new.name}" foi cadastrado`,
        })
      }
    )
    .subscribe()

  return channel
}

/**
 * Remove listener de notificações
 */
export function removeRealtimeNotifications(channel: RealtimeChannel | null) {
  if (channel && supabase) {
    supabase.removeChannel(channel)
  }
}

