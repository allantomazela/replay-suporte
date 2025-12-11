import { Outlet, Navigate, useLocation } from 'react-router-dom'
import { Sidebar } from '@/components/Sidebar'
import { Header } from '@/components/Header'
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
      <div className="flex-1 flex flex-col min-h-screen transition-all duration-300 sm:pl-20 lg:pl-64 w-full">
        <Header />
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
