import { useState } from 'react'
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
import { Edit, Plus, UserX, CheckCircle, Search } from 'lucide-react'
import { TechnicianFormDialog } from '@/components/technicians/TechnicianFormDialog'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

export default function TechnicianList() {
  const { technicians, toggleTechnicianStatus, user } = useAppContext()
  const [searchTerm, setSearchTerm] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTechnician, setEditingTechnician] = useState<
    Technician | undefined
  >(undefined)
  const { toast } = useToast()

  // Permissions Check
  const canManage = user?.role === 'admin' || user?.role === 'coordinator'

  if (!canManage) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <h2 className="text-2xl font-bold mb-4">Acesso Negado</h2>
        <p className="text-muted-foreground">
          Você não tem permissão para gerenciar técnicos.
        </p>
      </div>
    )
  }

  const filteredTechnicians = technicians.filter(
    (tech) =>
      tech.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tech.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tech.specialties.some((s) =>
        s.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
  )

  const handleEdit = (tech: Technician) => {
    setEditingTechnician(tech)
    setIsDialogOpen(true)
  }

  const handleNew = () => {
    setEditingTechnician(undefined)
    setIsDialogOpen(true)
  }

  const handleToggleStatus = (id: string) => {
    toggleTechnicianStatus(id)
    toast({
      title: 'Status atualizado',
      description: 'O status do técnico foi alterado.',
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4 items-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Gestão de Técnicos
        </h1>
        <Button onClick={handleNew} className="w-full md:w-auto shadow-sm">
          <Plus className="mr-2 h-4 w-4" /> Novo Técnico
        </Button>
      </div>

      <div className="bg-card p-4 rounded-lg shadow-sm border space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar Técnico (nome, email, especialidade)..."
            className="pl-9 bg-background"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Especialidades</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTechnicians.map((tech) => (
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
                    <Badge variant={tech.active ? 'default' : 'outline'}>
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
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredTechnicians.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-12 text-muted-foreground"
                  >
                    Nenhum técnico encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <TechnicianFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        technician={editingTechnician}
      />
    </div>
  )
}
