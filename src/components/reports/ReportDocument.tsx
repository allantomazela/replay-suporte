import { Ticket } from '@/types'
import { DateRange } from 'react-day-picker'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { TicketsOverTimeChart } from './charts/TicketsOverTimeChart'
import { AgentPerformanceChart } from './charts/AgentPerformanceChart'
import { StatusDistributionChart } from './charts/StatusDistributionChart'
import { TopIssuesChart } from './charts/TopIssuesChart'
import { ArenaDistributionChart } from './charts/ArenaDistributionChart'
import { Clock, CheckCircle2, TicketIcon, Timer } from 'lucide-react'
import { cn } from '@/lib/utils'

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

// Utility to chunk array for pagination
const chunkArray = <T,>(array: T[], size: number): T[][] => {
  const result = []
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size))
  }
  return result
}

// Report Components
const ReportPage = ({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) => (
  <div
    className={cn(
      'report-page w-[210mm] h-[297mm] bg-white relative flex flex-col p-10 mx-auto shadow-lg mb-8',
      className,
    )}
  >
    {children}
  </div>
)

const ReportHeader = ({
  dateRange,
  title = 'Relatório de Performance Técnica',
}: {
  dateRange: DateRange | undefined
  title?: string
}) => {
  const currentDate = format(new Date(), "dd 'de' MMMM 'de' yyyy", {
    locale: ptBR,
  })

  const dateRangeString =
    dateRange?.from && dateRange?.to
      ? `${format(dateRange.from, 'dd/MM/yyyy')} a ${format(dateRange.to, 'dd/MM/yyyy')}`
      : 'Período Completo'

  return (
    <div className="flex justify-between items-start border-b-2 border-slate-100 pb-4 mb-8 shrink-0">
      <div className="flex items-center gap-4">
        <img
          src="/logo.svg"
          alt="Logo Replay"
          className="w-16 h-16 object-contain"
        />
        <div>
          <h1 className="text-2xl font-bold text-slate-900 leading-tight">
            Replay Suporte
          </h1>
          <p className="text-sm text-slate-500 font-medium">{title}</p>
        </div>
      </div>
      <div className="text-right">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Gerado em
          </span>
          <span className="text-sm font-medium text-slate-800">
            {currentDate}
          </span>
        </div>
        <div className="flex flex-col gap-0.5 mt-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Período
          </span>
          <span className="text-sm font-medium text-slate-800">
            {dateRangeString}
          </span>
        </div>
      </div>
    </div>
  )
}

const ReportFooter = ({
  page,
  totalPages,
}: {
  page: number
  totalPages: number
}) => (
  <div className="mt-auto pt-4 border-t border-slate-100 flex justify-between items-center text-xs text-slate-400 shrink-0">
    <p>Replay Suporte - Confidencial</p>
    <p>
      Página {page} de {totalPages}
    </p>
  </div>
)

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-lg font-bold mb-6 border-l-4 border-primary pl-3 uppercase tracking-wide text-slate-900 flex items-center shrink-0">
    {children}
  </h2>
)

const KPIBox = ({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: string | number
  icon: any
}) => (
  <div className="p-5 border rounded-xl bg-slate-50/50 border-slate-200 flex flex-col gap-3">
    <div className="flex items-center justify-between text-slate-500">
      <span className="text-sm font-semibold uppercase tracking-wider">
        {label}
      </span>
      <Icon className="w-5 h-5 opacity-70" />
    </div>
    <span className="text-3xl font-bold text-slate-900 tracking-tight">
      {value}
    </span>
  </div>
)

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
  // Constants
  const ROWS_PER_PAGE = 18
  const ticketChunks = chunkArray(detailedTickets, ROWS_PER_PAGE)
  const totalPages = 2 + (ticketChunks.length || 1) // 2 fixed pages + table pages

  // CSS variables for light theme forcing
  const lightThemeVars = {
    '--background': '0 0% 100%',
    '--foreground': '222.2 84% 4.9%',
    '--card': '0 0% 100%',
    '--card-foreground': '222.2 84% 4.9%',
    '--popover': '0 0% 100%',
    '--popover-foreground': '222.2 84% 4.9%',
    '--primary': '222.2 47.4% 11.2%',
    '--primary-foreground': '210 40% 98%',
    '--secondary': '210 40% 96.1%',
    '--secondary-foreground': '222.2 47.4% 11.2%',
    '--muted': '210 40% 96.1%',
    '--muted-foreground': '215.4 16.3% 46.9%',
    '--accent': '210 40% 96.1%',
    '--accent-foreground': '222.2 47.4% 11.2%',
    '--destructive': '0 84.2% 60.2%',
    '--destructive-foreground': '210 40% 98%',
    '--border': '214.3 31.8% 91.4%',
    '--input': '214.3 31.8% 91.4%',
    '--ring': '222.2 84% 4.9%',
    '--radius': '0.5rem',
  } as React.CSSProperties

  return (
    <div
      id="report-document-container"
      className="absolute top-0 left-[-9999px] pointer-events-none"
      style={lightThemeVars}
    >
      {/* PAGE 1: Executive Summary & Volume */}
      <ReportPage>
        <ReportHeader dateRange={dateRange} />

        <SectionTitle>Resumo Executivo</SectionTitle>
        <div className="grid grid-cols-4 gap-6 mb-10 shrink-0">
          <KPIBox label="Total Tickets" value={kpis.total} icon={TicketIcon} />
          <KPIBox
            label="Resolvidos"
            value={kpis.resolved}
            icon={CheckCircle2}
          />
          <KPIBox
            label="Tempo Médio"
            value={`${kpis.avgResolutionTime}h`}
            icon={Clock}
          />
          <KPIBox
            label="1ª Resposta"
            value={`${kpis.avgFirstResponse}h`}
            icon={Timer}
          />
        </div>

        <SectionTitle>Volume e Distribuição</SectionTitle>
        <div className="grid grid-cols-2 gap-8 mb-4 grow">
          <div className="h-full min-h-[250px] border border-slate-200 rounded-xl p-4 bg-white shadow-sm">
            <TicketsOverTimeChart
              data={ticketsOverTimeData}
              staticDisplay={true}
              className="border-none shadow-none h-full"
            />
          </div>
          <div className="h-full min-h-[250px] border border-slate-200 rounded-xl p-4 bg-white shadow-sm">
            <StatusDistributionChart
              data={statusDistributionData}
              staticDisplay={true}
              className="border-none shadow-none h-full"
            />
          </div>
        </div>

        <ReportFooter page={1} totalPages={totalPages} />
      </ReportPage>

      {/* PAGE 2: Operational Analysis */}
      <ReportPage>
        <ReportHeader dateRange={dateRange} />

        <SectionTitle>Análise Operacional</SectionTitle>

        <div className="grid grid-cols-2 gap-8 mb-8 shrink-0 h-[300px]">
          <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-sm">
            <TopIssuesChart
              data={topIssuesData}
              staticDisplay={true}
              className="border-none shadow-none h-full"
            />
          </div>
          <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-sm">
            <ArenaDistributionChart
              data={arenaDistributionData}
              staticDisplay={true}
              className="border-none shadow-none h-full"
            />
          </div>
        </div>

        <SectionTitle>Performance da Equipe</SectionTitle>
        <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-sm grow mb-4 max-h-[350px]">
          <AgentPerformanceChart
            data={agentPerformanceData}
            staticDisplay={true}
            className="border-none shadow-none h-full"
          />
        </div>

        <ReportFooter page={2} totalPages={totalPages} />
      </ReportPage>

      {/* PAGE 3+: Detailed List */}
      {ticketChunks.length > 0 ? (
        ticketChunks.map((chunk, index) => (
          <ReportPage key={index}>
            <ReportHeader dateRange={dateRange} />

            <SectionTitle>
              Detalhamento de Atendimentos
              <span className="ml-2 text-sm font-normal text-slate-500 normal-case">
                (Parte {index + 1} de {ticketChunks.length})
              </span>
            </SectionTitle>

            <div className="grow">
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-3 w-[10%]">ID</th>
                      <th className="p-3 w-[15%]">Data</th>
                      <th className="p-3 w-[20%]">Cliente</th>
                      <th className="p-3 w-[25%]">Assunto</th>
                      <th className="p-3 w-[15%]">Agente</th>
                      <th className="p-3 w-[15%]">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {chunk.map((ticket) => (
                      <tr key={ticket.id} className="hover:bg-slate-50/50">
                        <td className="p-3 font-mono text-slate-600">
                          {ticket.id}
                        </td>
                        <td className="p-3 text-slate-600">
                          {format(new Date(ticket.createdAt), 'dd/MM/yy HH:mm')}
                        </td>
                        <td className="p-3 font-medium text-slate-900 truncate max-w-[150px]">
                          {ticket.clientName}
                        </td>
                        <td className="p-3 text-slate-600 truncate max-w-[200px]">
                          {ticket.title}
                        </td>
                        <td className="p-3 text-slate-600">
                          {ticket.responsibleName}
                        </td>
                        <td className="p-3">
                          <span
                            className={cn(
                              'px-2 py-1 rounded-full text-xs font-semibold border',
                              ticket.status === 'Resolvido' &&
                                'bg-green-50 text-green-700 border-green-200',
                              ticket.status === 'Em Andamento' &&
                                'bg-blue-50 text-blue-700 border-blue-200',
                              ticket.status === 'Pendente' &&
                                'bg-yellow-50 text-yellow-700 border-yellow-200',
                              ticket.status === 'Aberto' &&
                                'bg-slate-100 text-slate-700 border-slate-200',
                            )}
                          >
                            {ticket.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <ReportFooter page={3 + index} totalPages={totalPages} />
          </ReportPage>
        ))
      ) : (
        <ReportPage>
          <ReportHeader dateRange={dateRange} />
          <SectionTitle>Detalhamento de Atendimentos</SectionTitle>
          <div className="grow flex items-center justify-center text-slate-400">
            Nenhum ticket encontrado para o período selecionado.
          </div>
          <ReportFooter page={3} totalPages={totalPages} />
        </ReportPage>
      )}
    </div>
  )
}
