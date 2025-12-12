import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Ticket } from '@/types'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface DetailedTicketsTableProps {
  data: Ticket[]
}

export function DetailedTicketsTable({ data }: DetailedTicketsTableProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Resolvido':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 hover:bg-green-100'
      case 'Em Andamento':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 hover:bg-blue-100'
      case 'Pendente':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 hover:bg-yellow-100'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-100'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Crítica':
        return 'text-red-600 font-bold'
      case 'Alta':
        return 'text-orange-600 font-medium'
      case 'Média':
        return 'text-yellow-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">ID</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead className="w-[300px]">Assunto</TableHead>
            <TableHead>Agente</TableHead>
            <TableHead>Prioridade</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                Nenhum ticket encontrado para os filtros selecionados.
              </TableCell>
            </TableRow>
          ) : (
            data.map((ticket) => (
              <TableRow key={ticket.id}>
                <TableCell className="font-medium">{ticket.id}</TableCell>
                <TableCell>
                  {format(new Date(ticket.createdAt), 'dd/MM/yyyy HH:mm', {
                    locale: ptBR,
                  })}
                </TableCell>
                <TableCell>{ticket.clientName}</TableCell>
                <TableCell
                  className="truncate max-w-[300px]"
                  title={ticket.title}
                >
                  {ticket.title}
                </TableCell>
                <TableCell>{ticket.responsibleName}</TableCell>
                <TableCell>
                  <span
                    className={getPriorityColor(
                      ticket.customData?.priority || 'Baixa',
                    )}
                  >
                    {ticket.customData?.priority || 'Baixa'}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={`border-0 ${getStatusColor(ticket.status)}`}
                  >
                    {ticket.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
