import { Outlet, Navigate, useLocation } from 'react-router-dom'
import { Sidebar } from '@/components/Sidebar'
import { Header } from '@/components/Header'
import { useAppContext } from '@/context/AppContext'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { Loader2 } from 'lucide-react'

export default function Layout() {
  const { user, isLoading } = useAppContext()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="animate-spin h-10 w-10 text-primary" />
      </div>
    )
  }

  if (!user && location.pathname !== '/login') {
    return <Navigate to="/login" replace />
  }

  // If we are on login page, we render the Outlet directly without layout
  if (location.pathname === '/login') {
    return <Outlet />
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
