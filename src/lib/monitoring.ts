import { SystemLog, SystemMetric, LogSeverity } from '@/types'

// In-memory storage for mock logs and metrics since we might not have a backend connected
let memoryLogs: SystemLog[] = []
let memoryMetrics: SystemMetric[] = []

export const logSystemEvent = (
  message: string,
  severity: LogSeverity = 'info',
  source: string = 'app',
  metadata: Record<string, any> = {},
) => {
  const log: SystemLog = {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    severity,
    message,
    source,
    metadata,
  }

  // Keep only last 100 logs in memory
  memoryLogs = [log, ...memoryLogs].slice(0, 100)

  // In a real app, this would be sent to Supabase or a monitoring service
  // console.log(`[${severity.toUpperCase()}] ${message}`, metadata)

  return log
}

export const getSystemLogs = (): SystemLog[] => {
  return memoryLogs
}

export const recordMetric = (
  name: string,
  value: number,
  unit: string,
  threshold?: number,
) => {
  const status =
    threshold && value > threshold
      ? 'critical'
      : threshold && value > threshold * 0.8
        ? 'warning'
        : 'healthy'

  const metric: SystemMetric = {
    name,
    value,
    unit,
    timestamp: new Date().toISOString(),
    threshold,
    status,
  }

  memoryMetrics = [metric, ...memoryMetrics].slice(0, 50)
  return metric
}

export const getSystemMetrics = (): SystemMetric[] => {
  return memoryMetrics
}

// Mock generator for dashboard
export const generateMockMetrics = () => {
  const now = new Date().toISOString()
  return [
    {
      name: 'API Response Time',
      value: Math.floor(Math.random() * 200) + 50,
      unit: 'ms',
      timestamp: now,
      threshold: 300,
      status: 'healthy',
    },
    {
      name: 'Database Connections',
      value: Math.floor(Math.random() * 80) + 10,
      unit: '%',
      timestamp: now,
      threshold: 90,
      status: 'warning',
    },
    {
      name: 'Error Rate (1h)',
      value: parseFloat((Math.random() * 2).toFixed(2)),
      unit: '%',
      timestamp: now,
      threshold: 5,
      status: 'healthy',
    },
    {
      name: 'CPU Usage',
      value: Math.floor(Math.random() * 60) + 20,
      unit: '%',
      timestamp: now,
      threshold: 85,
      status: 'healthy',
    },
  ] as SystemMetric[]
}

// Mock logs generator
export const generateMockLogs = (): SystemLog[] => {
  const sources = ['Auth', 'Database', 'API', 'Frontend']
  const severities: LogSeverity[] = ['info', 'info', 'info', 'warning', 'error']
  const messages = [
    'User login successful',
    'Query executed in 45ms',
    'Component rendered',
    'Cache miss for key: user_settings',
    'Connection timeout retrying...',
    'Failed to fetch user profile',
    'Data synced successfully',
  ]

  return Array.from({ length: 10 }).map((_, i) => ({
    id: crypto.randomUUID(),
    timestamp: new Date(Date.now() - i * 1000 * 60 * 5).toISOString(),
    severity: severities[Math.floor(Math.random() * severities.length)],
    source: sources[Math.floor(Math.random() * sources.length)],
    message: messages[Math.floor(Math.random() * messages.length)],
  }))
}
