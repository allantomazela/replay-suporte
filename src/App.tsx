import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import Layout from './components/Layout'
import NotFound from './pages/NotFound'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import ClientList from './pages/clients/ClientList'
import ClientProfile from './pages/clients/ClientProfile'
import TicketList from './pages/tickets/TicketList'
import TicketDetail from './pages/tickets/TicketDetail'
import Reports from './pages/Reports'
import PerformanceReports from './pages/PerformanceReports'
import Profile from './pages/Profile'
import KnowledgeBaseList from './pages/knowledge-base/KnowledgeBaseList'
import KnowledgeBaseDetail from './pages/knowledge-base/KnowledgeBaseDetail'
import KnowledgeBaseEditor from './pages/knowledge-base/KnowledgeBaseEditor'
import SystemHealth from './pages/admin/SystemHealth'
import UserList from './pages/admin/UserList'
import TechnicianList from './pages/technicians/TechnicianList'
import { AppProvider } from '@/context/AppContext'
import { ThemeProvider } from '@/components/theme-provider'
import PortalLayout from './pages/portal/PortalLayout'
import PortalHome from './pages/portal/PortalHome'
import PortalArticle from './pages/portal/PortalArticle'

// App component with Provider wrapper
const App = () => (
  <BrowserRouter
    future={{ v7_startTransition: false, v7_relativeSplatPath: false }}
  >
    <ThemeProvider defaultTheme="system" storageKey="replay-ui-theme">
      <AppProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/login" element={<Login />} />

            {/* Portal Routes (Public) */}
            <Route path="/portal" element={<PortalLayout />}>
              <Route index element={<PortalHome />} />
              <Route path="article/:id" element={<PortalArticle />} />
            </Route>

            {/* App Routes (Private) */}
            <Route element={<Layout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />

              <Route path="/clients" element={<ClientList />} />
              <Route path="/clients/:id" element={<ClientProfile />} />

              <Route path="/tickets" element={<TicketList />} />
              <Route path="/tickets/:id" element={<TicketDetail />} />

              <Route path="/knowledge-base" element={<KnowledgeBaseList />} />
              <Route
                path="/knowledge-base/new"
                element={<KnowledgeBaseEditor />}
              />
              <Route
                path="/knowledge-base/edit/:id"
                element={<KnowledgeBaseEditor />}
              />
              <Route
                path="/knowledge-base/articles/:id"
                element={<KnowledgeBaseDetail />}
              />

              <Route path="/reports" element={<Reports />} />
              <Route
                path="/reports/performance"
                element={<PerformanceReports />}
              />

              <Route path="/system-health" element={<SystemHealth />} />
              <Route path="/users" element={<UserList />} />
              <Route path="/technicians" element={<TechnicianList />} />

              <Route path="/profile" element={<Profile />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </AppProvider>
    </ThemeProvider>
  </BrowserRouter>
)

export default App
