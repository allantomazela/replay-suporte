import { Bar, BarChart, CartesianGrid, XAxis, YAxis, LabelList } from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface ArenaDistributionChartProps {
  data: Array<{ name: string; count: number }>
  staticDisplay?: boolean
  className?: string
}

const chartConfig = {
  count: {
    label: 'Atendimentos',
    color: 'hsl(var(--chart-4))',
  },
} satisfies ChartConfig

export function ArenaDistributionChart({
  data,
  staticDisplay = false,
  className,
}: ArenaDistributionChartProps) {
  const sortedData = [...data].sort((a, b) => b.count - a.count).slice(0, 10)

  return (
    <Card className={cn('h-full', className)}>
      <CardHeader>
        <CardTitle className="text-lg">Atendimentos por Arena</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ChartContainer config={chartConfig}>
            <BarChart data={sortedData} margin={{ top: 20 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) =>
                  value.length > 10 ? `${value.slice(0, 10)}...` : value
                }
              />
              <YAxis tickLine={false} axisLine={false} />
              {!staticDisplay && (
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dashed" />}
                />
              )}
              <Bar
                dataKey="count"
                fill="var(--color-count)"
                radius={[4, 4, 0, 0]}
                isAnimationActive={!staticDisplay}
              >
                <LabelList
                  dataKey="count"
                  position="top"
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
