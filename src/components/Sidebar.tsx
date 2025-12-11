import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  FileText,
  User,
  LogOut,
  Menu,
} from 'lucide-react'
import { useAppContext } from '@/context/AppContext'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useState } from 'react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Clientes', path: '/clients', icon: Users },
  { label: 'Atendimentos', path: '/tickets', icon: FileText },
  { label: 'Perfil', path: '/profile', icon: User },
]

export function Sidebar() {
  const { user, logout } = useAppContext()
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => (
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
        {NAV_ITEMS.map((item) => {
          const LinkIcon = item.icon
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
                    onClick={() => isMobile && setIsMobileOpen(false)}
                  >
                    <LinkIcon className="h-5 w-5 shrink-0" />
                    <span
                      className={cn(
                        'font-medium whitespace-nowrap',
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
            'w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10',
            !isMobile && 'justify-center lg:justify-start',
          )}
          onClick={logout}
        >
          <LogOut className="h-5 w-5 lg:mr-2 shrink-0" />
          <span className={cn(!isMobile && 'hidden lg:block')}>Sair</span>
        </Button>
      </div>
    </div>
  )

  return (
    <>
      {/* Tablet/Desktop Sidebar - Visible on sm (640px) and up */}
      <aside className="hidden sm:flex flex-col w-20 lg:w-64 fixed inset-y-0 left-0 z-50 transition-all duration-300 bg-sidebar border-r border-sidebar-border">
        <SidebarContent />
      </aside>

      {/* Mobile Header & Drawer - Visible only on mobile (< 640px) */}
      <div className="sm:hidden fixed top-0 left-0 right-0 h-16 bg-background border-b z-50 flex items-center px-4 justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-primary rounded flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">R</span>
          </div>
          <span className="font-bold text-xl">Replay</span>
        </div>
        <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="-mr-2">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-80 border-r-0">
            <SheetHeader className="sr-only">
              <SheetTitle>Menu de Navegação</SheetTitle>
            </SheetHeader>
            <div className="h-full">
              <SidebarContent isMobile={true} />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}
