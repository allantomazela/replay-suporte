import { Badge } from '@/components/ui/badge'
import { TicketStatus } from '@/types'
import { cn } from '@/lib/utils'

interface TicketStatusBadgeProps {
  status: TicketStatus
  className?: string
}

export function TicketStatusBadge({
  status,
  className,
}: TicketStatusBadgeProps) {
  const getStatusColor = (s: TicketStatus) => {
    switch (s) {
      case 'Aberto':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800'
      case 'Em Andamento':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800'
      case 'Resolvido':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800'
      case 'Pendente':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700'
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
    }
  }

  return (
    <Badge
      variant="outline"
      className={cn(
        'whitespace-nowrap transition-colors',
        getStatusColor(status),
        className,
      )}
    >
      {status}
    </Badge>
  )
}
