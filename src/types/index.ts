export type UserRole = 'agent' | 'coordinator' | 'admin' | 'client'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
}

export interface Client {
  id: string
  name: string
  city: string
  phone: string
  arenaCode: string
  arenaName: string
  active: boolean
  contractType?: string
  technicalManager?: string
}

export type TicketStatus = 'Aberto' | 'Em Andamento' | 'Resolvido' | 'Pendente'

export interface Attachment {
  id: string
  name: string
  type: string
  url: string
  size: number
}

export type CustomFieldType = 'text' | 'number' | 'date' | 'select' | 'checkbox'

export interface CustomFieldDefinition {
  id: string
  label: string
  type: CustomFieldType
  options?: string[]
  required: boolean
  placeholder?: string
}

export interface Ticket {
  id: string
  clientId: string
  clientName: string
  title: string
  description: string
  solutionSteps?: string
  status: TicketStatus
  createdAt: string
  updatedAt: string
  responsibleId: string
  responsibleName: string
  attachments: Attachment[]
  customData?: Record<string, any>
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

export interface ArenaNotificationSetting {
  arenaId: string
  events: {
    statusChange: boolean
    newComment: boolean
    assignmentChange: boolean
  }
  channels: {
    inApp: boolean
    email: boolean
  }
}

// Knowledge Base Types
export interface KnowledgeCategory {
  id: string
  name: string
  description?: string
}

export interface KnowledgeArticleVersion {
  id: string
  articleId: string
  title: string
  content: string
  excerpt: string
  updatedAt: string
  updatedBy: string
  versionNumber: number
}

export interface KnowledgeArticle {
  id: string
  title: string
  excerpt: string
  content: string
  categoryId: string
  categoryName: string
  author: string
  createdAt: string
  updatedAt: string
  tags: string[]
  views: number
  helpfulCount: number
  versions?: KnowledgeArticleVersion[]
  isPublic: boolean
}

export type SubscriptionType = 'article' | 'category'

export interface KBSubscription {
  id: string
  userId: string
  type: SubscriptionType
  targetId: string // articleId or categoryId
  targetName: string
}

export interface AppNotification {
  id: string
  userId: string
  title: string
  message: string
  link?: string
  read: boolean
  createdAt: string
}
