import { useState, useMemo } from 'react'
import { useAppContext } from '@/context/AppContext'
import { Client } from '@/types'
import { useDebounce } from '@/hooks/use-debounce'
import { usePagination } from '@/hooks/use-pagination'
import { Pagination } from '@/components/ui/pagination'
import { exportToCSV, exportToPDF } from '@/lib/export-data'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
import { Eye, Edit, Trash2, Search, Plus, UserX, Download } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ClientFormDialog } from '@/components/clients/ClientFormDialog'
import { useToast } from '@/hooks/use-toast'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { cn } from '@/lib/utils'

export default function ClientList() {
  const { clients, toggleClientStatus } = useAppContext()
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearchTerm = useDebounce(searchTerm, 300)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | undefined>(
    undefined,
  )
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const { toast } = useToast()

  const filteredClients = useMemo(() => {
    if (!debouncedSearchTerm.trim()) return clients
    
    const searchLower = debouncedSearchTerm.toLowerCase()
    return clients.filter(
      (client) =>
        client.name.toLowerCase().includes(searchLower) ||
        client.city?.toLowerCase().includes(searchLower) ||
        client.arenaCode?.toLowerCase().includes(searchLower) ||
        client.arenaName?.toLowerCase().includes(searchLower),
    )
  }, [clients, debouncedSearchTerm])

  // Paginação
  const {
    paginatedData: paginatedClients,
    currentPage,
    totalPages,
    goToPage,
    nextPage,
    previousPage,
    totalItems,
  } = usePagination(filteredClients, { pageSize: 50 })

  const handleEdit = (client: Client) => {
    setEditingClient(client)
    setIsDialogOpen(true)
  }

  const handleNew = () => {
    setEditingClient(undefined)
    setIsDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (deleteId) {
      try {
        const client = clients.find((c) => c.id === deleteId)
        await toggleClientStatus(deleteId)
        toast({
          title: 'Status atualizado',
          description: client?.active
            ? 'O cliente foi desativado com sucesso.'
            : 'O cliente foi reativado com sucesso.',
        })
        setDeleteId(null)
      } catch (error: any) {
        console.error('Error toggling client status:', error)
        toast({
          title: 'Erro ao alterar status',
          description: error.message || 'Não foi possível alterar o status do cliente.',
          variant: 'destructive',
        })
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4 items-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Gestão de Clientes
        </h1>
        <div className="flex gap-2 w-full md:w-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="shadow-sm">
                <Download className="mr-2 h-4 w-4" /> Exportar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                onClick={() =>
                  exportToCSV(filteredClients, 'clientes', [
                    'Nome',
                    'Cidade/Estado',
                    'Telefone',
                    'Código da Arena',
                    'Nome da Arena',
                    'Status',
                  ])
                }
              >
                Exportar como CSV
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  exportToPDF(
                    filteredClients.map((c) => ({
                      Nome: c.name,
                      'Cidade/Estado': c.city || '',
                      Telefone: c.phone || '',
                      'Código da Arena': c.arenaCode || '',
                      'Nome da Arena': c.arenaName || '',
                      Status: c.active ? 'Ativo' : 'Inativo',
                    })),
                    'clientes',
                    'Lista de Clientes'
                  )
                }
              >
                Exportar como PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={handleNew} className="shadow-sm">
            <Plus className="mr-2 h-4 w-4" /> Novo Cliente
          </Button>
        </div>
      </div>

      <div className="bg-card p-4 rounded-lg shadow-sm border space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar Cliente (nome, cidade, arena)..."
            className="pl-9 bg-background"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="font-semibold text-foreground">
                  Nome
                </TableHead>
                <TableHead className="hidden md:table-cell font-semibold text-foreground">
                  Cidade/Estado
                </TableHead>
                <TableHead className="hidden md:table-cell font-semibold text-foreground">
                  Telefone
                </TableHead>
                <TableHead className="font-semibold text-foreground">
                  Código da Arena
                </TableHead>
                <TableHead className="hidden lg:table-cell font-semibold text-foreground">
                  Nome da Arena
                </TableHead>
                <TableHead className="text-right font-semibold text-foreground">
                  Ações
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.map((client) => (
                <TableRow
                  key={client.id}
                  className={cn(
                    'transition-colors',
                    !client.active && 'opacity-60 bg-muted/30',
                  )}
                >
                  <TableCell className="font-medium text-foreground">
                    {client.name}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">
                    {client.city}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">
                    {client.phone}
                  </TableCell>
                  <TableCell className="text-foreground">
                    {client.arenaCode}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-muted-foreground">
                    {client.arenaName}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        asChild
                        className="hover:bg-blue-50 dark:hover:bg-blue-950/30"
                      >
                        <Link to={`/clients/${client.id}`}>
                          <Eye className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          <span className="sr-only">Visualizar</span>
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="hover:bg-amber-50 dark:hover:bg-amber-950/30"
                        onClick={() => handleEdit(client)}
                      >
                        <Edit className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                        <span className="sr-only">Editar</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                          client.active
                            ? 'hover:bg-red-50 dark:hover:bg-red-950/30'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-800',
                        )}
                        onClick={() => setDeleteId(client.id)}
                      >
                        {client.active ? (
                          <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                        ) : (
                          <UserX className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="sr-only">Desativar</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {paginatedClients.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-12 text-muted-foreground"
                  >
                    Nenhum cliente encontrado.
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
              Mostrando {paginatedClients.length} de {totalItems} clientes
            </p>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={goToPage}
            />
          </div>
        )}
      </div>

      <ClientFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        client={editingClient}
      />

      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Alterar status do cliente?</AlertDialogTitle>
            <AlertDialogDescription>
              Isso irá{' '}
              {clients.find((c) => c.id === deleteId)?.active
                ? 'desativar'
                : 'reativar'}{' '}
              o acesso e visibilidade deste cliente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className={
                clients.find((c) => c.id === deleteId)?.active
                  ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                  : ''
              }
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
