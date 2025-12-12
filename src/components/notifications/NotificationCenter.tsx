import { useState } from 'react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Bell, Check, Trash } from 'lucide-react'
import { useAppContext } from '@/context/AppContext'
import { cn } from '@/lib/utils'
import { useNavigate } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ScrollArea } from '@/components/ui/scroll-area'

export function NotificationCenter() {
  const { notifications, markNotificationAsRead, clearNotifications, user } =
    useAppContext()
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()

  if (!user) return null

  const userNotifications = notifications
    .filter((n) => n.userId === user.id)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )

  const unreadCount = userNotifications.filter((n) => !n.read).length

  const handleClick = (notification: any) => {
    if (!notification.read) {
      markNotificationAsRead(notification.id)
    }
    if (notification.link) {
      setIsOpen(false)
      navigate(notification.link)
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-red-600 ring-2 ring-background animate-pulse" />
          )}
          <span className="sr-only">Notificações</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h4 className="font-semibold leading-none">Notificações</h4>
          {userNotifications.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
              onClick={clearNotifications}
            >
              Limpar todas
            </Button>
          )}
        </div>
        <ScrollArea className="h-[300px]">
          {userNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground p-4 text-center">
              <Bell className="h-8 w-8 mb-2 opacity-20" />
              <p className="text-sm">Você não tem novas notificações.</p>
            </div>
          ) : (
            <div className="grid">
              {userNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    'p-4 border-b last:border-0 hover:bg-muted/50 cursor-pointer transition-colors relative group',
                    !notification.read && 'bg-muted/30',
                  )}
                  onClick={() => handleClick(notification)}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="space-y-1">
                      <p
                        className={cn(
                          'text-sm leading-none',
                          !notification.read && 'font-semibold',
                        )}
                      >
                        {notification.title}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-[10px] text-muted-foreground pt-1">
                        {formatDistanceToNow(new Date(notification.createdAt), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="h-2 w-2 rounded-full bg-blue-500 shrink-0 mt-1" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
