import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoadingProps {
  message?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
  fullScreen?: boolean
}

export function Loading({
  message = 'Carregando...',
  size = 'md',
  className,
  fullScreen = false,
}: LoadingProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  }

  const containerClasses = fullScreen
    ? 'flex flex-col items-center justify-center min-h-screen bg-background'
    : 'flex flex-col items-center justify-center p-8'

  return (
    <div className={cn(containerClasses, className)}>
      <div className="flex flex-col items-center gap-4">
        <Loader2
          className={cn(
            'animate-spin text-primary',
            sizeClasses[size],
          )}
        />
        <p className="text-sm text-muted-foreground animate-pulse">
          {message}
        </p>
      </div>
    </div>
  )
}

interface LoadingStateProps {
  message?: string
  description?: string
}

export function LoadingState({ message, description }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
      {message && (
        <p className="text-sm font-medium text-foreground mb-2">
          {message}
        </p>
      )}
      {description && (
        <p className="text-sm text-muted-foreground max-w-md">
          {description}
        </p>
      )}
    </div>
  )
}

