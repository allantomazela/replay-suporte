import { Ticket } from '@/types'
import { DateRange } from 'react-day-picker'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { KPIStats } from './KPIStats'
import { TicketsOverTimeChart } from './charts/TicketsOverTimeChart'
import { AgentPerformanceChart } from './charts/AgentPerformanceChart'
import { StatusDistributionChart } from './charts/StatusDistributionChart'
import { TopIssuesChart } from './charts/TopIssuesChart'
import { ArenaDistributionChart } from './charts/ArenaDistributionChart'
import { DetailedTicketsTable } from './DetailedTicketsTable'
import { Clock, CheckCircle2, TicketIcon, Timer } from 'lucide-react'

interface ReportDocumentProps {
  dateRange: DateRange | undefined
  kpis: {
    total: number
    resolved: number
    avgResolutionTime: string
    avgFirstResponse: string
  }
  ticketsOverTimeData: any[]
  agentPerformanceData: any[]
  statusDistributionData: any[]
  topIssuesData: any[]
  arenaDistributionData: any[]
  detailedTickets: Ticket[]
}

export function ReportDocument({
  dateRange,
  kpis,
  ticketsOverTimeData,
  agentPerformanceData,
  statusDistributionData,
  topIssuesData,
  arenaDistributionData,
  detailedTickets,
}: ReportDocumentProps) {
  const currentDate = format(new Date(), "dd 'de' MMMM 'de' yyyy", {
    locale: ptBR,
  })

  const dateRangeString =
    dateRange?.from && dateRange?.to
      ? `${format(dateRange.from, 'dd/MM/yyyy')} a ${format(dateRange.to, 'dd/MM/yyyy')}`
      : 'Período Completo'

  return (
    <div
      id="report-document"
      className="bg-white text-black p-8 max-w-[210mm] mx-auto hidden print:block"
    >
      {/* Header */}
      <div className="flex justify-between items-start border-b pb-6 mb-8">
        <div className="flex items-center gap-4">
          <img
            src="https://img.usecurling.com/i?q=chart-pie&color=blue"
            alt="Logo"
            className="w-12 h-12"
          />
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Replay Suporte
            </h1>
            <p className="text-sm text-slate-500">
              Relatório de Performance Técnica
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-slate-900">Gerado em:</p>
          <p className="text-sm text-slate-600">{currentDate}</p>
          <p className="text-sm font-medium text-slate-900 mt-2">Período:</p>
          <p className="text-sm text-slate-600">{dateRangeString}</p>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-8">
        {/* Section: Executive Summary */}
        <section className="break-inside-avoid">
          <h2 className="text-lg font-semibold mb-4 border-l-4 border-primary pl-2 uppercase tracking-wide">
            Resumo Executivo
          </h2>
          <div className="grid grid-cols-4 gap-4">
            <div className="p-4 border rounded-lg bg-slate-50 print:bg-slate-50">
              <div className="flex flex-row items-center justify-between pb-2">
                <span className="text-sm font-medium text-slate-600">
                  Total de Tickets
                </span>
                <TicketIcon className="h-4 w-4 text-slate-400" />
              </div>
              <div className="text-2xl font-bold text-slate-900">
                {kpis.total}
              </div>
            </div>
            <div className="p-4 border rounded-lg bg-slate-50 print:bg-slate-50">
              <div className="flex flex-row items-center justify-between pb-2">
                <span className="text-sm font-medium text-slate-600">
                  Resolvidos
                </span>
                <CheckCircle2 className="h-4 w-4 text-slate-400" />
              </div>
              <div className="text-2xl font-bold text-slate-900">
                {kpis.resolved}
              </div>
            </div>
            <div className="p-4 border rounded-lg bg-slate-50 print:bg-slate-50">
              <div className="flex flex-row items-center justify-between pb-2">
                <span className="text-sm font-medium text-slate-600">
                  Tempo Médio
                </span>
                <Clock className="h-4 w-4 text-slate-400" />
              </div>
              <div className="text-2xl font-bold text-slate-900">
                {kpis.avgResolutionTime}h
              </div>
            </div>
            <div className="p-4 border rounded-lg bg-slate-50 print:bg-slate-50">
              <div className="flex flex-row items-center justify-between pb-2">
                <span className="text-sm font-medium text-slate-600">
                  1ª Resposta
                </span>
                <Timer className="h-4 w-4 text-slate-400" />
              </div>
              <div className="text-2xl font-bold text-slate-900">
                {kpis.avgFirstResponse}h
              </div>
            </div>
          </div>
        </section>

        {/* Section: Volume and Status */}
        <section className="break-inside-avoid page-break-after-auto">
          <h2 className="text-lg font-semibold mb-4 border-l-4 border-primary pl-2 uppercase tracking-wide">
            Volume e Distribuição
          </h2>
          <div className="grid grid-cols-2 gap-6">
            <div className="h-[250px] border rounded-lg p-2">
              <TicketsOverTimeChart data={ticketsOverTimeData} />
            </div>
            <div className="h-[250px] border rounded-lg p-2">
              <StatusDistributionChart data={statusDistributionData} />
            </div>
          </div>
        </section>

        {/* Section: Analysis */}
        <section className="break-inside-avoid page-break-after-auto">
          <h2 className="text-lg font-semibold mb-4 border-l-4 border-primary pl-2 uppercase tracking-wide">
            Análise Operacional
          </h2>
          <div className="grid grid-cols-2 gap-6">
            <div className="h-[250px] border rounded-lg p-2">
              <TopIssuesChart data={topIssuesData} />
            </div>
            <div className="h-[250px] border rounded-lg p-2">
              <ArenaDistributionChart data={arenaDistributionData} />
            </div>
          </div>
          <div className="mt-6 h-[250px] border rounded-lg p-2">
            <AgentPerformanceChart data={agentPerformanceData} />
          </div>
        </section>

        {/* Page Break for Table */}
        <div className="page-break" />

        {/* Section: Detailed List */}
        <section>
          <h2 className="text-lg font-semibold mb-4 border-l-4 border-primary pl-2 uppercase tracking-wide">
            Detalhamento de Atendimentos
          </h2>
          <div className="border rounded-lg">
            <DetailedTicketsTable data={detailedTickets} />
          </div>
        </section>
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 w-full text-center py-4 border-t mt-8 bg-white print:block hidden text-xs text-slate-400">
        <p>Replay Suporte - Relatório Gerado Automaticamente - Confidencial</p>
      </div>
    </div>
  )
}
