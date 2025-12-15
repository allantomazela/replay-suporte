import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useEffect, lazy, Suspense } from 'react'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Loader2 } from 'lucide-react'
import Layout from './components/Layout'
import NotFound from './pages/NotFound'
import Login from './pages/Login'
import Index from './pages/Index'
import PortalLayout from './pages/portal/PortalLayout'
import PortalHome from './pages/portal/PortalHome'
import PortalArticle from './pages/portal/PortalArticle'
import { AppProvider } from '@/context/AppContext'
import { ThemeProvider } from '@/components/theme-provider'
import { ReactQueryProvider } from '@/lib/react-query'
import { ErrorBoundary } from '@/components/ErrorBoundary'

// Lazy loading para melhorar performance inicial
const Dashboard = lazy(() => import('./pages/Dashboard'))
const ClientList = lazy(() => import('./pages/clients/ClientList'))
const ClientProfile = lazy(() => import('./pages/clients/ClientProfile'))
const TicketList = lazy(() => import('./pages/tickets/TicketList'))
const TicketDetail = lazy(() => import('./pages/tickets/TicketDetail'))
const Reports = lazy(() => import('./pages/Reports'))
const PerformanceReports = lazy(() => import('./pages/PerformanceReports'))
const Profile = lazy(() => import('./pages/Profile'))
const KnowledgeBaseList = lazy(() => import('./pages/knowledge-base/KnowledgeBaseList'))
const KnowledgeBaseDetail = lazy(() => import('./pages/knowledge-base/KnowledgeBaseDetail'))
const KnowledgeBaseEditor = lazy(() => import('./pages/knowledge-base/KnowledgeBaseEditor'))
const SystemHealth = lazy(() => import('./pages/admin/SystemHealth'))
const UserList = lazy(() => import('./pages/admin/UserList'))
const TechnicianList = lazy(() => import('./pages/technicians/TechnicianList'))

const AppContent = () => {
  // Global error handling for 3rd party scripts issues and unhandled promises
  useEffect(() => {
    const shouldSuppressError = (msg: string) => {
      const lowerMsg = msg.toLowerCase()
      return (
        lowerMsg.includes('message channel closed') ||
        lowerMsg.includes('fbevents') ||
        lowerMsg.includes('blocked_by_client') ||
        lowerMsg.includes('resizeobserver') ||
        lowerMsg.includes('script error')
      )
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason?.message || event.reason?.toString() || ''
      if (shouldSuppressError(reason)) {
        event.preventDefault()
        console.debug('Suppressed unhandled rejection:', reason)
      }
    }

    const handleError = (event: ErrorEvent) => {
      const msg = event.message || ''
      if (shouldSuppressError(msg)) {
        event.preventDefault()
        console.debug('Suppressed global error:', msg)
      }
    }

    window.addEventListener('unhandledrejection', handleUnhandledRejection)
    window.addEventListener('error', handleError, true) // Capture phase to catch resource errors

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
      window.removeEventListener('error', handleError, true)
    }
  }, [])

  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* Portal Routes (Public) */}
      <Route path="/portal" element={<PortalLayout />}>
        <Route index element={<PortalHome />} />
        <Route path="article/:id" element={<PortalArticle />} />
      </Route>

      {/* Initial Route - Independent check outside Layout */}
      <Route path="/" element={<Index />} />

      {/* App Routes (Private) */}
      <Route element={<Layout />}>
        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/clients" element={<ClientList />} />
        <Route path="/clients/:id" element={<ClientProfile />} />

        <Route path="/tickets" element={<TicketList />} />
        <Route path="/tickets/:id" element={<TicketDetail />} />

        <Route path="/knowledge-base" element={<KnowledgeBaseList />} />
        <Route path="/knowledge-base/new" element={<KnowledgeBaseEditor />} />
        <Route
          path="/knowledge-base/edit/:id"
          element={<KnowledgeBaseEditor />}
        />
        <Route
          path="/knowledge-base/articles/:id"
          element={<KnowledgeBaseDetail />}
        />

        <Route path="/reports" element={<Reports />} />
        <Route path="/reports/performance" element={<PerformanceReports />} />

        <Route path="/system-health" element={<SystemHealth />} />
        <Route path="/users" element={<UserList />} />
        <Route path="/technicians" element={<TechnicianList />} />

        <Route path="/profile" element={<Profile />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

// Loading component para Suspense
const PageLoader = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-background">
    <Loader2 className="h-10 w-10 animate-spin text-primary" />
    <p className="text-sm text-muted-foreground mt-4">Carregando...</p>
  </div>
)

const App = () => (
  <BrowserRouter
    future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
  >
    <ThemeProvider defaultTheme="system" storageKey="replay-ui-theme">
      <ErrorBoundary>
        <ReactQueryProvider>
          <AppProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <Suspense fallback={<PageLoader />}>
                <AppContent />
              </Suspense>
            </TooltipProvider>
          </AppProvider>
        </ReactQueryProvider>
      </ErrorBoundary>
    </ThemeProvider>
  </BrowserRouter>
)

export default App
