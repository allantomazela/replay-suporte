import { useState } from 'react'
import { useAppContext } from '@/context/AppContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { TicketStatusBadge } from '@/components/tickets/TicketStatusBadge'
import { Eye, Edit, Search, Plus, Filter } from 'lucide-react'
import { Link } from 'react-router-dom'
import { TicketFormDialog } from '@/pages/tickets/TicketForm'
import { format } from 'date-fns'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function TicketList() {
  const { tickets, clients } = useAppContext()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [clientFilter, setClientFilter] = useState<string>('all')

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTicketId, setEditingTicketId] = useState<string | null>(null)

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.id.includes(searchTerm)
    const matchesStatus =
      statusFilter === 'all' || ticket.status === statusFilter
    const matchesClient =
      clientFilter === 'all' || ticket.clientId === clientFilter

    return matchesSearch && matchesStatus && matchesClient
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

      <div className="bg-card text-card-foreground p-4 rounded-lg shadow-sm border space-y-4">
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar na descrição ou ID..."
              className="pl-9 bg-background"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="bg-background">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Filter className="h-4 w-4" />
                <SelectValue placeholder="Status" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Status</SelectItem>
              <SelectItem value="Aberto">Aberto</SelectItem>
              <SelectItem value="Em Andamento">Em Andamento</SelectItem>
              <SelectItem value="Resolvido">Resolvido</SelectItem>
              <SelectItem value="Pendente">Pendente</SelectItem>
            </SelectContent>
          </Select>

          <Select value={clientFilter} onValueChange={setClientFilter}>
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Cliente" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Clientes</SelectItem>
              {clients.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

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
                    colSpan={7}
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
