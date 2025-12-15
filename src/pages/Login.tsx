import { useState, useEffect, FormEvent } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAppContext } from '@/context/AppContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { Loader2, UserPlus, LogIn, AlertCircle } from 'lucide-react'
import {
  supabase,
  isSupabaseConfigured,
  getActiveSupabaseUrl,
} from '@/lib/supabase'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLocalLoading, setIsLocalLoading] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)

  const {
    login: mockLogin,
    user,
    isLoading: isGlobalLoading,
    checkSession,
  } = useAppContext()
  const navigate = useNavigate()
  const location = useLocation()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState('login')

  // Redirection effect: If user is authenticated, redirect to dashboard or original destination
  useEffect(() => {
    // Only proceed if global loading is finished and user is present
    if (!isGlobalLoading && user) {
      // Determine where to redirect
      // Check for redirect path in location state
      const state = location.state as { from?: { pathname: string } } | null
      let targetPath = state?.from?.pathname || '/dashboard'

      // Prevent redirect loop if the target is login page itself or root
      // This ensures we always land on a protected route or dashboard
      if (targetPath === '/login' || targetPath === '/') {
        targetPath = '/dashboard'
      }

      console.debug(`Redirecting authenticated user to: ${targetPath}`)

      // Perform redirection using replace to avoid history stack buildup
      navigate(targetPath, { replace: true })
    }
  }, [user, isGlobalLoading, navigate, location])

  const validateForm = (type: 'login' | 'register') => {
    if (!email || !password) {
      toast({
        title: 'Campos Obrigatórios',
        description: 'Por favor, preencha todos os campos.',
        variant: 'destructive',
      })
      return false
    }

    if (password.length < 6) {
      toast({
        title: 'Senha Fraca',
        description: 'A senha deve ter no mínimo 6 caracteres.',
        variant: 'destructive',
      })
      return false
    }

    if (type === 'register') {
      if (!fullName) {
        toast({
          title: 'Nome Obrigatório',
          description: 'Por favor, informe seu nome completo.',
          variant: 'destructive',
        })
        return false
      }
      if (password !== confirmPassword) {
        toast({
          title: 'Senhas Diferentes',
          description: 'As senhas informadas não coincidem.',
          variant: 'destructive',
        })
        return false
      }
    }

    return true
  }

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault()
    setAuthError(null)
    if (!validateForm('login')) return

    setIsLocalLoading(true)

    if (isSupabaseConfigured() && supabase) {
      const urlToCheck = getActiveSupabaseUrl()

      if (urlToCheck && !urlToCheck.startsWith('http')) {
        const msg =
          'A URL do Supabase parece incorreta. Verifique as configurações.'
        setAuthError(msg)
        toast({
          title: 'Configuração Inválida',
          description: msg,
          variant: 'destructive',
        })
        setIsLocalLoading(false)
        return
      }

      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) throw error

        if (!data.session) {
          throw new Error('Sessão não pôde ser estabelecida. Tente novamente.')
        }

        console.log('[Login] Login successful, session:', data.session.user.email)

        toast({
          title: 'Login realizado com sucesso',
          description: 'Redirecionando...',
        })

        // O onAuthStateChange vai atualizar o estado automaticamente
        // Mas chamar checkSession também para garantir
        checkSession().then(() => {
          console.log('[Login] checkSession completed')
        }).catch((e) => {
          console.error('[Login] CheckSession failed:', e)
        })

        // Não bloquear - deixar o redirecionamento acontecer naturalmente
        setIsLocalLoading(false)
      } catch (error: any) {
        console.error('Login error:', error)
        // Ensure sign out on error to clean state
        await supabase.auth.signOut()
        setAuthError(error.message || 'Erro ao realizar login.')
        setIsLocalLoading(false)
      }
    } else {
      // Mock Login
      setTimeout(() => {
        mockLogin(email)
        toast({
          title: 'Modo Demo',
          description: 'Login simulado realizado com sucesso.',
        })
        // State update triggers redirect in useEffect
      }, 800)
    }
  }

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault()
    setAuthError(null)
    if (!validateForm('register')) return

    setIsLocalLoading(true)

    if (isSupabaseConfigured() && supabase) {
      try {
        const { error, data } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        })

        if (error) throw error

        if (data.session) {
          await checkSession()
          toast({
            title: 'Conta Criada',
            description: 'Bem-vindo ao Replay Suporte!',
          })
          // Redirect handled by useEffect
        } else if (data.user) {
          toast({
            title: 'Confirmação Necessária',
            description: 'Verifique seu email para confirmar o cadastro.',
          })
          setActiveTab('login')
          setIsLocalLoading(false)
        }
      } catch (error: any) {
        console.error('Registration error:', error)
        setAuthError(error.message || 'Erro no cadastro.')
        setIsLocalLoading(false)
      }
    } else {
      // Mock Register
      setTimeout(() => {
        toast({
          title: 'Modo Mock',
          description: 'Cadastro simulado realizado. Fazendo login...',
        })
        mockLogin(email)
        // Redirect handled by useEffect
      }, 800)
    }
  }

  // Loading State (Global or if User is already present and redirection is pending)
  // This prevents the login form from flashing if the user is already logged in
  // And fulfills requirement: "The /login page must not be displayed to an authenticated user."
  if (isGlobalLoading || user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-primary/10">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-sm text-muted-foreground animate-pulse">
          {user ? 'Redirecionando...' : 'Carregando...'}
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary/10 p-4">
      <Card className="w-full max-w-md shadow-lg border-0 animate-fade-in">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center mb-2">
            <img
              src="/logo.svg"
              alt="Logo Replay"
              className="h-24 w-auto object-contain"
            />
          </div>
          <CardTitle className="text-2xl font-bold">Replay Suporte</CardTitle>
          <CardDescription>
            Acesse o sistema de gestão de atendimento.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            value={activeTab}
            onValueChange={(val) => {
              setActiveTab(val)
              setAuthError(null)
            }}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Entrar</TabsTrigger>
              <TabsTrigger value="register">Cadastrar</TabsTrigger>
            </TabsList>

            {authError && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Erro</AlertTitle>
                <AlertDescription>{authError}</AlertDescription>
              </Alert>
            )}

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="seu.email@exemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    disabled={isLocalLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Senha</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    disabled={isLocalLoading}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full font-semibold"
                  disabled={isLocalLoading}
                >
                  {isLocalLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <LogIn className="mr-2 h-4 w-4" /> Entrar
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-name">Nome Completo</Label>
                  <Input
                    id="register-name"
                    type="text"
                    placeholder="Seu nome"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    autoComplete="name"
                    disabled={isLocalLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-email">Email</Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="seu.email@exemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    disabled={isLocalLoading}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Senha</Label>
                    <Input
                      id="register-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="new-password"
                      disabled={isLocalLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirmar</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      autoComplete="new-password"
                      disabled={isLocalLoading}
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full font-semibold"
                  disabled={isLocalLoading}
                >
                  {isLocalLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" /> Cadastrar
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-center flex-col gap-2">
          {!isSupabaseConfigured() && (
            <p className="text-xs text-muted-foreground mt-4 bg-muted p-2 rounded w-full text-center">
              ⚠️ Modo Mock (Sem Supabase)
            </p>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
