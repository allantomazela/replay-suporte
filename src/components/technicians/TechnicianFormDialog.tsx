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
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Technician } from '@/types'
import { useEffect, useState } from 'react'
import { useAppContext } from '@/context/AppContext'
import { useToast } from '@/hooks/use-toast'
import { maskPhone, maskCEP, maskCPFCNPJ, maskDate } from '@/lib/masks'
import { BRAZILIAN_STATES } from '@/lib/brazilian-states'
import { fetchCEP } from '@/lib/cep-api'
import { validateCPFCNPJ, getCPFCNPJErrorMessage } from '@/lib/validation'
import { Loader2 } from 'lucide-react'

const technicianSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(10, 'Telefone inválido'),
  cpfCnpj: z
    .string()
    .optional()
    .refine(
      (val) => !val || validateCPFCNPJ(val),
      (val) => ({ message: getCPFCNPJErrorMessage(val || '') }),
    ),
  birthDate: z.string().optional(),

  // Endereço
  cep: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  neighborhood: z.string().optional(),
  address: z.string().optional(),
  addressNumber: z.string().optional(),
  complement: z.string().optional(),

  // Profissional
  specialties: z.string().min(2, 'Informe as especialidades'),
  serviceRadius: z.coerce.number().min(0, 'Raio deve ser maior ou igual a 0').optional(),
  experienceYears: z.coerce.number().min(0).optional(),
  certifications: z.string().optional(),
  notes: z.string().optional(),
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
  const { toast } = useToast()
  const [isLoadingCEP, setIsLoadingCEP] = useState(false)

  const form = useForm<TechnicianFormValues>({
    resolver: zodResolver(technicianSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      cpfCnpj: '',
      birthDate: '',
      cep: '',
      state: '',
      city: '',
      neighborhood: '',
      address: '',
      addressNumber: '',
      complement: '',
      specialties: '',
      serviceRadius: undefined,
      experienceYears: undefined,
      certifications: '',
      notes: '',
    },
  })

  useEffect(() => {
    if (technician) {
      form.reset({
        name: technician.name,
        email: technician.email,
        phone: technician.phone,
        cpfCnpj: technician.cpfCnpj || '',
        birthDate: technician.birthDate || '',
        cep: technician.cep || '',
        state: technician.state || '',
        city: technician.city || '',
        neighborhood: technician.neighborhood || '',
        address: technician.address || '',
        addressNumber: technician.addressNumber || '',
        complement: technician.complement || '',
        specialties: technician.specialties.join(', '),
        serviceRadius: technician.serviceRadius,
        experienceYears: technician.experienceYears,
        certifications: technician.certifications || '',
        notes: technician.notes || '',
      })
    } else {
      form.reset({
        name: '',
        email: '',
        phone: '',
        cpfCnpj: '',
        birthDate: '',
        cep: '',
        state: '',
        city: '',
        neighborhood: '',
        address: '',
        addressNumber: '',
        complement: '',
        specialties: '',
        serviceRadius: undefined,
        experienceYears: undefined,
        certifications: '',
        notes: '',
      })
    }
  }, [technician, form, open])

  const handleCEPBlur = async () => {
    const cep = form.getValues('cep')
    if (!cep || cep.replace(/\D/g, '').length !== 8) return

    setIsLoadingCEP(true)
    try {
      const cepData = await fetchCEP(cep)
      if (cepData) {
        form.setValue('address', cepData.logradouro)
        form.setValue('neighborhood', cepData.bairro)
        form.setValue('city', cepData.localidade)
        form.setValue('state', cepData.uf)
        if (cepData.complemento) {
          form.setValue('complement', cepData.complemento)
        }
        toast({
          title: 'CEP encontrado',
          description: 'Endereço preenchido automaticamente.',
        })
      } else {
        toast({
          title: 'CEP não encontrado',
          description: 'Verifique o CEP informado.',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Erro ao buscar CEP',
        description: 'Não foi possível buscar o endereço.',
        variant: 'destructive',
      })
    } finally {
      setIsLoadingCEP(false)
    }
  }

  const onSubmit = async (values: TechnicianFormValues) => {
    const specialtiesArray = values.specialties
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)

    try {
      if (technician) {
        await updateTechnician(technician.id, {
          name: values.name,
          email: values.email,
          phone: values.phone,
          cpfCnpj: values.cpfCnpj || undefined,
          birthDate: values.birthDate || undefined,
          cep: values.cep || undefined,
          state: values.state || undefined,
          city: values.city || undefined,
          neighborhood: values.neighborhood || undefined,
          address: values.address || undefined,
          addressNumber: values.addressNumber || undefined,
          complement: values.complement || undefined,
          specialties: specialtiesArray,
          serviceRadius: values.serviceRadius,
          experienceYears: values.experienceYears,
          certifications: values.certifications || undefined,
          notes: values.notes || undefined,
        })
      } else {
        await addTechnician({
          name: values.name,
          email: values.email,
          phone: values.phone,
          active: true,
          cpfCnpj: values.cpfCnpj || undefined,
          birthDate: values.birthDate || undefined,
          cep: values.cep || undefined,
          state: values.state || undefined,
          city: values.city || undefined,
          neighborhood: values.neighborhood || undefined,
          address: values.address || undefined,
          addressNumber: values.addressNumber || undefined,
          complement: values.complement || undefined,
          specialties: specialtiesArray,
          serviceRadius: values.serviceRadius,
          experienceYears: values.experienceYears,
          certifications: values.certifications || undefined,
          notes: values.notes || undefined,
        })
      }
      onOpenChange(false)
      toast({
        title: technician ? 'Técnico atualizado' : 'Técnico cadastrado',
        description: 'Os dados foram salvos com sucesso.',
      })
    } catch (error) {
      console.error('Error saving technician:', error)
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar os dados do técnico.',
        variant: 'destructive',
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {technician ? 'Editar Técnico Parceiro' : 'Novo Técnico Parceiro'}
          </DialogTitle>
          <DialogDescription>
            {technician
              ? 'Atualize os dados do técnico parceiro.'
              : 'Cadastre um novo técnico parceiro no sistema.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Tabs defaultValue="personal" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="personal">Dados Pessoais</TabsTrigger>
                <TabsTrigger value="address">Endereço</TabsTrigger>
                <TabsTrigger value="professional">Profissional</TabsTrigger>
              </TabsList>

              <TabsContent value="personal" className="space-y-4 mt-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Completo *</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome completo do técnico" {...field} />
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
                        <FormLabel>Email *</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="email@exemplo.com"
                            {...field}
                          />
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
                        <FormLabel>Telefone *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="(99) 99999-9999"
                            {...field}
                            onChange={(e) => {
                              const masked = maskPhone(e.target.value)
                              field.onChange(masked)
                            }}
                            maxLength={15}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="cpfCnpj"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CPF/CNPJ</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="000.000.000-00 ou 00.000.000/0000-00"
                            {...field}
                            onChange={(e) => {
                              const masked = maskCPFCNPJ(e.target.value)
                              field.onChange(masked)
                            }}
                            maxLength={18}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="birthDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data de Nascimento</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="DD/MM/AAAA"
                            {...field}
                            onChange={(e) => {
                              const masked = maskDate(e.target.value)
                              field.onChange(masked)
                            }}
                            maxLength={10}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              <TabsContent value="address" className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="cep"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CEP</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              placeholder="00000-000"
                              {...field}
                              onChange={(e) => {
                                const masked = maskCEP(e.target.value)
                                field.onChange(masked)
                              }}
                              onBlur={handleCEPBlur}
                              maxLength={9}
                            />
                            {isLoadingCEP && (
                              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o estado" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {BRAZILIAN_STATES.map((state) => (
                              <SelectItem key={state.value} value={state.value}>
                                {state.label}
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
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cidade</FormLabel>
                        <FormControl>
                          <Input placeholder="Cidade" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="neighborhood"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bairro</FormLabel>
                      <FormControl>
                        <Input placeholder="Bairro" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Endereço</FormLabel>
                        <FormControl>
                          <Input placeholder="Rua, Avenida, etc." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="addressNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número</FormLabel>
                        <FormControl>
                          <Input placeholder="Número" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="complement"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Complemento</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Apto, Bloco, etc."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="professional" className="space-y-4 mt-4">
                <FormField
                  control={form.control}
                  name="specialties"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Especialidades (separadas por vírgula) *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Redes, Hardware, SQL, Manutenção..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="serviceRadius"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Raio de Atuação (km)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Ex: 50"
                            {...field}
                            value={field.value ?? ''}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value ? Number(e.target.value) : undefined,
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="experienceYears"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Anos de Experiência</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Ex: 5"
                            {...field}
                            value={field.value ?? ''}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value ? Number(e.target.value) : undefined,
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="certifications"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Certificações</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Liste as certificações do técnico..."
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
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observações</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Observações adicionais sobre o técnico..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
            </Tabs>

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
