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
import { Technician } from '@/types'
import { useEffect } from 'react'
import { useAppContext } from '@/context/AppContext'

const technicianSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(10, 'Telefone inválido'),
  specialties: z.string().min(2, 'Informe as especialidades'),
})

type TechnicianFormValues = z.infer<typeof technicianSchema>

interface TechnicianFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  technician?: Technician
}

export function TechnicianFormDialog({
  open,
  onOpenChange,
  technician,
}: TechnicianFormDialogProps) {
  const { addTechnician, updateTechnician } = useAppContext()
  const form = useForm<TechnicianFormValues>({
    resolver: zodResolver(technicianSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      specialties: '',
    },
  })

  useEffect(() => {
    if (technician) {
      form.reset({
        name: technician.name,
        email: technician.email,
        phone: technician.phone,
        specialties: technician.specialties.join(', '),
      })
    } else {
      form.reset({
        name: '',
        email: '',
        phone: '',
        specialties: '',
      })
    }
  }, [technician, form, open])

  const onSubmit = (values: TechnicianFormValues) => {
    const specialtiesArray = values.specialties
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)

    if (technician) {
      updateTechnician(technician.id, {
        ...values,
        specialties: specialtiesArray,
      })
    } else {
      addTechnician({
        ...values,
        active: true,
        specialties: specialtiesArray,
      })
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {technician ? 'Editar Técnico' : 'Novo Técnico'}
          </DialogTitle>
          <DialogDescription>
            {technician
              ? 'Atualize os dados do técnico.'
              : 'Cadastre um novo técnico no sistema.'}
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
                    <Input placeholder="Nome do técnico" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="email@exemplo.com" {...field} />
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
            <FormField
              control={form.control}
              name="specialties"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Especialidades (separadas por vírgula)</FormLabel>
                  <FormControl>
                    <Input placeholder="Redes, Hardware, SQL..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
