import { useAppContext } from '@/context/AppContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TicketStatusBadge } from '@/components/tickets/TicketStatusBadge'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import {
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useState, useEffect } from 'react'

export default function Dashboard() {
  const { tickets } = useAppContext()
  const [filter, setFilter] = useState<'all' | 'today' | 'week'>('all')
  const [filteredTickets, setFilteredTickets] = useState(tickets)
  const [isLoading, setIsLoading] = useState(false)

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

  const MetricCard = ({ title, value, icon: Icon, colorClass }: any) => (
    <Card className="hover:shadow-elevation transition-all duration-200 hover:-translate-y-1">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className={`h-4 w-4 ${colorClass}`} />
      </CardHeader>
      <CardContent>
        <div
          className={`text-2xl font-bold ${isLoading ? 'opacity-50' : 'animate-fade-in'}`}
        >
          {value}
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex gap-2">
          <Button
            variant={filter === 'today' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('today')}
          >
            Hoje
          </Button>
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            Todos
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total de Atendimentos"
          value={totalTickets}
          icon={FileText}
          colorClass="text-blue-500"
        />
        <MetricCard
          title="Abertos"
          value={openTickets}
          icon={AlertCircle}
          colorClass="text-red-500"
        />
        <MetricCard
          title="Em Andamento"
          value={inProgressTickets}
          icon={Clock}
          colorClass="text-yellow-500"
        />
        <MetricCard
          title="Resolvidos"
          value={resolvedTickets}
          icon={CheckCircle}
          colorClass="text-green-500"
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Últimos Atendimentos</h2>
          <Link
            to="/tickets"
            className="text-primary text-sm font-medium hover:underline flex items-center"
          >
            Ver todos <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted text-muted-foreground font-semibold">
                  <tr>
                    <th className="px-4 py-3 rounded-tl-lg">Cliente</th>
                    <th className="px-4 py-3">Data</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 rounded-tr-lg">Responsável</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredTickets.slice(0, 5).map((ticket) => (
                    <tr
                      key={ticket.id}
                      className="hover:bg-muted/50 transition-colors group"
                    >
                      <td className="px-4 py-3 font-medium">
                        <Link
                          to={`/tickets/${ticket.id}`}
                          className="block w-full h-full text-primary hover:underline"
                        >
                          {ticket.clientName}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {format(
                          new Date(ticket.createdAt),
                          "dd 'de' MMM, HH:mm",
                          { locale: ptBR },
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <TicketStatusBadge status={ticket.status} />
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {ticket.responsibleName}
                      </td>
                    </tr>
                  ))}
                  {filteredTickets.length === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-4 py-8 text-center text-muted-foreground"
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
    </div>
  )
}
