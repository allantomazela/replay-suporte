import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from 'react'
import { Client, Ticket, User } from '@/types'
import { MOCK_CLIENTS, MOCK_TICKETS, MOCK_USER } from '@/lib/mock-data'
import { DEFAULT_NAV_ORDER, NavItemId } from '@/lib/nav-config'

export interface NavPreference {
  id: NavItemId
  visible: boolean
  mobileVisible: boolean
}

interface AppContextType {
  user: User | null
  clients: Client[]
  tickets: Ticket[]
  login: (email: string) => void
  logout: () => void
  addClient: (client: Omit<Client, 'id' | 'active'>) => void
  updateClient: (id: string, data: Partial<Client>) => void
  toggleClientStatus: (id: string) => void
  addTicket: (
    ticket: Omit<
      Ticket,
      'id' | 'createdAt' | 'updatedAt' | 'responsibleId' | 'responsibleName'
    >,
  ) => void
  updateTicket: (id: string, data: Partial<Ticket>) => void
  getTicketById: (id: string) => Ticket | undefined
  getClientById: (id: string) => Client | undefined
  // Navigation Preferences
  navOrder: NavItemId[]
  navPreferences: Record<NavItemId, NavPreference>
  updateNavOrder: (order: NavItemId[]) => void
  updateNavPreference: (id: NavItemId, pref: Partial<NavPreference>) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

const DEFAULT_PREFERENCES: Record<NavItemId, NavPreference> = {
  dashboard: { id: 'dashboard', visible: true, mobileVisible: true },
  clients: { id: 'clients', visible: true, mobileVisible: true },
  tickets: { id: 'tickets', visible: true, mobileVisible: true },
  reports: { id: 'reports', visible: true, mobileVisible: true },
  profile: { id: 'profile', visible: true, mobileVisible: true },
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [clients, setClients] = useState<Client[]>(MOCK_CLIENTS)
  const [tickets, setTickets] = useState<Ticket[]>(MOCK_TICKETS)

  // Navigation State
  const [navOrder, setNavOrder] = useState<NavItemId[]>(() => {
    const stored = localStorage.getItem('nav-order')
    return stored ? JSON.parse(stored) : DEFAULT_NAV_ORDER
  })

  const [navPreferences, setNavPreferences] = useState<
    Record<NavItemId, NavPreference>
  >(() => {
    const stored = localStorage.getItem('nav-preferences')
    return stored ? JSON.parse(stored) : DEFAULT_PREFERENCES
  })

  // Persistence
  useEffect(() => {
    localStorage.setItem('nav-order', JSON.stringify(navOrder))
  }, [navOrder])

  useEffect(() => {
    localStorage.setItem('nav-preferences', JSON.stringify(navPreferences))
  }, [navPreferences])

  const login = (email: string) => {
    setUser({ ...MOCK_USER, email })
  }

  const logout = () => {
    setUser(null)
  }

  const addClient = (data: Omit<Client, 'id' | 'active'>) => {
    const newClient: Client = {
      ...data,
      id: `c${Date.now()}`,
      active: true,
    }
    setClients((prev) => [...prev, newClient])
  }

  const updateClient = (id: string, data: Partial<Client>) => {
    setClients((prev) => prev.map((c) => (c.id === id ? { ...c, ...data } : c)))
  }

  const toggleClientStatus = (id: string) => {
    setClients((prev) =>
      prev.map((c) => (c.id === id ? { ...c, active: !c.active } : c)),
    )
  }

  const addTicket = (
    data: Omit<
      Ticket,
      'id' | 'createdAt' | 'updatedAt' | 'responsibleId' | 'responsibleName'
    >,
  ) => {
    if (!user) return
    const client = clients.find((c) => c.id === data.clientId)
    const newTicket: Ticket = {
      ...data,
      id: `t${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      responsibleId: user.id,
      responsibleName: user.name,
      clientName: client ? client.name : 'Unknown',
      attachments: data.attachments || [],
    }
    setTickets((prev) => [newTicket, ...prev])
  }

  const updateTicket = (id: string, data: Partial<Ticket>) => {
    setTickets((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, ...data, updatedAt: new Date().toISOString() }
          : t,
      ),
    )
  }

  const updateNavOrder = (order: NavItemId[]) => {
    setNavOrder(order)
  }

  const updateNavPreference = (id: NavItemId, pref: Partial<NavPreference>) => {
    setNavPreferences((prev) => ({
      ...prev,
      [id]: { ...prev[id], ...pref },
    }))
  }

  const getTicketById = (id: string) => tickets.find((t) => t.id === id)
  const getClientById = (id: string) => clients.find((c) => c.id === id)

  return (
    <AppContext.Provider
      value={{
        user,
        clients,
        tickets,
        login,
        logout,
        addClient,
        updateClient,
        toggleClientStatus,
        addTicket,
        updateTicket,
        getTicketById,
        getClientById,
        navOrder,
        navPreferences,
        updateNavOrder,
        updateNavPreference,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useAppContext() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider')
  }
  return context
}
