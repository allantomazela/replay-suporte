import { useState } from 'react'
import { useAppContext } from '@/context/AppContext'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { TicketStatusBadge } from '@/components/tickets/TicketStatusBadge'
import { Eye, Edit, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { TicketFormDialog } from '@/pages/tickets/TicketForm'
import { format, isWithinInterval, startOfDay, endOfDay } from 'date-fns'
import { TicketFilters } from '@/components/tickets/TicketFilters'
import { DateRange } from 'react-day-picker'
import { Badge } from '@/components/ui/badge'

export default function TicketList() {
  const { tickets, clients } = useAppContext()

  // Filter States
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [clientFilter, setClientFilter] = useState<string>('all')
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [arenaFilter, setArenaFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('all')

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTicketId, setEditingTicketId] = useState<string | null>(null)

  const handleResetFilters = () => {
    setSearchTerm('')
    setStatusFilter('all')
    setClientFilter('all')
    setDateRange(undefined)
    setArenaFilter('')
    setPriorityFilter('all')
  }

  const filteredTickets = tickets.filter((ticket) => {
    const client = clients.find((c) => c.id === ticket.clientId)

    // Text Search
    const matchesSearch =
      ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.id.includes(searchTerm)

    // Status Filter
    const matchesStatus =
      statusFilter === 'all' || ticket.status === statusFilter

    // Client Filter
    const matchesClient =
      clientFilter === 'all' || ticket.clientId === clientFilter

    // Date Range Filter
    let matchesDate = true
    if (dateRange?.from) {
      const ticketDate = new Date(ticket.createdAt)
      const start = startOfDay(dateRange.from)
      const end = dateRange.to
        ? endOfDay(dateRange.to)
        : endOfDay(dateRange.from)
      matchesDate = isWithinInterval(ticketDate, { start, end })
    }

    // Arena Filter (Client Arena Name or Code)
    let matchesArena = true
    if (arenaFilter && client) {
      const search = arenaFilter.toLowerCase()
      matchesArena =
        client.arenaName.toLowerCase().includes(search) ||
        client.arenaCode.toLowerCase().includes(search)
    } else if (arenaFilter && !client) {
      matchesArena = false
    }

    // Priority Filter (Custom Field)
    let matchesPriority = true
    if (priorityFilter !== 'all') {
      matchesPriority = ticket.customData?.priority === priorityFilter
    }

    return (
      matchesSearch &&
      matchesStatus &&
      matchesClient &&
      matchesDate &&
      matchesArena &&
      matchesPriority
    )
  })

  const handleEdit = (id: string) => {
    setEditingTicketId(id)
    setIsDialogOpen(true)
  }

  const handleNew = () => {
    setEditingTicketId(null)
    setIsDialogOpen(true)
  }

  const editingTicket = tickets.find((t) => t.id === editingTicketId)

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4 items-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Prontuários de Atendimento
        </h1>
        <Button onClick={handleNew} className="w-full md:w-auto shadow-sm">
          <Plus className="mr-2 h-4 w-4" /> Novo Atendimento
        </Button>
      </div>

      <TicketFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        clientFilter={clientFilter}
        setClientFilter={setClientFilter}
        dateRange={dateRange}
        setDateRange={setDateRange}
        arenaFilter={arenaFilter}
        setArenaFilter={setArenaFilter}
        priorityFilter={priorityFilter}
        setPriorityFilter={setPriorityFilter}
        clients={clients}
        onReset={handleResetFilters}
      />

      <div className="bg-card text-card-foreground p-4 rounded-lg shadow-sm border">
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="font-semibold text-foreground">
                  ID
                </TableHead>
                <TableHead className="font-semibold text-foreground">
                  Cliente
                </TableHead>
                <TableHead className="font-semibold text-foreground">
                  Assunto
                </TableHead>
                <TableHead className="font-semibold text-foreground">
                  Prioridade
                </TableHead>
                <TableHead className="font-semibold text-foreground">
                  Data
                </TableHead>
                <TableHead className="font-semibold text-foreground">
                  Status
                </TableHead>
                <TableHead className="hidden md:table-cell font-semibold text-foreground">
                  Responsável
                </TableHead>
                <TableHead className="text-right font-semibold text-foreground">
                  Ações
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTickets.map((ticket) => (
                <TableRow
                  key={ticket.id}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <TableCell className="font-medium text-foreground">
                    #{ticket.id}
                  </TableCell>
                  <TableCell className="text-foreground">
                    {ticket.clientName}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {ticket.title}
                  </TableCell>
                  <TableCell>
                    {ticket.customData?.priority ? (
                      <Badge variant="secondary">
                        {ticket.customData.priority}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(ticket.createdAt), 'dd/MM/yyyy')}
                  </TableCell>
                  <TableCell>
                    <TicketStatusBadge status={ticket.status} />
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">
                    {ticket.responsibleName}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        asChild
                        className="hover:bg-blue-50 dark:hover:bg-blue-950/30"
                      >
                        <Link to={`/tickets/${ticket.id}`}>
                          <Eye className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="hover:bg-amber-50 dark:hover:bg-amber-950/30"
                        onClick={() => handleEdit(ticket.id)}
                      >
                        <Edit className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredTickets.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center py-12 text-muted-foreground"
                  >
                    Nenhum atendimento encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <TicketFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        ticket={editingTicket}
      />
    </div>
  )
}
