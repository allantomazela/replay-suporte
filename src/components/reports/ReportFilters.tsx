import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { useAppContext } from '@/context/AppContext'
import { Download, FileText, CalendarIcon } from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { DateRange } from 'react-day-picker'

interface ReportFiltersProps {
  dateRange: DateRange | undefined
  setDateRange: (range: DateRange | undefined) => void
  statusFilter: string
  setStatusFilter: (val: string) => void
  clientFilter: string
  setClientFilter: (val: string) => void
  agentFilter: string
  setAgentFilter: (val: string) => void
  problemTypeFilter: string
  setProblemTypeFilter: (val: string) => void
  onExportPDF: () => void
  onExportCSV: () => void
}

export function ReportFilters({
  dateRange,
  setDateRange,
  statusFilter,
  setStatusFilter,
  clientFilter,
  setClientFilter,
  agentFilter,
  setAgentFilter,
  problemTypeFilter,
  setProblemTypeFilter,
  onExportPDF,
  onExportCSV,
}: ReportFiltersProps) {
  const { clients, tickets, customFields } = useAppContext()

  // Get unique agents from tickets to populate the select
  const uniqueAgents = Array.from(
    new Set(tickets.map((t) => t.responsibleName)),
  ).map((name) => {
    const t = tickets.find((ticket) => ticket.responsibleName === name)
    return { id: t?.responsibleId || 'unknown', name }
  })

  // Get problem types from custom fields or fallback
  const problemTypeField = customFields.find((f) => f.id === 'problemType')
  const problemTypes = problemTypeField?.options || [
    'Hardware',
    'Software',
    'Rede',
    'Operacional',
    'Outro',
  ]

  return (
    <div className="space-y-4 bg-card p-4 rounded-lg border shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Date Range Picker */}
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">Período</span>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={'outline'}
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !dateRange && 'text-muted-foreground',
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, 'dd/MM/yyyy')} -{' '}
                      {format(dateRange.to, 'dd/MM/yyyy')}
                    </>
                  ) : (
                    format(dateRange.from, 'dd/MM/yyyy')
                  )
                ) : (
                  <span>Selecione uma data</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
                locale={ptBR}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Status Filter */}
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">Status</span>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Todos os Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="Aberto">Aberto</SelectItem>
              <SelectItem value="Em Andamento">Em Andamento</SelectItem>
              <SelectItem value="Resolvido">Resolvido</SelectItem>
              <SelectItem value="Pendente">Pendente</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Client Filter */}
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">Cliente</span>
          <Select value={clientFilter} onValueChange={setClientFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Todos os Clientes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {clients.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Agent Filter */}
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">Agente</span>
          <Select value={agentFilter} onValueChange={setAgentFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Todos os Agentes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {uniqueAgents.map((a) => (
                <SelectItem key={a.id} value={a.id}>
                  {a.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Problem Type Filter */}
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">Tipo de Problema</span>
          <Select
            value={problemTypeFilter}
            onValueChange={setProblemTypeFilter}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todos os Tipos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {problemTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2 border-t mt-2">
        <Button variant="outline" size="sm" onClick={onExportCSV}>
          <FileText className="mr-2 h-4 w-4" />
          Exportar CSV
        </Button>
        <Button variant="default" size="sm" onClick={onExportPDF}>
          <Download className="mr-2 h-4 w-4" />
          Gerar PDF
        </Button>
      </div>
    </div>
  )
}
