import { memo } from 'react'
import { Badge } from '@/components/ui/badge'
import { TicketStatus } from '@/types'
import { cn } from '@/lib/utils'

interface TicketStatusBadgeProps {
  status: TicketStatus
  className?: string
}

export const TicketStatusBadge = memo(function TicketStatusBadge({
  status,
  className,
}: TicketStatusBadgeProps) {
  const getStatusColor = (s: TicketStatus) => {
    switch (s) {
      case 'Aberto':
        // High contrast Blue
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200 border-blue-200 dark:border-blue-800'
      case 'Em Andamento':
        // High contrast Yellow/Orange
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200 border-amber-200 dark:border-amber-800'
      case 'Resolvido':
        // High contrast Green
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800'
      case 'Pendente':
        // High contrast Gray
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
    }
  }

  return (
    <Badge
      variant="outline"
      className={cn(
        'whitespace-nowrap transition-colors font-semibold shadow-sm',
        getStatusColor(status),
        className,
      )}
    >
      {status}
    </Badge>
  )
})
