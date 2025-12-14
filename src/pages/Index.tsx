import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAppContext } from '@/context/AppContext'
import { Loader2 } from 'lucide-react'

export default function Index() {
  const { user, isLoading } = useAppContext()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    // Wait for the global loading state to finish (auth check)
    if (!isLoading) {
      if (user) {
        // If authenticated, redirect to the dashboard
        // Use replace to avoid building up history stack with redirects
        navigate('/dashboard', { replace: true })
      } else {
        // If not authenticated, redirect to login
        // Preserve the current location in state so we can redirect back if needed
        navigate('/login', {
          replace: true,
          state: { from: location },
        })
      }
    }
  }, [user, isLoading, navigate, location])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground animate-pulse">
          Carregando aplicação...
        </p>
      </div>
    </div>
  )
}
