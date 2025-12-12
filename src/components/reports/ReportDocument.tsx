import { Ticket } from '@/types'
import { DateRange } from 'react-day-picker'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
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
    <>
      <style>
        {`
        @media print {
          @page { size: A4; margin: 10mm; }
          body { 
            background-color: white !important; 
            color: black !important; 
            -webkit-print-color-adjust: exact; 
            print-color-adjust: exact;
          }
          /* Hide all other elements */
          body > * { 
            visibility: hidden; 
            height: 0;
            overflow: hidden;
          }
          
          /* Show Report Document */
          #report-document-container { 
            visibility: visible;
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: auto;
            z-index: 9999;
            background-color: white;
            display: block !important;
          }
          
          #report-document-container * {
            visibility: visible;
          }

          /* Utility print classes */
          .no-break { break-inside: avoid; }
          .page-break { page-break-before: always; }
          
          /* Adjust Grid/Flex for print */
          .print-grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
          .print-grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)) !important; }
        }
      `}
      </style>
      <div
        id="report-document-container"
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
            <h2 className="text-lg font-semibold mb-4 border-l-4 border-primary pl-2 uppercase tracking-wide text-slate-900">
              Resumo Executivo
            </h2>
            <div className="grid grid-cols-4 print-grid-cols-4 gap-4">
              <div className="p-4 border rounded-lg bg-slate-50 border-slate-200">
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
              <div className="p-4 border rounded-lg bg-slate-50 border-slate-200">
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
              <div className="p-4 border rounded-lg bg-slate-50 border-slate-200">
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
              <div className="p-4 border rounded-lg bg-slate-50 border-slate-200">
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
          <section className="break-inside-avoid">
            <h2 className="text-lg font-semibold mb-4 border-l-4 border-primary pl-2 uppercase tracking-wide text-slate-900">
              Volume e Distribuição
            </h2>
            <div className="grid grid-cols-2 print-grid-cols-2 gap-6">
              <div className="h-[250px] border border-slate-200 rounded-lg p-2 bg-white">
                <TicketsOverTimeChart
                  data={ticketsOverTimeData}
                  staticDisplay={true}
                  className="border-none shadow-none"
                />
              </div>
              <div className="h-[250px] border border-slate-200 rounded-lg p-2 bg-white">
                <StatusDistributionChart
                  data={statusDistributionData}
                  staticDisplay={true}
                  className="border-none shadow-none"
                />
              </div>
            </div>
          </section>

          {/* Section: Analysis */}
          <section className="break-inside-avoid">
            <h2 className="text-lg font-semibold mb-4 border-l-4 border-primary pl-2 uppercase tracking-wide text-slate-900">
              Análise Operacional
            </h2>
            <div className="grid grid-cols-2 print-grid-cols-2 gap-6">
              <div className="h-[250px] border border-slate-200 rounded-lg p-2 bg-white">
                <TopIssuesChart
                  data={topIssuesData}
                  staticDisplay={true}
                  className="border-none shadow-none"
                />
              </div>
              <div className="h-[250px] border border-slate-200 rounded-lg p-2 bg-white">
                <ArenaDistributionChart
                  data={arenaDistributionData}
                  staticDisplay={true}
                  className="border-none shadow-none"
                />
              </div>
            </div>
            <div className="mt-6 h-[250px] border border-slate-200 rounded-lg p-2 bg-white">
              <AgentPerformanceChart
                data={agentPerformanceData}
                staticDisplay={true}
                className="border-none shadow-none"
              />
            </div>
          </section>

          {/* Page Break for Table if needed */}
          <div className="page-break" />

          {/* Section: Detailed List */}
          <section>
            <h2 className="text-lg font-semibold mb-4 border-l-4 border-primary pl-2 uppercase tracking-wide text-slate-900">
              Detalhamento de Atendimentos
            </h2>
            <div className="border border-slate-200 rounded-lg bg-white">
              <DetailedTicketsTable data={detailedTickets} />
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="fixed bottom-0 left-0 w-full text-center py-4 border-t mt-8 bg-white print:block hidden text-xs text-slate-400">
          <p>
            Replay Suporte - Relatório Gerado Automaticamente - Confidencial
          </p>
        </div>
      </div>
    </>
  )
}
