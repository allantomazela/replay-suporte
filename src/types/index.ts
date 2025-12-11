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
