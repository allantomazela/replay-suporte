import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  isSupabaseConfigured,
  saveSupabaseConfig,
  clearSupabaseConfig,
} from '@/lib/supabase'
import { seedDatabase, SCHEMA_SQL } from '@/lib/seed-data'
import { useToast } from '@/hooks/use-toast'
import {
  Check,
  Database,
  Key,
  Link as LinkIcon,
  Loader2,
  Terminal,
  LogOut,
  ShieldAlert,
  Code,
  Lock,
  ExternalLink,
} from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

interface SupabaseWizardProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SupabaseWizard({ open, onOpenChange }: SupabaseWizardProps) {
  const { toast } = useToast()
  const isConfigured = isSupabaseConfigured()
  const [url, setUrl] = useState(localStorage.getItem('supabase_url') || '')
  const [key, setKey] = useState(localStorage.getItem('supabase_key') || '')
  const [isSeeding, setIsSeeding] = useState(false)

  const handleSave = () => {
    if (!url || !key) {
      toast({
        title: 'Campos Obrigatórios',
        description: 'Preencha a URL e a Anon Key do Supabase.',
        variant: 'destructive',
      })
      return
    }

    // Validação básica de URL
    try {
      const parsedUrl = new URL(url)
      if (!parsedUrl.hostname.endsWith('.supabase.co') && 
          parsedUrl.hostname !== 'localhost' && 
          !parsedUrl.hostname.startsWith('192.168.') &&
          !parsedUrl.hostname.startsWith('10.')) {
        toast({
          title: 'URL Inválida',
          description: 'A URL deve ser um domínio Supabase válido (.supabase.co)',
          variant: 'destructive',
        })
        return
      }
    } catch {
      toast({
        title: 'URL Inválida',
        description: 'A URL fornecida não é válida.',
        variant: 'destructive',
      })
      return
    }

    // Validação básica da chave
    if (key.length < 50 || (!key.startsWith('eyJ') && !key.startsWith('sb_'))) {
      toast({
        title: 'Chave Inválida',
        description: 'A chave anon fornecida não parece ser válida.',
        variant: 'destructive',
      })
      return
    }

    saveSupabaseConfig(url, key)
    toast({
      title: 'Configuração Salva',
      description: 'Conexão com Supabase estabelecida. Recarregando...',
    })
  }

  const handleDisconnect = () => {
    clearSupabaseConfig()
    toast({ title: 'Desconectado', description: 'Credenciais removidas.' })
  }

  const handleSeed = async () => {
    setIsSeeding(true)
    try {
      await seedDatabase()
      toast({
        title: 'Sucesso',
        description: 'Dados de exemplo migrados para o Supabase.',
      })
    } catch (e) {
      console.error(e)
      toast({
        title: 'Erro na Migração',
        description:
          'Verifique se as tabelas foram criadas no Supabase (aba Schema).',
        variant: 'destructive',
      })
    } finally {
      setIsSeeding(false)
    }
  }

  const openDashboard = (path: string = '') => {
    if (!url) return
    // Try to guess dashboard URL from project URL
    // project url: https://[project-ref].supabase.co
    // dashboard url: https://supabase.com/dashboard/project/[project-ref]
    try {
      const projectRef = new URL(url).hostname.split('.')[0]
      window.open(
        `https://supabase.com/dashboard/project/${projectRef}${path}`,
        '_blank',
      )
    } catch (e) {
      window.open('https://supabase.com/dashboard', '_blank')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-green-600" />
            Integração Supabase
          </DialogTitle>
          <DialogDescription>
            Gerencie sua conexão, banco de dados, autenticação e funções.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue={isConfigured ? 'schema' : 'connect'}>
          <TabsList className="grid w-full grid-cols-6 mb-4">
            <TabsTrigger value="connect">Conexão</TabsTrigger>
            <TabsTrigger value="schema" disabled={!isConfigured}>
              Schema
            </TabsTrigger>
            <TabsTrigger value="data" disabled={!isConfigured}>
              Dados
            </TabsTrigger>
            <TabsTrigger value="auth" disabled={!isConfigured}>
              Auth
            </TabsTrigger>
            <TabsTrigger value="functions" disabled={!isConfigured}>
              Functions
            </TabsTrigger>
            <TabsTrigger value="secrets" disabled={!isConfigured}>
              Secrets
            </TabsTrigger>
          </TabsList>

          <TabsContent value="connect" className="space-y-4">
            {isConfigured && (
              <Alert className="bg-green-50 border-green-200 mb-4">
                <Check className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">Conectado</AlertTitle>
                <AlertDescription className="text-green-700">
                  Sua aplicação está configurada para usar o Supabase.
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-4 bg-muted/20 p-4 rounded-lg">
              <div className="grid gap-2">
                <Label htmlFor="url">Project URL</Label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="url"
                    placeholder="https://xyz.supabase.co"
                    className="pl-9"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="key">Anon Key</Label>
                <div className="relative">
                  <Key className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="key"
                    type="password"
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    className="pl-9"
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-4">
              {isConfigured ? (
                <Button
                  variant="destructive"
                  onClick={handleDisconnect}
                  className="gap-2"
                >
                  <LogOut className="h-4 w-4" /> Desconectar
                </Button>
              ) : (
                <div />
              )}
              <Button onClick={handleSave}>Salvar Conexão</Button>
            </div>
          </TabsContent>

          <TabsContent value="schema" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">
                Configuração do Banco de Dados
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => openDashboard('/editor')}
                className="gap-2"
              >
                <ExternalLink className="h-4 w-4" /> Abrir SQL Editor
              </Button>
            </div>
            <Alert>
              <Terminal className="h-4 w-4" />
              <AlertTitle>Criação de Tabelas</AlertTitle>
              <AlertDescription>
                Copie o SQL abaixo e execute no <strong>SQL Editor</strong> do
                seu projeto Supabase para criar a estrutura necessária.
              </AlertDescription>
            </Alert>
            <div className="bg-slate-950 text-slate-50 p-4 rounded-md text-xs font-mono overflow-auto max-h-[300px]">
              <pre>{SCHEMA_SQL}</pre>
            </div>
            <div className="flex justify-end">
              <Button
                variant="secondary"
                onClick={() => {
                  navigator.clipboard.writeText(SCHEMA_SQL)
                  toast({
                    title: 'Copiado',
                    description: 'SQL copiado para a área de transferência.',
                  })
                }}
              >
                Copiar SQL
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="data" className="space-y-4">
            <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg text-center space-y-4 bg-muted/10">
              <Database className="h-12 w-12 text-muted-foreground" />
              <h3 className="text-lg font-semibold">Migração de Dados</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Envie os dados de teste (Clientes, Tickets, Artigos) para o seu
                banco de dados Supabase.
                <br />
                <span className="text-xs opacity-70">
                  (Isso não duplicará dados existentes se os IDs forem mantidos)
                </span>
              </p>
              <Button onClick={handleSeed} disabled={isSeeding}>
                {isSeeding ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Database className="mr-2 h-4 w-4" />
                )}
                Migrar Mock Data
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="auth" className="space-y-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">Configurar Google Login</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openDashboard('/auth/providers')}
                  className="gap-2"
                >
                  <ExternalLink className="h-4 w-4" /> Configurar Providers
                </Button>
              </div>
              <ol className="list-decimal list-inside space-y-3 text-sm text-muted-foreground bg-muted/30 p-4 rounded-lg">
                <li>
                  No painel do Supabase, vá em{' '}
                  <strong>Authentication &gt; Providers</strong>.
                </li>
                <li>
                  Ative o provedor <strong>Google</strong>.
                </li>
                <li>
                  Cole seu <em>Client ID</em> e <em>Client Secret</em> do Google
                  Cloud Console.
                </li>
                <li>
                  Adicione a URL de redirecionamento fornecida pelo Supabase no
                  Google Console.
                </li>
              </ol>
              <Alert variant="destructive">
                <ShieldAlert className="h-4 w-4" />
                <AlertTitle>Atenção com Redirecionamentos</AlertTitle>
                <AlertDescription>
                  Certifique-se de que a URL{' '}
                  <strong>{window.location.origin}</strong> está adicionada em{' '}
                  <strong>Authentication &gt; URL Configuration</strong> no
                  Supabase.
                </AlertDescription>
              </Alert>
            </div>
          </TabsContent>

          <TabsContent value="functions" className="space-y-4">
            <div className="text-center py-8 space-y-4">
              <div className="bg-blue-50 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
                <Code className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold">Edge Functions</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Gerencie suas funções serverless diretamente no painel do
                Supabase. Use o CLI para deploy e logs.
              </p>
              <Button onClick={() => openDashboard('/functions')}>
                Acessar Edge Functions <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="secrets" className="space-y-4">
            <div className="text-center py-8 space-y-4">
              <div className="bg-amber-50 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
                <Lock className="h-8 w-8 text-amber-600" />
              </div>
              <h3 className="text-lg font-semibold">Segredos e Variáveis</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Gerencie variáveis de ambiente e chaves de API para suas Edge
                Functions de forma segura.
              </p>
              <Button onClick={() => openDashboard('/settings/vault')}>
                Gerenciar Secrets <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
