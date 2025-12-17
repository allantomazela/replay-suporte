import { useCallback } from 'react'
import { useToast } from '@/hooks/use-toast'
import { isSupabaseConfigured } from '@/lib/supabase'

interface ErrorHandlerOptions {
  showToast?: boolean
  logError?: boolean
  fallbackMessage?: string
}

/**
 * Hook para tratamento centralizado de erros
 * Fornece uma interface consistente para lidar com erros em toda a aplicação
 */
export function useErrorHandler() {
  const { toast } = useToast()

  const handleError = useCallback(
    (error: unknown, options: ErrorHandlerOptions = {}) => {
      const {
        showToast = true,
        logError = true,
        fallbackMessage = 'Ocorreu um erro inesperado. Por favor, tente novamente.',
      } = options

      let errorMessage = fallbackMessage
      let errorTitle = 'Erro'

      // Extrair mensagem de erro de diferentes tipos
      if (error instanceof Error) {
        errorMessage = error.message || fallbackMessage
      } else if (typeof error === 'string') {
        errorMessage = error
      } else if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = String(error.message) || fallbackMessage
      }

      // Categorizar erros comuns
      if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        errorTitle = 'Erro de Conexão'
        errorMessage = 'Não foi possível conectar ao servidor. Verifique sua conexão.'
      } else if (errorMessage.includes('timeout')) {
        errorTitle = 'Tempo Esgotado'
        errorMessage = 'A requisição demorou muito para responder. Tente novamente.'
      } else if (errorMessage.includes('permission') || errorMessage.includes('unauthorized')) {
        errorTitle = 'Acesso Negado'
        errorMessage = 'Você não tem permissão para realizar esta ação.'
      } else if (errorMessage.includes('not found') || errorMessage.includes('404')) {
        errorTitle = 'Não Encontrado'
        errorMessage = 'O recurso solicitado não foi encontrado.'
      } else if (!isSupabaseConfigured() && errorMessage.includes('Supabase')) {
        errorTitle = 'Configuração Necessária'
        errorMessage = 'O Supabase não está configurado. Verifique as variáveis de ambiente.'
      }

      // Log do erro em desenvolvimento
      if (logError && import.meta.env.DEV) {
        console.error('[ErrorHandler]', {
          error,
          message: errorMessage,
          stack: error instanceof Error ? error.stack : undefined,
        })
      }

      // Mostrar toast se solicitado
      if (showToast) {
        toast({
          title: errorTitle,
          description: errorMessage,
          variant: 'destructive',
        })
      }

      return { title: errorTitle, message: errorMessage }
    },
    [toast],
  )

  const handleAsyncError = useCallback(
    async <T,>(
      asyncFn: () => Promise<T>,
      options?: ErrorHandlerOptions,
    ): Promise<T | null> => {
      try {
        return await asyncFn()
      } catch (error) {
        handleError(error, options)
        return null
      }
    },
    [handleError],
  )

  return {
    handleError,
    handleAsyncError,
  }
}

