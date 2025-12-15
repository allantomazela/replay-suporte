import { Ticket, TicketStatus } from '@/types'

export interface SLAMetrics {
  ticketId: string
  createdAt: string
  firstResponseTime?: number // em minutos
  resolutionTime?: number // em minutos
  status: TicketStatus
  isWithinSLA: boolean
  slaTarget: {
    firstResponse: number // minutos
    resolution: number // minutos
  }
}

/**
 * Calcula métricas de SLA para um ticket
 */
export function calculateSLAMetrics(
  ticket: Ticket,
  slaTargets: { firstResponse: number; resolution: number } = {
    firstResponse: 60, // 1 hora
    resolution: 480, // 8 horas
  }
): SLAMetrics {
  const now = new Date()
  const createdAt = new Date(ticket.createdAt)
  const updatedAt = new Date(ticket.updatedAt)

  // Tempo desde criação (em minutos)
  const timeSinceCreation = Math.floor(
    (now.getTime() - createdAt.getTime()) / (1000 * 60)
  )

  // Primeira resposta (assumindo que updatedAt é quando foi respondido)
  // Em produção, você teria um campo específico para primeira resposta
  const firstResponseTime =
    updatedAt > createdAt
      ? Math.floor((updatedAt.getTime() - createdAt.getTime()) / (1000 * 60))
      : undefined

  // Tempo de resolução (se status for Resolvido)
  const resolutionTime =
    ticket.status === 'Resolvido'
      ? Math.floor((updatedAt.getTime() - createdAt.getTime()) / (1000 * 60))
      : undefined

  // Verificar se está dentro do SLA
  const isWithinSLA =
    (!firstResponseTime || firstResponseTime <= slaTargets.firstResponse) &&
    (!resolutionTime || resolutionTime <= slaTargets.resolution)

  return {
    ticketId: ticket.id,
    createdAt: ticket.createdAt,
    firstResponseTime,
    resolutionTime,
    status: ticket.status,
    isWithinSLA,
    slaTarget: slaTargets,
  }
}

/**
 * Calcula estatísticas de SLA para múltiplos tickets
 */
export function calculateSLAStats(tickets: Ticket[]) {
  const metrics = tickets.map((ticket) => calculateSLAMetrics(ticket))

  const total = metrics.length
  const withinSLA = metrics.filter((m) => m.isWithinSLA).length
  const outsideSLA = total - withinSLA

  const avgFirstResponse = metrics
    .filter((m) => m.firstResponseTime)
    .reduce((sum, m) => sum + (m.firstResponseTime || 0), 0) /
    metrics.filter((m) => m.firstResponseTime).length || 0

  const avgResolution = metrics
    .filter((m) => m.resolutionTime)
    .reduce((sum, m) => sum + (m.resolutionTime || 0), 0) /
    metrics.filter((m) => m.resolutionTime).length || 0

  const slaCompliance = total > 0 ? (withinSLA / total) * 100 : 0

  return {
    total,
    withinSLA,
    outsideSLA,
    slaCompliance: Math.round(slaCompliance * 100) / 100,
    avgFirstResponse: Math.round(avgFirstResponse),
    avgResolution: Math.round(avgResolution),
    metrics,
  }
}

/**
 * Formata tempo em minutos para string legível
 */
export function formatSLATime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`
  }
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (mins === 0) {
    return `${hours}h`
  }
  return `${hours}h ${mins}min`
}

