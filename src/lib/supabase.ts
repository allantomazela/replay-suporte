import { createClient } from '@supabase/supabase-js'

// Try to get config from env vars first, then localStorage
const getSupabaseConfig = () => {
  const envUrl = import.meta.env.VITE_SUPABASE_URL
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY

  const localUrl = localStorage.getItem('supabase_url')
  const localKey = localStorage.getItem('supabase_key')

  if (envUrl && envKey) {
    return { url: envUrl, key: envKey, type: 'env' }
  }

  if (localUrl && localKey) {
    return { url: localUrl, key: localKey, type: 'local' }
  }

  return null
}

const config = getSupabaseConfig()

export const supabase = config ? createClient(config.url, config.key) : null

export const isSupabaseConfigured = () => !!supabase

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
    const { error } = await supabase
      .from('clients')
      .select('count', { count: 'exact', head: true })
    // If table doesn't exist, we might get a 404 or specific error, but connection to Supabase itself worked if we got a response.
    // However, usually we want to verify auth.
    return !error || error.code === 'PGRST116' // PGRST116 is no rows, which is fine
  } catch (e) {
    return false
  }
}
