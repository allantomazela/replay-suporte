import { ReactNode } from 'react'
import { QueryErrorResetBoundary } from '@tanstack/react-query'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { Button } from '@/components/ui/button'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface QueryErrorBoundaryProps {
  children: ReactNode
  fallback?: (error: Error, resetErrorBoundary: () => void) => ReactNode
}

function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className="flex items-center justify-center min-h-[400px] p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <CardTitle>Erro ao carregar dados</CardTitle>
          </div>
          <CardDescription>
            Ocorreu um erro ao buscar informações do servidor.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {import.meta.env.DEV && (
            <div className="p-3 bg-muted rounded-md">
              <p className="text-sm font-mono text-muted-foreground break-all">
                {error.message}
              </p>
            </div>
          )}
          <div className="flex gap-2">
            <Button onClick={resetErrorBoundary} className="flex-1">
              <RefreshCw className="mr-2 h-4 w-4" />
              Tentar Novamente
            </Button>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="flex-1"
            >
              Recarregar Página
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * Error Boundary específico para React Query
 * Fornece reset automático de queries quando há erro
 * 
 * Uso:
 * ```tsx
 * <QueryErrorBoundary>
 *   <ComponenteQueUsaReactQuery />
 * </QueryErrorBoundary>
 * ```
 */
export function QueryErrorBoundary({ children, fallback }: QueryErrorBoundaryProps) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => {
        // Wrapper para integrar com ErrorBoundary existente
        const WrappedErrorBoundary = ({ children: wrappedChildren }: { children: ReactNode }) => {
          return (
            <ErrorBoundary>
              {wrappedChildren}
            </ErrorBoundary>
          )
        }

        return (
          <WrappedErrorBoundary>
            {children}
          </WrappedErrorBoundary>
        )
      }}
    </QueryErrorResetBoundary>
  )
}

