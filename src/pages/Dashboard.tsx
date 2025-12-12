import { useAppContext } from '@/context/AppContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TicketStatusBadge } from '@/components/tickets/TicketStatusBadge'
import { Button } from '@/components/ui/button'
import { Link, useNavigate } from 'react-router-dom'
import {
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  BarChart3,
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

export default function Dashboard() {
  const { tickets } = useAppContext()
  const [filter, setFilter] = useState<'all' | 'today' | 'week'>('all')
  const [filteredTickets, setFilteredTickets] = useState(tickets)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  // Metrics
  const totalTickets = tickets.length
  const openTickets = tickets.filter((t) => t.status === 'Aberto').length
  const inProgressTickets = tickets.filter(
    (t) => t.status === 'Em Andamento',
  ).length
  const resolvedTickets = tickets.filter((t) => t.status === 'Resolvido').length

  useEffect(() => {
    // Simulate real-time update
    setIsLoading(true)
    const timer = setTimeout(() => {
      let res = tickets
      if (filter === 'today') {
        const today = new Date().toISOString().split('T')[0]
        res = tickets.filter((t) => t.createdAt.startsWith(today))
      }
      // Simplified logic for week
      setFilteredTickets(res)
      setIsLoading(false)
    }, 300)
    return () => clearTimeout(timer)
  }, [tickets, filter])

  const MetricCard = ({
    title,
    value,
    icon: Icon,
    colorClass,
    bgClass,
  }: any) => (
    <Card className="hover:shadow-md transition-all duration-200 border-l-4 border-l-transparent hover:border-l-primary">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={cn('p-2 rounded-full', bgClass)}>
          <Icon className={cn('h-4 w-4', colorClass)} />
        </div>
      </CardHeader>
      <CardContent>
        <div
          className={cn(
            'text-2xl font-bold text-foreground',
            isLoading ? 'opacity-50' : 'animate-fade-in',
          )}
        >
          {value}
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Dashboard
        </h1>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            className="hidden md:flex"
            onClick={() => navigate('/reports')}
          >
            <BarChart3 className="mr-2 h-4 w-4" />
            Relatórios
          </Button>
          <div className="flex gap-2 bg-muted p-1 rounded-lg">
            <Button
              variant={filter === 'today' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFilter('today')}
              className={
                filter === 'today' ? 'shadow-sm' : 'hover:bg-background/50'
              }
            >
              Hoje
            </Button>
            <Button
              variant={filter === 'all' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFilter('all')}
              className={
                filter === 'all' ? 'shadow-sm' : 'hover:bg-background/50'
              }
            >
              Todos
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total de Atendimentos"
          value={totalTickets}
          icon={FileText}
          colorClass="text-blue-600 dark:text-blue-400"
          bgClass="bg-blue-100 dark:bg-blue-900/20"
        />
        <MetricCard
          title="Abertos"
          value={openTickets}
          icon={AlertCircle}
          colorClass="text-red-600 dark:text-red-400"
          bgClass="bg-red-100 dark:bg-red-900/20"
        />
        <MetricCard
          title="Em Andamento"
          value={inProgressTickets}
          icon={Clock}
          colorClass="text-amber-600 dark:text-amber-400"
          bgClass="bg-amber-100 dark:bg-amber-900/20"
        />
        <MetricCard
          title="Resolvidos"
          value={resolvedTickets}
          icon={CheckCircle}
          colorClass="text-emerald-600 dark:text-emerald-400"
          bgClass="bg-emerald-100 dark:bg-emerald-900/20"
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">
            Últimos Atendimentos
          </h2>
          <Link
            to="/tickets"
            className="text-primary text-sm font-medium hover:underline flex items-center group"
          >
            Ver todos{' '}
            <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <Card className="overflow-hidden border shadow-sm">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-muted-foreground font-semibold">
                  <tr>
                    <th className="px-6 py-4">Cliente</th>
                    <th className="px-6 py-4">Data</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Responsável</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredTickets.slice(0, 5).map((ticket) => (
                    <tr
                      key={ticket.id}
                      className="hover:bg-muted/30 transition-colors group"
                    >
                      <td className="px-6 py-4 font-medium">
                        <Link
                          to={`/tickets/${ticket.id}`}
                          className="block w-full h-full text-foreground hover:text-primary transition-colors"
                        >
                          {ticket.clientName}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {format(
                          new Date(ticket.createdAt),
                          "dd 'de' MMM, HH:mm",
                          { locale: ptBR },
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <TicketStatusBadge status={ticket.status} />
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {ticket.responsibleName}
                      </td>
                    </tr>
                  ))}
                  {filteredTickets.length === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-6 py-12 text-center text-muted-foreground"
                      >
                        Nenhum atendimento recente.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions / Access to Reports */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Relatórios Completos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm mb-4">
              Acesse indicadores detalhados, tendências de volume e problemas
              recorrentes.
            </p>
            <Button
              className="w-full"
              variant="secondary"
              onClick={() => navigate('/reports')}
            >
              Acessar Relatórios
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
