import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAppContext } from '@/context/AppContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  Edit,
  MapPin,
  Phone,
  Building2,
  Ticket as TicketIcon,
} from 'lucide-react'
import { ClientFormDialog } from '@/components/clients/ClientFormDialog'
import { AuditHistory } from '@/components/audit/AuditHistory'

export default function ClientProfile() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getClientById, tickets, user } = useAppContext()
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const client = id ? getClientById(id) : undefined

  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <h2 className="text-2xl font-bold">Cliente não encontrado</h2>
        <Button variant="outline" onClick={() => navigate('/clients')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para lista
        </Button>
      </div>
    )
  }

  const clientTickets = tickets.filter((t) => t.clientId === client.id)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/clients')}
          className="shrink-0"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">{client.name}</h1>
            <Badge variant={client.active ? 'default' : 'secondary'}>
              {client.active ? 'Ativo' : 'Inativo'}
            </Badge>
          </div>
          <p className="text-muted-foreground">{client.arenaName}</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Edit className="mr-2 h-4 w-4" /> Editar
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Informações de Contato</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium leading-none">
                  Cidade/Estado
                </p>
                <p className="text-sm text-muted-foreground">{client.city}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium leading-none">Telefone</p>
                <p className="text-sm text-muted-foreground">{client.phone}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Dados da Arena</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium leading-none">
                  Nome da Arena
                </p>
                <p className="text-sm text-muted-foreground">
                  {client.arenaName}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <TicketIcon className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium leading-none">
                  Código da Arena
                </p>
                <p className="text-sm text-muted-foreground">
                  {client.arenaCode}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Histórico de Atendimentos</h2>
        {clientTickets.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {clientTickets.map((ticket) => (
              <Card
                key={ticket.id}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/tickets/${ticket.id}`)}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <Badge variant="outline">{ticket.status}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <CardTitle className="text-base line-clamp-1 mt-2">
                    {ticket.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {ticket.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border rounded-lg bg-muted/10">
            <p className="text-muted-foreground">
              Nenhum atendimento registrado para este cliente.
            </p>
          </div>
        )}
      </div>

      {/* Histórico de Alterações */}
      {user?.role === 'admin' && (
        <AuditHistory tableName="clients" recordId={client.id} />
      )}

      <ClientFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        client={client}
      />
    </div>
  )
}
