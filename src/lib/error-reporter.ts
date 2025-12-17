/**
 * Serviço de reporte de erros
 * Em produção, pode integrar com Sentry, LogRocket, etc.
 */

interface ErrorReport {
  message: string
  stack?: string
  context?: Record<string, any>
  timestamp: string
  userAgent: string
  url: string
  userId?: string
}

const isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development'

/**
 * Reporta um erro para o serviço de monitoramento
 * @param error - Erro a ser reportado
 * @param context - Contexto adicional do erro
 * @param userId - ID do usuário (opcional)
 */
export const reportError = (
  error: Error,
  context?: Record<string, any>,
  userId?: string,
) => {
  const report: ErrorReport = {
    message: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
    url: typeof window !== 'undefined' ? window.location.href : 'unknown',
    userId,
  }

  // Em desenvolvimento, apenas logar
  if (isDevelopment) {
    console.error('[Error Report]', report)
    return
  }

  // Em produção, enviar para serviço de monitoramento
  // TODO: Integrar com Sentry, LogRocket, etc.
  // Exemplo com Sentry:
  // if (typeof window !== 'undefined' && (window as any).Sentry) {
  //   (window as any).Sentry.captureException(error, {
  //     extra: context,
  //     user: userId ? { id: userId } : undefined,
  //   })
  // }

  // Por enquanto, logar apenas errors críticos (sem stack para segurança)
  console.error('[Production Error]', {
    message: error.message,
    context: context ? Object.keys(context) : undefined,
    timestamp: report.timestamp,
    // Não logar stack em produção para segurança
  })
}

/**
 * Reporta um erro não crítico (warning)
 */
export const reportWarning = (
  message: string,
  context?: Record<string, any>,
) => {
  if (isDevelopment) {
    console.warn('[Warning Report]', { message, context })
  }
  // Em produção, warnings não são reportados por padrão
  // Mas podem ser habilitados se necessário
}

/**
 * Reporta uma métrica ou evento
 */
export const reportEvent = (
  eventName: string,
  properties?: Record<string, any>,
) => {
  if (isDevelopment) {
    console.log('[Event]', eventName, properties)
  }
  // Em produção, pode integrar com analytics
  // Exemplo: Google Analytics, Mixpanel, etc.
}

