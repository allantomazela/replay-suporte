import { useState, useMemo } from 'react'
import { useAppContext } from '@/context/AppContext'
import { Technician } from '@/types'
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
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Edit, Plus, UserX, CheckCircle, Search, Trash2, Filter, SlidersHorizontal, Download, X } from 'lucide-react'
import { TechnicianFormDialog } from '@/components/technicians/TechnicianFormDialog'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { BRAZILIAN_STATES } from '@/lib/brazilian-states'
import { exportToCSV } from '@/lib/csv-export'
import { useDebounce } from '@/hooks/use-debounce'

function TechnicianTableSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell>
            <Skeleton className="h-4 w-32" />
          </TableCell>
          <TableCell>
            <div className="space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-28" />
            </div>
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-20" />
          </TableCell>
          <TableCell>
            <div className="flex gap-1">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-20" />
            </div>
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-12" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-16" />
          </TableCell>
          <TableCell className="text-right">
            <div className="flex justify-end gap-1">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
            </div>
          </TableCell>
        </TableRow>
      ))}
    </>
  )
}

export default function TechnicianList() {
  const { technicians, toggleTechnicianStatus, deleteTechnician, user, isLoading } = useAppContext()
  const [searchTerm, setSearchTerm] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTechnician, setEditingTechnician] = useState<
    Technician | undefined
  >(undefined)
  const { toast } = useToast()

  // Filtros avançados
  const [stateFilter, setStateFilter] = useState<string>('all')
  const [cityFilter, setCityFilter] = useState<string>('')
  const [specialtyFilter, setSpecialtyFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)

  // Debounce para busca
  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  // Permissions Check - Removida restrição, todos podem acessar
  const canView = true // Todos os usuários logados podem visualizar

  // Obter lista única de cidades e especialidades
  const uniqueCities = useMemo(() => {
    const cities = technicians
      .map((t) => t.city)
      .filter((city): city is string => !!city)
    return Array.from(new Set(cities)).sort()
  }, [technicians])

  const uniqueSpecialties = useMemo(() => {
    const specialties = technicians.flatMap((t) => t.specialties)
    return Array.from(new Set(specialties)).sort()
  }, [technicians])

  const filteredTechnicians = useMemo(() => {
    return technicians.filter((tech) => {
      // Busca textual
      const searchLower = debouncedSearchTerm.toLowerCase()
      const matchesSearch =
        !debouncedSearchTerm ||
        tech.name.toLowerCase().includes(searchLower) ||
        tech.email.toLowerCase().includes(searchLower) ||
        tech.phone?.toLowerCase().includes(searchLower) ||
        tech.city?.toLowerCase().includes(searchLower) ||
        tech.state?.toLowerCase().includes(searchLower) ||
        tech.specialties.some((s) =>
          s.toLowerCase().includes(searchLower),
        )

      // Filtro por estado
      const matchesState =
        stateFilter === 'all' || tech.state === stateFilter

      // Filtro por cidade
      const matchesCity =
        !cityFilter || tech.city?.toLowerCase().includes(cityFilter.toLowerCase())

      // Filtro por especialidade
      const matchesSpecialty =
        specialtyFilter === 'all' ||
        tech.specialties.includes(specialtyFilter)

      // Filtro por status
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && tech.active) ||
        (statusFilter === 'inactive' && !tech.active)

      return (
        matchesSearch &&
        matchesState &&
        matchesCity &&
        matchesSpecialty &&
        matchesStatus
      )
    })
  }, [
    technicians,
    debouncedSearchTerm,
    stateFilter,
    cityFilter,
    specialtyFilter,
    statusFilter,
  ])

  const hasActiveFilters =
    stateFilter !== 'all' ||
    cityFilter !== '' ||
    specialtyFilter !== 'all' ||
    statusFilter !== 'all'

  const handleResetFilters = () => {
    setStateFilter('all')
    setCityFilter('')
    setSpecialtyFilter('all')
    setStatusFilter('all')
    setSearchTerm('')
  }

  const handleEdit = (tech: Technician) => {
    setEditingTechnician(tech)
    setIsDialogOpen(true)
  }

  const handleNew = () => {
    setEditingTechnician(undefined)
    setIsDialogOpen(true)
  }

  const handleToggleStatus = async (id: string) => {
    try {
      await toggleTechnicianStatus(id)
      toast({
        title: 'Status atualizado',
        description: 'O status do técnico foi atualizado com sucesso.',
      })
    } catch (error) {
      toast({
        title: 'Erro ao atualizar status',
        description: 'Não foi possível atualizar o status do técnico.',
        variant: 'destructive',
      })
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteTechnician(id)
      toast({
        title: 'Técnico removido',
        description: 'O técnico foi removido com sucesso.',
      })
    } catch (error) {
      toast({
        title: 'Erro ao remover',
        description: 'Não foi possível remover o técnico.',
        variant: 'destructive',
      })
    }
  }

  const handleExportCSV = () => {
    try {
      const exportData = filteredTechnicians.map((tech) => ({
        Nome: tech.name,
        Email: tech.email,
        Telefone: tech.phone || '',
        CPF_CNPJ: tech.cpfCnpj || '',
        Cidade: tech.city || '',
        Estado: tech.state || '',
        Bairro: tech.neighborhood || '',
        Endereco: tech.address || '',
        Numero: tech.addressNumber || '',
        CEP: tech.cep || '',
        Especialidades: tech.specialties.join('; '),
        'Raio Atuacao (km)': tech.serviceRadius || 0,
        'Anos Experiencia': tech.experienceYears || '',
        Certificacoes: tech.certifications || '',
        Observacoes: tech.notes || '',
        Status: tech.active ? 'Ativo' : 'Inativo',
      }))

      exportToCSV(exportData, {
        filename: `tecnicos-parceiros-${new Date().toISOString().split('T')[0]}.csv`,
      })

      toast({
        title: 'Exportação concluída',
        description: `Dados exportados com sucesso (${exportData.length} registros).`,
      })
    } catch (error) {
      toast({
        title: 'Erro na exportação',
        description: 'Não foi possível exportar os dados.',
        variant: 'destructive',
      })
    }
  }

  if (!canView) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">
          Você não tem permissão para visualizar esta página.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Técnicos Parceiros</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie os técnicos parceiros do sistema
          </p>
        </div>
        <Button onClick={handleNew} className="w-full md:w-auto shadow-sm">
          <Plus className="mr-2 h-4 w-4" /> Novo Técnico Parceiro
        </Button>
      </div>

      {/* Filtros */}
      <div className="bg-card text-card-foreground p-4 rounded-lg shadow-sm border space-y-4">
        {/* Filtros Básicos - Sempre Visíveis */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="relative md:col-span-5">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, email, telefone, cidade..."
              className="pl-9 bg-background"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="md:col-span-3">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-background">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Filter className="h-4 w-4" />
                  <SelectValue placeholder="Status" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="active">Ativos</SelectItem>
                <SelectItem value="inactive">Inativos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-2">
            <Button
              variant="outline"
              onClick={handleExportCSV}
              className="w-full"
              disabled={filteredTechnicians.length === 0}
            >
              <Download className="mr-2 h-4 w-4" />
              Exportar CSV
            </Button>
          </div>

          <div className="md:col-span-2 flex justify-end gap-2">
            <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className={cn(
                    isFiltersOpen && 'bg-accent text-accent-foreground',
                    hasActiveFilters && 'border-primary',
                  )}
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  <span className="sr-only">Filtros Avançados</span>
                </Button>
              </CollapsibleTrigger>
            </Collapsible>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleResetFilters}
                title="Limpar filtros"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Filtros Avançados - Colapsáveis */}
        <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
          <CollapsibleContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Estado</label>
                <Select value={stateFilter} onValueChange={setStateFilter}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Todos os Estados" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Estados</SelectItem>
                    {BRAZILIAN_STATES.map((state) => (
                      <SelectItem key={state.value} value={state.value}>
                        {state.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Cidade</label>
                <Select value={cityFilter} onValueChange={setCityFilter}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Todas as Cidades" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas as Cidades</SelectItem>
                    {uniqueCities.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Especialidade</label>
                <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Todas as Especialidades" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as Especialidades</SelectItem>
                    {uniqueSpecialties.map((specialty) => (
                      <SelectItem key={specialty} value={specialty}>
                        {specialty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Tabela */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Contato</TableHead>
              <TableHead>Cidade/Estado</TableHead>
              <TableHead>Especialidades</TableHead>
              <TableHead>Raio (km)</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && technicians.length === 0 ? (
              <TechnicianTableSkeleton />
            ) : (
              <>
                {filteredTechnicians.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-12 text-muted-foreground"
                    >
                      {searchTerm || hasActiveFilters
                        ? 'Nenhum técnico encontrado com os filtros aplicados.'
                        : 'Nenhum técnico cadastrado.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTechnicians.map((tech) => (
                    <TableRow
                      key={tech.id}
                      className={cn(
                        'transition-colors',
                        !tech.active && 'opacity-60 bg-muted/30',
                      )}
                    >
                      <TableCell className="font-medium">{tech.name}</TableCell>
                      <TableCell>
                        <div className="flex flex-col text-sm">
                          <span>{tech.email}</span>
                          <span className="text-muted-foreground">
                            {tech.phone}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {tech.city || tech.state ? (
                          <div className="flex flex-col text-sm">
                            {tech.city && <span>{tech.city}</span>}
                            {tech.state && (
                              <span className="text-muted-foreground">
                                {tech.state}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {tech.specialties.map((spec) => (
                            <Badge
                              key={spec}
                              variant="secondary"
                              className="text-xs"
                            >
                              {spec}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        {tech.serviceRadius ? (
                          <span className="text-sm">{tech.serviceRadius} km</span>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={tech.active ? 'default' : 'secondary'}
                          className={
                            tech.active
                              ? 'bg-green-500 hover:bg-green-600'
                              : ''
                          }
                        >
                          {tech.active ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="hover:bg-amber-50 dark:hover:bg-amber-950/30"
                            onClick={() => handleEdit(tech)}
                          >
                            <Edit className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleStatus(tech.id)}
                          >
                            {tech.active ? (
                              <UserX className="h-4 w-4 text-destructive" />
                            ) : (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            )}
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="hover:bg-red-50 dark:hover:bg-red-950/30"
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja remover o técnico{' '}
                                  <strong>{tech.name}</strong>? Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(tech.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Remover
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Estatísticas */}
      {filteredTechnicians.length > 0 && (
        <div className="text-sm text-muted-foreground">
          Mostrando {filteredTechnicians.length} de {technicians.length} técnico(s)
          {hasActiveFilters && ' (filtros aplicados)'}
        </div>
      )}

      <TechnicianFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        technician={editingTechnician}
      />
    </div>
  )
}
