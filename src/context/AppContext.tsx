import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from 'react'
import { useRealtime } from '@/hooks/use-realtime'
import {
  Client,
  Ticket,
  User,
  CustomFieldDefinition,
  ArenaNotificationSetting,
  KnowledgeArticle,
  KnowledgeCategory,
  KBSubscription,
  AppNotification,
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
import { clearAllCache, invalidateAllQueries } from '@/lib/react-query'

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
  toggleClientStatus: (id: string) => Promise<void>
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
  updateUserRole: (id: string, role: UserRole) => void
  updateUserProfileImage: (imageUrl: string) => Promise<void>
  updateUserProfile: (data: { name?: string; avatar?: string }) => Promise<void>
  addTechnician: (technician: Omit<Technician, 'id'>) => Promise<void>
  updateTechnician: (id: string, data: Partial<Technician>) => Promise<void>
  toggleTechnicianStatus: (id: string) => Promise<void>
  deleteTechnician: (id: string) => Promise<void>
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
  navOrder: NavItemId[]
  navPreferences: Record<NavItemId, NavPreference>
  updateNavOrder: (order: NavItemId[]) => void
  updateNavPreference: (id: NavItemId, pref: Partial<NavPreference>) => void
  iconSet: IconSetType
  updateIconSet: (set: IconSetType) => void
  customIcons: Record<string, string>
  uploadCustomIcon: (id: string, url: string) => void
  resetCustomIcon: (id: string, url: string) => void
  customFields: CustomFieldDefinition[]
  notificationSettings: ArenaNotificationSetting[]
  updateNotificationSetting: (
    arenaId: string,
    setting: Partial<ArenaNotificationSetting>,
  ) => void
  logEvent: (message: string, severity?: LogSeverity, source?: string) => void
  checkSession: () => Promise<void>
  clearAllData: () => void
  refreshData: () => Promise<void>
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
  // Se Supabase está configurado, inicializar com arrays vazios (dados virão do banco)
  // Se não está configurado, usar dados mock
  const [usersList, setUsersList] = useState<User[]>(isSupabase ? [] : MOCK_USERS_LIST)
  const [clients, setClients] = useState<Client[]>(isSupabase ? [] : MOCK_CLIENTS)
  const [tickets, setTickets] = useState<Ticket[]>(isSupabase ? [] : MOCK_TICKETS)
  const [technicians, setTechnicians] = useState<Technician[]>(isSupabase ? [] : MOCK_TECHNICIANS)
  const [customFields] = useState<CustomFieldDefinition[]>(MOCK_CUSTOM_FIELDS)

  // Knowledge Base State
  const [knowledgeArticles, setKnowledgeArticles] = useState<
    KnowledgeArticle[]
  >(isSupabase ? [] : MOCK_KNOWLEDGE_ARTICLES)
  const [knowledgeCategories, setKnowledgeCategories] = useState<
    KnowledgeCategory[]
  >(isSupabase ? [] : MOCK_KNOWLEDGE_CATEGORIES)

  // Centralized data fetching
  const refreshData = useCallback(async () => {
    if (!isSupabase || !supabase) return

    try {
      const start = performance.now()

      // Parallel data fetching for efficiency with timeout
      const fetchWithTimeout = (promise: Promise<any>, timeout = 8000) => {
        return Promise.race([
          promise,
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Request timeout')), timeout),
          ),
        ])
      }

      // Helper para tratar erros de rede de forma silenciosa
      const safeFetch = async (promise: Promise<any>, resourceName: string) => {
        try {
          return await fetchWithTimeout(promise, 8000)
        } catch (e: any) {
          // Ignorar erros de conexão HTTP2/network (são geralmente temporários)
          const errorMsg = e?.message || String(e || '')
          if (errorMsg.includes('ERR_HTTP2_PROTOCOL_ERROR') ||
              errorMsg.includes('ERR_CONNECTION_CLOSED') ||
              errorMsg.includes('ERR_CONNECTION_RESET') ||
              errorMsg.includes('Failed to fetch')) {
            if (import.meta.env.DEV) {
              console.warn(`[AppContext] Network error fetching ${resourceName} (non-critical):`, errorMsg)
            }
            return { data: null, error: null } // Retornar vazio em vez de erro
          }
          throw e // Re-throw outros erros
        }
      }

      // Otimização: Selecionar apenas colunas necessárias
      // Usar safeFetch para tratar erros de rede de forma mais robusta
      const [clientsRes, ticketsRes, catsRes, artsRes, techsRes] = await Promise.all([
        safeFetch(
          supabase
            .from('clients')
            .select('id, name, city, phone, arenaCode, arenaName, active, contractType, technicalManager, created_at'),
          'clients'
        ).catch((e) => {
          if (import.meta.env.DEV) {
            console.warn('Failed to fetch clients:', e)
          }
          return { data: null, error: e }
        }),
        safeFetch(
          supabase
            .from('tickets')
            .select('id, clientId, clientName, title, description, status, responsibleId, responsibleName, solutionSteps, attachments, customData, created_at, updated_at'),
          'tickets'
        ).catch((e) => {
          if (import.meta.env.DEV) {
            console.warn('Failed to fetch tickets:', e)
          }
          return { data: null, error: e }
        }),
        safeFetch(
          supabase
            .from('knowledge_categories')
            .select('id, name, description'),
          'knowledge_categories'
        ).catch((e) => {
          if (import.meta.env.DEV) {
            console.warn('Failed to fetch categories:', e)
          }
          return { data: null, error: e }
        }),
        safeFetch(
          supabase
            .from('knowledge_articles')
            .select('id, title, excerpt, content, categoryId, categoryName, author, tags, views, helpfulCount, isPublic, created_at, updated_at'),
          'knowledge_articles'
        ).catch((e) => {
          if (import.meta.env.DEV) {
            console.warn('Failed to fetch articles:', e)
          }
          return { data: null, error: e }
        }),
        safeFetch(
          supabase
            .from('technicians')
            .select('id, name, email, phone, specialties, active, service_radius, cpf_cnpj, birth_date, cep, state, city, neighborhood, address, address_number, complement, experience_years, certifications, notes, created_at, updated_at'),
          'technicians'
        ).catch((e) => {
          if (import.meta.env.DEV) {
            console.warn('Failed to fetch technicians:', e)
          }
          return { data: null, error: e }
        }),
      ])

      // Atualizar ou limpar estados baseado nos dados retornados
      // Lógica:
      // - Se retornar array vazio [], limpa o estado (banco vazio)
      // - Se retornar null (erro de rede), limpa o estado (assumindo banco vazio após limpeza)
      // - Se retornar dados, atualiza o estado
      // - Se retornar undefined, mantém estado atual (não deve acontecer, mas por segurança)
      
      // Verificar se todas as requisições falharam (todas retornaram null)
      const allFailed = 
        clientsRes.data === null &&
        ticketsRes.data === null &&
        catsRes.data === null &&
        artsRes.data === null &&
        techsRes.data === null

      // Se todas falharam, limpar tudo (banco provavelmente está vazio)
      if (allFailed) {
        if (import.meta.env.DEV) {
          console.log('[AppContext] Todas as requisições falharam, limpando dados (banco provavelmente vazio)')
        }
        setClients([])
        setTickets([])
        setKnowledgeCategories([])
        setKnowledgeArticles([])
        setTechnicians([])
      } else {
        // Atualizar individualmente cada estado
        if (clientsRes.data !== null && clientsRes.data !== undefined) {
          setClients(clientsRes.data)
        } else if (clientsRes.data === null) {
          // Erro de rede específico para clients, limpar
          setClients([])
        }

        if (ticketsRes.data !== null && ticketsRes.data !== undefined) {
          const mappedTickets = ticketsRes.data.map((t) => ({
            ...t,
            createdAt: t.created_at,
            updatedAt: t.updated_at,
          })) as Ticket[]
          setTickets(mappedTickets)
        } else if (ticketsRes.data === null) {
          // Erro de rede específico para tickets, limpar
          setTickets([])
        }

        if (catsRes.data !== null && catsRes.data !== undefined) {
          setKnowledgeCategories(catsRes.data)
        } else if (catsRes.data === null) {
          // Erro de rede específico para categories, limpar
          setKnowledgeCategories([])
        }

        if (artsRes.data !== null && artsRes.data !== undefined) {
          const mappedArts = artsRes.data.map((a) => ({
            ...a,
            createdAt: a.created_at,
            updatedAt: a.updated_at,
          })) as KnowledgeArticle[]
          setKnowledgeArticles(mappedArts)
        } else if (artsRes.data === null) {
          // Erro de rede específico para articles, limpar
          setKnowledgeArticles([])
        }

        if (techsRes.data !== null && techsRes.data !== undefined) {
          setTechnicians(
            (techsRes.data as any[]).map((t) => ({
              ...t,
              serviceRadius: t.service_radius,
              cpfCnpj: t.cpf_cnpj,
              birthDate: t.birth_date,
              addressNumber: t.address_number,
              experienceYears: t.experience_years,
            })) as Technician[]
          )
        } else if (techsRes.data === null) {
          // Erro de rede específico para technicians, limpar
          setTechnicians([])
        }
      }

      const end = performance.now()
      if (import.meta.env.DEV) {
        console.log(`Data refresh completed in ${(end - start).toFixed(0)}ms`)
      }
    } catch (error) {
      console.error('Failed to refresh data', error)
    }
  }, [isSupabase])

  // Handle user session setup
  const handleSession = useCallback(async (sessionUser: any) => {
    if (!sessionUser) return null

    try {
      // Fetch Role from profiles com timeout para não travar
      const profilePromise = supabase!
        .from('profiles')
        .select('role')
        .eq('id', sessionUser.id)
        .single()

      const timeoutPromise = new Promise((resolve) => {
        setTimeout(() => resolve({ data: null, error: null }), 2000)
      })

      const { data: profile, error: profileError } = (await Promise.race([
        profilePromise,
        timeoutPromise,
      ])) as any

      if (profileError && import.meta.env.DEV) {
        console.warn('[AppContext] Profile fetch error (non-blocking):', profileError)
      }

      // Check if it's a super admin email
      // Admin emails devem ser configurados via variável de ambiente
      // Formato: VITE_ADMIN_EMAILS=email1@example.com,email2@example.com
      const adminEmails = import.meta.env.VITE_ADMIN_EMAILS
        ? import.meta.env.VITE_ADMIN_EMAILS.split(',').map((e: string) =>
            e.trim(),
          )
        : []
      // Fallback para email único (retrocompatibilidade)
      const singleAdminEmail = import.meta.env.VITE_ADMIN_EMAIL
      if (singleAdminEmail) {
        adminEmails.push(singleAdminEmail.trim())
      }
      
      // Email hardcoded removido - usar apenas variáveis de ambiente
      // Se nenhum email de admin estiver configurado, logar warning em dev
      if (adminEmails.length === 0 && import.meta.env.DEV) {
        console.warn(
          '[AppContext] Nenhum email de admin configurado. Configure VITE_ADMIN_EMAIL ou VITE_ADMIN_EMAILS',
        )
      }

      const isAdminEmail =
        sessionUser.email && adminEmails.includes(sessionUser.email)
      const role = isAdminEmail ? 'admin' : profile?.role || 'agent'

      const mappedUser = {
        id: sessionUser.id,
        name: sessionUser.user_metadata.full_name || sessionUser.email,
        email: sessionUser.email || '',
        role: role,
        avatar: sessionUser.user_metadata.avatar_url,
      }

      return mappedUser
    } catch (error) {
      console.error('Error handling session:', error)
      return {
        id: sessionUser.id,
        name: sessionUser.email,
        email: sessionUser.email || '',
        role: 'agent' as UserRole,
        avatar: null,
      }
    }
  }, [])

  // Explicit session check for Login to call
  const checkSession = useCallback(async () => {
    if (!isSupabase || !supabase) {
      setUser(null)
      return
    }

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session?.user) {
        // Não aguardar handleSession para não travar - setar user imediatamente
        const userData = await handleSession(session.user).catch((e) => {
          console.error('Error in handleSession, using fallback:', e)
          // Fallback se handleSession falhar
          return {
            id: session.user.id,
            name: session.user.user_metadata.full_name || session.user.email,
            email: session.user.email || '',
            role: 'agent' as UserRole,
            avatar: session.user.user_metadata.avatar_url,
          }
        })

        if (userData) {
          setUser(userData)
          // Don't await data refresh for session check to be fast
          refreshData().catch((e) =>
            console.error('Background data refresh failed', e),
          )
        }
      } else {
        setUser(null)
      }
    } catch (e) {
      console.error('Session check failed', e)
      setUser(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSupabase]) // Removido handleSession e refreshData para evitar loop infinito

  // Initialization Effect
  useEffect(() => {
    let mounted = true
    let timeoutId: NodeJS.Timeout | null = null

    const initialize = async () => {
      if (import.meta.env.DEV) {
        console.log('[AppContext] Starting initialization...')
      }
      setIsLoading(true)

      // Timeout de segurança: força setIsLoading(false) após 5 segundos
      timeoutId = setTimeout(() => {
        if (mounted) {
          console.warn('[AppContext] Initialization timeout - forcing loading to false')
          setIsLoading(false)
        }
      }, 5000)

      try {
        if (isSupabase && supabase) {
          if (import.meta.env.DEV) {
            console.log('[AppContext] Supabase configured, checking session...')
          }
          try {
            // 1. Get initial session com timeout de 3 segundos para carregar rápido
            const sessionPromise = supabase.auth.getSession()
            const timeoutPromise = new Promise((resolve) => {
              setTimeout(() => {
                resolve({ data: { session: null }, error: null })
              }, 3000)
            })

            const {
              data: { session },
              error: sessionError,
            } = (await Promise.race([sessionPromise, timeoutPromise])) as any

            if (sessionError) {
              console.error('[AppContext] Session error:', sessionError)
            }

            if (session?.user && mounted) {
              if (import.meta.env.DEV) {
                console.log('[AppContext] Session found, handling user...')
              }
              const userData = await handleSession(session.user)
              if (mounted && userData) {
                setUser(userData)
                // Only fetch data if we have a user (não aguardar para não travar)
                refreshData().catch((e) =>
                  console.error('[AppContext] Background data refresh failed', e),
                )
              }
            } else if (mounted) {
              if (import.meta.env.DEV) {
                console.log('[AppContext] No session found, setting user to null')
              }
              setUser(null)
            }
          } catch (error) {
            console.error('[AppContext] Initialization error:', error)
            if (mounted) setUser(null)
          }
        } else {
          if (import.meta.env.DEV) {
            console.log('[AppContext] Supabase not configured, using mock mode')
          }
          // Fallback for mock mode
          const storedUser = localStorage.getItem('mock-user')
          if (storedUser && mounted) {
            try {
              setUser(JSON.parse(storedUser))
            } catch (e) {
              console.error('[AppContext] Failed to restore mock user', e)
            }
          }
          // Load other mock data from storage if needed
          const storedArticles = localStorage.getItem('kb-articles')
          if (storedArticles && mounted)
            setKnowledgeArticles(JSON.parse(storedArticles))
        }
      } catch (error) {
        console.error('[AppContext] Unexpected initialization error:', error)
      } finally {
        // Sempre define loading como false, mesmo se houver erro
        if (timeoutId) clearTimeout(timeoutId)
        if (mounted) {
          if (import.meta.env.DEV) {
            console.log('[AppContext] Initialization complete, setting loading to false')
          }
          setIsLoading(false)
        }
      }
    }

    initialize()

    // Setup listener for auth changes
    let authListener: any = null

    if (isSupabase && supabase) {
      const { data } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          // Log sempre para debug
          console.log(`[AppContext] Auth event: ${event}`, session?.user?.email)
          
          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            if (session?.user) {
              console.log('[AppContext] Processing SIGNED_IN, setting user immediately...')
              
              // Setar user IMEDIATAMENTE com dados básicos (não bloquear)
              const immediateUser = {
                id: session.user.id,
                name: session.user.user_metadata.full_name || session.user.email,
                email: session.user.email || '',
                role: 'agent' as UserRole, // Será atualizado depois se necessário
                avatar: session.user.user_metadata.avatar_url,
              }
              setUser(immediateUser)
              console.log('[AppContext] User set immediately:', immediateUser.email)

              // Atualizar com dados completos em background (não bloquear redirecionamento)
              handleSession(session.user)
                .then((userData) => {
                  if (userData) {
                    console.log('[AppContext] User data updated from handleSession')
                    setUser(userData)
                  }
                })
                .catch((e) => {
                  console.error('[AppContext] Error in handleSession (non-critical):', e)
                  // User já foi setado acima, então não precisa fazer nada
                })

              if (event === 'SIGNED_IN') {
                // Não aguardar refreshData
                refreshData().catch((e) =>
                  console.error('Background data refresh failed', e),
                )
              }
            }
          } else if (event === 'SIGNED_OUT') {
            console.log('[AppContext] SIGNED_OUT event')
            setUser(null)
            setTickets([])
          }
        },
      )
      authListener = data.subscription
      console.log('[AppContext] Auth state change listener registered')
    }

    return () => {
      mounted = false
      if (timeoutId) clearTimeout(timeoutId)
      if (authListener) authListener.unsubscribe()
      // Garante que loading seja false ao desmontar
      setIsLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSupabase]) // Removido user para evitar loop infinito

  // Setup realtime notifications usando hook customizado
  useRealtime({
    userId: user?.id,
    enabled: isSupabase && !!user,
    onNotification: (notification) => {
      setNotifications((prev) => [notification, ...prev])
    },
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

  // Auth Actions
  const login = (email: string) => {
    // Verificar se é admin usando variáveis de ambiente
    const adminEmails = import.meta.env.VITE_ADMIN_EMAILS
      ? import.meta.env.VITE_ADMIN_EMAILS.split(',').map((e: string) => e.trim())
      : []
    const singleAdminEmail = import.meta.env.VITE_ADMIN_EMAIL
    if (singleAdminEmail) {
      adminEmails.push(singleAdminEmail.trim())
    }
    const isAdmin = email && adminEmails.includes(email)
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
  }

  const logout = async () => {
    setIsLoading(true)
    if (isSupabase && supabase) {
      await supabase.auth.signOut()
    }
    setUser(null)

    if (!isSupabase) {
      localStorage.removeItem('mock-user')
    }
    setIsLoading(false)
  }

  // User Management
  const updateUserRole = (id: string, role: UserRole) => {
    setUsersList((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)))
    if (user && user.id === id) {
      setUser({ ...user, role })
    }
    if (isSupabase && supabase) {
      supabase.from('profiles').update({ role }).eq('id', id)
    }
  }

  const updateUserProfileImage = async (imageUrl: string) => {
    if (!user) return

    try {
      // Atualizar estado local imediatamente
      setUser({ ...user, avatar: imageUrl })
      setUsersList((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, avatar: imageUrl } : u)),
      )

      // Salvar no Supabase
      if (isSupabase && supabase) {
        const { error } = await supabase
          .from('profiles')
          .update({ avatar_url: imageUrl })
          .eq('id', user.id)

        if (error) {
          console.error('Erro ao salvar foto no Supabase:', error)
          throw error
        }

        // Atualizar também no auth.users metadata
        const { error: authError } = await supabase.auth.updateUser({
          data: { avatar_url: imageUrl },
        })

        if (authError) {
          console.warn('Erro ao atualizar metadata do auth:', authError)
        }
      }
    } catch (error) {
      console.error('Erro ao atualizar foto de perfil:', error)
      throw error
    }
  }

  const updateUserProfile = async (data: { name?: string; avatar?: string }) => {
    if (!user) return

    try {
      const updates: any = {}
      if (data.name) updates.full_name = data.name
      if (data.avatar) updates.avatar_url = data.avatar

      // Atualizar estado local
      if (data.name) {
        setUser({ ...user, name: data.name })
        setUsersList((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, name: data.name! } : u)),
        )
      }
      if (data.avatar) {
        setUser({ ...user, avatar: data.avatar })
        setUsersList((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, avatar: data.avatar! } : u)),
        )
      }

      // Salvar no Supabase
      if (isSupabase && supabase) {
        const { error } = await supabase
          .from('profiles')
          .update(updates)
          .eq('id', user.id)

        if (error) {
          console.error('Erro ao salvar perfil no Supabase:', error)
          throw error
        }

        // Atualizar também no auth.users metadata
        const authUpdates: any = {}
        if (data.name) authUpdates.full_name = data.name
        if (data.avatar) authUpdates.avatar_url = data.avatar

        if (Object.keys(authUpdates).length > 0) {
          const { error: authError } = await supabase.auth.updateUser({
            data: authUpdates,
          })

          if (authError) {
            console.warn('Erro ao atualizar metadata do auth:', authError)
          }
        }
      }
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error)
      throw error
    }
  }

  const addClient = async (data: Omit<Client, 'id' | 'active'>) => {
    const newClient: Client = {
      ...data,
      id: `c${Date.now()}`,
      active: true,
    }
    if (isSupabase && supabase) {
      try {
        console.log('[AppContext] Adding client:', newClient)
        const { data: saved, error } = await supabase
          .from('clients')
          .insert(newClient)
          .select()
          .single()
        
        if (error) {
          console.error('[AppContext] Error adding client:', error)
          throw new Error(error.message || 'Erro ao salvar cliente')
        }
        
        if (saved) {
          console.log('[AppContext] Client saved successfully:', saved)
          
          // Registrar no audit log
          const { logAudit } = await import('@/lib/audit-log')
          await logAudit('clients', saved.id, 'INSERT', {
            newData: saved,
            userId: user?.id,
            userEmail: user?.email,
          })
          
          setClients((prev) => [...prev, saved])
          // Recarregar dados para garantir sincronização
          refreshData().catch((e) =>
            console.error('Failed to refresh data after adding client', e),
          )
          return saved
        }
      } catch (error: any) {
        console.error('[AppContext] Failed to add client:', error)
        throw error
      }
    } else {
      setClients((prev) => [...prev, newClient])
      return newClient
    }
  }

  const updateClient = async (id: string, data: Partial<Client>) => {
    if (isSupabase && supabase) {
      try {
        console.log('[AppContext] Updating client:', id, data)
        
        // Buscar dados antigos para audit log
        const oldClient = clients.find((c) => c.id === id)
        
        const { data: updated, error } = await supabase
          .from('clients')
          .update(data)
          .eq('id', id)
          .select()
          .single()
        
        if (error) {
          console.error('[AppContext] Error updating client:', error)
          throw new Error(error.message || 'Erro ao atualizar cliente')
        }
        
        if (updated) {
          console.log('[AppContext] Client updated successfully:', updated)
          
          // Registrar no audit log
          const { logAudit, getChangedFields } = await import('@/lib/audit-log')
          const changedFields = oldClient ? getChangedFields(oldClient, updated) : []
          await logAudit('clients', id, 'UPDATE', {
            oldData: oldClient,
            newData: updated,
            changedFields,
            userId: user?.id,
            userEmail: user?.email,
          })
          
          setClients((prev) => prev.map((c) => (c.id === id ? updated : c)))
          // Recarregar dados para garantir sincronização
          refreshData().catch((e) =>
            console.error('Failed to refresh data after updating client', e),
          )
          return updated
        }
      } catch (error: any) {
        console.error('[AppContext] Failed to update client:', error)
        throw error
      }
    } else {
      setClients((prev) => prev.map((c) => (c.id === id ? { ...c, ...data } : c)))
    }
  }

  const toggleClientStatus = async (id: string) => {
    const client = clients.find((c) => c.id === id)
    if (client) {
      try {
        if (isSupabase && supabase) {
          console.log('[AppContext] Toggling client status:', id, 'from', client.active, 'to', !client.active)
          const { data: updated, error } = await supabase
            .from('clients')
            .update({ active: !client.active })
            .eq('id', id)
            .select()
            .single()
          
          if (error) {
            console.error('[AppContext] Error toggling client status:', error)
            throw new Error(error.message || 'Erro ao alterar status do cliente')
          }
          
          if (updated) {
            console.log('[AppContext] Client status updated successfully:', updated)
            
            // Registrar no audit log
            const { logAudit } = await import('@/lib/audit-log')
            await logAudit('clients', id, 'UPDATE', {
              oldData: client,
              newData: updated,
              changedFields: ['active'],
              userId: user?.id,
              userEmail: user?.email,
            })
            
            setClients((prev) =>
              prev.map((c) => (c.id === id ? updated : c)),
            )
            // Recarregar dados para garantir sincronização
            refreshData().catch((e) =>
              console.error('Failed to refresh data after toggling client status', e),
            )
            return updated
          }
        } else {
          // Mock mode
          setClients((prev) =>
            prev.map((c) => (c.id === id ? { ...c, active: !c.active } : c)),
          )
        }
      } catch (error: any) {
        console.error('[AppContext] Failed to toggle client status:', error)
        throw error
      }
    }
  }

  const addTechnician = async (data: Omit<Technician, 'id'>) => {
    if (isSupabase && supabase) {
      try {
        const { data: newTech, error } = await supabase
          .from('technicians')
          .insert({
            id: `tech-${Date.now()}`,
            name: data.name,
            email: data.email,
            phone: data.phone,
            specialties: data.specialties,
            active: data.active,
            service_radius: data.serviceRadius ?? 0,
            cpf_cnpj: data.cpfCnpj,
            birth_date: data.birthDate,
            cep: data.cep,
            state: data.state,
            city: data.city,
            neighborhood: data.neighborhood,
            address: data.address,
            address_number: data.addressNumber,
            complement: data.complement,
            experience_years: data.experienceYears,
            certifications: data.certifications,
            notes: data.notes,
          })
          .select()
          .single()
        
        if (error) throw error
        const result = newTech as any
        setTechnicians((prev) => [
          ...prev,
          {
            ...result,
            serviceRadius: result.service_radius,
            cpfCnpj: result.cpf_cnpj,
            birthDate: result.birth_date,
            addressNumber: result.address_number,
            experienceYears: result.experience_years,
          } as Technician,
        ])
      } catch (error) {
        console.error('Error adding technician:', error)
        // Fallback para mock se falhar
        const newTechnician: Technician = {
          ...data,
          id: `tech-${Date.now()}`,
        }
        setTechnicians((prev) => [...prev, newTechnician])
      }
    } else {
      // Fallback para mock
      const newTechnician: Technician = {
        ...data,
        id: `tech-${Date.now()}`,
      }
      setTechnicians((prev) => [...prev, newTechnician])
    }
  }

  const updateTechnician = async (id: string, data: Partial<Technician>) => {
    if (isSupabase && supabase) {
      try {
        const updateData: any = { ...data }
        
        // Mapear campos camelCase para snake_case
        if (updateData.serviceRadius !== undefined) {
          updateData.service_radius = updateData.serviceRadius
          delete updateData.serviceRadius
        }
        if (updateData.cpfCnpj !== undefined) {
          updateData.cpf_cnpj = updateData.cpfCnpj
          delete updateData.cpfCnpj
        }
        if (updateData.birthDate !== undefined) {
          updateData.birth_date = updateData.birthDate
          delete updateData.birthDate
        }
        if (updateData.addressNumber !== undefined) {
          updateData.address_number = updateData.addressNumber
          delete updateData.addressNumber
        }
        if (updateData.experienceYears !== undefined) {
          updateData.experience_years = updateData.experienceYears
          delete updateData.experienceYears
        }
        
        const { data: updated, error } = await supabase
          .from('technicians')
          .update(updateData)
          .eq('id', id)
          .select()
          .single()
        
        if (error) throw error
        const result = updated as any
        setTechnicians((prev) =>
          prev.map((t) =>
            t.id === id
              ? {
                  ...result,
                  serviceRadius: result.service_radius,
                  cpfCnpj: result.cpf_cnpj,
                  birthDate: result.birth_date,
                  addressNumber: result.address_number,
                  experienceYears: result.experience_years,
                }
              : t,
          ),
        )
      } catch (error) {
        console.error('Error updating technician:', error)
        // Fallback para mock se falhar
        setTechnicians((prev) =>
          prev.map((t) => (t.id === id ? { ...t, ...data } : t)),
        )
      }
    } else {
      // Fallback para mock
      setTechnicians((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...data } : t)),
      )
    }
  }

  const toggleTechnicianStatus = async (id: string) => {
    if (isSupabase && supabase) {
      try {
        // Primeiro buscar o técnico atual
        const { data: current, error: fetchError } = await supabase
          .from('technicians')
          .select('active')
          .eq('id', id)
          .single()
        
        if (fetchError) throw fetchError
        
        const { data: updated, error } = await supabase
          .from('technicians')
          .update({ active: !current.active })
          .eq('id', id)
          .select()
          .single()
        
        if (error) throw error
        setTechnicians((prev) =>
          prev.map((t) => (t.id === id ? (updated as Technician) : t)),
        )
      } catch (error) {
        console.error('Error toggling technician status:', error)
        // Fallback para mock se falhar
        setTechnicians((prev) =>
          prev.map((t) => (t.id === id ? { ...t, active: !t.active } : t)),
        )
      }
    } else {
      // Fallback para mock
      setTechnicians((prev) =>
        prev.map((t) => (t.id === id ? { ...t, active: !t.active } : t)),
      )
    }
  }

  const deleteTechnician = async (id: string) => {
    if (isSupabase && supabase) {
      try {
        const { error } = await supabase
          .from('technicians')
          .delete()
          .eq('id', id)
        
        if (error) throw error
        setTechnicians((prev) => prev.filter((t) => t.id !== id))
      } catch (error) {
        console.error('Error deleting technician:', error)
        throw error
      }
    } else {
      // Fallback para mock
      setTechnicians((prev) => prev.filter((t) => t.id !== id))
    }
  }

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
      created_at: new Date().toISOString(),
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
      }
    } else {
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
      await supabase.from('tickets').update(dbUpdateData).eq('id', id)
    }
    setTickets((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updateData } : t)),
    )
  }

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
    const timestamp = new Date().toISOString()
    const dbUpdate = { ...data, updated_at: timestamp }

    if (isSupabase && supabase) {
      await supabase.from('knowledge_articles').update(dbUpdate).eq('id', id)
    }

    setKnowledgeArticles((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, ...data, updatedAt: timestamp } : a,
      ),
    )
  }

  const restoreArticleVersion = async (
    articleId: string,
    versionId: string,
  ) => {
    const article = knowledgeArticles.find((a) => a.id === articleId)
    if (article && article.versions) {
      const ver = article.versions.find((v) => v.id === versionId)
      if (ver) {
        if (isSupabase && supabase) {
          await supabase
            .from('knowledge_articles')
            .update({
              title: ver.title,
              content: ver.content,
              excerpt: ver.excerpt,
              updated_at: new Date().toISOString(),
            })
            .eq('id', articleId)
        }
        setKnowledgeArticles((prev) =>
          prev.map((a) =>
            a.id === articleId
              ? {
                  ...a,
                  title: ver.title,
                  content: ver.content,
                  excerpt: ver.excerpt,
                  updatedAt: new Date().toISOString(),
                }
              : a,
          ),
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
  }

  const deleteCategory = async (id: string) => {
    if (isSupabase && supabase) {
      await supabase.from('knowledge_categories').delete().eq('id', id)
    }
    setKnowledgeCategories((prev) => prev.filter((c) => c.id !== id))
  }

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

  /**
   * Limpa todos os dados do contexto e do cache do React Query
   * Útil após limpeza do banco de dados
   */
  const clearAllData = useCallback(() => {
    // Limpar estados do contexto
    setClients([])
    setTickets([])
    setTechnicians([])
    setKnowledgeArticles([])
    setKnowledgeCategories([])
    setUsersList([])
    
    // Limpar cache do React Query
    clearAllCache()
    invalidateAllQueries()
    
    if (import.meta.env.DEV) {
      console.log('[AppContext] Todos os dados foram limpos')
    }
  }, [])

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
        updateUserRole,
        updateUserProfileImage,
        updateUserProfile,
        addTechnician,
        updateTechnician,
        toggleTechnicianStatus,
        deleteTechnician,
        addArticle,
        updateArticle,
        deleteArticle,
        addCategory,
        updateCategory,
        deleteCategory,
        restoreArticleVersion,
        getKBPermissions,
        subscriptions,
        notifications,
        subscribe,
        unsubscribe,
        markNotificationAsRead,
        clearNotifications,
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
        checkSession,
        clearAllData,
        refreshData,
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
