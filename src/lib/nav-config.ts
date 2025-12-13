import {
  LayoutGrid,
  UsersRound,
  LifeBuoy,
  ChartPie,
  CircleUser,
  LucideIcon,
  BarChart3,
  LineChart,
  BookOpen,
  Activity,
  Users,
  HardHat,
} from 'lucide-react'
import { UserRole } from '@/types'

export type NavItemId =
  | 'dashboard'
  | 'clients'
  | 'tickets'
  | 'profile'
  | 'reports'
  | 'reports-overview'
  | 'reports-performance'
  | 'knowledge-base'
  | 'system-health'
  | 'users'
  | 'technicians'

export interface NavItemConfig {
  id: NavItemId
  label: string
  path: string
  icon: LucideIcon
  children?: NavItemId[]
  adminOnly?: boolean
  allowedRoles?: UserRole[]
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
  'knowledge-base': {
    id: 'knowledge-base',
    label: 'Base de Conhecimento',
    path: '/knowledge-base',
    icon: BookOpen,
  },
  reports: {
    id: 'reports',
    label: 'Relatórios',
    path: '/reports',
    icon: ChartPie,
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
  'system-health': {
    id: 'system-health',
    label: 'Monitoramento',
    path: '/system-health',
    icon: Activity,
    adminOnly: true,
    allowedRoles: ['admin'],
  },
  users: {
    id: 'users',
    label: 'Usuários',
    path: '/users',
    icon: Users,
    allowedRoles: ['admin'],
  },
  technicians: {
    id: 'technicians',
    label: 'Técnicos',
    path: '/technicians',
    icon: HardHat,
    allowedRoles: ['admin', 'coordinator'],
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
  'technicians',
  'users',
  'knowledge-base',
  'reports',
  'system-health',
  'profile',
]
