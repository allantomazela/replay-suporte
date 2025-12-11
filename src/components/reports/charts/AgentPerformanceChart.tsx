import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface AgentPerformanceChartProps {
  data: Array<{
    name: string
    resolved: number
    avgTime: number
  }>
}

const chartConfig = {
  resolved: {
    label: 'Resolvidos',
    color: 'hsl(var(--chart-1))',
  },
  avgTime: {
    label: 'Tempo Médio (h)',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig

export function AgentPerformanceChart({ data }: AgentPerformanceChartProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg">Performance por Agente</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ChartContainer config={chartConfig}>
            <BarChart data={data}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
              />
              <YAxis tickLine={false} axisLine={false} tickMargin={10} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar
                dataKey="resolved"
                fill="var(--color-resolved)"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="avgTime"
                fill="var(--color-avgTime)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  )
}
