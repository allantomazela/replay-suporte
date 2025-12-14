import { Outlet, Navigate, useLocation } from 'react-router-dom'
import { Sidebar } from '@/components/Sidebar'
import { Header } from '@/components/Header'
import { useAppContext } from '@/context/AppContext'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { Loader2 } from 'lucide-react'

export default function Layout() {
  const { user, isLoading } = useAppContext()
  const location = useLocation()

  // Ensure loading state blocks everything to prevent premature redirects
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin h-10 w-10 text-primary" />
          <p className="text-sm text-muted-foreground animate-pulse">
            Verificando acesso...
          </p>
        </div>
      </div>
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
