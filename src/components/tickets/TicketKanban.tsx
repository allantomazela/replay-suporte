import { Ticket } from '@/types'
import { TicketStatusBadge } from '@/components/tickets/TicketStatusBadge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAppContext } from '@/context/AppContext'
import { Link } from 'react-router-dom'
import { Building2, User, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Button } from '@/components/ui/button'

interface TicketKanbanProps {
  tickets: Ticket[]
  onEdit: (id: string) => void
}

const COLUMNS: { id: string; label: string; bgClass: string }[] = [
  { id: 'Aberto', label: 'Aberto', bgClass: 'bg-blue-50 dark:bg-blue-950/20' },
  {
    id: 'Em Andamento',
    label: 'Em Andamento',
    bgClass: 'bg-amber-50 dark:bg-amber-950/20',
  },
  {
    id: 'Pendente',
    label: 'Pendente',
    bgClass: 'bg-slate-50 dark:bg-slate-900/20',
  },
  {
    id: 'Resolvido',
    label: 'Resolvido',
    bgClass: 'bg-emerald-50 dark:bg-emerald-950/20',
  },
]

export function TicketKanban({ tickets, onEdit }: TicketKanbanProps) {
  const { clients } = useAppContext()

  const getClientDetails = (clientId: string) =>
    clients.find((c) => c.id === clientId)

  const getTicketsByStatus = (status: string) =>
    tickets.filter((t) => t.status === status)

  return (
    <div className="flex gap-4 overflow-x-auto pb-6 min-h-[calc(100vh-250px)]">
      {COLUMNS.map((column) => {
        const columnTickets = getTicketsByStatus(column.id)

        return (
          <div
            key={column.id}
            className={`flex-none w-80 rounded-lg p-3 ${column.bgClass} flex flex-col gap-3`}
          >
            <div className="flex items-center justify-between mb-2 px-1">
              <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                {column.label}
                <span className="bg-background text-foreground px-2 py-0.5 rounded-full text-xs shadow-sm border">
                  {columnTickets.length}
                </span>
              </h3>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto">
              {columnTickets.map((ticket) => {
                const client = getClientDetails(ticket.clientId)
                return (
                  <Card
                    key={ticket.id}
                    className="hover:shadow-md transition-all cursor-pointer border-l-4 border-l-primary/50 group"
                    onClick={() => onEdit(ticket.id)}
                  >
                    <CardHeader className="p-3 pb-0 space-y-2">
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                          #{ticket.id}
                        </span>
                        <TicketStatusBadge
                          status={ticket.status}
                          className="text-[10px] h-5 px-1.5"
                        />
                      </div>
                      <CardTitle className="text-sm font-semibold leading-tight group-hover:text-primary transition-colors line-clamp-2">
                        {ticket.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 text-xs space-y-2">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <User className="h-3 w-3 shrink-0" />
                        <span className="truncate" title={ticket.clientName}>
                          {ticket.clientName}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Building2 className="h-3 w-3 shrink-0" />
                        <span className="truncate">
                          {client
                            ? `${client.arenaName} (${client.arenaCode})`
                            : 'Arena N/A'}
                        </span>
                      </div>
                      <div className="pt-2 flex items-center justify-between text-muted-foreground/70 border-t mt-2">
                        <div className="flex items-center gap-1" title="Criado">
                          <Clock className="h-3 w-3" />
                          <span>
                            {formatDistanceToNow(new Date(ticket.createdAt), {
                              addSuffix: true,
                              locale: ptBR,
                            })}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-[10px]"
                          asChild
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Link to={`/tickets/${ticket.id}`}>Ver Detalhes</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
              {columnTickets.length === 0 && (
                <div className="h-24 border-2 border-dashed border-muted-foreground/10 rounded-lg flex items-center justify-center text-muted-foreground/50 text-xs uppercase font-medium">
                  Vazio
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
