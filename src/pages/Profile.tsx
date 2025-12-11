import { useAppContext } from '@/context/AppContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function Profile() {
  const { user } = useAppContext()

  if (!user) return null

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Meu Perfil</h1>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.avatar} />
              <AvatarFallback className="text-2xl">
                {user.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl">{user.name}</CardTitle>
              <p className="text-muted-foreground">
                {user.role === 'admin'
                  ? 'Administrador'
                  : user.role === 'agent'
                    ? 'Agente de Suporte'
                    : 'Coordenador'}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label>Nome Completo</Label>
            <Input value={user.name} readOnly />
          </div>
          <div className="grid gap-2">
            <Label>Email</Label>
            <Input value={user.email} readOnly />
          </div>

          <div className="pt-4 flex justify-end">
            <Button variant="outline" disabled>
              Alterar Senha
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
