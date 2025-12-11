import { Outlet, Navigate, useLocation } from 'react-router-dom'
import { Sidebar } from '@/components/Sidebar'
import { useAppContext } from '@/context/AppContext'

export default function Layout() {
  const { user } = useAppContext()
  const location = useLocation()

  if (!user && location.pathname !== '/login') {
    return <Navigate to="/login" replace />
  }

  // If we are on login page, we render the Outlet directly without layout
  if (location.pathname === '/login') {
    return <Outlet />
  }

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <main className="flex-1 md:pl-20 lg:pl-64 pt-16 md:pt-0 min-h-screen transition-all duration-300">
        <div className="container mx-auto p-4 md:p-8 max-w-7xl animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
