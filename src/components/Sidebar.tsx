import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { LogOut, Settings } from 'lucide-react'
import { useAppContext } from '@/context/AppContext'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { NAV_CONFIG } from '@/lib/nav-config'
import { useState } from 'react'
import { MenuCustomizationDialog } from '@/components/settings/MenuCustomizationDialog'

interface SidebarContentProps {
  isMobile?: boolean
  onCloseMobile?: () => void
}

export function SidebarContent({
  isMobile = false,
  onCloseMobile,
}: SidebarContentProps) {
  const { user, logout, navOrder, navPreferences } = useAppContext()
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  return (
    <div className="flex flex-col h-full bg-sidebar border-r border-sidebar-border">
      <div className="p-6 flex items-center justify-center lg:justify-start h-16">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-primary rounded flex items-center justify-center shrink-0">
            <span className="text-primary-foreground font-bold text-lg">R</span>
          </div>
          <span
            className={cn(
              'font-bold text-xl text-sidebar-foreground',
              !isMobile && 'hidden lg:block',
            )}
          >
            Replay
          </span>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {navOrder.map((id) => {
          const item = NAV_CONFIG[id]
          const prefs = navPreferences[id]
          const LinkIcon = item.icon

          // Visibility Check
          if (!prefs.visible) return null
          if (isMobile && !prefs.mobileVisible) return null

          return (
            <TooltipProvider key={item.path}>
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors group relative',
                        isActive
                          ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm'
                          : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                      )
                    }
                    onClick={() => onCloseMobile?.()}
                  >
                    <LinkIcon className="h-5 w-5 shrink-0" strokeWidth={1.5} />
                    <span
                      className={cn(
                        'font-medium whitespace-nowrap leading-none',
                        !isMobile && 'hidden lg:block',
                      )}
                    >
                      {item.label}
                    </span>
                    {!isMobile && (
                      <span className="lg:hidden sr-only">{item.label}</span>
                    )}
                  </NavLink>
                </TooltipTrigger>
                {!isMobile && (
                  <TooltipContent side="right" className="lg:hidden">
                    {item.label}
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          )
        })}

        <TooltipProvider>
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  'w-full justify-start mt-4 px-4 py-3 h-auto',
                  !isMobile && 'justify-center lg:justify-start',
                )}
                onClick={() => setIsSettingsOpen(true)}
              >
                <Settings className="h-5 w-5 shrink-0" strokeWidth={1.5} />
                <span
                  className={cn(
                    'font-medium whitespace-nowrap ml-3 leading-none',
                    !isMobile && 'hidden lg:block',
                  )}
                >
                  Personalizar Menu
                </span>
                {!isMobile && (
                  <span className="lg:hidden sr-only">Personalizar</span>
                )}
              </Button>
            </TooltipTrigger>
            {!isMobile && (
              <TooltipContent side="right" className="lg:hidden">
                Personalizar
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </nav>

      <div className="p-4 border-t border-sidebar-border mt-auto">
        <div className="flex items-center gap-3 mb-4 px-2">
          <Avatar className="h-9 w-9 border border-sidebar-border">
            <AvatarImage src={user?.avatar} />
            <AvatarFallback>{user?.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div
            className={cn(
              'overflow-hidden',
              !isMobile ? 'hidden lg:block' : 'block',
            )}
          >
            <p className="text-sm font-medium truncate text-sidebar-foreground">
              {user?.name}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.email}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          className={cn(
            'w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 px-2',
            !isMobile && 'justify-center lg:justify-start',
          )}
          onClick={logout}
        >
          <LogOut className="h-5 w-5 lg:mr-2 shrink-0" strokeWidth={1.5} />
          <span className={cn(!isMobile && 'hidden lg:block')}>Sair</span>
        </Button>
      </div>

      <MenuCustomizationDialog
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
      />
    </div>
  )
}

export function Sidebar() {
  return (
    <aside className="hidden sm:flex flex-col w-20 lg:w-64 fixed inset-y-0 left-0 z-50 transition-all duration-300 bg-sidebar border-r border-sidebar-border">
      <SidebarContent />
    </aside>
  )
}
