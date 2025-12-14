import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle, RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo)
  }

  private handleReload = () => {
    window.location.reload()
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 text-center">
          <div className="bg-destructive/10 p-4 rounded-full mb-4">
            <AlertCircle className="h-10 w-10 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Algo deu errado</h1>
          <p className="text-muted-foreground mb-6 max-w-md">
            Desculpe, ocorreu um erro inesperado na aplicação. Tente recarregar
            a página.
          </p>
          <div className="bg-muted p-4 rounded-md mb-6 w-full max-w-lg overflow-auto text-xs text-left font-mono">
            {this.state.error?.message}
          </div>
          <Button onClick={this.handleReload} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Recarregar Aplicação
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}
