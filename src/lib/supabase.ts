import { createClient } from '@supabase/supabase-js'

/**
 * Valida se a URL é um domínio Supabase válido
 */
function isValidSupabaseUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    // Verifica se é um domínio Supabase (supabase.co ou localhost para dev)
    const isValidDomain =
      parsed.hostname.endsWith('.supabase.co') ||
      parsed.hostname === 'localhost' ||
      parsed.hostname === '127.0.0.1' ||
      parsed.hostname.startsWith('192.168.') ||
      parsed.hostname.startsWith('10.')

    // Verifica se usa HTTPS (ou HTTP apenas em localhost)
    const isValidProtocol =
      parsed.protocol === 'https:' ||
      (parsed.protocol === 'http:' &&
        (parsed.hostname === 'localhost' ||
          parsed.hostname === '127.0.0.1' ||
          parsed.hostname.startsWith('192.168.') ||
          parsed.hostname.startsWith('10.')))

    return isValidDomain && isValidProtocol
  } catch {
    return false
  }
}

/**
 * Valida formato básico da chave anon do Supabase
 */
function isValidAnonKey(key: string): boolean {
  // Chave anon do Supabase geralmente começa com 'eyJ' (JWT) e tem um tamanho mínimo
  return (
    typeof key === 'string' &&
    key.length > 50 &&
    (key.startsWith('eyJ') || key.startsWith('sb_'))
  )
}

// Get config with priority: localStorage > env vars
// This allows the "Supabase Integration" feature to override env vars
const getSupabaseConfig = () => {
  try {
    const localUrl = localStorage.getItem('supabase_url')
    const localKey = localStorage.getItem('supabase_key')

    if (localUrl && localKey) {
      // Valida URL e chave do localStorage, mas permite se a validação falhar (fallback)
      if (isValidSupabaseUrl(localUrl) && isValidAnonKey(localKey)) {
        return { url: localUrl, key: localKey, type: 'local' }
      }
      // Fallback: se a validação falhar mas temos valores, ainda usamos (com warning)
      console.warn('Configuração do Supabase no localStorage pode ser inválida, usando mesmo assim')
      return { url: localUrl, key: localKey, type: 'local' }
    }

    const envUrl = import.meta.env.VITE_SUPABASE_URL
    const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY

    if (envUrl && envKey) {
      // Valida URL e chave das variáveis de ambiente, mas permite se a validação falhar (fallback)
      if (isValidSupabaseUrl(envUrl) && isValidAnonKey(envKey)) {
        return { url: envUrl, key: envKey, type: 'env' }
      }
      // Fallback: se a validação falhar mas temos valores, ainda usamos (com warning)
      console.warn('Configuração do Supabase nas variáveis de ambiente pode ser inválida, usando mesmo assim')
      return { url: envUrl, key: envKey, type: 'env' }
    }
  } catch (error) {
    console.error('Erro ao obter configuração do Supabase:', error)
  }

  return null
}

const config = getSupabaseConfig()

export const supabase = config
  ? createClient(config.url, config.key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
      db: {
        schema: 'public',
      },
      global: {
        headers: {
          'X-Client-Info': 'replay-suporte',
        },
      },
    })
  : null

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
