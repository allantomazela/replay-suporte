import { useState, useEffect, FormEvent } from 'react'
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
import { Loader2, UserPlus, LogIn } from 'lucide-react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { login: mockLogin, user } = useAppContext()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState('login')

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

    const message = error.message || ''
    const status = error.status

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
      return 'Email ou senha incorretos. Verifique suas credenciais.'
    }

    return (
      message ||
      'Ocorreu um erro ao processar sua solicitação. Tente novamente mais tarde.'
    )
  }

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault()
    if (!validateForm('login')) return

    setIsLoading(true)

    if (isSupabaseConfigured() && supabase) {
      try {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        // Success relies on useEffect [user] -> navigate
      } catch (error: any) {
        console.error('Login error:', error)
        toast({
          title: 'Erro no Login',
          description: getErrorMessage(error),
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false)
      }
    } else {
      // Mock Login
      setTimeout(() => {
        mockLogin(email)
        setIsLoading(false)
        // useEffect will redirect
      }, 1500)
    }
  }

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault()
    if (!validateForm('register')) return

    setIsLoading(true)

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
        toast({
          title: 'Erro no Cadastro',
          description: getErrorMessage(error),
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false)
      }
    } else {
      // Mock Register
      setTimeout(() => {
        toast({
          title: 'Modo Mock',
          description: 'Cadastro simulado realizado. Fazendo login...',
        })
        mockLogin(email)
        setIsLoading(false)
        // useEffect will redirect
      }, 1500)
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
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Entrar</TabsTrigger>
              <TabsTrigger value="register">Cadastrar</TabsTrigger>
            </TabsList>

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
