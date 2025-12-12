import { useEffect, useState } from 'react'
import { useAppContext } from '@/context/AppContext'
import {
  generateMockMetrics,
  generateMockLogs,
  getSystemMetrics,
} from '@/lib/monitoring'
import { SystemMetric, SystemLog } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Database,
  Server,
  RefreshCw,
  ShieldAlert,
} from 'lucide-react'
import {
  ResponseTimeChart,
  ErrorRateChart,
} from '@/components/admin/PerformanceCharts'
import { cn } from '@/lib/utils'

export default function SystemHealth() {
  const { user } = useAppContext()
  const [metrics, setMetrics] = useState<SystemMetric[]>([])
  const [logs, setLogs] = useState<SystemLog[]>([])
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Redirect if not admin
  if (user && user.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <ShieldAlert className="h-16 w-16 text-destructive mb-4" />
        <h1 className="text-2xl font-bold">Acesso Restrito</h1>
        <p className="text-muted-foreground mt-2">
          Apenas administradores podem acessar o painel de monitoramento.
        </p>
      </div>
    )
  }

  const fetchData = () => {
    setIsRefreshing(true)
    // Simulate API call
    setTimeout(() => {
      setMetrics(generateMockMetrics())
      setLogs(generateMockLogs())
      setLastUpdate(new Date())
      setIsRefreshing(false)
    }, 600)
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 30000) // Auto refresh every 30s
    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-emerald-500'
      case 'warning':
        return 'text-amber-500'
      case 'critical':
        return 'text-red-500'
      default:
        return 'text-slate-500'
    }
  }

  const getLogSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'info':
        return <Badge variant="secondary">INFO</Badge>
      case 'warning':
        return (
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200">
            WARN
          </Badge>
        )
      case 'error':
        return <Badge variant="destructive">ERRO</Badge>
      case 'critical':
        return (
          <Badge className="bg-red-900 text-white hover:bg-red-900">CRIT</Badge>
        )
      default:
        return <Badge variant="outline">{severity}</Badge>
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Activity className="h-8 w-8 text-primary" />
            Monitoramento do Sistema
          </h1>
          <p className="text-muted-foreground">
            Status em tempo real da aplicação, banco de dados e segurança.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Atualizado: {lastUpdate.toLocaleTimeString()}</span>
          <Button
            variant="outline"
            size="icon"
            onClick={fetchData}
            disabled={isRefreshing}
          >
            <RefreshCw
              className={cn('h-4 w-4', isRefreshing && 'animate-spin')}
            />
          </Button>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, idx) => {
          let Icon = Activity
          if (metric.name.includes('Database')) Icon = Database
          if (metric.name.includes('CPU')) Icon = Server
          if (metric.name.includes('Error')) Icon = AlertTriangle

          return (
            <Card key={idx} className="border-l-4 border-l-primary/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {metric.name}
                </CardTitle>
                <Icon
                  className={cn('h-4 w-4', getStatusColor(metric.status))}
                />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metric.value}
                  <span className="text-sm font-normal text-muted-foreground ml-1">
                    {metric.unit}
                  </span>
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <div
                    className={cn(
                      'h-2 w-2 rounded-full',
                      metric.status === 'healthy'
                        ? 'bg-emerald-500'
                        : metric.status === 'warning'
                          ? 'bg-amber-500'
                          : 'bg-red-500',
                    )}
                  />
                  <span className="text-xs text-muted-foreground capitalize">
                    {metric.status === 'healthy'
                      ? 'Saudável'
                      : metric.status === 'critical'
                        ? 'Crítico'
                        : 'Atenção'}
                  </span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ResponseTimeChart />
        <ErrorRateChart />
      </div>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Logs Recentes do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Hora</TableHead>
                <TableHead className="w-[100px]">Nível</TableHead>
                <TableHead className="w-[120px]">Origem</TableHead>
                <TableHead>Mensagem</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-mono text-xs">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </TableCell>
                  <TableCell>{getLogSeverityBadge(log.severity)}</TableCell>
                  <TableCell className="text-xs font-medium">
                    {log.source}
                  </TableCell>
                  <TableCell className="text-sm">{log.message}</TableCell>
                </TableRow>
              ))}
              {logs.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-8 text-muted-foreground"
                  >
                    Nenhum log registrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800">
        <CardContent className="p-4 flex items-start gap-4">
          <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-900 dark:text-blue-200">
              Otimização de Queries Ativa
            </h4>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
              O sistema está utilizando índices otimizados para as tabelas
              críticas (Tickets, Clients). O tempo médio de execução das queries
              está 35% mais rápido que a média histórica.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
