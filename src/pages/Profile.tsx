import { useAppContext } from '@/context/AppContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import {
  Bell,
  Mail,
  MessageSquare,
  BookOpen,
  Trash2,
  FileText,
  Tag,
  Upload,
} from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useRef } from 'react'
import { useToast } from '@/hooks/use-toast'

export default function Profile() {
  const {
    user,
    clients,
    notificationSettings,
    updateNotificationSetting,
    subscriptions,
    unsubscribe,
    updateUserProfileImage,
  } = useAppContext()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!user) return null

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'Arquivo muito grande',
          description: 'A imagem deve ter no máximo 5MB.',
          variant: 'destructive',
        })
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        updateUserProfileImage(reader.result as string)
        toast({
          title: 'Foto Atualizada',
          description: 'Sua foto de perfil foi atualizada com sucesso.',
        })
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Meu Perfil</h1>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-[600px]">
          <TabsTrigger value="general">Geral</TabsTrigger>
          <TabsTrigger value="notifications">Notificações</TabsTrigger>
          <TabsTrigger value="kb-subscriptions">
            Assinaturas da Base
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-6">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-6">
                <div className="relative group cursor-pointer">
                  <Avatar className="h-24 w-24 border-2 border-border">
                    <AvatarImage src={user.avatar} className="object-cover" />
                    <AvatarFallback className="text-3xl">
                      {user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="text-white h-6 w-6" />
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/png, image/jpeg, image/jpg"
                    onChange={handleImageUpload}
                  />
                </div>
                <div>
                  <CardTitle className="text-2xl">{user.name}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-muted-foreground capitalize">
                      {user.role === 'admin'
                        ? 'Administrador'
                        : user.role === 'agent'
                          ? 'Agente de Suporte'
                          : user.role === 'coordinator'
                            ? 'Coordenador'
                            : 'Cliente'}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Alterar Foto
                  </Button>
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
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <div className="space-y-6">
            <div className="flex flex-col gap-2">
              <h3 className="text-lg font-semibold">Configuração por Arena</h3>
              <p className="text-sm text-muted-foreground">
                Selecione quais arenas você deseja monitorar e como prefere
                receber os alertas.
              </p>
            </div>

            <div className="grid gap-4">
              {clients.map((client) => {
                const setting = notificationSettings.find(
                  (s) => s.arenaId === client.id,
                ) || {
                  arenaId: client.id,
                  events: {
                    statusChange: false,
                    newComment: false,
                    assignmentChange: false,
                  },
                  channels: { inApp: false, email: false },
                }

                return (
                  <Card key={client.id}>
                    <CardHeader className="py-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-base">
                            {client.arenaName}
                          </CardTitle>
                          <p className="text-xs text-muted-foreground">
                            {client.name} - {client.arenaCode}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="py-4 border-t bg-muted/20">
                      <div className="grid gap-6 md:grid-cols-2">
                        {/* Event Types */}
                        <div className="space-y-3">
                          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                            <Bell className="h-4 w-4" /> Tipos de Evento
                          </h4>
                          <div className="flex items-center justify-between">
                            <Label className="text-sm font-normal">
                              Mudança de Status
                            </Label>
                            <Switch
                              checked={setting.events.statusChange}
                              onCheckedChange={(checked) =>
                                updateNotificationSetting(client.id, {
                                  events: { statusChange: checked },
                                })
                              }
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label className="text-sm font-normal">
                              Novos Comentários
                            </Label>
                            <Switch
                              checked={setting.events.newComment}
                              onCheckedChange={(checked) =>
                                updateNotificationSetting(client.id, {
                                  events: { newComment: checked },
                                })
                              }
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label className="text-sm font-normal">
                              Alteração de Responsável
                            </Label>
                            <Switch
                              checked={setting.events.assignmentChange}
                              onCheckedChange={(checked) =>
                                updateNotificationSetting(client.id, {
                                  events: { assignmentChange: checked },
                                })
                              }
                            />
                          </div>
                        </div>

                        {/* Channels */}
                        <div className="space-y-3">
                          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                            <MessageSquare className="h-4 w-4" /> Canais de
                            Envio
                          </h4>
                          <div className="flex items-center justify-between">
                            <Label className="text-sm font-normal">
                              Notificação no App
                            </Label>
                            <Switch
                              checked={setting.channels.inApp}
                              onCheckedChange={(checked) =>
                                updateNotificationSetting(client.id, {
                                  channels: { inApp: checked },
                                })
                              }
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label className="text-sm font-normal">Email</Label>
                            <Switch
                              checked={setting.channels.email}
                              onCheckedChange={(checked) =>
                                updateNotificationSetting(client.id, {
                                  channels: { email: checked },
                                })
                              }
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="kb-subscriptions" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" /> Assinaturas da Base de
                Conhecimento
              </CardTitle>
            </CardHeader>
            <CardContent>
              {subscriptions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Você não está inscrito em nenhum artigo ou categoria.</p>
                </div>
              ) : (
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-4">
                    {subscriptions.map((sub) => (
                      <div
                        key={sub.id}
                        className="flex items-center justify-between p-4 border rounded-lg bg-card"
                      >
                        <div className="flex items-center gap-3">
                          <div className="bg-muted p-2 rounded-full">
                            {sub.type === 'article' ? (
                              <FileText className="h-4 w-4 text-blue-500" />
                            ) : (
                              <Tag className="h-4 w-4 text-green-500" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{sub.targetName}</p>
                            <p className="text-xs text-muted-foreground capitalize">
                              {sub.type === 'article' ? 'Artigo' : 'Categoria'}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => unsubscribe(sub.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" /> Cancelar
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
