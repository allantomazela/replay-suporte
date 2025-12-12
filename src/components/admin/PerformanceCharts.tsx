import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'

const responseTimeConfig = {
  time: {
    label: 'Tempo (ms)',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig

const errorRateConfig = {
  rate: {
    label: 'Erros (%)',
    color: 'hsl(var(--destructive))',
  },
} satisfies ChartConfig

export function ResponseTimeChart({ className }: { className?: string }) {
  const [data, setData] = useState<any[]>([])

  useEffect(() => {
    // Mock data generation for graph
    const generateData = () => {
      return Array.from({ length: 20 }).map((_, i) => ({
        time: new Date(Date.now() - (20 - i) * 1000 * 60).toLocaleTimeString(
          [],
          {
            hour: '2-digit',
            minute: '2-digit',
          },
        ),
        value: Math.floor(Math.random() * 100) + 50 + (i % 5 === 0 ? 100 : 0),
      }))
    }
    setData(generateData())

    const interval = setInterval(() => {
      setData(generateData())
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <Card className={cn('h-full', className)}>
      <CardHeader>
        <CardTitle className="text-sm font-medium">
          Tempo de Resposta da API
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] w-full">
          <ChartContainer config={responseTimeConfig}>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="fillTime" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-time)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-time)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="time"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                unit="ms"
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <Area
                dataKey="value"
                type="monotone"
                fill="url(#fillTime)"
                stroke="var(--color-time)"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  )
}

export function ErrorRateChart({ className }: { className?: string }) {
  const [data, setData] = useState<any[]>([])

  useEffect(() => {
    const generateData = () => {
      return Array.from({ length: 12 }).map((_, i) => ({
        time: `${i * 5}m`,
        value: Math.random() > 0.8 ? Math.floor(Math.random() * 5) : 0,
      }))
    }
    setData(generateData())
  }, [])

  return (
    <Card className={cn('h-full', className)}>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Taxa de Erros</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] w-full">
          <ChartContainer config={errorRateConfig}>
            <BarChart data={data}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="time"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <ChartTooltip
                cursor={{ fill: 'transparent' }}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <Bar
                dataKey="value"
                fill="var(--color-rate)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  )
}
