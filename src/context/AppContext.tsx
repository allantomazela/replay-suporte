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
} from '@/types'
import {
  MOCK_CLIENTS,
  MOCK_TICKETS,
  MOCK_USER,
  MOCK_CUSTOM_FIELDS,
  MOCK_KNOWLEDGE_ARTICLES,
  MOCK_KNOWLEDGE_CATEGORIES,
} from '@/lib/mock-data'
import { DEFAULT_NAV_ORDER, NavItemId } from '@/lib/nav-config'

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
  clients: Client[]
  tickets: Ticket[]
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
  profile: { id: 'profile', visible: true, mobileVisible: true },
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [clients, setClients] = useState<Client[]>(MOCK_CLIENTS)
  const [tickets, setTickets] = useState<Ticket[]>(MOCK_TICKETS)
  const [customFields, setCustomFields] =
    useState<CustomFieldDefinition[]>(MOCK_CUSTOM_FIELDS)

  // Knowledge Base State
  const [knowledgeArticles, setKnowledgeArticles] = useState<
    KnowledgeArticle[]
  >(() => {
    const stored = localStorage.getItem('kb-articles')
    return stored ? JSON.parse(stored) : MOCK_KNOWLEDGE_ARTICLES
  })
  const [knowledgeCategories, setKnowledgeCategories] = useState<
    KnowledgeCategory[]
  >(() => {
    const stored = localStorage.getItem('kb-categories')
    return stored ? JSON.parse(stored) : MOCK_KNOWLEDGE_CATEGORIES
  })

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

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem('kb-articles', JSON.stringify(knowledgeArticles))
  }, [knowledgeArticles])

  useEffect(() => {
    localStorage.setItem('kb-categories', JSON.stringify(knowledgeCategories))
  }, [knowledgeCategories])

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
    setUser({ ...MOCK_USER, email })
  }

  const logout = () => {
    setUser(null)
  }

  // Helper to trigger notifications
  const notifySubscribers = (article: KnowledgeArticle) => {
    // Find matching subscriptions (for all users - simplified for this mock, assuming single user context but checking "userId" theoretically)
    // In a real app, this runs on backend. Here we simulate notifications for the CURRENT user if they are subscribed.
    if (!user) return

    const relevantSubs = subscriptions.filter(
      (sub) =>
        (sub.type === 'article' && sub.targetId === article.id) ||
        (sub.type === 'category' && sub.targetId === article.categoryId),
    )

    if (relevantSubs.length > 0) {
      const newNotification: AppNotification = {
        id: `notif-${Date.now()}`,
        userId: user.id,
        title: 'Artigo Atualizado',
        message: `O artigo "${article.title}" foi atualizado.`,
        link: `/knowledge-base/articles/${article.id}`,
        read: false,
        createdAt: new Date().toISOString(),
      }
      setNotifications((prev) => [newNotification, ...prev])
    }
  }

  // Client CRUD
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

  // Ticket CRUD
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
    if (role === 'agent') {
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
    return {
      canView: true,
      canCreate: false,
      canEdit: false,
      canDelete: false,
      canManageCategories: false,
      canViewHistory: false,
      canRestore: false,
    }
  }

  // KB CRUD
  const addArticle = (
    article: Omit<
      KnowledgeArticle,
      'id' | 'createdAt' | 'updatedAt' | 'views' | 'helpfulCount' | 'versions'
    >,
  ) => {
    const newArticle: KnowledgeArticle = {
      ...article,
      id: `kb${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      views: 0,
      helpfulCount: 0,
      versions: [],
    }
    setKnowledgeArticles((prev) => [newArticle, ...prev])
  }

  const updateArticle = (id: string, data: Partial<KnowledgeArticle>) => {
    setKnowledgeArticles((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          const updatedArticle = {
            ...a,
            ...data,
            updatedAt: new Date().toISOString(),
            versions: [
              ...(a.versions || []),
              {
                id: `v${Date.now()}`,
                articleId: a.id,
                title: a.title,
                content: a.content,
                excerpt: a.excerpt,
                updatedAt: a.updatedAt,
                updatedBy: a.author,
                versionNumber: (a.versions?.length || 0) + 1,
              },
            ],
          }
          // Notify after update
          notifySubscribers(updatedArticle)
          return updatedArticle
        }
        return a
      }),
    )
  }

  const restoreArticleVersion = async (
    articleId: string,
    versionId: string,
  ) => {
    setKnowledgeArticles((prev) =>
      prev.map((a) => {
        if (a.id === articleId && a.versions) {
          const versionToRestore = a.versions.find((v) => v.id === versionId)
          if (versionToRestore) {
            const currentSnapshot: KnowledgeArticleVersion = {
              id: `v${Date.now()}`,
              articleId: a.id,
              title: a.title,
              content: a.content,
              excerpt: a.excerpt,
              updatedAt: a.updatedAt,
              updatedBy: user?.name || 'Sistema',
              versionNumber: a.versions.length + 1,
            }
            const restoredArticle = {
              ...a,
              title: versionToRestore.title,
              content: versionToRestore.content,
              excerpt: versionToRestore.excerpt,
              updatedAt: new Date().toISOString(),
              versions: [...a.versions, currentSnapshot],
            }
            notifySubscribers(restoredArticle)
            return restoredArticle
          }
        }
        return a
      }),
    )
  }

  const deleteArticle = (id: string) => {
    setKnowledgeArticles((prev) => prev.filter((a) => a.id !== id))
  }

  const addCategory = (category: Omit<KnowledgeCategory, 'id'>) => {
    const newCategory: KnowledgeCategory = {
      ...category,
      id: `cat${Date.now()}`,
    }
    setKnowledgeCategories((prev) => [...prev, newCategory])
  }

  const updateCategory = (id: string, data: Partial<KnowledgeCategory>) => {
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

  const deleteCategory = (id: string) => {
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

  const getTicketById = (id: string) => tickets.find((t) => t.id === id)
  const getClientById = (id: string) => clients.find((c) => c.id === id)
  const getArticleById = (id: string) =>
    knowledgeArticles.find((a) => a.id === id)

  return (
    <AppContext.Provider
      value={{
        user,
        clients,
        tickets,
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
