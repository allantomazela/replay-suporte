import {
  LayoutGrid,
  UsersRound,
  ClipboardList,
  UserCircle,
  PieChart,
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
    icon: LayoutGrid,
  },
  clients: {
    id: 'clients',
    label: 'Clientes',
    path: '/clients',
    icon: UsersRound,
  },
  tickets: {
    id: 'tickets',
    label: 'Atendimentos',
    path: '/tickets',
    icon: ClipboardList,
  },
  reports: {
    id: 'reports',
    label: 'Relatórios',
    path: '/reports',
    icon: PieChart,
  },
  profile: {
    id: 'profile',
    label: 'Perfil',
    path: '/profile',
    icon: UserCircle,
  },
}

export const DEFAULT_NAV_ORDER: NavItemId[] = [
  'dashboard',
  'clients',
  'tickets',
  'reports',
  'profile',
]
