import { useState, useEffect, useMemo } from 'react'
import { getAuditHistory, AuditLog } from '@/lib/audit-log'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, Filter } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Loader2 } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface AuditHistoryProps {
  tableName: string
  recordId: string
}

export function AuditHistory({ tableName, recordId }: AuditHistoryProps) {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [actionFilter, setActionFilter] = useState<string>('all')
  const [userFilter, setUserFilter] = useState<string>('all')

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true)
      const history = await getAuditHistory(tableName, recordId)
      setLogs(history)
      setLoading(false)
    }

    fetchLogs()
  }, [tableName, recordId])

  // Filtros
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      // Busca por texto (usuário, campos alterados)
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        const matchesSearch =
          log.user_email?.toLowerCase().includes(searchLower) ||
          log.changed_fields?.some((field) =>
            field.toLowerCase().includes(searchLower)
          ) ||
          log.action.toLowerCase().includes(searchLower)
        if (!matchesSearch) return false
      }

      // Filtro por ação
      if (actionFilter !== 'all' && log.action !== actionFilter) {
        return false
      }

      // Filtro por usuário
      if (userFilter !== 'all' && log.user_email !== userFilter) {
        return false
      }

      return true
    })
  }, [logs, searchTerm, actionFilter, userFilter])

  // Usuários únicos para filtro
  const uniqueUsers = useMemo(() => {
    const users = new Set<string>()
    logs.forEach((log) => {
      if (log.user_email) users.add(log.user_email)
    })
    return Array.from(users).sort()
  }, [logs])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Alterações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (logs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Alterações</CardTitle>
          <CardDescription>
            Nenhuma alteração registrada para este registro.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  // Expandir para ver dados antigos vs novos
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set())
  const toggleExpand = (logId: string) => {
    setExpandedLogs((prev) => {
      const next = new Set(prev)
      if (next.has(logId)) {
        next.delete(logId)
      } else {
        next.add(logId)
      }
      return next
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de Alterações</CardTitle>
        <CardDescription>
          Registro de todas as alterações realizadas neste item.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Filtros */}
        <div className="mb-4 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por usuário, campo ou ação..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Todas as ações" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as ações</SelectItem>
              <SelectItem value="INSERT">Criação</SelectItem>
              <SelectItem value="UPDATE">Atualização</SelectItem>
              <SelectItem value="DELETE">Exclusão</SelectItem>
            </SelectContent>
          </Select>
          {uniqueUsers.length > 0 && (
            <Select value={userFilter} onValueChange={setUserFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Todos os usuários" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os usuários</SelectItem>
                {uniqueUsers.map((user) => (
                  <SelectItem key={user} value={user}>
                    {user}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data/Hora</TableHead>
              <TableHead>Ação</TableHead>
              <TableHead>Usuário</TableHead>
              <TableHead>Campos Alterados</TableHead>
              <TableHead className="text-right">Detalhes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Nenhum registro encontrado com os filtros aplicados.
                </TableCell>
              </TableRow>
            ) : (
              filteredLogs.map((log) => (
                <>
                  <TableRow key={log.id}>
                    <TableCell>
                      {format(new Date(log.created_at), "dd/MM/yyyy 'às' HH:mm", {
                        locale: ptBR,
                      })}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          log.action === 'INSERT'
                            ? 'default'
                            : log.action === 'UPDATE'
                              ? 'secondary'
                              : 'destructive'
                        }
                      >
                        {log.action === 'INSERT'
                          ? 'Criado'
                          : log.action === 'UPDATE'
                            ? 'Atualizado'
                            : 'Excluído'}
                      </Badge>
                    </TableCell>
                    <TableCell>{log.user_email || 'Sistema'}</TableCell>
                    <TableCell>
                      {log.changed_fields && log.changed_fields.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {log.changed_fields.map((field) => (
                            <Badge key={field} variant="outline" className="text-xs">
                              {field}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {(log.old_data || log.new_data) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleExpand(log.id)}
                        >
                          {expandedLogs.has(log.id) ? 'Ocultar' : 'Ver'} Detalhes
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                  {expandedLogs.has(log.id) && (log.old_data || log.new_data) && (
                    <TableRow>
                      <TableCell colSpan={5} className="bg-muted/30">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                          {log.old_data && (
                            <div>
                              <h4 className="font-semibold mb-2 text-sm">Dados Antigos:</h4>
                              <pre className="text-xs bg-background p-2 rounded overflow-auto max-h-40">
                                {JSON.stringify(log.old_data, null, 2)}
                              </pre>
                            </div>
                          )}
                          {log.new_data && (
                            <div>
                              <h4 className="font-semibold mb-2 text-sm">Dados Novos:</h4>
                              <pre className="text-xs bg-background p-2 rounded overflow-auto max-h-40">
                                {JSON.stringify(log.new_data, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))
            )}
          </TableBody>
        </Table>

        {filteredLogs.length > 0 && (
          <div className="mt-4 text-sm text-muted-foreground text-center">
            Mostrando {filteredLogs.length} de {logs.length} registros
          </div>
        )}
      </CardContent>
    </Card>
  )
}

