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
  city: string // Cidade/Estado (previously email)
  phone: string
  arenaCode: string // Código da Arena (previously club)
  arenaName: string // Nome da Arena (previously acquisitionDate)
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

export interface Ticket {
  id: string
  clientId: string
  clientName: string // Denormalized for easier display
  title: string // Derived from description or specific field
  description: string
  solutionSteps?: string
  status: TicketStatus
  createdAt: string // ISO Date
  updatedAt: string // ISO Date
  responsibleId: string
  responsibleName: string
  attachments: Attachment[]
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}
