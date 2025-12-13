import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from 'react'
import {
  Client,
  Ticket,
  User,
  CustomFieldDefinition,
  ArenaNotificationSetting,
  KnowledgeArticle,
  KnowledgeCategory,
  KnowledgeArticleVersion,
  KBSubscription,
  AppNotification,
  SystemLog,
  LogSeverity,
  Technician,
  UserRole,
} from '@/types'
import {
  MOCK_CLIENTS,
  MOCK_TICKETS,
  MOCK_USER,
  MOCK_CUSTOM_FIELDS,
  MOCK_KNOWLEDGE_ARTICLES,
  MOCK_KNOWLEDGE_CATEGORIES,
  MOCK_TECHNICIANS,
  MOCK_USERS_LIST,
} from '@/lib/mock-data'
import { DEFAULT_NAV_ORDER, NavItemId } from '@/lib/nav-config'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { logSystemEvent } from '@/lib/monitoring'

export interface NavPreference {
  id: NavItemId
  visible: boolean
  mobileVisible: boolean
}

export type IconSetType = 'default' | 'bold' | 'minimal'

export interface KBPermissions {
  canView: boolean
  canCreate: boolean
  canEdit: boolean
  canDelete: boolean
  canManageCategories: boolean
  canViewHistory: boolean
  canRestore: boolean
}

interface AppContextType {
  user: User | null
  isLoading: boolean
  usersList: User[]
  clients: Client[]
  tickets: Ticket[]
  technicians: Technician[]
  knowledgeArticles: KnowledgeArticle[]
  knowledgeCategories: KnowledgeCategory[]
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
  getArticleById: (id: string) => KnowledgeArticle | undefined
  // User Management
  updateUserRole: (id: string, role: UserRole) => void
  updateUserProfileImage: (imageUrl: string) => void
  // Technician Management
  addTechnician: (technician: Omit<Technician, 'id'>) => void
  updateTechnician: (id: string, data: Partial<Technician>) => void
  toggleTechnicianStatus: (id: string) => void
  // Knowledge Base CRUD
  addArticle: (
    article: Omit<
      KnowledgeArticle,
      'id' | 'createdAt' | 'updatedAt' | 'views' | 'helpfulCount' | 'versions'
    >,
  ) => void
  updateArticle: (id: string, data: Partial<KnowledgeArticle>) => void
  restoreArticleVersion: (articleId: string, versionId: string) => Promise<void>
  deleteArticle: (id: string) => void
  addCategory: (category: Omit<KnowledgeCategory, 'id'>) => void
  updateCategory: (id: string, data: Partial<KnowledgeCategory>) => void
  deleteCategory: (id: string) => void
  getKBPermissions: (authorId?: string) => KBPermissions
  // Subscriptions & Notifications
  subscriptions: KBSubscription[]
  notifications: AppNotification[]
  subscribe: (
    type: 'article' | 'category',
    targetId: string,
    targetName: string,
  ) => void
  unsubscribe: (id: string) => void
  markNotificationAsRead: (id: string) => void
  clearNotifications: () => void
  // Navigation Preferences
  navOrder: NavItemId[]
  navPreferences: Record<NavItemId, NavPreference>
  updateNavOrder: (order: NavItemId[]) => void
  updateNavPreference: (id: NavItemId, pref: Partial<NavPreference>) => void
  // Icon Customization
  iconSet: IconSetType
  updateIconSet: (set: IconSetType) => void
  customIcons: Record<string, string>
  uploadCustomIcon: (id: string, url: string) => void
  resetCustomIcon: (id: string) => void
  // Custom Fields
  customFields: CustomFieldDefinition[]
  // Notification Settings
  notificationSettings: ArenaNotificationSetting[]
  updateNotificationSetting: (
    arenaId: string,
    setting: Partial<ArenaNotificationSetting>,
  ) => void
  // Monitoring
  logEvent: (message: string, severity?: LogSeverity, source?: string) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

const DEFAULT_PREFERENCES: Record<NavItemId, NavPreference> = {
  dashboard: { id: 'dashboard', visible: true, mobileVisible: true },
  clients: { id: 'clients', visible: true, mobileVisible: true },
  tickets: { id: 'tickets', visible: true, mobileVisible: true },
  'knowledge-base': {
    id: 'knowledge-base',
    visible: true,
    mobileVisible: true,
  },
  reports: { id: 'reports', visible: true, mobileVisible: true },
  'reports-overview': {
    id: 'reports-overview',
    visible: true,
    mobileVisible: true,
  },
  'reports-performance': {
    id: 'reports-performance',
    visible: true,
    mobileVisible: true,
  },
  'system-health': {
    id: 'system-health',
    visible: true,
    mobileVisible: false,
  },
  users: { id: 'users', visible: true, mobileVisible: false },
  technicians: { id: 'technicians', visible: true, mobileVisible: false },
  profile: { id: 'profile', visible: true, mobileVisible: true },
}

export function AppProvider({ children }: { children: ReactNode }) {
  const isSupabase = isSupabaseConfigured()

  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [usersList, setUsersList] = useState<User[]>(MOCK_USERS_LIST)
  const [clients, setClients] = useState<Client[]>(MOCK_CLIENTS)
  const [tickets, setTickets] = useState<Ticket[]>(MOCK_TICKETS)
  const [technicians, setTechnicians] = useState<Technician[]>(MOCK_TECHNICIANS)
  const [customFields] = useState<CustomFieldDefinition[]>(MOCK_CUSTOM_FIELDS)

  // Knowledge Base State
  const [knowledgeArticles, setKnowledgeArticles] = useState<
    KnowledgeArticle[]
  >(MOCK_KNOWLEDGE_ARTICLES)
  const [knowledgeCategories, setKnowledgeCategories] = useState<
    KnowledgeCategory[]
  >(MOCK_KNOWLEDGE_CATEGORIES)

  // Supabase Data Fetching
  useEffect(() => {
    if (isSupabase && supabase) {
      // Auth State Change
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          // Fetch Role from profiles
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single()

          // Check if it's the super admin email
          const isAdminEmail = session.user.email === 'allantomazela@gamail.com'
          const role = isAdminEmail ? 'admin' : profile?.role || 'agent'

          setUser({
            id: session.user.id,
            name: session.user.user_metadata.full_name || session.user.email,
            email: session.user.email || '',
            role: role, // Role-Based Access Control initialization
            avatar: session.user.user_metadata.avatar_url,
          })

          logSystemEvent(`User ${session.user.email} logged in`, 'info', 'Auth')
        } else {
          setUser(null)
        }
        setIsLoading(false)
      })

      // Fetch Data - Optimized Queries
      const fetchData = async () => {
        const start = performance.now()

        // Use select to fetch only needed fields if possible, here fetching all for context state
        const { data: dbClients, error: clientError } = await supabase
          .from('clients')
          .select('*')
        if (dbClients) setClients(dbClients)
        if (clientError)
          logSystemEvent('Failed to fetch clients', 'error', 'Database', {
            error: clientError,
          })

        const { data: dbTickets, error: ticketError } = await supabase
          .from('tickets')
          .select('*')
        if (dbTickets) {
          const mappedTickets = dbTickets.map((t) => ({
            ...t,
            createdAt: t.created_at,
            updatedAt: t.updated_at,
          })) as Ticket[]
          setTickets(mappedTickets)
        }
        if (ticketError)
          logSystemEvent('Failed to fetch tickets', 'error', 'Database', {
            error: ticketError,
          })

        const { data: dbCats } = await supabase
          .from('knowledge_categories')
          .select('*')
        if (dbCats) setKnowledgeCategories(dbCats)

        const { data: dbArts } = await supabase
          .from('knowledge_articles')
          .select('*')
        if (dbArts) {
          const mappedArts = dbArts.map((a) => ({
            ...a,
            createdAt: a.created_at,
            updatedAt: a.updated_at,
          })) as KnowledgeArticle[]
          setKnowledgeArticles(mappedArts)
        }

        const end = performance.now()
        logSystemEvent(
          `Data refresh completed in ${(end - start).toFixed(0)}ms`,
          'info',
          'Performance',
        )
      }

      fetchData()

      return () => subscription.unsubscribe()
    } else {
      // Fallback to local storage persistence logic for mocks
      const storedUser = localStorage.getItem('mock-user')
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser))
        } catch (e) {
          console.error('Failed to restore mock user', e)
        }
      }

      const storedArticles = localStorage.getItem('kb-articles')
      if (storedArticles) setKnowledgeArticles(JSON.parse(storedArticles))

      setIsLoading(false)
    }
  }, [isSupabase])

  // Subscriptions & Notifications State
  const [subscriptions, setSubscriptions] = useState<KBSubscription[]>(() => {
    const stored = localStorage.getItem('kb-subscriptions')
    return stored ? JSON.parse(stored) : []
  })
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const stored = localStorage.getItem('app-notifications')
    return stored ? JSON.parse(stored) : []
  })

  // Navigation State
  const [navOrder, setNavOrder] = useState<NavItemId[]>(() => {
    const stored = localStorage.getItem('nav-order')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          const missingItems = DEFAULT_NAV_ORDER.filter(
            (id) => !parsed.includes(id),
          )
          if (missingItems.length > 0) {
            return [...parsed, ...missingItems]
          }
          return parsed
        }
      } catch (e) {
        console.error('Failed to parse nav-order from localStorage', e)
      }
    }
    return DEFAULT_NAV_ORDER
  })

  const [navPreferences, setNavPreferences] = useState<
    Record<NavItemId, NavPreference>
  >(() => {
    const stored = localStorage.getItem('nav-preferences')
    const parsed = stored ? JSON.parse(stored) : {}
    return { ...DEFAULT_PREFERENCES, ...parsed }
  })

  // Icon State
  const [iconSet, setIconSet] = useState<IconSetType>(() => {
    return (localStorage.getItem('icon-set') as IconSetType) || 'default'
  })

  const [customIcons, setCustomIcons] = useState<Record<string, string>>(() => {
    const stored = localStorage.getItem('custom-icons')
    return stored ? JSON.parse(stored) : {}
  })

  // Notification Settings State
  const [notificationSettings, setNotificationSettings] = useState<
    ArenaNotificationSetting[]
  >(() => {
    const stored = localStorage.getItem('notification-settings')
    if (stored) return JSON.parse(stored)
    return MOCK_CLIENTS.map((client) => ({
      arenaId: client.id,
      events: {
        statusChange: true,
        newComment: true,
        assignmentChange: false,
      },
      channels: {
        inApp: true,
        email: false,
      },
    }))
  })

  // Persistence Effects (Only for non-Supabase data or preferences)
  useEffect(() => {
    localStorage.setItem('kb-subscriptions', JSON.stringify(subscriptions))
  }, [subscriptions])

  useEffect(() => {
    localStorage.setItem('app-notifications', JSON.stringify(notifications))
  }, [notifications])

  useEffect(() => {
    localStorage.setItem('nav-order', JSON.stringify(navOrder))
  }, [navOrder])

  useEffect(() => {
    localStorage.setItem('nav-preferences', JSON.stringify(navPreferences))
  }, [navPreferences])

  useEffect(() => {
    localStorage.setItem('icon-set', iconSet)
  }, [iconSet])

  useEffect(() => {
    localStorage.setItem('custom-icons', JSON.stringify(customIcons))
  }, [customIcons])

  useEffect(() => {
    localStorage.setItem(
      'notification-settings',
      JSON.stringify(notificationSettings),
    )
  }, [notificationSettings])

  // Auth
  const login = (email: string) => {
    // If Supabase is configured, this is handled via auth UI mostly, but for mock fallback:
    // Check if it's the specific admin email
    const isAdmin = email === 'allantomazela@gamail.com'
    const role = isAdmin ? 'admin' : 'agent'

    const mockUser = {
      ...MOCK_USER,
      email,
      role: role as UserRole,
      name: email.split('@')[0],
    }
    setUser(mockUser)

    if (!isSupabase) {
      localStorage.setItem('mock-user', JSON.stringify(mockUser))
    }

    logSystemEvent(`Mock login for ${email}`, 'info', 'Auth')
  }

  const logout = async () => {
    if (isSupabase && supabase) {
      await supabase.auth.signOut()
    }
    setUser(null)

    if (!isSupabase) {
      localStorage.removeItem('mock-user')
    }

    logSystemEvent('User logged out', 'info', 'Auth')
  }

  // Helper to trigger notifications
  const notifySubscribers = (article: KnowledgeArticle) => {
    if (!user) return
    // ... logic same as before (local for now)
  }

  // User Management
  const updateUserRole = (id: string, role: UserRole) => {
    // Update local state for mock
    setUsersList((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)))
    // If updating self, update current user state
    if (user && user.id === id) {
      setUser({ ...user, role })
    }
    // If supabase, update profile
    if (isSupabase && supabase) {
      supabase.from('profiles').update({ role }).eq('id', id)
    }
  }

  const updateUserProfileImage = (imageUrl: string) => {
    if (user) {
      setUser({ ...user, avatar: imageUrl })
      // Update in users list as well
      setUsersList((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, avatar: imageUrl } : u)),
      )
      // Supabase storage logic would go here
    }
  }

  // Client CRUD
  const addClient = async (data: Omit<Client, 'id' | 'active'>) => {
    // Permission check
    if (user?.role !== 'admin' && user?.role !== 'coordinator') {
      logSystemEvent(
        'Unauthorized client creation attempt',
        'warning',
        'Security',
      )
      return // Or throw error
    }

    const newClient: Client = {
      ...data,
      id: `c${Date.now()}`,
      active: true,
    }
    if (isSupabase && supabase) {
      const { data: saved, error } = await supabase
        .from('clients')
        .insert(newClient)
        .select()
        .single()
      if (!error && saved) {
        setClients((prev) => [...prev, saved])
        logSystemEvent(`Client created: ${newClient.name}`, 'info', 'Data')
      }
    } else {
      setClients((prev) => [...prev, newClient])
    }
  }

  const updateClient = async (id: string, data: Partial<Client>) => {
    if (isSupabase && supabase) {
      await supabase.from('clients').update(data).eq('id', id)
      setClients((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...data } : c)),
      )
    } else {
      setClients((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...data } : c)),
      )
    }
  }

  const toggleClientStatus = async (id: string) => {
    const client = clients.find((c) => c.id === id)
    if (client) {
      if (isSupabase && supabase) {
        await supabase
          .from('clients')
          .update({ active: !client.active })
          .eq('id', id)
      }
      setClients((prev) =>
        prev.map((c) => (c.id === id ? { ...c, active: !c.active } : c)),
      )
    }
  }

  // Technician Management
  const addTechnician = (data: Omit<Technician, 'id'>) => {
    const newTechnician: Technician = {
      ...data,
      id: `tech-${Date.now()}`,
    }
    setTechnicians((prev) => [...prev, newTechnician])
  }

  const updateTechnician = (id: string, data: Partial<Technician>) => {
    setTechnicians((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...data } : t)),
    )
  }

  const toggleTechnicianStatus = (id: string) => {
    setTechnicians((prev) =>
      prev.map((t) => (t.id === id ? { ...t, active: !t.active } : t)),
    )
  }

  // Ticket CRUD
  const addTicket = async (
    data: Omit<
      Ticket,
      'id' | 'createdAt' | 'updatedAt' | 'responsibleId' | 'responsibleName'
    >,
  ) => {
    if (!user) return
    const client = clients.find((c) => c.id === data.clientId)
    const newTicket = {
      ...data,
      id: `t${Date.now()}`,
      created_at: new Date().toISOString(), // DB expects snake_case
      updated_at: new Date().toISOString(),
      responsibleId: user.id,
      responsibleName: user.name,
      clientName: client ? client.name : 'Unknown',
      attachments: data.attachments || [],
    }

    if (isSupabase && supabase) {
      const { data: saved, error } = await supabase
        .from('tickets')
        .insert(newTicket)
        .select()
        .single()
      if (!error && saved) {
        const mapped = {
          ...saved,
          createdAt: saved.created_at,
          updatedAt: saved.updated_at,
        }
        setTickets((prev) => [mapped as any, ...prev])
        logSystemEvent(`Ticket created: ${newTicket.id}`, 'info', 'Data')
      } else if (error) {
        logSystemEvent('Error creating ticket', 'error', 'Database', { error })
      }
    } else {
      // Local mock needs camelCase
      const localTicket: Ticket = {
        ...data,
        id: newTicket.id,
        createdAt: newTicket.created_at,
        updatedAt: newTicket.updated_at,
        responsibleId: newTicket.responsibleId,
        responsibleName: newTicket.responsibleName,
        clientName: newTicket.clientName,
        attachments: newTicket.attachments,
      }
      setTickets((prev) => [localTicket, ...prev])
    }
  }

  const updateTicket = async (id: string, data: Partial<Ticket>) => {
    const timestamp = new Date().toISOString()
    const updateData = { ...data, updatedAt: timestamp }
    const dbUpdateData = { ...data, updated_at: timestamp }

    if (isSupabase && supabase) {
      const { error } = await supabase
        .from('tickets')
        .update(dbUpdateData)
        .eq('id', id)
      if (error) {
        logSystemEvent(`Error updating ticket ${id}`, 'error', 'Database', {
          error,
        })
        return
      }
      setTickets((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...updateData } : t)),
      )
    } else {
      setTickets((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...updateData } : t)),
      )
    }
  }

  // KB Permissions
  const getKBPermissions = (authorId?: string): KBPermissions => {
    if (!user) {
      return {
        canView: false,
        canCreate: false,
        canEdit: false,
        canDelete: false,
        canManageCategories: false,
        canViewHistory: false,
        canRestore: false,
      }
    }
    const { role, name } = user
    if (role === 'admin') {
      return {
        canView: true,
        canCreate: true,
        canEdit: true,
        canDelete: true,
        canManageCategories: true,
        canViewHistory: true,
        canRestore: true,
      }
    }
    if (role === 'coordinator') {
      return {
        canView: true,
        canCreate: true,
        canEdit: true,
        canDelete: false,
        canManageCategories: false,
        canViewHistory: true,
        canRestore: true,
      }
    }
    const isAuthor = authorId === name
    return {
      canView: true,
      canCreate: true,
      canEdit: !!isAuthor,
      canDelete: false,
      canManageCategories: false,
      canViewHistory: !!isAuthor,
      canRestore: !!isAuthor,
    }
  }

  // KB CRUD
  const addArticle = async (
    article: Omit<
      KnowledgeArticle,
      'id' | 'createdAt' | 'updatedAt' | 'views' | 'helpfulCount' | 'versions'
    >,
  ) => {
    const timestamp = new Date().toISOString()
    const newArticle = {
      ...article,
      id: `kb${Date.now()}`,
      created_at: timestamp,
      updated_at: timestamp,
      views: 0,
      helpfulCount: 0,
      versions: [],
    }

    if (isSupabase && supabase) {
      const { data: saved, error } = await supabase
        .from('knowledge_articles')
        .insert(newArticle)
        .select()
        .single()
      if (!error && saved) {
        const mapped = {
          ...saved,
          createdAt: saved.created_at,
          updatedAt: saved.updated_at,
        }
        setKnowledgeArticles((prev) => [mapped as any, ...prev])
      }
    } else {
      const localArticle: KnowledgeArticle = {
        ...article,
        id: newArticle.id,
        createdAt: timestamp,
        updatedAt: timestamp,
        views: 0,
        helpfulCount: 0,
        versions: [],
      }
      setKnowledgeArticles((prev) => [localArticle, ...prev])
    }
  }

  const updateArticle = async (id: string, data: Partial<KnowledgeArticle>) => {
    const existing = knowledgeArticles.find((a) => a.id === id)
    if (!existing) return

    const timestamp = new Date().toISOString()
    const updatedArticle = {
      ...existing,
      ...data,
      updatedAt: timestamp,
      versions: [
        ...(existing.versions || []),
        {
          id: `v${Date.now()}`,
          articleId: existing.id,
          title: existing.title,
          content: existing.content,
          excerpt: existing.excerpt,
          updatedAt: existing.updatedAt,
          updatedBy: existing.author,
          versionNumber: (existing.versions?.length || 0) + 1,
        },
      ],
    }

    const dbUpdate = {
      ...data,
      updated_at: timestamp,
      // We don't save versions to DB column in this simple schema, usually versions are a separate table
      // But for simplicity in this demo we keep versions local-ish or assume JSON column if we updated schema
      // Since schema doesn't have 'versions', persistence of history is limited to session/local unless we add table
      // For now, we update the main article fields
    }

    if (isSupabase && supabase) {
      await supabase.from('knowledge_articles').update(dbUpdate).eq('id', id)
      // Note: Full version history requires a separate table 'article_versions' which we didn't add to schema for brevity
      // We'll update local state to show it works in session
      setKnowledgeArticles((prev) =>
        prev.map((a) => (a.id === id ? updatedArticle : a)),
      )
    } else {
      setKnowledgeArticles((prev) =>
        prev.map((a) => (a.id === id ? updatedArticle : a)),
      )
    }
    notifySubscribers(updatedArticle)
  }

  const restoreArticleVersion = async (
    articleId: string,
    versionId: string,
  ) => {
    const article = knowledgeArticles.find((a) => a.id === articleId)
    if (article && article.versions) {
      const ver = article.versions.find((v) => v.id === versionId)
      if (ver) {
        const restored = {
          ...article,
          title: ver.title,
          content: ver.content,
          excerpt: ver.excerpt,
          updatedAt: new Date().toISOString(),
        }
        if (isSupabase && supabase) {
          await supabase
            .from('knowledge_articles')
            .update({
              title: restored.title,
              content: restored.content,
              excerpt: restored.excerpt,
              updated_at: restored.updatedAt,
            })
            .eq('id', articleId)
        }
        setKnowledgeArticles((prev) =>
          prev.map((a) => (a.id === articleId ? restored : a)),
        )
      }
    }
  }

  const deleteArticle = async (id: string) => {
    if (isSupabase && supabase) {
      await supabase.from('knowledge_articles').delete().eq('id', id)
    }
    setKnowledgeArticles((prev) => prev.filter((a) => a.id !== id))
  }

  const addCategory = async (category: Omit<KnowledgeCategory, 'id'>) => {
    const newCategory = { ...category, id: `cat${Date.now()}` }
    if (isSupabase && supabase) {
      await supabase.from('knowledge_categories').insert(newCategory)
    }
    setKnowledgeCategories((prev) => [...prev, newCategory])
  }

  const updateCategory = async (
    id: string,
    data: Partial<KnowledgeCategory>,
  ) => {
    if (isSupabase && supabase) {
      await supabase.from('knowledge_categories').update(data).eq('id', id)
    }
    setKnowledgeCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...data } : c)),
    )
    if (data.name) {
      setKnowledgeArticles((prev) =>
        prev.map((a) =>
          a.categoryId === id ? { ...a, categoryName: data.name! } : a,
        ),
      )
    }
  }

  const deleteCategory = async (id: string) => {
    if (isSupabase && supabase) {
      await supabase.from('knowledge_categories').delete().eq('id', id)
    }
    setKnowledgeCategories((prev) => prev.filter((c) => c.id !== id))
  }

  // Subscription Actions
  const subscribe = (
    type: 'article' | 'category',
    targetId: string,
    targetName: string,
  ) => {
    if (!user) return
    const newSub: KBSubscription = {
      id: `sub-${Date.now()}`,
      userId: user.id,
      type,
      targetId,
      targetName,
    }
    setSubscriptions((prev) => [...prev, newSub])
  }

  const unsubscribe = (id: string) => {
    setSubscriptions((prev) => prev.filter((s) => s.id !== id))
  }

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    )
  }

  const clearNotifications = () => {
    setNotifications([])
  }

  // Other Actions
  const updateNavOrder = (order: NavItemId[]) => {
    setNavOrder(order)
  }

  const updateNavPreference = (id: NavItemId, pref: Partial<NavPreference>) => {
    setNavPreferences((prev) => ({
      ...prev,
      [id]: { ...prev[id], ...pref },
    }))
  }

  const updateIconSet = (set: IconSetType) => {
    setIconSet(set)
  }

  const uploadCustomIcon = (id: string, url: string) => {
    setCustomIcons((prev) => ({ ...prev, [id]: url }))
  }

  const resetCustomIcon = (id: string) => {
    setCustomIcons((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }

  const updateNotificationSetting = (
    arenaId: string,
    setting: Partial<ArenaNotificationSetting>,
  ) => {
    setNotificationSettings((prev) => {
      const exists = prev.find((s) => s.arenaId === arenaId)
      if (exists) {
        return prev.map((s) =>
          s.arenaId === arenaId
            ? {
                ...s,
                ...setting,
                events: { ...s.events, ...setting.events },
                channels: { ...s.channels, ...setting.channels },
              }
            : s,
        )
      } else {
        return [
          ...prev,
          {
            arenaId,
            events: {
              statusChange: true,
              newComment: true,
              assignmentChange: false,
              ...setting.events,
            },
            channels: {
              inApp: true,
              email: false,
              ...setting.channels,
            },
          },
        ]
      }
    })
  }

  const logEvent = (
    message: string,
    severity?: LogSeverity,
    source?: string,
  ) => {
    logSystemEvent(message, severity, source)
  }

  const getTicketById = (id: string) => tickets.find((t) => t.id === id)
  const getClientById = (id: string) => clients.find((c) => c.id === id)
  const getArticleById = (id: string) =>
    knowledgeArticles.find((a) => a.id === id)

  return (
    <AppContext.Provider
      value={{
        user,
        isLoading,
        usersList,
        clients,
        tickets,
        technicians,
        knowledgeArticles,
        knowledgeCategories,
        login,
        logout,
        addClient,
        updateClient,
        toggleClientStatus,
        addTicket,
        updateTicket,
        getTicketById,
        getClientById,
        getArticleById,
        // User Management
        updateUserRole,
        updateUserProfileImage,
        // Technician Management
        addTechnician,
        updateTechnician,
        toggleTechnicianStatus,
        // KB Exports
        addArticle,
        updateArticle,
        deleteArticle,
        addCategory,
        updateCategory,
        deleteCategory,
        restoreArticleVersion,
        getKBPermissions,
        // Subscriptions & Notifications
        subscriptions,
        notifications,
        subscribe,
        unsubscribe,
        markNotificationAsRead,
        clearNotifications,
        // Other Exports
        navOrder,
        navPreferences,
        updateNavOrder,
        updateNavPreference,
        iconSet,
        updateIconSet,
        customIcons,
        uploadCustomIcon,
        resetCustomIcon,
        customFields,
        notificationSettings,
        updateNotificationSetting,
        logEvent,
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
