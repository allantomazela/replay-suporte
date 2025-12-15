import { supabase } from './supabase'

export interface AuditLog {
  id: string
  table_name: string
  record_id: string
  action: 'INSERT' | 'UPDATE' | 'DELETE'
  old_data?: any
  new_data?: any
  changed_fields?: string[]
  user_id?: string
  user_email?: string
  ip_address?: string
  user_agent?: string
  created_at: string
}

/**
 * Registra uma alteração no audit log
 */
export async function logAudit(
  tableName: string,
  recordId: string,
  action: 'INSERT' | 'UPDATE' | 'DELETE',
  options: {
    oldData?: any
    newData?: any
    changedFields?: string[]
    userId?: string
    userEmail?: string
  } = {}
): Promise<void> {
  if (!supabase) {
    console.warn('Supabase not configured, skipping audit log')
    return
  }

  try {
    const { oldData, newData, changedFields, userId, userEmail } = options

    // Obter informações do usuário atual
    const {
      data: { session },
    } = await supabase.auth.getSession()
    const currentUserId = userId || session?.user?.id
    const currentUserEmail = userEmail || session?.user?.email

    // Obter IP e User Agent (se disponível)
    const ipAddress = typeof window !== 'undefined' ? 'client-side' : undefined
    const userAgent =
      typeof window !== 'undefined' ? window.navigator.userAgent : undefined

    await supabase.from('audit_logs').insert({
      table_name: tableName,
      record_id: recordId,
      action,
      old_data: oldData || null,
      new_data: newData || null,
      changed_fields: changedFields || null,
      user_id: currentUserId || null,
      user_email: currentUserEmail || null,
      ip_address: ipAddress || null,
      user_agent: userAgent || null,
    })
  } catch (error) {
    console.error('Failed to log audit:', error)
    // Não falhar a operação principal se o audit log falhar
  }
}

/**
 * Busca histórico de alterações de um registro
 */
export async function getAuditHistory(
  tableName: string,
  recordId: string
): Promise<AuditLog[]> {
  if (!supabase) return []

  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('table_name', tableName)
      .eq('record_id', recordId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Failed to fetch audit history:', error)
    return []
  }
}

/**
 * Compara dois objetos e retorna campos alterados
 */
export function getChangedFields(oldData: any, newData: any): string[] {
  if (!oldData || !newData) return []

  const changed: string[] = []
  const allKeys = new Set([...Object.keys(oldData), ...Object.keys(newData)])

  for (const key of allKeys) {
    if (oldData[key] !== newData[key]) {
      changed.push(key)
    }
  }

  return changed
}

