import { createClient } from '@supabase/supabase-js'

// Get config with priority: localStorage > env vars
// This allows the "Supabase Integration" feature to override env vars
const getSupabaseConfig = () => {
  const localUrl = localStorage.getItem('supabase_url')
  const localKey = localStorage.getItem('supabase_key')

  if (localUrl && localKey) {
    return { url: localUrl, key: localKey, type: 'local' }
  }

  const envUrl = import.meta.env.VITE_SUPABASE_URL
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY

  if (envUrl && envKey) {
    return { url: envUrl, key: envKey, type: 'env' }
  }

  return null
}

const config = getSupabaseConfig()

export const supabase = config ? createClient(config.url, config.key) : null

export const isSupabaseConfigured = () => !!supabase

export const getActiveSupabaseUrl = () => config?.url || ''

export const saveSupabaseConfig = (url: string, key: string) => {
  localStorage.setItem('supabase_url', url)
  localStorage.setItem('supabase_key', key)
  window.location.reload() // Reload to re-initialize client
}

export const clearSupabaseConfig = () => {
  localStorage.removeItem('supabase_url')
  localStorage.removeItem('supabase_key')
  window.location.reload()
}

// Helper to check connection
export const checkSupabaseConnection = async () => {
  if (!supabase) return false
  try {
    // Just a simple query to check connectivity
    // Using from('clients') might fail with RLS if not logged in, but we check for network error
    const { error } = await supabase
      .from('clients')
      .select('count', { count: 'exact', head: true })

    // If we get an error, check if it's a connectivity error vs permission error
    // If it's permission error (401/403), connection is ALIVE.
    // If "Failed to fetch", connection is DEAD.
    if (
      error &&
      (error.message.includes('Failed to fetch') || error.code === '500')
    ) {
      return false
    }

    // PGRST116 means no rows returned (head: true with no rows?), mostly if table empty or no access
    // But if connection fails we get fetch error above.
    return true
  } catch (e) {
    return false
  }
}
