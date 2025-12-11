import {
  LayoutDashboard,
  Users,
  Ticket,
  BarChart4,
  User,
  LucideIcon,
} from 'lucide-react'

export type NavItemId =
  | 'dashboard'
  | 'clients'
  | 'tickets'
  | 'profile'
  | 'reports'

export interface NavItemConfig {
  id: NavItemId
  label: string
  path: string
  icon: LucideIcon
}

export const NAV_CONFIG: Record<NavItemId, NavItemConfig> = {
  dashboard: {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/dashboard',
    icon: LayoutDashboard,
  },
  clients: {
    id: 'clients',
    label: 'Clientes',
    path: '/clients',
    icon: Users,
  },
  tickets: {
    id: 'tickets',
    label: 'Atendimentos',
    path: '/tickets',
    icon: Ticket,
  },
  reports: {
    id: 'reports',
    label: 'Relatórios',
    path: '/reports',
    icon: BarChart4,
  },
  profile: {
    id: 'profile',
    label: 'Perfil',
    path: '/profile',
    icon: User,
  },
}

export const DEFAULT_NAV_ORDER: NavItemId[] = [
  'dashboard',
  'clients',
  'tickets',
  'reports',
  'profile',
]
