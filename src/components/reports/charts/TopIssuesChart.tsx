import { Bar, BarChart, CartesianGrid, XAxis, YAxis, LabelList } from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface TopIssuesChartProps {
  data: Array<{ name: string; count: number }>
  staticDisplay?: boolean
  className?: string
}

const chartConfig = {
  count: {
    label: 'Ocorrências',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig

export function TopIssuesChart({
  data,
  staticDisplay = false,
  className,
}: TopIssuesChartProps) {
  const sortedData = [...data].sort((a, b) => b.count - a.count).slice(0, 8)

  return (
    <Card className={cn('h-full', className)}>
      <CardHeader>
        <CardTitle className="text-lg">Top Problemas Recorrentes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ChartContainer config={chartConfig}>
            <BarChart
              data={sortedData}
              layout="vertical"
              margin={{ left: 0, right: 30 }}
            >
              <CartesianGrid horizontal={false} strokeDasharray="3 3" />
              <YAxis
                dataKey="name"
                type="category"
                tickLine={false}
                axisLine={false}
                width={100}
                tick={{ fontSize: 12 }}
              />
              <XAxis type="number" hide />
              {!staticDisplay && (
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="line" />}
                />
              )}
              <Bar
                dataKey="count"
                fill="var(--color-count)"
                radius={[0, 4, 4, 0]}
                barSize={32}
                isAnimationActive={!staticDisplay}
              >
                <LabelList
                  dataKey="count"
                  position="right"
                  className="fill-foreground"
                  fontSize={12}
                />
              </Bar>
            </BarChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  )
}
