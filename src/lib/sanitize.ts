// Importação do DOMPurify com fallback
import DOMPurify from 'dompurify'

// Função helper para sanitização segura
const safeSanitize = (dirty: string, config: any): string => {
  try {
    if (typeof window === 'undefined') {
      return dirty.replace(/<[^>]*>/g, '')
    }
    return DOMPurify.sanitize(dirty, config)
  } catch (error) {
    console.warn('Erro ao sanitizar, usando fallback:', error)
    return dirty
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/on\w+="[^"]*"/gi, '')
      .replace(/on\w+='[^']*'/gi, '')
  }
}

/**
 * Sanitiza HTML para prevenir ataques XSS
 * @param dirty - HTML não sanitizado
 * @returns HTML sanitizado e seguro
 */
export function sanitizeHTML(dirty: string): string {
  if (!dirty || typeof dirty !== 'string') {
    return ''
  }

  return safeSanitize(dirty, {
    ALLOWED_TAGS: [
      'p',
      'br',
      'strong',
      'em',
      'u',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'ul',
      'ol',
      'li',
      'a',
      'blockquote',
      'code',
      'pre',
      'span',
      'div',
    ],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
    ALLOW_DATA_ATTR: false,
  })
}

/**
 * Sanitiza texto simples removendo HTML
 * @param text - Texto que pode conter HTML
 * @returns Texto limpo sem HTML
 */
export function sanitizeText(text: string): string {
  if (!text || typeof text !== 'string') {
    return ''
  }

  const sanitized = safeSanitize(text, { ALLOWED_TAGS: [] })
  // Se ainda tiver tags após sanitização, remove manualmente
  return sanitized.replace(/<[^>]*>/g, '')
}

/**
 * Valida e sanitiza URL
 * @param url - URL para validar
 * @returns URL sanitizada ou null se inválida
 */
export function sanitizeURL(url: string): string | null {
  try {
    const parsed = new URL(url)
    // Apenas permite HTTPS em produção
    if (
      import.meta.env.PROD &&
      parsed.protocol !== 'https:' &&
      !parsed.hostname.includes('localhost')
    ) {
      return null
    }
    return parsed.toString()
  } catch {
    return null
  }
}

