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
        return 'bg-blue-100 text-blue-700 hover:bg-blue-100/80 border-blue-200'
      case 'Em Andamento':
        return 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100/80 border-yellow-200'
      case 'Resolvido':
        return 'bg-green-100 text-green-700 hover:bg-green-100/80 border-green-200'
      case 'Pendente':
        return 'bg-gray-100 text-gray-700 hover:bg-gray-100/80 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <Badge
      variant="outline"
      className={cn('whitespace-nowrap', getStatusColor(status), className)}
    >
      {status}
    </Badge>
  )
}
