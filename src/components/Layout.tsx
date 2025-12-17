import { Outlet, Navigate, useLocation } from 'react-router-dom'
import { Sidebar } from '@/components/Sidebar'
import { Header } from '@/components/Header'
import { useAppContext } from '@/context/AppContext'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { Loading } from '@/components/ui/loading'
import { usePrefetch } from '@/hooks/use-prefetch'

export default function Layout() {
  const { user, isLoading } = useAppContext()
  const location = useLocation()
  
  // Prefetch de dados baseado na rota
  usePrefetch()

  // Ensure loading state blocks everything to prevent premature redirects
  if (isLoading) {
    return (
      <Loading
        message="Verificando autenticação..."
        size="lg"
        fullScreen
      />
    )
  }

  // Strictly redirect if not authenticated
  // We pass the current location in state so login page knows where to redirect back
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return (
    <SidebarProvider>
      <Sidebar />
      <SidebarInset>
        <div className="flex flex-col min-h-screen transition-all duration-300 w-full">
          <Header />
          <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto animate-fade-in">
            <Outlet />
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
