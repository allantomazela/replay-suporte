import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAppContext } from '@/context/AppContext'
import { Loading } from '@/components/ui/loading'

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
    <Loading
      message="Inicializando aplicação..."
      size="lg"
      fullScreen
    />
  )
}
