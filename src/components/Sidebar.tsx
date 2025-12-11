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
    <div className="flex flex-col h-full bg-sidebar border-r border-sidebar-border shadow-[1px_0_20px_0_rgba(0,0,0,0.02)]">
      {/* Header / Brand */}
      <div className="p-6 flex items-center h-20 mb-2">
        <div className="flex items-center gap-3 w-full">
          <div className="h-10 w-10 bg-gradient-to-br from-sidebar-primary to-orange-400 rounded-xl shadow-lg shadow-orange-500/20 flex items-center justify-center shrink-0 transition-transform hover:scale-105">
            <span className="text-sidebar-primary-foreground font-bold text-xl">
              R
            </span>
          </div>
          <div
            className={cn(
              'flex flex-col',
              !isMobile &&
                'hidden lg:flex opacity-0 lg:opacity-100 transition-opacity duration-300',
            )}
          >
            <span className="font-bold text-lg tracking-tight text-sidebar-foreground">
              Replay
            </span>
            <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground/80">
              Suporte
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1.5 overflow-y-auto">
        {navOrder.map((id) => {
          const item = NAV_CONFIG[id]
          const prefs = navPreferences[id]
          const LinkIcon = item.icon

          // Visibility Check
          if (!prefs.visible) return null
          if (isMobile && !prefs.mobileVisible) return null

          return (
            <TooltipProvider key={item.path}>
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative',
                        isActive
                          ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                          : 'text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground',
                      )
                    }
                    onClick={() => onCloseMobile?.()}
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-sidebar-primary rounded-r-full" />
                        )}
                        <LinkIcon
                          className={cn(
                            'h-[1.15rem] w-[1.15rem] shrink-0 transition-transform duration-200 group-hover:scale-110',
                            isActive
                              ? 'text-sidebar-primary'
                              : 'text-muted-foreground group-hover:text-sidebar-foreground',
                          )}
                          strokeWidth={isActive ? 2.5 : 2}
                        />
                        <span
                          className={cn(
                            'text-sm whitespace-nowrap leading-none transition-all',
                            !isMobile && 'hidden lg:block',
                          )}
                        >
                          {item.label}
                        </span>
                        {!isMobile && (
                          <span className="lg:hidden sr-only">
                            {item.label}
                          </span>
                        )}
                      </>
                    )}
                  </NavLink>
                </TooltipTrigger>
                {!isMobile && (
                  <TooltipContent
                    side="right"
                    className="lg:hidden font-medium"
                  >
                    {item.label}
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          )
        })}
      </nav>

      {/* Footer Actions */}
      <div className="p-3 mt-auto space-y-3">
        {/* Settings Button */}
        <TooltipProvider>
          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  'w-full justify-start h-10 px-3 text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50',
                  !isMobile && 'justify-center lg:justify-start',
                )}
                onClick={() => setIsSettingsOpen(true)}
              >
                <Settings
                  className="h-[1.15rem] w-[1.15rem] shrink-0"
                  strokeWidth={2}
                />
                <span
                  className={cn('text-sm ml-3', !isMobile && 'hidden lg:block')}
                >
                  Personalizar
                </span>
              </Button>
            </TooltipTrigger>
            {!isMobile && (
              <TooltipContent side="right" className="lg:hidden">
                Personalizar
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>

        <div className="border-t border-sidebar-border my-2" />

        {/* User Profile */}
        <div
          className={cn(
            'flex items-center gap-3 p-2 rounded-lg bg-sidebar-accent/30 border border-transparent hover:border-sidebar-border transition-all',
            !isMobile && 'justify-center lg:justify-start',
          )}
        >
          <Avatar className="h-8 w-8 border border-sidebar-border shadow-sm">
            <AvatarImage src={user?.avatar} />
            <AvatarFallback className="text-xs bg-sidebar-primary text-sidebar-primary-foreground font-bold">
              {user?.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div
            className={cn(
              'overflow-hidden flex-1',
              !isMobile ? 'hidden lg:block' : 'block',
            )}
          >
            <p className="text-sm font-semibold truncate text-sidebar-foreground">
              {user?.name.split(' ')[0]}
            </p>
            <p className="text-[10px] text-muted-foreground truncate font-medium">
              {user?.role === 'admin' ? 'Administrador' : 'Agente'}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 -mr-1',
              !isMobile && 'hidden lg:flex',
            )}
            onClick={logout}
            title="Sair"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>

        {/* Mobile Logout (Separate because layout differs) */}
        <Button
          variant="ghost"
          className={cn(
            'w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 lg:hidden',
          )}
          onClick={logout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sair
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
