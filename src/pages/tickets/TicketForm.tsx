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
import { Ticket } from '@/types'
import { useEffect, useState, useMemo } from 'react'
import { useAppContext } from '@/context/AppContext'
import { Upload, Calendar as CalendarIcon } from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

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
  const { addTicket, updateTicket, clients, customFields } = useAppContext()
  const [saveAndNew, setSaveAndNew] = useState(false)

  // Dynamic Schema Generation
  const formSchema = useMemo(() => {
    const baseSchema = z.object({
      clientId: z.string().min(1, 'Selecione um cliente'),
      title: z.string().min(3, 'O título deve ter pelo menos 3 caracteres'),
      description: z
        .string()
        .min(10, 'A descrição deve ter pelo menos 10 caracteres'),
      solutionSteps: z.string().optional(),
      status: z.enum(['Aberto', 'Em Andamento', 'Resolvido', 'Pendente']),
    })

    const customFieldsShape: Record<string, z.ZodTypeAny> = {}

    customFields.forEach((field) => {
      let schema: z.ZodTypeAny = z.any()

      if (field.type === 'text' || field.type === 'select') {
        schema = z.string()
        if (field.required) schema = schema.min(1, 'Campo obrigatório')
        else schema = schema.optional()
      } else if (field.type === 'number') {
        schema = z.coerce.number()
        if (field.required) schema = schema.min(1, 'Campo obrigatório')
        else schema = schema.optional()
      } else if (field.type === 'date') {
        schema = z.date()
        if (field.required) schema = schema
        else schema = schema.optional().nullable()
      }

      customFieldsShape[field.id] = schema
    })

    return baseSchema.extend({
      customData: z.object(customFieldsShape),
    })
  }, [customFields])

  type TicketFormValues = z.infer<typeof formSchema>

  const form = useForm<TicketFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientId: preSelectedClientId || '',
      title: '',
      description: '',
      solutionSteps: '',
      status: 'Aberto',
      customData: {},
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
        customData: ticket.customData || {},
      })
    } else {
      // Initialize customData with empty values matching types
      const defaultCustomData: Record<string, any> = {}
      customFields.forEach((f) => {
        defaultCustomData[f.id] = f.type === 'date' ? undefined : ''
      })

      form.reset({
        clientId: preSelectedClientId || '',
        title: '',
        description: '',
        solutionSteps: '',
        status: 'Aberto',
        customData: defaultCustomData,
      })
    }
  }, [ticket, preSelectedClientId, form, open, customFields])

  const onSubmit = (values: TicketFormValues) => {
    if (ticket) {
      updateTicket(ticket.id, values)
      onOpenChange(false)
    } else {
      addTicket({
        ...values,
        attachments: [],
      })
      if (saveAndNew) {
        form.reset({
          clientId: '',
          title: '',
          description: '',
          solutionSteps: '',
          status: 'Aberto',
          customData: {},
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

            {/* Custom Fields Section */}
            {customFields.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border p-4 rounded-md bg-muted/20">
                <div className="col-span-1 md:col-span-2">
                  <h4 className="text-sm font-semibold mb-2">
                    Informações Adicionais
                  </h4>
                </div>
                {customFields.map((fieldDef) => (
                  <FormField
                    key={fieldDef.id}
                    control={form.control}
                    name={`customData.${fieldDef.id}`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {fieldDef.label}
                          {fieldDef.required && (
                            <span className="text-destructive ml-1">*</span>
                          )}
                        </FormLabel>
                        <FormControl>
                          {fieldDef.type === 'text' ? (
                            <Input
                              placeholder={fieldDef.placeholder}
                              {...field}
                              value={field.value || ''}
                            />
                          ) : fieldDef.type === 'number' ? (
                            <Input
                              type="number"
                              placeholder={fieldDef.placeholder}
                              {...field}
                              value={field.value || ''}
                            />
                          ) : fieldDef.type === 'select' ? (
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              value={field.value || ''}
                            >
                              <SelectTrigger>
                                <SelectValue
                                  placeholder={
                                    fieldDef.placeholder || 'Selecione'
                                  }
                                />
                              </SelectTrigger>
                              <SelectContent>
                                {fieldDef.options?.map((opt) => (
                                  <SelectItem key={opt} value={opt}>
                                    {opt}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : fieldDef.type === 'date' ? (
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant={'outline'}
                                  className={cn(
                                    'w-full pl-3 text-left font-normal',
                                    !field.value && 'text-muted-foreground',
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, 'dd/MM/yyyy')
                                  ) : (
                                    <span>Selecione a data</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent
                                className="w-auto p-0"
                                align="start"
                              >
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  disabled={(date) =>
                                    date > new Date() ||
                                    date < new Date('1900-01-01')
                                  }
                                  initialFocus
                                  locale={ptBR}
                                />
                              </PopoverContent>
                            </Popover>
                          ) : (
                            <Input {...field} value={field.value || ''} />
                          )}
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            )}

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
                  type="button"
                  variant="secondary"
                  onClick={(e) => {
                    e.preventDefault()
                    setSaveAndNew(true)
                    form.handleSubmit(onSubmit)()
                  }}
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
