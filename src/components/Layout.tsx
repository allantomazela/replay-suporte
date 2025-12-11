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
      {/* 
        Adjusted padding for responsive sidebar:
        - Mobile (< sm): No left padding (sidebar is drawer), pt-16 for header
        - Tablet (sm - lg): pl-20 for collapsed sidebar (w-20), pt-0
        - Desktop (lg+): pl-64 for expanded sidebar (w-64), pt-0
      */}
      <main className="flex-1 sm:pl-20 lg:pl-64 pt-16 sm:pt-0 min-h-screen transition-all duration-300">
        <div className="container mx-auto p-4 md:p-8 max-w-7xl animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
