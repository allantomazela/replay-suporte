import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Ticket, TicketStatus } from '@/types'
import { useEffect, useState } from 'react'
import { useAppContext } from '@/context/AppContext'
import { Upload } from 'lucide-react'

const ticketSchema = z.object({
  clientId: z.string().min(1, 'Selecione um cliente'),
  title: z.string().min(3, 'O título deve ter pelo menos 3 caracteres'),
  description: z
    .string()
    .min(10, 'A descrição deve ter pelo menos 10 caracteres'),
  solutionSteps: z.string().optional(),
  status: z.enum(['Aberto', 'Em Andamento', 'Resolvido', 'Pendente']),
})

type TicketFormValues = z.infer<typeof ticketSchema>

interface TicketFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  ticket?: Ticket
  preSelectedClientId?: string
}

export function TicketFormDialog({
  open,
  onOpenChange,
  ticket,
  preSelectedClientId,
}: TicketFormDialogProps) {
  const { addTicket, updateTicket, clients } = useAppContext()
  const [saveAndNew, setSaveAndNew] = useState(false)

  const form = useForm<TicketFormValues>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      clientId: preSelectedClientId || '',
      title: '',
      description: '',
      solutionSteps: '',
      status: 'Aberto',
    },
  })

  useEffect(() => {
    if (ticket) {
      form.reset({
        clientId: ticket.clientId,
        title: ticket.title,
        description: ticket.description,
        solutionSteps: ticket.solutionSteps || '',
        status: ticket.status,
      })
    } else {
      form.reset({
        clientId: preSelectedClientId || '',
        title: '',
        description: '',
        solutionSteps: '',
        status: 'Aberto',
      })
    }
  }, [ticket, preSelectedClientId, form, open])

  const onSubmit = (values: TicketFormValues) => {
    if (ticket) {
      updateTicket(ticket.id, values)
      onOpenChange(false)
    } else {
      addTicket({
        ...values,
        attachments: [], // Simplified for now
      })
      if (saveAndNew) {
        form.reset({
          clientId: '',
          title: '',
          description: '',
          solutionSteps: '',
          status: 'Aberto',
        })
        setSaveAndNew(false)
      } else {
        onOpenChange(false)
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {ticket ? 'Editar Atendimento' : 'Novo Atendimento'}
          </DialogTitle>
          <DialogDescription>
            Preencha os detalhes do prontuário técnico.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="clientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cliente</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={!!ticket || !!preSelectedClientId}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um cliente" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {clients
                        .filter(
                          (c) =>
                            c.active || (ticket && ticket.clientId === c.id),
                        )
                        .map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.name} - {client.arenaName} -{' '}
                            {client.arenaCode}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assunto (Resumo)</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Erro no login" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição Detalhada do Problema</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva o problema em detalhes..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="solutionSteps"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Passos da Solução</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Passos tomados para resolver..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {['Aberto', 'Em Andamento', 'Resolvido', 'Pendente'].map(
                        (s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Mock Attachment Area */}
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 flex flex-col items-center justify-center text-center">
              <Upload className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm font-medium">
                Arraste arquivos ou clique para fazer upload
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Imagens, PDF, LOG (Max 10MB)
              </p>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              {!ticket && (
                <Button
                  type="submit"
                  variant="secondary"
                  onClick={() => setSaveAndNew(true)}
                >
                  Salvar e Novo
                </Button>
              )}
              <Button type="submit">Salvar</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
