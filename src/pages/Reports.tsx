import { useState, useMemo } from 'react'
import { useAppContext } from '@/context/AppContext'
import { ReportFilters } from '@/components/reports/ReportFilters'
import { KPIStats } from '@/components/reports/KPIStats'
import { TicketsOverTimeChart } from '@/components/reports/charts/TicketsOverTimeChart'
import { AgentPerformanceChart } from '@/components/reports/charts/AgentPerformanceChart'
import { StatusDistributionChart } from '@/components/reports/charts/StatusDistributionChart'
import { TopIssuesChart } from '@/components/reports/charts/TopIssuesChart'
import { ArenaDistributionChart } from '@/components/reports/charts/ArenaDistributionChart'
import { DetailedTicketsTable } from '@/components/reports/DetailedTicketsTable'
import { ReportDocument } from '@/components/reports/ReportDocument'
import { DateRange } from 'react-day-picker'
import { subDays, isWithinInterval, format, differenceInHours } from 'date-fns'
import { Clock, CheckCircle2, TicketIcon, Timer } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function Reports() {
  const { tickets, clients } = useAppContext()
  const { toast } = useToast()

  // Filters State
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  })
  const [statusFilter, setStatusFilter] = useState('all')
  const [clientFilter, setClientFilter] = useState('all')
  const [agentFilter, setAgentFilter] = useState('all')
  const [problemTypeFilter, setProblemTypeFilter] = useState('all')

  // Data Filtering
  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      // Date Filter
      if (dateRange?.from) {
        const ticketDate = new Date(ticket.createdAt)
        const end = dateRange.to || dateRange.from
        // Adjust end date to end of day for inclusive comparison
        const adjustedEnd = new Date(end)
        adjustedEnd.setHours(23, 59, 59, 999)

        if (
          !isWithinInterval(ticketDate, {
            start: dateRange.from,
            end: adjustedEnd,
          })
        ) {
          return false
        }
      }

      // Other Filters
      if (statusFilter !== 'all' && ticket.status !== statusFilter) return false
      if (clientFilter !== 'all' && ticket.clientId !== clientFilter)
        return false
      if (agentFilter !== 'all' && ticket.responsibleId !== agentFilter)
        return false
      if (
        problemTypeFilter !== 'all' &&
        ticket.customData?.problemType !== problemTypeFilter
      )
        return false

      return true
    })
  }, [
    tickets,
    dateRange,
    statusFilter,
    clientFilter,
    agentFilter,
    problemTypeFilter,
  ])

  // KPIs Calculation
  const kpis = useMemo(() => {
    const total = filteredTickets.length
    const resolved = filteredTickets.filter(
      (t) => t.status === 'Resolvido',
    ).length

    // Avg Resolution Time (hours)
    let totalResolutionHours = 0
    let resolvedCount = 0
    filteredTickets.forEach((t) => {
      if (t.status === 'Resolvido') {
        const diff = differenceInHours(
          new Date(t.updatedAt),
          new Date(t.createdAt),
        )
        totalResolutionHours += diff > 0 ? diff : 0
        resolvedCount++
      }
    })
    const avgResolutionTime = resolvedCount
      ? (totalResolutionHours / resolvedCount).toFixed(1)
      : '0'

    // Avg First Response (Simulated: 20% of resolution time or 2h if open)
    const avgFirstResponse = resolvedCount
      ? (totalResolutionHours / resolvedCount / 5).toFixed(1)
      : '0.5'

    return { total, resolved, avgResolutionTime, avgFirstResponse }
  }, [filteredTickets])

  // Charts Data Preparation
  const ticketsOverTimeData = useMemo(() => {
    const map = new Map<string, number>()
    filteredTickets.forEach((t) => {
      const date = format(new Date(t.createdAt), 'dd/MM')
      map.set(date, (map.get(date) || 0) + 1)
    })
    return Array.from(map.entries())
      .map(([date, count]) => ({ date, count }))
      .reverse()
  }, [filteredTickets])

  const agentPerformanceData = useMemo(() => {
    const agentMap = new Map<
      string,
      { resolved: number; totalTime: number; count: number }
    >()

    filteredTickets.forEach((t) => {
      if (!agentMap.has(t.responsibleName)) {
        agentMap.set(t.responsibleName, { resolved: 0, totalTime: 0, count: 0 })
      }
      const agent = agentMap.get(t.responsibleName)!

      if (t.status === 'Resolvido') {
        agent.resolved += 1
        const time = differenceInHours(
          new Date(t.updatedAt),
          new Date(t.createdAt),
        )
        agent.totalTime += time > 0 ? time : 0
        agent.count += 1
      }
    })

    return Array.from(agentMap.entries()).map(([name, data]) => ({
      name,
      resolved: data.resolved,
      avgTime: data.count
        ? parseFloat((data.totalTime / data.count).toFixed(1))
        : 0,
    }))
  }, [filteredTickets])

  const statusDistributionData = useMemo(() => {
    const statusMap = new Map<string, number>()
    filteredTickets.forEach((t) => {
      statusMap.set(t.status, (statusMap.get(t.status) || 0) + 1)
    })
    return Array.from(statusMap.entries()).map(([name, value]) => ({
      name,
      value,
      fill: '', // Will be assigned in component
    }))
  }, [filteredTickets])

  const topIssuesData = useMemo(() => {
    const map = new Map<string, number>()
    filteredTickets.forEach((t) => {
      const type = t.customData?.problemType || 'Não Classificado'
      map.set(type, (map.get(type) || 0) + 1)
    })
    return Array.from(map.entries()).map(([name, count]) => ({ name, count }))
  }, [filteredTickets])

  const arenaDistributionData = useMemo(() => {
    const map = new Map<string, number>()
    filteredTickets.forEach((t) => {
      const client = clients.find((c) => c.id === t.clientId)
      const name = client ? client.arenaName : 'Desconhecida'
      map.set(name, (map.get(name) || 0) + 1)
    })
    return Array.from(map.entries()).map(([name, count]) => ({ name, count }))
  }, [filteredTickets, clients])

  // Exports
  const handleExportPDF = () => {
    toast({
      title: 'Gerando PDF',
      description: 'Preparando documento para impressão...',
    })
    // Delay slightly to ensure toast renders and state stabilizes if needed
    setTimeout(() => {
      window.print()
    }, 500)
  }

  const handleExportCSV = () => {
    const headers = [
      'ID',
      'Cliente',
      'Arena',
      'Assunto',
      'Tipo de Problema',
      'Status',
      'Responsável',
      'Data Criação',
      'Data Atualização',
    ]
    const rows = filteredTickets.map((t) => {
      const client = clients.find((c) => c.id === t.clientId)
      return [
        t.id,
        t.clientName,
        client?.arenaName || '',
        t.title,
        t.customData?.problemType || '',
        t.status,
        t.responsibleName,
        t.createdAt,
        t.updatedAt,
      ]
    })

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', 'relatorio_atendimentos.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: 'CSV Exportado',
      description: 'O arquivo foi baixado com sucesso.',
    })
  }

  return (
    <>
      <div className="space-y-8 animate-fade-in print:hidden">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <h1 className="text-3xl font-bold">Relatórios de Performance</h1>
        </div>

        <ReportFilters
          dateRange={dateRange}
          setDateRange={setDateRange}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          clientFilter={clientFilter}
          setClientFilter={setClientFilter}
          agentFilter={agentFilter}
          setAgentFilter={setAgentFilter}
          problemTypeFilter={problemTypeFilter}
          setProblemTypeFilter={setProblemTypeFilter}
          onExportPDF={handleExportPDF}
          onExportCSV={handleExportCSV}
        />

        <KPIStats
          stats={[
            {
              title: 'Total de Tickets',
              value: kpis.total,
              icon: TicketIcon,
              description: 'No período selecionado',
            },
            {
              title: 'Tickets Resolvidos',
              value: kpis.resolved,
              icon: CheckCircle2,
              description: 'Total finalizado',
            },
            {
              title: 'Tempo Médio Resolução',
              value: `${kpis.avgResolutionTime}h`,
              icon: Clock,
              description: 'Horas por ticket',
            },
            {
              title: 'Tempo Médio 1ª Resposta',
              value: `${kpis.avgFirstResponse}h`,
              icon: Timer,
              description: 'Estimativa',
            },
          ]}
        />

        {/* Primary Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TicketsOverTimeChart data={ticketsOverTimeData} />
          <StatusDistributionChart data={statusDistributionData} />
        </div>

        {/* Secondary Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TopIssuesChart data={topIssuesData} />
          <ArenaDistributionChart data={arenaDistributionData} />
        </div>

        {/* Tertiary Charts */}
        <div className="grid grid-cols-1 gap-6">
          <AgentPerformanceChart data={agentPerformanceData} />
        </div>

        {/* Detailed Table Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Detalhamento dos Tickets</h2>
          <DetailedTicketsTable data={filteredTickets} />
        </div>
      </div>

      {/* Hidden Print Document */}
      <ReportDocument
        dateRange={dateRange}
        kpis={kpis}
        ticketsOverTimeData={ticketsOverTimeData}
        agentPerformanceData={agentPerformanceData}
        statusDistributionData={statusDistributionData}
        topIssuesData={topIssuesData}
        arenaDistributionData={arenaDistributionData}
        detailedTickets={filteredTickets}
      />
    </>
  )
}
