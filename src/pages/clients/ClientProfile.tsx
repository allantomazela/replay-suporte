import { useParams, Link } from 'react-router-dom'
import { useAppContext } from '@/context/AppContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TicketStatusBadge } from '@/components/tickets/TicketStatusBadge'
import {
  ArrowLeft,
  Edit,
  Plus,
  Mail,
  Phone,
  Calendar,
  Shield,
} from 'lucide-react'
import { useState } from 'react'
import { ClientFormDialog } from '@/components/clients/ClientFormDialog'
import { TicketFormDialog } from '@/pages/tickets/TicketForm'
import { format } from 'date-fns'

export default function ClientProfile() {
  const { id } = useParams<{ id: string }>()
  const { getClientById, tickets } = useAppContext()
  const [isEditClientOpen, setIsEditClientOpen] = useState(false)
  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false)

  const client = getClientById(id || '')
  const clientTickets = tickets.filter((t) => t.clientId === id)

  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <h2 className="text-2xl font-bold mb-4">Cliente não encontrado</h2>
        <Button asChild>
          <Link to="/clients">Voltar para a lista</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/clients">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold flex-1">{client.name}</h1>
        <Button onClick={() => setIsEditClientOpen(true)} variant="outline">
          <Edit className="mr-2 h-4 w-4" /> Editar Perfil
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações Cadastrais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Time/Clube</p>
                  <p className="font-medium">{client.club}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{client.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Telefone</p>
                  <p className="font-medium">{client.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    Data de Aquisição
                  </p>
                  <p className="font-medium">
                    {format(new Date(client.acquisitionDate), 'dd/MM/yyyy')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Histórico de Atendimentos</h2>
          </div>
          <Card>
            <CardContent className="p-0">
              {clientTickets.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-muted text-muted-foreground font-semibold">
                      <tr>
                        <th className="px-4 py-3">ID</th>
                        <th className="px-4 py-3">Data</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Assunto</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {clientTickets.map((ticket) => (
                        <tr
                          key={ticket.id}
                          className="hover:bg-muted/50 cursor-pointer"
                          onClick={() =>
                            (window.location.href = `/tickets/${ticket.id}`)
                          }
                        >
                          <td className="px-4 py-3 font-medium">
                            #{ticket.id}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {format(new Date(ticket.createdAt), 'dd/MM/yyyy')}
                          </td>
                          <td className="px-4 py-3">
                            <TicketStatusBadge status={ticket.status} />
                          </td>
                          <td className="px-4 py-3">{ticket.title}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  Este cliente ainda não possui atendimentos registrados.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Floating Action Button */}
      <Button
        className="fixed bottom-8 right-8 h-14 w-14 rounded-full shadow-lg"
        onClick={() => setIsNewTicketOpen(true)}
      >
        <Plus className="h-6 w-6" />
      </Button>

      <ClientFormDialog
        open={isEditClientOpen}
        onOpenChange={setIsEditClientOpen}
        client={client}
      />

      <TicketFormDialog
        open={isNewTicketOpen}
        onOpenChange={setIsNewTicketOpen}
        preSelectedClientId={client.id}
      />
    </div>
  )
}
