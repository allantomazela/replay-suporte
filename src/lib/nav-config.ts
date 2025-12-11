import {
  LayoutGrid,
  UsersRound,
  LifeBuoy,
  ChartPie,
  CircleUser,
  LucideIcon,
  BarChart3,
  LineChart,
} from 'lucide-react'

export type NavItemId =
  | 'dashboard'
  | 'clients'
  | 'tickets'
  | 'profile'
  | 'reports'
  | 'reports-overview'
  | 'reports-performance'

export interface NavItemConfig {
  id: NavItemId
  label: string
  path: string
  icon: LucideIcon
  children?: NavItemId[]
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
    icon: LifeBuoy,
  },
  reports: {
    id: 'reports',
    label: 'Relatórios',
    path: '/reports',
    icon: ChartPie,
    children: ['reports-overview', 'reports-performance'],
  },
  'reports-overview': {
    id: 'reports-overview',
    label: 'Visão Geral',
    path: '/reports',
    icon: BarChart3,
  },
  'reports-performance': {
    id: 'reports-performance',
    label: 'Performance',
    path: '/reports/performance',
    icon: LineChart,
  },
  profile: {
    id: 'profile',
    label: 'Perfil',
    path: '/profile',
    icon: CircleUser,
  },
}

export const DEFAULT_NAV_ORDER: NavItemId[] = [
  'dashboard',
  'clients',
  'tickets',
  'reports',
  'profile',
]
