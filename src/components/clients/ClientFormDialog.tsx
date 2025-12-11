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
import { Input } from '@/components/ui/input'
import { Client } from '@/types'
import { useEffect } from 'react'
import { useAppContext } from '@/context/AppContext'

const clientSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  city: z.string().min(2, 'Cidade/Estado deve ter pelo menos 2 caracteres'),
  phone: z.string().min(10, 'Telefone inválido'),
  arenaCode: z.string().min(2, 'Código deve ter pelo menos 2 caracteres'),
  arenaName: z
    .string()
    .min(2, 'Nome da Arena deve ter pelo menos 2 caracteres'),
})

type ClientFormValues = z.infer<typeof clientSchema>

interface ClientFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  client?: Client // If present, it's edit mode
}

export function ClientFormDialog({
  open,
  onOpenChange,
  client,
}: ClientFormDialogProps) {
  const { addClient, updateClient } = useAppContext()
  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: '',
      city: '',
      phone: '',
      arenaCode: '',
      arenaName: '',
    },
  })

  useEffect(() => {
    if (client) {
      form.reset({
        name: client.name,
        city: client.city,
        phone: client.phone,
        arenaCode: client.arenaCode,
        arenaName: client.arenaName,
      })
    } else {
      form.reset({
        name: '',
        city: '',
        phone: '',
        arenaCode: '',
        arenaName: '',
      })
    }
  }, [client, form, open])

  const onSubmit = (values: ClientFormValues) => {
    if (client) {
      updateClient(client.id, values)
    } else {
      addClient(values)
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {client ? 'Editar Cliente' : 'Novo Cliente'}
          </DialogTitle>
          <DialogDescription>
            {client
              ? 'Atualize as informações do cliente abaixo.'
              : 'Preencha os dados para cadastrar um novo cliente.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Completo</FormLabel>
                  <FormControl>
                    <Input placeholder="João da Silva" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cidade/Estado</FormLabel>
                    <FormControl>
                      <Input placeholder="São Paulo/SP" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input placeholder="(99) 99999-9999" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="arenaCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código da Arena</FormLabel>
                    <FormControl>
                      <Input placeholder="ARENA01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="arenaName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Arena</FormLabel>
                    <FormControl>
                      <Input placeholder="Arena Central" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">Salvar</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
