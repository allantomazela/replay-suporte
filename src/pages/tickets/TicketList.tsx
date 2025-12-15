import { useState, useMemo } from 'react'
import { useAppContext } from '@/context/AppContext'
import { useDebounce } from '@/hooks/use-debounce'
import { usePagination } from '@/hooks/use-pagination'
import { Pagination } from '@/components/ui/pagination'
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
import { Eye, Edit, Plus, LayoutGrid, List } from 'lucide-react'
import { Link } from 'react-router-dom'
import { TicketFormDialog } from '@/pages/tickets/TicketForm'
import { format, isWithinInterval, startOfDay, endOfDay } from 'date-fns'
import { TicketFilters } from '@/components/tickets/TicketFilters'
import { DateRange } from 'react-day-picker'
import { Badge } from '@/components/ui/badge'
import { TicketKanban } from '@/components/tickets/TicketKanban'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

export default function TicketList() {
  const { tickets, clients } = useAppContext()

  // View Mode State
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table')

  // Filter States
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearchTerm = useDebounce(searchTerm, 300)
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

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const client = clients.find((c) => c.id === ticket.clientId)

      // Text Search (Expanded to include Arena Name and Code)
      const searchLower = debouncedSearchTerm.toLowerCase()
    const matchesSearch =
      ticket.title.toLowerCase().includes(searchLower) ||
      ticket.description.toLowerCase().includes(searchLower) ||
      ticket.id.toLowerCase().includes(searchLower) ||
      (client &&
        (client.arenaName.toLowerCase().includes(searchLower) ||
          client.arenaCode.toLowerCase().includes(searchLower)))

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

    // Arena Filter (Specific Advanced Filter)
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
  }, [tickets, clients, debouncedSearchTerm, statusFilter, clientFilter, dateRange, arenaFilter, priorityFilter])

  // Paginação
  const {
    paginatedData: paginatedTickets,
    currentPage,
    totalPages,
    goToPage,
    totalItems,
  } = usePagination(filteredTickets, { pageSize: 50 })

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
        <div className="flex items-center gap-2 w-full md:w-auto">
          <ToggleGroup
            type="single"
            value={viewMode}
            onValueChange={(val) =>
              val && setViewMode(val as 'table' | 'kanban')
            }
            className="border rounded-md p-1"
          >
            <ToggleGroupItem value="table" size="sm" aria-label="Table View">
              <List className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="kanban" size="sm" aria-label="Kanban View">
              <LayoutGrid className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
          <Button onClick={handleNew} className="flex-1 md:flex-none shadow-sm">
            <Plus className="mr-2 h-4 w-4" /> Novo Atendimento
          </Button>
        </div>
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

      {viewMode === 'table' ? (
        <div className="bg-card text-card-foreground p-4 rounded-lg shadow-sm border">
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="font-semibold text-foreground">
                    ID
                  </TableHead>
                  <TableHead className="font-semibold text-foreground">
                    Cliente / Arena
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
                {paginatedTickets.map((ticket) => {
                  const client = clients.find((c) => c.id === ticket.clientId)
                  return (
                    <TableRow
                      key={ticket.id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <TableCell className="font-medium text-foreground">
                        #{ticket.id}
                      </TableCell>
                      <TableCell className="text-foreground">
                        <div className="flex flex-col">
                          <span>{ticket.clientName}</span>
                          {client && (
                            <span className="text-xs text-muted-foreground">
                              {client.arenaName} ({client.arenaCode})
                            </span>
                          )}
                        </div>
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
                  )
                })}
                {paginatedTickets.length === 0 && (
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

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Mostrando {paginatedTickets.length} de {totalItems} tickets
              </p>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={goToPage}
              />
            </div>
          )}
        </div>
      ) : (
        <TicketKanban tickets={paginatedTickets} onEdit={handleEdit} />
      )}

      <TicketFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        ticket={editingTicket}
      />
    </div>
  )
}
