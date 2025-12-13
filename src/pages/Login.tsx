import { useState, useEffect, FormEvent, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
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
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)

  const { login: mockLogin, user } = useAppContext()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState('login')
  const isMounted = useRef(true)

  useEffect(() => {
    isMounted.current = true
    return () => {
      isMounted.current = false
    }
  }, [])

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard')
    }
  }, [user, navigate])

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

  const getErrorMessage = (error: any) => {
    if (!error) return 'Ocorreu um erro desconhecido.'

    // Prefer message if it's a string, otherwise fallback
    const message = typeof error === 'string' ? error : error.message || ''
    const status = error.status

    if (message === 'TIMEOUT') {
      return 'A conexão demorou muito para responder. Verifique sua internet ou tente novamente.'
    }

    if (
      message.includes('User already registered') ||
      (status === 422 && message.toLowerCase().includes('registered'))
    ) {
      return 'Este email já está cadastrado. Por favor, utilize a aba "Entrar" para fazer login.'
    }

    if (message.includes('Password should be at least')) {
      return 'A senha deve ter no mínimo 6 caracteres para garantir a segurança da sua conta.'
    }

    if (
      message.toLowerCase().includes('weak_password') ||
      message.includes('password is too weak')
    ) {
      return 'A senha escolhida é muito fraca. Tente combinar letras maiúsculas, minúsculas, números e símbolos.'
    }

    if (
      message.includes('invalid email') ||
      message.includes('Validation failed for email')
    ) {
      return 'O endereço de email informado não é válido. Verifique se digitou corretamente.'
    }

    if (status === 429) {
      return 'Muitas tentativas consecutivas. Por favor, aguarde alguns instantes antes de tentar novamente.'
    }

    if (message.includes('Invalid login credentials')) {
      return 'Email ou senha incorretos. Verifique suas credenciais e tente novamente.'
    }

    if (message.includes('Email not confirmed')) {
      return 'Email não confirmado. Verifique sua caixa de entrada.'
    }

    if (message.includes('Failed to fetch')) {
      return 'Não foi possível conectar ao servidor. Verifique a URL do Supabase ou sua conexão.'
    }

    return (
      message ||
      'Ocorreu um erro ao processar sua solicitação. Tente novamente mais tarde.'
    )
  }

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault()
    setAuthError(null)
    if (!validateForm('login')) return

    setIsLoading(true)

    if (isSupabaseConfigured() && supabase) {
      // Verification of Supabase URL Configuration
      const localUrl = localStorage.getItem('supabase_url')
      const envUrl = import.meta.env.VITE_SUPABASE_URL
      const urlToCheck = localUrl || envUrl

      if (urlToCheck && !urlToCheck.startsWith('http')) {
        const msg =
          'A URL do Supabase parece incorreta. Verifique as configurações.'
        setAuthError(msg)
        toast({
          title: 'Configuração Inválida',
          description: msg,
          variant: 'destructive',
        })
        setIsLoading(false)
        return
      }

      try {
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('TIMEOUT')), 15000)
        })

        const loginPromise = supabase.auth.signInWithPassword({
          email,
          password,
        })

        const result: any = await Promise.race([loginPromise, timeoutPromise])
        const { data, error } = result

        if (error) throw error

        if (!data.session) {
          throw new Error('Sessão não pôde ser estabelecida. Tente novamente.')
        }

        // Validate session explicitly before declaring success
        const { data: sessionData, error: sessionError } =
          await supabase.auth.getSession()

        if (sessionError || !sessionData.session) {
          // Force sign out if session validation fails to prevent partial state
          await supabase.auth.signOut()
          throw new Error(
            'Falha na validação da sessão. Por favor, faça login novamente.',
          )
        }

        toast({
          title: 'Login realizado com sucesso',
          description: 'Redirecionando para o dashboard...',
        })
        // useEffect will redirect when user state updates
      } catch (error: any) {
        console.error('Login error:', error)
        const friendlyMessage = getErrorMessage(error)
        setAuthError(friendlyMessage)
        toast({
          title: 'Erro no Login',
          description: friendlyMessage,
          variant: 'destructive',
        })
      } finally {
        if (isMounted.current) {
          setIsLoading(false)
        }
      }
    } else {
      // Mock Login
      setTimeout(() => {
        if (isMounted.current) {
          mockLogin(email)
          setIsLoading(false)
          toast({
            title: 'Modo Demo',
            description: 'Login simulado realizado com sucesso.',
          })
        }
      }, 1000)
    }
  }

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault()
    setAuthError(null)
    if (!validateForm('register')) return

    setIsLoading(true)

    if (isSupabaseConfigured() && supabase) {
      try {
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('TIMEOUT')), 15000)
        })

        const signUpPromise = supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        })

        const result: any = await Promise.race([signUpPromise, timeoutPromise])
        const { error, data } = result

        if (error) throw error

        if (data.session) {
          toast({
            title: 'Conta Criada',
            description: 'Bem-vindo ao Replay Suporte!',
          })
          // useEffect will redirect
        } else if (data.user) {
          toast({
            title: 'Confirmação Necessária',
            description: 'Verifique seu email para confirmar o cadastro.',
          })
          setActiveTab('login')
        }
      } catch (error: any) {
        console.error('Registration error:', error)
        const friendlyMessage = getErrorMessage(error)
        setAuthError(friendlyMessage)
        toast({
          title: 'Erro no Cadastro',
          description: friendlyMessage,
          variant: 'destructive',
        })
      } finally {
        if (isMounted.current) {
          setIsLoading(false)
        }
      }
    } else {
      // Mock Register
      setTimeout(() => {
        if (isMounted.current) {
          toast({
            title: 'Modo Mock',
            description: 'Cadastro simulado realizado. Fazendo login...',
          })
          mockLogin(email)
          setIsLoading(false)
        }
      }, 1000)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary/10 p-4">
      <Card className="w-full max-w-md shadow-lg border-0">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center mb-2">
            <div className="bg-primary p-3 rounded-lg">
              <span className="text-white font-bold text-2xl tracking-tighter">
                REPLAY
              </span>
            </div>
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
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full font-semibold"
                  disabled={isLoading}
                >
                  {isLoading ? (
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
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full font-semibold"
                  disabled={isLoading}
                >
                  {isLoading ? (
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
          {activeTab === 'login' && (
            <a
              href="#"
              className="text-sm text-primary hover:underline"
              onClick={(e) => {
                e.preventDefault()
                toast({
                  title: 'Recuperação',
                  description:
                    'Se configurado, você receberá um email de recuperação.',
                })
              }}
            >
              Esqueceu sua senha?
            </a>
          )}
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
