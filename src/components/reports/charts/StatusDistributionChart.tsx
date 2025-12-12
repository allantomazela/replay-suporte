import { Pie, PieChart } from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface StatusDistributionChartProps {
  data: Array<{ name: string; value: number; fill: string }>
  staticDisplay?: boolean
  className?: string
}

const chartConfig = {
  Aberto: {
    label: 'Aberto',
    color: 'hsl(var(--chart-1))',
  },
  'Em Andamento': {
    label: 'Em Andamento',
    color: 'hsl(var(--chart-2))',
  },
  Resolvido: {
    label: 'Resolvido',
    color: 'hsl(var(--chart-3))',
  },
  Pendente: {
    label: 'Pendente',
    color: 'hsl(var(--chart-4))',
  },
} satisfies ChartConfig

export function StatusDistributionChart({
  data,
  staticDisplay = false,
  className,
}: StatusDistributionChartProps) {
  const processedData = data.map((item) => ({
    ...item,
    fill:
      (chartConfig as any)[item.name]?.color ||
      item.fill ||
      'hsl(var(--muted))',
  }))

  return (
    <Card className={cn('h-full flex flex-col', className)}>
      <CardHeader>
        <CardTitle className="text-lg">Distribuição por Status</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <div className="mx-auto aspect-square max-h-[300px]">
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[250px]"
          >
            <PieChart>
              {!staticDisplay && (
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
              )}
              <Pie
                data={processedData}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                strokeWidth={5}
                isAnimationActive={!staticDisplay}
              />
              <ChartLegend
                content={<ChartLegendContent nameKey="name" />}
                className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
              />
            </PieChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  )
}
