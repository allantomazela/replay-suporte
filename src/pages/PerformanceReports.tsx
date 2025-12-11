import { useState, useMemo } from 'react'
import { useAppContext } from '@/context/AppContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AgentPerformanceChart } from '@/components/reports/charts/AgentPerformanceChart'
import { differenceInHours } from 'date-fns'

export default function PerformanceReports() {
  const { tickets } = useAppContext()

  const agentPerformanceData = useMemo(() => {
    const agentMap = new Map<
      string,
      { resolved: number; totalTime: number; count: number }
    >()

    tickets.forEach((t) => {
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
  }, [tickets])

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Performance de Agentes</h1>
        <p className="text-muted-foreground">
          Análise detalhada do desempenho da equipe de suporte.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <AgentPerformanceChart data={agentPerformanceData} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agentPerformanceData.map((agent) => (
          <Card key={agent.name}>
            <CardHeader>
              <CardTitle>{agent.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Resolvidos:</span>
                  <span className="font-bold">{agent.resolved}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tempo Médio:</span>
                  <span className="font-bold">{agent.avgTime}h</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
