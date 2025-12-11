import { useParams, Link } from 'react-router-dom'
import { useAppContext } from '@/context/AppContext'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { TicketStatusBadge } from '@/components/tickets/TicketStatusBadge'
import { ArrowLeft, Edit, Paperclip, Clock, User, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useState } from 'react'
import { TicketFormDialog } from './TicketForm'

export default function TicketDetail() {
  const { id } = useParams<{ id: string }>()
  const { getTicketById } = useAppContext()
  const [isEditOpen, setIsEditOpen] = useState(false)

  const ticket = getTicketById(id || '')

  if (!ticket) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <h2 className="text-2xl font-bold mb-4">Atendimento não encontrado</h2>
        <Button asChild>
          <Link to="/tickets">Voltar para a lista</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/tickets">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            Atendimento #{ticket.id}
            <TicketStatusBadge status={ticket.status} />
          </h1>
          <p className="text-muted-foreground">{ticket.clientName}</p>
        </div>
        <Button onClick={() => setIsEditOpen(true)}>
          <Edit className="mr-2 h-4 w-4" /> Editar
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Descrição do Problema</CardTitle>
              <CardDescription>{ticket.title}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/30 p-4 rounded-md text-sm whitespace-pre-wrap">
                {ticket.description}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Passos da Solução</CardTitle>
            </CardHeader>
            <CardContent>
              {ticket.solutionSteps ? (
                <div className="bg-muted/30 p-4 rounded-md text-sm whitespace-pre-wrap">
                  {ticket.solutionSteps}
                </div>
              ) : (
                <p className="text-muted-foreground italic">
                  Nenhuma solução registrada ainda.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Anexos</CardTitle>
            </CardHeader>
            <CardContent>
              {ticket.attachments && ticket.attachments.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {/* Mock Attachments render */}
                  {ticket.attachments.map((att) => (
                    <div
                      key={att.id}
                      className="border p-2 rounded flex items-center justify-center"
                    >
                      {att.name}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
                  <Paperclip className="h-8 w-8 mb-2 opacity-50" />
                  <p>Sem anexos</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Details */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Detalhes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">Criado em</p>
                  <p className="text-muted-foreground">
                    {format(new Date(ticket.createdAt), 'dd MMM yyyy, HH:mm', {
                      locale: ptBR,
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">Última atualização</p>
                  <p className="text-muted-foreground">
                    {format(new Date(ticket.updatedAt), 'dd MMM yyyy, HH:mm', {
                      locale: ptBR,
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">Responsável</p>
                  <p className="text-muted-foreground">
                    {ticket.responsibleName}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <TicketFormDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        ticket={ticket}
      />
    </div>
  )
}
